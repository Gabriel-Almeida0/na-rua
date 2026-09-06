/**
 * Teste de ponta a ponta da API, contra o Postgres de verdade.
 *
 * Exercita o caminho completo do lojista: cadastro, criação da loja, freguês
 * novo, anotar fiado, reenvio idempotente, pagamento parcial, lote do outbox,
 * extrato — e as garantias de isolamento entre lojas.
 *
 * Pré-requisitos:
 *   pnpm db:up                                      (Postgres no Docker)
 *   pnpm --filter @na-rua/api db:migrate            (schema aplicado)
 *   pnpm --filter @na-rua/api dev                   (API em :3333)
 *
 * Rodar:
 *   pnpm --filter @na-rua/api e2e
 *
 * Usa e-mails com timestamp, então pode rodar quantas vezes quiser sem limpar
 * o banco. Não apaga nada — é um banco de desenvolvimento descartável.
 */
import { ulid } from "ulid";

const API = "http://localhost:3333";
// O Better Auth exige Origin nas rotas de autenticação (proteção contra CSRF).
// Precisa ser uma das trustedOrigins configuradas em src/lib/auth.ts.
const ORIGEM = process.env.WEB_ORIGIN ?? "http://localhost:3000";
let falhas = 0;

function ok(cond, msg, extra = "") {
  console.log(`${cond ? "  ✓" : "  ✗"} ${msg}${extra ? " — " + extra : ""}`);
  if (!cond) falhas++;
}

