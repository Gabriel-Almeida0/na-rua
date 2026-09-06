<h1 align="center">Na Rua</h1>

<p align="center">
  <strong>Fiado digital para o comércio de bairro.</strong><br>
  A caderneta que não some — e que cobra por você, sem você precisar brigar com o freguês.
</p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-fatia%20vertical%20funcionando-1B5E20">
  <img alt="licença" src="https://img.shields.io/badge/licen%C3%A7a-MIT-1B5E20">
  <img alt="docs" src="https://img.shields.io/badge/documentos-45-C62828">
  <img alt="adrs" src="https://img.shields.io/badge/ADRs-34-B45309">
</p>

---

> **Estado do projeto:** a fatia vertical de "anotar fiado" está **funcionando de ponta a ponta** — PWA offline, API e Postgres com isolamento por RLS. A documentação que veio antes do código continua aqui: pesquisa de mercado, pesquisa de UX, análise regulatória e 34 ADRs. Cada decisão tem fonte citada, e cada lacuna está marcada como lacuna.

## Rodando

```bash
corepack enable                 # pnpm vem do campo packageManager
pnpm install
pnpm db:up                      # Postgres 17 + pgTAP no Docker
pnpm db:migrate
pnpm dev                        # API em :3333, PWA em :3000
```

Verificação completa:

```bash
pnpm verificar                  # typecheck + testes + pgTAP + build com orçamento
pnpm e2e                        # fluxo de ponta a ponta contra o banco real
```

| Camada | O que roda | Estado |
|---|---|---|
| Domínio | 44 testes em Vitest | verde |
| Banco | 127 asserções pgTAP: RLS, papéis, append-only, invariantes | verde |
| API | 24 verificações de ponta a ponta contra o Postgres | verde |
| PWA | offline, outbox e sincronização verificados no navegador | verde |
| Orçamento | 168,8 KB de JS na primeira carga, teto de 170 KB | verde, com 1,2 KB de folga |

## O problema

**42% dos MEIs brasileiros vendem fiado de forma informal. 86% deles já tiveram problema para receber.** Metade anota em caderno de papel. O fiado responde por **38% das vendas** de um minimercado.

E o fiado está sendo abandonado em capitais — não porque o lojista não quer, mas porque **ele não consegue mais controlar o risco**.

> *"Não temos mais condições de manter. Era muito prejuízo."* — dono de mercadinho, Fortaleza

## O concorrente não é outro app. É o caderno.

Existem 20+ apps de fiado na Play Store brasileira. Três concentram ~1,08 milhão de instalações; **todo o resto soma menos de 50 mil**. Nenhum é operado por empresa com time identificável.

Coletamos e analisamos **620+ avaliações reais** de 6 apps, em 3 países. O padrão é inequívoco:

> 🔴 **Perda de dados é a causa nº 1 de desinstalação no Brasil, na Índia e na Indonésia.**

> *"Registrei minhas vendas de setembro, fui abrir hoje o App, infelizmente perdi todo meu controle de vendas. **Minha sorte que registro no caderno.**"*

O caderno tem uma vantagem decisiva: **ele não apaga sozinho.** Um app que apaga é objetivamente pior que papel.

Isso reordenou o produto inteiro: **durabilidade do dado antes de qualquer feature.**

## O que o Na Rua faz

| | |
|---|---|
| 📝 | **Anota o fiado em 3 toques, em menos de 8 segundos** — porque escrever "Maria — 18,50" no caderno leva 6 |
| 💰 | **Mostra quanto tem "na rua"** em zero toques. É a tela inicial |
| 📴 | **Funciona sem internet**, com a mesma confirmação visual do modo online |
| 💬 | **Prepara a cobrança no WhatsApp** em 3 tons, com Pix e valor exato — e **o lojista aperta enviar** |
| 🔗 | **Link público** para o cliente ver a própria conta, sem instalar nada e sem login |
| 🛡️ | **Nada é deletado.** Ledger append-only, correção por estorno, auditoria por construção |

