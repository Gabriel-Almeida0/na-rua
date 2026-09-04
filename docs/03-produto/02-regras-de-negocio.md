# Regras de negócio

> Especificação normativa. Regras marcadas 🔒 são **invariantes de domínio**: valem no código, no banco e nos testes — e não podem ser desativadas por configuração.

## 1. Dinheiro

| # | Regra |
|---|---|
| 1.1 🔒 | Todo valor é **inteiro em centavos** (`bigint`). Nunca float, nunca decimal de reais |
| 1.2 🔒 | Todo lançamento tem valor **estritamente positivo**. A direção (débito/crédito) carrega o sinal |
| 1.3 🔒 | **Partida dobrada:** todo evento gera no mínimo dois lançamentos cuja soma de débitos é igual à soma de créditos |
| 1.4 🔒 | O **saldo é derivado** dos lançamentos. Nunca existe coluna de saldo mutável como fonte de verdade |
| 1.5 🔒 | Nenhum lançamento é atualizado ou deletado. Correção é **contra-lançamento** |
| 1.6 | Saldo de um cliente = soma dos débitos − soma dos créditos da conta dele |
| 1.7 | "Tá na rua" = soma dos saldos positivos de todos os clientes da loja |
| 1.8 | Pagamento maior que o saldo gera **crédito a favor do cliente** (saldo negativo), nunca erro |
| 1.9 | Arredondamento não existe: se não é centavo inteiro, não é valor válido |

## 2. Fiado

| # | Regra |
|---|---|
| 2.1 | Um fiado tem: cliente, valor, data e (opcional) descrição |
| 2.2 | Data padrão é hoje; retroativa é permitida com 1 toque |
| 2.3 | Data futura **não** é permitida — fiado é registro de fato ocorrido |
| 2.4 | Descrição é **sempre opcional**. Registrar itens individuais é opt-in explícito com aviso, porque pode criar dado sensível por inferência |
| 2.5 | Vencimento é expresso como **dia do mês** ou **quinzena**, não data absoluta |
| 2.6 | Sem vencimento definido, o padrão da loja é aplicado; sem padrão, o fiado não vence — só acumula |
| 2.7 | **Não há juros por padrão.** O fiado de bairro não cobra juros, e o produto reflete isso |

## 3. Encargos — quando o lojista optar

| # | Regra |
|---|---|
| 3.1 🔒 | **Multa máxima: 2%** do valor da prestação. Validado no domínio, não só na interface |
| 3.2 🔒 | Juros com **teto configurável e default conservador**, com aviso ao lojista sobre o limite jurisprudencial de 12% a.a. para crediário de varejo |
| 3.3 🔒 | Cobrar encargos exige **comprovante com aceite do cliente**. Sem aceite, não há convenção — e sem convenção não há multa nem juros pactuados |
| 3.4 🔒 | Antes do aceite de parcelamento com encargos, exibir os **cinco itens do art. 52 do CDC**: preço em moeda corrente, montante dos juros de mora e taxa efetiva anual, acréscimos legais, número e periodicidade das prestações, e soma total a pagar com e sem financiamento |
| 3.5 | Toda mensagem e todo documento de cobrança discrimina **valor originário / multa / juros / total** |

## 4. Cobrança

| # | Regra |
|---|---|
| 4.1 🔒 | **O sistema nunca envia mensagem sozinho.** Não existe envio automático, nem como configuração oculta |
| 4.2 🔒 | Envio é sempre **1:1 para o telefone do próprio devedor**. Grupo, lista de transmissão, cópia e terceiros são bloqueados no código |
| 4.3 🔒 | Fora da janela **seg–sex 9h–18h / sáb 9h–13h** (feriados nacionais bloqueados), o app **avisa** antes de preparar o lembrete |
| 4.4 🔒 | **Máximo 1 lembrete sugerido por cliente por semana.** Nova tentativa antes disso exige confirmação explícita |
| 4.5 🔒 | Conta em estado **contestada** suspende automaticamente qualquer sugestão de lembrete |
| 4.6 🔒 | Templates são **fechados e revisados**. Nenhuma palavra da lista proibida ([microcopy](../02-ux/03-microcopy.md)) |
| 4.7 🔒 | Toda mensagem de cobrança traz **nome, endereço e CNPJ/CPF do lojista** |
| 4.8 | Opt-out (`SAIR`) marca o cliente e interrompe qualquer sugestão futura |
| 4.9 | Todo lembrete preparado é registrado: quando, para quem, qual tom, por qual usuário |
| 4.10 | **Nunca gerar lista de devedores** imprimível, afixável ou compartilhável |

## 5. Clientes e dados

| # | Regra |
|---|---|
| 5.1 🔒 | **Só o nome é obrigatório.** CPF, telefone, endereço e tudo o mais são opcionais |
| 5.2 🔒 | RG, foto de documento, comprovante de renda, local de trabalho e contato de referência **não existem no schema** |
| 5.3 | Apelido é nome válido |
| 5.4 | Cliente com saldo em aberto só é apagado com confirmação modal explícita — a única do app |
| 5.5 | Apagar cliente **não apaga o ledger**: os lançamentos são anonimizados, preservando a integridade contábil |
| 5.6 | Telefone só é exigido no momento de preparar um lembrete — e o app oferece cadastrar ali |
| 5.7 | Opt-in de WhatsApp é registrado com data, hora e usuário responsável |

