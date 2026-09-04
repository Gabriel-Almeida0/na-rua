# ADR-0009 · Toda policy: `TO authenticated` + `(select fn())` + índice na coluna

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

RLS mal escrita não é lenta — é **inutilizável**. Benchmarks oficiais da Supabase, em tabela de 100 mil linhas:

| Otimização | Antes | Depois | Ganho |
|---|---|---|---|
| Índice na coluna da policy | 171 ms | **< 0,1 ms** | ~1.700× |
| `(select auth.uid())` em vez de `auth.uid()` | 179 ms | 9 ms | ~20× |
| **`(select has_role())` — security definer** | **178.000 ms** | **12 ms** | **~14.800×** |
| Inverter a direção do join | 9.000 ms | 20 ms | ~450× |
| `TO authenticated` | 170 ms | **< 0,1 ms** | ~1.700× |

**178 segundos viram 12 milissegundos por causa de dois parênteses.** Num Android de entrada, essa é a diferença entre o app existir e não existir.

## Decisão

Seis regras obrigatórias em **toda** policy:

1. **Envolver toda função em `(select …)`** — força um *initPlan*: uma execução por query, não por linha
2. **Indexar toda coluna usada na policy.** ⚠️ Uma coluna só conta como indexada quando é **a primeira** de um índice btree — PK composta indexa só a primeira
3. **Sempre `TO authenticated`** — oficial: *"Always add 'authenticated' to the approved roles instead of nothing or public"*
4. **`USING` e `WITH CHECK` sempre juntos** — `USING` sozinho permite **inserir** o que não se consegue ler, ou seja, gravar fiado na loja alheia. `USING` suprime silenciosamente; `WITH CHECK` lança erro
5. **`SECURITY DEFINER` para tabelas de junção** — evita avaliar a RLS da intermediária
6. **Filtrar explicitamente no cliente também** — a RLS é rede de segurança, não filtro primário

## Alternativas rejeitadas

Policy "simples e legível" sem wrapping. O ganho de legibilidade não compensa 178 segundos.

## Consequências

**Positivas** — performance previsível; e as regras são verificáveis automaticamente pelos Database Advisors (linter Splinter), que detectam `0003_auth_rls_initplan`, `0006_multiple_permissive_policies` e `0013_rls_disabled_in_public`.

**Negativas** — as policies ficam mais verbosas. É o preço, e é barato.

**Enforcement** — Advisors no checklist de release; suíte pgTAP em todo push.
