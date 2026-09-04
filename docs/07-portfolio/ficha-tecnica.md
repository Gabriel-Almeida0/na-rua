# Ficha técnica — para o portfólio

> Conteúdo pronto para publicação. Versões curta, média e longa, mais os pontos que sustentam uma conversa técnica.

---

## Versão curta (card de projeto)

**Na Rua** — micro-SaaS de fiado digital para o comércio de bairro brasileiro.

Caderneta offline-first para mercadinho, açougue e padaria: anota a venda a prazo em 3 toques, mostra quanto o lojista tem "na rua", e prepara a cobrança por WhatsApp sem constranger o freguês.

`Next.js 16` `React 19` `TypeScript` `Tailwind 4` `PWA` `Supabase` `PostgreSQL` `Drizzle` `Dexie`

**Destaque técnico:** ledger contábil append-only com partidas dobradas e eventos idempotentes de ID gerado no cliente — o que torna a sincronização offline uma união de conjuntos **sem conflito possível**.

---

## Versão média (página do projeto)

### O problema
42% dos MEIs brasileiros vendem fiado de forma informal, e **86% deles já tiveram problema para receber** (Sebrae/BCB). Metade anota em caderno de papel. O fiado responde por **38% das vendas** de um minimercado — e vem sendo abandonado em capitais por prejuízo acumulado.

O concorrente não é outro app. É o caderno. E o caderno tem uma vantagem decisiva: **ele não apaga sozinho.**

### A descoberta que definiu o produto
Coletei e analisei **620+ avaliações reais** da Google Play de 6 apps concorrentes — Brasil, Índia e Indonésia. **Perda de dados é a causa nº 1 de desinstalação nos três países.**

> *"Registrei minhas vendas de setembro, fui abrir hoje o App, infelizmente perdi todo meu controle de vendas. **Minha sorte que registro no caderno.**"*

Um app que apaga é objetivamente pior que papel — e o lojista sabe, por isso mantém o caderno em paralelo. Isso reordenou todo o orçamento de engenharia: **durabilidade do dado antes de qualquer feature.**

### As decisões que sustentam o projeto

**Ledger append-only com partidas dobradas.** Nada é atualizado ou deletado; correção é contra-lançamento; o saldo é sempre derivado da soma dos lançamentos, nunca uma coluna mutável. Forçado em **três camadas independentes** — grants, trigger e `FORCE ROW LEVEL SECURITY` — porque uma camada sozinha sempre falha: grants não param o `service_role`, trigger não para quem desabilita triggers, e RLS é ignorada pelo owner da tabela.

**Sincronização sem conflito, por construção.** O ID do lançamento é um ULID gerado no dispositivo antes de qualquer chamada de rede; o servidor faz `ON CONFLICT (id) DO NOTHING`. Como o ledger é append-only, o merge é **união de conjuntos** — comutativo, associativo, idempotente. Dois balconistas offline lançando para o mesmo cliente não conflitam: os dois lançamentos entram e somam.

**Por que não CRDT no dinheiro.** CRDTs garantem convergência, mas **não garantem invariantes**. Com LWW num campo `saldo`, dois lançamentos offline de +50 e +40 sobre 100 convergem para 150 *ou* 140 — uma compra evapora, e o sistema não acusa erro nenhum. A solução correta é, ela própria, um CRDT: um *grow-only set* de eventos. Você sincroniza os **fatos**, nunca o **saldo**.

**Multi-tenancy com RLS, e a armadilha do JWT.** O papel (`dono` / `gerente` / `balconista`) vem da tabela de membership, **não de claim no token** — porque claims só atualizam no refresh, e o dono demitir o balconista às 14h não pode significar acesso válido até o token expirar. As policies seguem seis regras obrigatórias; o benchmark oficial mostra **178.000 ms → 12 ms** só por envolver a função em `(select …)`.

**Restrições de cobrança como produto.** Não existe envio automático de cobrança — nem escondido em configurações. Três razões independentes: **legal** (CDC art. 71 é crime), **relacional** (o lojista prefere absorver R$ 100 a romper com quem ele encontra na rua) e **de negócio** (se o freguês some, ele desinstala e conta para os vizinhos). O app prepara a mensagem; o humano envia.

