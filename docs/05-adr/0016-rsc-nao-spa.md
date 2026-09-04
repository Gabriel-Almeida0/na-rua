# ADR-0016 · RSC + streaming; SPA client-side rejeitada

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Existe um reflexo forte: "é um PWA offline, então tem que ser SPA client-side". O reflexo está errado, e é caro.

O usuário está num Android de entrada em 4G ruim. **Hidratação pesada é a causa mais comum de INP ruim** nesse hardware.

## Decisão

**RSC por padrão + Server Actions para mutação + streaming com `<Suspense>`.** O service worker serve o shell e os dados cacheados; a fila local (Dexie) recebe as mutações offline.

`"use client"` só em **folhas**: campo de valor, botão de quitar, seletor de tom.

> **Regra:** se você escreveu `"use client"` num `layout.tsx` ou `page.tsx`, provavelmente errou.

## Alternativas rejeitadas

**App 100% client-side "porque é PWA".** Offline-first **não exige SPA**.

E há um dado que fecha o argumento: o RUM Archive mostra que sites explicitamente SPA geram, em média, **uma (1) soft navigation por hard navigation** —

> *"Sessions this shallow make a mockery of the idea that we can justify more up-front JavaScript to deliver SPA technology."*

O JavaScript extra da SPA raramente se paga, e aqui ele competiria diretamente com um orçamento de 170 KB.

## Consequências

**Positivas**
- Lista de clientes, extrato e saldo são Server Components: **zero JS enviado**
- Streaming ataca o LCP direto — shell em ~200 ms enquanto a query roda
- Menos hidratação = melhor INP no aparelho que importa

**Negativas** — exige disciplina nas fronteiras de cliente/servidor, e exige que a leitura offline venha do service worker e do Dexie em vez de um store global. É complexidade real, e é a complexidade certa: ela vive no lugar onde o produto é difícil.

## Nota sobre o Next.js 16

- Turbopack é o bundler padrão (2–5× builds mais rápidos)
- ⚠️ **PPR foi absorvido pelo Cache Components**: `experimental.ppr` e `experimental_ppr` foram **removidos**; `experimental.dynamicIO` virou `cacheComponents`
- `"use cache"` — o cache passou a ser **opt-in explícito**
- `middleware.ts` → `proxy.ts` (runtime Node.js)
- 16.3: até 90% menos RAM em dev e **prefetches pequenos agrupados** — relevante direto para 4G ruim
