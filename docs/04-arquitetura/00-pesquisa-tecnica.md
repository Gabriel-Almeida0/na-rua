# Pesquisa Técnica de Arquitetura — Na Rua

> **Status:** pesquisa concluída · **Data:** 04/09/2026
> **Método:** ~90 buscas e fetches. Versões e datas de manutenção verificadas em fontes primárias (`registry.npmjs.org` e API do GitHub), não em blogs. Preços lidos nas páginas oficiais na data.
> Tudo que não foi confirmado em fonte primária está marcado **NÃO CONFIRMADO**.

---

## 0. Sumário executivo — as 9 decisões que importam

| # | Decisão | Resposta curta |
|---|---|---|
| 1 | Service worker | **Serwist 9.5.12** (22/07/2026). `next-pwa` morreu em 2022; `@ducanh2912/next-pwa` parou em 2024 e o próprio autor manda migrar para Serwist. A doc oficial do Next.js aponta para o Serwist e há exemplo **Turbopack** oficial. |
| 2 | Banco local + sync | **Dexie 4.4.5 + outbox próprio**, não sync engine de prateleira. Justificativa longa na §2.6. |
| 3 | Modelo de dados financeiro | **Ledger append-only, partidas dobradas, saldo derivado.** Nunca coluna `saldo` mutável, nunca CRDT no dinheiro. |
| 4 | Como o offline sincroniza | Replica **eventos idempotentes** com **ULID/UUIDv7 gerado no cliente** → `ON CONFLICT (id) DO NOTHING`. Conflito de saldo deixa de existir por construção. |
| 5 | Backend | **Supabase Free → Pro**, shared schema + `tenant_id` + RLS. |
| 6 | Papéis | `tenant_id` no JWT; **papel na tabela de membership** via `SECURITY DEFINER` (revogação instantânea). |
| 7 | ORM | **Drizzle 0.45.2** — não os RCs do v1. |
| 8 | Hospedagem | ⚠️ **Vercel Hobby proíbe uso comercial.** Isso muda o plano de custo. |
| 9 | Arquitetura | Vertical slices + domínio puro + ledger. **Rejeitar** hexagonal completo, Clean Architecture, CQRS e Event Sourcing "de verdade". |

---

## 1. PWA offline-first em Next.js 16

### 1.1 Qual biblioteca está viva — verificação primária

| Pacote | Última versão | Data de publicação (npm/GitHub API) | Veredito |
|---|---|---|---|
| `next-pwa` (shadowwalker) | 5.6.0 | **23/08/2022** | ☠️ **Morto há 4 anos** |
| `@ducanh2912/next-pwa` | 10.2.9 | ~2024 | ⚠️ **Dormente.** O README manda migrar para `@serwist/next` |
| **`serwist`** | **9.5.12** | **2026-07-22T06:11:57Z** | ✅ **Vivo** |
| **`@serwist/next`** | **9.5.12** | **2026-07-22** | ✅ **Vivo** |
| **`@serwist/turbopack`** | **9.5.12** | **2026-07-22T06:10:55Z** | ✅ **Existe e é publicado junto** |

Último commit na `main` do Serwist: **2026-07-22T06:07:41Z** (`chore(deps): monthly maintenance & bump TypeScript to 7.0`). Cadência de manutenção mensal, um mantenedor.

`@serwist/next@9.5.12` declara `peerDependencies`: `next: ">=14.0.0"`, `react: ">=18.0.0"`, `typescript: ">=5.0.0"`, `@serwist/cli: ^9.5.12`. Não há pin bloqueando o Next 16.

### 1.2 O que a doc oficial do Next.js diz (fonte [1])

O guia oficial de PWA do Next.js 16.3.4 (atualizado 30/07/2026) recomenda explicitamente:

> *"For full service-worker-based offline caching, one option is **Serwist**, which provides Next.js integration examples for both **Turbopack** and **webpack**."*

Confirmei via GitHub que os dois exemplos existem no repositório: `examples/next-turbo-basic` e `examples/next-basic`. **A afirmação que circula de que "Serwist não suporta Turbopack" está desatualizada** — havia um período em que era verdade, mas hoje existe pacote e exemplo oficiais.

### 1.3 A novidade do Next.js 16 que quase ninguém viu: `experimental.useOffline`

Fontes [2] e [3]. Isto é o seu requisito de produto virando feature de framework:

```ts
// next.config.ts
export default { experimental: { useOffline: true } }
```

Com a flag ligada, o Next.js:
- escuta os eventos `offline`/`online` do browser;
- **detecta falha de rede em navegação, prefetch e Server Actions**;
- entra em polling com `HEAD` na URL atual (header RSC), **abortado em 200 ms** — se ainda estiver pendente aos 200 ms, o handshake TCP funcionou e considera-se online;
- backoff **escalonado, não exponencial**: 500 ms → 1 s → 2 s → 3 s (teto);
- **nunca desiste** — segue a 3 s até reconectar ou a página descarregar;
- reexecuta o request bloqueado **uma vez** ao reconectar;
- expõe `useOffline()` de `next/offline` para UI ciente de conectividade.

O hook retorna `false` no servidor e antes da hidratação. **É experimental e a própria doc diz "not recommended for production"** — trate como complemento ao service worker, nunca como substituto. Mas para um projeto de portfólio é ouro: você usa uma feature de ponta e a doc te dá o mecanismo exato para explicar numa entrevista.

### 1.4 Instalabilidade, push e background sync — o que funciona de verdade

| Capacidade | Android/Chrome | iOS/Safari | Fonte |
|---|---|---|---|
| **Manifest + instalação** | ✅ Prompt automático se manifest válido + HTTPS | ⚠️ **Só manual** — "Compartilhar → Adicionar à Tela de Início" | [1] |
| **`beforeinstallprompt`** (botão custom de instalar) | ✅ | ❌ **Não existe** | [1] — a doc do Next **desaconselha** usar: *"we do not recommend this as it is not cross browser and platform (does not work on Safari iOS)"* |
| **Web Push** | ✅ Chromium, Firefox | ✅ **iOS 16.4+, mas SÓ se instalado na tela de início** | [1] |
| **Background Sync API** | ✅ Chrome 49+, Edge 79+, Opera 42+, Samsung Internet 5+ | ❌ **Nenhuma versão do Safari/iOS**. Firefox também não | [4] — **78,26% de suporte global** |
| **Periodic Background Sync** | ⚠️ Chromium apenas | ❌ | [4] |

**Consequência arquitetural direta e não-negociável:** você **não pode** depender de Background Sync para o flush da fila offline. Com 78% de suporte e zero no iOS, o sync tem que ser disparado no ciclo de vida da aplicação — ao abrir o app, ao voltar do `visibilitychange`, ao ouvir o evento `online`, e por retry na própria Server Action. Background Sync é *progressive enhancement*, não a base.

### 1.5 O risco que mata um app financeiro offline: eviction de storage

Este é o ponto que quase todo tutorial de PWA ignora e que, num app de dinheiro, é falha crítica.

| Navegador | Cota (best-effort) | Eviction | Fonte |
|---|---|---|---|
| Chrome/Chromium | até **60% do disco** | Sob pressão de armazenamento, LRU — **pula origens com persistência concedida** | [5][6] |
| Firefox | menor entre **10% do disco** e **10 GiB** (limite de grupo) | Sob pressão. Persistente: até 50% do disco, máx. 8 TiB | [5] |
| Safari | ~60% (browser), ~15% (WebView embarcada) | 🔴 **Apaga storage de origens sem interação do usuário nos últimos 7 dias de uso do navegador.** Cookies definidos pelo servidor são isentos | [5] |

**Mitigação obrigatória:**

```ts
// chamar dentro de um gesto do usuário, depois que ele salvou algo importante
const persistido = await navigator.storage.persist()
```

O Chrome **não mostra prompt** — decide por heurística: nível de engajamento, **site instalado ou favoritado**, e **permissão de notificação concedida** [6]. Ou seja: pedir permissão de notificação e conseguir a instalação na tela de início não são só features de produto — são **o mecanismo pelo qual você conquista storage persistente**.

> ⚠️ Mesmo assim: `persist()` pode retornar `false`, o usuário pode limpar dados do site, e o iOS tem regras próprias. **Nunca trate o IndexedDB como fonte de verdade durável.** O outbox é um buffer de trânsito; a verdade é o Postgres. Todo lançamento que ainda não confirmou no servidor precisa estar visualmente marcado como "pendente de sincronização" na UI, e o app deve alertar se a fila ficar velha demais.

---

## 2. Banco local + sincronização — a decisão mais importante

### 2.1 Verificação de manutenção (npm registry + GitHub API, 04/09/2026)

Antes de qualquer comparação de features, o filtro de sobrevivência:

| Projeto | Pacote | Versão | Publicado em | Sinal |
|---|---|---|---|---|
| Dexie | `dexie` | **4.4.5** | **2026-08-14** | ✅ Muito ativo |
| Dexie Cloud | `dexie-cloud-addon` | **4.4.14** | **2026-08-14** | ✅ Muito ativo |
| RxDB | `rxdb` | **17.5.0** | **2026-08-20** | ✅ Muito ativo |
| PouchDB | `pouchdb` | **9.0.0** | **2024-06-21** | ⚠️ **Sem release há 2 anos** (commits em jul/2026; incubadora Apache desde abr/2025) |
| TinyBase | `tinybase` | **9.7.0** | **2026-09-02** | ✅ Ativíssimo |
| Legend-State | `@legendapp/state` | `latest` **2.1.15** | **2024-08-30** | 🔴 **v3 em beta há 2 anos** (`beta` = 3.0.0-beta.48, 2026-07-12) |
| WatermelonDB | `@nozbe/watermelondb` | **0.28.0** | **2025-04-07** | ⚠️ Último commit **2025-08-11** — semi-dormente |
| ElectricSQL | `@electric-sql/client` | **1.5.27** | **2026-09-01** | ✅ Ativo — **mas ver §2.3** |
| PGlite | `@electric-sql/pglite` | **0.5.8** | **2026-08-26** | ⚠️ Ainda 0.x |
| PowerSync | `@powersync/web` | **2.3.0** | **2026-09-02** | ✅ Muito ativo |
| Zero (Rocicorp) | `@rocicorp/zero` | **1.9.0** | **2026-08-14** | ✅ **GA desde março/2026** |
| Triplit | `@triplit/client` | **1.0.50** | **2025-07-31** | 🔴 **Parado há 13 meses** |
| Instant DB | `@instantdb/react` | **1.0.67** | **2026-08-31** | 🔴 **Ver §2.3 — cloud encerra em 2027** |
| Jazz | `jazz-tools` | **0.20.19** | **2026-07-03** | ⚠️ Ativo, mas ainda 0.x |
| TanStack DB | `@tanstack/db` | **0.8.7** | **2026-08-31** | ⚠️ Ativo, mas beta; persistência em **alpha** |
| Yjs | `yjs` | **13.6.32** | — | ✅ Maduro |
| Automerge | `@automerge/automerge` | **3.4.1** | — | ✅ Maduro (3.0 em jul/2025, −10× memória) |

### 2.2 Comparativo técnico completo

