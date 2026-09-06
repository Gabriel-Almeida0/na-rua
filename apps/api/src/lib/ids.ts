import { ulid } from "ulid";

/**
 * IDs são ULID gerados no CLIENTE, antes de qualquer chamada de rede (ADR-0002).
 * O servidor gera apenas os ids de entidades que nascem nele.
 *
 * ULID em vez de UUIDv4 porque é ordenável no tempo — preserva a localidade do
 * índice B-tree em vez de fragmentá-lo — e é legível num log.
 */
export function novoId(): string {
  return ulid();
}

/** ULID canônico: 26 caracteres em Crockford base32. */
const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

export function ehUlid(valor: unknown): valor is string {
  return typeof valor === "string" && ULID_RE.test(valor);
}
