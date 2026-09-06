-- =============================================================================
-- 02 · Isolamento multi-tenant (RLS)
--
-- O teste mais importante da suíte. Prioridade 2 do orçamento de qualidade:
-- vazamento de dado de terceiro é incidente de LGPD, não bug de tela.
-- Cobre as invariantes I5 e I6.
--
-- Duas lojas, dois donos. Cada um só pode enxergar a própria caderneta em
-- customers, accounts, ledger_transactions, ledger_entries, v_saldos e
-- v_total_na_rua — e nas views é onde mora o footgun do ADR-0010.
--
-- A semeadura roda como narua (superusuário ignora RLS, inclusive FORCE).
-- Toda asserção roda como narua_app, o papel que a API usa de verdade.
-- =============================================================================
begin;
select plan(29);

-- --- semeadura -------------------------------------------------------------
insert into public.stores (id, nome) values
  ('t2_loja_a', 'Mercearia da Ana'),
  ('t2_loja_b', 'Bar do Bento');

insert into public.store_members (store_id, user_id, role) values
  ('t2_loja_a', 't2_u_ana',   'dono'),
  ('t2_loja_b', 't2_u_bento', 'dono');

insert into public.customers (id, store_id, nome, created_by) values
  ('t2_c_a1', 't2_loja_a', 'Dona Marlene', 't2_u_ana'),
  ('t2_c_a2', 't2_loja_a', 'Seu Raimundo', 't2_u_ana'),
  ('t2_c_b1', 't2_loja_b', 'Dona Nice',    't2_u_bento');

insert into public.accounts (id, store_id, kind, customer_id, debit_normal) values
  ('t2_ac_a1',    't2_loja_a', 'receivable', 't2_c_a1', true),
  ('t2_ac_a2',    't2_loja_a', 'receivable', 't2_c_a2', true),
  ('t2_ac_a_rev', 't2_loja_a', 'revenue',    null,      false),
  ('t2_ac_b1',    't2_loja_b', 'receivable', 't2_c_b1', true),
  ('t2_ac_b_rev', 't2_loja_b', 'revenue',    null,      false);

insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by) values
  ('t2_tx_a1', 't2_loja_a', 'fiado', current_date, 't2_u_ana'),
  ('t2_tx_a2', 't2_loja_a', 'fiado', current_date, 't2_u_ana'),
  ('t2_tx_b1', 't2_loja_b', 'fiado', current_date, 't2_u_bento');

insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t2_e_a1d', 't2_tx_a1', 't2_loja_a', 't2_ac_a1',    'debito',  5000),
  ('t2_e_a1c', 't2_tx_a1', 't2_loja_a', 't2_ac_a_rev', 'credito', 5000),
  ('t2_e_a2d', 't2_tx_a2', 't2_loja_a', 't2_ac_a2',    'debito',  2500),
  ('t2_e_a2c', 't2_tx_a2', 't2_loja_a', 't2_ac_a_rev', 'credito', 2500),
  ('t2_e_b1d', 't2_tx_b1', 't2_loja_b', 't2_ac_b1',    'debito',  3000),
  ('t2_e_b1c', 't2_tx_b1', 't2_loja_b', 't2_ac_b_rev', 'credito', 3000);

-- ---------------------------------------------------------------------------
-- 1. Sem app.user_id definido: NADA é visível.
--    Nenhum SET LOCAL aconteceu ainda neste arquivo — é o cenário real de uma
--    conexão que escapou do middleware do Fastify.
-- ---------------------------------------------------------------------------
set role narua_app;

select is_empty($$select id   from public.stores$$,              'sem contexto: stores vazia');
select is_empty($$select user_id from public.store_members$$,    'sem contexto: store_members vazia');
select is_empty($$select id   from public.customers$$,           'sem contexto: customers vazia');
select is_empty($$select id   from public.accounts$$,            'sem contexto: accounts vazia');
select is_empty($$select id   from public.ledger_transactions$$, 'sem contexto: ledger_transactions vazia');
select is_empty($$select id   from public.ledger_entries$$,      'sem contexto: ledger_entries vazia');
select is_empty($$select store_id from public.v_saldos$$,        'sem contexto: v_saldos vazia');
select is_empty($$select store_id from public.v_total_na_rua$$,  'sem contexto: v_total_na_rua vazia');

-- ---------------------------------------------------------------------------
-- 2. app.user_id apontando para alguém que não existe: idem.
-- ---------------------------------------------------------------------------
set local app.user_id = 't2_u_fantasma';

select is_empty(
  $$
  select 'customers'::text            as relacao, id       from public.customers
  union all select 'accounts',                     id       from public.accounts
  union all select 'ledger_transactions',          id       from public.ledger_transactions
  union all select 'ledger_entries',               id       from public.ledger_entries
  union all select 'stores',                       id       from public.stores
  union all select 'v_saldos',                     store_id from public.v_saldos
  union all select 'v_total_na_rua',               store_id from public.v_total_na_rua
  $$,
  'usuário inexistente não enxerga nada em nenhuma relação'
);

-- ---------------------------------------------------------------------------
-- 3. Ana (dona da loja A) enxerga a loja A inteira e só ela.
-- ---------------------------------------------------------------------------
set local app.user_id = 't2_u_ana';

