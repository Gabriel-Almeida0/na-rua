import { describe, expect, it } from "vitest";
import { centavos } from "./centavos.js";
import {
  type ContasDaLoja,
  type Lancamento,
  PartidaDobradaError,
  anotarFiado,
  calcularSaldo,
  calcularTotalNaRua,
  estornar,
  receberPagamento,
  validarPartidaDobrada,
} from "./ledger.js";

const contas: ContasDaLoja = {
  receivableDoCliente: "conta-maria",
  cash: "conta-caixa",
  revenue: "conta-receita",
  adjustment: "conta-ajuste",
};

const ids = (n: string) => ({
  transacaoId: `tx-${n}`,
  lancamentoDebitoId: `ld-${n}`,
  lancamentoCreditoId: `lc-${n}`,
});

const HOJE = "2026-09-06";

function lancamentosDe(...txs: Array<{ lancamentos: readonly Lancamento[] }>) {
  return txs.flatMap((t) => [...t.lancamentos]);
}

describe("I1 · toda transação equilibra", () => {
  it("fiado gera partida dobrada válida", () => {
    const tx = anotarFiado({ ids: ids("1"), contas, valor: centavos(4750), ocorridoEm: HOJE });
    expect(() => validarPartidaDobrada(tx)).not.toThrow();
    expect(tx.lancamentos).toHaveLength(2);
  });

  it("transação desequilibrada é rejeitada", () => {
    const tx = {
      id: "tx-ruim",
      tipo: "fiado" as const,
      ocorridoEm: HOJE,
      lancamentos: [
        { id: "a", transacaoId: "tx-ruim", contaId: "x", direcao: "debito" as const, valorCentavos: centavos(100) },
        { id: "b", transacaoId: "tx-ruim", contaId: "y", direcao: "credito" as const, valorCentavos: centavos(90) },
      ],
    };
    expect(() => validarPartidaDobrada(tx)).toThrow(PartidaDobradaError);
  });
});

describe("I2 · valor sempre positivo; a direção carrega o sinal", () => {
  it("rejeita valor negativo no lançamento", () => {
    const tx = {
      id: "tx-neg",
      tipo: "fiado" as const,
      ocorridoEm: HOJE,
      lancamentos: [
        { id: "a", transacaoId: "tx-neg", contaId: "x", direcao: "debito" as const, valorCentavos: centavos(-100) },
        { id: "b", transacaoId: "tx-neg", contaId: "y", direcao: "credito" as const, valorCentavos: centavos(-100) },
      ],
    };
    expect(() => validarPartidaDobrada(tx)).toThrow(/positivo/);
  });
});

describe("I4 · saldo é derivado dos lançamentos", () => {
  it("a conta da Dona Maria acompanha fiados e pagamentos", () => {
    const f1 = anotarFiado({ ids: ids("1"), contas, valor: centavos(4750), ocorridoEm: HOJE });
    const f2 = anotarFiado({ ids: ids("2"), contas, valor: centavos(1850), ocorridoEm: HOJE });
    const p1 = receberPagamento({ ids: ids("3"), contas, valor: centavos(2000), ocorridoEm: HOJE });

    const todos = lancamentosDe(f1, f2, p1);
    expect(calcularSaldo(todos, contas.receivableDoCliente)).toBe(4750 + 1850 - 2000);
  });

  it("conta sem lançamento tem saldo zero", () => {
    expect(calcularSaldo([], "qualquer")).toBe(0);
  });

  it("o caixa reflete o que entrou", () => {
    const p = receberPagamento({ ids: ids("p"), contas, valor: centavos(10000), ocorridoEm: HOJE });
    expect(calcularSaldo([...p.lancamentos], contas.cash)).toBe(10000);
  });
});

describe("regra 1.8 · pagar a mais vira crédito, não erro", () => {
  it("saldo negativo é estado válido", () => {
    const f = anotarFiado({ ids: ids("1"), contas, valor: centavos(5000), ocorridoEm: HOJE });
    const p = receberPagamento({ ids: ids("2"), contas, valor: centavos(7000), ocorridoEm: HOJE });
    expect(calcularSaldo(lancamentosDe(f, p), contas.receivableDoCliente)).toBe(-2000);
  });
});

