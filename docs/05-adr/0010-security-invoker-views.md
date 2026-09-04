# ADR-0010 · Toda view exposta usa `security_invoker = on`

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Este é o footgun mais perigoso da stack, e ele é **silencioso**.

Documentação do PostgreSQL sobre views:

> *"by default, the row-level security policies of the view owner are applied"*

No Supabase, views são criadas pelo papel `postgres`. Portanto **uma view sobre uma tabela com RLS entrega todos os tenants para todo mundo** — sem erro, sem log, sem sintoma. O app funciona perfeitamente enquanto vaza a caderneta de todas as lojas.

E o produto **precisa** de views: `v_saldos`, `v_total_na_rua`, `v_atrasados`.

## Decisão

**Toda view exposta pela API declara `with (security_invoker = on)`** (PostgreSQL 15+).

```sql
create or replace view public.v_saldos
with (security_invoker = on) as
select …;
```

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Não usar views | Empurra a lógica de agregação para o cliente, multiplica queries e piora a performance no aparelho fraco |
| Views em schema privado + funções `SECURITY INVOKER` | Funciona, mas adiciona indireção sem ganho sobre a opção nativa |
| Confiar na revisão de código | Não há revisor. É um projeto solo |

## Consequências

**Positivas** — a view respeita a RLS de quem consulta, que é o comportamento que qualquer pessoa assume estar acontecendo.

**Negativas** — é fácil esquecer numa view nova. Duas mitigações:
- Os **Database Advisors** têm regra dedicada: `0010_security_definer_view`
- Item explícito no [checklist de release](../04-arquitetura/07-qualidade-e-observabilidade.md)

> Registrado como ADR próprio, e não como nota de rodapé, precisamente porque a falha é **silenciosa**. Nada no comportamento do app denuncia o vazamento.