### O que o projeto entrega
Documentação completa: pesquisa de mercado com coleta primária, pesquisa de UX baseada em evidência, análise regulatória (LGPD, CDC, BCB, Meta), arquitetura em C4, modelo de dados com DDL, e **29 ADRs** com alternativas rejeitadas.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Front / PWA | Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind CSS 4 |
| Service worker | Serwist 9.5 (`next-pwa` está morto desde 2022) |
| Estado local | Dexie 4.4 (IndexedDB) + outbox próprio · ULID gerado no cliente |
| Backend | Supabase (PostgreSQL 17) · shared schema + `tenant_id` + RLS |
| ORM | Drizzle 0.45.2 — linha estável, não os RCs do v1 |
| Validação | Zod 4 (o único com i18n oficial em pt-BR) |
| Testes | Vitest 5 · Playwright · **pgTAP para RLS** · Testcontainers |
| CI | GitHub Actions · Lighthouse CI com orçamento como assertion |
| Observabilidade | Sentry · PostHog (session replay) · Axiom |
| Integrações | Pix direto na chave do lojista · WhatsApp via `wa.me` |

**Orçamento de performance:** JS ≤ 170 KB comprimido na primeira carga · INP ≤ 200 ms · LCP ≤ 2,5 s · **0 KB de fonte web**.

**Custo de infraestrutura:** R$ 0 na fase de portfólio.

---

## Os cinco pontos para uma conversa técnica

**1. "Por que ledger append-only numa caderneta de bairro?"**
Porque resolve três problemas com um mecanismo: integridade contábil, auditoria e sincronização offline. E é o que torna desnecessário adotar um sync engine — num segmento que está se consolidando por aquisição (Triplit→Supabase, Instant→OpenAI, Electric→Databricks). Um dev solo com horizonte de anos não amarra a integridade contábil a uma startup.

**2. "Por que não usou PowerSync ou Zero?"**
Porque o ledger já elimina 95% do que eles resolvem — não há conflito a resolver, só uma fila com deduplicação. E nenhum free tier serve: PowerSync desativa após 1 semana de inatividade, Dexie Cloud permite 3 usuários de produção. A porta de saída existe e está documentada: se a fila virar gargalo **medido**, migra-se para PowerSync.

**3. "Como você garante que a loja A não vê os dados da loja B?"**
No banco, não no código. RLS com `FORCE ROW LEVEL SECURITY`, `TO authenticated`, funções envolvidas em `(select …)` e índice em toda coluna de policy — mais suíte pgTAP rodando em todo push. E toda view exposta declara `security_invoker = on`: sem isso, o Postgres aplica as policies do **owner** da view, e como views no Supabase são criadas pelo `postgres`, a view entregaria todos os tenants **silenciosamente**.

**4. "Qual foi a decisão mais difícil?"**
Recusar o envio automático de cobrança — a feature mais óbvia do produto. Três razões independentes convergiram, e a de negócio é a menos intuitiva: nesse mercado o boca a boca é o canal de aquisição, então um envio automático mal recebido não perde um cliente, perde a rua inteira.

**5. "O que você deixou de fazer de propósito?"**
Hexagonal completa, Clean Architecture, CQRS, Event Sourcing, repository sobre o ORM, monorepo. O benefício dessas camadas é de **colaboração entre times** — não existe com um dev. A complexidade real está em dinheiro, isolamento multi-tenant e duas fontes de verdade. Camada gasta em outra coisa é camada roubada dessas três.

---

## O que este projeto demonstra

| Competência | Evidência no repositório |
|---|---|
| **Pesquisa de produto com dado primário** | 620+ reviews coletados e classificados; análise financeira de 3 concorrentes internacionais |
| **UX baseada em evidência** | Princípios derivados de Google NBU, NN/g e WCAG — incluindo achados contraintuitivos (densidade > respiro) |
| **Modelagem financeira correta** | Partidas dobradas, imutabilidade, estorno por contra-lançamento, valores em centavos |
| **Sistemas distribuídos** | Análise formal de por que CRDT não garante invariantes, e o desenho que torna o conflito impossível |
| **Segurança de banco** | RLS multi-tenant com as 9 armadilhas documentadas e testes pgTAP |
| **Compliance como requisito** | LGPD, CDC, BCB e políticas da Meta traduzidos em requisitos verificáveis |
| **Julgamento de engenharia** | 29 ADRs com alternativas rejeitadas — inclusive rejeitar padrões populares |
| **Honestidade técnica** | Lacunas marcadas como lacunas; hipóteses marcadas como hipóteses; nenhum dado sem fonte |

---

## Sugestão de tags para o portfólio

`Next.js` · `React` · `TypeScript` · `PostgreSQL` · `Supabase` · `PWA` · `Offline-first` · `Arquitetura` · `Fintech` · `LGPD`