describe("ADR-0004 · estorno é contra-lançamento, nada é deletado", () => {
  it("estorno zera o efeito e preserva o original", () => {
    const f = anotarFiado({ ids: ids("1"), contas, valor: centavos(5000), ocorridoEm: HOJE });
    const e = estornar({
      original: f,
      transacaoId: "tx-estorno",
      lancamentoIds: ["le-1", "le-2"],
      ocorridoEm: HOJE,
    });

    expect(e.estornaId).toBe(f.id);
    expect(() => validarPartidaDobrada(e)).not.toThrow();
    // O original continua no ledger — os dois coexistem.
    const todos = lancamentosDe(f, e);
    expect(todos).toHaveLength(4);
    expect(calcularSaldo(todos, contas.receivableDoCliente)).toBe(0);
  });

  it("reversal completo: 50 - 50 + 45, e não 50 - 5", () => {
    const errado = anotarFiado({ ids: ids("1"), contas, valor: centavos(5000), ocorridoEm: HOJE });
    const estorno = estornar({
      original: errado,
      transacaoId: "tx-e",
      lancamentoIds: ["le-1", "le-2"],
      ocorridoEm: HOJE,
    });
    const certo = anotarFiado({ ids: ids("2"), contas, valor: centavos(4500), ocorridoEm: HOJE });

    const todos = lancamentosDe(errado, estorno, certo);
    expect(calcularSaldo(todos, contas.receivableDoCliente)).toBe(4500);
    // Três transações visíveis no extrato, não uma linha adulterada.
    expect(new Set(todos.map((l) => l.transacaoId)).size).toBe(3);
  });

  it("exige um id novo por lançamento do original", () => {
    const f = anotarFiado({ ids: ids("1"), contas, valor: centavos(100), ocorridoEm: HOJE });
    expect(() =>
      estornar({ original: f, transacaoId: "tx-e", lancamentoIds: ["so-um"], ocorridoEm: HOJE }),
    ).toThrow(/precisa de 2 ids/);
  });
});

describe("ADR-0002 · dois balconistas offline somam, não conflitam", () => {
  it("a ordem de chegada não muda o saldo (merge é união de conjuntos)", () => {
    // Balconista A, offline: +50. Balconista B, offline: +40. Saldo inicial 100.
    const inicial = anotarFiado({ ids: ids("0"), contas, valor: centavos(10000), ocorridoEm: HOJE });
    const a = anotarFiado({ ids: ids("a"), contas, valor: centavos(5000), ocorridoEm: HOJE });
    const b = anotarFiado({ ids: ids("b"), contas, valor: centavos(4000), ocorridoEm: HOJE });

    const ordem1 = calcularSaldo(lancamentosDe(inicial, a, b), contas.receivableDoCliente);
    const ordem2 = calcularSaldo(lancamentosDe(inicial, b, a), contas.receivableDoCliente);

    // Com LWW num campo `saldo`, daria 15000 OU 14000 — uma compra evaporaria.
    expect(ordem1).toBe(19000);
    expect(ordem2).toBe(19000);
    expect(ordem1).toBe(ordem2);
  });

  it("aplicar o mesmo evento duas vezes é idempotente por id", () => {
    const f = anotarFiado({ ids: ids("1"), contas, valor: centavos(4750), ocorridoEm: HOJE });
    // Reenvio: o mesmo lançamento chega de novo. A deduplicação por id é do
    // servidor (ON CONFLICT DO NOTHING), mas o domínio precisa se comportar
    // como conjunto quando ela é aplicada.
    const comDuplicata = [...f.lancamentos, ...f.lancamentos];
    const deduplicado = [...new Map(comDuplicata.map((l) => [l.id, l])).values()];
    expect(calcularSaldo(deduplicado, contas.receivableDoCliente)).toBe(4750);
  });
});

describe("tá na rua", () => {
  it("soma só os saldos positivos", () => {
    const maria = { ...contas, receivableDoCliente: "c-maria" };
    const joao = { ...contas, receivableDoCliente: "c-joao" };

    const f1 = anotarFiado({ ids: ids("1"), contas: maria, valor: centavos(24000), ocorridoEm: HOJE });
    const f2 = anotarFiado({ ids: ids("2"), contas: joao, valor: centavos(8500), ocorridoEm: HOJE });
    // João pagou a mais e ficou com crédito de R$ 15,00.
    const p = receberPagamento({ ids: ids("3"), contas: joao, valor: centavos(10000), ocorridoEm: HOJE });

    const todos = lancamentosDe(f1, f2, p);
    // Crédito do João NÃO abate o que a Maria deve.
    expect(calcularTotalNaRua(todos, ["c-maria", "c-joao"])).toBe(24000);
  });
});
