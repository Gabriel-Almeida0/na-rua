-- Roda ANTES das migrations do drizzle-kit.
-- As policies referenciam private.has_store_role, então a função precisa existir
-- primeiro, senão o CREATE POLICY falha.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to narua_app;

-- Ordem do enum importa: balconista < gerente < dono, para o operador >=.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_role') then
    create type public.store_role as enum ('balconista', 'gerente', 'dono');
  end if;
end
$$;

-- O contexto do usuário vem de SET LOCAL app.user_id, feito pelo Fastify dentro
-- da transação. Equivale ao auth.uid() do Supabase.
-- `true` no segundo argumento faz retornar NULL em vez de erro quando não setado.
create or replace function private.current_user_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.user_id', true), '')
$$;

/*
  A função de autorização.

  plpgsql, não sql: o corpo só é validado na execução, então a função pode ser
  criada antes de public.store_members existir — e as policies, que dependem
  dela, são criadas na migration seguinte. plpgsql também nunca sofre inlining,
  o que preservaria o contexto de SECURITY DEFINER.

  SECURITY DEFINER para não avaliar a RLS da própria store_members ao checar
  permissão — sem isso, a policy chamaria a si mesma.

  search_path travado para impedir sequestro de resolução de nomes: sem isso,
  um schema no caminho poderia sombrear `public.store_members`.

  O chamador SEMPRE envolve em (select ...) — força um initPlan, uma execução
  por query em vez de uma por linha. No benchmark oficial da Supabase isso é a
  diferença entre 178 segundos e 12 milissegundos (ADR-0009).
*/
create or replace function private.has_store_role(
  _store text,
  _min   public.store_role
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.store_members m
    where m.store_id = _store
      and m.user_id  = private.current_user_id()
      and m.role    >= _min
  );
end;
$$;

revoke all on function private.has_store_role(text, public.store_role) from public;
grant execute on function private.has_store_role(text, public.store_role) to narua_app;
grant execute on function private.current_user_id() to narua_app;