| Opção | Modelo de sync | Conflito | Pronto p/ produção | Licença | Custo | Web/Next.js | Adequação a **dinheiro** |
|---|---|---|---|---|---|---|---|
| **Dexie.js (só local)** | — (é wrapper de IndexedDB) | — | ✅ Sim | Apache-2.0 | **Grátis** | ✅ Excelente | ✅ **Neutro — você controla tudo** |
| **Dexie Cloud** | Server-authoritative; **reexecuta where-clauses no servidor**; transação Dexie = operação atômica all-or-nothing | Não é LWW ingênuo: operações com filtro são reaplicadas; mesma propriedade → timestamp do cliente vence | ✅ Sim | Comercial | Free: **3 usuários de produção**, 50k de avaliação, 10 DBs, 10 conexões, **100 MB**, 20 req/s · Pro **€0,12/usuário/mês** · Self-host **€3.495** (Business) / **€7.995** (Enterprise, com código-fonte) | ✅ Nativo | ⚠️ Bom modelo, **mas 3 usuários no free** inviabiliza multi-loja gratuito |
| **RxDB** | Checkpoint iteration, `push`/`pull`/`pullStream` handlers | **`conflictHandler` no cliente**; default descarta o fork e mantém o master | ✅ Sim | **Apache-2.0** (core); plugins premium comerciais | Core grátis · Premium **$99/mês** (Pro) / **$239/mês** (Pro Plus), anual | ✅ Sim | 🔴 **A doc admite: NÃO garante exactly-once.** *"The document write could have already reached the remote instance and be processed, while only the answering fails"* — o backend **precisa** deduplicar |
| **PouchDB/CouchDB** | Replicação CouchDB (rev trees) | Determinístico mas **arbitrário** (vence a rev "vencedora"); perdedores ficam guardados | ⚠️ Maduro porém estagnado | Apache-2.0 | Grátis (self-host) | ✅ Sim | ⚠️ Conflito arbitrário é péssimo default para dinheiro; sem release há 2 anos |
| **ElectricSQL** | 🔴 **Só read-path.** *"Electric does not do write-path sync"* | Você resolve | ✅ 1.0 GA (mar/2025) | Apache-2.0 | Free tier **NÃO CONFIRMADO** | ✅ Sim | ⚠️ Resolve metade do problema. **E foi adquirida pela Databricks (11/08/2026)** — time vai para o Neon |
| **PowerSync** | Bidirecional; SQLite local (**OPFS no browser**) + **upload queue nativa** | Autoridade no servidor (Postgres) | ✅ Sim | Open Edition source-available; Cloud comercial | Free: **2 GB sync/mês, 500 MB, 50 clientes de pico, 2 instâncias, ⚠️ desativa após 1 semana de inatividade** · Pro **$49/mês** | ✅ SDK Web JS | ✅ **Tecnicamente o melhor pronto-para-usar.** Exige `logical replication` + `CREATE PUBLICATION` |
| **Supabase + outbox manual** | Você escreve | Você define (com ledger: **inexistente**) | ✅ Sim | — | **R$ 0** | ✅ Total | ✅ **Máximo controle sobre a integridade** |
| **TinyBase** | Synchronizers (WebSocket, PartyKit, Durable Objects) | CRDT-ish, timestamps | ✅ Sim | MIT | Grátis | ✅ Sim | ⚠️ Ótimo produto, modelo key-value/tabular não combina com ledger relacional |
| **Legend-State v3** | Plugin Supabase com CRUD + realtime | LWW por padrão | 🔴 **Não** | MIT | Grátis | ✅ Sim | 🔴 **`latest` estável é de ago/2024; v3 em beta há 2 anos** |
| **WatermelonDB** | Pull/push via RPC Postgres (`last_pulled_at`) | 🔴 **"latest change wins"** (padrão oficial Supabase) | ⚠️ | MIT | Grátis | 🔴 **Foco React Native** | 🔴 LWW + foco RN |
| **Triplit** | CRDT | Automático | 🔴 Não | — | — | ✅ | 🔴 **Time contratado pela Supabase (08/10/2025); projeto community-maintained; npm parado desde jul/2025** |
| **Instant DB** | Realtime + offline | — | 🔴 **Não** | Open source | Free generoso | ✅ | 🔴 **OpenAI comprou o time (anúncio 22/08). Novos cadastros encerrados; cloud desliga em 31/08/2027; backups até 2028** |
| **Zero (Rocicorp)** | Bidirecional; **custom mutators rodam otimista no cliente E autoritativamente no servidor**; rollback automático | Servidor é autoridade; validação com Zod dentro do mutator | ✅ **GA/1.0 desde mar/2026** | — | Open source core; managed Cloud Zero | ✅ Sim | ✅ **Modelo excelente** — mas exige operar `zero-cache` + logical replication; **faltam SSR, agregações e permissões de coluna** |
| **Jazz** | CRDT + E2E encryption | Automático | ⚠️ 0.x | — | — | ✅ | 🔴 CRDT no dinheiro |
| **Automerge / Yjs** | CRDT puro | Convergência automática | ✅ Maduros | MIT | Grátis | ✅ | 🔴 **Errado por construção — ver §2.4** |
| **TanStack DB** | Coleções + mutações otimistas | Você define | ⚠️ Beta; persistência **alpha** (0.6, 25/03/2026) | MIT | Grátis | ✅ Excelente | ⚠️ Promissor, jovem demais para dinheiro |

### 2.3 O que aconteceu no mercado em 2025–2026 (e por que isso importa)

Três consolidações mudaram o mapa e nenhuma delas aparece em tutorial:

1. **Triplit → Supabase** (08/10/2025). A Supabase contratou o co-fundador Matt Linkous. Mas o post oficial é explícito: *"the focus isn't to directly integrate Triplit into Supabase's platform"* — Matt vai trabalhar em integrações de terceiros, tornando a Supabase boa parceira de ElectricSQL, Zero e PowerSync. **A Supabase declarou publicamente que não vai resolver offline em primeira mão:** *"solving offline mode in a way that works for everyone is a formidable challenge"*, sem roadmap com data.

2. **Instant DB → OpenAI** (anúncio 22/08). Cadastros novos encerrados, reembolso de cobranças após 31/07/2026, **cloud desligado em 31/08/2027**, backups até 2028. O código open source permanece.

3. **Electric → Databricks** (11/08/2026). O time vai para o Neon (que a Databricks comprou por ~US$ 1 bi). O foco declarado agora é *"Postgres dentro de sandbox de agente de IA"* — não caderneta de mercearia.

**A lição, e ela é o argumento central deste relatório:** o segmento local-first está em consolidação agressiva. Um dev solo construindo um produto financeiro com horizonte de anos **não deve amarrar a integridade contábil do sistema a um sync engine de startup**. Amarre ao Postgres, que estará vivo em 2036.

### 2.4 Por que CRDT ingênuo é errado para dinheiro

Esta é a parte que o briefing pediu explicitamente, e a resposta é mais forte do que "cuidado".

**O problema formal.** CRDTs garantem *strong eventual consistency*: réplicas que receberam o mesmo conjunto de operações convergem. Eles **não** garantem invariantes de aplicação. A literatura é clara: invariantes precisam valer não só no estado local, mas **também após o merge**, e para forçá-los é preciso sincronização adicional — que é exatamente o que o CRDT existe para evitar [7].

**O caso concreto do fiado.** Suponha `saldo = 100` e limite de crédito de 120.

- Balconista A, offline, registra compra de 50 → `saldo = 150`. Bloqueia? Não, porque offline ele não sabe.
- Balconista B, offline, registra compra de 40 → `saldo = 140`.

Com um registro LWW (last-write-wins) no campo `saldo`, o merge produz **150 ou 140** — em ambos os casos **uma das compras evaporou**. A loja perdeu dinheiro real, e não há erro em lugar nenhum: o sistema convergiu lindamente para um número errado.

Com um `Counter` CRDT (PN-Counter), o merge produz corretamente `100 + 50 + 40 = 190`. Melhor. Mas agora o limite de crédito de 120 foi violado e **nenhuma réplica jamais teve a informação necessária para impedir**. Invariante de desigualdade (`saldo <= limite`) é o exemplo canônico do que CRDT não sabe garantir sem coordenação.

**A conclusão prática:**

| Camada | CRDT serve? |
|---|---|
| Texto colaborativo, ordem de lista, presença | ✅ Sim, é o caso de uso |
| **Registro de fatos que aconteceram** (uma compra foi feita) | ✅ **Sim — um *grow-only set* de eventos é literalmente um CRDT** |
| **Saldo, limite, autorização** | 🔴 **Não. Nunca.** |

E aqui está a chave: **a solução certa é, ela própria, um CRDT — só que no lugar certo.** Um conjunto append-only de lançamentos imutáveis com IDs únicos é um G-Set: o merge é união de conjuntos, é comutativo, associativo e idempotente. Converge sozinho. Você só nunca sincroniza o *saldo* — você sincroniza os *fatos* e recalcula.

### 2.5 O padrão correto: ledger append-only + eventos idempotentes

```
┌─────────────────────── CLIENTE (PWA) ────────────────────────┐
│                                                              │
│  Ação do lojista: "fiado de R$ 47,50 para a Dona Maria"      │
│         │                                                    │
│         ▼                                                    │
│  1. Gera ULID/UUIDv7 NO CLIENTE  ──────────► id do evento    │
│  2. Grava lançamento no Dexie (IndexedDB)                    │
│  3. Enfileira no outbox (mesma transação Dexie)              │
│  4. UI mostra saldo recalculado + badge "pendente"           │
│                                                              │
│         ┌──────── flush: online | visibilitychange           │
│         ▼                 | abertura do app | retry          │
└─────────┼────────────────────────────────────────────────────┘
          │  POST /sync  (lote de eventos, cada um com seu id)
          ▼
┌──────────────────── SERVIDOR (Postgres) ─────────────────────┐
│                                                              │
│  INSERT INTO ledger_entries (...)                            │
│    ON CONFLICT (id) DO NOTHING;   ◄── idempotência total     │
│                                                              │
│  • RLS valida tenant + papel                                 │
│  • CHECK valida partida dobrada                              │
│  • Trigger bloqueia UPDATE/DELETE (append-only)              │
│                                                              │
│  saldo = SUM(débitos) − SUM(créditos)   ◄── DERIVADO         │
└──────────────────────────────────────────────────────────────┘
```

**Por que isso elimina o problema em vez de resolvê-lo:**

1. **ID gerado no cliente** — reenvio duplicado, retry automático, usuário apertando "salvar" três vezes no 4G ruim: tudo colapsa no mesmo `id`. `ON CONFLICT DO NOTHING`. É a mesma ideia das *idempotency keys* da Stripe [8], só que aplicada na origem em vez da borda.
2. **Append-only** — não existe UPDATE, logo não existe conflito de UPDATE. A operação de merge é união de conjuntos.
3. **Saldo derivado** — dois balconistas offline não "conflitam"; ambos os lançamentos entram, e o saldo passa a ser 190. Correto por construção.
4. **Auditoria de graça** — quem lançou, quando, de qual dispositivo, está na própria linha.
5. **ULID/UUIDv7 em vez de UUIDv4** — ambos são ordenáveis por tempo, o que preserva a localidade do índice B-tree do Postgres. UUIDv4 aleatório fragmenta o índice e degrada insert em volume.

**A regra de ouro, em uma frase:** *sincronize eventos, nunca estado; derive o estado, nunca o transmita.*

**O que o limite de crédito exige.** Autorizar contra limite é uma invariante de desigualdade e **não pode ser decidida offline com garantia**. Seja honesto no produto: valide contra o saldo local conhecido, marque o lançamento como provisório, e deixe o servidor ser a autoridade final. Se estourar o limite na sincronização, isso vira um alerta para o dono — não um rollback silencioso. Rollback silencioso de dinheiro é pior que estouro de limite.

### 2.6 🎯 Recomendação

**Fase 1 (MVP, custo R$ 0) — Dexie 4.4.5 + outbox próprio + Supabase.**

Não é a resposta preguiçosa; é a consequência direta de três fatos:

1. **O ledger append-only já elimina 95% do problema que os sync engines resolvem.** Você não precisa de resolução de conflito, de CRDT, de operational transform. Precisa de uma fila confiável e de `ON CONFLICT DO NOTHING`. São semanas de trabalho, não meses.
2. **Nenhum sync engine é gratuito de verdade para você.** PowerSync free desativa após 1 semana de inatividade (o mesmo problema do Supabase, dobrado) e o degrau é $49/mês. Dexie Cloud free tem **3 usuários de produção** — um dono e dois balconistas e acabou. Zero exige operar `zero-cache` e Postgres com logical replication.
3. **É o que impressiona num portfólio.** "Usei o PowerSync" é uma escolha de ferramenta. "Modelei um ledger append-only com eventos idempotentes de ID gerado no cliente, o que torna a sincronização offline uma união de conjuntos sem conflito" é uma **decisão de arquitetura** que você defende por vinte minutos numa entrevista.

**Fase 3 (só se doer de verdade) — PowerSync.** Migre quando a fila própria virar gargalo real, não antes. O SDK Web tem SQLite + OPFS e upload queue nativa, e é o mais maduro do mercado para Postgres.

**Se você quisesse um sync engine hoje**, a ordem seria: **PowerSync** (mais maduro para Postgres + web) → **Zero 1.9.0** (modelo de mutators server-autoritativos é o mais elegante, mas falta SSR e exige infra própria) → **Dexie Cloud** (ótimo modelo de consistência, free tier inviável).

**Descarte imediato para este caso:** Legend-State (v3 em beta há 2 anos), WatermelonDB (RN + LWW), Triplit (parado), Instant DB (desliga em 2027), PouchDB (sem release há 2 anos), Automerge/Yjs/Jazz (CRDT no dinheiro), ElectricSQL sozinho (não faz write-path).

---

## 3. Modelagem contábil

### 3.1 Partidas dobradas (double-entry) — e sim, você precisa disso

Uma caderneta de fiado parece simples demais para contabilidade formal. Não é: você tem crédito concedido, pagamentos parciais, estornos, descontos, e um valor (o saldo devedor) que **não pode dar errado**.

