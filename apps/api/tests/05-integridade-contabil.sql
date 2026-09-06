-- =============================================================================
-- 05 · Integridade contábil
--
-- Prioridade 1 do orçamento de qualidade: dinheiro errado é prejuízo real do
-- lojista. Cobre as invariantes I1, I2, I4 e I7.
--
--   I1  Σ débitos = Σ créditos, em toda transação
--   I2  valor_centavos > 0, sempre — a direção carrega o sinal
--   I4  saldo(freguês) == Σ lançamentos(freguês), sem exceção
--   I7  multa ≤ 2% (200bp) e juros ≤ 12% a.a. (1200bp)
--
-- Sobre a partida dobrada: a constraint é DEFERRABLE INITIALLY DEFERRED, então
-- ela só dispararia no COMMIT — e este arquivo termina em ROLLBACK de
-- propósito, para não deixar resíduo. SET CONSTRAINTS ALL IMMEDIATE força a
-- verificação diferida a rodar naquele ponto: é exatamente o que aconteceria
-- no COMMIT, só que observável de dentro da transação.
-- =============================================================================
begin;
select plan(23);

-- --- semeadura -------------------------------------------------------------
insert into public.stores (id, nome) values ('t5_loja', 'Mercadinho da Marlene');
insert into public.store_members (store_id, user_id, role) values
  ('t5_loja', 't5_u_dono', 'dono');
insert into public.customers (id, store_id, nome, created_by) values
  ('t5_c1', 't5_loja', 'Dona Marlene', 't5_u_dono'),
  ('t5_c2', 't5_loja', 'Seu Raimundo', 't5_u_dono');
insert into public.accounts (id, store_id, kind, customer_id, debit_normal) values
  ('t5_ac_c1',   't5_loja', 'receivable', 't5_c1', true),
  ('t5_ac_c2',   't5_loja', 'receivable', 't5_c2', true),
  ('t5_ac_cash', 't5_loja', 'cash',       null,    true),
  ('t5_ac_rev',  't5_loja', 'revenue',    null,    false);

-- ---------------------------------------------------------------------------
-- I7 · Tetos legais moram no schema, não só na tela.
-- Multa máxima de 2% é o CDC art. 52 §1º; 12% a.a. é o limite jurisprudencial
-- para crediário de varejo.
-- ---------------------------------------------------------------------------
select throws_ok(
  $$insert into public.stores (id, nome, multa_bp) values ('t5_x1', 'Fora do teto', 201)$$,
  '23514', null,
  'I7: multa de 201bp (2,01%) é recusada'
);
select lives_ok(
  $$insert into public.stores (id, nome, multa_bp) values ('t5_x2', 'No teto', 200)$$,
  'I7: multa de 200bp (2%) exata é aceita'
);
select throws_ok(
  $$insert into public.stores (id, nome, juros_aa_bp) values ('t5_x3', 'Agiota', 1201)$$,
  '23514', null,
  'I7: juros de 1201bp (12,01% a.a.) são recusados'
);
select lives_ok(
  $$insert into public.stores (id, nome, juros_aa_bp) values ('t5_x4', 'No teto', 1200)$$,
  'I7: juros de 1200bp (12% a.a.) exatos são aceitos'
);
select throws_ok(
  $$insert into public.stores (id, nome, dia_vencimento_padrao) values ('t5_x5', 'Mês de 32 dias', 32)$$,
  '23514', null,
  'dia de vencimento fora de 1..31 é recusado'
);

-- ---------------------------------------------------------------------------
-- Regra 2.3 · Fiado é registro de fato ocorrido. Data futura não existe.
-- ---------------------------------------------------------------------------
select throws_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t5_tx_futuro', 't5_loja', 'fiado', current_date + 1, 't5_u_dono')$$,
  '23514', null,
  'transação com data futura é recusada'
);
select lives_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t5_tx_retro', 't5_loja', 'fiado', current_date - 30, 't5_u_dono')$$,
  'transação retroativa é aceita (regra 2.2)'
);

