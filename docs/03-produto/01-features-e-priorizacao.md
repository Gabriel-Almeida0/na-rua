# Features e priorização

> Ver [escopo](../00-visao/03-escopo.md) para o que está permanentemente fora.

## Critério de priorização

Cada feature é pontuada por **quanto dinheiro ela impede de perder** e **quanto ela custa em segundos no balcão**. Nesta ordem.

| Prioridade | Definição |
|---|---|
| **P0** | Sem isso o produto não existe. Falha aqui = desinstalação e volta pro caderno |
| **P1** | É o valor que o concorrente não entrega |
| **P2** | Melhora retenção e disposição a pagar |
| **P3** | Bom ter. Só depois de tudo acima medido |

---

## P0 — Durabilidade e velocidade

Estas features não têm negociação de escopo. São a resposta às duas causas nº 1 de desinstalação nos três países analisados.

| # | Feature | Critério de aceite |
|---|---|---|
| P0-1 | **Anotar fiado** (cliente existente) | 3 toques · < 8 s (p50) · sem rolagem em 5" |
| P0-2 | **Cadastro de cliente** com só o nome obrigatório | < 15 s adicionais · zero campos exigidos além do nome |
| P0-3 | **Receber pagamento** total e parcial | 3 toques · < 6 s · tela de quitação comemorativa |
| P0-4 | **Funcionamento 100% offline** | Confirmação **idêntica** à do modo online |
| P0-5 | **Sincronização sem perda**, com IDs idempotentes | Divergência de saldo entre aparelhos = **0**. Qualquer ocorrência é P0 |
| P0-6 | **Ledger append-only** com estorno | Nada é deletado, nunca, por nenhum caminho |
| P0-7 | **Backup em nuvem no plano grátis** | Nenhum concorrente faz. É a objeção nº 1 à migração |
| P0-8 | **Migração de aparelho** como fluxo guiado | Restauração sem ticket de suporte e sem lembrar senha |
| P0-9 | **Exportação local** (arquivo + resumo no próprio zap) | Pedido literal nas reviews |
| P0-10 | **Tela inicial responde "quanto tá na rua"** | 0 toques |
| P0-11 | **Editar e estornar** qualquer lançamento, para sempre | + data retroativa em 1 toque |
| P0-12 | **Desfazer** por 8 s em toda ação | Substitui confirmação modal |
| P0-13 | **Zero anúncios, zero interrupção** no balcão | Em qualquer plano, para sempre |
| P0-14 | Ler os dados locais **sem estar autenticado** | Perder o login ≠ perder o caderno |

---

## P1 — O valor que ninguém entrega

| # | Feature | Por quê |
|---|---|---|
| P1-1 | **Vencimento por dia do mês / quinzena** | O prazo real é colado no dia do salário. Date picker é o modelo errado |
| P1-2 | **Fila "quem cobrar hoje"** | Os concorrentes registram a dívida; nenhum ajuda a receber |
| P1-3 | **Lembrete pronto no WhatsApp**, 3 tons, editável, com Pix e valor | 3 toques até o zap aberto. Via `wa.me`: custo R$ 0, risco de banimento 0 |
| P1-4 | **As 8 travas de cobrança** | Janela de horário, rate limit, 1:1, templates fechados, estado contestada |
| P1-5 | **Link público da conta** do cliente | Sem app, sem login. O lojista já manda print hoje |
| P1-6 | **Fechamento do dia** | Anotei / recebi / tá na rua, em 1 toque |
| P1-7 | **Papéis dono / gerente / balconista** | Com revogação instantânea de acesso |
| P1-8 | **Registro de opt-in** com data, hora e usuário | Exigência da Meta + salvaguarda LGPD |

---

## P2 — Retenção e disposição a pagar

| # | Feature | Observação |
|---|---|---|
| P2-1 | **Comprovante digital de fiado com aceite do cliente** | Transforma o fiado em obrigação documentada. Habilita encargos e prova. Possivelmente a feature de maior valor jurídico do produto |
| P2-2 | **Score interno de comportamento** ("pagou 12 de 14 vezes em dia") | Construído do histórico da própria loja. Custa zero, é mais preditivo que bureau para este caso |
| P2-3 | **Limite definido pelo lojista** | **Avisa, nunca bloqueia.** Bloquear = decisão automatizada de crédito (LGPD art. 20) |
| P2-4 | **Cobrança formal** — notificação extrajudicial em PDF | 80% do valor da negativação, 5% do risco |
| P2-5 | **Pix Cobrança com QR dinâmico** no valor exato | Direto na chave do lojista |
| P2-6 | **Alerta de limite do MEI** | O app já conhece as vendas: *"você já faturou R$ 68.000 este ano"* |
| P2-7 | **Multi-loja** | |
| P2-8 | **Versão web** para o PC do caixa | Pedido recorrente nas reviews dos concorrentes |
| P2-9 | **Parcelamento** | 16 menções nas reviews. Exige os 5 itens do art. 52 do CDC na tela |

---

## P3 — Depois de medir

| # | Feature |
|---|---|
| P3-1 | WhatsApp Cloud API oficial como upgrade pago |
| P3-2 | PSP com conciliação automática, como opção |
| P3-3 | Relatório mensal em PDF |
| P3-4 | Notificação push de vencimento (só para o lojista, nunca para o cliente) |
| P3-5 | Importação assistida do caderno por foto |

---

## Anti-features — o que aumenta churn

Registrado porque cada um destes é tentador e cada um destruiu um produto real:

| Anti-feature | O que aconteceu com quem fez |
|---|---|
| Envio automático de cobrança | Ilegal (CDC art. 42/71) + destrói a relação, que é o ativo do lojista |
| Anúncio no fluxo | *"Propaganda demais, nem cheguei a cadastrar um cliente"* — 1★ |
| Limitar o grátis a 10 clientes | *"uma vergonha colocar plano grátis pra 10 clientes. quem tem só dez?"* — 1★ |
| Tornar pago o que era grátis | Khatabook, OkCredit e Kyte colhem 1–2★ por isso até hoje |
| Virar funil de empréstimo | *"Calls with loan offers everyday, man I dont need a loan"* — Khatabook |
| Exigir que o cliente instale o app | Modelo de dois lados falhou visivelmente no Khatabook |
| Prompt de avaliação repetitivo | *"ruim mesmo, avaliando toda hora aparecer"* — 1★ |
| Bloquear a tela por update pendente | *"it kinda blocks you post login and you'll not be able to see any transactions"* |
