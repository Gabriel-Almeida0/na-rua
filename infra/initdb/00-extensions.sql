-- Extensões usadas pelo Na Rua.
-- pgtap: suíte de testes de RLS (ADR-0009). Roda só em dev/CI.
create extension if not exists pgcrypto;
create extension if not exists pgtap;

-- Schema privado: funções de apoio que NUNCA são expostas pela API.
create schema if not exists private;

-- Papel da aplicação. É com ele que o Fastify conecta.
-- Não é superuser e não é owner das tabelas, para que FORCE ROW LEVEL SECURITY
-- não possa ser contornado por bypass de owner (ADR-0006).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'narua_app') then
    create role narua_app login password 'narua_app_dev';
  end if;
end
$$;

grant usage on schema public to narua_app;

-- Ordenação de nomes de freguês em português, sem depender do locale do cluster.
-- ICU vem compilado no postgres:17.
do $$
begin
  if not exists (select 1 from pg_collation where collname = 'pt_br') then
    create collation pt_br (provider = icu, locale = 'pt-BR');
  end if;
end
$$;
