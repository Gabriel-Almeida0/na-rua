# Microcopy e tom de voz

> Catálogo normativo de strings. Vocabulário em [glossário](../00-visao/04-glossario.md).

## O tom

**O app fala como um vizinho prestativo que entende de caderno. Não como um banco.**

| Atributo | É | Não é |
|---|---|---|
| Pessoa | "você", "seu freguês" | "o usuário", "o cliente cadastrado" |
| Registro | Português falado de balcão | Português corporativo ou jurídico |
| Frases | Curtas, uma ideia por frase, nível de leitura de 6ª a 8ª série | Períodos compostos, subordinadas |
| Emoji | Pouco e funcional (✓ 🔴 💰 🎉) | Decorativo em toda linha |
| Erro | Diz o que fazer agora | Diz o que deu errado tecnicamente |
| Cobrança | "lembrar", "recadinho", "avisar" | "cobrar", "notificar", "acionar" |

*Base: NN/g recomenda 6ª série na home e 8ª nas demais telas para baixo letramento.*

## Regra de ouro do erro

> **Toda mensagem de erro diz o que o lojista deve fazer agora, na voz ativa, sem culpar ninguém e sem termo técnico.**

❌ `Erro 500: falha ao sincronizar com o servidor`
✅ `Não consegui guardar na nuvem agora. Tá tudo salvo aqui no celular — tento de novo quando pegar sinal.`

---

## Catálogo de strings

### Ações principais

| Chave | String |
|---|---|
| `acao.anotar` | `➕ ANOTAR FIADO` |
| `acao.receber` | `💰 RECEBI` |
| `acao.confirmar_fiado` | `Pronto, anotar fiado` |
| `acao.pagou_tudo` | `Pagou tudo` |
| `acao.pagou_metade` | `Pagou metade` |
| `acao.dar_baixa` | `✓ DAR BAIXA` |
| `acao.lembrar` | `Lembrar` |
| `acao.mandar_zap` | `Mandar recadinho no zap` |
| `acao.mandar_conta` | `Mandar a conta pro freguês` |
| `acao.desfazer` | `Desfazer` |
| `acao.anotar_outro` | `Anotar outro` |
| `acao.cliente_novo` | `+ Cliente novo` |
| `acao.pegar_agenda` | `Pegar da agenda` |
| `acao.resumo_zap` | `Mandar resumo pro meu zap` |
| `acao.copiar_pix` | `Copiar chave` |

### Estados vazios

| Chave | String |
|---|---|
| `vazio.primeira_vez` | `Aqui vai ficar a lista de quem te deve.`<br>`Anote o primeiro fiado e pronto — o caderno pode descansar.`<br>`[Anotar o primeiro]` |
| `vazio.ninguem_deve` | `Ninguém te deve nada agora. 🎉`<br>`Tá tudo em dia por aqui.` |
| `vazio.sem_atrasados` | `Nenhum atrasado. Seu povo tá pagando direitinho.` |
| `vazio.cliente_zerado` | `A conta da {nome} tá zerada.` |
| `vazio.busca` | `Não achei ninguém com esse nome.`<br>`[Cadastrar {termo} como freguês novo]` |

### Confirmações

| Chave | String |
|---|---|
| `ok.anotado` | `Anotado!`<br>`{nome} agora deve {valor}` |
| `ok.quitado` | `🎉 Conta da {nome} QUITADA!`<br>`Ela não te deve nada` |
| `ok.parcial` | `✓ Recebido {valor}`<br>`Ainda falta {restante}` |
| `ok.desfeito` | `Voltei atrás. A conta da {nome} está em {valor} de novo.` |
| `ok.sincronizado` | `Tudo salvo na nuvem ✓` |
| `ok.cliente_criado` | `{nome} entrou na caderneta.` |
| `ok.lembrete_enviado` | `Recadinho preparado. Agora é só mandar no WhatsApp.` |

### Conexão e sincronização

| Chave | String |
|---|---|
| `rede.offline` | `Sem internet — está tudo anotado aqui no seu celular. Quando pegar sinal, eu guardo na nuvem.` |
| `rede.offline_curto` | `Sem internet — está tudo anotado aqui` |
| `rede.sem_sync_48h` | `Faz {dias} dias que não pego internet. Suas anotações estão salvas aqui, pode ficar tranquilo.` |
| `rede.falha_sync` | `Não consegui guardar na nuvem agora. Tá tudo salvo aqui no celular — tento de novo quando pegar sinal.` |

> ⚠️ Nenhuma dessas strings usa "erro", "falha", "pendente" ou "risco de perda". O lançamento **está salvo**; o que oscila é a conexão.

### Avisos e erros

