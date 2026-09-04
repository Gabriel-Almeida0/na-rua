# Modelo de negócio

> Fundamentado na [pesquisa de mercado](../01-pesquisa/00-pesquisa-de-mercado.md). Todos os números de unit economics são **estimativas com premissas explícitas** — não existe benchmark público para este segmento no Brasil.

## A decisão que define tudo

> **Cobrar desde o primeiro dia.**

Não é escolha de gosto. É o aprendizado mais caro já pago por outra pessoa:

| | Khatabook | OkCredit |
|---|---|---|
| Instalações acumuladas | **99 milhões** | 48 milhões |
| Capital queimado | US$ 187 mi | ~US$ 90 mi |
| Receita | ~US$ 12 mi/ano (FY24) | **Rs 9 cr desde a fundação** |
| Prejuízo | **Maior que a receita** | Rs 428 cr |
| Receita por comerciante ativo | **~US$ 1,20/ano** | ~zero |

**O caderno digital, sozinho, não monetiza.** Não existe caminho de "cresce grátis e monetiza depois" que não exija capital de risco que um micro-SaaS não tem. E os dois pivôs tentados importaram, respectivamente, **risco regulatório** (o RBI matou o produto P2P do OkCredit) e **fraude** (que derrubou o braço de pagamentos da BukuWarung).

---

## Referências de preço no mercado brasileiro

| Produto | Preço |
|---|---|
| App de fiado líder (248 mil instalações) | R$ 5 – 10 |
| Fiado Pago (plano Essencial) | R$ 9,90/mês |
| AnotaVendas | R$ 14,90 – 129,90 |
| Nextar | R$ 39/mês |
| **Kyte PRO** (onde o fiado mora) | **R$ 49,90/mês** |
| Bling Cobalto | R$ 57/mês |
| vhsys | a partir de R$ 119,90/mês |

Existe um **teto psicológico duro em torno de R$ 50** (o Kyte, produto muito mais completo) e um **piso de commodity em R$ 9,90**.

**Contexto de capacidade de pagamento:** o limite do MEI em 2026 é R$ 81.000/ano = **R$ 6.750/mês de faturamento bruto**. Uma assinatura de R$ 100 seria 1,5% do bruto. O produto vive na faixa **R$ 19,90 – R$ 39,90**.

---

## Os planos

**Princípio:** cobrar pela dor que causa **prejuízo financeiro** (não conseguir cobrar, não saber quem deve), nunca por contagem de clientes.

### Grátis — R$ 0

| Inclui | Por quê |
|---|---|
| Até **30 clientes** | Limite de 10 gera revolta explícita: *"uma vergonha colocar plano grátis pra 10 clientes. quem tem só dez?"*. A carteira real tem 8–15, então 30 permite testar de verdade |
| Anotar, receber, ver quem deve | O núcleo, para sempre |
| **Backup em nuvem** | ⭐ **A decisão contraintuitiva mais importante do modelo.** É a prova de confiança que nenhum concorrente dá — e sem ela o lojista não migra o caderno |
| **Zero anúncios** | Anúncio no fluxo é causa direta de 1★ e desinstalação |
| Exportação dos próprios dados | O dado é dele |

### Pro — R$ 29,90/mês · R$ 249/ano (≈ R$ 20,75/mês, −30%)

| Inclui |
|---|
| Clientes ilimitados |
| **Data de vencimento + fila de vencidos** |
| **Cobrança por WhatsApp com 1 toque**, em 3 tons |
| QR Pix com valor exato |
| Comprovante de fiado com aceite do cliente |
| Limite de crédito por cliente |
| Score interno de comportamento |
| Histórico auditável e exportação em CSV/PDF |

**Por que R$ 29,90:** fica **40% abaixo do Kyte PRO** e bem acima da faixa de commodity. E ancora exatamente nos três pedidos mais repetidos nas reviews de 4–5★ dos concorrentes: vencimento, lembrete e parcelamento.

### Premium — R$ 59,90/mês

| Inclui |
|---|
| Tudo do Pro |
| Multi-loja e multi-usuário |
| Versão web para o PC do caixa |
| Relatório de exposição e aging |
| Suporte humano por WhatsApp |

Só faz sentido acima de ~R$ 8 mil em aberto.

---

## As cinco regras invioláveis de precificação

| # | Regra | Fundamento |
|---|---|---|
| 1 | **Nunca tirar do grátis o que já foi dado** | O caso Kyte: *"Era um ótimo aplicativo. Hoje em dia, tudo o que você fizer dentro dele é pago"* — 2★. Ressentimento duradouro |
| 2 | **Zero anúncios em qualquer plano, inclusive no grátis** | *"estou pagando e continua tendo propaganda"* — 2★. É o único diferencial gratuito de fazer |
| 3 | **Cancelamento em 1 toque, dentro do app** | Múltiplas reviews 1★ relatam assinatura que não cancela e cobrança que não para |
| 4 | **Anual com desconto agressivo (−30%)** | Reduz churn e resolve cobrança recorrente para renda irregular. O Kyte pratica só −16% |
| 5 | **Nada de paywall antes de provar valor** | *"Desinstalei assim que fui testar e vi campos bloqueados"* |

---

## Unit economics

> ⚠️ **Estimativas, não dados.** Não existe benchmark público de CAC, LTV ou churn para micro-SaaS vendido a comércio de bairro no Brasil. Validar nos primeiros 90 dias.

