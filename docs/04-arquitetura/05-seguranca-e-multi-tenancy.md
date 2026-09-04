# Segurança e multi-tenancy

> Fundamentação em [pesquisa técnica](00-pesquisa-tecnica.md) §4.

## O princípio

> **O isolamento é garantido no banco, não no código de aplicação.**

Fiado é dinheiro de terceiros, e o sistema é construído por uma pessoa sem revisor. Um `if` esquecido numa query não pode significar que o Seu João vê a caderneta do mercadinho do outro bairro.

RLS + `FORCE ROW LEVEL SECURITY` + `REVOKE UPDATE/DELETE` + trigger tornam o isolamento e a imutabilidade **invioláveis pelo próprio código de aplicação**. É exatamente essa garantia que Convex, Cloudflare e Turso jogam para o código do desenvolvedor — e o motivo pelo qual foram rejeitados.

---

## Estratégia: shared schema + `tenant_id` + RLS

| Critério | Shared schema + RLS | Schema-per-tenant | Database-per-tenant |
|---|---|---|---|
| Densidade de tenants | **100 mil a 1M+** | 1 mil a 10 mil | Baixa |
| Migrações | **Uma, atômica** | Fan-out por schema | Fan-out por database |
| Blast radius de bug | Todos os tenants | Um schema | Um tenant |
| Custo operacional (dev solo) | **Menor** | Médio | Maior |

**Por que shared schema aqui:** uma caderneta de bairro é **B2C disfarçado de B2B** — muitíssimos tenants pequenos, schema idêntico, dev solo, migrações frequentes. As outras opções multiplicam o custo de cada migração por N lojas.

> ⚠️ **Nota de honestidade:** o Citus/Microsoft recomenda row-based sharding para "larger volumes of small tenants (B2C)" e schema-based para "smaller numbers of large tenants (B2B)" — o que sustenta a escolha. O Neon recomenda o oposto (um projeto por usuário), mas **database-per-tenant é o produto deles** e o post não apresenta nenhum número de overhead. E o whitepaper silo/bridge/pool da AWS está marcado pela própria AWS como *"for historical reference only"*.

Ver [ADR-0007](../05-adr/0007-multi-tenancy-shared-schema.md).

---

## Papéis — e a armadilha do JWT

O guia oficial de RBAC do Supabase injeta o papel no JWT via Custom Access Token Hook. **Não fazemos isso.**

> 🔴 A doc é explícita: *"the auth hook will only modify the access token JWT but not the auth response"*. As claims valem apenas para o token corrente. **Mudar o papel de alguém só surte efeito depois do refresh do token.**

Traduzido para o domínio: **o dono demite o balconista às 14h e o JWT dele continua dizendo `balconista` até o token expirar.** Num app de dinheiro isso é inaceitável.

### A solução

`tenant_id` no JWT (não muda durante a sessão). **Papel lido da tabela de membership** a cada verificação.

```sql
create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id  uuid not null references auth.users(id)    on delete cascade,
  role     public.store_role not null,   -- 'balconista' | 'gerente' | 'dono'
  primary key (store_id, user_id)
);

-- Em schema NÃO exposto pela API
create or replace function private.has_store_role(
  _store uuid,
  _min   public.store_role
) returns boolean
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
      and m.user_id  = auth.uid()
      and m.role    >= _min          -- enum ordenado: balconista < gerente < dono
  );
end; $$;
```

Custa uma leitura indexada e dá **revogação instantânea**. Ver [ADR-0008](../05-adr/0008-papel-fora-do-jwt.md).

Três detalhes que **não** são cosméticos:
- `security definer` — evita avaliar a RLS da tabela de junção
- `set search_path = ''` — impede sequestro de resolução de nomes
- A função vive em `private`, schema não exposto pela API

---

## Policies

```sql
alter table public.ledger_entries enable row level security;
alter table public.ledger_entries force  row level security;

create policy ledger_read on public.ledger_entries
  for select
  to authenticated                                    -- (3)
  using ( (select private.has_store_role(store_id, 'balconista')) );   -- (1)

create policy ledger_insert on public.ledger_entries
  for insert
  to authenticated
  with check ( (select private.has_store_role(store_id, 'balconista')) );  -- (4)

-- UPDATE e DELETE não têm policy: o verbo foi revogado e o trigger bloqueia.
```

