-- Roda DEPOIS das migrations do drizzle-kit.
-- É aqui que moram as garantias que o ORM não modela.

-- ---------------------------------------------------------------------------
-- 1. Grants mínimos. O papel da aplicação não recebe UPDATE nem DELETE no
--    ledger — a API simplesmente não tem o verbo (ADR-0006, camada 1 de 3).
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from narua_app;

grant select, insert, update, delete on
  public.stores, public.store_members, public.customers, public.accounts
  to narua_app;

grant select, insert on public.ledger_transactions, public.ledger_entries to narua_app;
revoke update, delete on public.ledger_transactions, public.ledger_entries from narua_app;

-- ---------------------------------------------------------------------------
-- 2. Trigger de imutabilidade. Barra até quem TEM privilégio: migração,
--    script de correção às 3h da manhã, o dono da tabela (ADR-0006, camada 2).
-- ---------------------------------------------------------------------------
create or replace function private.deny_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'ledger é append-only (operação: %). Corrija por contra-lançamento (ADR-0004).', tg_op;
end;
$$;

drop trigger if exists tg_ledger_entries_imutavel on public.ledger_entries;
create trigger tg_ledger_entries_imutavel
  before update or delete on public.ledger_entries
  for each row execute function private.deny_mutation();

drop trigger if exists tg_ledger_tx_imutavel on public.ledger_transactions;
create trigger tg_ledger_tx_imutavel
  before delete on public.ledger_transactions
  for each row execute function private.deny_mutation();

-- ---------------------------------------------------------------------------
-- 3. FORCE RLS. Sem isto, o dono da tabela ignora as policies — e migrações e
--    jobs rodam como dono (ADR-0006, camada 3).
-- ---------------------------------------------------------------------------
alter table public.stores              force row level security;
alter table public.store_members       force row level security;
alter table public.customers           force row level security;
alter table public.accounts            force row level security;
alter table public.ledger_transactions force row level security;
alter table public.ledger_entries      force row level security;

-- ---------------------------------------------------------------------------
-- 4. Partida dobrada verificada no COMMIT.
--    DEFERRABLE porque os dois lados da partida entram na mesma transação:
--    checar a cada linha reprovaria o primeiro INSERT sempre.
-- ---------------------------------------------------------------------------
create or replace function private.transacao_equilibrada()
returns trigger
language plpgsql
as $$
declare
  d bigint;
  c bigint;
  tx text := coalesce(new.transaction_id, old.transaction_id);
begin
  select
    coalesce(sum(valor_centavos) filter (where direcao = 'debito'),  0),
    coalesce(sum(valor_centavos) filter (where direcao = 'credito'), 0)
  into d, c
  from public.ledger_entries
  where transaction_id = tx;

  if d <> c then
    raise exception
      'Partida dobrada violada na transação %: débitos=% créditos=%', tx, d, c;
  end if;
  return null;
end;
$$;

drop trigger if exists tg_transacao_equilibrada on public.ledger_entries;
create constraint trigger tg_transacao_equilibrada
  after insert on public.ledger_entries
  deferrable initially deferred
  for each row execute function private.transacao_equilibrada();

-- ---------------------------------------------------------------------------
-- 5. Views. security_invoker NÃO é opcional: por padrão o Postgres aplica as
--    policies do DONO da view, o que entregaria todas as lojas para todo mundo,
--    em silêncio (ADR-0010).
-- ---------------------------------------------------------------------------
create or replace view public.v_saldos
with (security_invoker = on) as
select
  e.store_id,
  a.customer_id,
  sum(
    case e.direcao
      when 'debito'  then  e.valor_centavos
      when 'credito' then -e.valor_centavos
    end
  )::bigint as saldo_centavos
from public.ledger_entries e
join public.accounts a on a.id = e.account_id
where a.kind = 'receivable'
group by e.store_id, a.customer_id;

create or replace view public.v_total_na_rua
with (security_invoker = on) as
select
  store_id,
  coalesce(sum(saldo_centavos) filter (where saldo_centavos > 0), 0)::bigint as total_centavos,
  count(*) filter (where saldo_centavos > 0) as pessoas_devendo
from public.v_saldos
group by store_id;

grant select on public.v_saldos, public.v_total_na_rua to narua_app;