**Premissas explícitas:**
- Preço médio realizado: **R$ 25/mês** (mix de Pro mensal, Pro anual e alguns Premium)
- Churn mensal: **6–10%** — público de renda irregular, custo de troca baixo, categoria com histórico de apps abandonados. Churn abaixo de 5% neste segmento seria excepcional e não deve ser assumido
- Vida média: 10 a 16 meses
- Margem bruta: ~85%

**LTV bruto: R$ 250 – R$ 400. LTV líquido: R$ 210 – R$ 340.**

### CAC por canal

| Canal | CAC estimado | Veredito |
|---|---|---|
| Indicação / boca a boca | R$ 0 – 30 | ✅ Fecha com folga |
| Orgânico na Play Store (ASO) | R$ 0 – 20 | ✅ Categoria com busca real e concorrentes com ficha ruim |
| TikTok / Reels orgânico | R$ 10 – 50 | ✅ Alto esforço, baixo custo direto |
| **Tráfego pago (Meta/Google)** | **R$ 120 – 300** | 🔴 **Inviável.** LTV/CAC entre 0,7 e 2,8 — abaixo do mínimo saudável de 3 |
| Venda direta porta a porta | R$ 200+ | 🔴 Inviável a R$ 29,90/mês |

> **Conclusão dura:** este produto **não sobrevive a aquisição paga**. Só fecham canais de custo quase zero. Isso não é defeito da ideia — é a restrição que **define** o go-to-market.

---

## Go-to-market

⚠️ Esta é a seção com menos evidência direta. Não existe estudo de caso brasileiro documentado de distribuição de SaaS para varejo de vizinhança. O que segue separa o que é evidência do que é hipótese.

### O que a evidência sustenta

**WhatsApp é o canal, não *um* canal.** 82% dos pequenos negócios o usam como principal meio de comunicação e venda (Sebrae, n=8.200). Instagram 57%, Facebook 30%, loja própria 10%.

Isso é implicação de **produto**, não de marketing: o valor precisa ser entregue dentro do WhatsApp.

**⭐ O loop de distribuição embutido.** Toda cobrança enviada é uma mensagem que chega a um consumidor, com a marca do produto. Com 38% das vendas do minimercado no fiado, um lojista com 40 devedores gera dezenas de impressões mensais gratuitas.

**Este é o único canal com CAC estruturalmente próximo de zero — e o desenho do produto deve otimizar para ele.**

**A Play Store tem demanda de busca real e concorrência fraca.** 20+ apps, quase todos abaixo de 800 instalações, muitos sem avaliação e com fichas mal feitas.

### Hipóteses não comprovadas

| Canal | Status |
|---|---|
| Distribuidoras e atacadistas (visitam o lojista toda semana) | Melhor encaixe teórico. **Nenhum caso documentado.** Hipótese a testar |
| Associações comerciais / CDLs | Plausível, sem evidência |
| Revenda regional | Comprovadamente o modelo do Hiper — mas venda assistida não combina com ticket de R$ 29,90 |

### Sequência recomendada

1. **ASO agressivo na Play Store** — título, ícone, screenshots reais em português, resposta a todas as reviews. Custo ~zero, e os concorrentes fazem mal.
2. **Loop de cobrança por WhatsApp** com assinatura discreta. Único motor de crescimento composto.
3. **Programa de indicação** (1 mês grátis por indicação convertida). Único canal pago cuja economia fecha.
4. **Conteúdo orgânico curto** sobre o prejuízo do caderno de papel — a dor de "perdi tudo" é conteúdo pronto, com verbatim real.
5. **Só depois:** piloto com uma distribuidora regional.

---

## O que não monetizamos, e por quê

| Não | Fundamento |
|---|---|
| **Crédito / empréstimo** | Vira instituição regulada. O RBI matou o produto P2P do OkCredit. E destruiu a percepção de um app com 590 mil avaliações: *"Calls with loan offers everyday"* |
| **Antecipação de recebível** | Mesmo problema, mais risco de capital |
| **Taxa sobre transação** | O dinheiro nunca passa por nós — por decisão de arquitetura. E PSP de taxa fixa custaria **6,6%** num fiado de R$ 30 |
| **Anúncios** | Causa direta de desinstalação |
| **Venda ou enriquecimento de dados** | Transformaria o SaaS de operador em controlador, e o produto em bureau de fato |
| **Consulta de bureau como feature central** | R$ 5–24 por consulta para decidir um fiado de R$ 50 |

---

## Leitura final, sem otimismo

Este é um negócio de **R$ 50 mil a R$ 200 mil de MRR**, construído com CAC próximo de zero, ao longo de 2 a 4 anos. Um micro-SaaS honesto e defensável.

**Não é um negócio de venture capital** — e qualquer plano que assuma que sim está repetindo o erro que custou US$ 90 milhões ao OkCredit.

### Custo de operação

| Fase | Custo |
|---|---|
| Portfólio, sem faturar | **R$ 0** — Supabase Free, Vercel Hobby, GitHub Actions grátis (repo público), PostHog/Sentry/Axiom free |
| A partir do primeiro cliente pagante | **~US$ 45/mês** — Supabase Pro (US$ 25) + Vercel Pro (US$ 20) |

⚠️ **A Vercel Hobby proíbe uso comercial**, e a definição inclui explicitamente pedir doações. A migração para Pro é **obrigatória antes** do primeiro faturamento, não depois. Alternativa sem essa cláusula: Cloudflare Workers/Pages.
