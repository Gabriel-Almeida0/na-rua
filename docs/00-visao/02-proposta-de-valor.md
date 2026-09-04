# Proposta de valor

> Documento de visão · Decorre de [O problema](01-problema.md).

## Posicionamento

> **Na Rua é a caderneta de fiado que não some — e que cobra por você, sem você precisar brigar com o freguês.**

Duas promessas, nessa ordem. A primeira compra a confiança para a migração do papel. A segunda é o que o lojista realmente não consegue fazer sozinho.

## O nome

**"Tá na rua"** é como o lojista chama o dinheiro que ele tem a receber. Apareceu na pesquisa de UX como o KPI emocional central do negócio dele — não é "contas a receber", não é "carteira", não é "recebíveis". É o dinheiro que saiu da gaveta e está lá fora.

O nome é o produto: a tela inicial responde, sem nenhum toque, **quanto você tem na rua**.

## As três teses do produto

### Tese 1 — Durabilidade do dado é a proposta de valor, não uma feature

O concorrente não é outro app. É o **caderno** (usado por ~metade dos MEIs) e a **não-anotação** (~1/3). Contra o caderno, o app perde em uma única dimensão que importa: o caderno não apaga sozinho.

Por isso:
- **Backup em nuvem no plano grátis**, sem exceção. Nenhum concorrente faz isso, e usuários satisfeitos literalmente se oferecem para pagar por ele: *"Seria ótimo vocês colocarem uma opção pra fazer um backup... **Pode ser até uma versão paga** para ajudar o aplicativo."*
- **Ledger append-only**: nada é deletado, nem por bug, nem por migração, nem por sync. Ver [ADR-0001](../05-adr/0001-ledger-append-only.md).
- **Migração de aparelho é fluxo de produto de primeira classe**, não ticket de suporte.
- **Exportação local a qualquer momento** — o dado é do lojista, e ele precisa sentir isso.

### Tese 2 — Vendemos alívio de constrangimento, não organização

O lojista sabe anotar. O que ele não consegue é cobrar sem estragar a relação com alguém que ele encontra na padaria no dia seguinte.

Por isso o produto **prepara a cobrança e o humano envia**:
- A tela inicial mostra **quem cobrar hoje**, não um relatório.
- A mensagem sai pronta, em três tons (**"bem de leve"**, **"direto"**, **"só o valor"**), editável, com a chave Pix e o valor exato.
- O envio é sempre pelo WhatsApp **do próprio lojista**, do número que o cliente já conhece.
- **O app nunca manda nada sozinho.** Ver Tese 3.

### Tese 3 — As travas de cobrança são o produto, não o compliance

O que parece limitação é o diferencial. Três razões independentes convergem para a mesma decisão:

| Razão | Fundamento |
|---|---|
| **Legal** | CDC art. 42 proíbe constrangimento; **art. 71 é crime** (detenção de 3 meses a 1 ano) para cobrança que "interfira com seu trabalho, descanso ou lazer" |
| **Relacional** | O lojista prefere absorver R$ 100 de prejuízo a romper com o cliente. Se o app mandar mensagem sozinho e o freguês sumir, ele desinstala **e conta para os vizinhos** — que é exatamente o canal de aquisição desse mercado |
| **De negócio** | O fiado existe para fidelizar. Cobrança agressiva recupera o valor de hoje ao custo do cliente de amanhã |

Por isso a frase que aparece em toda tela de lembrete é uma promessa de produto:

> **"Você que manda. O app não manda nada sozinho."**

## O que o Na Rua é

- Um **PWA** que abre no navegador, instala na tela de início e **funciona sem internet**.
- Uma **caderneta digital** onde anotar um fiado leva 3 toques e menos de 8 segundos — porque escrever "Maria — 18,50" no caderno leva 6.
- Uma **fila de cobrança do dia** com mensagem pronta e Pix embutido.
- Um **link público** que o cliente abre sem instalar nada e sem login, para ver a própria conta.
- Um **livro-razão imutável** onde todo lançamento é auditável e nada é apagado — só estornado.

## O que o Na Rua não é, e não vai virar

Estas não são omissões de MVP. São **decisões permanentes**, cada uma com fundamento documentado.

| Não é | Por quê |
|---|---|
| **Um ERP / PDV** | O vazio de mercado está exatamente entre o app amador e o ERP. Adicionar estoque, NF-e e PDV é sair do vazio e entrar na briga com o Kyte, que tem 3,36 mi de instalações |
| **Um emissor de nota fiscal** | Exigiria credenciamento em 27 SEFAZ, certificado digital de cada lojista, contingência e guarda de XML por 5 anos. É um produto inteiro, não uma feature. A obrigação fiscal é do lojista |
| **Uma financeira** | Venda a prazo com recursos próprios do lojista **não é** operação regulada pelo BCB. No momento em que a plataforma antecipa recebível, garante pagamento ou aprova crédito, vira instituição regulada. Foi o caminho que importou risco fatal ao OkCredit |
| **Um meio de pagamento** | O Pix cai **direto na chave do lojista**. A plataforma nunca custodia dinheiro — isso a manteria fora da Resolução BCB nº 80/2021. E PSP de taxa fixa (R$ 1,99) custaria **6,6%** num fiado de R$ 30 |
| **Um bureau de crédito** | Cruzar bases de lojistas diferentes para detectar "o devedor que deve em 5 lojas" é comercialmente tentador e transformaria o SaaS num bureau de fato, sujeito ao art. 43 do CDC e à Lei 12.414/2011 |
| **Uma ferramenta de negativação** | A dívida média é R$ 50–300; uma condenação por negativação indevida custa milhares. Exigiria CPF + endereço + prova documental, revertendo toda a decisão de minimização de dados. E contradiz o posicionamento |
| **Um app para o cliente devedor** | O modelo de dois lados falhou visivelmente no Khatabook. A carteira típica tem 8–15 devedores — pedir que cada um instale um app é irreal. O cliente vê a conta por **link público, sem app e sem login** |

## Os cinco ângulos de diferenciação

Sintetizados da pesquisa de mercado, em ordem de defensabilidade:

1. **Durabilidade do dado como promessa central** — backup no grátis, restauração testada, ledger que não apaga. Ninguém no Brasil faz.
2. **Régua de cobrança, não caderno** — vencimento, fila do dia, mensagem pronta com Pix. Os concorrentes registram; nenhum ajuda a receber.
3. **Prevenção na concessão** — limite definido pelo lojista + **score interno construído do próprio histórico dele** ("pagou 12 de 14 vezes em dia"). Custa zero, é mais preditivo que bureau externo para este caso, e é juridicamente defensável.
4. **Foco radical no fiado** — resistir a virar ERP é a estratégia, não a limitação.
5. **Confiança operacional** — saldo que sempre bate, estorno em vez de exclusão, cancelamento em um toque, **zero anúncios em qualquer plano**. É o mais barato de fazer certo: exige disciplina de engenharia, não capital.

## A frase que resume

> Os concorrentes ajudam o lojista a **registrar o prejuízo**. O Na Rua ajuda ele a **evitar o prejuízo** — e a continuar cumprimentando o freguês na rua no dia seguinte.