O princípio, na formulação da Modern Treasury [9]: *"every transaction should record both where the money came from and what the money was used for."*

Contas têm natureza:
- **Debit-normal** — *"funds you own, or uses of money"* (ativos, despesas). Aumentam com débito.
- **Credit-normal** — *"funds you owe, or sources of money"* (passivos, patrimônio, receita). Aumentam com crédito.

E a validação estrutural: *"The sum of balances of all credit normal accounts matches the sum of balances of all debit normal accounts."* Quando essa igualdade quebra, o sistema criou ou destruiu dinheiro.

**Aplicado ao fiado:**

| Evento | Débito | Crédito |
|---|---|---|
| Venda fiada de R$ 47,50 | `contas_a_receber:maria` (ativo) +47,50 | `receita:vendas` +47,50 |
| Pagamento de R$ 20,00 | `caixa` +20,00 | `contas_a_receber:maria` −20,00 |
| Estorno de lançamento errado | (lançamento inverso, ver §3.3) | |

O saldo devedor da Dona Maria é simplesmente o saldo da conta `contas_a_receber:maria`. Se a soma de todos os débitos ≠ soma de todos os créditos, você tem um bug — e descobre no ato, não no fim do mês.

**Single-entry vs double-entry, honestamente:** single-entry (uma coluna `valor` com sinal) funciona e é mais simples. Mas você perde a validação estrutural gratuita e perde a capacidade de responder "de onde veio esse dinheiro". Para um portfólio, double-entry é a resposta certa **e** a mais impressionante — a Square construiu o "Books" exatamente assim [10], descrevendo double-entry como *"a well-established, public-domain, battle-tested approach to modeling financials"*.

### 3.2 Por que o ledger tem que ser imutável

A Modern Treasury é categórica [11]: **"Immutability is the most important guarantee from a ledger."** E complementa: o modelo de dados é *"built on top of an immutable, append-only log."*

Sobre calcular saldo: *"more accurate to store immutable transactions and always compute balances from those transactions"* [9].

Sobre deleção: **"no Entries are ever actually deleted"** — usa-se `discarded_at` [11].

O TigerBeetle chega ao mesmo lugar por outro caminho [12]: transfers são imutáveis, e o argumento é que a imutabilidade *"adds more information to the history"* — você preserva o erro original, quando ocorreu, a tentativa de correção e seus timestamps, formando *"a timeline of the particular business event"*.

### 3.3 Estorno: nunca deletar, sempre contra-lançar

O TigerBeetle documenta o padrão [12]: para corrigir uma transferência de $10.000 de A para X, você *"submit two additional transfers going in the opposite direction"*. E a observação que fecha o argumento:

> *"A correcting entry might even be wrong, in which case it itself can be corrected with yet another transfer."*

Recomendações práticas: use um `code` que marque a transação como correção, e mantenha um identificador correlacionado (`user_data_128` no TigerBeetle, `estorna_id` no seu schema) para rastrear a cadeia.

A Modern Treasury descreve duas estratégias [13]:
1. **Reversal completo** — lançamento oposto integral, depois o lançamento correto.
2. **Delta** — um único lançamento de ajuste que, somado ao anterior, resulta no valor certo.

Para uma caderneta, **use reversal completo**: o lojista precisa conseguir explicar o extrato para o cliente, e "R$ 50 − R$ 50 + R$ 45" é mais legível que "R$ 50 − R$ 5".

### 3.4 Estados: pending vs posted

*"A ledger transaction is mutable while pending and immutable once posted"* [11]. Os três saldos [14]:

- **Posted** = soma das transações liquidadas
- **Pending** = soma das pendentes **+** posted
- **Available** = o conservador — *"assuming everything outgoing is gone, and everything incoming won't arrive"*

**No seu caso isso mapeia perfeitamente para offline:** um lançamento criado offline é **pending**; quando o servidor confirma, vira **posted**. A UI mostra o saldo pending (para o lojista tomar decisão) mas sinaliza visualmente o que ainda não confirmou.

### 3.5 Saldo: soma de lançamentos vs coluna cacheada

Somar lançamentos é O(n) e não escala. A Modern Treasury documenta a solução [15]: cachear **quatro** componentes — `pending_debits`, `pending_credits`, `posted_debits`, `posted_credits` — e não um único número.

| Estratégia | Trade-off |
|---|---|
| Saldos atuais, atualizados **sincronamente** | Precisão imediata (essencial para *balance locks*), custo na latência de escrita |
| Saldos históricos por **anchoring** | Cache de fim-de-dia + soma dos lançamentos intraday. Atualização assíncrona, barata |
| **Resulting balances** (saldo por lançamento) | Granularidade máxima, caro de atualizar |

E a peça que quase todo mundo esquece — **reconciliação**: *"Regularly verifying each Account's cached balances match the sum of Entries"*, desativando a leitura do cache para contas com drift detectado.

**🎯 Minha recomendação para o seu volume:** comece **somando**. Uma caderneta de bairro tem centenas de lançamentos por cliente, não milhões — `SUM()` com índice em `(store_id, cliente_id)` resolve em microssegundos. Adicione uma **materialized view** ou coluna cacheada só quando o `EXPLAIN ANALYZE` mostrar que precisa, **e** implemente o job de reconciliação **no mesmo commit** em que introduzir o cache. Cache de saldo sem reconciliação é dívida técnica que cobra juros em dinheiro real.

### 3.6 Como forçar tudo isso no Postgres

Três camadas independentes, porque uma só sempre falha:

```sql
-- 1) GRANTS: a API simplesmente não tem o verbo
revoke update, delete on public.ledger_entries from authenticated, anon;
grant select, insert on public.ledger_entries to authenticated;

-- 2) TRIGGER: barra até quem tem privilégio (migrações, service_role, você às 3h)
create or replace function private.deny_mutation() returns trigger
language plpgsql as $$
begin
  raise exception 'ledger_entries é append-only (operação: %)', tg_op;
end; $$;

create trigger ledger_no_mutation
  before update or delete on public.ledger_entries
  for each row execute function private.deny_mutation();

-- 3) RLS forçada, inclusive para o owner da tabela
alter table public.ledger_entries enable row level security;
alter table public.ledger_entries force row level security;

-- 4) Validação estrutural de partida dobrada, no schema
alter table public.ledger_entries
  add constraint valor_positivo check (valor_centavos > 0),
  add constraint direcao_valida check (direcao in ('debito','credito'));
-- + constraint deferrable somando débitos e créditos por transaction_id
```

E o detalhe que resolve o arredondamento: **`valor_centavos bigint`, nunca `float`, nunca `real`**. `0.1 + 0.2 !== 0.3` é engraçado num tweet e é processo no Procon numa caderneta.

---

## 4. Multi-tenancy e segurança com Postgres/Supabase

### 4.1 Os três padrões

| Critério | Shared schema + `tenant_id` + RLS | Schema-per-tenant | Database/Project-per-tenant |
|---|---|---|---|
| Densidade de tenants | **100k a 1M+** [16] | 1k a 10k [16] | Baixa por nó |
| Modelagem exigida | `tenant_id` em **toda** tabela | Nenhuma | Nenhuma |
| Migrações | **Uma, atômica** | Fan-out por schema | Fan-out por database |
| Queries cross-tenant | Nativas e paralelas | Não paralelas [16] | Caríssimas (exige ETL) |
| PITR por tenant | Não | Limitado | ✅ Sim |
| Blast radius de bug | **Todos os tenants** | Um schema | Um tenant |
| Custo operacional (dev solo) | **Menor** | Médio | Maior |

**Posições oficiais divergem, e a divergência é informativa:**

- **Citus/Microsoft** [16] é a fonte mais quantificada: row-based sharding para *"larger volumes of small tenants (B2C)"*, schema-based para *"smaller numbers of large tenants (B2B)"*.
- **Crunchy Data** [17] recomenda **variável de sessão** em vez de um role Postgres por tenant, justamente para não destruir o connection pooling, e insiste: *"ideally you have that org_id in every table"*.
- **Neon** [18] recomenda o oposto — *"We recommend setting up one project per user"* — e desanca schema-per-tenant: *"doesn't reduce operational complexity; introduces additional isolation risks"*. Leia com ceticismo: database-per-tenant é o produto deles, e o post não apresenta **nenhum número** de overhead.
- **AWS** — o whitepaper de silo/bridge/pool [19] está marcado pela própria AWS como *"for historical reference only. Some content might be outdated"*.

**🎯 Para você: shared schema + `tenant_id` + RLS.** Uma caderneta de bairro é B2C disfarçado de B2B — muitíssimos tenants pequenos, schema idêntico, dev solo, migrações frequentes. Schema-per-tenant multiplica o custo de migração por N lojas.

### 4.2 O que a Supabase recomenda oficialmente

**Achado honesto: não existe página `supabase.com/docs/.../multi-tenancy`.** O que existe é a página comercial de B2B SaaS afirmando *"RLS enforces tenant isolation at the database layer. RBAC controls what each user role can access"* — **sem nenhum SQL de exemplo** — e o guia de RLS, que é centrado em *ownership por usuário* (`auth.uid() = user_id`), não em tenancy.

**O padrão `tenant_id` + tabela de membership é prática consolidada da comunidade, não doutrina documentada.** Você compõe duas peças oficiais: [RLS] + [Custom Claims & RBAC].

### 4.3 Papéis (dono/gerente/balconista) — e a armadilha do JWT

O guia oficial de RBAC [20] usa `user_roles` + `role_permissions` + **Custom Access Token Hook** injetando o papel no JWT + função `authorize()` `SECURITY DEFINER`.

**Dados oficiais do hook:**

| Item | Valor |
|---|---|
| Disponível no plano **Free**? | ✅ **Sim** |
| Timeout (função Postgres) | **2 segundos** |
| Timeout (endpoint HTTP) | **5 segundos**, até 3 retries em 429/503 |
| Payload máximo (HTTP) | **20 KB** |
| Roda no **refresh** do token? | **NÃO CONFIRMADO** |

🔴 **A armadilha que precisa de ADR próprio.** A doc é explícita: *"the auth hook will only modify the access token JWT but not the auth response"* — as claims valem só para o token corrente. **Mudar o papel de alguém só surte efeito após o refresh do token.**

Traduzindo para o seu domínio: **o dono demite o balconista às 14h e o JWT dele continua dizendo `balconista` até expirar.** Num app de dinheiro isso é inaceitável.

**Solução:** ponha **apenas o `tenant_id` no JWT** (não muda durante a sessão) e **consulte o papel na tabela de membership** via função `SECURITY DEFINER` a cada policy. Custa uma leitura indexada e te dá revogação instantânea.

```sql
create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     public.store_role not null,       -- 'dono' | 'gerente' | 'balconista'
  primary key (store_id, user_id)
);

-- em schema NÃO exposto pela API
create or replace function private.has_store_role(_store uuid, _min public.store_role)
returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  return exists (
    select 1 from public.store_members m
    where m.store_id = _store
      and m.user_id  = auth.uid()
      and m.role     >= _min
  );
end; $$;

create policy ledger_read on public.ledger_entries
  for select to authenticated
  using ( (select private.has_store_role(store_id, 'balconista')) );

create policy ledger_insert on public.ledger_entries
  for insert to authenticated
  with check ( (select private.has_store_role(store_id, 'balconista')) );
```

Note as três coisas que **não** são cosméticas: `to authenticated`, o `(select ...)` envolvendo a função, e `set search_path = ''`.

### 4.4 Performance de RLS — os números que mudam tudo

Benchmarks oficiais da Supabase em tabela de **100 mil linhas** [21][22]:

| Teste | Otimização | Antes | Depois | Ganho |
|---|---|---|---|---|
| 1 | Índice na coluna da policy | 171 ms | **< 0,1 ms** | ~1.700× |
| 2a | `(select auth.uid())` em vez de `auth.uid()` | 179 ms | **9 ms** | ~20× |
| 2b | `(select is_admin())` | 11.000 ms | **7 ms** | ~1.570× |
| **2d** | **`(select has_role())` — security definer** | **178.000 ms** | **12 ms** | **~14.800×** |
| 2e | função de array wrappada | 173.000 ms | 16 ms | ~10.800× |
| 3 | Filtro explícito no cliente **além** da RLS | 171 ms | 9 ms | ~19× |
| 5 | Inverter a direção do join | 9.000 ms | **20 ms** | ~450× |
| 6 | `TO authenticated` | 170 ms | **< 0,1 ms** | ~1.700× |

**178 segundos para 12 milissegundos por causa de dois parênteses.** Isso não é micro-otimização — é a diferença entre o app existir e não existir num Android de entrada.

**As 6 regras:**

