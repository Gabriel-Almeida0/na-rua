/**
 * O ledger: partidas dobradas, append-only, saldo derivado. Ver ADR-0001.
 *
 * Este módulo é puro de propósito — sem I/O, sem banco, sem framework. É a
 * mesma função que roda no PWA (para mostrar o saldo na hora, offline) e no
 * Fastify (como autoridade). Se as duas divergirem, o dinheiro está errado.
 */

import { type Centavos, ZERO, centavos, ehPositivo } from "./centavos.js";

export type Direcao = "debito" | "credito";

/** Natureza contábil da conta. Ver docs/04-arquitetura/03-ledger-e-integridade.md */
export type TipoConta = "receivable" | "cash" | "revenue" | "adjustment";

export type TipoTransacao = "fiado" | "pagamento" | "estorno" | "ajuste";

export interface Lancamento {
  readonly id: string;
  readonly transacaoId: string;
  readonly contaId: string;
  readonly direcao: Direcao;
  /** Sempre estritamente positivo. A direção carrega o sinal. Regra 1.2. */
  readonly valorCentavos: Centavos;
}

export interface Transacao {
  readonly id: string;
  readonly tipo: TipoTransacao;
  readonly ocorridoEm: string; // ISO date (YYYY-MM-DD)
  readonly lancamentos: readonly Lancamento[];
  readonly estornaId?: string;
}

export class PartidaDobradaError extends Error {
  readonly transacaoId: string;
  readonly debitos: number;
  readonly creditos: number;

  constructor(transacaoId: string, debitos: number, creditos: number) {
    super(
      `Partida dobrada violada na transação ${transacaoId}: ` +
        `débitos=${debitos} créditos=${creditos}`,
    );
    this.name = "PartidaDobradaError";
    this.transacaoId = transacaoId;
    this.debitos = debitos;
    this.creditos = creditos;
  }
}

export class LancamentoInvalidoError extends Error {
  constructor(motivo: string) {
    super(`Lançamento inválido: ${motivo}`);
    this.name = "LancamentoInvalidoError";
  }
}

function somaPorDirecao(
  lancamentos: readonly Lancamento[],
  direcao: Direcao,
): number {
  return lancamentos
    .filter((l) => l.direcao === direcao)
    .reduce((acc, l) => acc + l.valorCentavos, 0);
}

/**
 * A invariante I1: para toda transação, soma de débitos = soma de créditos.
 * Quando quebra, o sistema criou ou destruiu dinheiro.
 */
export function validarPartidaDobrada(tx: Transacao): void {
  if (tx.lancamentos.length < 2) {
    throw new LancamentoInvalidoError(
      `transação ${tx.id} precisa de ao menos dois lançamentos`,
    );
  }
  for (const l of tx.lancamentos) {
    if (!ehPositivo(l.valorCentavos)) {
      throw new LancamentoInvalidoError(
        `valor deve ser positivo (lançamento ${l.id}); a direção carrega o sinal`,
      );
    }
  }
  const d = somaPorDirecao(tx.lancamentos, "debito");
  const c = somaPorDirecao(tx.lancamentos, "credito");
  if (d !== c) throw new PartidaDobradaError(tx.id, d, c);
}

/**
 * Saldo de uma conta: soma dos débitos menos soma dos créditos.
 *
 * Positivo numa conta `receivable` significa que o freguês deve.
 * Negativo significa crédito a favor dele — o que é estado válido, não erro
 * (regra 1.8): acontece quando ele paga mais do que devia.
 */
export function calcularSaldo(
  lancamentos: readonly Lancamento[],
  contaId: string,
): Centavos {
  const daConta = lancamentos.filter((l) => l.contaId === contaId);
  if (daConta.length === 0) return ZERO;
  return centavos(
    somaPorDirecao(daConta, "debito") - somaPorDirecao(daConta, "credito"),
  );
}

/**
 * "Tá na rua": o total que a loja tem a receber.
 *
 * Soma apenas os saldos POSITIVOS. Crédito a favor de um freguês não abate o
 * que os outros devem — quem tem R$ 20 de crédito não reduz a exposição da
 * loja, ele só vai levar R$ 20 sem pagar na próxima.
 */
export function calcularTotalNaRua(
  lancamentos: readonly Lancamento[],
  contasReceivable: readonly string[],
): Centavos {
  let total = 0;
  for (const contaId of contasReceivable) {
    const saldo = calcularSaldo(lancamentos, contaId);
    if (saldo > 0) total += saldo;
  }
  return centavos(total);
}

