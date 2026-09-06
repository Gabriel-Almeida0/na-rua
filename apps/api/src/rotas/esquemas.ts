import { z } from "zod";

/**
 * Contrato entre o PWA e a API. O mesmo shape é usado no cliente para validar
 * antes de enfileirar no outbox.
 */

const ulid = z
  .string()
  .regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/, "id deve ser um ULID");

const centavos = z
  .number()
  .int("valor deve ser inteiro em centavos")
  .positive("valor deve ser maior que zero");

const dataIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser AAAA-MM-DD");

export const clienteNovoSchema = z.object({
  id: ulid,
  // Único campo obrigatório. Ver ADR-0026.
  nome: z.string().trim().min(1, "diga o nome do freguês").max(120),
  telefone: z.string().trim().max(30).optional(),
  optinWhatsapp: z.boolean().optional(),
  diaVencimento: z.number().int().min(1).max(31).optional(),
  limiteCentavos: z.number().int().positive().optional(),
});

export const eventoFiadoSchema = z.object({
  tipo: z.literal("fiado"),
  id: ulid,
  clienteId: ulid,
  valorCentavos: centavos,
  ocorridoEm: dataIso,
  descricao: z.string().trim().max(200).optional(),
  entradaDebitoId: ulid,
  entradaCreditoId: ulid,
});

export const eventoPagamentoSchema = z.object({
  tipo: z.literal("pagamento"),
  id: ulid,
  clienteId: ulid,
  valorCentavos: centavos,
  ocorridoEm: dataIso,
  entradaDebitoId: ulid,
  entradaCreditoId: ulid,
});

export const eventoEstornoSchema = z.object({
  tipo: z.literal("estorno"),
  id: ulid,
  estornaId: ulid,
  ocorridoEm: dataIso,
  entradaIds: z.array(ulid).min(2),
});

export const eventoSchema = z.discriminatedUnion("tipo", [
  eventoFiadoSchema,
  eventoPagamentoSchema,
  eventoEstornoSchema,
]);

export const sincronizarSchema = z.object({
  // Lote pequeno de propósito: a fila do lojista tem dezenas de itens, não
  // milhares, e lote grande em 4G ruim é lote que nunca completa.
  eventos: z.array(eventoSchema).min(1).max(200),
  deviceId: z.string().max(64).optional(),
});

export type ClienteNovo = z.infer<typeof clienteNovoSchema>;
export type Evento = z.infer<typeof eventoSchema>;
export type Sincronizar = z.infer<typeof sincronizarSchema>;
