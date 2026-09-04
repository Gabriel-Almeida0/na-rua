# ADR-0008 · O papel vem da tabela de membership, não do JWT

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O produto tem três papéis: `dono`, `gerente` e `balconista`. O guia oficial de RBAC do Supabase injeta o papel no JWT via **Custom Access Token Hook**.

Mas a documentação é explícita:

> *"the auth hook will only modify the access token JWT but not the auth response"*

As claims valem apenas para o token corrente. **Mudar o papel de alguém só surte efeito depois do refresh do token.**

Traduzido para o domínio: **o dono demite o balconista às 14h e o JWT dele continua dizendo `balconista` até o token expirar.**

## Decisão

- **`tenant_id` no JWT** — não muda durante a sessão
- **Papel lido da tabela `store_members`** a cada verificação, via função `SECURITY DEFINER`

```sql
create or replace function private.has_store_role(_store uuid, _min public.store_role)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
begin
  return exists (
    select 1 from public.store_members m
    where m.store_id = _store and m.user_id = auth.uid() and m.role >= _min
  );
end; $$;
```

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Papel no JWT via Custom Access Token Hook | Revogação atrasada. **Inaceitável num app de dinheiro** |
| Encurtar drasticamente a vida do token | Mais requests de refresh num app que precisa funcionar com rede ruim. Troca ruim |
| Verificar o papel na aplicação | Perde a garantia no banco — que é justamente o ponto de usar RLS ([ADR-0012](0012-backend-supabase.md)) |

## Consequências

**Positivas** — ⭐ **revogação instantânea**. O dono remove o acesso e ele morre no mesmo instante.

**Negativas** — uma leitura indexada por verificação. Mitigação obrigatória: envolver a chamada em `(select …)` para forçar um *initPlan* — **178.000 ms → 12 ms** no benchmark oficial. Ver [ADR-0009](0009-regras-de-rls.md).

**Nota:** ⚠️ não foi confirmado se o hook roda no refresh do token. Mesmo que rodasse, a latência de revogação continuaria existindo.
