import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

/**
 * Duas conexões, de propósito.
 *
 * `poolApp` usa o papel `narua_app`, que não é superuser nem dono das tabelas.
 * É por isso que FORCE ROW LEVEL SECURITY vale de verdade: nem um bug nosso
 * consegue contornar a RLS por bypass de owner (ADR-0006).
 *
 * `poolMigrator` usa o dono e só é carregado por scripts de migração.
 */
const { Pool } = pg;

function exigir(nome: string): string {
  const v = process.env[nome];
  if (!v) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return v;
}

export const poolApp = new Pool({
  connectionString: exigir("DATABASE_URL"),
  max: 10,
});

export const db = drizzle(poolApp);

export function criarPoolMigrator(): pg.Pool {
  return new Pool({ connectionString: exigir("DATABASE_URL_MIGRATOR"), max: 1 });
}
