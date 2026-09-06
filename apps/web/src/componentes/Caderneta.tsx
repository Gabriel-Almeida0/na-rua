"use client";

import { formatar, type Centavos } from "@na-rua/dominio";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { ulid } from "ulid";
import { api, type Loja } from "../lib/api.ts";
import { db, pedirPersistencia, type ClienteLocal } from "../lib/db.ts";
import {
  desfazer,
  enfileirar,
  hojeIso,
  ligarSincronizacaoAutomatica,
} from "../lib/sync.ts";
import {
  BarraDesfazer,
  BotaoPrimario,
  BotaoSecundario,
  NumeroHeroi,
  PilulaConexao,
  Status,
} from "./base.tsx";
import { TecladoValor } from "./TecladoValor.tsx";

/**
 * A tela inicial.
 *
 * É client component porque a fonte de verdade da INTERFACE é o IndexedDB, que
 * só existe no navegador. É a exceção consciente à ADR-0016: o shell continua
 * vindo do servidor e aparece na hora, mas a lista precisa ler local para o app
 * funcionar sem rede e abrir instantâneo.
 */

type Tela =
  | { nome: "lista" }
  | { nome: "escolherCliente"; acao: "fiado" | "pagamento" }
  | { nome: "clienteNovo" }
  | { nome: "valor"; acao: "fiado" | "pagamento"; cliente: ClienteLocal };

function diasDeAtraso(cliente: ClienteLocal): number | null {
  if (cliente.saldoCentavos <= 0 || !cliente.diaVencimento) return null;
  const hoje = new Date();
  const venc = new Date(hoje.getFullYear(), hoje.getMonth(), cliente.diaVencimento);
  if (venc > hoje) venc.setMonth(venc.getMonth() - 1);
  const dias = Math.floor((hoje.getTime() - venc.getTime()) / 86_400_000);
  return dias > 0 ? dias : null;
}

