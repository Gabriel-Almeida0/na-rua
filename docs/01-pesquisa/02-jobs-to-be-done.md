# Jobs to be Done

> Cada job traz a **situação**, a **motivação**, o **resultado esperado**, a **solução atual** (o concorrente real) e o **critério de vitória** — o ponto em que o Na Rua ganha da solução atual. Sem critério de vitória mensurável, o job não entra no roadmap.

---

## JTBD-01 · Anotar a venda sem travar o balcão ⭐

> **Quando** um freguês conhecido leva mercadoria e diz "põe na conta" no horário de pico,
> **eu quero** registrar isso em segundos, sem tirar a atenção dele,
> **para** não segurar a fila nem parecer desorganizado.

| | |
|---|---|
| **Solução atual** | Caderno e caneta — **~6 segundos** |
| **Critério de vitória** | **3 toques, menos de 8 segundos** (p50), sem exigir digitar nome nem descrição |
| **Como perde** | Qualquer campo obrigatório extra, qualquer anúncio, qualquer spinner, qualquer confirmação modal |
| **Evidência** | Fluxo mais usado; o contexto de balcão é documentado nas reportagens etnográficas |

---

## JTBD-02 · Saber quanto tenho na rua ⭐

> **Quando** eu fecho o dia e olho o caixa,
> **eu quero** ver de uma vez quanto tenho a receber e quem está atrasado,
> **para** saber se posso pagar o fornecedor amanhã.

| | |
|---|---|
| **Solução atual** | Somar o caderno à mão, ou não somar |
| **Critério de vitória** | **Zero toques** — é a tela inicial |
| **Como perde** | Se exigir abrir cliente por cliente. É literalmente a reclamação: *"tem que acessar manualmente cada cliente para saber quanto cada um deve"* |
| **Evidência** | Pedido explícito em reviews: *"Seria perfeito se o app somasse todos os devedores"* |

---

## JTBD-03 · Cobrar sem passar vergonha ⭐⭐

> **Quando** a conta de alguém passou do dia de pagar,
> **eu quero** avisar de um jeito que não pareça cobrança,
> **para** receber o dinheiro **e** manter o freguês.

| | |
|---|---|
| **Solução atual** | Não cobrar e absorver o prejuízo. Ou puxar assunto na loja, constrangido |
| **Critério de vitória** | **3 toques até o WhatsApp aberto com o texto pronto**, em tom que o lojista reconhece como dele |
| **Como perde** | Se o app mandar sozinho; se o texto soar como banco; se vier de número desconhecido |
| **Métrica de guarda** | **Churn de freguês após lembrete < 5%.** Se subir, o tom está agressivo e está destruindo relações |
| **Evidência** | O lojista prefere perder R$ 100 a cobrar. Três razões independentes proíbem automação (legal, relacional, de negócio) |

**Este é o job de maior valor não atendido do mercado.** Os concorrentes registram a dívida; nenhum ajuda a receber.

---

## JTBD-04 · Não perder o controle se acontecer alguma coisa ⭐⭐

> **Quando** meu celular quebra, é roubado ou o app atualiza,
> **eu quero** ter certeza absoluta de que minha caderneta continua lá,
> **para** não descobrir do pior jeito que perdi tudo.

| | |
|---|---|
| **Solução atual** | O caderno, que não apaga sozinho — e é por isso que ele fica em paralelo |
| **Critério de vitória** | Backup no plano grátis + migração de aparelho em fluxo guiado + exportação local a qualquer momento |
| **Como perde** | Uma única perda de dado. **Não há segunda chance neste job** |
| **Métrica** | Divergência de saldo entre aparelhos **deve ser zero**. Qualquer ocorrência é incidente P0 |
| **Evidência** | Causa nº 1 de 1★ nos três países. 19 das reviews de 1–2★ analisadas |

**Este é o job que decide se o produto existe.** Todo o resto é otimização.

---

## JTBD-05 · Corrigir o que anotei errado

