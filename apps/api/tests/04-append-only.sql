-- =============================================================================
-- 04 · Append-only (ADR-0001, ADR-0006)
--
-- Invariante I3: nenhuma linha do ledger jamais sofreu UPDATE ou DELETE.
-- Correção é contra-lançamento (ADR-0004), nunca edição.
--
-- São três camadas, e este arquivo testa duas delas separadamente, porque cada
-- uma pega um invasor diferente:
--
--   camada 1 · GRANT   — protege contra a API. narua_app não tem o verbo.
--                        Erro: 42501, permission denied.
--   camada 2 · TRIGGER — protege contra quem TEM o verbo: migração, script de
--                        correção às 3h da manhã, o dono da tabela.
--                        Erro: P0001, levantado por private.deny_mutation().
--
-- Rodar só como narua_app daria falsa segurança: o teste passaria mesmo se o
-- trigger fosse derrubado. Por isso a segunda metade roda como narua.
-- =============================================================================
begin;
select plan(16);

-- --- semeadura -------------------------------------------------------------
insert into public.stores (id, nome) values ('t4_loja', 'Bar do Zé');
insert into public.store_members (store_id, user_id, role) values
  ('t4_loja', 't4_u_ze', 'dono');
insert into public.customers (id, store_id, nome, created_by) values
  ('t4_c1', 't4_loja', 'Freguês', 't4_u_ze');
insert into public.accounts (id, store_id, kind, customer_id, debit_normal) values
  ('t4_ac_rec', 't4_loja', 'receivable', 't4_c1', true),
  ('t4_ac_rev', 't4_loja', 'revenue',    null,   false);
insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by) values
  ('t4_tx', 't4_loja', 'fiado', current_date, 't4_u_ze');
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t4_e_d', 't4_tx', 't4_loja', 't4_ac_rec', 'debito',  9900),
  ('t4_e_c', 't4_tx', 't4_loja', 't4_ac_rev', 'credito', 9900);

-- ---------------------------------------------------------------------------
-- Camada 1 · o papel da aplicação simplesmente não tem o verbo.
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't4_u_ze';

select throws_ok(
  $$update public.ledger_entries set valor_centavos = 1 where id = 't4_e_d'$$,
  '42501', null,
  'camada 1: UPDATE em ledger_entries é negado pelo GRANT'
);
select throws_ok(
  $$delete from public.ledger_entries where id = 't4_e_d'$$,
  '42501', null,
  'camada 1: DELETE em ledger_entries é negado pelo GRANT'
);
select throws_ok(
  $$delete from public.ledger_transactions where id = 't4_tx'$$,
  '42501', null,
  'camada 1: DELETE em ledger_transactions é negado pelo GRANT'
);
select throws_ok(
  $$update public.ledger_transactions set descricao = 'reescrita' where id = 't4_tx'$$,
  '42501', null,
  'camada 1: UPDATE em ledger_transactions é negado pelo GRANT'
);
-- TRUNCATE também não, senão a proteção seria contornável por um verbo só.
select throws_ok(
  $$truncate public.ledger_entries$$,
  '42501', null,
  'camada 1: TRUNCATE em ledger_entries é negado pelo GRANT'
);

reset role;

-- ---------------------------------------------------------------------------
-- Camada 2 · como narua, dono das tabelas. Aqui o GRANT não protege nada —
-- o dono tem todos os verbos. Quem barra é o trigger.
-- ---------------------------------------------------------------------------
select throws_ok(
  $$update public.ledger_entries set valor_centavos = 1 where id = 't4_e_d'$$,
  'P0001', null,
  'camada 2: UPDATE em ledger_entries é barrado pelo TRIGGER, mesmo para o dono'
);
select throws_ok(
  $$delete from public.ledger_entries where id = 't4_e_d'$$,
  'P0001', null,
  'camada 2: DELETE em ledger_entries é barrado pelo TRIGGER, mesmo para o dono'
);
select throws_ok(
  $$delete from public.ledger_transactions where id = 't4_tx'$$,
  'P0001', null,
  'camada 2: DELETE em ledger_transactions é barrado pelo TRIGGER, mesmo para o dono'
);

-- A mensagem do trigger ensina o caminho certo: contra-lançamento (ADR-0004).
-- Usa throws_like para não quebrar com ajuste de redação.
select throws_like(
  $$update public.ledger_entries set valor_centavos = 1 where id = 't4_e_d'$$,
  '%append-only%',
  'a mensagem do trigger diz que o ledger é append-only'
);
select throws_like(
  $$delete from public.ledger_entries where id = 't4_e_d'$$,
  '%contra-lançamento%',
  'a mensagem do trigger aponta o contra-lançamento (ADR-0004)'
);

-- Um DELETE que não casa com nenhuma linha não dispara trigger de linha — logo,
-- o teste acima precisa mesmo casar com a linha para ter valor.
select is(
  (select count(*) from public.ledger_entries where id = 't4_e_d'),
  1::bigint,
  'I3: depois de todas as tentativas, o lançamento continua lá'
);
select is(
  (select valor_centavos from public.ledger_entries where id = 't4_e_d'),
  9900::bigint,
  'I3: e com o valor original, intacto'
);
select is(
  (select count(*) from public.ledger_transactions where id = 't4_tx'),
  1::bigint,
  'I3: a transação também continua lá'
);

-- ---------------------------------------------------------------------------
-- O caminho legítimo: corrigir por contra-lançamento. Nada é apagado; entra
-- uma transação de estorno que espelha a original.
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't4_u_ze';

insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, estorna_id, created_by)
  values ('t4_tx_estorno', 't4_loja', 'estorno', current_date, 't4_tx', 't4_u_ze');
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t4_e_est_c', 't4_tx_estorno', 't4_loja', 't4_ac_rec', 'credito', 9900),
  ('t4_e_est_d', 't4_tx_estorno', 't4_loja', 't4_ac_rev', 'debito',  9900);

select lives_ok($$set constraints all immediate$$,
  'o estorno fecha em partida dobrada');
select is(
  (select saldo_centavos from public.v_saldos where customer_id = 't4_c1'),
  0::bigint,
  'ADR-0004: o contra-lançamento zera o saldo sem apagar nada'
);
select is(
  (select count(*) from public.ledger_entries where store_id = 't4_loja'),
  4::bigint,
  'ADR-0004: os quatro lançamentos (original + estorno) continuam no ledger'
);

reset role;
select * from finish();
rollback;
