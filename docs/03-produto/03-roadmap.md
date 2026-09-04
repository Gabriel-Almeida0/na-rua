# Roadmap

> Roadmap por **capacidade entregue e validada**, não por data. Cada fase tem um **portão de saída**: se a métrica não for atingida, a fase não termina — e a seguinte não começa.

## Fase 0 · Ir a campo antes de codar

**Isto não é opcional.** A pesquisa desktop identificou cinco lacunas que nenhuma busca resolve, e cada uma delas pode invalidar uma decisão de produto já tomada.

| Lacuna | O que fazer | O que isso decide |
|---|---|---|
| Não existe etnografia brasileira publicada sobre fiado em mercadinho | **8 a 12 visitas de balcão** em 2 regiões distintas: observar + entrevistar | Todo o resto |
| Zero dados de conectividade **dentro** da loja | Medir sinal em 20 lojas: balcão, estoque, câmara fria | Quão agressivo precisa ser o offline |
| Nenhum levantamento do vocabulário regional | Testar "na rua", "freguês", "recadinho", "pendura", apelidos com ~30 lojistas em 3 regiões | Congelamento da UI |
| Divisão dono × balconista não validada | Perguntar em campo | **Toda a arquitetura de permissões** |
| Recepção do cliente devedor ao link público | Testar com 8–10 devedores reais | Se F7 existe |

**Portão de saída:** cronometrar o caderno. Quanto leva, de verdade, escrever "Maria — 18,50"? Esse número vira a **linha de base oficial do produto**.

---

## Fase 1 · Não perder o dado, não atrapalhar o balcão

Entrega o P0 inteiro. Nada de cobrança ainda.

**Capacidades:** anotar · cadastrar · receber · offline total · sync sem perda · ledger append-only · backup no grátis · migração de aparelho · exportação · "tá na rua" · estorno · desfazer · data retroativa.

**Portão de saída — os números que autorizam a Fase 2:**

| Métrica | Meta |
|---|---|
| Tempo até o 1º fiado anotado (TTFV) | **< 60 s (p50)**, < 120 s (p90) |
| Tempo do fluxo "anotar fiado" | **< 8 s (p50)** — e mais rápido que o caderno cronometrado |
| Lojistas que anotam no dia seguinte à instalação (D1) | **> 40%** |
| Divergência de saldo entre aparelhos | **0. Sem exceção** |
| Falhas de sync não resolvidas | **< 0,1%** |
| Crash-free sessions | **> 99,5%** |
| JS na primeira carga | ≤ 170 KB comprimido |

> Se a divergência de saldo não for exatamente zero, a Fase 1 **não terminou**. Não há trade-off aqui.

---

## Fase 2 · Ajudar a receber

O valor que nenhum concorrente entrega.

**Capacidades:** vencimento por dia/quinzena · fila "quem cobrar hoje" · lembrete em 3 tons via `wa.me` · as 8 travas · link público da conta · fechamento do dia · papéis · opt-in registrado.

**Portão de saída:**

| Métrica | Meta |
|---|---|
| Tempo até o WhatsApp aberto com texto pronto | 3 toques, < 10 s |
| Lembretes **editados** antes de enviar | 30–50% *(alta é bom: significa que o campo parece editável e o lojista se apropria)* |
| Mediana entre gerar o lembrete e o pagamento | < 5 dias |
| **Churn de freguês após lembrete** | **< 5%** ← métrica de guarda |
| Índice de paralelismo com o caderno (D30) | **< 30%** ainda anotando no papel |
| D7 / D30 | > 30% / > 22% |

> **A métrica de guarda manda.** Se o churn de freguês subir, o tom está agressivo demais e está destruindo relações — que é exatamente o risco que o produto existe para evitar. Nesse caso a Fase 2 regride, não avança.

---

## Fase 3 · Provar e prevenir

**Capacidades:** comprovante de fiado com aceite · score interno de comportamento · limite definido pelo lojista (avisa, não bloqueia) · cobrança formal em PDF · Pix Cobrança com QR dinâmico · alerta de limite do MEI.

**Portão de saída:**

| Métrica | Meta |
|---|---|
| Fiados com comprovante aceito pelo cliente | > 40% |
| Recuperação com cobrança formal vs. lembrete simples | ganho mensurável |
| Disposição a pagar demonstrada (conversão para Pro) | > 5% dos ativos |

---

## Fase 4 · Escalar o que já funciona

**Capacidades:** multi-loja · versão web para o PC do caixa · parcelamento com os 5 itens do art. 52 · relatório mensal · WhatsApp Cloud API como upgrade pago · PSP com conciliação automática, opcional.

**Gatilho para a Cloud API:** lojistas com **mais de ~80–100 clientes fiado**, para quem a fila manual vira trabalho real. Antes disso, `wa.me` é estritamente melhor: custo zero, risco zero, humano no loop.

---

## Marcos técnicos obrigatórios, por fase

| Fase | Não termina sem |
|---|---|
| **1** | `pg_dump` diário rodando desde o primeiro dia com dado real · suíte pgTAP de RLS verde · matriz de QA de barra de navegação × fonte grande × teclado aberto · orçamento de performance no CI |
| **2** | Registro auditável de todo lembrete · travas de horário e frequência testadas · página pública < 50 KB |
| **3** | Hash e timestamp do comprovante · job de expurgo e anonimização implementado |
| **4** | Migração para Vercel Pro **antes** do primeiro faturamento (Hobby proíbe uso comercial, doação inclusive) · monitoramento de quality rating do WhatsApp |

---

## Decisões deliberadamente adiadas

| Decisão | Quando revisitar |
|---|---|
| Trocar a fila própria por PowerSync | Só se a fila virar gargalo **medido**, não antes |
| Coluna de saldo cacheada | Só quando o `EXPLAIN ANALYZE` provar necessidade — e o job de reconciliação entra no **mesmo commit** |
| React Compiler | Depois de medir INP em aparelho real |
| Serviço externo de feature flag | Só se surgir necessidade de kill switch em produção sem deploy |
| App nativo | Provavelmente nunca. PWA atende, e o custo de distribuição em loja não se paga |

---

## O que mataria o projeto

Riscos de tese, registrados para serem monitorados e não esquecidos:

| Risco | Sinal de alerta | O que fazer |
|---|---|---|
| **O fiado está encolhendo nas capitais** | Reportagem documenta lojistas eliminando o fiado por prejuízo | Validar na Fase 0. Se confirmado, focar interior e periferia |
| **A economia unitária não permite aquisição paga** | LTV estimado R$ 210–340 vs. CAC de tráfego pago R$ 120–300 | Não é risco, é restrição de projeto: só ASO, indicação e loop de WhatsApp |
| **O Kyte fecha a janela** | Tirar o fiado do paywall, ou lançar app autônomo | Defender pelo foco e pela durabilidade do dado, não por features |
| **Adquirentes entram no nicho** | Stone/Ton/InfinitePay lançarem fiado | Elas têm o canal físico. Seria o risco terminal |
| **Uma única perda de dados em produção** | Qualquer divergência de saldo | Não há mitigação depois. Só prevenção antes |
