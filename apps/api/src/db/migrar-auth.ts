/**
 * Aplica o schema do Better Auth (user/session/account/verification).
 *
 * Usa a API programática em vez do @better-auth/cli porque o CLI arrasta
 * Prisma e better-sqlite3 como dependências — peso e build scripts que este
 * projeto não precisa. Ver DECISOES-DE-DEPENDENCIA.md.
 */
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../lib/auth.ts";

const { toBeAdded, toBeCreated, runMigrations } = await getMigrations(
  auth.options,
);

if (toBeCreated.length === 0 && toBeAdded.length === 0) {
  console.log("Schema do Better Auth já está em dia.");
  process.exit(0);
}

for (const t of toBeCreated) console.log(`  criar tabela: ${t.table}`);
for (const t of toBeAdded) console.log(`  alterar tabela: ${t.table}`);

await runMigrations();
console.log("Schema do Better Auth aplicado.");
process.exit(0);
