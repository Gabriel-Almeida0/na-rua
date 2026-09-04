# Sincronização offline

> Fundamentação em [pesquisa técnica](00-pesquisa-tecnica.md) §1 e §2. Decorre diretamente do [ledger](03-ledger-e-integridade.md).

## A regra que resume tudo

> **Sincronize eventos, nunca estado. Derive o saldo, nunca o transmita.**

Com o ledger append-only, **conflito de saldo deixa de existir por construção**. A sincronização não precisa resolver conflito — ela precisa apenas ser uma fila confiável com deduplicação. Isso é semanas de trabalho, não meses, e é a razão de não adotarmos sync engine de terceiros.

---

## O mecanismo

```
┌─────────────────────── DISPOSITIVO ──────────────────────────┐
│                                                              │
│  "fiado de R$ 47,50 pra Dona Maria"                          │
│         │                                                    │
│         ▼                                                    │
│  1. Gera ULID/UUIDv7 NO CLIENTE      ──────► id do evento    │
│  2. Grava lançamento no Dexie                                │
│  3. Enfileira no outbox  ── mesma transação Dexie ──┐        │
│  4. UI mostra saldo novo + confirmação verde        │        │
│                                                     │        │
│     flush: online │ visibilitychange │ abertura │ retry      │
└─────────────────────────────────────────────────────┼────────┘
                                                      │
              POST /sync — lote de eventos            ▼
┌──────────────────────── POSTGRES ────────────────────────────┐
│  INSERT INTO ledger_entries (…)                              │
│    ON CONFLICT (id) DO NOTHING;      ◄── idempotência total   │
│                                                              │
│  • RLS valida tenant e papel                                 │
│  • Constraint valida partida dobrada                         │
│  • Trigger bloqueia UPDATE e DELETE                          │
│                                                              │
│  saldo = SUM(débitos) − SUM(créditos)   ◄── DERIVADO          │
└──────────────────────────────────────────────────────────────┘
```

### Por que isso elimina o problema em vez de resolvê-lo

| Propriedade | Consequência |
|---|---|
| **ID gerado no cliente** | Reenvio duplicado, retry automático, lojista apertando salvar três vezes no 4G ruim — tudo colapsa no mesmo `id`. É a ideia das *idempotency keys* da Stripe, aplicada na **origem** em vez da borda |
| **Append-only** | Não existe UPDATE, logo não existe conflito de UPDATE. O merge é união de conjuntos |
| **Saldo derivado** | Dois balconistas offline não conflitam. Ambos os lançamentos entram e o saldo passa a 190. Correto por construção |
| **Auditoria de graça** | Quem lançou, quando e de qual dispositivo está na própria linha |
| **ULID/UUIDv7, não UUIDv4** | Ordenáveis por tempo, preservam a localidade do índice B-tree. UUIDv4 aleatório fragmenta o índice |

---

## Quando o flush acontece — e por que não é Background Sync

| Capacidade | Android/Chrome | iOS/Safari |
|---|---|---|
| Service worker + instalação | ✅ | ⚠️ só manual, pelo menu Compartilhar |
| Web Push | ✅ | ✅ iOS 16.4+, **só se instalado na tela de início** |
| **Background Sync API** | ✅ | ❌ **nenhuma versão** — 78,26% de suporte global |
| Periodic Background Sync | ⚠️ só Chromium | ❌ |

> 🔴 **Consequência não-negociável:** o flush da fila **não pode depender de Background Sync**.

Os gatilhos reais:

```ts
// 1. Abertura do app
// 2. Evento 'online' do browser
// 3. visibilitychange → visível  (o lojista voltou pro app)
// 4. Retry com backoff após falha
// 5. Background Sync — APENAS como progressive enhancement
```

O Next.js 16 traz `experimental.useOffline`, que detecta falha de rede em navegação, prefetch e Server Actions, faz polling com backoff escalonado (500 ms → 1 s → 2 s → 3 s) e reexecuta o request bloqueado ao reconectar. É **complemento** ao service worker, nunca substituto — a própria doc marca como não recomendado para produção.

---

## 🔴 O risco que quase todo tutorial de PWA ignora

**IndexedDB não é armazenamento durável.**

| Navegador | Eviction |
|---|---|
| Chrome/Chromium | Sob pressão de disco, LRU — **pula origens com persistência concedida** |
| Firefox | Sob pressão. Persistente: até 50% do disco |
| **Safari** | 🔴 **Apaga o storage de origens sem interação do usuário nos últimos 7 dias de uso do navegador** |

### Mitigação obrigatória

```ts
// Chamar dentro de um gesto do usuário, depois que ele salvou algo importante
const persistido = await navigator.storage.persist()
```

O Chrome não mostra prompt — decide por heurística: nível de engajamento, **site instalado ou favoritado**, e **permissão de notificação concedida**.

> ⭐ **Insight de produto:** pedir permissão de notificação e conseguir a instalação na tela de início **não são só features de engajamento — são o mecanismo pelo qual o app conquista storage persistente.** Isso reposiciona o convite de instalação de "nice to have" para "requisito de durabilidade".

