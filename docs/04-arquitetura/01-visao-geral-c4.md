# Visão geral da arquitetura (C4)

> Fundamentação completa em [pesquisa técnica](00-pesquisa-tecnica.md). Decisões individuais em [ADRs](../05-adr/).

## A tese arquitetural, em uma frase

> **Sincronize eventos, nunca estado. Derive o saldo, nunca o transmita.**

Um ledger append-only com IDs idempotentes gerados no cliente resolve, com um único mecanismo, três problemas que normalmente exigem três soluções: **integridade contábil**, **auditoria** e **sincronização offline sem conflito**.

É essa decisão que torna desnecessário adotar um sync engine de terceiros — num mercado que está se consolidando por aquisição (Triplit→Supabase, Instant→OpenAI, Electric→Databricks).

---

## Nível 1 — Contexto

```mermaid
graph TB
    lojista["👤 Lojista<br/>dono, gerente ou balconista<br/>Android de entrada, sinal instável"]
    cliente["👤 Cliente devedor<br/>não instala nada"]

    narua["<b>Na Rua</b><br/>PWA offline-first<br/>Caderneta de fiado + régua de cobrança"]

    wa["WhatsApp<br/>do próprio lojista"]
    banco["Banco do lojista<br/>chave Pix"]

    lojista -->|"anota fiado, recebe,<br/>prepara lembrete"| narua
    narua -->|"abre com o texto pronto<br/>(wa.me)"| wa
    wa -->|"o lojista envia<br/>com o dedo dele"| cliente
    narua -->|"link público da conta<br/>sem app, sem login"| cliente
    cliente -->|"Pix direto"| banco
    banco -.->|"o lojista dá baixa<br/>manualmente"| narua

    style narua fill:#0B5FFF,color:#fff
    style banco fill:#E8F5E9
```

**Duas ausências deliberadas neste diagrama:**

1. **O dinheiro nunca passa pelo Na Rua.** O Pix vai direto do cliente para a chave do lojista. Isso mantém o produto fora do enquadramento como instituição de pagamento (Resolução BCB nº 80/2021).
2. **Nenhuma seta automática do Na Rua para o cliente.** Toda comunicação passa pelo WhatsApp do lojista, com ele apertando enviar. É trava de produto, não limitação técnica.

---

## Nível 2 — Contêineres

```mermaid
graph TB
    subgraph dispositivo["📱 Dispositivo do lojista"]
        pwa["<b>PWA</b><br/>Next.js 16 · React 19 · Tailwind 4<br/>RSC + Server Actions"]
        sw["<b>Service Worker</b><br/>Serwist 9.5<br/>shell + assets offline"]
        idb[("<b>IndexedDB</b><br/>Dexie 4.4<br/>ledger local + outbox")]
    end

    subgraph nuvem["☁️ Nuvem"]
        app["<b>Next.js runtime</b><br/>Vercel<br/>RSC, Server Actions, rota /sync"]
        pg[("<b>PostgreSQL 17</b><br/>Supabase<br/>ledger + RLS multi-tenant")]
        auth["<b>Supabase Auth</b><br/>sessão e identidade"]
        pub["<b>Página pública</b><br/>conta do cliente<br/>estática, &lt; 50 KB"]
    end

    obs["Sentry · PostHog · Axiom"]
    bkp[("Backup próprio<br/>pg_dump diário")]

    pwa <--> idb
    sw --> pwa
    pwa -->|"lote de eventos<br/>idempotentes"| app
    app --> pg
    app --> auth
    pg --> pub
    pwa -.-> obs
    pg -.->|"cron diário"| bkp

    style idb fill:#FFF8E1
    style pg fill:#E8F5E9
    style bkp fill:#FFEBEE
```

### Por que cada peça

| Contêiner | Escolha | Alternativas rejeitadas | ADR |
|---|---|---|---|
| Service worker | **Serwist 9.5.12** | `next-pwa` (morto desde 2022), `@ducanh2912/next-pwa` (dormente, o autor manda migrar), SW manual | [0013](../05-adr/0013-service-worker-serwist.md) |
| Banco local + sync | **Dexie + outbox próprio** | PowerSync, Zero, Dexie Cloud, RxDB, ElectricSQL, Legend-State, WatermelonDB | [0003](../05-adr/0003-dexie-outbox-proprio.md) |
| Backend | **Supabase (Postgres 17)** | Neon, Convex, Firebase, Cloudflare D1+DO, Turso | [0012](../05-adr/0012-backend-supabase.md) |
| ORM | **Drizzle 0.45.2** | Prisma 8 (RC), Drizzle 1.0-rc, SQL puro | [0018](../05-adr/0018-orm-drizzle.md) |
| Renderização | **RSC + streaming** | SPA client-side "porque é PWA" | [0016](../05-adr/0016-rsc-nao-spa.md) |

> ⚠️ **Backup próprio é contêiner de primeira classe neste diagrama, não detalhe operacional.** O plano gratuito do Supabase **não tem backup nenhum**, e o produto guarda o dinheiro de terceiros. `pg_dump` diário desde o primeiro dia com dado real. Ver [ADR-0024](../05-adr/0024-backup-proprio.md).

---

## Nível 3 — Componentes internos do PWA