### As 6 regras de RLS — e os números que as justificam

Benchmarks oficiais da Supabase, tabela de 100 mil linhas:

| Otimização | Antes | Depois | Ganho |
|---|---|---|---|
| Índice na coluna da policy | 171 ms | **< 0,1 ms** | ~1.700× |
| `(select auth.uid())` em vez de `auth.uid()` | 179 ms | 9 ms | ~20× |
| **`(select has_role())` — security definer** | **178.000 ms** | **12 ms** | **~14.800×** |
| Inverter a direção do join | 9.000 ms | 20 ms | ~450× |
| `TO authenticated` | 170 ms | **< 0,1 ms** | ~1.700× |

> **178 segundos viram 12 milissegundos por causa de dois parênteses.** Isso não é micro-otimização — é a diferença entre o app existir e não existir num Android de entrada.

| # | Regra |
|---|---|
| 1 | **Envolva toda função em `(select …)`** — força um *initPlan*: uma execução por query, não por linha |
| 2 | **Indexe toda coluna usada na policy.** ⚠️ Uma coluna só conta como indexada quando é **a primeira** de um índice btree. PK composta indexa só a primeira |
| 3 | **Sempre `TO authenticated`** — oficial: *"Always add 'authenticated' to the approved roles instead of nothing or public"* |
| 4 | **`USING` e `WITH CHECK` sempre juntos.** `USING` sozinho permite **inserir** o que não se consegue ler — gravar fiado na loja alheia |
| 5 | **`SECURITY DEFINER` para tabelas de junção** |
| 6 | **Filtre explicitamente no cliente também.** A RLS é rede de segurança, não filtro primário |

Ver [ADR-0009](../05-adr/0009-regras-de-rls.md).

---

## As 9 armadilhas que vazam dados

Cada uma já vazou dado em produção em algum projeto. Todas viram item de checklist e teste.

| # | Armadilha | Consequência | Correção |
|---|---|---|---|
| 1 | **Tabela filha sem checagem de tenant** | `ledger_entries` protege por `store_id`, mas uma tabela de notas que só checa `entry_id` entrega dado alheio | `store_id` em **toda** tabela. Nunca confiar na policy do pai |
| 2 | 🔴 **View SECURITY DEFINER** | Doc oficial: *"by default, the row-level security policies of the view owner are applied"*. Views no Supabase são criadas pelo `postgres` → **entrega todos os tenants, silenciosamente** | `with (security_invoker = on)` em **toda** view |
| 3 | **Owner faz bypass** | *"Table owners normally bypass row security"* — migrações e jobs ignoram RLS | `FORCE ROW LEVEL SECURITY` |
| 4 | **`USING` sem `WITH CHECK`** | Insere o que não lê. `USING` suprime silenciosamente; `WITH CHECK` lança erro | Sempre os dois |
| 5 | **Múltiplas policies permissivas** | Combinam com **OR** e ampliam acesso | `AS RESTRICTIVE` para o isolamento de tenant |
| 6 | **UNIQUE global** | Vaza a existência de dado alheio pelo erro de duplicidade | `UNIQUE (store_id, lower(nome))` |
| 7 | 🔴 **FK e constraints fazem bypass** | Doc oficial: *"Referential integrity checks… always bypass row security… Care must be taken… to avoid 'covert channel' leaks"* | Nunca FK cruzando tenant |
| 8 | 🔴 **Grants padrão no schema `public`** | Tabelas criadas em `public` recebem SELECT/INSERT/UPDATE/DELETE para `anon` e `authenticated` **por padrão** | `REVOKE` **antes** de conceder o mínimo |
| 9 | **Pooling + `SET` de sessão** | `SET` em vez de `SET LOCAL` atrás de pooler em transaction mode **vaza o contexto de um tenant para a requisição de outro** | Sempre `SET LOCAL` |

### Detecção automática

