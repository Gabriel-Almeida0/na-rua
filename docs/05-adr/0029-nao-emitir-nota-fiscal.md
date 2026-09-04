# ADR-0029 · Não emitir documento fiscal

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

"Já que registra a venda, por que não emite a nota?" é pergunta recorrente. A resposta é de escopo, não de dificuldade técnica.

**Registrar não é emitir.** O fato gerador do ICMS é a circulação da mercadoria, não o registro dela num software de gestão. Se o lojista já devia emitir NFC-e naquela venda, ele já devia antes de instalar o app.

## Decisão

**O Na Rua não emite NF-e nem NFC-e.** Se for necessário no futuro, **integrar** com um emissor existente (Focus NFe, TecnoSpeed, NFe.io, Bling, Tiny), deixando a responsabilidade fiscal e o certificado digital com o lojista.

## Por que

Emitir NFC-e a partir do SaaS exigiria:

- Credenciamento por estado — **27 legislações estaduais diferentes**
- Certificado digital A1 de **cada lojista**
- Homologação em cada SEFAZ
- Contingência (SVC / off-line)
- Gestão de rejeições, cancelamento e inutilização de numeração
- Guarda do XML por **5 anos**

> **Isso é um produto inteiro, não uma feature.**

E contraria o [foco radical no fiado](../00-visao/02-proposta-de-valor.md), que é a estratégia competitiva: o vazio de mercado está exatamente entre o app amador e o ERP. Emitir nota é entrar na briga com o Kyte, o Bling e o vhsys — com produto pior.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Emitir direto | 27 SEFAZ, certificado por lojista, guarda de XML |
| Integrar com emissor **no MVP** | Complexidade sem demanda validada. Fica no radar de roadmap |

## Consequências

⚠️ **Consequência contratual obrigatória:** os Termos de Uso devem deixar explícito que o software **não é emissor de documento fiscal** e que a obrigação tributária permanece integralmente com o lojista.

⚠️ **Objeção comercial a antecipar:** o app cria um registro digital datado das vendas, incluindo as que talvez não estivessem sendo documentadas. O lojista **vai** levantar essa questão, e o produto precisa de resposta pronta. *Se o registro pode ser usado como prova de venda não escriturada é questão fiscal — não confirmado; verificar com contador.*

## ⭐ O que fazemos em vez disso

**Alerta de limite do MEI.** O app já conhece as vendas registradas:

> *"Você já faturou R$ 68.000 este ano — atenção ao limite do MEI (R$ 81.000)."*

É utilidade concreta, barata de construir, resolve uma ansiedade real do público-alvo, e **ninguém faz**.

⚠️ Há indicação de que, a partir de 2027, a emissão de nota em vendas para pessoa física deixaria de ser opcional para o MEI. **Fonte secundária, não confirmada** — se confirmar, cresce a demanda por integração com emissor. Manter no radar.
