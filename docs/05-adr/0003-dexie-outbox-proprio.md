# ADR-0003 · Dexie + outbox próprio, em vez de sync engine de terceiros

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O app precisa funcionar offline e sincronizar depois. Existe um mercado inteiro de sync engines prontos. A pergunta é se algum deles compensa.

## Decisão

**Dexie 4.4.5 (IndexedDB) + fila outbox própria + Supabase.** Sem sync engine de terceiros.

## Alternativas rejeitadas

| Opção | Por que não |
|---|---|
| **PowerSync** | Tecnicamente o melhor pronto-para-usar. Free tier **desativa após 1 semana de inatividade**; degrau de US$ 49/mês |
| **Zero (Rocicorp) 1.9** | Modelo de mutators server-autoritativos é elegante. Exige operar `zero-cache` + logical replication; faltam SSR e agregações |
| **Dexie Cloud** | Bom modelo de consistência. Free tier permite **3 usuários de produção** — um dono e dois balconistas e acabou |
| **RxDB** | A própria doc admite que **não garante exactly-once**: *"The document write could have already reached the remote instance and be processed, while only the answering fails"* |
| **ElectricSQL** | 🔴 Só faz read-path: *"Electric does not do write-path sync"*. Resolve metade do problema |
| **Legend-State** | v3 em beta há 2 anos; `latest` estável é de ago/2024 |
| **WatermelonDB** | Foco React Native; conflito por *"latest change wins"*; semi-dormente |
| **PouchDB** | Sem release desde jun/2024; conflito determinístico mas **arbitrário** |
| **Automerge / Yjs / Jazz** | CRDT no dinheiro. Errado por construção — ver [ADR-0002](0002-eventos-idempotentes.md) |
| **Triplit / Instant DB** | Ver risco de plataforma abaixo |

## Justificativa

**1. O ledger já elimina 95% do que um sync engine resolve.** Com [append-only](0001-ledger-append-only.md) e [IDs do cliente](0002-eventos-idempotentes.md), não há resolução de conflito, CRDT ou operational transform a fazer. Só é preciso uma fila confiável e `ON CONFLICT DO NOTHING`. Semanas, não meses.

**2. Nenhum free tier serve** — ver tabela acima.

**3. 🔴 Risco de plataforma.** O segmento local-first está em consolidação agressiva:

| Projeto | O que aconteceu |
|---|---|
| Triplit | Time contratado pela Supabase (10/2025); npm parado desde jul/2025 |
| Instant DB | **OpenAI comprou o time.** Cloud desliga em 31/08/2027 |
| ElectricSQL | **Adquirida pela Databricks** (08/2026); foco vira Postgres em sandbox de agente de IA |

E a Supabase declarou publicamente que não vai resolver offline em primeira mão: *"solving offline mode in a way that works for everyone is a formidable challenge"*, sem roadmap com data.

> Um dev solo construindo um produto financeiro com horizonte de anos **não deve amarrar a integridade contábil a um sync engine de startup**. Amarre ao Postgres, que estará vivo em 2036.

## Consequências

**Positivas** — controle total sobre a integridade; custo R$ 0; sem risco de plataforma; e é uma decisão de arquitetura defensável, não uma escolha de ferramenta.

**Negativas** — a fila é código nosso, com nossos bugs. Mitigação: os [8 cenários obrigatórios de teste de sincronização](../04-arquitetura/07-qualidade-e-observabilidade.md).

**Porta de saída:** se a fila virar gargalo **medido**, migrar para PowerSync. O ecossistema maduro é Postgres↔SQLite. Não antes de medir.