1. **Envolva toda função em `(select ...)`** — força um *initPlan*: uma execução por query, não por linha. Só funciona quando o resultado não depende dos dados da linha.
2. **Indexe toda coluna usada na policy.** ⚠️ Detalhe crítico: uma coluna só conta como indexada quando é **a primeira** de um índice btree. PK composta indexa só a primeira coluna.
3. **Sempre `TO authenticated`** — oficial: *"Always add 'authenticated' to the approved roles instead of nothing or public."*
4. **Inverta a direção do join:** `team_id in (select team_id from ... where user_id = auth.uid())`, nunca `auth.uid() in (select ... where team_id = tabela.team_id)`.
5. **`SECURITY DEFINER` para tabelas de junção** — evita avaliar a RLS da tabela intermediária.
6. **Filtre explicitamente no cliente também.** A RLS é rede de segurança, não filtro primário.

### 4.5 As armadilhas que vazam dados

Da doc do Postgres [23][24] e do catálogo de footguns [25]:

| # | Armadilha | Consequência |
|---|---|---|
| 1 | **Tabela filha sem checagem de tenant** | `ledger_entries` protege por `store_id`, mas `ledger_entry_notes` só checa `entry_id` → outro tenant lê as notas. **Nunca confie na policy do pai** |
| 2 | 🔴 **View SECURITY DEFINER** | Doc oficial: *"by default, the row-level security policies of the view owner are applied"*. Como views no Supabase são criadas pelo `postgres`, **uma view sobre tabela com RLS entrega todos os tenants para todo mundo, silenciosamente.** Correção: `with (security_invoker = on)` (PG 15+) |
| 3 | **Owner faz bypass** | *"Table owners normally bypass row security"* — migrações e jobs ignoram RLS. Correção: `FORCE ROW LEVEL SECURITY` |
| 4 | **`USING` sem `WITH CHECK`** | Usuário **insere** o que não consegue ler — grava fiado na loja alheia. `USING` suprime silenciosamente; `WITH CHECK` lança erro |
| 5 | **Múltiplas policies permissivas** | Combinam com **OR** e ampliam acesso. Use `AS RESTRICTIVE` para o isolamento de tenant |
| 6 | **UNIQUE global** | Vaza existência de dado alheio via erro de duplicidade. `UNIQUE (store_id, lower(email))` |
| 7 | 🔴 **FK e constraints fazem bypass** | Doc oficial: *"Referential integrity checks... **always bypass row security**... Care must be taken... to avoid 'covert channel' leaks"* |
| 8 | 🔴 **Grants padrão no schema `public`** | *"tables created in `public` receive SELECT, INSERT, UPDATE, and DELETE privileges for `anon`, `authenticated`, and `service_role` by default"* — `revoke` **antes** de conceder o mínimo |
| 9 | **Pooling + `SET` de sessão** | Usar `SET` em vez de `SET LOCAL` atrás de um pooler em transaction mode **vaza o contexto de um tenant para a requisição de outro** |

**Detecção automática:** os Database Advisors rodam o linter open-source **Splinter**, que pega exatamente esses erros: `0003_auth_rls_initplan`, `0006_multiple_permissive_policies`, `0010_security_definer_view` e o crítico `0013_rls_disabled_in_public` (*"anyone with your project URL can read, edit, and delete all data"*). Disponibilidade no plano Free: **NÃO CONFIRMADO**.

### 4.6 Auditoria

| Abordagem | Captura `auth.uid()` | Pega mudança fora da API | Transacional | Consultável | Manutenção |
|---|---|---|---|---|---|
| `supa_audit` (trigger) | Não nativamente | ✅ | ✅ | ✅ | 🔴 **ARQUIVADO em 16/02/2025** |
| `pgaudit` | ❌ **Só role Postgres** | ✅ | ❌ *"best-effort and not transactional"* | ❌ só logs | ✅ Ativo (branches até PG 19) |
| Aplicação | ✅ | ❌ | ✅ | ✅ | Sua |
| **Ledger (event sourcing)** | ✅ **por design** | ❌ | ✅ | ✅ | Sua |

🔴 **`supa_audit` está arquivado desde 16/02/2025** (último commit no repo: 02/01/2024). Não adote em produto novo.

🔴 **`pgaudit` não serve para o seu caso:** *"pgAudit cannot reliably identify application end-users — it tracks database-level roles only"*, e no Supabase Free os logs de DB têm **1 dia de retenção**.

**🎯 Sua auditoria é o ledger.** `created_by uuid not null default auth.uid()` na própria linha do lançamento: transacional, consultável por SQL, imune a política de retenção de log, e responde exatamente a pergunta do negócio ("quem lançou este fiado?"). Trilha de auditoria não deve ser subproduto — deve ser o modelo de dados.

---

## 5. Alternativas de backend

### 5.1 Free tiers reais (verificados hoje)

| | **Supabase** | **Neon** | **Convex** | **Firebase (Spark)** | **Cloudflare D1+DO** | **Turso** |
|---|---|---|---|---|---|---|
| Storage | 500 MB/projeto | 0,5 GB/projeto | 0,5 GB | 1 GiB | D1: 5 GB (máx 500 MB/DB) · DO: 5 GB | 5 GB |
| Egress | 5 GB + 5 GB cached | 5 GB/projeto/mês | 1 GB I/O | 10 GiB/mês | Incluído | 3 GB |
| Projetos/DBs | **2 ativos** | **100** | 40 deployments | N.C. | **D1: 10 DBs** | **100** |
| Leituras | Ilimitadas | 100 CU-h/mês | 1M calls/mês | **50k docs/dia** | **5M rows/dia** | 500M rows/mês |
| Escritas | Ilimitadas | idem | idem | **20k docs/dia** | **100k rows/dia** | 10M rows/mês |
| **Pausa por inatividade** | 🔴 **1 semana, resume MANUAL** | Scale-to-zero 5 min, **resume automático** | Não | Não | Não | N.C. |
| **Backup/PITR** | 🔴 **Nenhum** | 6h history, 1 snapshot | N.C. | N.C. | Time Travel 7 dias | N.C. |
| Retenção de logs | **1 dia** | 1 dia | N.C. | — | — | — |
| Auth | ✅ 50k MAU | Better Auth 60k MAU | Externa | ✅ | ❌ | ❌ |
| 1º pago | **$25/mês** | **PAYG sem mínimo** | Pro $25/dev | Blaze (sem mensalidade) | $5/mês | $5,99/mês |
| **Offline no browser** | ❌ | ❌ | ⚠️ **Alpha** | ✅ **Único de 1ª parte** | ❌ | ⚠️ Browser N.C. |
| **RLS de verdade** | ✅ **É** RLS | ✅ **É** RLS | ❌ | ⚠️ Security Rules | ❌ | ❌ |

### 5.2 O comportamento ao estourar a cota — o critério mais subestimado

| Backend | O que acontece |
|---|---|
| **Supabase** | Banco vira **read-only** acima de 500 MB |
| **Neon** | Compute suspenso; *"inserts, updates, and deletes that would increase storage fail"* — mas **"None of these limits delete your data"** |
| **Convex** | *"your deployment may return HTTP errors"* |
| 🔴 **Firebase Spark** | *"your project's usage of that specific product will be **shut off for the remainder of that month**"* — **o app do lojista morre até o mês virar** |
| **Cloudflare** | Limites diários, resetam à meia-noite UTC |

### 5.3 Notas por backend

**Supabase** — confirmado hoje na página oficial: **"Limit of 2 active projects"** e **"Free projects are paused after 1 week of inactivity"**, com resume **manual**. Mudanças reais: em 27/01/2025 os 0,5 GB passaram a ser **por projeto ativo** (melhoria); em 03/06/2025 novos projetos Free com SMTP padrão perderam a customização de templates de e-mail (piora). Nenhuma mudança de limite numérico em 2026.

**Firebase** — é o **único com offline de 1ª parte no browser**, e isso é genuinamente tentador. Mas: na web a persistência é **desabilitada por padrão** (`persistentLocalCache`), o corte total ao estourar o Spark é inaceitável para um comércio, e há um custo escondido brutal — *"any time your rules include a read... you're billed for a read operation"*, ou seja, **uma Security Rule que valida o vínculo do balconista com a loja dobra o custo de toda operação** contra os 50k leituras/dia. Mais: *"Cloud Firestore's cache isn't automatically cleared between sessions"* — num celular de balcão compartilhado, isso exige limpeza explícita no logout.

**Turso** — **não foi descontinuado** (pre-release v0.8.0-pre.8 hoje, 04/09/2026; estável v0.7.2 em 30/07/2026), mas está em transição arquitetural profunda: libSQL declarado legado, reescrita em Rust ainda em **beta sem 1.0**, Cloud em *early preview*, servidor indo closed source, **multi-DB schemas removidos para novos usuários em 21/01/2025** (era o mecanismo que propagava migrações entre DBs de tenant), e uma **segunda reescrita** (Postgres em Rust, jul/2026) já iniciada. Suporte a browser/WASM do sync: **NÃO CONFIRMADO** — SDKs documentados são Node/Python/Go. Conflito: **"last push wins"**. Eliminado por risco de plataforma, não por qualidade.

**Cloudflare D1 + Durable Objects** — o padrão **um DO SQLite por loja** é quase desenhado para ledger append-only: isolamento físico + serialização de escrita nativa por tenant. DOs estão no Workers Free desde 07/04/2025. Perde por: zero offline de 1ª parte, zero auth, D1 inviável no free (10 DBs), read replication em public beta há 17 meses.

### 5.4 ⚠️ O detalhe de hospedagem que muda o plano de custo

Da documentação oficial da Vercel [26], citação literal:

> **"Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan."**

E a definição é ampla: *"any Deployment that is used for the purpose of financial gain of **anyone** involved in **any part of the production** of the project, including a paid employee or consultant writing the code"*. Inclui explicitamente qualquer forma de solicitar ou processar pagamento, e até **pedir doações**.

Limites orientativos do Hobby: **100 GB Fast Data Transfer**, 10 GB Fast Origin Transfer, **4 CPU-hrs**, 360 GB-hrs de memória, **1M invocações**, 100 deploys/dia, 1 build concorrente.

**Implicação prática:** enquanto for portfólio puro (sem cobrar, sem doação, sem anúncio), Hobby está OK. **No momento em que o primeiro lojista pagar qualquer coisa, você precisa do Pro ($20/mês por seat).** Planeje isso — ou hospede em Cloudflare Workers/Pages, que não tem essa cláusula.

### 5.5 🎯 Recomendação de backend

**🥇 Supabase, shared schema + `tenant_id` + RLS.**

1. **É o único que dá a garantia de isolamento *no banco*.** Fiado é dinheiro de terceiros. RLS + `FORCE ROW LEVEL SECURITY` + `REVOKE UPDATE/DELETE` + trigger tornam o append-only e o isolamento **invioláveis pelo seu próprio código de aplicação**. Convex, Cloudflare e Turso jogam isso inteiro para o seu código — e em produto financeiro feito por dev solo, um `if` esquecido é vazamento de crédito de vizinho.
2. **Auth + tenancy + RBAC no mesmo pacote, no free.** 50k MAU, Custom Access Token Hook confirmado no Free.
3. **Os Advisors/Splinter cobrem exatamente onde dev solo erra.** Revisão de segurança automatizada grátis — e você não tem revisor.
4. **O ecossistema offline maduro é Postgres↔SQLite** (PowerSync), então a porta de saída da Fase 3 já existe.

**Os custos reais, sem maquiagem:**

| Problema | Mitigação |
|---|---|
| 🔴 Pausa após 1 semana, resume manual | Cron gratuito no GitHub Actions com `select 1`/dia. Some no Pro |
| 🔴 **Zero backup no Free** — inaceitável com ledger financeiro | `pg_dump` diário para storage próprio **desde o dia 1**, ou Pro assim que houver dado real de cliente |
| 🔴 Retenção de log de 1 dia | Auditoria vai no ledger, não em log |
| 🔴 500 MB e 2 projetos ativos | 2 projetos = staging + prod, sem folga |

**Vice-campeão: Neon + Drizzle.** 100 projetos no free, **scale-to-zero com resume automático** (sem pausa manual!), PAYG sem mínimo (degrau muito mais suave que os $25). Perde por não trazer auth acoplado à RLS — o Data API que resolveria isso está **em Beta**, e `neon.com/docs/guides/neon-rls` retorna **404**. **Se o degrau de $25 for proibitivo, é a troca racional.**

---

## 6. Qualidade e engenharia

### 6.1 ORM: Drizzle vs Prisma

**Verificação primária (npm dist-tags, 04/09/2026):**

