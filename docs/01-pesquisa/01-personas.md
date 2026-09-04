# Personas

> Derivado da [pesquisa de mercado](00-pesquisa-de-mercado.md) e da [pesquisa de UX](../02-ux/00-pesquisa-ux.md).
>
> **Aviso metodológico honesto:** estas personas são construídas a partir de dados quantitativos (Sebrae/BCB, Cetic.br, ABRAS), de material etnográfico jornalístico e de ~620 reviews reais coletados da Play Store. **Não houve pesquisa de campo primária.** Cada atributo marcado `[H]` é hipótese a validar em 8–12 visitas de balcão antes do detalhamento fino.

---

## Persona primária — Dona Marlene, 52 anos

**"Eu conheço todo mundo aqui. O problema não é confiar, é lembrar."**

### Quem é
Dona de um mercadinho de esquina há 14 anos, em bairro periférico. MEI. Fatura em torno de R$ 5–6 mil por mês. Trabalha com a filha, que ajuda no balcão à tarde. Mora a duas quadras da loja.

### Contexto verificado
- **Vende fiado** — está nos 42% de MEIs que vendem a prazo informalmente
- **Já teve problema para receber** — está nos 86%
- **Anota em caderno brochura** — está nos 47% que registram receita em papel
- **Nunca fez curso de gestão financeira** — está nos 77%
- Tem **entre 8 e 15 devedores ativos**, todos escolhidos por conhecimento pessoal
- **Não cobra juros.** O preço é o mesmo à vista e fiado
- Usa **WhatsApp** o dia inteiro para tudo — está nos 82%
- **Aceita Pix** e é o principal meio de recebimento

### Aparelho e conexão
Android de entrada, 5 a 6 polegadas, comprado há uns 3 anos. Plano pré-paco com pacote de dados limitado — está nos 69% da classe DE em pré-pago. Wi-Fi da loja cai quando ela vai ao estoque. `[H]` O pior sinal da loja é justamente no balcão.

### O dia dela
Abre às 7h. Entre 7h e 9h e entre 17h e 19h o balcão não vazia. É exatamente nesse pico que o fiado acontece — e é quando ela **não tem 30 segundos** para mexer no celular. Fecha às 20h e é aí, sentada, que ela olha o caderno.

### O que ela quer
1. Saber **quanto tem na rua** sem somar o caderno à mão
2. Saber **quem está atrasado** sem ter que lembrar de cada um
3. Cobrar **sem estragar a relação** com gente que ela vê na rua todo dia
4. **Não perder o controle** se o celular quebrar ou for roubado

### O que a impede de adotar um app
| Barreira | Evidência |
|---|---|
| Medo fundado de perder tudo | *"Minha sorte que registro no caderno"* — usuária real, 1★ |
| Anúncio travando o cadastro | *"Propaganda demais, nem cheguei a cadastrar um cliente. Abriu 4 propagandas"* |
| Ser mais lento que a caneta | Escrever "Maria — 18,50" leva ~6 segundos |
| Paywall antes de provar valor | *"Desinstalei assim que fui testar e vi campos bloqueados"* |
| Não conseguir corrigir um erro | *"Lancei um crédito quando na verdade é um débito e não encontrei opção de alterar"* |

### O que faria ela ficar
Anotar o primeiro fiado em menos de 60 segundos desde que abriu o app pela primeira vez, e ver o total na rua aparecer sozinho na tela.

### Frase que ela diria
> "Eu não quero um sistema. Eu quero saber quanto o povo me deve e não passar vergonha cobrando."

---

## Persona secundária — Jéssica, 24 anos, filha e balconista

**"Minha mãe não mexe muito no celular. Quem instala as coisas sou eu."**

### Quem é
Filha da Dona Marlene. Trabalha no balcão à tarde e nos fins de semana. Estuda à noite. É ela quem instala aplicativo, resolve problema de celular e configura Pix. `[H]` Este padrão de mediação tecnológica é conhecido, mas **não encontrei fonte brasileira específica** — validar.

### Papel no produto
- **É ela quem faz o onboarding.** O produto precisa ser configurável por uma pessoa e usado por outra.
- **Ela lança fiado no balcão** com o cliente esperando. É a usuária mais frequente do fluxo mais crítico.
- Tem letramento digital alto, mas **zero paciência**: se travar, ela volta pro caderno e diz que "o app é ruim".

### O que ela precisa
- Login que não expire toda hora e que não dependa do e-mail dela
- Poder lançar rápido, sem pedir senha
- **Não conseguir** apagar histórico nem ver o total do caixa — porque é isso que faz a mãe dela confiar em dar acesso `[H]` **hipótese não validada; define toda a arquitetura de permissões**

### Consequência de design
O papel **balconista** existe no MVP e é restritivo por padrão. Ver [modelo de dados](../04-arquitetura/02-modelo-de-dados.md) e [ADR-0008](../05-adr/0008-papel-fora-do-jwt.md).

---

## Persona terciária — Seu Antônio, 47 anos, cliente devedor

**"Eu sempre pago porque, se não, ele não vende, né?"** *(citação real)*

### Quem é
Cliente da loja há anos. Renda irregular ou mensal, concentrada no fim do mês — salário, aposentadoria ou benefício. Compra fiado durante o mês e acerta quando recebe.

### Contexto verificado
- Está numa faixa onde **84,9% das famílias estão endividadas** e **38,5% inadimplentes** (até 3 salários mínimos)
- Provavelmente está entre os **51,0% de adultos negativados** — e é justamente por isso que compra fiado: é o único crédito ao qual tem acesso
- **Entende a interdependência.** Ele sabe que se não pagar, a loja quebra e ele perde o acesso
- **Se afasta da loja por vergonha** quando está devendo — o que é ruim para os dois

### O que ele precisa do produto
- **Não instalar nada.** Link público, sem login, sem cadastro
- Ver **a própria conta** e nada mais — nunca a lista de outros devedores
- Uma forma fácil de pagar: **chave Pix copiável** e QR Code
- Ser tratado como freguês, não como devedor: a página nunca usa a palavra "dívida", "atraso" ou "vencido em vermelho piscando"

### Risco não testado
`[H]` **Este é o maior risco não validado do produto:** não se sabe se o cliente recebe bem o link ou se ele soa como cobrança formal e o afasta. **Testar com 8–10 devedores reais antes do lançamento.**

---

## Anti-persona — quem o Na Rua não atende

Registrado para evitar deriva de escopo.

| Não é usuário | Por quê |
|---|---|
| **Loja que precisa de PDV, estoque e NF-e** | É cliente de Kyte, Bling, vhsys. Atender exige virar ERP |
| **Financeira, agiota, quem empresta dinheiro** | Mútuo feneratício habitual é zona regulatória. Fora de escopo permanente |
| **Loja que vende parcelado com juros e contrato** | Precisa dos 5 itens do art. 52 do CDC e de gestão de carnê. Fase 2, no máximo |
| **Empresa com setor de cobrança** | O produto é desenhado em torno de o dono não ter estômago para cobrar |
| **Comércio sem relação pessoal com o cliente** | Sem a relação, o fiado não existe — e o produto perde o sentido |
