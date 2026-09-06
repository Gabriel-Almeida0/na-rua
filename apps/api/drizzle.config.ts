import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_MIGRATOR ?? "",
  },
  // As policies de RLS são declaradas junto das tabelas (ADR-0018), então o
  // drizzle-kit precisa saber que os papéis já existem no banco.
  entities: {
    // narua_app é criado no initdb do Postgres, não pelo drizzle-kit.
    roles: { exclude: ["narua_app"] },
  },
} satisfies Config;
