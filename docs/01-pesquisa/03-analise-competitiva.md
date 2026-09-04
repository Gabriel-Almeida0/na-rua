# Análise competitiva

> Síntese executiva da [pesquisa de mercado](00-pesquisa-de-mercado.md). Todos os números vêm de coleta direta da Google Play Store em 04/09/2026 e de páginas oficiais de preço. "Instalações" é contagem acumulada bruta (lifetime), não usuário ativo.

## O mapa em uma imagem

```
                          PROFISSIONALISMO
                                 ▲
              Kyte ●             │
        (3,36 mi inst.)          │        ○ Na Rua
         R$ 49,90/mês            │      (posição-alvo)
      fiado atrás de paywall     │       R$ 29,90/mês
                                 │
     Bling ● vhsys ●             │
    R$ 57–120/mês                │
    fiado nem existe             │
    ─────────────────────────────┼─────────────────────────────►
                                 │                    FOCO NO FIADO
                                 │
                                 │   ● CobradorApp (557 mil)
                                 │   ● Me Deve (273 mil)
                                 │   ● Fiado (248 mil)
                                 │     R$ 5–15, com anúncios
                                 │     desenvolvedor solo
                                 │
                                 │   ····· cauda longa: 15+ apps
                                 │         abaixo de 800 instalações
                                 ▼
```

**O vazio é nítido e é onde o Na Rua vive:** entre o app amador com anúncio e o ERP de R$ 50–120.

## Concorrentes diretos — apps de fiado brasileiros

| App | Nota | Avaliações | Instalações | Anúncios | Preço |
|---|---|---|---|---|---|
| **CobradorApp** | 4,4 | 2.510 | **557.356** | Não | R$ 0,99 – 245,00 |
| **Me Deve** | 4,0 | 4.440 | **273.137** | Sim | R$ 0,99 – 14,99 |
| **Fiado** (AF Apps) | 4,3 | 1.190 | **247.955** | Sim | R$ 5,00 – 10,00 |
| Controle de vendas: Meu fiado | **3,6** | 639 | 20.030 | Sim | R$ 19,99 – 99,99 |
| Fiado Fácil (4ThinkS) | 4,7 | 102 | 7.221 | Sim | — |
| Fiado Zap | **3,4** | 31 | 5.205 | Sim | R$ 9,99 – 29,99 |
| Fiado Pago | 4,6 | 24 | 2.609 | Sim | R$ 9,90/mês |
| *…mais 13 apps* | — | — | **< 800 cada** | — | — |

**Estrutura revelada:** três apps concentram ~1,08 milhão de instalações; **todo o resto soma menos de 50 mil**. Nenhum é operado por empresa identificável com time — são projetos de desenvolvedor individual.

### O que nenhum deles faz
- Backup e restauração confiáveis na troca de aparelho — **a dor nº 1**
- Data de vencimento e fila de vencidos
- Visão consolidada de "quanto tenho na rua"
- Cobrança pronta por WhatsApp
- Correção e estorno de lançamento
- Lançamento com data retroativa
- Versão web, iOS, ou suporte humano

## Concorrente indireto sério — Kyte

| | |
|---|---|
| Instalações | **3.360.913** · nota 4,4 · 23,7 mil avaliações |
| Preço | Free · **PRO R$ 49,90/mês** · GROW R$ 69,90 · PRIME R$ 99,90 |
| Fiado | ✅ **Já tem**, com limite de crédito e lembrete por WhatsApp — **no plano PRO pago** |

**É o único concorrente com marca, escala e a feature pronta.** E é o principal risco competitivo: pode tirar o fiado do paywall ou lançar um app autônomo a qualquer momento.

**A brecha:** os usuários odeiam o paywall retroativo.
> *"Era um ótimo aplicativo. Hoje em dia, tudo o que você fizer dentro dele é pago... é um absurdo ter que pagar 50 reais por mês pra deixar um pedido salvo"* (2★)

> *"antes dava pra fazer todas as funções básicas, agora do nada você tem que pagar pra por estoque"* (2★)

**Posicionamento contra o Kyte:** ele é um PDV onde fiado é uma feature entre dez. O Na Rua faz só fiado, faz completo, e por 40% menos.

## Quem não está no jogo — e por que importa

Verificado explicitamente: **InfinitePay, Stone/Ton e Mercado Pago não oferecem controle de fiado.** Elas competem por Pix e cartão.

Isso é bom hoje e é o risco de médio prazo: elas têm o canal físico e o relacionamento com exatamente este lojista.

## Os casos internacionais — o aviso

| | Khatabook | OkCredit | BukuWarung |
|---|---|---|---|
| País | Índia | Índia | Indonésia |
| Capital | US$ 187 mi | ~US$ 90 mi | US$ 80 mi |
| Instalações | **99.083.297** | 48.610.976 | 7.703.948 |
| Receita | Rs 102,70 cr (FY24) | **Rs 9 cr desde a fundação** | — |
| Prejuízo | Rs 116,24 cr | **Rs 428 cr queimados** | Cortou 75% em 2023 |
| Demissões | 6% do time | **35% do time** | Sim |
| O que deu errado | Pivô para empréstimo virou funil de spam de crédito | Receita zero por 3 anos fiscais; RBI matou o produto P2P | Fraude no braço de pagamentos |

**Receita anual por comerciante ativo do Khatabook: ~US$ 1,20.**

### As quatro lições incorporadas ao produto

1. **Cobrar desde o primeiro dia.** "Monetiza depois" custou Rs 428 crore ao OkCredit.
2. **Não virar credor.** Troca um negócio de software (margem alta, sem regulador) por um financeiro (capital intensivo, regulado).
3. **Não construir o próprio pagamento.** Fraude derrubou a BukuWarung.
4. **Escala não é defesa.** 99 milhões de instalações e prejuízo maior que a receita.

### E a lição de UX mais barata de todas
A BukuWarung colheu dezenas de reviews 1★ porque **a barra de navegação do Android cobria o botão "0" do teclado numérico e o botão Salvar**:
> *"gabisa masukan nominal! sedih banget harus aku uninstall"* — não consigo digitar o valor, desinstalei chorando

É um teste de QA de 5 minutos que ninguém fez. Está na [matriz obrigatória de QA](../04-arquitetura/07-qualidade-e-observabilidade.md).

## Padrões de desinstalação — o que evitar, por ordem de gravidade

Consolidado de ~620 reviews em 3 países:

| # | Causa | Onde ocorre |
|---|---|---|
| 1 | **Perda de dados** (sync, update, troca de aparelho) | BR, IN, ID — **em todos** |
| 2 | **Perda de acesso à conta** (senha/OTP/e-mail inválido) | BR, IN, ID |
| 3 | **Anúncio ou paywall no meio da tarefa** | BR, IN |
| 4 | **Monetização retroativa** de função que era grátis | IN, e o Kyte no BR |
| 5 | **Botão coberto / não consegue digitar o valor** | ID |
| 6 | **Não dá para corrigir ou apagar lançamento** | BR, IN |
| 7 | **Não dá para lançar com data de ontem** | BR, IN |
| 8 | Não achar o cliente / não ter total geral | BR |
| 9 | Crash ao salvar, lentidão, duplicação | BR, IN, ID |
| 10 | Virar funil de empréstimo | IN |

**O que elogiam:** exatamente três coisas — **simples, rápido, "fácil de mecher"**. Nunca elogiam recursos.

> **Conclusão estratégica:** este mercado não é ganho por features. É ganho por **não perder o dado, não perder o login e não atrapalhar o balcão**. Todo o orçamento de engenharia deveria ir para durabilidade e velocidade.
