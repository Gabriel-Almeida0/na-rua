"use client";

import { ulid } from "ulid";
import { api, ErroDaApi } from "./api.ts";
import { db, gravarMeta, type EventoPendente, type TipoEvento } from "./db.ts";

/**
 * O motor de sincronização.
 *
 * Não depende de Background Sync: a API tem 78% de suporte global e ZERO no
 * iOS. O flush é disparado pelo ciclo de vida do app — abertura, evento
 * `online`, volta do `visibilitychange` e retry. Ver ADR-0014 e a seção de
 * sincronização em docs/04-arquitetura/04-sincronizacao-offline.md.
 */

function deviceId(): string {
  const CHAVE = "na-rua:device";
  try {
    let id = localStorage.getItem(CHAVE);
    if (!id) {
      id = ulid();
      localStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    return "desconhecido";
  }
}

export function hojeIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Enfileira um evento e atualiza o saldo local na mesma transação do Dexie.
 *
 * A tela reflete a mudança imediatamente, com ou sem rede. É o que faz o fluxo
 * caber em menos de 8 segundos — não existe espera de servidor no caminho.
 */
export async function enfileirar(params: {
  lojaId: string;
  clienteId: string;
  tipo: TipoEvento;
  valorCentavos: number;
  ocorridoEm?: string;
  descricao?: string;
}): Promise<string> {
  const evento: EventoPendente = {
    // ULID gerado AQUI, antes de qualquer rede. Reenvio, retry e toque duplo
    // colapsam todos neste id.
    id: ulid(),
    lojaId: params.lojaId,
    tipo: params.tipo,
    clienteId: params.clienteId,
    valorCentavos: params.valorCentavos,
    ocorridoEm: params.ocorridoEm ?? hojeIso(),
    ...(params.descricao ? { descricao: params.descricao } : {}),
    entradaDebitoId: ulid(),
    entradaCreditoId: ulid(),
    criadoEm: Date.now(),
    tentativas: 0,
  };

  await db.transaction("rw", db.outbox, db.clientes, async () => {
    await db.outbox.add(evento);
    const cliente = await db.clientes.get(params.clienteId);
    if (cliente) {
      const delta =
        params.tipo === "fiado" ? params.valorCentavos : -params.valorCentavos;
      await db.clientes.update(params.clienteId, {
        saldoCentavos: cliente.saldoCentavos + delta,
        ultimoLancamentoEm: evento.ocorridoEm,
      });
    }
  });

  void sincronizar(params.lojaId);
  return evento.id;
}

/** Desfazer: só vale enquanto o evento ainda não subiu. */
export async function desfazer(eventoId: string): Promise<boolean> {
  return db.transaction("rw", db.outbox, db.clientes, async () => {
    const pendente = await db.outbox.where("id").equals(eventoId).first();
    if (!pendente) return false;

    await db.outbox.where("id").equals(eventoId).delete();
    const cliente = await db.clientes.get(pendente.clienteId);
    if (cliente) {
      const delta =
        pendente.tipo === "fiado" ? -pendente.valorCentavos : pendente.valorCentavos;
      await db.clientes.update(pendente.clienteId, {
        saldoCentavos: cliente.saldoCentavos + delta,
      });
    }
    return true;
  });
}

let sincronizando = false;

/**
 * Sobe o outbox e traz a caderneta do servidor.
 *
 * O servidor é a autoridade: depois de subir a fila, o saldo local é
 * substituído pelo que o Postgres calculou. Se dois aparelhos lançaram offline,
 * os dois lançamentos entram e somam — não há conflito a resolver.
 */
export async function sincronizar(lojaId: string): Promise<{
  subiu: number;
  ok: boolean;
  motivo?: string;
}> {
  if (sincronizando) return { subiu: 0, ok: true };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { subiu: 0, ok: false, motivo: "offline" };
  }

  sincronizando = true;
  try {
    const pendentes = await db.outbox
      .where("lojaId")
      .equals(lojaId)
      .sortBy("criadoEm");

    let subiu = 0;

    if (pendentes.length > 0) {
      // Lote pequeno: em 4G ruim, lote grande é lote que nunca completa.
      const lote = pendentes.slice(0, 50);
      const eventos = lote.map((e) => ({
        tipo: e.tipo,
        id: e.id,
        clienteId: e.clienteId,
        valorCentavos: e.valorCentavos,
        ocorridoEm: e.ocorridoEm,
        ...(e.descricao ? { descricao: e.descricao } : {}),
        entradaDebitoId: e.entradaDebitoId,
        entradaCreditoId: e.entradaCreditoId,
      }));

      const r = await api.sincronizar(lojaId, eventos, deviceId());

      // Aplicado ou já existente, os dois significam "está no servidor" —
      // a fila pode limpar com segurança nos dois casos.
      const confirmados = new Set([...r.aplicados, ...r.jaExistiam]);
      const seqs = lote
        .filter((e) => confirmados.has(e.id))
        .map((e) => e.seq)
        .filter((s): s is number => s !== undefined);
      await db.outbox.bulkDelete(seqs);
      subiu = seqs.length;
    }

    const caderneta = await api.caderneta(lojaId);
    await db.transaction("rw", db.clientes, async () => {
      await db.clientes.where("lojaId").equals(lojaId).delete();
      await db.clientes.bulkPut(
        caderneta.clientes.map((c) => ({ ...c, lojaId })),
      );
    });
    await gravarMeta(`sync:${lojaId}`, Date.now());

    return { subiu, ok: true };
  } catch (e) {
    if (e instanceof ErroDaApi && e.status >= 400 && e.status < 500) {
      // 4xx não melhora com retry. Marca para o lojista ver, não fica em loop.
      const pendentes = await db.outbox.where("lojaId").equals(lojaId).toArray();
      for (const p of pendentes) {
        if (p.seq !== undefined) {
          await db.outbox.update(p.seq, {
            tentativas: p.tentativas + 1,
            ultimoErro: e.message,
          });
        }
      }
    }
    return {
      subiu: 0,
      ok: false,
      motivo: e instanceof Error ? e.message : "erro",
    };
  } finally {
    sincronizando = false;
  }
}

/** Liga os gatilhos de flush. Chamado uma vez, no provedor da loja. */
export function ligarSincronizacaoAutomatica(lojaId: string): () => void {
  const disparar = () => void sincronizar(lojaId);

  const aoVoltarPraTela = () => {
    if (document.visibilityState === "visible") disparar();
  };

  window.addEventListener("online", disparar);
  document.addEventListener("visibilitychange", aoVoltarPraTela);
  // Rede pode voltar sem o evento `online` disparar (troca de Wi-Fi para 4G,
  // por exemplo). Uma batida periódica cobre esse caso.
  const intervalo = window.setInterval(disparar, 60_000);

  disparar();

  return () => {
    window.removeEventListener("online", disparar);
    document.removeEventListener("visibilitychange", aoVoltarPraTela);
    window.clearInterval(intervalo);
  };
}
