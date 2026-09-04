# ADR-0018 · ORM: Drizzle 0.45.2, a linha estável

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O projeto é Postgres com RLS pesada. O ORM precisa não atrapalhar a escrita de SQL e, idealmente, ajudar a declarar policies.

**Verificação primária (npm dist-tags, 04/09/2026):**

| Pacote | Tag | Versão | Data |
|---|---|---|---|
| `drizzle-orm` | `latest` | **0.45.2** | 27/03/2026 |
| `drizzle-orm` | `rc` | 1.0.0-rc.4 | 27/06/2026 |
| `prisma` (CLI) | `latest` | **8.0.0-rc.12** | 26/08/2026 |
| `@prisma/client` | `latest` | **7.10.0** | 25/08/2026 |

❌ **Drizzle não tem 1.0 estável** — está em RC desde jun/2026. Qualquer artigo dizendo "Drizzle v1 lançado" está errado.
⚠️ **Prisma 8 também está em RC**, e com pegadinha: o CLI publica RCs sob a tag `latest`, então `npm i prisma@latest` entrega um release candidate.

## Decisão

**`drizzle-orm@0.45.2` + `drizzle-kit@0.31.10`.** Não os RCs.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **Drizzle 1.0-rc** | RC não entra em portfólio. Você não quer explicar numa entrevista por que o build quebrou |
| **Prisma 8** | Tem RLS (anunciado 07/2026), mas **está em RC**. O estável (7.10.0) não tem |
| **Prisma 7 estável** | Sem suporte a RLS no schema |
| **SQL puro** | Viável, mas perde type-safety composicional sem ganhar nada — o Drizzle já é fino o bastante |

**Nota de correção de crítica comum:** o argumento "Prisma é pesado demais para serverless/edge" está **desatualizado**. O Prisma migrou do Rust e está GA desde a v6.16.0, com ~90% de redução de bundle.

## Justificativa

- Helpers de RLS/Supabase mais maduros: `drizzle-orm/supabase` traz `anonRole`, `authenticatedRole`, `serviceRole`, `authUid()` e os schemas `auth`/`realtime` pré-mapeados
- `pgPolicy()`, `pgRole()` e `pgTable.withRLS()` — **a policy fica no mesmo arquivo da tabela**, o que lê muito bem num portfólio
- SQL-first: num domínio financeiro, você **vai** querer escrever SQL

## Consequências

⚠️ **A nuance que quase ninguém conta:** `pgPolicy()` só **gera o SQL da policy na migration**. Para valer em runtime, a conexão precisa entrar na transação com o role e os claims corretos — com Supabase + Drizzle isso é manual (`set_config('request.jwt.claims', …)` + `set local role`).

⚠️ Em serverless, usar o **Connection Pooler** da Supabase; em transaction mode, prepared statements não funcionam: `postgres(url, { prepare: false })`.

**Revisão:** quando o Drizzle 1.0 sair estável, reavaliar a migração.