| Pacote | Tag | Versão | Data |
|---|---|---|---|
| `drizzle-orm` | `latest` | **0.45.2** | 27/03/2026 |
| `drizzle-orm` | `rc` | 1.0.0-rc.4 | 27/06/2026 |
| `drizzle-kit` | `latest` | 0.31.10 | 17/03/2026 |
| `prisma` (CLI) | `latest` | **8.0.0-rc.12** | 26/08/2026 |
| `@prisma/client` | `latest` | **7.10.0** | 25/08/2026 |

❌ **Drizzle NÃO tem 1.0 estável** — está em RC desde junho/2026. Qualquer artigo dizendo "Drizzle v1 lançado" está errado.
⚠️ **Prisma 8 também está em RC**, e com uma pegadinha: o CLI publica RCs sob a tag `latest`, então `npm i prisma@latest` te entrega um **release candidate**.

**O Prisma migrou do Rust? Sim, e está GA** desde a v6.16.0 [27]. Generator `prisma-client` + `engineType = "client"` + driver adapter obrigatório, com **~90% de redução no bundle**. Isso mata o argumento histórico contra Prisma em serverless/edge — "Prisma é pesado demais para edge" é crítica **desatualizada** em 2026.

**RLS:**

| Capacidade | Drizzle | Prisma |
|---|---|---|
| Policies no schema | ✅ `pgPolicy()` (`as`, `to`, `for`, `using`, `withCheck`) | ✅ (anunciado 17/07/2026, **no v8 que está em RC**) |
| Roles | ✅ `pgRole()` | N.C. |
| Default-deny | ✅ `pgTable.withRLS()` | N.C. |
| Helpers **Supabase** | ✅ `drizzle-orm/supabase`: `anonRole`, `authenticatedRole`, `serviceRole`, `authUid()`, schemas `auth`/`realtime` pré-mapeados | ✅ `@prisma/orm-extension-supabase` |

> **A nuance que quase ninguém conta:** `pgPolicy()` só **gera o SQL da policy na migration**. Para valer em runtime, a conexão precisa entrar na transação com o role e os claims certos — com Supabase + Drizzle isso é manual (`set_config('request.jwt.claims', ...)` + `set local role`).

**🎯 Adote Drizzle 0.45.2.** Helpers de RLS/Supabase mais maduros, policy no mesmo arquivo da tabela (lê muito bem num portfólio), SQL-first (e num domínio financeiro você **vai** querer escrever SQL). **Não use os RCs do v1** — você não quer explicar numa entrevista por que o build quebrou. Prisma 8 é defensável, mas o estável (7.10.0) não tem o suporte a RLS.

⚠️ Conexão em serverless: use o **Connection Pooler** da Supabase, e em transaction mode prepared statements não funcionam — `postgres(url, { prepare: false })`.

### 6.2 Validação

| Lib | `latest` | Data |
|---|---|---|
| **zod** | **4.5.4** | 29/08/2026 |
| arktype | 2.2.3 | 07/07/2026 |
| valibot | 1.4.2 | 28/06/2026 |
| `react-hook-form` | 7.87.0 | 30/08/2026 |
| `@hookform/resolvers` | 5.9.1 | 17/08/2026 |
| `next-safe-action` | 8.7.1 | 03/09/2026 |

**Números oficiais do Zod 4** [28]:

| Métrica | Zod 3 | Zod 4 | Ganho |
|---|---|---|---|
| Parse de string | 363 µs/iter | 24.674 ns/iter | **14,71×** |
| Parse de objeto | 805 µs | 124 µs | **6,5×** |
| Bundle core (gzip) | 12,47 kB | **5,36 kB** | −57% |
| **`zod/mini`** (gzip) | 12,47 kB | **1,88 kB** | **−85%** |
| Compilação `.extend()`/`.omit()` | ~4000 ms | ~400 ms | **10×** |

⚠️ Circulam benchmarks cruzados entre as três libs (Valibot 1,37 kB, ArkType mais rápido). **Não encontrei benchmark oficial reprodutível — NÃO CONFIRMADO.** E é irrelevante: você valida formulários de 10 campos.

**Standard Schema** [29] é uma **especificação de interface TypeScript** (~60 linhas de tipos, **zero bytes de runtime**), criada pelos autores do Zod, Valibot e ArkType. Implementam: Zod 3.24+, Valibot 1.0+, ArkType 2.0+, Yup 1.6+. Consomem: tRPC v11, TanStack Form v1, TanStack Router, Conform. Suporte nativo em Server Actions do Next.js 16: **NÃO CONFIRMADO** (existe discussão aberta, não implementação).

**🎯 Zod 4.5.4** — e o motivo decisivo não é popularidade: é o único com **i18n oficial**. Seu usuário é lojista brasileiro; as mensagens de erro precisam sair em português sem você manter um mapa de tradução. `zod/mini` é a saída de emergência se o bundle apertar. Rejeite ArkType (aposta de nicho para projeto solo) e Valibot (só ganha se bundle for o gargalo — e com `zod/mini` não é).

**Padrão:** um schema Zod só, compartilhado. No client via `zodResolver`, no server dentro da Server Action, colando o resultado de volta com `useActionState` (React 19).

### 6.3 Testes

| Ferramenta | Versão | Data |
|---|---|---|
| **vitest** | **5.0.0** | **03/09/2026** |
| `@playwright/test` | **1.62.1** | 30/07/2026 |
| `@testcontainers/postgresql` | 12.1.0 | 04/08/2026 |
| `lighthouse` | 13.4.1 | 20/07/2026 |
| `@lhci/cli` | 0.15.1 | 25/06/2025 |

**Vitest 5** (03/09/2026) [30]: ⚠️ exige **Vite >= 6.4.0 e Node >= 22.12.0** — pode te obrigar a subir o Node do CI. Browser Mode agora estável; novo **Trace View** (replay passo a passo de interações). Performance −18% a −53% vs 4.1.

**Testar RLS — o caminho oficial é pgTAP + `supabase test db`** [31]. A doc traz o padrão completo: `tests.create_supabase_user()`, `tests.authenticate_as('user1@test.com')`, `tests.clear_authentication()`, asserções com `results_eq` e `throws_ok` (código `42501`, *"new row violates row-level security policy"*), e `tests.rls_enabled('public')`.

**Novidade útil:** `rlsautotest` (Apache-2.0, beta) — lê as policies **do catálogo do Postgres** e gera suíte pgTAP cobrindo tabela × comando × identidade. Destacado no Supabase Developer Update de julho/2026. ⚠️ Beta; a doc manda apontar para cópia descartável.

**🎯 Estratégia (dev solo):**

| Camada | Ferramenta | Veredito |
|---|---|---|
| Domínio puro (saldo, limite, centavos) | Vitest 5 (node) | **Faça** |
| **Segurança (RLS)** | **pgTAP + `supabase test db`** | **Inegociável** |
| Bootstrap da suíte de RLS | `rlsautotest` como **gerador** | Use, não dependa |
| Integração de dados | Testcontainers + Vitest | Só as queries críticas |
| E2E | Playwright, **com CPU throttling** | 3 a 5 cenários, não 50 |

**Não use Vitest Browser Mode aqui** — você já terá Playwright; manter dois runners de browser num projeto solo é custo puro.

**Bônus:** o Next.js 16.3 traz o helper Playwright `instant()` (`@next/playwright`), que assert qual conteúdo aparece **instantaneamente** numa navegação e **falha se um refactor tornar a rota lenta**. É teste de regressão de *performance* — extremamente vendável num portfólio focado em celular fraco.

### 6.4 CI

| Plano | Minutos/mês |
|---|---|
| **Free** | 2.000 |
| Pro / Team | 3.000 |
| Enterprise Cloud | 50.000 |

✅ **Repositório público = Actions grátis, sem consumir cota** — *"GitHub Actions usage is free... for public repositories that use standard GitHub-hosted runners."*

**🎯 Deixe o repositório público.** Além do óbvio para portfólio, CI vira literalmente ilimitado: Testcontainers + pgTAP + Playwright em todo push. Privado, uma matriz de E2E come 2.000 min/mês rápido.

### 6.5 Observabilidade barata

| Serviço | Free tier | 1º pago |
|---|---|---|
| **Sentry** (Developer) | **5k erros · 5M spans · 50 replays · 5 GB logs · 1 usuário** | Team $26/mês |
| **Axiom** (Personal) | **500 GB/mês de ingest · 25 GB storage · 30 dias de retenção · permanente, sem cartão** | $25/mês |
| **Better Stack** | 10 monitors · **1 status page** · 3 GB logs (3 dias) · 100k exceptions/mês · 5k replays | $30/mês (EU) |
| **Baselime** | ⚠️ **Comprado pela Cloudflare (abr/2024)**. Operação autônoma em 2026: **NÃO CONFIRMADO** |

`@sentry/nextjs` = 10.73.0 (31/08/2026) — muito ativo.

**🎯 Sentry free + Axiom Personal.** Os 50 replays/mês do Sentry parecem ridículos e são — mas configure `replaysOnErrorSampleRate: 1.0` e `replaysSessionSampleRate: 0` e eles bastam. **Ver o lojista tentando registrar um fiado num Android travando é o dado mais valioso que você vai ter.** Axiom entra como canhão barato: 500 GB/mês permanente para logs estruturados das Server Actions e telemetria de sincronização (tamanho da fila, tempo até flush).

**Não construa em cima do Baselime** — produto adquirido, roadmap de absorção, sem sinal público de vida recente.

### 6.6 Feature flags — a resposta honesta

| Opção | Free | Licença | Última release |
|---|---|---|---|
| **Flagsmith** | 50k requests/mês, 1 membro, 1 projeto | **BSD 3-Clause** | v2.269.1 — 03/09/2026 |
| **Unleash** | ❌ **Sem free hospedado**; self-host: 1 projeto, 2 ambientes | **AGPL-3.0** ⚠️ copyleft de rede | v8.1.0 — 05/08/2026 |
| **PostHog** | **1M requests de flag/mês** | MIT (exceto `ee/`) | ativo |
| **Flags SDK** (`flags`) | **Grátis, é biblioteca** | **MIT** | 4.3.0 — 04/08/2026 |

**Achado que muda a conta:** o PostHog cobra **por check** com avaliação remota, mas com **local evaluation** (SDKs de servidor: Node, Python, Go, etc.) só o fetch periódico das definições é cobrado — e *"we count the request to fetch the feature flag definitions as being equivalent to 10 flags requests"*. **Avaliando flags no servidor no Next.js 16, 1M/mês vira praticamente inatingível.**

**🎯 Não contrate serviço de feature flag no início — e seja honesto sobre o porquê.** Você é um dev. Um. Não existe "time de produto querendo ligar experimento sem deploy", que é o problema que essas ferramentas resolvem. E adicionar Flagsmith é adicionar **uma dependência de rede no caminho crítico de um app que precisa funcionar offline em 4G ruim** — o oposto do requisito.

Use o **Flags SDK (`flags@4.3.0`, MIT) com `decide()` em código**. É "flags as code": o *call site* não muda quando você trocar a definição por um adapter depois. Você começa sem serviço nenhum e adiciona `@flags-sdk/posthog` mais tarde **sem refatorar**. Kill switch em produção às 3h da manhã é o único caso que justifica serviço externo desde o dia 1.

### 6.7 Analytics

| | PostHog | Umami Cloud | Plausible | Vercel Web Analytics |
|---|---|---|---|---|
| Free | **1M eventos + 5k session replays + 1M flags + 100k exceptions** | 100k eventos, 1 site, 6 meses | ❌ **Sem free tier** (trial 30 dias) | 50k eventos/mês (**da conta inteira**), sem custom events no Hobby |
| Ao estourar | **"Usage stops at the free tier limits, so you can't be charged by surprise"** | N.C. | — | Pausa a coleta após 3 dias de graça |
| 1º pago | $0,00005/evento | $20/mês | **$9/mês** | Pro: $0,03/1k eventos |

⚠️ **Vercel Speed Insights grátis só mostra o Real Experience Score, não os Core Web Vitals individuais** — o que o torna quase inútil como ferramenta principal num projeto cujo foco é performance.

**🎯 PostHog free, e só.** Não pelo free tier generoso (embora seja), mas porque **session replay responde a pergunta certa**. Analytics de pageview responde "quantas visitas" — irrelevante aqui. Você precisa responder: *"o lojista conseguiu registrar o fiado, ou desistiu no meio porque o input de valor é ruim de digitar com uma mão segurando sacola?"*. Só replay responde isso. E consolidar analytics + replay + flags + error tracking num free tier só reduz sua superfície de manutenção a **uma** integração.

### 6.8 Padrões de arquitetura — opinativo, como pedido

