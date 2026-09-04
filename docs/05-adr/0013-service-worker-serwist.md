# ADR-0013 · Service worker: Serwist

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O app é um PWA offline-first em Next.js 16 com Turbopack. Precisa de service worker para o shell, os assets e a instalabilidade.

O ecossistema de PWA em Next.js está cheio de tutoriais desatualizados.

## Decisão

**`@serwist/next` 9.5.12.**

## Verificação primária (npm registry + API do GitHub, 04/09/2026)

| Pacote | Última versão | Publicado | Veredito |
|---|---|---|---|
| `next-pwa` (shadowwalker) | 5.6.0 | **23/08/2022** | ☠️ **Morto há 4 anos** |
| `@ducanh2912/next-pwa` | 10.2.9 | ~2024 | ⚠️ Dormente — **o próprio README manda migrar para `@serwist/next`** |
| **`serwist`** | **9.5.12** | **22/07/2026** | ✅ Vivo, manutenção mensal |
| **`@serwist/turbopack`** | **9.5.12** | **22/07/2026** | ✅ Existe e é publicado junto |

O guia oficial de PWA do Next.js recomenda explicitamente:

> *"For full service-worker-based offline caching, one option is **Serwist**, which provides Next.js integration examples for both **Turbopack** and **webpack**."*

Ambos os exemplos existem no repositório (`examples/next-turbo-basic` e `examples/next-basic`). **A afirmação corrente de que "Serwist não suporta Turbopack" está desatualizada.**

## Alternativas rejeitadas

`next-pwa` (morto), `@ducanh2912/next-pwa` (dormente, autor recomenda migrar), service worker escrito à mão (custo de manutenção sem ganho).

## Consequências

**Positivas** — biblioteca viva, recomendada pela doc oficial, com exemplo Turbopack.

**Negativas** — ⚠️ **um único mantenedor.** Risco de bus factor registrado e aceito: o service worker é uma camada substituível, e a integridade dos dados não depende dele — depende do [ledger](0001-ledger-append-only.md) e do [outbox](0003-dexie-outbox-proprio.md).

⚠️ Também não foi confirmado se `@serwist/next` foi testado especificamente contra Next.js 16.3.x. O peer range (`next: ">=14.0.0"`) permite, mas não há declaração explícita.

## Nota — `experimental.useOffline`

O Next.js 16 traz `experimental.useOffline`, que detecta falha de rede em navegação, prefetch e Server Actions, faz polling com backoff escalonado (500 ms → 1 s → 2 s → 3 s) e reexecuta o request bloqueado ao reconectar.

A própria doc diz *"not recommended for production"*. **Tratar como complemento, nunca substituto do service worker.**