| Chave | String |
|---|---|
| `aviso.valor_vazio` | `Digite o valor` *(rótulo do botão desabilitado, sem alerta vermelho)* |
| `aviso.valor_atipico` | `{valor}? Confere aí — {nome} costuma levar uns {media}.`<br>`[Tá certo]` `[Corrigir]` |
| `aviso.sem_whatsapp` | `Não tenho o zap da {nome}. Quer botar agora?`<br>`[Botar o número]` `[Depois]` |
| `aviso.horario_ruim` | `Tá tarde. Melhor mandar amanhã de manhã?`<br>`[Deixar pra amanhã]` `[Mandar mesmo assim]` |
| `aviso.lembrete_recente` | `Você já lembrou a {nome} há {dias} dias. Quer mandar de novo mesmo?` |
| `aviso.nome_duplicado` | `Você já tem uma "{nome}". Essa é a mesma ou é outra pessoa?`<br>`[É a mesma]` `[É outra {nome}]` |
| `aviso.pagou_a_mais` | `{nome} te pagou {excedente} a mais. Quer deixar esse valor como crédito pra próxima?`<br>`[Deixar de crédito]` `[Corrigir valor]` |
| `aviso.rascunho` | `Você tinha começado uma anotação da {nome}. Continuar?` |
| `aviso.conta_contestada` | `{nome} disse que essa conta tá errada. Enquanto vocês não resolvem, não mando lembrete.` |

### A única confirmação modal do app

| Chave | String |
|---|---|
| `modal.apagar_com_saldo` | `A {nome} ainda deve {valor}.`<br>`Se você apagar, some tudo e não dá pra voltar atrás.`<br>`[Apagar mesmo assim]` `[Deixar quieto]` |

### A promessa de confiança

Aparece em **toda** tela de lembrete, sem exceção:

| Chave | String |
|---|---|
| `promessa.nao_manda_sozinho` | `ⓘ Você que manda. O app não manda nada sozinho.` |

---

## Modelos de lembrete

Todos **editáveis**. O lojista pode salvar a versão dele. O default é sempre o mais leve.

### Tom 1 — "Bem de leve" (padrão)
```
Oi, {nome}! Tudo bem? Passando só pra lembrar da conta
aqui do {loja}, tá em {valor}. Quando der, é só passar
aqui 😊 Se ficar melhor, meu Pix é {chave}. Abraço!
```

### Tom 2 — "Direto"
```
Oi, {nome}, tudo bem? A conta aqui no {loja} está em
{valor}, venceu dia {vencimento}. Dá pra acertar essa
semana? Se precisar dividir, a gente conversa.
Pix: {chave}
```

### Tom 3 — "Só o valor"
```
Oi {nome}! Sua conta: {valor}. Pix {chave}. Obrigado! 🙏
```

### Quando houver encargos — bloco obrigatório

Exigência da Lei SP 17.832 art. 49 (discriminação) e do CDC art. 42-A (identificação do credor):

```
Valor original: {originario}
Multa: {multa}
Juros: {juros}
Total: {total}

{razao_social} · {endereco} · CNPJ {cnpj}
```

### Palavras proibidas em qualquer mensagem

`devedor` · `caloteiro` · `inadimplente` · `negativado` · `protesto` · `medidas judiciais` · `cobrança` · `débito em aberto` · `vamos tomar providências` · `última chance` · `urgente`

E **nunca** misturar promoção com cobrança na mesma mensagem — descaracteriza a natureza transacional (e, na Cloud API, reclassificaria o template de *utility* para *marketing*, ~9× mais caro).

---

## Números e datas

| Regra | Exemplo |
|---|---|
| Sempre com `R$` e duas casas | `R$ 18,50` — nunca `18.5` |
| Milhar com ponto, decimal com vírgula | `R$ 1.847,50` |
| Datas recentes em linguagem natural | `hoje` · `ontem` · `terça` · `05/08` |
| Atraso em dias, nunca em data | `Atrasou 6 dias` — nunca `Vencido em 29/08` |
| Vencimento futuro | `Vence dia 5` — nunca `Vencimento: 05/10/2026` |
| Zero | `Zerado` — nunca `R$ 0,00` |

---

## Pendências de validação

`[H]` Não existe levantamento dialetológico publicado sobre os termos de fiado por região. Testar com ~30 lojistas em 3 regiões **antes de congelar a UI**:

| Termo em uso | Alternativa neutra a testar contra |
|---|---|
| **"Tá na rua"** | "Tenho pra receber" |
| **"Freguês"** | "Cliente" |
| **"Recadinho"** | "Lembrete" |
| **"Anotar fiado"** | "Botar na conta" |
| Apelido como nome ("Maria da Padaria") | Nome completo |