**O diagnóstico primeiro.** O erro clássico em projeto de portfólio é achar que "impressiona tecnicamente" = "tem muitas camadas". Não é. Um revisor sênior pergunta duas coisas: **(1) esse cara sabe onde está a complexidade real do domínio dele?** e **(2) ele resistiu à tentação de aplicar padrão que não precisava?**

No seu caso a complexidade real **não está** na organização das camadas. Está em três lugares: **dinheiro** (saldo, arredondamento, estorno), **isolamento multi-tenant** e **sincronização offline** (duas fontes de verdade). Todo orçamento de engenharia vai para esses três. Camada gasta em outra coisa é camada roubada deles.

#### ✅ ADOTAR

| Padrão | Por quê | Custo |
|---|---|---|
| **Vertical Slice Architecture** | Bogard [32] descreve exatamente a sua situação: começou com onion architecture e em meses migrou para slices verticais porque isso *"reduziu a complexidade e a rigidez"*. Combina naturalmente com App Router: `app/fiados/`, `app/clientes/`, cada um com sua action, schema e query | Zero |
| **DDD *muito* leve** | Linguagem ubíqua ("fiado", "caderneta", "quitar") + tipos de valor: `Centavos` (**inteiro, nunca float de reais**), `CPF`. É 100% do DDD que dá retorno aqui | Muito baixo |
| **Núcleo de domínio puro — 1 pasta, não 4 camadas** | `lib/dominio/` com funções puras: `calcularSaldo(lancamentos)`, `podeAumentarFiado(cliente, limite)`. Sem I/O, sem React, sem Drizzle. Dá **o benefício real** da hexagonal sem nenhuma interface ou DI | Baixo |
| ⭐ **Ledger append-only** | **O padrão que impressiona de verdade no seu domínio.** Extrato e auditoria de graça, sem race condition de update concorrente, e a reconciliação offline vira inserção dos lançamentos que faltavam | Baixo — e é o que o domínio pede |
| ⭐ **Idempotência nas Server Actions** | **Não-negociável com 4G ruim.** O lojista aperta salvar, a rede engasga, ele aperta de novo, o cliente é cobrado duas vezes. `idempotency_key` do cliente + unique constraint | Baixo |
| **Outbox** — *só se* houver notificação | Se for mandar lembrete por WhatsApp, grave a intenção na mesma transação do lançamento | Baixo, condicional |

#### ❌ REJEITAR

| Padrão | Por quê |
|---|---|
| **Hexagonal / Ports & Adapters completo** | O ponto é poder trocar o adapter. **Você não vai trocar Postgres.** `IRepositorioDeFiado` com uma única implementação é cerimônia pura: paga indireção em todo arquivo e nunca cobra o benefício |
| **Clean Architecture (4 camadas)** | O benefício é de **colaboração** — ownership de camadas, trabalho paralelo entre times. **Não existe quando um dev é dono de tudo.** Todo custo, zero benefício [33] |
| **Repository genérico sobre Drizzle** | O Drizzle **já é** a abstração sobre SQL. Envolvê-lo é abstrair uma abstração: perde type-safety composicional, ganha nada |
| **CQRS com barramentos/mediator** | Fowler é direto [34]: *"you should be very cautious about using CQRS"*, *"adding CQRS to such a system can add significant complexity"*. Seu app é CRUD com regra financeira — exatamente o caso que ele descreve como inadequado |
| **Event Sourcing "de verdade"** | Fowler lista os custos [35]: integração com sistemas externos vira problema sério (replay dispara notificação duplicada), evolução de código vs. replay *"fica muito bagunçado"*. ⚠️ **Não confunda com o ledger.** Ledger = *fatos de negócio imutáveis* que já são a linguagem do domínio (um pagamento realmente aconteceu). Event sourcing = *o estado da aplicação inteira* reconstruído de eventos, com versionamento de schema, projeções e replay. O primeiro é contabilidade. O segundo é infraestrutura. **Faça o primeiro.** |
| **Monorepo / Turborepo** | Um app, um deploy, um dev. É decoração |

**O ponto que quase todo mundo erra no seu caso:** o PWA offline-first **já é** a complexidade arquitetural do projeto. Um sênior lendo *"decidi por ledger append-only + idempotency keys porque isso torna a sincronização offline uma união de conjuntos sem conflito"* fica muito mais impressionado do que lendo `src/application/usecases/CreateFiadoUseCase.ts`.

---

## 7. Performance em celular fraco

### 7.1 Core Web Vitals — thresholds oficiais (P75)

| Métrica | Bom | Precisa melhorar | Ruim |
|---|---|---|---|
| **LCP** | <= **2,5 s** | 2,5–4,0 s | > 4,0 s |
| **INP** | <= **200 ms** | 200–500 ms | > 500 ms |
| **CLS** | <= **0,1** | 0,1–0,25 | > 0,25 |

**INP substituiu o FID em 12 de março de 2024**; o prazo final de migração e a remoção do FID das APIs foi **9 de setembro de 2024**. Medição no **percentil 75** de todas as page views; em páginas com muitas interações, uma a cada 50 é descartada para eliminar outliers [36].

**Nenhum threshold mudou em 2025/2026** (verificado no changelog de métricas do Chromium). O que mudou: **Soft Navigations API** habilitada por padrão a partir do Chrome 151 — mas **ainda não entra nos CWV/CrUX** — e o **CrUX Dashboard foi descontinuado** (nov/2025), substituído pelo CrUX Vis.

Contexto: taxa de aprovação CWV em jul/2026 = **55,7%** das origens.

### 7.2 Orçamento de JavaScript

O documento canônico do web.dev [37] é de **2018** (< 170 KB de caminho crítico, < 5 s de TTI em 3G lento). Envelheceu.

A referência atual é a série de Alex Russell. **Achado importante: não existe edição 2025** — a série pulou de janeiro/2024 direto para a edição 2026, publicada em **24/11/2025** [38].

**Parâmetros da edição 2026:** rede P75 = **9 Mbps down / 3 Mbps up / 100 ms RTT**. Dispositivo mobile = **Samsung Galaxy A24 4G** (US$ 250, MediaTek Helio G99), contra ASP global de US$ 353. Para a faixa low-end de verdade: Galaxy A51 ou Moto E recente.

| Interativo em | JS-light: total | **JS** | JS-heavy: total | **JS** |
|---|---|---|---|---|
| **3 s** | 2,0 MiB | **~307 KiB** | 1,2 MiB | ~635 KiB |
| **5 s** | 3,7 MiB | **~584 KiB** | 2,3 MiB | ~1178 KiB |

⚠️ **Penalidade por conexões:** *"Using four connections cuts the three-second budget by 350 KiB."*

**Comparação com 2024** (rede 7,2/1,4 Mbps, 94 ms; Galaxy A51): markup-based tinha **75 KiB de JS** para 3 s e **100 KiB** para 5 s. O autor comenta o delta: *"we're seeing budget growth of 600+ KiB for three seconds, and a full megabyte of extra headroom at five seconds."*

**Dados de contexto que valem citar num ADR:**
- Página mobile mediana: **2,6 MiB** — maior que o DOOM (2,48 MiB). P75 > 5,2 MiB.
- JS mobile: **680 KiB no P50, 1,3 MiB no P75** — mais que dobrou desde 2015.
- *"budget device CPUs have not meaningfully improved since 2022"*. Abaixo de US$ 100 = performance de Galaxy A50 de **2019**.
- Banda P75 subiu de ~6 para ~9 Mbps entre nov/2023 e nov/2024 e **não se moveu desde então**. O gap P25↔P75 cresceu **40%**.
- ⭐ **Contra SPA:** o RUM Archive mostra que sites explicitamente SPA geram, em média, **uma (1) soft navigation por hard navigation** — *"Sessions this shallow make a mockery of the idea that we can justify more up-front JavaScript to deliver SPA technology."*

#### 🎯 Orçamento recomendado

Seu app é ferramenta de trabalho aberta várias vezes por dia por um lojista com um cliente na frente dele. Ele não vai "esperar carregar". Adote o alvo agressivo:

| Item | Orçamento | Justificativa |
|---|---|---|
| **JS na 1ª carga (rota principal)** | **<= 170 KB comprimido** | ~55% do budget "3s JS-light" de 2026. Você é offline-first: a 2ª visita vem do service worker |
| JS total do app | <= 300 KB comprimido | Teto "3s JS-light" 2026 |
| Conteúdo total (1ª carga) | <= 600 KB | App de fiado não tem imagem pesada |
| **INP (P75)** | **<= 200 ms** | **A métrica que mais importa aqui** — seu app é interação, não leitura |
| LCP (P75, mobile) | <= 2,5 s | Threshold oficial |
| CLS | <= 0,1 | Threshold oficial |
| **Fontes web** | **0 KB — font stack do sistema** | Fonte web em 4G ruim é FOIT/FOUT garantido e não agrega nada num app utilitário |

### 7.3 Como medir

| Ferramenta | Status verificado |
|---|---|
| **Lighthouse** | npm 13.4.1 (20/07/2026). ⚠️ **v13.0.0 (10/10/2025) foi breaking** — removeu audits antigos do relatório e do JSON. **O score de performance NÃO mudou** |
| **Lighthouse CI** | `@lhci/cli@0.15.1` **fixa `lighthouse: "12.6.1"`** ⚠️ — roda LH 12, não 13 |
| **PageSpeed Insights** | Lab (Lighthouse) + campo (CrUX, janela de 28 dias) |
| **CrUX** | Média móvel de 28 dias, percentil 75, API atualiza ~04:00 UTC |
| **CrUX Vis** | Substitui o Dashboard antigo |
| **WebPageTest** | ⚠️ **NÃO CONFIRMADO** — `webpagetest.org` retorna **403** a requisições automatizadas, `docs.webpagetest.org` retorna 404, e `catchpoint.com/webpagetest` redireciona para `logicmonitor.com`. **Confirme manualmente no navegador antes de depender** |
| **`@next/bundle-analyzer`** | 16.3.4 (31/08/2026) |
| **CPU throttling (DevTools)** | ⚠️ A doc oficial **não publica multiplicadores fixos**. Desde o **Chrome 134** existe **calibração automática** com presets de low-tier e mid-tier mobile — **é essa a opção certa** para simular Android de entrada |

**Pesos do score do Lighthouse:** FCP 10% · Speed Index 10% · **LCP 25%** · **TBT 30%** · **CLS 25%**.

⭐ **INP não entra no score do Lighthouse.** O proxy de lab é o **TBT**, que tem o maior peso individual. Ou seja: **otimize TBT no lab e valide INP em campo (RUM)**.

**Throttling padrão do Lighthouse mobile:** RTT 150 ms, 1,6 Mbps down / 750 Kbps up, **CPU 4×**, device Moto G Power (2022). Compare com o baseline 2026 de Russell (9 Mbps / 100 ms): **o Lighthouse é mais severo na rede e mais leve na CPU** — são modelos diferentes.

⚠️ **Armadilha do LHCI:** como o `@lhci/cli` fixa `lighthouse@12.6.1`, assertions por **nome de audit** seguem a nomenclatura do LH 12 e **divergem** do LH 13 do PSI. **Mitigação: asserte sobre métricas (LCP, TBT, CLS) e budgets de recurso, nunca sobre nomes de audits.**

**Setup mínimo viável:** LHCI no GitHub Actions com budget assertion (grátis, repo público) + `@next/bundle-analyzer` + **`web-vitals` enviando RUM para o PostHog** (o CrUX só tem dados com volume, e um projeto novo não vai ter) + **teste manual num Android de entrada real antes de cada release** — esse último não tem substituto: emulador não sente calor, throttling térmico nem GC pressure.

### 7.4 O que mudou no Next.js 16 (21/10/2025) e 16.3 (03/08/2026)

| Mudança | Detalhe |
|---|---|
| **Turbopack é o bundler padrão** | Estável em dev e build. **2–5× builds mais rápidos, até 10× Fast Refresh** |
| ⚠️ **PPR foi absorvido pelo Cache Components** | **A flag `experimental.ppr` e o export `experimental_ppr` foram REMOVIDOS.** `experimental.dynamicIO` virou `cacheComponents` |
| **`"use cache"`** | Cache é **opt-in explícito** — inverte o default do Next 13–15 |
| **`middleware.ts` → `proxy.ts`** | `proxy.ts` roda no runtime **Node.js**; `middleware.ts` depreciado |
| **React Compiler estável** | `reactCompiler: true` (não é default; usa Babel, aumenta o build) |
| **React 19.2** | View Transitions, `useEffectEvent()`, `<Activity/>` |
| Defaults de `next/image` | `minimumCacheTTL` 60s → **4h**; `qualities` → **`[75]`** |
| Requisitos | **Node >= 20.9** · Safari 16.4+ |
| **16.3** | **Até 90% menos RAM** no dev · builds até 5,5× mais rápidos · +22% de requests no SSR · ⭐ **prefetches pequenos agrupados** (relevante direto para 4G ruim) |

