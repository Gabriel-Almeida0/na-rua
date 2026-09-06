-- =============================================================================
-- 03 · Papéis dentro da loja
--
-- A hierarquia é balconista < gerente < dono, e o enum store_role foi criado
-- nessa ordem justamente para o operador >= de private.has_store_role.
--
-- O papel NÃO mora no JWT (ADR-0008): mora em store_members. A consequência
-- prática — e o teste mais importante deste arquivo — é que revogar acesso é
-- instantâneo. Não espera token expirar.
-- =============================================================================
begin;
select plan(17);

-- --- semeadura -------------------------------------------------------------
insert into public.stores (id, nome) values ('t3_loja', 'Mercearia da Esquina');

insert into public.store_members (store_id, user_id, role) values
  ('t3_loja', 't3_u_dono', 'dono'),
  ('t3_loja', 't3_u_ger',  'gerente'),
  ('t3_loja', 't3_u_bal',  'balconista');

-- Freguês sem conta contábil: dá para apagar sem esbarrar na FK de accounts.
insert into public.customers (id, store_id, nome, created_by) values
  ('t3_c_ger',  't3_loja', 'Freguês do Gerente', 't3_u_dono'),
  ('t3_c_dono', 't3_loja', 'Freguês do Dono',    't3_u_dono'),
  ('t3_c_bal',  't3_loja', 'Freguês do Balcão',  't3_u_dono');

insert into public.accounts (id, store_id, kind, customer_id, debit_normal) values
  ('t3_ac_rec', 't3_loja', 'receivable', 't3_c_bal', true),
  ('t3_ac_rev', 't3_loja', 'revenue',    null,       false);

-- ---------------------------------------------------------------------------
-- 1. O balconista trabalha: anota freguês e anota fiado. É o dia a dia.
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't3_u_bal';

select lives_ok(
  $$insert into public.customers (id, store_id, nome, created_by)
    values ('t3_c_novo', 't3_loja', 'Dona Cícera', 't3_u_bal')$$,
  'balconista insere freguês'
);
select is(
  (select nome from public.customers where id = 't3_c_novo'),
  'Dona Cícera',
  'o freguês do balconista entrou mesmo'
);

select lives_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t3_tx_bal', 't3_loja', 'fiado', current_date, 't3_u_bal')$$,
  'balconista abre transação de fiado'
);
select lives_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t3_e_bal_d', 't3_tx_bal', 't3_loja', 't3_ac_rec', 'debito', 1250)$$,
  'balconista lança o débito'
);
select lives_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t3_e_bal_c', 't3_tx_bal', 't3_loja', 't3_ac_rev', 'credito', 1250)$$,
  'balconista lança o crédito'
);
-- Força a verificação diferida agora: se a partida não fechasse, quebrava aqui.
select lives_ok($$set constraints all immediate$$,
  'o lançamento do balconista fecha em partida dobrada');
select is(
  (select saldo_centavos from public.v_saldos where customer_id = 't3_c_bal'),
  1250::bigint,
  'o fiado do balconista aparece no saldo'
);

-- ---------------------------------------------------------------------------
-- 2. O balconista NÃO apaga freguês. A policy de DELETE exige gerente.
--    Não vira erro: a RLS filtra a linha e o DELETE apaga zero linhas. O que
--    se testa é o efeito, não a exceção.
-- ---------------------------------------------------------------------------
delete from public.customers where id = 't3_c_ger';
select is(
  (select count(*) from public.customers where id = 't3_c_ger'),
  1::bigint,
  'balconista NÃO apaga freguês'
);

-- O balconista também não mexe nos dados da loja (policy exige dono).
update public.stores set nome = 'Loja Renomeada pelo Balcão' where id = 't3_loja';
select is(
  (select nome from public.stores where id = 't3_loja'),
  'Mercearia da Esquina',
  'balconista NÃO altera os dados da loja'
);

-- ---------------------------------------------------------------------------
-- 3. O gerente apaga freguês; o dono também. O dono altera a loja, o gerente não.
-- ---------------------------------------------------------------------------
set local app.user_id = 't3_u_ger';

delete from public.customers where id = 't3_c_ger';
select is(
  (select count(*) from public.customers where id = 't3_c_ger'),
  0::bigint,
  'gerente apaga freguês'
);

update public.stores set nome = 'Loja Renomeada pelo Gerente' where id = 't3_loja';
select is(
  (select nome from public.stores where id = 't3_loja'),
  'Mercearia da Esquina',
  'gerente NÃO altera os dados da loja (policy exige dono)'
);

set local app.user_id = 't3_u_dono';

delete from public.customers where id = 't3_c_dono';
select is(
  (select count(*) from public.customers where id = 't3_c_dono'),
  0::bigint,
  'dono apaga freguês (o papel é hierárquico: dono >= gerente)'
);

update public.stores set chave_pix = 'pix@mercearia.com.br' where id = 't3_loja';
select is(
  (select chave_pix from public.stores where id = 't3_loja'),
  'pix@mercearia.com.br',
  'dono altera os dados da loja'
);

-- ---------------------------------------------------------------------------
-- 4. Revogação instantânea (ADR-0008).
--    O balconista é demitido no meio do expediente. Na transação seguinte ele
--    já não enxerga nada — sem esperar token expirar, sem cache para invalidar.
-- ---------------------------------------------------------------------------
set local app.user_id = 't3_u_bal';
select is(
  (select count(*) from public.customers where store_id = 't3_loja'),
  2::bigint,
  'antes da revogação, o balconista enxerga a caderneta'
);

reset role;
delete from public.store_members where store_id = 't3_loja' and user_id = 't3_u_bal';

set role narua_app;
select is_empty(
  $$select id from public.customers where store_id = 't3_loja'$$,
  'revogação instantânea: o acesso morre na mesma transação'
);
select is_empty(
  $$select store_id from public.v_saldos where store_id = 't3_loja'$$,
  'revogação instantânea: as views também fecham'
);
select throws_ok(
  $$insert into public.customers (id, store_id, nome, created_by)
    values ('t3_c_pos_revogacao', 't3_loja', 'Não deve entrar', 't3_u_bal')$$,
  '42501', null,
  'revogação instantânea: a escrita também morre'
);

reset role;
select * from finish();
rollback;
