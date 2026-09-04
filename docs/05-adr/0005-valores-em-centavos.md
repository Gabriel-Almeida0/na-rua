# ADR-0005 · Valores monetários em centavos (`bigint`)

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Erro de arredondamento em app de fiado destrói a confiança na ferramenta inteira. Review real de um concorrente:

> *"quando você coloca um valor por exemplo 518,44 ele coloca 518,45"*

E outro, mais grave:

> *"Hoje excluí dois produtos que o cliente pagou, aí ficou um produto de $164,90, mas no saldo o valor estava $87,20. **Quanto dinheiro eu já perdi assim?**"*

## Decisão

**Todo valor é `bigint` em centavos.** `R$ 47,50` → `4750`.

A conversão acontece **exatamente uma vez**, na borda da interface. O tipo `Centavos` do domínio nunca aceita um número de reais.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| `float` / `real` | `0.1 + 0.2 !== 0.3`. É uma curiosidade num tweet e um processo no Procon numa caderneta |
| `numeric(12,2)` | Exato no Postgres, mas serializa como string em JSON e volta como float no JavaScript se alguém descuidar. Bigint em centavos não tem essa borda |
| Biblioteca de decimal no cliente | Peso de bundle contra um orçamento de 170 KB, para resolver um problema que o inteiro já resolve |

## Consequências

**Positivas** — exato, rápido, serializa sem ambiguidade, e a constraint `valor_centavos > 0` é trivial de expressar no schema.

**Negativas** — exige disciplina de formatação na borda. Mitigação: o tipo `Centavos` e a função de formatação são as **únicas** portas de entrada e saída de valor no domínio, e são testadas isoladamente.

**Corolário:** arredondamento não existe. Se não é centavo inteiro, não é valor válido.