Os **Database Advisors** do Supabase rodam o linter open-source **Splinter**, que detecta exatamente esses erros:

| Regra | O que pega |
|---|---|
| `0003_auth_rls_initplan` | Função não envolvida em `(select …)` |
| `0006_multiple_permissive_policies` | Policies permissivas somando acesso |
| `0010_security_definer_view` | View sem `security_invoker` |
| `0013_rls_disabled_in_public` | 🔴 *"anyone with your project URL can read, edit, and delete all data"* |

Rodar os Advisors é item do checklist de release.

---

## Testes de RLS — inegociável

O caminho oficial é **pgTAP + `supabase test db`**:

```sql
begin;
select plan(4);

select tests.rls_enabled('public');

-- Loja A não enxerga o ledger da loja B
select tests.authenticate_as('dono_a@teste.com');
select is_empty(
  $$ select 1 from ledger_entries where store_id = '<uuid-loja-b>' $$,
  'dono da loja A não vê lançamentos da loja B'
);

-- Balconista não vê o total da loja
select tests.authenticate_as('balconista_a@teste.com');
select is_empty(
  $$ select 1 from v_total_na_rua $$,
  'balconista não vê o total da loja'
);

-- Ninguém deleta do ledger
select throws_ok(
  $$ delete from ledger_entries where id = '<uuid>' $$,
  'ledger é append-only',
  'delete no ledger é bloqueado pelo trigger'
);

select * from finish();
rollback;
```

**Isto roda em todo push.** Repositório público = GitHub Actions grátis e ilimitado, então não há desculpa de custo.

`rlsautotest` (Apache-2.0, beta) lê as policies do catálogo do Postgres e gera a suíte cobrindo tabela × comando × identidade. Usar como **gerador do esqueleto**, não como garantia.

---

## Autenticação — a regra que vem da pesquisa de UX

> 🔴 **Perder o login nunca pode significar perder o caderno.**

Perda de acesso à conta é a **causa nº 2** de desinstalação nos três países analisados:

> *"ao inserir e-mail e senha, dava inválido... cliquei em 'esqueci minha senha', e apareceu e-mail inválido"*
> *"App fechou do nada e não aceita mais minha digital nem minha senha"*
> *"the Otp is not receiving"*

### Consequências arquiteturais

1. **O app funciona sem conta.** Login é opcional, oferecido **depois** do valor entregue — por exemplo no 10º lançamento, enquadrado como *"quer que eu guarde uma cópia?"*.
2. **A falta de autenticação nunca bloqueia a leitura dos dados locais.**
3. **Recuperação por número de telefone**, não por senha esquecida.
4. **Trocar de número é autoatendimento.**
5. MFA disponível para quem quiser, nunca obrigatório.

---

## LGPD na arquitetura

Ver [requisitos de conformidade](../06-compliance/01-requisitos-de-conformidade.md) para a lista completa. O que o schema e a infra precisam garantir:

| Obrigação | Implementação |
|---|---|
| **Minimização** (art. 6º III) | Só o nome é obrigatório. Colunas para RG, foto, renda e local de trabalho **não existem** |
| **Registro de operações** (art. 37) | `created_by` no lançamento + tabela `reminders`. Obrigatório porque o tratamento se baseia em legítimo interesse |
| **Eliminação** (art. 16 e 18) | Anonimização do cliente **preservando o ledger**. Job automatizado, não tarefa manual |
| **Portabilidade** (art. 18) | Exportação em CSV/JSON, a qualquer momento |
| **Segurança** (art. 46) | Criptografia em repouso e trânsito, RLS, MFA disponível |
| **Transferência internacional** (art. 33) | ⭐ **Com `wa.me`, nenhum dado pessoal do devedor sai para a API da Meta.** Isso elimina a Resolução ANPD 19/2024 do escopo do MVP inteiro |
| **Incidentes** (Res. 15/2024) | Runbook com comunicação à ANPD e aos titulares em **3 dias úteis** |

> ⭐ O ponto sobre `wa.me` merece destaque: uma decisão tomada por custo e por risco de banimento acabou **removendo uma camada regulatória inteira** do produto. Ver [integrações](06-integracoes.md).
