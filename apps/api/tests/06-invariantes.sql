-- =============================================================================
-- 06 · Invariantes de rastreabilidade e de tenant (I3, I5, I10)
--
--   I3   nenhuma linha do ledger jamais sofreu UPDATE ou DELETE
--   I5   todo lançamento pertence a exatamente um tenant
--   I10  todo lançamento tem created_by preenchido
--
-- HISTÓRICO: quatro destes testes nasceram marcados como TODO, descrevendo um
-- buraco real — ledger_entries tinha FKs simples para accounts e para
-- ledger_transactions, e como a checagem de integridade referencial do Postgres
-- ignora RLS, a loja A conseguia gravar lançamento contra a conta da loja B.
-- O schema foi corrigido com FKs COMPOSTAS incluindo store_id, e os marcadores
-- de TODO foram removidos: agora estes testes protegem contra a regressão.
-- =============================================================================
begin;
select plan(12);

-- --- semeadura: duas lojas, dois donos --------------------------------------
insert into public.stores (id, nome) values
  ('t6_loja_a', 'Loja A'),
  ('t6_loja_b', 'Loja B');
insert into public.store_members (store_id, user_id, role) values
  ('t6_loja_a', 't6_u_a', 'dono'),
  ('t6_loja_b', 't6_u_b', 'dono');
insert into public.customers (id, store_id, nome, created_by) values
  ('t6_c_a', 't6_loja_a', 'Freguês da A', 't6_u_a'),
  ('t6_c_b', 't6_loja_b', 'Freguês da B', 't6_u_b');
insert into public.accounts (id, store_id, kind, customer_id, debit_normal) values
  ('t6_ac_a',     't6_loja_a', 'receivable', 't6_c_a', true),
  ('t6_ac_a_rev', 't6_loja_a', 'revenue',    null,     false),
  ('t6_ac_b',     't6_loja_b', 'receivable', 't6_c_b', true),
  ('t6_ac_b_rev', 't6_loja_b', 'revenue',    null,     false);
insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by) values
  ('t6_tx_a', 't6_loja_a', 'fiado', current_date, 't6_u_a'),
  ('t6_tx_b', 't6_loja_b', 'fiado', current_date, 't6_u_b');

-- ---------------------------------------------------------------------------
-- I10 · Rastreabilidade. Todo registro sabe quem o criou — é o que transforma
-- o ledger em trilha de auditoria (ADR-0011).
-- ---------------------------------------------------------------------------
select throws_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t6_tx_anonima', 't6_loja_a', 'fiado', current_date, null)$$,
  '23502', null,
  'I10: transação sem created_by é recusada'
);
select throws_ok(
  $$insert into public.customers (id, store_id, nome, created_by)
    values ('t6_c_anonimo', 't6_loja_a', 'Sem autor', null)$$,
  '23502', null,
  'I10: freguês sem created_by é recusado'
);
select is_empty(
  $$select id from public.ledger_transactions where created_by is null$$,
  'I10: nenhuma transação no banco está sem autor'
);

-- ---------------------------------------------------------------------------
-- I5 · Todo lançamento pertence a exatamente um tenant. store_id é NOT NULL
-- em toda tabela do domínio.
-- ---------------------------------------------------------------------------
select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t6_e_sem_loja', 't6_tx_a', null, 't6_ac_a', 'debito', 100)$$,
  '23502', null,
  'I5: lançamento sem store_id é recusado'
);
select is_empty(
  $$
  select t.nome
  from (values ('store_members'),('customers'),('accounts'),
               ('ledger_transactions'),('ledger_entries')) as t(nome)
  join information_schema.columns col
    on col.table_schema = 'public'
   and col.table_name   = t.nome
   and col.column_name  = 'store_id'
  where col.is_nullable = 'YES'
  $$,
  'I5: store_id é NOT NULL em toda tabela do domínio'
);

-- ---------------------------------------------------------------------------
-- I3 · Append-only também no catálogo: não existe policy de UPDATE nem de
-- DELETE nas tabelas do ledger. Se alguém criar uma, este teste denuncia antes
-- de a API ganhar o verbo.
-- ---------------------------------------------------------------------------
select is_empty(
  $$select policyname from pg_policies
     where schemaname = 'public'
       and tablename in ('ledger_transactions', 'ledger_entries')
       and cmd in ('UPDATE', 'DELETE')$$,
  'I3: nenhuma policy de UPDATE ou DELETE no ledger'
);

-- ---------------------------------------------------------------------------
-- I5 · A parte que o schema ainda não garante.
--
-- ledger_entries.store_id e ledger_entries.account_id são checados por FKs
-- independentes: uma aponta para stores, a outra para accounts. Nada obriga
-- que accounts.store_id seja igual a ledger_entries.store_id. E as checagens
-- de integridade referencial do Postgres ignoram RLS por definição, então a
-- policy de INSERT — que só olha store_id — não fecha essa porta.
--
-- Resultado: a loja A consegue lançar contra uma conta da loja B. O valor não
-- aparece no saldo de ninguém (a RLS derruba o join dos dois lados), mas fica
-- gravado e contamina qualquer leitura privilegiada. Falta uma FK composta
-- (store_id, account_id) — ou um trigger equivalente.
--
-- O mesmo vale para transaction_id.
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't6_u_a';

select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t6_e_conta_alheia', 't6_tx_a', 't6_loja_a', 't6_ac_b', 'debito', 100)$$,
  '23503', null,
  'I5: lançar contra conta de outra loja deveria ser recusado'
);

select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t6_e_tx_alheia', 't6_tx_b', 't6_loja_a', 't6_ac_a', 'debito', 100)$$,
  '23503', null,
  'I5: lançar dentro de transação de outra loja deveria ser recusado'
);

reset role;

-- Medida no dado: nenhuma linha cruzada pode existir.
select is_empty(
  $$select e.id
      from public.ledger_entries e
      join public.accounts a on a.id = e.account_id
     where a.store_id <> e.store_id$$,
  'I5: todo lançamento e a conta que ele movimenta são da mesma loja'
);
select is_empty(
  $$select v.store_id, v.customer_id
      from public.v_saldos v
      join public.customers c on c.id = v.customer_id
     where c.store_id <> v.store_id$$,
  'I5: v_saldos nunca mistura o freguês de uma loja com o store_id de outra'
);

-- ---------------------------------------------------------------------------
-- O que continua valendo: a loja A não vê nada disso, e a loja B também não.
-- O isolamento de leitura sobrevive ao buraco — o dano é de integridade, não
-- de vazamento.
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't6_u_b';
select is_empty(
  $$select id from public.ledger_entries where store_id = 't6_loja_a'$$,
  'mesmo com o lançamento cruzado, a loja B não enxerga lançamento da loja A'
);
set local app.user_id = 't6_u_a';
select is_empty(
  $$select id from public.accounts where store_id = 't6_loja_b'$$,
  'mesmo com o lançamento cruzado, a loja A não enxerga conta da loja B'
);
reset role;

select * from finish();
rollback;
