# ADR-0004 · Estorno por contra-lançamento; nada é deletado

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

"Não consigo corrigir o que lancei errado" é reclamação recorrente nos apps concorrentes, nos três países analisados:

> *"Lancei um crédito quando na verdade é um débito e não encontrei opção de alteração ou excluir."*
> *"Absurdo não poder excluir um lançamento... Fica 'sujo' o relatório. Muito amadorismo."*

O lojista **precisa** poder corrigir. E o ledger **precisa** ser imutável.

## Decisão

Corrigir é **lançar o inverso**, com `estorna_id` apontando para a transação original. **Estratégia de reversal completo, não delta.**

Na interface, o lojista vê **"corrigir"**. Ele nunca precisa saber o que é um contra-lançamento.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| `UPDATE` no lançamento errado | Destrói a auditoria e reintroduz conflito de sincronização |
| `DELETE` | Idem, e o servidor nunca envia DELETE para o cliente |
| **Ajuste por delta** (`R$ 50 − R$ 5`) | Tecnicamente válido, mas ilegível: o lojista precisa explicar o extrato ao freguês, e `R$ 50 − R$ 50 + R$ 45` é compreensível enquanto `R$ 50 − R$ 5` parece um desconto que ninguém combinou |

## Consequências

**Positivas**
- Preserva o erro original, quando ocorreu, a correção e seus timestamps — formando *"a timeline of the particular business event"*
- Uma correção errada pode ser corrigida por outra: *"A correcting entry might even be wrong, in which case it itself can be corrected with yet another transfer"*
- Funciona offline sem nenhum tratamento especial

**Negativas**
- Mais linhas no extrato. Mitigação de UI: agrupar visualmente a cadeia original → estorno → correção
- Exige que a interface traduza "contra-lançamento" para "corrigir" sem vazar o termo técnico

## Fontes

TigerBeetle — *Correcting Transfers*. Modern Treasury — *Enforcing Immutability in your Double-Entry Ledger*.