### 7.5 🎯 Táticas, em ordem de retorno

| # | Técnica | Impacto | Como |
|---|---|---|---|
| 1 | **Fronteiras `"use client"` bem colocadas** | ⭐⭐⭐ | O maior desperdício de JS em App Router é `"use client"` alto na árvore, arrastando tudo abaixo. Marque **folhas** (input de valor, botão de quitar), não containers. **Regra: se você escreveu `"use client"` num `layout.tsx` ou `page.tsx`, provavelmente errou** |
| 2 | **RSC por padrão + Server Actions para mutação** | ⭐⭐⭐ | Listagem de clientes, extrato, saldo: tudo Server Component, zero JS enviado |
| 3 | **Streaming com `<Suspense>`** | ⭐⭐⭐ | Em 4G ruim o que mata é o tempo até *alguma coisa* aparecer. Shell em ~200 ms enquanto a query roda. Ataca LCP direto |
| 4 | **Evitar hidratação pesada** | ⭐⭐⭐ | INP ruim em Android de entrada é quase sempre hidratação de árvore grande |
| 5 | **Font stack do sistema** | ⭐⭐ | Zero KB, zero FOIT |
| 6 | **`cacheComponents` + `partialPrefetching`** | ⭐⭐ | Shell instantâneo = diferença entre parecer app nativo e parecer site |
| 7 | **`next/dynamic` para o raro e pesado** | ⭐⭐ | Gráfico, exportação de PDF, scanner de código de barras — nada disso no bundle da tela principal |
| 8 | **`experimental.useOffline`** | ⭐⭐ | Experimental, mas é exatamente o seu caso |
| 9 | **React Compiler** | ⭐ | Ajuda INP em listas grandes; **custo: builds mais lentos**. Ligue **depois** de medir |

⚠️ **Anti-padrão específico do seu contexto:** **não faça o app inteiro client-side "porque é PWA offline"**. Offline-first **não exige SPA** — e o dado do RUM Archive (1 soft navigation por hard navigation em SPAs) mostra que o JS extra raramente se paga. O padrão certo: **RSC para leitura online + service worker servindo shell e dados cacheados offline + fila local (Dexie) para mutações**. Pouco JS quando tem rede, funcionalidade total quando não tem.

---

