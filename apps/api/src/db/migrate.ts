/**
 * Migrador em três estágios, nesta ordem obrigatória:
 *
 *   1. sql/00-bootstrap.sql  — schema private e a função de papel. Precisa vir
 *                              antes, porque as policies a referenciam.
 *   2. drizzle/              — tabelas, índices, checks e policies.
 *   3. sql/99-hardening.sql  — grants, triggers de imutabilidade, FORCE RLS,
 *                              partida dobrada e views com security_invoker.
 *
 * Roda com o papel MIGRATOR (dono). A API nunca usa essa conexão.
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { criarPoolMigrator } from "./cliente.ts";

const aqui = dirname(fileURLToPath(import.meta.url));
const raizApi = join(aqui, "..", "..");

const pool = criarPoolMigrator();

async function rodarArquivo(caminho: string, rotulo: string) {
  const sql = await readFile(caminho, "utf8");
  await pool.query(sql);
  console.log(`  ✓ ${rotulo}`);
}

try {
  console.log("1. bootstrap");
  await rodarArquivo(join(raizApi, "sql", "00-bootstrap.sql"), "00-bootstrap.sql");

  console.log("2. migrations do drizzle");
  const dir = join(raizApi, "drizzle");
  const arquivos = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of arquivos) {
    const sql = await readFile(join(dir, f), "utf8");
    // O drizzle-kit separa statements com este marcador.
    const statements = sql.split("--> statement-breakpoint");
    for (const s of statements) {
      const t = s.trim();
      if (t === "") continue;
      try {
        await pool.query(t);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Idempotência simples: em dev reaplicamos o mesmo arquivo.
        if (/already exists|já existe/i.test(msg)) continue;
        console.error(`\n  ✗ falhou em ${f}:\n${t}\n`);
        throw e;
      }
    }
    console.log(`  ✓ ${f}`);
  }

  console.log("3. hardening");
  await rodarArquivo(join(raizApi, "sql", "99-hardening.sql"), "99-hardening.sql");

  console.log("\nBanco pronto.");
} finally {
  await pool.end();
}