export function Caderneta({ loja, aoSair }: { loja: Loja; aoSair: () => void }) {
  const [tela, setTela] = useState<Tela>({ nome: "lista" });
  const [filtro, setFiltro] = useState<"todos" | "atrasados">("todos");
  const [online, setOnline] = useState(true);
  const [desfazerInfo, setDesfazerInfo] = useState<
    { eventoId: string; mensagem: string } | null
  >(null);
  const [busca, setBusca] = useState("");
  const [nomeNovo, setNomeNovo] = useState("");

  const clientes = useLiveQuery(
    () => db.clientes.where("lojaId").equals(loja.id).toArray(),
    [loja.id],
    [] as ClienteLocal[],
  );
  const pendentes = useLiveQuery(
    () => db.outbox.where("lojaId").equals(loja.id).count(),
    [loja.id],
    0,
  );

  useEffect(() => {
    setOnline(navigator.onLine);
    const mudou = () => setOnline(navigator.onLine);
    window.addEventListener("online", mudou);
    window.addEventListener("offline", mudou);
    const parar = ligarSincronizacaoAutomatica(loja.id);
    return () => {
      window.removeEventListener("online", mudou);
      window.removeEventListener("offline", mudou);
      parar();
    };
  }, [loja.id]);

  const ordenados = useMemo(() => {
    const lista = [...clientes];
    lista.sort((a, b) => {
      const atrasoA = diasDeAtraso(a) ?? -1;
      const atrasoB = diasDeAtraso(b) ?? -1;
      if (atrasoA !== atrasoB) return atrasoB - atrasoA;
      return b.saldoCentavos - a.saldoCentavos;
    });
    return filtro === "atrasados"
      ? lista.filter((c) => (diasDeAtraso(c) ?? 0) > 0)
      : lista;
  }, [clientes, filtro]);

  const totalNaRua = clientes.reduce(
    (s, c) => s + (c.saldoCentavos > 0 ? c.saldoCentavos : 0),
    0,
  );
  const devendo = clientes.filter((c) => c.saldoCentavos > 0).length;
  const atrasados = clientes.filter((c) => (diasDeAtraso(c) ?? 0) > 0).length;

  const paraEscolher = busca.trim()
    ? clientes.filter((c) =>
        c.nome.toLowerCase().includes(busca.trim().toLowerCase()),
      )
    : [...clientes].sort((a, b) =>
        (b.ultimoLancamentoEm ?? "").localeCompare(a.ultimoLancamentoEm ?? ""),
      );

  async function anotar(cliente: ClienteLocal, acao: "fiado" | "pagamento", centavos: number) {
    const eventoId = await enfileirar({
      lojaId: loja.id,
      clienteId: cliente.id,
      tipo: acao,
      valorCentavos: centavos,
    });
    void pedirPersistencia();
    const novoSaldo =
      cliente.saldoCentavos + (acao === "fiado" ? centavos : -centavos);
    setTela({ nome: "lista" });
    setBusca("");
    setDesfazerInfo({
      eventoId,
      mensagem:
        acao === "fiado"
          ? `Anotado! ${cliente.nome} agora deve ${formatar(novoSaldo as Centavos)}`
          : novoSaldo <= 0
            ? `Conta de ${cliente.nome} quitada! 🎉`
            : `Recebido. Ainda falta ${formatar(novoSaldo as Centavos)}`,
    });
    window.setTimeout(() => setDesfazerInfo(null), 8000);
  }

  async function criarCliente() {
    const nome = nomeNovo.trim();
    if (!nome) return;
    const id = ulid();
    await db.clientes.put({
      id,
      lojaId: loja.id,
      nome,
      telefone: null,
      saldoCentavos: 0,
      diaVencimento: null,
      ultimoLancamentoEm: null,
    });
    // Se estiver offline, o cliente existe local e sobe no próximo sync junto
    // com o primeiro lançamento dele.
    try {
      await api.criarCliente(loja.id, { id, nome });
    } catch {
      /* fica local; a caderneta reconcilia depois */
    }
    setNomeNovo("");
    const cliente = await db.clientes.get(id);
    if (cliente) setTela({ nome: "valor", acao: "fiado", cliente });
  }

  // ---- telas ----

  if (tela.nome === "valor") {
    const c = tela.cliente;
    return (
      <TecladoValor
        titulo={c.nome}
        subtitulo={
          tela.acao === "fiado"
            ? c.saldoCentavos > 0
              ? `deve ${formatar(c.saldoCentavos as Centavos)}`
              : "sem conta aberta"
            : `deve ${formatar(c.saldoCentavos as Centavos)}`
        }
        rotuloAcao={tela.acao === "fiado" ? "✓ ANOTAR" : "✓ DAR BAIXA"}
        tom={tela.acao === "fiado" ? "fiado" : "receber"}
        valorInicial={
          tela.acao === "pagamento" && c.saldoCentavos > 0
            ? String(c.saldoCentavos)
            : ""
        }
        {...(tela.acao === "pagamento" && c.saldoCentavos > 0
          ? {
              atalhos: [
                { rotulo: "Pagou tudo", centavos: c.saldoCentavos },
                { rotulo: "Pagou metade", centavos: Math.floor(c.saldoCentavos / 2) },
              ],
            }
          : {})}
        aoConfirmar={(centavos) => void anotar(c, tela.acao, centavos)}
        aoCancelar={() => setTela({ nome: "lista" })}
      />
    );
  }

  if (tela.nome === "clienteNovo") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
        <button
          onClick={() => setTela({ nome: "escolherCliente", acao: "fiado" })}
          className="mb-4 w-fit text-2xl"
          aria-label="Voltar"
        >
          ←
        </button>
        <h1 className="text-2xl font-extrabold">Quem é o freguês?</h1>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-semibold">Nome</span>
          <input
            className="h-14 w-full rounded-xl border-2 border-borda bg-fundo px-4
              text-base outline-none focus:border-marca"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="Maria da Padaria"
            autoFocus
            autoCapitalize="words"
          />
          <span className="mt-1.5 block text-xs text-tinta-fraca">
            Pode ser o apelido. É o único campo obrigatório.
          </span>
        </label>
        <div className="mt-auto pt-6">
          <BotaoPrimario
            tom="fiado"
            disabled={!nomeNovo.trim()}
            onClick={() => void criarCliente()}
          >
            Pronto, anotar fiado
          </BotaoPrimario>
        </div>
      </main>
    );
  }

  if (tela.nome === "escolherCliente") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTela({ nome: "lista" })}
            className="text-2xl"
            aria-label="Voltar"
          >
            ←
          </button>
          <input
            className="h-12 flex-1 rounded-xl border-2 border-borda bg-fundo px-4
              text-base outline-none focus:border-marca"
            placeholder="Buscar freguês…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          {paraEscolher.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setTela({ nome: "valor", acao: tela.acao, cliente: c })}
                className="flex h-16 w-full items-center justify-between rounded-xl
                  bg-fundo px-4 text-left shadow-sm active:bg-borda"
              >
                <span className="font-semibold">{c.nome}</span>
                {c.saldoCentavos !== 0 ? (
                  <span className="text-sm font-bold text-tinta-fraca tabular-nums">
                    {formatar(c.saldoCentavos as Centavos)}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {tela.acao === "fiado" ? (
          <div className="mt-4">
            <BotaoSecundario onClick={() => setTela({ nome: "clienteNovo" })}>
              + Freguês novo
            </BotaoSecundario>
          </div>
        ) : null}

        {paraEscolher.length === 0 && busca.trim() ? (
          <p className="mt-6 text-center text-sm text-tinta-fraca">
            Não achei ninguém com esse nome.
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 pb-40 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{loja.nome}</h1>
        <button
          onClick={aoSair}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-tinta-fraca"
        >
          Sair
        </button>
      </header>

      <div className="mt-3">
        <PilulaConexao online={online} pendentes={pendentes} />
      </div>

      <section className="mt-5">
        <NumeroHeroi
          rotulo="Na rua"
          valor={totalNaRua}
          contexto={
            devendo === 0
              ? "Ninguém te deve nada agora. 🎉"
              : `${devendo} ${devendo === 1 ? "pessoa" : "pessoas"}` +
                (atrasados > 0
                  ? ` · ${atrasados} ${atrasados === 1 ? "atrasada" : "atrasadas"}`
                  : "")
          }
        />
      </section>

      <div className="mt-5 flex gap-2">
        {(["todos", "atrasados"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`h-11 rounded-full px-4 text-sm font-bold ${
              filtro === f
                ? "bg-tinta text-white"
                : "bg-fundo text-tinta-fraca ring-1 ring-borda"
            }`}
          >
            {f === "todos" ? "Todos" : `Atrasados ${atrasados > 0 ? atrasados : ""}`}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {ordenados.map((c) => (
          <li key={c.id}>
            <button
              onClick={() =>
                setTela({
                  nome: "valor",
                  acao: c.saldoCentavos > 0 ? "pagamento" : "fiado",
                  cliente: c,
                })
              }
              className="w-full rounded-xl bg-fundo px-4 py-3 text-left shadow-sm active:bg-borda"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{c.nome}</span>
                <span className="text-xl font-bold tabular-nums">
                  {formatar(c.saldoCentavos as Centavos)}
                </span>
              </div>
              <div className="mt-0.5">
                <Status diasAtraso={diasDeAtraso(c)} diaVencimento={c.diaVencimento} />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {ordenados.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-base font-semibold">
            {filtro === "atrasados"
              ? "Nenhum atrasado. Seu povo tá pagando direitinho."
              : "Aqui vai ficar a lista de quem te deve."}
          </p>
          {filtro === "todos" ? (
            <p className="mt-1 text-sm text-tinta-fraca">
              Anote o primeiro fiado e pronto — o caderno pode descansar.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Ações primárias na metade inferior, dentro da safe-area. */}
      <div
        className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-5 pt-3"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <BotaoPrimario
              tom="fiado"
              onClick={() => setTela({ nome: "escolherCliente", acao: "fiado" })}
            >
              ➕ ANOTAR FIADO
            </BotaoPrimario>
          </div>
          <div className="w-[38%]">
            <BotaoPrimario
              tom="receber"
              onClick={() => setTela({ nome: "escolherCliente", acao: "pagamento" })}
            >
              💰 RECEBI
            </BotaoPrimario>
          </div>
        </div>
      </div>

      {desfazerInfo ? (
        <BarraDesfazer
          mensagem={desfazerInfo.mensagem}
          aoDesfazer={() => void desfazer(desfazerInfo.eventoId)}
          aoFechar={() => setDesfazerInfo(null)}
        />
      ) : null}
    </main>
  );
}