### O que ele nunca vai fazer

Não vira ERP. Não emite nota fiscal. Não custodia dinheiro. Não antecipa recebível. Não negativa ninguém. Não cruza bases entre lojas. Não exibe anúncio. **E não manda cobrança sozinho.**

Cada uma dessas ausências tem [uma ADR explicando por quê](docs/05-adr/).

---

## A tese técnica

> **Sincronize eventos, nunca estado. Derive o saldo, nunca o transmita.**

Um **ledger append-only com partidas dobradas** e **eventos idempotentes de ID gerado no cliente** resolve, com um único mecanismo, três problemas que normalmente exigem três soluções:

| Problema | Como o ledger resolve |
|---|---|
| **Integridade contábil** | Nada é atualizado ou deletado; Σ débitos = Σ créditos é verificado no commit |
| **Auditoria** | `created_by` na própria linha do lançamento — transacional e consultável |
| **Sincronização offline** | Merge vira **união de conjuntos**: comutativo, associativo, idempotente |

E é por isso que o projeto **não precisa de sync engine** — num segmento que está se consolidando por aquisição (Triplit→Supabase, Instant→OpenAI, Electric→Databricks).

### Por que não CRDT no dinheiro

Saldo 100, limite 120. Balconista A lança +50 offline; balconista B lança +40 offline.

| Modelo | Resultado | Problema |
|---|---|---|
| LWW no campo `saldo` | 150 **ou** 140 | 🔴 **Uma compra evaporou** — e o sistema convergiu sem acusar erro |
| PN-Counter CRDT | 190 ✅ | Correto, mas o limite foi violado e nenhuma réplica tinha como impedir |
| **Ledger append-only** | 190 ✅ | Correto **por construção** |

CRDTs garantem convergência. **Não garantem invariantes.** A solução certa é, ela própria, um CRDT — um *grow-only set* de eventos. Você sincroniza os **fatos**, nunca o **saldo**.

---

## Documentação

### 📍 Comece por aqui
| | |
|---|---|
| [O problema](docs/00-visao/01-problema.md) | Os dados, o comportamento real e por que ninguém resolveu ainda |
| [Proposta de valor](docs/00-visao/02-proposta-de-valor.md) | Posicionamento, as três teses e o que o produto nunca será |
| [Ficha técnica](docs/07-portfolio/ficha-tecnica.md) | Resumo do projeto e os pontos para uma conversa técnica |

### 🔍 Pesquisa
| | |
|---|---|
| [Pesquisa de mercado](docs/01-pesquisa/00-pesquisa-de-mercado.md) | 26 apps catalogados, 620+ reviews, análise financeira de Khatabook / OkCredit / BukuWarung |
| [Análise competitiva](docs/01-pesquisa/03-analise-competitiva.md) | O mapa do mercado e os padrões de desinstalação |
| [Personas](docs/01-pesquisa/01-personas.md) · [Jobs to be Done](docs/01-pesquisa/02-jobs-to-be-done.md) | Quem usa e o que ele contrata o produto para fazer |

### 🎨 UX
| | |
|---|---|
| [Pesquisa de UX](docs/02-ux/00-pesquisa-ux.md) | Google NBU, NN/g, WCAG, e reviews verbatim dos concorrentes |
| [Princípios de design](docs/02-ux/01-principios-de-design.md) | 12 princípios, cada um com a fonte que o sustenta |
| [Fluxos críticos](docs/02-ux/02-fluxos-criticos.md) | 8 fluxos com wireframe e critério de aceite mensurável |
| [Microcopy](docs/02-ux/03-microcopy.md) · [Design system](docs/02-ux/04-design-system.md) | Catálogo de strings e tokens |

### 📦 Produto
| | |
|---|---|
| [Features e priorização](docs/03-produto/01-features-e-priorizacao.md) · [Regras de negócio](docs/03-produto/02-regras-de-negocio.md) | Escopo e as invariantes de domínio |
| [Roadmap](docs/03-produto/03-roadmap.md) · [Métricas](docs/03-produto/04-metricas.md) · [Modelo de negócio](docs/03-produto/05-modelo-de-negocio.md) | Fases com portão de saída, e a economia sem otimismo |