// ---------------------------------------------------------------------------
// Construtores de transação
//
// O ID vem SEMPRE de fora (gerado no cliente, antes de tocar a rede). É o que
// torna o reenvio idempotente e a sincronização uma união de conjuntos.
// Ver ADR-0002.
// ---------------------------------------------------------------------------

export interface ContasDaLoja {
  readonly receivableDoCliente: string;
  readonly cash: string;
  readonly revenue: string;
  readonly adjustment: string;
}

export interface IdsDoLancamento {
  readonly transacaoId: string;
  readonly lancamentoDebitoId: string;
  readonly lancamentoCreditoId: string;
}

/** Fiado: o freguês leva e passa a dever. Débito no que ele deve, crédito em receita. */
export function anotarFiado(params: {
  ids: IdsDoLancamento;
  contas: ContasDaLoja;
  valor: Centavos;
  ocorridoEm: string;
}): Transacao {
  const { ids, contas, valor, ocorridoEm } = params;
  const tx: Transacao = {
    id: ids.transacaoId,
    tipo: "fiado",
    ocorridoEm,
    lancamentos: [
      {
        id: ids.lancamentoDebitoId,
        transacaoId: ids.transacaoId,
        contaId: contas.receivableDoCliente,
        direcao: "debito",
        valorCentavos: valor,
      },
      {
        id: ids.lancamentoCreditoId,
        transacaoId: ids.transacaoId,
        contaId: contas.revenue,
        direcao: "credito",
        valorCentavos: valor,
      },
    ],
  };
  validarPartidaDobrada(tx);
  return tx;
}

/** Pagamento: entra dinheiro no caixa, o freguês passa a dever menos. */
export function receberPagamento(params: {
  ids: IdsDoLancamento;
  contas: ContasDaLoja;
  valor: Centavos;
  ocorridoEm: string;
}): Transacao {
  const { ids, contas, valor, ocorridoEm } = params;
  const tx: Transacao = {
    id: ids.transacaoId,
    tipo: "pagamento",
    ocorridoEm,
    lancamentos: [
      {
        id: ids.lancamentoDebitoId,
        transacaoId: ids.transacaoId,
        contaId: contas.cash,
        direcao: "debito",
        valorCentavos: valor,
      },
      {
        id: ids.lancamentoCreditoId,
        transacaoId: ids.transacaoId,
        contaId: contas.receivableDoCliente,
        direcao: "credito",
        valorCentavos: valor,
      },
    ],
  };
  validarPartidaDobrada(tx);
  return tx;
}

/**
 * Estorno: reversal completo, não delta. Ver ADR-0004.
 *
 * Cada lançamento original ganha um contra-lançamento na direção oposta, na
 * mesma conta. Nada é deletado — o lojista precisa conseguir explicar o
 * extrato para o freguês, incluindo o erro e a correção.
 */
export function estornar(params: {
  original: Transacao;
  transacaoId: string;
  /** Um id novo por lançamento do original, na mesma ordem. */
  lancamentoIds: readonly string[];
  ocorridoEm: string;
}): Transacao {
  const { original, transacaoId, lancamentoIds, ocorridoEm } = params;

  if (original.tipo === "estorno") {
    // Um estorno errado se corrige com outro estorno — mas o alvo tem que ser
    // a transação de correção, e quem decide isso é a camada de aplicação.
    throw new LancamentoInvalidoError(
      "para corrigir um estorno, estorne a transação de correção explicitamente",
    );
  }
  if (lancamentoIds.length !== original.lancamentos.length) {
    throw new LancamentoInvalidoError(
      `estorno precisa de ${original.lancamentos.length} ids, recebeu ${lancamentoIds.length}`,
    );
  }

  const lancamentos = original.lancamentos.map((l, i) => {
    const id = lancamentoIds[i];
    if (id === undefined) {
      throw new LancamentoInvalidoError(`id ausente na posição ${i}`);
    }
    return {
      id,
      transacaoId,
      contaId: l.contaId,
      direcao: (l.direcao === "debito" ? "credito" : "debito") as Direcao,
      valorCentavos: l.valorCentavos,
    };
  });

  const tx: Transacao = {
    id: transacaoId,
    tipo: "estorno",
    ocorridoEm,
    lancamentos,
    estornaId: original.id,
  };
  validarPartidaDobrada(tx);
  return tx;
}
