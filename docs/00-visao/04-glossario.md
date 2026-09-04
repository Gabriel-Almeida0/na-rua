# Glossário e linguagem ubíqua

> Documento de visão · Este glossário é normativo: os termos da coluna "no código" são os nomes reais de tabelas, tipos e funções, e os da coluna "na interface" são as strings que o lojista lê.

## Regra de ouro

**A interface fala português de balcão. O código fala domínio.** Nunca o inverso, e nunca jargão financeiro na tela.

O lojista nunca lê "inadimplência", "recebíveis", "saldo devedor", "amortização", "régua de cobrança" ou "crédito". Ele lê "atrasado", "tá na rua", "quanto deve", "pagou uma parte", "lembrete" e "fiado".

## Termos do domínio

| Conceito | Na interface | No código | Nunca usar na interface |
|---|---|---|---|
| A venda a prazo | **fiado** | `fiado` | crédito, crediário, financiamento, empréstimo |
| O registro completo de um cliente | **caderneta**, **a conta** | `caderneta` | ledger, extrato, razão, conta corrente |
| Quem compra fiado | **freguês**, **cliente** | `cliente` | devedor, inadimplente, tomador, mutuário |
| O quanto ele deve | **quanto deve**, **a conta** | `saldo` (derivado) | saldo devedor, principal, exposição |
| Total a receber de todos | **tá na rua**, **na rua** | `total_na_rua` | carteira, recebíveis, contas a receber |
| Um registro individual | **anotação** | `lancamento` | transação, entrada, movimento |
| Anotar uma venda fiado | **anotar**, **pendurar** | `anotar_fiado` | lançar, registrar transação, debitar |
| Registrar um pagamento | **recebi**, **dar baixa** | `receber_pagamento` | conciliar, baixar título, liquidar |
| Quitar a conta inteira | **quitar**, **pagou tudo**, **zerou** | `quitacao` | liquidação, quitação de principal |
| Pagar parte | **pagou uma parte**, **abateu** | `pagamento_parcial` | amortização parcial |
| Passou do prazo | **atrasou**, **tá atrasado** | `vencido` | inadimplência, mora, default |
| Avisar o cliente | **lembrete**, **recadinho**, **avisar** | `lembrete` | cobrança, notificação de débito, régua |
| Corrigir um erro | **corrigir**, **voltar atrás** | `estorno` | reversal, contra-lançamento (só em doc técnica) |
| Contestação do cliente | **conta contestada** | `contestada` | disputa, litígio |
| Cliente sem dívida | **em dia**, **zerado** | `adimplente` | — |

## Regionalismos aceitos

O produto **entende** estes termos (na busca, no suporte, no material de marketing) mas **não os usa na interface**, porque a compreensão nacional não está validada:

- **pendura / pindura** — origem documentada: o prego onde o comerciante pendurava as contas dos fregueses em tabernas, mercearias e farmácias. Sinônimo: "colocar no prego".
- **"na conta"**, **"na caderneta"**, **"botar na conta"**
- **"acertar"**, **"limpar a conta"** (quitar)
- **"dar um toque"** (lembrar)

> ⚠️ **Pendência de validação.** Não existe levantamento dialetológico publicado mapeando os termos de fiado por região. **"Na rua"**, **"freguês"** e o uso de apelidos ("Maria da Padaria", "Seu Zé do 12") são hipóteses fortes mas **não validadas em campo** — devem ser testados com ~30 lojistas em 3 regiões antes de congelar a UI. A alternativa neutra para "tá na rua" é **"tenho pra receber"**.

## Termos técnicos do projeto

| Termo | Significado |
|---|---|
| **Ledger** | O livro-razão append-only. Fonte de verdade de todo valor. Nunca aparece na interface |
| **Lançamento** | Uma linha imutável do ledger. Tem direção (débito/crédito), valor em centavos e conta |
| **Partida dobrada** | Todo evento gera no mínimo dois lançamentos que se equilibram. Se a soma de débitos ≠ soma de créditos, há bug |
| **Saldo derivado** | O saldo nunca é armazenado como estado mutável; é sempre calculado dos lançamentos |
| **Outbox** | Fila local de mutações que ainda não subiram para o servidor |
| **Pending / Posted** | Lançamento criado offline é `pending`; após confirmação do servidor vira `posted` |
| **Estorno** | Contra-lançamento que anula um lançamento errado. Nada é deletado |
| **Idempotência** | Reenviar o mesmo lançamento não cria duplicata, porque o ID vem do cliente |
| **Tenant** | Uma loja. Todo dado é isolado por `store_id` via RLS |
| **Papel** | `dono`, `gerente` ou `balconista`. Vem da tabela de membership, nunca do JWT |

## Valores monetários

**Toda quantia é `bigint` em centavos.** Nunca `float`, nunca `real`, nunca reais decimais.

```
R$ 47,50  →  4750
```

Justificativa em [ADR-0005](../05-adr/0005-valores-em-centavos.md). Em resumo: `0.1 + 0.2 !== 0.3` é uma curiosidade num tweet e é um processo no Procon numa caderneta.
