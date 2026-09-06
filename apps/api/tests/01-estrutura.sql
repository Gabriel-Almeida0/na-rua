-- =============================================================================
-- 01 · Estrutura
--
-- Testes de catálogo: o que precisa estar ligado no banco, independentemente de
-- qualquer dado. É a rede que pega a regressão silenciosa — a tabela nova que
-- nasce sem RLS, a view nova que nasce sem security_invoker (ADR-0010).
--
-- Roda como o papel dono (narua). Nenhum dado é semeado.
-- =============================================================================
begin;
select plan(30);

-- -----------------------------------------------------------------------------
-- As seis tabelas do domínio existem.
-- (account, session, user e verification são do better-auth e não entram aqui.)
-- -----------------------------------------------------------------------------
select has_table('public', 'stores',              'tabela stores existe');
select has_table('public', 'store_members',       'tabela store_members existe');
select has_table('public', 'customers',           'tabela customers existe');
select has_table('public', 'accounts',            'tabela accounts existe');
select has_table('public', 'ledger_transactions', 'tabela ledger_transactions existe');
select has_table('public', 'ledger_entries',      'tabela ledger_entries existe');

-- -----------------------------------------------------------------------------
-- Toda tabela do domínio tem RLS habilitada E forçada.
--
-- FORCE é o que impede o bypass de owner: migrações e jobs rodam como dono, e
-- sem FORCE o dono ignoraria toda policy (ADR-0006, camada 3).
-- -----------------------------------------------------------------------------
select is_empty(
  $$
  select t.nome
  from (values ('stores'),('store_members'),('customers'),
               ('accounts'),('ledger_transactions'),('ledger_entries')) as t(nome)
  join pg_class c on c.relname = t.nome
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
  where not c.relrowsecurity
  $$,
  'toda tabela do domínio tem ROW LEVEL SECURITY habilitada'
);

select is_empty(
  $$
  select t.nome
  from (values ('stores'),('store_members'),('customers'),
               ('accounts'),('ledger_transactions'),('ledger_entries')) as t(nome)
  join pg_class c on c.relname = t.nome
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
  where not c.relforcerowsecurity
  $$,
  'toda tabela do domínio tem FORCE ROW LEVEL SECURITY'
);

-- Toda tabela do domínio tem store_id (ou é a própria store). Invariante I5.
select is_empty(
  $$
  select t.nome
  from (values ('store_members'),('customers'),
               ('accounts'),('ledger_transactions'),('ledger_entries')) as t(nome)
  where not exists (
    select 1 from information_schema.columns col
    where col.table_schema = 'public'
      and col.table_name = t.nome
      and col.column_name = 'store_id'
  )
  $$,
  'I5: toda tabela do domínio carrega store_id'
);

-- -----------------------------------------------------------------------------
-- Views expostas.
--
-- Este é o teste do footgun do ADR-0010: sem security_invoker o Postgres aplica
-- as policies do DONO da view e entrega todas as lojas para todo mundo, sem
-- erro e sem log. A checagem é sobre pg_class.reloptions.
-- -----------------------------------------------------------------------------
select has_view('public', 'v_saldos',       'view v_saldos existe');
select has_view('public', 'v_total_na_rua', 'view v_total_na_rua existe');

select is_empty(
  $$
  select c.relname
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'v'
    and c.relname like 'v\_%'
    and not coalesce(c.reloptions, '{}') @> array['security_invoker=on']
  $$,
  'ADR-0010: toda view exposta declara security_invoker = on'
);

-- -----------------------------------------------------------------------------
-- Grants do papel da aplicação (ADR-0006, camada 1: a API não tem o verbo).
-- -----------------------------------------------------------------------------
select ok(has_table_privilege('narua_app', 'public.ledger_entries', 'SELECT'),
          'narua_app lê ledger_entries');
select ok(has_table_privilege('narua_app', 'public.ledger_entries', 'INSERT'),
          'narua_app insere em ledger_entries');
select ok(not has_table_privilege('narua_app', 'public.ledger_entries', 'UPDATE'),
          'narua_app NÃO tem UPDATE em ledger_entries');
select ok(not has_table_privilege('narua_app', 'public.ledger_entries', 'DELETE'),
          'narua_app NÃO tem DELETE em ledger_entries');
select ok(not has_table_privilege('narua_app', 'public.ledger_transactions', 'UPDATE'),
          'narua_app NÃO tem UPDATE em ledger_transactions');
select ok(not has_table_privilege('narua_app', 'public.ledger_transactions', 'DELETE'),
          'narua_app NÃO tem DELETE em ledger_transactions');
select ok(has_table_privilege('narua_app', 'public.v_saldos', 'SELECT'),
          'narua_app lê v_saldos');
select ok(has_table_privilege('narua_app', 'public.v_total_na_rua', 'SELECT'),
          'narua_app lê v_total_na_rua');

-- -----------------------------------------------------------------------------
-- Triggers de imutabilidade (ADR-0006, camada 2).
-- Barram até quem tem privilégio: migração, script de correção, o dono.
-- -----------------------------------------------------------------------------
select ok(
  exists (select 1 from pg_trigger where tgname = 'tg_ledger_entries_imutavel' and not tgisinternal),
  'trigger tg_ledger_entries_imutavel existe'
);
select ok(
  exists (select 1 from pg_trigger where tgname = 'tg_ledger_tx_imutavel' and not tgisinternal),
  'trigger tg_ledger_tx_imutavel existe'
);

-- O trigger de entries cobre UPDATE e DELETE; o de transactions, só DELETE
-- (status pending → posted precisa de UPDATE pelo migrator).
select matches(
  pg_get_triggerdef((select oid from pg_trigger where tgname = 'tg_ledger_entries_imutavel')),
  'BEFORE DELETE OR UPDATE',
  'tg_ledger_entries_imutavel cobre UPDATE e DELETE'
);
select matches(
  pg_get_triggerdef((select oid from pg_trigger where tgname = 'tg_ledger_tx_imutavel')),
  'BEFORE DELETE',
  'tg_ledger_tx_imutavel cobre DELETE'
);

-- -----------------------------------------------------------------------------
-- Partida dobrada verificada no COMMIT.
-- DEFERRABLE INITIALLY DEFERRED não é detalhe: sem isso, o primeiro INSERT dos
-- dois lados da partida seria sempre reprovado.
-- -----------------------------------------------------------------------------
select ok(
  (select tgdeferrable from pg_trigger where tgname = 'tg_transacao_equilibrada'),
  'tg_transacao_equilibrada é DEFERRABLE'
);
select ok(
  (select tginitdeferred from pg_trigger where tgname = 'tg_transacao_equilibrada'),
  'tg_transacao_equilibrada é INITIALLY DEFERRED'
);

-- -----------------------------------------------------------------------------
-- Dinheiro em centavos, sempre bigint. Nunca float, nunca numeric de reais
-- (ADR-0005).
-- -----------------------------------------------------------------------------
select col_type_is('public', 'ledger_entries', 'valor_centavos', 'bigint',
                   'valor_centavos é bigint (centavos, ADR-0005)');
select col_type_is('public', 'customers', 'limite_centavos', 'bigint',
                   'limite_centavos é bigint');
select has_column('public', 'ledger_transactions', 'created_by',
                  'I10: ledger_transactions tem created_by');

-- -----------------------------------------------------------------------------
-- O contexto de identidade. Sem app.user_id, a função devolve NULL — é isso que
-- faz "nenhum contexto" significar "nenhuma linha".
-- -----------------------------------------------------------------------------
select is(private.current_user_id(), null, 'current_user_id() é NULL sem app.user_id');

select * from finish();
rollback;
