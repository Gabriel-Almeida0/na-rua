# ADR-0019 · Validação: Zod 4

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Um schema de validação compartilhado entre cliente e servidor: no cliente via `zodResolver`, no servidor dentro da Server Action, com o resultado voltando pela `useActionState` do React 19.

## Decisão

**`zod@4.5.4`**, com `zod/mini` como saída se o bundle apertar.

## O motivo decisivo (que não é popularidade)

⭐ **É o único com i18n oficial.**

O usuário é um lojista brasileiro. As mensagens de erro precisam sair em português **sem manter um mapa de tradução paralelo**. Num projeto solo, essa é a diferença entre a mensagem de erro estar certa e estar em inglês.

## Números oficiais do Zod 4

| Métrica | Zod 3 | Zod 4 | Ganho |
|---|---|---|---|
| Parse de string | 363 µs/iter | 24.674 ns/iter | **14,71×** |
| Parse de objeto | 805 µs | 124 µs | **6,5×** |
| Bundle core (gzip) | 12,47 kB | **5,36 kB** | −57% |
| **`zod/mini`** (gzip) | 12,47 kB | **1,88 kB** | **−85%** |

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **ArkType** | Aposta de nicho para um projeto solo que precisa de estabilidade |
| **Valibot** | Só ganha se o bundle for o gargalo — e com `zod/mini` (1,88 kB) não é |

⚠️ Circulam benchmarks cruzados entre as três libs. **Não encontrei benchmark oficial reprodutível.** E a comparação é irrelevante aqui: são formulários de 10 campos.

## Consequências

**Positivas** — um schema só, mensagens em português de graça, e o **Standard Schema** (especificação de interface TypeScript, ~60 linhas, **zero bytes de runtime**) mantém a porta aberta para trocar depois sem reescrever os consumidores.

**Negativas** — nenhuma relevante. Se o orçamento de 170 KB apertar, `zod/mini` resolve sem trocar de biblioteca.

⚠️ Suporte nativo a Standard Schema em Server Actions do Next.js 16: **não confirmado** (há discussão aberta, não implementação).
