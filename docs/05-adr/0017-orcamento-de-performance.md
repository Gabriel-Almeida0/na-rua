# ADR-0017 · Orçamento de performance: JS ≤ 170 KB na primeira carga

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O app é uma ferramenta de trabalho aberta várias vezes por dia, com um cliente esperando no balcão. **Ele não vai esperar carregar.**

Referência atual: a edição 2026 do *Performance Inequality Gap* — rede P75 de **9 Mbps / 100 ms RTT**, dispositivo **Samsung Galaxy A24**. O orçamento "3s JS-light" é **~307 KiB de JS**.

Contexto que justifica o rigor:
- Página mobile mediana hoje: **2,6 MiB** — maior que o DOOM original (2,48 MiB)
- JS mobile: 680 KiB no p50, **1,3 MiB no p75**
- *"budget device CPUs have not meaningfully improved since 2022"*. Abaixo de US$ 100 = performance de um Galaxy A50 de **2019**

## Decisão

| Item | Orçamento | Falha o build |
|---|---|---|
| **JS na 1ª carga (rota principal)** | **≤ 170 KB** comprimido | ✅ |
| JS total | ≤ 300 KB comprimido | ✅ |
| Conteúdo total (1ª carga) | ≤ 600 KB | ✅ |
| **Fontes web** | **0 KB** | ✅ |
| **INP (p75)** | **≤ 200 ms** | monitorado em campo |
| LCP (p75, mobile) | ≤ 2,5 s | ✅ |
| CLS | ≤ 0,1 | ✅ |
| Página pública da conta | < 50 KB | ✅ |

**170 KB é ~55% do budget de 2026.** Adotamos a folga porque o app é offline-first: a segunda visita vem do service worker, então o custo real está na primeira.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Não ter orçamento | Sem número, todo bundle cresce |
| Usar o orçamento cheio (307 KiB) | O contexto de uso é mais exigente que a média |
| O documento canônico do web.dev (2018, < 170 KB de caminho crítico em 3G lento) | Envelheceu — a referência atual é a série do Alex Russell |

## Consequências

**Positivas** — força as decisões certas por construção: sem biblioteca de gráficos, sem biblioteca de animação, sem framework de componentes pesado, sem fonte web, `"use client"` só em folhas.

**Negativas** — algumas bibliotecas convenientes ficam de fora. É intencional.

## ⚠️ Armadilhas de medição

- **INP não entra no score do Lighthouse.** O proxy de lab é o **TBT** (peso 30%, o maior individual). **Otimize TBT no lab e valide INP em campo.**
- `@lhci/cli@0.15.1` **fixa `lighthouse@12.6.1`**, enquanto o PSI roda LH 13 — os nomes de audit divergem. **Asserte sobre métricas e budgets de recurso, nunca sobre nomes de audit.**
- O CrUX só tem dados com volume. Enviar `web-vitals` para o PostHog é o RUM real.
- **Nenhum emulador substitui um Android de entrada real** — ele não sente calor, throttling térmico nem pressão de GC.
