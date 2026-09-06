-- =============================================================================
-- 03 · Papéis dentro da loja
--
-- A hierarquia é balconista < gerente < dono, e o enum store_role foi criado
-- nessa ordem justamente para o operador >= de private.has_store_role.
--
-- O papel NÃO mora no JWT (ADR-0008): mora em store_members. A consequência
-- prática, e o teste mais importante deste arquivo, é que revogar acesso é
-- instantâneo — não espera token expirar.
-- =============================================================================
begin;
select plan(17);

-- --- semeadura -------------------------------------------------------------
insert into public.stores (id, nome) values ('t3_loja', 'Mercearia da Esquina');

insert into public.store_members (store_id, user_id, role) values
  ('t3_loja', 't3_u_dono', 'dono'),
  ('t3_loja', 't3_u_ger',  'gerente'),
  ('t3_u_inexistente_guard_placeholder_removido' is null and false
    or true, 't3_u_bal', 'balconista');

select * from finish();
rollback;
