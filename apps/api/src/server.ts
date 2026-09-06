import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { ErroDeRequisicao } from "./lib/erros.ts";
import { auth } from "./lib/auth.ts";
import { rotasDaCaderneta } from "./rotas/caderneta.ts";
import { rotasDeLojas } from "./rotas/lojas.ts";

declare module "fastify" {
  interface FastifyRequest {
    usuarioId?: string;
  }
}

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    // exactOptionalPropertyTypes: a chave não pode existir com valor undefined,
    // então ela só entra no objeto quando há transporte de verdade.
    ...(process.env.NODE_ENV === "production"
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: { translateTime: "HH:MM:ss" },
          },
        }),
  },
  // O lojista está em 4G ruim: corpo pequeno, timeout curto o suficiente para
  // o outbox tentar de novo em vez de pendurar a conexão.
  bodyLimit: 1024 * 512,
});

await app.register(cors, {
  origin: [process.env.WEB_ORIGIN ?? "http://localhost:3000"],
  credentials: true,
});
await app.register(cookie);

/**
 * Better Auth expõe um handler no padrão Web (Request/Response). Este adaptador
 * traduz do Fastify para ele e de volta.
 */
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  // O corpo precisa chegar cru: o Better Auth faz o próprio parse.
  config: {},
  async handler(req, resposta) {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const cabecalhos = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") cabecalhos.append(k, v);
      else if (Array.isArray(v)) for (const vv of v) cabecalhos.append(k, vv);
    }

    const semCorpo = req.method === "GET" || req.method === "HEAD";
    const requisicao = new Request(url.toString(), {
      method: req.method,
      headers: cabecalhos,
      ...(semCorpo ? {} : { body: JSON.stringify(req.body ?? {}) }),
    });

    const r = await auth.handler(requisicao);
    resposta.status(r.status);
    r.headers.forEach((valor, chave) => resposta.header(chave, valor));
    return resposta.send(r.body ? await r.text() : null);
  },
});

/**
 * Identidade. Não bloqueia: as rotas decidem se exigem usuário.
 *
 * Uma decisão que vem da pesquisa de UX, não da técnica: falta de sessão nunca
 * derruba o app inteiro. Perder o login não pode significar perder a caderneta.
 */
app.addHook("onRequest", async (req) => {
  if (req.url.startsWith("/api/auth/")) return;
  const cabecalhos = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") cabecalhos.append(k, v);
  }
  try {
    const sessao = await auth.api.getSession({ headers: cabecalhos });
    if (sessao?.user?.id) req.usuarioId = sessao.user.id;
  } catch {
    // Sessão inválida é ausência de sessão, não erro de servidor.
  }
});

app.get("/saude", async () => ({ ok: true, em: new Date().toISOString() }));

/**
 * Tratamento de erro.
 *
 * Precisa ser registrado ANTES das rotas: `await app.register(...)` já fecha o
 * contexto do plugin, e um handler definido depois não é herdado por ele — as
 * mensagens voltavam no formato padrão do Fastify em vez do nosso.
 */
app.setErrorHandler((erro, req, resposta) => {
  if (erro instanceof ErroDeRequisicao) {
    return resposta
      .code(erro.status)
      .send({ erro: erro.codigo, mensagem: erro.message });
  }

  // Violação de RLS chega como 42501. Não é erro nosso nem do lojista: é a
  // garantia funcionando. Responde 403 sem detalhar o que existe do outro lado.
  const codigoPg = (erro as { code?: string }).code;
  if (codigoPg === "42501") {
    return resposta
      .code(403)
      .send({ erro: "sem_acesso", mensagem: "Você não tem acesso a esse dado." });
  }
  if (codigoPg === "23514" || codigoPg === "23505") {
    req.log.warn({ erro }, "violação de constraint");
    return resposta.code(422).send({
      erro: "dados_invalidos",
      mensagem: "Esse valor não é aceito. Confere aí.",
    });
  }

  req.log.error({ erro }, "erro não tratado");
  return resposta.code(500).send({
    erro: "erro_interno",
    mensagem: "Deu um problema aqui. Suas anotações estão salvas — tenta de novo.",
  });
});

await app.register(rotasDeLojas);
await app.register(rotasDaCaderneta);

const porta = Number(process.env.PORT ?? 3333);
await app.listen({ port: porta, host: "0.0.0.0" });