## 6. Limite de crédito

| # | Regra |
|---|---|
| 6.1 🔒 | O limite é **definido pelo lojista**, cliente a cliente. A plataforma nunca calcula nem aprova |
| 6.2 🔒 | Estourar o limite **avisa, nunca bloqueia** a venda. Bloqueio automatizado seria decisão automatizada de crédito |
| 6.3 | Offline, o limite é validado contra o saldo local conhecido, e o lançamento é marcado como provisório |
| 6.4 | Se o estouro só for descoberto na sincronização, isso vira **alerta para o dono** — nunca rollback silencioso |

> **Fundamento de 6.3 e 6.4:** limite é uma invariante de desigualdade e não pode ser garantida offline. Rollback silencioso de dinheiro é pior que estouro de limite.

## 7. Papéis e permissões

| Ação | Dono | Gerente | Balconista |
|---|:---:|:---:|:---:|
| Anotar fiado | ✅ | ✅ | ✅ |
| Receber pagamento | ✅ | ✅ | ✅ |
| Cadastrar cliente | ✅ | ✅ | ✅ |
| Ver saldo de um cliente | ✅ | ✅ | ✅ |
| **Ver "tá na rua" (total da loja)** | ✅ | ✅ | ❌ |
| **Ver fechamento do dia** | ✅ | ✅ | ❌ |
| Estornar lançamento | ✅ | ✅ | ❌ |
| Preparar lembrete | ✅ | ✅ | ⚠️ configurável |
| Definir limite de cliente | ✅ | ✅ | ❌ |
| Apagar cliente | ✅ | ❌ | ❌ |
| Exportar dados | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Configurar a loja | ✅ | ❌ | ❌ |

| # | Regra |
|---|---|
| 7.1 🔒 | **Revogação de acesso é instantânea.** O papel é lido da tabela de membership a cada verificação, nunca de claim no token |
| 7.2 🔒 | Toda loja tem exatamente **um dono**. Transferência é ação explícita e auditada |
| 7.3 | Todo lançamento registra **quem** o criou. Isso não é log — é coluna do próprio lançamento |

> **Fundamento de 7.1:** claims de JWT só atualizam no refresh do token. O dono demitir o balconista às 14h e o acesso dele persistir até o token expirar é inaceitável num app de dinheiro. Ver [ADR-0008](../05-adr/0008-papel-fora-do-jwt.md).

## 8. Sincronização

| # | Regra |
|---|---|
| 8.1 🔒 | O **ID do lançamento é gerado no cliente** (ULID/UUIDv7), antes de qualquer chamada de rede |
| 8.2 🔒 | O servidor aplica `ON CONFLICT (id) DO NOTHING`. Reenvio nunca duplica |
| 8.3 🔒 | A sincronização replica **eventos**, nunca saldo |
| 8.4 🔒 | O servidor **nunca envia DELETE** para o cliente |
| 8.5 | Lançamento criado offline é `pending`; após confirmação do servidor vira `posted` |
| 8.6 | Dois aparelhos offline que lançam para o mesmo cliente **somam**. Não há conflito a resolver |
| 8.7 | A interface **não distingue visualmente** item pendente de item confirmado na lista |
| 8.8 | O estado da conexão é comunicado **uma vez, no topo** — nunca por item |

## 9. Retenção de dados

| # | Regra |
|---|---|
| 9.1 | Conta **em aberto**: retida enquanto existir, mais o prazo prescricional |
| 9.2 | Conta **quitada**: histórico retido por 5 anos (por analogia ao art. 43 §1º do CDC e ao art. 206 §5º I do CC), depois **anonimizada** — mantém o agregado, apaga a identificação |
| 9.3 | Cliente inativo sem conta: expurgo após período de inatividade definido |
| 9.4 | Pedido de eliminação do titular: dados pessoais removidos, **lançamentos anonimizados**, integridade contábil preservada |
| 9.5 | Todo expurgo é job automatizado e auditável, não tarefa manual |

> ⚠️ **Pendência jurídica.** O prazo de 5 anos é analogia, não regra expressa para este caso. Validar com advogado e registrar a decisão.

## 10. Invariantes verificáveis

Estas são asserções que os testes rodam contra o banco. Qualquer violação é bug crítico.

```
I1  Para toda transação: Σ débitos = Σ créditos
I2  Para todo lançamento: valor_centavos > 0
I3  Nenhuma linha do ledger jamais sofreu UPDATE ou DELETE
I4  Saldo(cliente) == Σ lançamentos(cliente), sem exceção
I5  Todo lançamento pertence a exatamente um tenant
I6  Nenhum lançamento é visível a um usuário fora do tenant
I7  Toda multa ≤ 2% do valor da prestação
I8  Todo lembrete registrado tem destinatário único
I9  Nenhum lembrete registrado fora da janela de horário
I10 Todo lançamento tem created_by preenchido
```