### E mesmo assim

`persist()` pode retornar `false`. O usuário pode limpar os dados do site. O iOS tem regras próprias.

> **O IndexedDB é um buffer de trânsito. A verdade é o Postgres.**

Consequências no produto:
- Alertar quando a fila ficar velha demais (`Faz 2 dias que não pego internet…`)
- **`pg_dump` diário** — o plano gratuito do Supabase não tem backup nenhum
- Exportação local disponível a qualquer momento

Ver [ADR-0015](../05-adr/0015-indexeddb-e-buffer.md).

---

## Por que não um sync engine pronto

O mercado local-first está em **consolidação agressiva**, e isso não aparece em tutorial:

| Projeto | O que aconteceu |
|---|---|
| **Triplit** | Time contratado pela Supabase (10/2025). npm parado desde jul/2025 |
| **Instant DB** | **OpenAI comprou o time.** Cadastros encerrados; cloud desliga em 31/08/2027 |
| **ElectricSQL** | **Adquirida pela Databricks** (08/2026). Foco declarado agora é Postgres em sandbox de agente de IA |
| **Legend-State** | v3 em beta há 2 anos; `latest` estável é de ago/2024 |
| **PouchDB** | Sem release desde jun/2024 |
| **WatermelonDB** | Semi-dormente, foco React Native, conflito por *"latest change wins"* |

E a Supabase declarou publicamente que **não vai resolver offline em primeira mão**: *"solving offline mode in a way that works for everyone is a formidable challenge"*, sem roadmap com data.

### Os que sobrevivem, e por que ainda assim não

| Opção | Por que não agora |
|---|---|
| **PowerSync** | Tecnicamente o melhor pronto-para-usar. Mas o free tier **desativa após 1 semana de inatividade** e o degrau é US$ 49/mês |
| **Zero (Rocicorp) 1.9** | Modelo de mutators server-autoritativos é elegante. Mas exige operar `zero-cache` + logical replication, e faltam SSR e agregações |
| **Dexie Cloud** | Bom modelo de consistência. **Free tier permite 3 usuários de produção** — um dono e dois balconistas e acabou |
| **RxDB** | A própria doc admite que **não garante exactly-once**: *"The document write could have already reached the remote instance and be processed, while only the answering fails"* |

> **A lição:** um dev solo construindo um produto financeiro com horizonte de anos **não deve amarrar a integridade contábil a um sync engine de startup**. Amarre ao Postgres, que estará vivo em 2036.

Ver [ADR-0003](../05-adr/0003-dexie-outbox-proprio.md).

**Porta de saída:** se a fila própria virar gargalo **medido**, o caminho é PowerSync — o ecossistema maduro é Postgres↔SQLite e a migração é viável. Mas só depois de medir.

---

## Como o estado é comunicado

| Estado | Mostrar | **Nunca** |
|---|---|---|
| Offline, gravado | Pílula: `Sem internet — está tudo anotado aqui` | Ícone de erro · "Falha" · modal |
| Salvando offline | Confirmação **idêntica** à online | Spinner · "Pendente" · item cinza |
| Voltou a rede | Toast 2 s: `Tudo salvo na nuvem ✓` | Barra de progresso persistente |
| Sem sync > 48 h | Faixa âmbar informativa | "Risco de perda de dados" |
| Dois aparelhos divergiram | **Nada** — somam | Diálogo "Resolver conflito" |

> **Regra de ouro:** o item lançado offline **nunca** aparece visualmente diferente do item online. Marcar o item como incerto ensina o lojista a desconfiar — e desconfiança significa manter o caderno aberto ao lado.

---

## O bug que mata este tipo de app

Pista técnica extraída de uma review real da BukuWarung:

> *"setelah update aplikasinya force closed trs, **tapi kalo internet dimatikan dia bisa dibuka**"*
> — depois do update o app fecha sozinho, **mas se desligar a internet ele abre**

Uma chamada de rede na inicialização derrubava o app inteiro.

> **Regra:** a tela inicial renderiza a partir do banco local **antes** de qualquer chamada de rede. Nenhuma feature flag, remote config ou verificação de versão pode bloquear a tela.

É também por isso que [feature flags são avaliadas em código](../05-adr/0021-feature-flags-em-codigo.md), sem serviço externo: adicionar um serviço de flag é adicionar uma dependência de rede no caminho crítico de um app que precisa funcionar offline.

---

## Migração de aparelho

Causa nº 1 de perda de dados, logo **fluxo de produto de primeira classe**:

- Recuperação por **número de telefone**, não por senha esquecida
- Trocar de número é **autoatendimento** — na BukuWarung isso levava 2 semanas de suporte
- **Perder o login nunca significa perder o caderno:** o app lê os dados locais mesmo sem autenticação
- Snapshot local automático antes de qualquer migração de schema
- Após restaurar, o app **compara** a contagem de lançamentos local e remota e mostra o resultado ao lojista