```mermaid
graph LR
    subgraph ui["Interface — vertical slices"]
        s1["app/caderneta/"]
        s2["app/clientes/"]
        s3["app/lembretes/"]
        s4["app/fechamento/"]
    end

    subgraph dominio["lib/dominio — funções puras"]
        d1["calcularSaldo()"]
        d2["Centavos"]
        d3["validarEncargos()"]
        d4["montarLembrete()"]
    end

    subgraph local["lib/local"]
        r1["repositorio Dexie"]
        r2["outbox"]
        r3["motor de sync"]
    end

    ui --> dominio
    ui --> local
    local --> dominio
    r2 --> r3
    r3 -->|"POST /sync"| srv["Server Action"]

    style dominio fill:#E8F5E9
```

**O núcleo de domínio é uma pasta, não quatro camadas.** Funções puras, sem I/O, sem React, sem Drizzle. Isso entrega o benefício real da arquitetura hexagonal — o domínio testável em isolamento — sem nenhuma interface, container de DI ou repositório genérico. Ver [ADR-0020](../05-adr/0020-vertical-slices.md).

---

## O fluxo que importa — anotar um fiado

```mermaid
sequenceDiagram
    participant L as Lojista
    participant UI as PWA
    participant D as Dexie
    participant S as Server Action
    participant PG as Postgres

    L->>UI: "fiado de R$ 47,50 pra Dona Maria"
    UI->>UI: gera ULID no cliente
    UI->>D: grava lançamento + enfileira no outbox<br/>(mesma transação)
    D-->>UI: ok
    UI-->>L: ✓ "Anotado! Ela agora deve R$ 258,50"

    Note over L,UI: menos de 8 segundos.<br/>A rede ainda nem foi tocada.

    par Em segundo plano
        UI->>S: POST /sync — lote de eventos
        S->>PG: INSERT ... ON CONFLICT (id) DO NOTHING
        PG->>PG: RLS valida tenant e papel<br/>CHECK valida partida dobrada<br/>trigger bloqueia UPDATE/DELETE
        PG-->>S: confirmado
        S-->>UI: ids confirmados
        UI->>D: marca pending → posted
    end
```

**Três propriedades caem de graça:**

1. **A UI nunca espera a rede.** O lançamento está salvo antes de qualquer request.
2. **Reenvio é inofensivo.** Toque duplo, retry automático, sinal oscilando — tudo colapsa no mesmo ID.
3. **Dois balconistas offline não conflitam.** Ambos os lançamentos entram e somam. Ver [sincronização offline](04-sincronizacao-offline.md).

---

## As quatro restrições que moldaram tudo

| # | Restrição | Consequência arquitetural |
|---|---|---|
| 1 | **Perder dado é fatal** — causa nº 1 de desinstalação em 3 países | Ledger append-only forçado em **três camadas independentes**: grants, trigger e FORCE RLS |
| 2 | **A rede é indisponível com frequência**, e o Background Sync tem 78% de suporte e **zero no iOS** | Sync disparado pelo ciclo de vida do app (abertura, `visibilitychange`, evento `online`, retry) — nunca dependente de Background Sync |
| 3 | **É dinheiro de terceiros, num app feito por uma pessoa** | Isolamento garantido **no banco** (RLS), não no código de aplicação. Um `if` esquecido não pode vazar crédito de vizinho |
| 4 | **Android de entrada em 4G ruim** | RSC por padrão, orçamento de **≤ 170 KB de JS** na primeira carga, zero fonte web, `"use client"` só em folhas |

---

## O que foi deliberadamente rejeitado

| Rejeitado | Por quê |
|---|---|
| Hexagonal completo / Clean Architecture | O benefício é de **colaboração entre times**. Não existe com um dev. Todo custo, zero benefício |
| CQRS com barramento | Fowler é explícito: *"you should be very cautious about using CQRS"* em domínio CRUD |
| Event Sourcing "de verdade" | Ledger ≠ event sourcing. Ledger são **fatos de negócio** que já são a linguagem do domínio. Event sourcing é infraestrutura: versionamento de schema, projeções, replay |
| Repository genérico sobre Drizzle | O Drizzle já é a abstração sobre SQL. Envolvê-lo perde type-safety e não ganha nada |
| CRDT no dinheiro | Converge, mas **não garante invariantes**. Ver [ledger e integridade](03-ledger-e-integridade.md) |
| Sync engine de terceiros | O ledger elimina 95% do que ele resolve, e nenhum free tier serve |
| Monorepo / Turborepo | Um app, um deploy, um dev. É decoração |
| SPA client-side | SPAs geram ~1 soft navigation por hard navigation (RUM Archive). O JS extra não se paga |

> **O critério:** um revisor sênior pergunta duas coisas — *esse dev sabe onde está a complexidade real do domínio dele?* e *ele resistiu à tentação de aplicar padrão que não precisava?*
>
> A complexidade real está em três lugares: **dinheiro**, **isolamento multi-tenant** e **duas fontes de verdade**. Camada gasta em outra coisa é camada roubada dessas três.

---

## Custo de infraestrutura

| Fase | Custo/mês |
|---|---|
| Portfólio, sem faturar | **R$ 0** |
| A partir do primeiro cliente pagante | **~US$ 45** (Supabase Pro $25 + Vercel Pro $20) |

⚠️ A Vercel Hobby **proíbe uso comercial**, e a definição inclui pedir doações. Migrar para Pro é obrigatório **antes** do primeiro faturamento. Ver [ADR-0023](../05-adr/0023-vercel-pro-ao-faturar.md).
