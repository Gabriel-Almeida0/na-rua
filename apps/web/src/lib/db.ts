"use client";

import Dexie, { type EntityTable } from "dexie";

/**
 * Banco local. É a fonte de verdade da INTERFACE — a tela sempre lê daqui,
 * nunca da rede. É isso que faz o app abrir instantâneo e funcionar sem sinal.
 *
 * Mas não é a fonte de verdade do DINHEIRO: o IndexedDB pode ser despejado
 * (o Safari apaga storage de origem sem interação há 7 dias) e por isso é
 * tratado como buffer de trânsito. A verdade é o Postgres. Ver ADR-0015.
 */

export interface ClienteLocal {
  id: string;
  lojaId: string;
  nome: string;
  telefone: string | null;
  saldoCentavos: number;
  diaVencimento: number | null;
  ultimoLancamentoEm: string | null;
}

export type TipoEvento = "fiado" | "pagamento" | "estorno";

/** Um item do outbox: a intenção do lojista, esperando a rede. */
export interface EventoPendente {
  seq?: number;
  /** ULID gerado aqui, antes de qualquer rede. É a chave da idempotência. */
  id: string;
  lojaId: string;
  tipo: TipoEvento;
  clienteId: string;
  valorCentavos: number;
  ocorridoEm: string;
  descricao?: string;
  entradaDebitoId: string;
  entradaCreditoId: string;
  criadoEm: number;
  tentativas: number;
  ultimoErro?: string;
}

export interface Meta {
  chave: string;
  valor: unknown;
}

const db = new Dexie("na-rua") as Dexie & {
  clientes: EntityTable<ClienteLocal, "id">;
  outbox: EntityTable<EventoPendente, "seq">;
  meta: EntityTable<Meta, "chave">;
};

db.version(1).stores({
  clientes: "id, lojaId, nome",
  outbox: "++seq, id, lojaId, criadoEm",
  meta: "chave",
});

export { db };

export async function lerMeta<T>(chave: string): Promise<T | undefined> {
  const r = await db.meta.get(chave);
  return r?.valor as T | undefined;
}

export async function gravarMeta(chave: string, valor: unknown): Promise<void> {
  await db.meta.put({ chave, valor });
}

/**
 * Pede armazenamento persistente ao navegador.
 *
 * O Chrome não mostra prompt — decide por heurística, e dois dos sinais que ele
 * usa são o site estar instalado na tela de início e ter permissão de
 * notificação. Ou seja: convidar para instalar não é engajamento, é o mecanismo
 * pelo qual o app conquista durabilidade. Ver ADR-0015.
 */
export async function pedirPersistencia(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
