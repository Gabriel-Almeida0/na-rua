import { betterAuth } from "better-auth";
import pg from "pg";

/**
 * Better Auth com o Postgres local. Sem Supabase.
 *
 * Decisões que vêm da pesquisa de UX, não de preferência técnica:
 *
 * - Perder o login NUNCA pode significar perder a caderneta. Por isso a sessão
 *   é longa e o app lê os dados locais mesmo sem sessão válida.
 * - Recuperação por telefone, não por "esqueci minha senha" — perda de acesso
 *   é a causa nº 2 de desinstalação nos concorrentes analisados.
 *
 * O Better Auth conecta com o papel MIGRATOR porque ele é dono das próprias
 * tabelas (user/session/account/verification) e precisa escrever nelas sem
 * passar pela RLS do domínio.
 */
const { Pool } = pg;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL_MIGRATOR ?? "",
    max: 5,
  }),
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-trocar",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3333",
  emailAndPassword: {
    enabled: true,
    // O lojista não vai confirmar e-mail no balcão com cliente esperando.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    // 30 dias. Sessão curta em app de balcão é hostil: o lojista abre o app
    // dezenas de vezes por dia e não vai relogar.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [process.env.WEB_ORIGIN ?? "http://localhost:3000"],
});

export type Sessao = typeof auth.$Infer.Session;
