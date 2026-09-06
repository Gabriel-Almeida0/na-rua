/**
 * Orçamento de performance como teste, não como intenção.
 *
 * O limite de 170 KB vem da ADR-0017: é ~55% do budget "3s JS-light" da edição
 * 2026 do Performance Inequality Gap (rede P75 de 9 Mbps / 100 ms, Galaxy A24).
 * Adotamos a folga porque o app é aberto dezenas de vezes por dia com um
 * cliente esperando no balcão.
 *
 * O script mede o que o HTML pré-renderizado REALMENTE pede, e desconta os
 * scripts marcados `noModule` — nenhum navegador do público-alvo os baixa.
 *
 * Rodar: pnpm --filter @na-rua/web orcamento   (depois do build)
 */
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMITE_KB = 170;
const HTML = ".next/server/app/index.html";

if (!existsSync(HTML)) {
  console.error(`Não achei ${HTML}. Rode o build antes.`);
  process.exit(1);
}

const html = readFileSync(HTML, "utf8");
const tags = [...html.matchAll(/<script\b[^>]*src="\/_next\/(static\/[^"]+?\.js)"[^>]*>/g)];

let total = 0;
const linhas = [];

for (const tag of tags) {
  const caminho = join(".next", tag[1]);
  if (!existsSync(caminho)) continue;
  const kb = gzipSync(readFileSync(caminho)).length / 1024;
  const legado = /nomodule/i.test(tag[0]);
  linhas.push({ nome: basename(tag[1]), kb, legado });
  if (!legado) total += kb;
}

linhas.sort((a, b) => b.kb - a.kb);
console.log("\nFirst load da rota '/':\n");
for (const l of linhas) {
  const marca = l.legado ? "   (noModule — navegador moderno não baixa)" : "";
  console.log(`  ${l.nome.padEnd(44)} ${l.kb.toFixed(1).padStart(7)} KB gz${marca}`);
}

const folga = LIMITE_KB - total;
console.log(`\n  ${"TOTAL (navegador moderno)".padEnd(44)} ${total.toFixed(1).padStart(7)} KB gz`);
console.log(`  ${"orçamento (ADR-0017)".padEnd(44)} ${LIMITE_KB.toFixed(1).padStart(7)} KB gz`);

if (folga < 0) {
  console.error(`\nESTOUROU o orçamento em ${(-folga).toFixed(1)} KB.\n`);
  process.exit(1);
}
if (folga < 15) {
  console.log(`\nPassou, mas com só ${folga.toFixed(1)} KB de folga. Qualquer dependência`);
  console.log("nova estoura. Trate como dívida, não como aprovação.\n");
} else {
  console.log(`\nDentro do orçamento, com ${folga.toFixed(1)} KB de folga.\n`);
}