> **Quando** eu lanço no cliente errado, no valor errado, ou esqueço de anotar a venda de ontem,
> **eu quero** consertar sem ter que apagar e refazer tudo,
> **para** o extrato continuar batendo e eu conseguir explicar pro freguês.

| | |
|---|---|
| **Solução atual** | Rabiscar o caderno |
| **Critério de vitória** | **Desfazer** por 8 s em toda ação + edição e estorno de qualquer lançamento, para sempre + data retroativa em 1 toque |
| **Como perde** | *"Absurdo não poder excluir um lançamento... Fica sujo o relatório. Muito amadorismo."* |
| **Nuance técnica** | Do ponto de vista do lojista é "corrigir". Do ponto de vista do ledger é **contra-lançamento** — nada é deletado. Ver [ADR-0004](../05-adr/0004-estorno-por-contra-lancamento.md) |

---

## JTBD-06 · Mostrar pro freguês quanto ele deve

> **Quando** o cliente pergunta "quanto tá minha conta?",
> **eu quero** mostrar de forma clara e sem discussão,
> **para** não ter conversa de "não foi isso que eu levei".

| | |
|---|---|
| **Solução atual** | Mostrar o caderno, ou tirar print do app e mandar no WhatsApp |
| **Critério de vitória** | Link público que o cliente abre **sem instalar nada e sem login**, com o extrato e a chave Pix |
| **Evidência direta** | Review real: *"a tela que aparece o valor de débito e crédito detalhados **não tem o nome da cliente, portanto nem print serve**"* — o lojista **já faz isso hoje**, o produto só precisa formalizar |
| **Risco** | `[H]` Não validado se o cliente recebe bem o link. Testar antes do lançamento |

---

## JTBD-07 · Deixar o balconista lançar sem me expor

> **Quando** eu não estou na loja e minha filha atende o balcão,
> **eu quero** que ela possa anotar fiado,
> **mas não** que ela veja o caixa nem apague histórico.

| | |
|---|---|
| **Solução atual** | Ela anota no caderno |
| **Critério de vitória** | Papel `balconista` restritivo por padrão, com revogação **instantânea** de acesso |
| **Consequência técnica** | Papel vem da tabela de membership, não do JWT — senão o acesso persiste até o token expirar. Ver [ADR-0008](../05-adr/0008-papel-fora-do-jwt.md) |
| **Status** | `[H]` **Hipótese não validada.** Define toda a arquitetura de permissões — validar em campo |

---

## JTBD-08 · Decidir se dou fiado pra essa pessoa

> **Quando** alguém pede fiado,
> **eu quero** lembrar como foi das outras vezes,
> **para** não repetir um prejuízo que já tive.

| | |
|---|---|
| **Solução atual** | Memória. Funciona bem com 8 clientes, mal com 15 |
| **Critério de vitória** | Histórico visível na hora ("pagou 12 de 14 vezes em dia, costuma acertar dia 5") |
| **Fronteira dura** | O app **mostra o histórico e avisa**. Nunca aprova, nunca nega, nunca bloqueia a venda |
| **Por quê** | Decisão automatizada de crédito dispara o art. 20 da LGPD e reposiciona o produto como concessão de crédito regulada |
| **Insight** | O dado de crédito mais valioso é o que o próprio produto gera. É mais preditivo que score externo para este caso, é grátis, e é juridicamente defensável |

---

## Jobs que o produto recusa

| Job aparente | Por que recusamos |
|---|---|
| *"Quero que o app cobre sozinho pra eu não precisar"* | É o único job que, atendido, destrói o negócio do cliente. Ver [JTBD-03](#jtbd-03--cobrar-sem-passar-vergonha-) |
| *"Quero negativar quem não paga"* | Assimetria de risco: dívida de R$ 150 contra condenação de milhares |
| *"Quero saber se o cara deve em outra loja"* | Transformaria o produto em bureau de crédito de fato |
| *"Quero receber o dinheiro adiantado"* | Antecipação de recebível = instituição regulada pelo BCB |
| *"Quero emitir a nota fiscal por aqui"* | 27 legislações estaduais. É outro produto |
