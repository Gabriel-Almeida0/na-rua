# ADR-0001 · Ledger append-only com partidas dobradas; saldo derivado

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O produto guarda o dinheiro que o lojista tem a receber. O saldo não pode dar errado — e há duas fontes de verdade (o celular e o servidor), o que transforma "somar valores" num problema de sistemas distribuídos.

Uma caderneta de fiado parece simples demais para contabilidade formal. Não é: tem crédito concedido, pagamento parcial, estorno, crédito a favor do cliente e desconto.

## Decisão

Modelar todo valor como **lançamentos imutáveis em partidas dobradas**, num ledger append-only. **O saldo nunca é armazenado como estado mutável — é sempre derivado da soma dos lançamentos.**

Contas: `receivable:<cliente>` e `cash` (natureza débito); `revenue` e `adjustment` (natureza crédito).

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **Coluna `saldo` mutável** | Race condition em UPDATE concorrente; destrói a auditoria; e torna a sincronização offline um problema de resolução de conflito |
| **Single-entry** (uma coluna com sinal) | Funciona, mas perde a validação estrutural gratuita (Σ débitos = Σ créditos) e a capacidade de responder "de onde veio esse dinheiro" |

## Consequências

**Positivas**
- Extrato e auditoria de graça
- Sem race condition de update concorrente — não existe update
- ⭐ **A sincronização vira união de conjuntos.** Um conjunto append-only de lançamentos com IDs únicos é um G-Set: merge comutativo, associativo e idempotente. É isto que torna desnecessário um sync engine (ver [ADR-0003](0003-dexie-outbox-proprio.md))
- Bug de contabilidade é detectado no ato: se Σ débitos ≠ Σ créditos, o sistema criou ou destruiu dinheiro

**Negativas**
- Mais linhas no banco que single-entry
- `SUM()` é O(n) — aceitável neste volume (centenas de lançamentos por cliente, não milhões). Cache só quando o `EXPLAIN ANALYZE` provar necessidade, e **com o job de reconciliação no mesmo commit**
- Exige disciplina: toda operação de valor precisa gerar a partida completa

## Fontes

- Modern Treasury — *Accounting for Developers, Part I*; *How to Scale a Ledger, Part V*: **"Immutability is the most important guarantee from a ledger."**
- Square — *Books, an immutable double-entry accounting database service*: *"a well-established, public-domain, battle-tested approach to modeling financials"*
- TigerBeetle — *Financial Accounting*, *Data Modeling*