### 🏗 Arquitetura
| | |
|---|---|
| [Pesquisa técnica](docs/04-arquitetura/00-pesquisa-tecnica.md) | ~90 buscas, versões verificadas em fonte primária |
| [Visão geral (C4)](docs/04-arquitetura/01-visao-geral-c4.md) | Contexto, contêineres, componentes |
| [Modelo de dados](docs/04-arquitetura/02-modelo-de-dados.md) | ERD e DDL completo |
| [Ledger e integridade](docs/04-arquitetura/03-ledger-e-integridade.md) | Partidas dobradas, imutabilidade, e por que CRDT não serve |
| [Sincronização offline](docs/04-arquitetura/04-sincronizacao-offline.md) | Outbox, idempotência, e por que IndexedDB não é durável |
| [Segurança e multi-tenancy](docs/04-arquitetura/05-seguranca-e-multi-tenancy.md) | RLS, papéis, e as 9 armadilhas que vazam dados |
| [Integrações](docs/04-arquitetura/06-integracoes.md) · [Qualidade](docs/04-arquitetura/07-qualidade-e-observabilidade.md) | Pix, WhatsApp, testes e orçamento de performance |

### ⚖️ Decisões e conformidade
| | |
|---|---|
| **[34 ADRs](docs/05-adr/)** | Cada decisão com contexto, alternativas rejeitadas e consequências |
| [Pesquisa regulatória](docs/06-compliance/00-pesquisa-regulatoria.md) | LGPD, CDC, BCB, Meta — com texto literal de lei |
| [Requisitos de conformidade](docs/06-compliance/01-requisitos-de-conformidade.md) | O que o software DEVE e NÃO DEVE fazer |

---

## Stack

```
Front / PWA     Next.js 16.3 · React 19.2 · TypeScript · Tailwind CSS 4
                Serwist 9.5 (next-pwa está morto desde 2022)
Estado local    Dexie 4.4 (IndexedDB) + outbox próprio · ULID no cliente
API             Fastify 5.12 · Better Auth 1.7.2
Banco           PostgreSQL 17 auto-hospedado · shared schema + store_id + RLS
ORM             Drizzle 0.45.2 — linha estável, não os RCs do v1
Validação       Zod 4 (o único com i18n oficial em pt-BR)
Testes          Vitest 4 · pgTAP · Playwright
Runtime         Node 22 · pnpm 12
Integrações     Pix direto na chave do lojista · WhatsApp via wa.me
```

Por que Vitest 4 e não 5, por que pnpm e não npm, e por que o `better-auth`
está fixado numa versão exata: [DECISOES-DE-DEPENDENCIA.md](DECISOES-DE-DEPENDENCIA.md).

**Orçamento de performance:** JS ≤ 170 KB comprimido · INP ≤ 200 ms · LCP ≤ 2,5 s · **0 KB de fonte web**
**Custo de infraestrutura:** R$ 0 na fase de portfólio

---

## Método

Toda decisão neste repositório é rastreável até uma fonte. As pesquisas usaram coleta primária — reviews da Google Play, texto literal de lei do Planalto, `registry.npmjs.org` e a API do GitHub para versões, páginas oficiais para preços.

**E as lacunas estão marcadas como lacunas:**

| Marca | Significado |
|---|---|
| `[E]` | Evidência verificada na fonte citada |
| `[E-2]` | Evidência de segunda mão |
| `[H]` | **Hipótese a validar** — com indicação de como validar |
| `[NE]` | **Não encontrado** — busquei e não achei |

Cinco lacunas exigem pesquisa de campo antes da primeira linha de código, e estão registradas na [Fase 0 do roadmap](docs/03-produto/03-roadmap.md). Nenhuma estatística foi estimada sem rótulo explícito de estimativa.

---

## Licença

[MIT](LICENSE) · © 2026 Gabriel Almeida
