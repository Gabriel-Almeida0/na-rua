# ADR-0012 · Backend: Supabase (Postgres 17)

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O produto guarda dinheiro de terceiros, é multi-tenant, precisa de auth com papéis, e é mantido por uma pessoa sem revisor e com orçamento de infra próximo de zero.

## Decisão

**Supabase**, com shared schema + `store_id` + RLS.

## Justificativa

**1. ⭐ É o único que dá a garantia de isolamento *no banco*.** RLS + `FORCE ROW LEVEL SECURITY` + `REVOKE UPDATE/DELETE` + trigger tornam o append-only e o isolamento **invioláveis pelo próprio código de aplicação**. Convex, Cloudflare e Turso jogam isso inteiro para o código do desenvolvedor — e num produto financeiro feito por dev solo, **um `if` esquecido é vazamento de crédito de vizinho**.

**2. Auth + tenancy + RBAC no mesmo pacote, no free tier** — 50k MAU.

**3. Os Database Advisors (Splinter) cobrem exatamente onde dev solo erra.** Revisão de segurança automatizada e gratuita — e não há revisor humano.

**4. A porta de saída existe:** o ecossistema offline maduro é Postgres↔SQLite (PowerSync).

## Alternativas rejeitadas

| Opção | Por que não |
|---|---|
| **Neon + Drizzle** | 🥈 **Vice-campeão legítimo.** 100 projetos no free, scale-to-zero com **resume automático** (sem pausa manual), PAYG sem mínimo. Perde por não trazer auth acoplado à RLS — o Data API está em Beta e `neon.com/docs/guides/neon-rls` retorna 404. *Se o degrau de US$ 25 se tornar proibitivo, é a troca racional* |
| **Firebase** | Único com offline de 1ª parte no browser — genuinamente tentador. Mas: 🔴 ao estourar o Spark, *"your project's usage of that specific product will be shut off for the remainder of that month"* — **o app do lojista morre até o mês virar**. E há um custo escondido brutal: *"any time your rules include a read... you're billed for a read operation"*, ou seja, uma Security Rule que valida o vínculo do balconista **dobra o custo de toda operação** contra os 50k leituras/dia |
| **Convex** | Sem RLS de verdade; offline em alpha |
| **Cloudflare D1 + Durable Objects** | O padrão "um DO SQLite por loja" é quase desenhado para ledger append-only. Perde por: zero offline de 1ª parte, zero auth, e **D1 limitado a 10 bancos no free** |
| **Turso** | Não descontinuado, mas em transição arquitetural profunda: libSQL declarado legado, reescrita em Rust em beta sem 1.0, servidor indo closed source, multi-DB schemas removidos para novos usuários, e uma **segunda reescrita** já iniciada. Eliminado por risco de plataforma, não por qualidade |

## Consequências

Os custos são reais e estão registrados sem maquiagem:

| Problema | Mitigação |
|---|---|
| 🔴 Pausa após 1 semana de inatividade, **resume manual** | Cron gratuito no GitHub Actions com `select 1`/dia. Desaparece no Pro |
| 🔴 **Zero backup no plano Free** | [`pg_dump` diário desde o dia 1](0024-backup-proprio.md) — inaceitável não ter, com ledger financeiro |
| 🔴 Retenção de log de 1 dia | A auditoria vive no ledger ([ADR-0011](0011-auditoria-e-o-ledger.md)) |
| 🔴 500 MB e 2 projetos ativos | 2 projetos = staging + prod, sem folga |
| Banco vira read-only acima de 500 MB | Monitorar; é o degrau natural para o Pro |

**Custo:** R$ 0 na fase de portfólio; **US$ 25/mês** no Pro. Hospedar a instância **no Brasil** — não é obrigatório por lei, mas elimina uma camada regulatória inteira.
