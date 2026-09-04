# Métricas

> O que medir, o que é meta e — igualmente importante — **o que não medir**.

## A métrica-mãe

> **% de lojistas que anotam pelo menos um fiado no dia seguinte à instalação.**

Não é "abriu o app". É **anotou**. Retorno no dia seguinte significa que o produto venceu o caderno numa transação real, com um cliente esperando no balcão.

Se essa métrica for baixa, nenhuma outra importa.

---

## Funil de ativação

| Métrica | Definição | Meta |
|---|---|---|
| **TTFV** | Instalação → 1º lançamento salvo | **< 60 s (p50)** · < 120 s (p90) |
| Anota o 1º fiado na 1ª sessão | | **> 70%** |
| Chega ao 3º cliente cadastrado (D7) | Proxy de "migrou o caderno" | **> 45%** |
| Dá a 1ª baixa de pagamento (D14) | Fecha o loop de valor | **> 50%** |

---

## Velocidade dos fluxos

Medidos em produção, p50 e p90.

| Fluxo | Toques | Tempo alvo (p50) | Como medir |
|---|---|---|---|
| **Anotar fiado (existente)** ⭐ | 3 | **< 8 s** | Toque em "Anotar fiado" → gravação local |
| Cadastrar cliente na venda | +2 | +15 s | |
| Receber pagamento total | 3 | < 6 s | |
| Ver quem está atrasado | **0** | instantâneo | é a tela inicial |
| Preparar lembrete | 3 | < 10 s | até o intent do WhatsApp |
| Ver "tá na rua" | 1 | instantâneo | |

**Linha de base competitiva:** ~6 s para escrever "Maria — 18,50" no caderno. `[H]` **Cronometrar em campo na Fase 0** e adotar o número medido como referência oficial.

---

## Retenção

Benchmarks públicos de apps de fintech ficam em D1 ~28–30%, D7 ~17,6–18%, D30 ~11,6–12%. ⚠️ São agregadores comerciais, não estudo revisado — ordem de grandeza, não meta contratual.

Este app é de **uso diário obrigatório** (toda venda fiado passa por ele), então deve se comportar como app de hábito:

| Métrica | Meta |
|---|---|
| D1 | **> 40%** |
| D7 | **> 30%** |
| D30 | **> 22%** |

### Melhores que retenção de abertura

| Métrica | Meta |
|---|---|
| **DAL** — dias ativos com lançamento por lojista/semana | **≥ 4/7** |
| **Índice de paralelismo com o caderno** — pergunta única no app após 14 dias: *"Você ainda anota no caderno também?"* | **< 30% em D30** |

O índice de paralelismo é a métrica de substituição real. Enquanto o caderno continuar aberto ao lado, o produto não venceu.

---

## Saúde e confiança

Estas previnem os riscos que mataram os concorrentes.

| Métrica | Alerta | Por quê |
|---|---|---|
| **Divergência de saldo entre aparelhos** | **> 0 é incidente P0** | Não há tolerância. É dinheiro errado |
| Falhas de sync não resolvidas | **> 0,1% é incidente** | |
| Taxa de lançamento desfeito (Desfazer em 8 s) | > 3% → investigar polaridade e rótulos | Erro de débito/crédito é documentado no mercado |
| Taxa de edição/estorno posterior | > 8% | Erro não percebido na hora |
| Lançamentos com data retroativa | > 15% → tornar o chip "ontem" mais proeminente | Valida a necessidade documentada |
| % de sessões offline | rastrear por região | Dimensiona o problema real de rede |
| Tempo até sync (p90) | > 24 h em massa = problema de infra | |
| Crash-free sessions | **> 99,5%** | A BukuWarung morreu disso |
| Cold start em Android Go | **< 2 s** até tela útil | |
| JS na primeira carga | **≤ 170 KB** comprimido | Falha o build no CI |
| INP (p75) | **≤ 200 ms** | A métrica que mais importa: o app é interação, não leitura |

---

## Cobrança — as métricas mais delicadas

| Métrica | Meta | Leitura |
|---|---|---|
| Lembretes **editados** antes de enviar | 30–50% | Alta é **bom**. Se for ~0%, ou os templates estão perfeitos ou o campo não parece editável — testar |
| **% de lembretes gerados mas NÃO enviados** | rastrear | O sinal mais honesto de desconforto do lojista com o tom |
| Mediana entre lembrete e pagamento | < 5 dias | Eficácia real |
| **Churn de freguês após lembrete** | **< 5%** | ⚠️ **MÉTRICA DE GUARDA** |
| *"O recadinho ficou do jeito que você falaria?"* | > 80% sim | |

> ⚠️ **A métrica de guarda tem poder de veto.** Se o churn de freguês subir, o produto está destruindo a relação que ele existe para proteger. Nessa situação a feature regride — não se otimiza a taxa de recuperação por cima dela.

---

## Negócio

| Métrica | Meta / referência |
|---|---|
| Conversão free → Pro | > 5% dos ativos |
| Preço médio realizado | ~R$ 25/mês |
| Churn mensal | 6–10% *(estimativa; público de renda irregular e baixo custo de troca)* |
| LTV líquido | R$ 210 – R$ 340 |
| CAC por indicação / ASO | R$ 0 – R$ 30 |
| CAC por tráfego pago | R$ 120 – R$ 300 → **razão LTV/CAC entre 0,7 e 2,8 = inviável** |

⚠️ **Todos os números de unit economics são estimativas derivadas de premissas explícitas.** Não existe benchmark público de CAC, LTV ou churn para micro-SaaS vendido a comércio de bairro no Brasil. Tratar como hipótese a validar nos primeiros 90 dias.

---

## O que NÃO medir como sucesso

| Não medir | Por quê |
|---|---|
| **Tempo de sessão** | Quanto menor, melhor. É uma ferramenta de 8 segundos |
| **Telas por sessão** | Mais telas = fluxo pior |
| **Número de clientes cadastrados** | A carteira real tem 8–15 pessoas. Cadastro em massa significa que alguém importou a agenda, não que está usando |
| **Taxa de recuperação de dívida** | Não é a métrica do lojista. A dele é *"não perdi o controle e não perdi o freguês"* |
| **Pageviews** | Irrelevante. O que importa é se ele conseguiu anotar |
| **DAU/MAU isolado** | Sem o DAL (dias com lançamento), abrir o app não significa nada |

---

## Instrumentação

| Ferramenta | Uso | Custo |
|---|---|---|
| **PostHog** | Eventos de produto, funil, **session replay**, RUM de Web Vitals | Free — 1M eventos, 5k replays |
| **Sentry** | Erros, com `replaysOnErrorSampleRate: 1.0` | Free — 5k erros, 50 replays |
| **Axiom** | Logs estruturados de Server Actions e telemetria de sync (tamanho da fila, tempo até flush) | Free — 500 GB/mês |
| **Lighthouse CI** | Orçamento de performance no CI, assertando **métricas** e não nomes de audit | Grátis (repo público) |

**Por que session replay é a instrumentação mais importante aqui:** analytics de pageview responde "quantas visitas". O que precisamos responder é *"o lojista conseguiu anotar o fiado, ou desistiu no meio porque o campo de valor é ruim de digitar com uma mão segurando sacola?"*. Só replay responde isso.