async function req(caminho, { metodo = "GET", corpo, cookie } = {}) {
  const r = await fetch(API + caminho, {
    method: metodo,
    headers: {
      "content-type": "application/json",
      origin: ORIGEM,
      ...(cookie ? { cookie } : {}),
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  const texto = await r.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { json = texto; }
  return { status: r.status, json, cookie: r.headers.getSetCookie?.().join("; ") ?? "" };
}

async function cadastrar(nome, email) {
  const r = await req("/api/auth/sign-up/email", {
    metodo: "POST",
    corpo: { name: nome, email, password: "senha-de-teste-123" },
  });
  if (r.status >= 400) throw new Error(`cadastro falhou: ${r.status} ${JSON.stringify(r.json)}`);
  return r.cookie;
}

const marca = Date.now();

console.log("\n1. CADASTRO E LOJA");
const cookieMarlene = await cadastrar("Marlene", `marlene${marca}@teste.local`);
ok(!!cookieMarlene, "Marlene se cadastrou e recebeu sessão");

const loja = await req("/api/lojas", {
  metodo: "POST",
  cookie: cookieMarlene,
  corpo: { nome: "Mercadinho da Marlene", chavePix: "11988887777", diaVencimentoPadrao: 5 },
});
ok(loja.status === 201, "loja criada", `status ${loja.status}`);
const lojaId = loja.json?.id;
ok(!!lojaId, "loja tem id");
ok(loja.json?.papel === "dono", "criadora virou dona");

const minhas = await req("/api/lojas", { cookie: cookieMarlene });
ok(minhas.json?.lojas?.length === 1, "a loja aparece na lista dela");

console.log("\n2. FREGUÊS COM SÓ O NOME");
const mariaId = ulid();
const cliente = await req(`/api/lojas/${lojaId}/clientes`, {
  metodo: "POST", cookie: cookieMarlene,
  corpo: { id: mariaId, nome: "Dona Maria" },
});
ok(cliente.status === 201, "cliente criado sem CPF, sem telefone, sem e-mail");

console.log("\n3. ANOTAR FIADO");
const fiado = {
  tipo: "fiado", id: ulid(), clienteId: mariaId,
  valorCentavos: 4750, ocorridoEm: new Date().toISOString().slice(0, 10),
  entradaDebitoId: ulid(), entradaCreditoId: ulid(),
};
const s1 = await req(`/api/lojas/${lojaId}/sync`, {
  metodo: "POST", cookie: cookieMarlene, corpo: { eventos: [fiado], deviceId: "celular-balcao" },
});
ok(s1.status === 200, "fiado de R$ 47,50 sincronizado", `status ${s1.status}`);
ok(s1.json?.aplicados?.length === 1, "1 evento aplicado");

console.log("\n4. IDEMPOTÊNCIA — o dedo escorregou e mandou de novo");
const s2 = await req(`/api/lojas/${lojaId}/sync`, {
  metodo: "POST", cookie: cookieMarlene, corpo: { eventos: [fiado] },
});
ok(s2.json?.aplicados?.length === 0, "nada foi aplicado de novo");
ok(s2.json?.jaExistiam?.length === 1, "o evento foi reconhecido como já existente");

console.log("\n5. CADERNETA");
const cad1 = await req(`/api/lojas/${lojaId}/caderneta`, { cookie: cookieMarlene });
ok(cad1.json?.totalNaRuaCentavos === 4750, "tá na rua = R$ 47,50 (não duplicou)",
   `veio ${cad1.json?.totalNaRuaCentavos}`);
ok(cad1.json?.pessoasDevendo === 1, "1 pessoa devendo");
ok(cad1.json?.clientes?.[0]?.nome === "Dona Maria", "a Dona Maria está na lista");

console.log("\n6. PAGAMENTO PARCIAL");
const pag = {
  tipo: "pagamento", id: ulid(), clienteId: mariaId,
  valorCentavos: 2000, ocorridoEm: new Date().toISOString().slice(0, 10),
  entradaDebitoId: ulid(), entradaCreditoId: ulid(),
};
await req(`/api/lojas/${lojaId}/sync`, { metodo: "POST", cookie: cookieMarlene, corpo: { eventos: [pag] } });
const cad2 = await req(`/api/lojas/${lojaId}/caderneta`, { cookie: cookieMarlene });
ok(cad2.json?.totalNaRuaCentavos === 2750, "saldo caiu para R$ 27,50", `veio ${cad2.json?.totalNaRuaCentavos}`);

console.log("\n7. LOTE OFFLINE — vários eventos de uma vez");
const lote = [1500, 800, 3200].map((v) => ({
  tipo: "fiado", id: ulid(), clienteId: mariaId, valorCentavos: v,
  ocorridoEm: new Date().toISOString().slice(0, 10),
  entradaDebitoId: ulid(), entradaCreditoId: ulid(),
}));
const s3 = await req(`/api/lojas/${lojaId}/sync`, { metodo: "POST", cookie: cookieMarlene, corpo: { eventos: lote } });
ok(s3.json?.aplicados?.length === 3, "3 eventos do outbox subiram juntos");
const cad3 = await req(`/api/lojas/${lojaId}/caderneta`, { cookie: cookieMarlene });
ok(cad3.json?.totalNaRuaCentavos === 2750 + 1500 + 800 + 3200, "saldo somou tudo",
   `veio ${cad3.json?.totalNaRuaCentavos}`);

console.log("\n8. EXTRATO");
const ext = await req(`/api/lojas/${lojaId}/clientes/${mariaId}/extrato`, { cookie: cookieMarlene });
ok(ext.json?.lancamentos?.length === 5, "5 lançamentos no extrato", `veio ${ext.json?.lancamentos?.length}`);
ok(ext.json?.saldoCentavos === 8250, "saldo do extrato bate com a caderneta");

console.log("\n9. ISOLAMENTO — outro lojista");
const cookieOutro = await cadastrar("Outro", `outro${marca}@teste.local`);
const espiar = await req(`/api/lojas/${lojaId}/caderneta`, { cookie: cookieOutro });
ok(espiar.status === 403, "outro lojista leva 403 na loja alheia", `status ${espiar.status}`);
const listaOutro = await req("/api/lojas", { cookie: cookieOutro });
ok(listaOutro.json?.lojas?.length === 0, "e não enxerga loja nenhuma");
const invadir = await req(`/api/lojas/${lojaId}/sync`, {
  metodo: "POST", cookie: cookieOutro,
  corpo: { eventos: [{ tipo: "fiado", id: ulid(), clienteId: mariaId, valorCentavos: 999,
    ocorridoEm: new Date().toISOString().slice(0,10), entradaDebitoId: ulid(), entradaCreditoId: ulid() }] },
});
ok(invadir.status === 403, "e não consegue escrever na loja alheia", `status ${invadir.status}`);

console.log("\n10. SEM SESSÃO");
const anon = await req(`/api/lojas/${lojaId}/caderneta`);
ok(anon.status === 401, "sem sessão dá 401", `status ${anon.status}`);

console.log("\n11. VALIDAÇÃO");
const ruim = await req(`/api/lojas/${lojaId}/clientes`, {
  metodo: "POST", cookie: cookieMarlene, corpo: { id: "nao-e-ulid", nome: "X" },
});
ok(ruim.status === 422, "id que não é ULID é recusado", `status ${ruim.status}`);
const semNome = await req(`/api/lojas/${lojaId}/clientes`, {
  metodo: "POST", cookie: cookieMarlene, corpo: { id: ulid(), nome: "  " },
});
ok(semNome.status === 422, "nome vazio é recusado");
ok(semNome.json?.mensagem === "diga o nome do freguês", "e a mensagem fala como gente",
   JSON.stringify(semNome.json?.mensagem));

console.log(`\n${falhas === 0 ? "TUDO VERDE" : falhas + " FALHA(S)"}`);
process.exit(falhas === 0 ? 0 : 1);
