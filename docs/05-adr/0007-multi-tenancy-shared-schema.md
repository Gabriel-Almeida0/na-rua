# ADR-0007 · Multi-tenancy por shared schema + `tenant_id` + RLS

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Cada loja é um tenant, com múltiplos usuários. O perfil é de **muitíssimos tenants pequenos** com schema idêntico — uma caderneta de bairro é B2C disfarçado de B2B.

## Decisão

**Shared schema, `store_id` em toda tabela, isolamento por RLS.**

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **Schema por tenant** | Densidade de 1k–10k tenants (contra 100k–1M+ do row-based); queries cross-tenant não paralelas; **fan-out de migração por schema** — multiplica o custo de cada migração por N lojas |
| **Database/projeto por tenant** | Custo operacional maior; queries cross-tenant caríssimas; e no Supabase o free tier permite **2 projetos ativos** |

## Nota de honestidade sobre as fontes

As recomendações oficiais divergem, e a divergência é informativa:

- **Citus/Microsoft** (a fonte mais quantificada): row-based para *"larger volumes of small tenants (B2C)"*, schema-based para *"smaller numbers of large tenants (B2B)"* — sustenta a escolha
- **Crunchy Data**: variável de sessão em vez de role por tenant, para não destruir o pooling, e *"ideally you have that org_id in every table"*
- **Neon** recomenda o oposto (um projeto por usuário) — mas **database-per-tenant é o produto deles**, e o post não apresenta nenhum número de overhead
- **AWS**: o whitepaper silo/bridge/pool está marcado pela própria AWS como *"for historical reference only"*
- **Supabase**: ⚠️ **não existe página oficial de multi-tenancy.** O padrão `tenant_id` + membership é prática consolidada da comunidade, não doutrina documentada

## Consequências

**Positivas** — uma migração atômica; menor custo operacional para dev solo; queries cross-tenant nativas para as próprias métricas do produto.

**Negativas** — 🔴 **blast radius máximo**: um bug de RLS afeta todos os tenants. Mitigações não-negociáveis:
- Suíte pgTAP de RLS rodando em todo push ([ADR-0009](0009-regras-de-rls.md))
- `FORCE ROW LEVEL SECURITY` em toda tabela
- Database Advisors (Splinter) no checklist de release
- Filtro explícito por `store_id` no cliente, **além** da RLS