select results_eq(
  $$select id from public.stores order by id$$,
  $$values ('t2_loja_a'::text)$$,
  'Ana vê só a própria loja em stores'
);
select results_eq(
  $$select id from public.customers order by id$$,
  $$values ('t2_c_a1'::text), ('t2_c_a2')$$,
  'Ana vê só os fregueses da loja dela em customers'
);
select results_eq(
  $$select id from public.accounts order by id$$,
  $$values ('t2_ac_a1'::text), ('t2_ac_a2'), ('t2_ac_a_rev')$$,
  'Ana vê só as contas da loja dela em accounts'
);
select results_eq(
  $$select id from public.ledger_transactions order by id$$,
  $$values ('t2_tx_a1'::text), ('t2_tx_a2')$$,
  'Ana vê só as transações da loja dela em ledger_transactions'
);
select results_eq(
  $$select id from public.ledger_entries order by id$$,
  $$values ('t2_e_a1c'::text), ('t2_e_a1d'), ('t2_e_a2c'), ('t2_e_a2d')$$,
  'I6: Ana vê só os lançamentos da loja dela em ledger_entries'
);
select results_eq(
  $$select user_id from public.store_members order by user_id$$,
  $$values ('t2_u_ana'::text)$$,
  'Ana vê só a equipe da loja dela em store_members'
);

-- As views. Sem security_invoker = on, os dois testes abaixo passariam a
-- devolver a loja do Bento junto — em silêncio (ADR-0010).
select results_eq(
  $$select store_id, customer_id, saldo_centavos from public.v_saldos order by customer_id$$,
  $$values ('t2_loja_a'::text, 't2_c_a1'::text, 5000::bigint),
           ('t2_loja_a',       't2_c_a2',       2500::bigint)$$,
  'ADR-0010: v_saldos respeita a RLS de quem consulta'
);
select results_eq(
  $$select store_id, total_centavos, pessoas_devendo from public.v_total_na_rua$$,
  $$values ('t2_loja_a'::text, 7500::bigint, 2::bigint)$$,
  'ADR-0010: v_total_na_rua respeita a RLS de quem consulta'
);

-- ---------------------------------------------------------------------------
-- 4. Bento (dono da loja B) enxerga o espelho disso, e nada da loja A.
-- ---------------------------------------------------------------------------
set local app.user_id = 't2_u_bento';

select results_eq(
  $$select id from public.customers order by id$$,
  $$values ('t2_c_b1'::text)$$,
  'Bento vê só os fregueses da loja dele em customers'
);
select results_eq(
  $$select id from public.accounts order by id$$,
  $$values ('t2_ac_b1'::text), ('t2_ac_b_rev')$$,
  'Bento vê só as contas da loja dele em accounts'
);
select results_eq(
  $$select id from public.ledger_transactions order by id$$,
  $$values ('t2_tx_b1'::text)$$,
  'Bento vê só as transações da loja dele em ledger_transactions'
);
select results_eq(
  $$select id from public.ledger_entries order by id$$,
  $$values ('t2_e_b1c'::text), ('t2_e_b1d')$$,
  'I6: Bento vê só os lançamentos da loja dele em ledger_entries'
);
select results_eq(
  $$select store_id, customer_id, saldo_centavos from public.v_saldos$$,
  $$values ('t2_loja_b'::text, 't2_c_b1'::text, 3000::bigint)$$,
  'ADR-0010: v_saldos não vaza a loja A para o Bento'
);
select results_eq(
  $$select store_id, total_centavos, pessoas_devendo from public.v_total_na_rua$$,
  $$values ('t2_loja_b'::text, 3000::bigint, 1::bigint)$$,
  'ADR-0010: v_total_na_rua não vaza a loja A para o Bento'
);

-- ---------------------------------------------------------------------------
-- 5. Escrita em loja alheia. Não é filtro silencioso: é erro 42501.
-- ---------------------------------------------------------------------------
set local app.user_id = 't2_u_ana';

select throws_ok(
  $$insert into public.customers (id, store_id, nome, created_by)
    values ('t2_c_invasor', 't2_loja_b', 'Cliente plantado', 't2_u_ana')$$,
  '42501', null,
  'Ana não insere freguês na loja do Bento'
);
select throws_ok(
  $$insert into public.accounts (id, store_id, kind, customer_id, debit_normal)
    values ('t2_ac_invasor', 't2_loja_b', 'revenue', null, false)$$,
  '42501', null,
  'Ana não insere conta na loja do Bento'
);
select throws_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t2_tx_invasor', 't2_loja_b', 'fiado', current_date, 't2_u_ana')$$,
  '42501', null,
  'Ana não insere transação na loja do Bento'
);
select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t2_e_invasor', 't2_tx_b1', 't2_loja_b', 't2_ac_b1', 'debito', 1)$$,
  '42501', null,
  'I6: Ana não insere lançamento na loja do Bento'
);

-- UPDATE e DELETE em loja alheia não erram: a RLS filtra a linha antes.
-- O efeito é o que importa — a linha do Bento continua intacta.
update public.customers set nome = 'Renomeada pela Ana' where id = 't2_c_b1';
delete from public.customers where id = 't2_c_b1';

reset role;

select is(
  (select nome from public.customers where id = 't2_c_b1'),
  'Dona Nice',
  'UPDATE de loja alheia não altera nada (a RLS filtra antes)'
);
select is(
  (select count(*) from public.customers where id = 't2_c_b1'),
  1::bigint,
  'DELETE de loja alheia não apaga nada (a RLS filtra antes)'
);

select * from finish();
rollback;
