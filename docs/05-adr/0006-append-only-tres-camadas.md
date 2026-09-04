# ADR-0006 · Append-only forçado em três camadas independentes

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Perda de dados é a **causa nº 1** de desinstalação nos apps concorrentes, em Brasil, Índia e Indonésia:

> *"Teve uma atualização que apagou todas as pessoas q me devia. Tomei um prejuízo bem alto por confiar no app."*

Repare no vetor: **foi uma atualização**. Não foi o usuário, não foi a API — foi uma migração. Uma convenção de código não teria impedido.

## Decisão

Forçar a imutabilidade do ledger em **três camadas independentes**:

```sql
-- 1) GRANTS: a API simplesmente não tem o verbo
revoke update, delete on public.ledger_entries from authenticated, anon;
grant  select, insert on public.ledger_entries to authenticated;

-- 2) TRIGGER: barra até quem tem privilégio
create trigger tg_ledger_entries_imutavel
  before update or delete on public.ledger_entries
  for each row execute function private.deny_mutation();

-- 3) RLS FORÇADA, inclusive para o owner da tabela
alter table public.ledger_entries enable row level security;
alter table public.ledger_entries force  row level security;
```

## Alternativas rejeitadas

| Alternativa | Por que falha sozinha |
|---|---|
| Só convenção de código | Não sobrevive a uma migração nem a um script de correção às 3h da manhã |
| Só grants | Não para o `service_role` nem o owner |
| Só trigger | Não para quem desabilita triggers |
| Só RLS | *"Table owners normally bypass row security"* — migrações e jobs ignoram |

## Consequências

**Positivas** — a imutabilidade passa a ser **inviolável pelo próprio código de aplicação**. É exatamente a garantia que um dev solo, sem revisor, precisa ter.

**Negativas** — correções legítimas de dados exigem um procedimento explícito e auditado, nunca um `UPDATE` improvisado. Isso é intencional: se corrigir dado de dinheiro fosse fácil, a garantia não existiria.

**Consequência operacional:** migrações precisam ser escritas sabendo que o ledger não aceita mutação. Estrutura pode mudar; conteúdo, não.