-- ---------------------------------------------------------------------------
-- I2 · Todo lançamento tem valor estritamente positivo. O sinal está na
-- direção (débito/crédito), nunca no número (ADR-0005).
-- ---------------------------------------------------------------------------
select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t5_e_zero', 't5_tx_retro', 't5_loja', 't5_ac_c1', 'debito', 0)$$,
  '23514', null,
  'I2: lançamento de valor zero é recusado'
);
select throws_ok(
  $$insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
    values ('t5_e_neg', 't5_tx_retro', 't5_loja', 't5_ac_c1', 'debito', -100)$$,
  '23514', null,
  'I2: lançamento de valor negativo é recusado'
);
select throws_ok(
  $$insert into public.customers (id, store_id, nome, limite_centavos, created_by)
    values ('t5_c_lim', 't5_loja', 'Limite zero', 0, 't5_u_dono')$$,
  '23514', null,
  'limite de crédito zerado é recusado (ou é nulo, ou é positivo)'
);

-- A conta a receber sem freguês (e a conta interna com freguês) não existem.
select throws_ok(
  $$insert into public.accounts (id, store_id, kind, customer_id, debit_normal)
    values ('t5_ac_orfa', 't5_loja', 'receivable', null, true)$$,
  '23514', null,
  'conta a receber sem freguês é recusada'
);
select throws_ok(
  $$insert into public.accounts (id, store_id, kind, customer_id, debit_normal)
    values ('t5_ac_confusa', 't5_loja', 'cash', 't5_c1', true)$$,
  '23514', null,
  'conta de caixa com freguês é recusada'
);

-- ---------------------------------------------------------------------------
-- I1 · Partida dobrada. Uma transação com um lado só é recusada quando a
-- verificação diferida roda — no COMMIT, aqui forçado com SET CONSTRAINTS.
-- ---------------------------------------------------------------------------
savepoint sp_desequilibrio;

insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
  values ('t5_tx_torto', 't5_loja', 'fiado', current_date, 't5_u_dono');
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos)
  values ('t5_e_torto', 't5_tx_torto', 't5_loja', 't5_ac_c1', 'debito', 1000);

select throws_ok(
  $$set constraints all immediate$$,
  'P0001', null,
  'I1: transação com um lado só é recusada na verificação do COMMIT'
);
select throws_like(
  $$set constraints all immediate$$,
  '%Partida dobrada violada%',
  'I1: a mensagem nomeia a partida dobrada e mostra os dois lados'
);

rollback to savepoint sp_desequilibrio;

-- Débitos e créditos que não batem, mesmo com dois lados, também caem.
savepoint sp_desequilibrio2;
insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
  values ('t5_tx_torto2', 't5_loja', 'fiado', current_date, 't5_u_dono');
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t5_e_torto2d', 't5_tx_torto2', 't5_loja', 't5_ac_c1',  'debito',  1000),
  ('t5_e_torto2c', 't5_tx_torto2', 't5_loja', 't5_ac_rev', 'credito',  999);
select throws_ok(
  $$set constraints all immediate$$,
  'P0001', null,
  'I1: um centavo de diferença já reprova a transação'
);
rollback to savepoint sp_desequilibrio2;

select lives_ok(
  $$set constraints all immediate$$,
  'depois do rollback ao savepoint, não sobra pendência quebrada'
);

-- ---------------------------------------------------------------------------
-- Movimento de verdade, feito pelo papel da aplicação.
--   c1: fiado de R$ 50,00 e pagamento parcial de R$ 20,00  -> saldo  R$ 30,00
--   c2: fiado de R$ 30,00 e pagamento de R$ 80,00          -> saldo -R$ 50,00
-- ---------------------------------------------------------------------------
set role narua_app;
set local app.user_id = 't5_u_dono';

insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by) values
  ('t5_tx_f1', 't5_loja', 'fiado',     current_date, 't5_u_dono'),
  ('t5_tx_f2', 't5_loja', 'fiado',     current_date, 't5_u_dono'),
  ('t5_tx_p1', 't5_loja', 'pagamento', current_date, 't5_u_dono');
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t5_e_f1d', 't5_tx_f1', 't5_loja', 't5_ac_c1',   'debito',  5000),
  ('t5_e_f1c', 't5_tx_f1', 't5_loja', 't5_ac_rev',  'credito', 5000),
  ('t5_e_f2d', 't5_tx_f2', 't5_loja', 't5_ac_c2',   'debito',  3000),
  ('t5_e_f2c', 't5_tx_f2', 't5_loja', 't5_ac_rev',  'credito', 3000),
  ('t5_e_p1d', 't5_tx_p1', 't5_loja', 't5_ac_cash', 'debito',  2000),
  ('t5_e_p1c', 't5_tx_p1', 't5_loja', 't5_ac_c1',   'credito', 2000);

select lives_ok($$set constraints all immediate$$,
  'I1: fiados e pagamento fecham em partida dobrada');

select is(
  (select saldo_centavos from public.v_saldos where customer_id = 't5_c1'),
  3000::bigint,
  'regra 1.6: pagamento parcial abate o saldo'
);

-- ---------------------------------------------------------------------------
-- Regra 1.8 · Pagamento maior que a dívida gera crédito a favor do freguês.
-- Saldo negativo é resultado esperado, NUNCA erro.
-- ---------------------------------------------------------------------------
select lives_ok(
  $$insert into public.ledger_transactions (id, store_id, kind, ocorrido_em, created_by)
    values ('t5_tx_p2', 't5_loja', 'pagamento', current_date, 't5_u_dono')$$,
  'regra 1.8: pagamento maior que a dívida é aceito (abre a transação)'
);
insert into public.ledger_entries (id, transaction_id, store_id, account_id, direcao, valor_centavos) values
  ('t5_e_p2d', 't5_tx_p2', 't5_loja', 't5_ac_cash', 'debito',  8000),
  ('t5_e_p2c', 't5_tx_p2', 't5_loja', 't5_ac_c2',   'credito', 8000);
select lives_ok($$set constraints all immediate$$,
  'regra 1.8: o pagamento a maior não viola nenhuma constraint');
select is(
  (select saldo_centavos from public.v_saldos where customer_id = 't5_c2'),
  (-5000)::bigint,
  'regra 1.8: sobra R$ 50,00 de crédito a favor do freguês (saldo negativo)'
);

-- ---------------------------------------------------------------------------
-- I4 · O saldo é derivado, nunca armazenado. A view tem que bater, centavo a
-- centavo, com a soma direta dos lançamentos.
-- ---------------------------------------------------------------------------
select results_eq(
  $$select customer_id, saldo_centavos
      from public.v_saldos
     where store_id = 't5_loja'
     order by customer_id$$,
  $$select a.customer_id,
           sum(case e.direcao when 'debito' then e.valor_centavos
                              else -e.valor_centavos end)::bigint
      from public.ledger_entries e
      join public.accounts a on a.id = e.account_id
     where a.kind = 'receivable' and e.store_id = 't5_loja'
     group by a.customer_id
     order by a.customer_id$$,
  'I4: v_saldos bate exatamente com a soma dos lançamentos'
);

-- Regra 1.7 · "Tá na rua" soma só os saldos positivos. O crédito do Raimundo
-- não pode entrar abatendo o total que a loja tem a receber.
select results_eq(
  $$select total_centavos, pessoas_devendo from public.v_total_na_rua where store_id = 't5_loja'$$,
  $$values (3000::bigint, 1::bigint)$$,
  'regra 1.7: v_total_na_rua soma só saldo positivo e conta só quem deve'
);

reset role;
select * from finish();
rollback;