## RECOMENDAÇÃO FINAL DE STACK

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONT / PWA                                                     │
│  Next.js 16.3.4 (App Router, Turbopack) · React 19.2 · TS 5.x    │
│  Tailwind CSS 4                                                  │
│  @serwist/next 9.5.12  ← service worker (NÃO next-pwa)           │
│  experimental.useOffline: true  ← retry automático de RSC/Actions│
│  navigator.storage.persist() no primeiro save relevante          │
├──────────────────────────────────────────────────────────────────┤
│  ESTADO LOCAL / SYNC                                             │
│  dexie 4.4.5  ← IndexedDB + outbox de mutações                   │
│  ULID/UUIDv7 gerado no cliente  ← idempotência                   │
│  flush: online | visibilitychange | abertura | retry             │
│  (Background Sync só como progressive enhancement — 0% no iOS)   │
├──────────────────────────────────────────────────────────────────┤
│  DADOS / BACKEND                                                 │
│  Supabase (Postgres 17) · Free → Pro ($25/mês) quando faturar    │
│  drizzle-orm 0.45.2 + drizzle-kit 0.31.10  (NÃO os RCs do v1)    │
│  Shared schema + tenant_id + RLS (FORCE + TO authenticated)      │
│  Ledger append-only, double-entry, saldo derivado, centavos int  │
│  Papel via store_members + SECURITY DEFINER (não via JWT)        │
├──────────────────────────────────────────────────────────────────┤
│  VALIDAÇÃO / FORMS                                               │
│  zod 4.5.4 (i18n pt-BR) · zod/mini se o bundle apertar           │
│  react-hook-form 7.87.0 + @hookform/resolvers 5.9.1              │
│  useActionState (React 19) · next-safe-action 8.7.1 (opcional)   │
├──────────────────────────────────────────────────────────────────┤
│  TESTES / CI                                                     │
│  vitest 5.0.0 (⚠️ Node ≥ 22.12) · @playwright/test 1.62.1        │
│  pgTAP + `supabase test db`  ← testes de RLS, INEGOCIÁVEL        │
│  rlsautotest (beta) como gerador da suíte inicial                │
│  @testcontainers/postgresql 12.1.0                               │
│  GitHub Actions — repo PÚBLICO = grátis ilimitado                │
│  Lighthouse CI com budget assertion (asserte métricas, não audits)│
├──────────────────────────────────────────────────────────────────┤
│  OBSERVABILIDADE / PRODUTO                                       │
│  @sentry/nextjs 10.73.0 (replaysOnErrorSampleRate: 1.0)          │
│  Axiom Personal (500 GB/mês) — logs de Server Action + sync      │
│  PostHog free — analytics + session replay + web-vitals RUM      │
│  flags 4.3.0 (MIT) com decide() em código — SEM serviço externo  │
├──────────────────────────────────────────────────────────────────┤
│  HOSPEDAGEM                                                      │
│  Vercel Hobby enquanto for portfólio puro                        │
│  ⚠️ Vercel Pro ($20/seat/mês) OBRIGATÓRIO ao primeiro real       │
│     — Hobby proíbe uso comercial, doação inclusive               │
│  Alternativa sem essa cláusula: Cloudflare Workers/Pages         │
├──────────────────────────────────────────────────────────────────┤
│  ORÇAMENTO DE PERFORMANCE                                        │
│  JS 1ª carga ≤ 170 KB gz · total ≤ 300 KB gz                     │
│  INP ≤ 200 ms (P75) · LCP ≤ 2,5 s · CLS ≤ 0,1 · fontes 0 KB      │
└──────────────────────────────────────────────────────────────────┘
```

**Custo mensal real: R$ 0** na fase de portfólio. **~US$ 45/mês** (Supabase Pro $25 + Vercel Pro $20) no dia em que o primeiro lojista pagar — e nessa altura o produto já se paga.

**Rotina não-negociável desde o dia 1:** `pg_dump` diário para storage próprio. O Supabase Free **não tem backup nenhum**, e você está guardando o dinheiro de terceiros.

---

## ADRs sugeridos

Documente cada um em `docs/adr/NNNN-titulo.md`. Esta lista é, provavelmente, o artefato de portfólio mais valioso do projeto inteiro.

| # | Decisão | Alternativas rejeitadas | Argumento central |
|---|---|---|---|
| **0001** | **Ledger append-only com partidas dobradas; saldo é derivado** | Coluna `saldo` mutável; single-entry | Imutabilidade é *"the most important guarantee from a ledger"*; saldo mutável cria race condition e destrói auditoria |
| **0002** | **Sincronização replica eventos idempotentes com ID gerado no cliente** | LWW no saldo; CRDT counter; sync engine de terceiros | CRDT converge mas não garante invariantes; com append-only + ID do cliente, merge vira união de conjuntos e conflito deixa de existir |
| **0003** | **Dexie + outbox próprio em vez de sync engine** | PowerSync, Zero, Dexie Cloud, RxDB, ElectricSQL, Legend-State | Ledger elimina 95% do que o sync engine resolve; nenhum free tier serve (PowerSync desativa por inatividade, Dexie Cloud = 3 usuários); mercado em consolidação agressiva (Triplit→Supabase, Instant→OpenAI, Electric→Databricks) |
| **0004** | **Estorno por contra-lançamento; nada é deletado** | `UPDATE`/`DELETE` no lançamento errado | *"A correcting entry might even be wrong, in which case it itself can be corrected with yet another transfer"* |
| **0005** | **Valores em centavos (`bigint`)** | `numeric(12,2)`; `float` | Float quebra em `0.1 + 0.2`; bigint é exato, rápido e serializa sem ambiguidade em JSON |
| **0006** | **Append-only forçado em 3 camadas: grants + trigger + FORCE RLS** | Só convenção de código; só grants | Owner e migrações fazem bypass de RLS; grants sozinhos não param `service_role` |
| **0007** | **Multi-tenancy: shared schema + `tenant_id` + RLS** | Schema-per-tenant; database-per-tenant (recomendação do Neon) | Perfil é B2C-shaped (muitos tenants pequenos, schema idêntico); as outras opções multiplicam custo de migração por N lojas |
| **0008** | **Papel vem da tabela de membership, não do JWT** | Custom Access Token Hook com `user_role` na claim | Claims só atualizam no refresh → balconista demitido mantém acesso até o token expirar. Inaceitável para dinheiro |
| **0009** | **Toda policy: `TO authenticated` + `(select fn())` + índice na coluna** | Policy "simples" sem wrapping | Benchmark oficial: **178.000 ms → 12 ms** |
| **0010** | **Views expostas sempre com `security_invoker = on`** | View padrão | Doc do Postgres: por padrão aplicam-se as policies do **owner** — no Supabase isso entrega todos os tenants, silenciosamente |
| **0011** | **Auditoria é o ledger, não trigger nem `pgaudit`** | `supa_audit`; `pgaudit`; tabela de audit log genérica | `supa_audit` arquivado em 16/02/2025; `pgaudit` não captura `auth.uid()` e é *"best-effort and not transactional"*; retenção de log no Free = 1 dia |
| **0012** | **Backend: Supabase** | Neon+Drizzle; Convex; Firebase; Cloudflare D1+DO; Turso | Único com garantia de isolamento **no banco** + auth + RBAC no free tier. Firebase corta o serviço até o mês virar; Turso em transição arquitetural profunda |
| **0013** | **Service worker: Serwist** | `next-pwa` (morto desde 2022); `@ducanh2912/next-pwa` (dormente); SW manual | Único mantido (9.5.12, 22/07/2026), recomendado pela doc oficial do Next.js, com exemplo Turbopack |
| **0014** | **Background Sync é progressive enhancement, não a base** | Depender de Background Sync para o flush | 78,26% de suporte global; **zero no Safari/iOS**, sem previsão |
| **0015** | **Pedir `navigator.storage.persist()` e tratar IndexedDB como buffer** | Assumir que IndexedDB é durável | Safari apaga storage de origem sem interação há 7 dias; Chrome pode despejar sob pressão |
| **0016** | **RSC + streaming; SPA client-side rejeitada** | App 100% client-side "porque é PWA" | SPAs geram ~1 soft navigation por hard navigation (RUM Archive) — o JS extra não se paga; hidratação pesada mata INP em Android de entrada |
| **0017** | **Orçamento de performance: JS <= 170 KB gz na 1ª carga** | Sem orçamento | Budget 2026 P75 (Galaxy A24, 9 Mbps/100 ms) é ~307 KiB para 3 s; adotamos ~55% dele |
| **0018** | **ORM: Drizzle 0.45.2 (linha estável)** | Prisma 8 (RC); Drizzle 1.0-rc; SQL puro | Helpers de RLS/Supabase mais maduros; RCs não entram em portfólio |
| **0019** | **Validação: Zod 4** | ArkType; Valibot | Único com i18n oficial (mensagens em pt-BR); `zod/mini` como saída se o bundle apertar |
| **0020** | **Arquitetura: vertical slices + domínio puro** | Hexagonal completo; Clean Architecture; CQRS; Event Sourcing | O benefício dessas camadas é de colaboração entre times e não existe com um dev; Fowler adverte explicitamente contra CQRS em domínio CRUD |
| **0021** | **Feature flags em código (Flags SDK), sem serviço externo** | Flagsmith; Unleash; PostHog remote evaluation | Dependência de rede no caminho crítico contradiz o requisito offline; "flags as code" permite adotar adapter depois sem refatorar |
| **0022** | **Repositório público** | Repositório privado | GitHub Actions grátis e ilimitado, e é portfólio |
| **0023** | **Vercel Pro obrigatório ao primeiro faturamento** | Manter Hobby | *"Hobby teams are restricted to non-commercial personal use only"* — inclui até doações |
| **0024** | **`pg_dump` diário desde o dia 1** | Confiar no backup do provedor | Supabase Free **não tem backup nenhum** |

---

## O que NÃO foi confirmado (transparência)

**Sobre sync e PWA**
1. Free tier e preços do **ElectricSQL** — nenhuma página de pricing localizada
2. Preços e limites do **Cloud Zero** (Rocicorp) — a doc de deployment não expõe
3. Licença exata da **Open Edition** do PowerSync (a página diz "source-available", sem nomear)
4. Se `@serwist/next` foi testado especificamente contra Next.js **16.3.x** (o peer range permite, mas não há declaração)
5. Suporte a **browser/WASM** do Turso Sync

**Sobre Supabase/Postgres**
6. Se o **Custom Access Token Hook** roda no *refresh* do token
7. Se `LANGUAGE sql` + `SECURITY DEFINER` sofre *inlining* e perde o contexto (alegação recorrente da comunidade, sem confirmação oficial)
8. Disponibilidade dos **Database Advisors** no plano Free
9. Data do último release/commit do **`pgaudit`**
10. Licença e última release do `basejump-supabase_test_helpers`

**Sobre backends**
11. Convex: retenção de logs, backup/PITR
12. Neon: Data API (Beta) no Free; data de sunset formal do Neon RLS (`neon-rls` retorna 404)
13. Firestore: nº máximo de databases no Spark; política de backup no free
14. Cloudflare: Sessions API/read replication no Workers Free; data de GA
15. Turso: restore window no Free; pausa por inatividade; divergência de preço $4,99 (HTML) vs $5,99/mês

**Sobre tooling e performance**
16. 🔴 **Estado operacional do WebPageTest** — 403 persistente, docs 404, Catchpoint → LogicMonitor. **Confirme no navegador antes de depender**
17. Status do **Baselime** em 2026 (comprado pela Cloudflare em abr/2024) — não use de qualquer forma
18. Versão de Lighthouse rodando hoje no PSI
19. Multiplicadores fixos de CPU throttling do DevTools (4×/6×/20×) — a doc não publica; use a calibração do Chrome 134+
20. Suporte nativo a **Standard Schema** em Server Actions do Next.js 16
21. Benchmarks cruzados **oficiais** entre Zod/Valibot/ArkType
22. Suporte a `pgRole`/RLS-sem-policy no Prisma 8
23. Se o Flags SDK funciona 100% fora da Vercel (a doc afirma que sim; o Flags Explorer exige a Vercel Toolbar)

---

## Fontes

**PWA e Next.js**
1. [Next.js — Guides: PWAs](https://nextjs.org/docs/app/guides/progressive-web-apps) (v16.3.4, atualizado 30/07/2026)
2. [Next.js — `useOffline` (hook)](https://nextjs.org/docs/app/api-reference/functions/use-offline)
3. [Next.js — `experimental.useOffline` (config)](https://nextjs.org/docs/app/api-reference/config/next-config-js/useOffline)
4. [Can I Use — Background Sync API](https://caniuse.com/background-sync)
5. [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
6. [web.dev — Persistent storage](https://web.dev/articles/persistent-storage)
7. [Consistent Local-First Software: Enforcing Safety and Invariants (2024)](https://programming-group.com/assets/pdf/papers/2024_Consistent-Local-First-Software-Enforcing-Safety-and-Invariants-for-Local-First-Applications.pdf)

**Ledger, contabilidade e idempotência**
8. [Stripe — Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency)
9. [Modern Treasury — Accounting for Developers, Part I](https://www.moderntreasury.com/journal/accounting-for-developers-part-i)
10. [Square — Books, an immutable double-entry accounting database service](https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/) (16/10/2019)
11. [Modern Treasury — How to Scale a Ledger, Part V: Immutability and Double-Entry](https://www.moderntreasury.com/journal/how-to-scale-a-ledger-part-v)
12. [TigerBeetle — Correcting Transfers](https://docs.tigerbeetle.com/coding/recipes/correcting-transfers/) · [Financial Accounting](https://docs.tigerbeetle.com/coding/financial-accounting/) · [Data Modeling](https://docs.tigerbeetle.com/coding/data-modeling/)
13. [Modern Treasury — Enforcing Immutability in your Double-Entry Ledger](https://www.moderntreasury.com/journal/enforcing-immutability-in-your-double-entry-ledger)
14. [Modern Treasury — How to Think About Ledger Balances](https://www.moderntreasury.com/journal/how-to-think-about-ledger-balances)
15. [Modern Treasury — How to Scale a Ledger, Part VI: Concurrency, Performance](https://www.moderntreasury.com/journal/how-to-scale-a-ledger-part-vi) · [brandur.org — Implementing Stripe-like Idempotency Keys in Postgres](https://brandur.org/idempotency-keys)

**Multi-tenancy e Postgres**
16. [Citus Data — Citus 12: Schema-based sharding for Postgres](https://www.citusdata.com/blog/2023/07/18/citus-12-schema-based-sharding-for-postgres/) (18/07/2023)
17. [Crunchy Data — Row Level Security for Tenants in Postgres](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres) (03/04/2024)
18. [Neon — Multitenancy](https://neon.com/docs/guides/multitenancy)
19. [AWS — Multi-Tenant SaaS Storage Strategies](https://docs.aws.amazon.com/whitepapers/latest/multi-tenant-saas-storage-strategies/multi-tenant-saas-storage-strategies.html) (histórico) · [SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html)
20. [Supabase — Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) · [Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
21. [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
22. [Supabase — RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) · [GitHub Discussion #14576](https://github.com/orgs/supabase/discussions/14576)
23. [PostgreSQL 17 — Row Security Policies](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) · [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
24. [PostgreSQL 17 — CREATE VIEW (`security_invoker`)](https://www.postgresql.org/docs/17/sql-createview.html)
25. [Bytebase — Postgres Row Level Security Footguns](https://www.bytebase.com/blog/postgres-row-level-security-footguns/) · [Supabase — Securing your API](https://supabase.com/docs/guides/api/securing-your-api) · [Column Level Security](https://supabase.com/docs/guides/database/postgres/column-level-security) · [Database Advisors](https://supabase.com/docs/guides/database/database-advisors) · [supabase/supa_audit (arquivado)](https://github.com/supabase/supa_audit)

**Backends e hospedagem**
26. [Vercel — Fair Use Guidelines (Commercial usage)](https://vercel.com/docs/limits/fair-use-guidelines) · [Hobby Plan](https://vercel.com/docs/plans/hobby) · [Limits](https://vercel.com/docs/limits)
— [Supabase Pricing](https://supabase.com/pricing) · [Free Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing) · [Realtime Limits](https://supabase.com/docs/guides/realtime/limits) · [Triplit joins Supabase](https://supabase.com/blog/triplit-joins-supabase) (08/10/2025) · [Offline-first com WatermelonDB](https://supabase.com/blog/react-native-offline-first-watermelon-db)
— [Neon Pricing](https://neon.com/pricing) · [Convex Pricing](https://www.convex.dev/pricing) · [Convex — What is Sync?](https://stack.convex.dev/sync) · [Firebase Pricing](https://firebase.google.com/pricing) · [Firestore — Enable offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline) · [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) · [Turso Pricing](https://turso.tech/pricing) · [tursodatabase/turso](https://github.com/tursodatabase/turso) · [Turso — Upcoming changes (21/01/2025)](https://turso.tech/blog/upcoming-changes-to-the-turso-platform-and-roadmap)

**Sync engines e bancos locais**
— [Serwist (releases)](https://github.com/serwist/serwist/releases) · [Serwist examples](https://github.com/serwist/serwist/tree/main/examples) · [DuCanhGH/next-pwa](https://github.com/DuCanhGH/next-pwa)
— [Dexie Cloud Pricing](https://dexie.org/cloud/pricing) · [Dexie Cloud — Consistency](https://dexie.org/cloud/docs/consistency)
— [RxDB — Replication protocol](https://rxdb.info/replication.html) · [RxDB Premium](https://rxdb.info/premium/)
— [PowerSync Pricing](https://www.powersync.com/pricing) · [PowerSync + Supabase](https://docs.powersync.com/integration-guides/supabase-+-powersync)
— [Electric — Intro](https://electric-sql.com/docs/intro) · [Electric — Writes](https://electric.ax/docs/guides/writes) · [Databricks acquires Electric (11/08/2026)](https://thenewstack.io/databricks-electric-wasm-agentic-postgres/)
— [Zero — Status](https://zero.rocicorp.dev/docs/status) · [Zero — Writing Data (mutators)](https://zero.rocicorp.dev/docs/mutators)
— [The Instant team joins OpenAI](https://www.instantdb.com/essays/instant_team_joins_openai)
— [TanStack DB 0.6](https://tanstack.com/blog/tanstack-db-0.6-app-ready-with-persistence-and-includes) (25/03/2026) · [Automerge blog](https://automerge.org/blog/) · [apache/pouchdb](https://github.com/apache/pouchdb) · [Nozbe/WatermelonDB](https://github.com/nozbe/watermelondb) · [tinyplex/tinybase](https://github.com/tinyplex/tinybase)

**Tooling**
27. [Prisma — No Rust engine](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/no-rust-engine) · [Rust-free Prisma is Ready for Production](https://www.prisma.io/blog/rust-free-prisma-orm-is-ready-for-production) · [Prisma Changelog](https://www.prisma.io/changelog)
— [Drizzle — RLS](https://orm.drizzle.team/docs/rls) · [Connect Supabase](https://orm.drizzle.team/docs/connect-supabase) · [v0→v1 changes](https://orm.drizzle.team/docs/v0-v1-changes)
28. [Zod 4 — Introducing Zod 4](https://zod.dev/v4)
29. [Standard Schema](https://standardschema.dev/)
30. [Vitest 5 release](https://vitest.dev/blog/vitest-5.html)
31. [Supabase — Testing your database (pgTAP)](https://supabase.com/docs/guides/local-development/testing/overview) · [pgTAP extended](https://supabase.com/docs/guides/local-development/testing/pgtap-extended) · [unitautogen/rlsautotest](https://github.com/unitautogen/rlsautotest) · [Testcontainers for Node.js](https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/)
— [GitHub Pricing](https://github.com/pricing) · [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) · [Sentry Pricing](https://sentry.io/pricing/) · [Axiom Pricing](https://axiom.co/pricing) · [Better Stack Pricing](https://betterstack.com/pricing) · [Cloudflare acquires Baselime](https://www.cloudflare.com/press/press-releases/2024/cloudflare-enters-observability-market-with-acquisition-baselime/) · [PostHog Pricing](https://posthog.com/pricing) · [PostHog — Local evaluation](https://posthog.com/docs/feature-flags/local-evaluation) · [Flags SDK](https://flags-sdk.dev/) · [Flagsmith Pricing](https://www.flagsmith.com/pricing) · [Unleash Pricing](https://www.getunleash.io/pricing)

**Arquitetura**
32. [Jimmy Bogard — Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/) (19/04/2018)
33. [Three Dots Labs — Is Clean Architecture overengineering?](https://threedots.tech/episode/is-clean-architecture-overengineering/)
34. [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html) (14/07/2011)
35. [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) (12/12/2005)

**Performance**
36. [web.dev — INP](https://web.dev/articles/inp) · [LCP](https://web.dev/articles/lcp) · [CLS](https://web.dev/articles/cls) · [INP is a Core Web Vital (12/03/2024)](https://web.dev/blog/inp-cwv-launch)
37. [web.dev — Performance budgets 101](https://web.dev/articles/performance-budgets-101) (2018)
38. [Alex Russell — The Performance Inequality Gap, 2026](https://infrequently.org/2025/11/performance-inequality-gap-2026/) (24/11/2025) · [edição 2024](https://infrequently.org/2024/01/performance-inequality-gap-2024/) · [índice da série](https://infrequently.org/series/performance-inequality/)
— [Lighthouse 13.0](https://developer.chrome.com/blog/lighthouse-13-0) · [Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) · [Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) · [CrUX](https://developer.chrome.com/docs/crux) · [CrUX Dashboard deprecation](https://developer.chrome.com/blog/crux-dashboard-deprecation) · [DevTools 134 — CPU calibration](https://developer.chrome.com/blog/new-in-devtools-134) · [Soft Navigations](https://developer.chrome.com/docs/web-platform/soft-navigations) · [Next.js 16](https://nextjs.org/blog/next-16) · [Next.js 16.3](https://nextjs.org/blog/next-16-3)

---

### Resumo em três frases

O ledger append-only com eventos idempotentes de ID gerado no cliente é a decisão que carrega o projeto inteiro: ela resolve simultaneamente a integridade contábil, a auditoria e a sincronização offline, e é o que torna desnecessário adotar um sync engine num mercado que está se consolidando por aquisição. A infraestrutura correta é Supabase com shared schema + RLS bem escrita (as regras de `(select ...)` e `TO authenticated` valem 178 segundos de latência), com backup próprio desde o primeiro dia porque o plano gratuito não tem nenhum. E o maior risco não-técnico do projeto é que a Vercel proíbe uso comercial no plano Hobby — inclusive doações.
