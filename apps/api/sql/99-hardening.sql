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

-- ---------------------------------------------------------------------------
-- 6. Criação de loja: o único ovo-e-galinha do sistema.
--
--    A policy de INSERT em `stores` exigiria que o usuário já fosse membro da
--    loja que ele está criando. Impossível por construção.
--
--    Em vez de furar a RLS no código da aplicação — onde qualquer descuido
--    futuro viraria vazamento — a exceção fica AQUI, numa função estreita:
--    ela cria a loja e imediatamente torna o CHAMADOR o dono. Não aceita
--    user_id como parâmetro, então não dá para usá-la para colocar outra
--    pessoa numa loja.
-- ---------------------------------------------------------------------------
create or replace function private.criar_loja(
  _nome                  text,
  _chave_pix             text default null,
  _documento             text default null,
  _endereco              text default null,
  _dia_vencimento_padrao smallint default null,
  _id                    text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  text := private.current_user_id();
  v_store text := coalesce(_id, gen_random_uuid()::text);
begin
  if v_user is null then
    raise exception 'sem contexto de usuário: app.user_id não foi definido'
      using errcode = '42501';
  end if;
  if _nome is null or btrim(_nome) = '' then
    raise exception 'a loja precisa de um nome' using errcode = '22023';
  end if;

  insert into public.stores
    (id, nome, chave_pix, documento, endereco, dia_vencimento_padrao)
  values
    (v_store, btrim(_nome), _chave_pix, _documento, _endereco, _dia_vencimento_padrao);

  insert into public.store_members (store_id, user_id, role)
  values (v_store, v_user, 'dono');

  return v_store;
end;
$$;

revoke all on function private.criar_loja(text, text, text, text, smallint, text) from public;
grant execute on function private.criar_loja(text, text, text, text, smallint, text) to narua_app;

-- Gerenciar equipe: o dono pode adicionar e remover membros da própria loja.
drop policy if exists store_members_insert on public.store_members;
create policy store_members_insert on public.store_members
  for insert to narua_app
  with check ((select private.has_store_role(store_id, 'dono')));

drop policy if exists store_members_delete on public.store_members;
create policy store_members_delete on public.store_members
  for delete to narua_app
  using ((select private.has_store_role(store_id, 'dono')));
