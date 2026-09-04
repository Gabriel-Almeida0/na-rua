# Pesquisa Regulatória — Na Rua

> **Status:** pesquisa concluída · **Data:** setembro de 2026
> **Natureza:** pesquisa técnica para decisões de arquitetura. **Não é parecer jurídico.**

---

# Fiado Digital — Pesquisa Regulatória para Arquitetura de Micro-SaaS

> **AVISO IMPORTANTE:** este é um documento de **pesquisa técnica** para orientar decisões de arquitetura de software. **Não é parecer jurídico** e não substitui a análise de advogado. Onde a fonte oficial não foi localizada ou o tema está juridicamente aberto, isso está sinalizado como *"não confirmado — verificar com advogado"*.
> Data da pesquisa: setembro de 2026.

---

## 0. Sumário executivo (o que muda o produto)

| # | Achado | Impacto na arquitetura |
|---|---|---|
| 1 | O SaaS é **operador**; o lojista é **controlador** (LGPD art. 5º, VI e VII) | Precisa de contrato de operador, DPA, e o app **não pode** usar os dados dos devedores para finalidade própria |
| 2 | Base legal para o fiado é **execução de contrato** (art. 7º, V) + **legítimo interesse** (art. 7º, IX) — **não** consentimento | Não construir tela de "aceite o termo" como se fosse pré-requisito para registrar a dívida |
| 3 | Dado de dívida **não é dado sensível** (art. 5º, II é rol taxativo), mas é de **alto risco reputacional** | Sem exigência do art. 11, mas com exigência forte de sigilo e minimização |
| 4 | **CPF não é necessário** para o núcleo do produto | Tornar CPF opcional; só obrigatório se/quando houver negativação ou NF |
| 5 | CDC art. 42 (civil) e art. 71 (**crime**, detenção 3 meses–1 ano) proíbem cobrança vexatória | Guard-rails de horário, frequência e linguagem são requisito legal, não "feature" |
| 6 | Lei SP 17.832/2023 art. 51 limita **telefonemas** de cobrança (seg–sex 8–20h, sáb 8–14h, feriado vedado) — mensagens não estão literalmente cobertas | Adotar a janela mesmo assim, por analogia e prudência |
| 7 | Juros do crediário do lojista: **STJ REsp 1.720.656 fixou teto de 12% a.a.**; multa máx. **2%** (CDC art. 52, §1º) | Validar no domínio: multa ≤ 2%, juros com teto configurável e default conservador |
| 8 | Venda a prazo pelo próprio lojista **não é operação bancária** e não exige autorização do BCB | Não vender o produto como "crédito"; nomenclatura importa |
| 9 | Se o Pix cair **direto na chave do lojista**, o SaaS **não** é instituição de pagamento | Arquitetura recomendada: nunca custodiar dinheiro |
| 10 | WhatsApp: modelo **por mensagem desde 01/07/2025**; **utility é grátis dentro da janela de 24h** | O modelo de custo do produto muda completamente conforme o cliente responda ou não |
| 11 | Negativação exige notificação prévia pelo **órgão mantenedor** (Súmula 359 STJ) e contrato com bureau | **Campo minado** — recomendação: não construir |

---

## 1. LGPD (Lei 13.709/2018)

### 1.1 Controlador ou operador?

**Texto legal (art. 5º, Lei 13.709/2018):**
- **VI – controlador:** "pessoa natural ou jurídica, de direito público ou privado, a quem competem as decisões referentes ao tratamento de dados pessoais"
- **VII – operador:** "pessoa natural ou jurídica, de direito público ou privado, que realiza o tratamento de dados pessoais em nome do controlador"

**Conclusão para o produto:**

O **lojista é o CONTROLADOR** dos dados dos clientes devedores. Ele decide quem cadastrar, o que registrar, quando cobrar e por quanto tempo guardar. O **SaaS é OPERADOR** — trata os dados *em nome* do lojista, seguindo as instruções dele.

**Mas atenção — a linha é frágil.** O SaaS vira **controlador (ou co-controlador)** no momento em que decide usar os dados para finalidade própria. Exemplos que fariam isso acontecer:
- Treinar modelo de score de inadimplência agregando dados de todos os lojistas
- Enriquecer o cadastro com bureaus e vender esse enriquecimento
- Fazer marketing para os devedores
- Cruzar bases de lojistas diferentes para detectar "o devedor que deve em 5 lojas"

Esse último ponto é o mais perigoso, porque é comercialmente tentador. **Se o produto criar uma base cruzada de devedores, ele deixa de ser um SaaS de gestão e passa a ser um bureau de crédito de fato** — com todas as obrigações do art. 43 do CDC e da Lei do Cadastro Positivo (Lei 12.414/2011). *Não confirmado se a ANPD/BCB já se manifestaram especificamente sobre esse formato — verificar com advogado antes de qualquer feature de "score compartilhado".*

Note ainda que, para os **dados do próprio lojista** (nome, e-mail, CPF/CNPJ, dados de cobrança da assinatura do SaaS), o SaaS **é controlador**. São dois papéis simultâneos no mesmo produto.

**Responsabilidade (art. 42, §1º, I):** "o operador responde solidariamente pelos danos causados pelo tratamento quando descumprir as obrigações da legislação de proteção de dados ou quando não tiver seguido as instruções lícitas do controlador, hipótese em que o operador equipara-se ao controlador".

Ou seja: **ser operador não é escudo**. Se o software tiver um vazamento, ou se ele próprio permitir a cobrança vexatória, o SaaS responde solidariamente.

**Art. 39:** "O operador deverá realizar o tratamento segundo as instruções fornecidas pelo controlador, que verificará a observância das próprias instruções e das normas sobre a matéria." → Isso exige **contrato escrito de operador (DPA)** nos Termos de Uso.

### 1.2 Qual base legal?

O rol do art. 7º é taxativo. As candidatas:

| Base | Artigo | Aplicabilidade ao fiado |
|---|---|---|
| **Execução de contrato** | art. 7º, **V** | ✅ **Principal.** "quando necessário para a execução de contrato ou de procedimentos preliminares relacionados a contrato do qual seja parte o titular, a pedido do titular dos dados". A venda a prazo é um contrato do qual o devedor é parte. Registrar nome, telefone, valor devido e vencimento é *necessário para executar* esse contrato. |
| **Legítimo interesse** | art. 7º, **IX** + art. 10 | ✅ **Complementar.** Para a atividade de **cobrança** propriamente dita, prevenção à fraude, e retenção de histórico após quitação. |
| **Exercício regular de direitos** | art. 7º, **VI** | ✅ Para cobrança judicial / prova em processo. |
| **Consentimento** | art. 7º, I | ⚠️ **Evitar como base principal.** Consentimento é revogável a qualquer tempo (art. 8º, §5º). Se o devedor revogar, o lojista perde a base para manter o registro da dívida. Isso é uma armadilha de design. |

**Sobre legítimo interesse (art. 10):**
> "§ 1º Quando o tratamento for baseado no legítimo interesse do controlador, somente os dados pessoais **estritamente necessários** para a finalidade pretendida poderão ser tratados.
> § 2º O controlador deverá adotar medidas para garantir a **transparência** do tratamento de dados baseado em seu legítimo interesse.
> § 3º A autoridade nacional poderá solicitar ao controlador **relatório de impacto** à proteção de dados pessoais."

A ANPD publicou em **fevereiro de 2024** o *Guia Orientativo das Hipóteses Legais de Tratamento de Dados Pessoais – Legítimo Interesse*, que exige o **teste de LIA (Legitimate Interest Assessment)**: finalidade legítima + necessidade + balanceamento com direitos do titular + salvaguardas.

**Consequência prática:** o SaaS deve entregar ao lojista um **modelo pronto de LIA e de aviso de privacidade** dentro do produto. Um mercadinho jamais vai redigir isso sozinho, e sem isso o lojista fica exposto — e o SaaS junto, por solidariedade.

**Nota de atualização legislativa:** o texto compilado da LGPD no Planalto registra que o art. 5º, VIII foi alterado pela **MP 1.317/2025** e pela **Lei nº 15.352, de 2026**, passando a ANPD a ser designada como **"Agência Nacional de Proteção de Dados"** (antes "Autoridade Nacional"). É mudança institucional, não altera as obrigações materiais aqui descritas.

### 1.3 Dado de dívida é dado sensível?

**Não.** O art. 5º, II define dado sensível de forma **taxativa**:

> "II – dado pessoal sensível: dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural"

Dívida, inadimplência e score **não estão na lista**. Logo, **não** se aplica o regime restritivo do art. 11.

**Porém — três ressalvas que importam para o design:**

1. **Risco de inferência.** A ANPD, na **Nota Técnica nº 4/2022/CGTP/ANPD** (setor de varejo farmacêutico), alertou que o **histórico de compras** pode permitir **inferência de dados sensíveis** — por exemplo, saúde. Isso é diretamente aplicável a um fiado de farmácia ou até de mercadinho ("comprou fralda geriátrica", "comprou insulina"). **Se o app registrar itens da venda e não só o valor, ele pode estar criando dado sensível por inferência.**

2. **A ANPD concluiu processo de fiscalização de redes de farmácias determinando ajustes de conduta**, apontando (Nota Técnica nº 6/2025/FIS/CGF/ANPD, fevereiro de 2025) baixa maturidade do setor, **falta de transparência** e **condicionamento de desconto à entrega do CPF sem informação prévia adequada**.

3. Dado de dívida é **dado de alto impacto reputacional**. Mesmo não sendo sensível juridicamente, sua exposição gera dano moral com facilidade (ver seção 2).

### 1.4 Obrigações práticas que isso cria na arquitetura

| Obrigação | Artigo LGPD | O que o software precisa ter |
|---|---|---|
| **Minimização / necessidade** | art. 6º, III — "limitação do tratamento ao mínimo necessário (...) dados pertinentes, proporcionais e não excessivos" | Cadastro mínimo: **apelido/nome + telefone**. CPF, endereço, RG, foto, local de trabalho = **opcionais** ou inexistentes. |
| **Finalidade** | art. 6º, I | Cada campo do cadastro precisa de justificativa. Se não sabe pra que serve, não colete. |
| **Eliminação / retenção** | art. 16 — "Os dados pessoais serão eliminados após o término de seu tratamento" | Política de retenção **implementada em código**: job de expurgo. Ver 1.4.1 abaixo. |
| **Direitos do titular** | art. 18 (confirmação, acesso, correção, anonimização/bloqueio/eliminação, portabilidade, informação sobre compartilhamento) | Endpoint/tela para o lojista atender pedidos do devedor. Exportação em formato legível (CSV/JSON). |
| **Registro de operações** | art. 37 — "O controlador e o operador **devem** manter registro das operações de tratamento (...) especialmente quando baseado no legítimo interesse" | **Audit log obrigatório**, não opcional: quem viu, quem editou, quem enviou cobrança, quando. |
| **Relatório de impacto (RIPD)** | art. 38 | A ANPD *pode* exigir. Não é automático. Mas dado o perfil (cobrança + inadimplência + população vulnerável), **recomenda-se ter um RIPD pronto**. |
| **Encarregado (DPO)** | art. 41 | Ver 1.4.2. |
| **Segurança** | art. 46 | Criptografia em repouso e trânsito, controle de acesso por lojista (multi-tenant com isolamento real), MFA. |
| **Incidentes** | art. 48 + Resolução CD/ANPD nº 15/2024 | Comunicar ANPD e titulares em **3 dias úteis** a partir da ciência de que o incidente afetou dados pessoais. Precisa de runbook. |

**1.4.1 Retenção — o ponto mais difícil**

A dívida quitada não desaparece do interesse legítimo imediatamente (histórico de bom pagador tem valor para o lojista e **para o próprio cliente**). Mas guardar para sempre viola o art. 16.

Sugestão de política padrão (a validar juridicamente):
- Dívida **em aberto**: retém enquanto existir + prazo prescricional
- Dívida **quitada**: retém histórico por período definido (comumente se usa 5 anos por analogia ao art. 43, §1º do CDC e ao prazo prescricional do art. 206, §5º, I do CC), depois **anonimiza** (mantém o agregado, apaga a identificação)
- Cliente **inativo sem dívida**: expurgo após período curto de inatividade
- *O prazo exato não é fixado por lei para esse caso — não confirmado; definir com advogado e documentar a decisão.*

**1.4.2 Encarregado (DPO) — boa notícia para o SaaS pequeno**

A **Resolução CD/ANPD nº 2, de 27/01/2022** (Regulamento de aplicação da LGPD para agentes de tratamento de pequeno porte) dispensa microempresas, empresas de pequeno porte e startups da obrigação de **indicar encarregado** (art. 41 da LGPD).

**Mas:** o agente que não indicar encarregado **deve disponibilizar um canal de comunicação com o titular**. E a dispensa **não** alcança as demais obrigações da LGPD (bases legais, princípios, direitos do titular, segurança).

→ **Consequência de design:** o produto precisa de um **canal de contato de privacidade visível** (e-mail dedicado + página pública), tanto do lado do SaaS quanto oferecido ao lojista.

### 1.5 É seguro pedir CPF do devedor?

**Resposta curta: no MVP, não peça. Torne opcional.**

Fundamentação:

1. **Princípio da necessidade (art. 6º, III)**: para registrar "João da padaria deve R$ 47,00", o CPF **não é necessário**. Telefone já identifica e já é o canal de cobrança.
2. A ANPD já autuou o varejo por **coleta excessiva e sem transparência de CPF** (Notas Técnicas 4/2022 e 6/2025).
3. CPF é a chave que permite cruzamento com bases externas — ou seja, é exatamente o dado que **aumenta o risco de vazamento** de forma desproporcional ao benefício.
4. Consumidor **não é obrigado** a fornecer CPF sem finalidade clara e informada.

**Quando o CPF passa a ser necessário:**

| Situação | CPF necessário? | Base |
|---|---|---|
| Registrar fiado, saldo, lembrete | ❌ Não | — |
| Emitir NFC-e/NF-e com identificação do consumidor | ✅ Sim, se o cliente pedir a nota com CPF | Legislação estadual do ICMS |
| Negativar em bureau | ✅ Sim, obrigatório | Requisito do bureau |
| Cobrança judicial | ✅ Sim | Qualificação da parte no processo |
| Pix Cobrança com vencimento (COBV) | ⚠️ A API Pix tem campo de devedor com CPF/CNPJ | Documentação da API Pix / BCB |

**Design recomendado:** campo CPF **opcional, colapsado, com microcopy explicando a finalidade** ("Só preencha se for emitir nota fiscal ou registrar em cadastro de proteção ao crédito"). Nunca bloquear o cadastro por falta de CPF. E **nunca** coletar RG, foto do documento, comprovante de renda, nome de familiares ou local de trabalho — tudo isso é excessivo e é vetor clássico de cobrança vexatória.

### 1.6 Compartilhamento com terceiros (WhatsApp, PSPs, bureaus)

Ao mandar `nome + telefone + valor da dívida` para uma API de WhatsApp, o SaaS realiza **uso compartilhado de dados** (art. 5º, XVI) — e, se o destinatário estiver fora do Brasil, **transferência internacional** (art. 33).

**Meta / WhatsApp Cloud API = transferência internacional.** A Meta é empresa dos EUA e os EUA **não** têm decisão de adequação da ANPD.

**Regime aplicável — Resolução CD/ANPD nº 19, de 23/08/2024** (Regulamento de Transferência Internacional de Dados):
- Aprovou as **Cláusulas-Padrão Contratuais (CPC)** brasileiras (Anexo II da Resolução)
- A adoção deve ser **integral e inalterada** do texto do Anexo II
- Prazo de transição para incorporar as CPCs em contratos existentes: **12 meses da publicação → encerrou em 23/08/2025**

→ **Consequência de design e de contrato:**
1. Mapear e documentar **todo** subprocessador que recebe dado pessoal (WhatsApp/Meta, PSP, provedor de nuvem, e-mail transacional, observabilidade/logs).
2. Verificar se o contrato com cada um contém as CPCs da Resolução 19/2024, ou fundamentar a transferência em outra hipótese do art. 33. *Se a Meta/BSP não oferece CPC brasileira — não confirmado; verificar com advogado; pode ser argumento forte a favor de usar BSP brasileiro.*
3. Listar os subprocessadores **publicamente** (art. 18, VII: o titular pode exigir "informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados").
4. **Não mandar mais do que o mínimo.** O template de WhatsApp precisa do primeiro nome e do valor — **não** precisa de CPF, endereço, nem da lista de itens comprados.
5. Preferir **hospedagem no Brasil** para o banco de dados (não é obrigatório por lei, mas elimina uma camada inteira de complexidade regulatória e é argumento de venda).

> ⚠️ **Ponto de atenção comercial:** um BSP brasileiro (Zenvia, Take Blip) tende a ser mais simples do ponto de vista de transferência internacional do que integrar direto na Cloud API da Meta — mas os dados de conteúdo da mensagem passam pela infraestrutura da Meta de qualquer forma. Isso é inerente ao WhatsApp. É mais um argumento a favor da estratégia `wa.me` (seção 5), onde **nenhum dado sai do dispositivo do lojista via API**.

---

## 2. Cobrança de dívida — Código de Defesa do Consumidor

### 2.1 O que é proibido (texto literal)

**CDC art. 42:**
> "Na cobrança de débitos, o consumidor inadimplente **não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça**.
> Parágrafo único. O consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais, salvo hipótese de engano justificável."

**CDC art. 42-A** (incluído pela Lei 12.039/2009) — **isto é um requisito de layout do template de cobrança:**
> "Em todos os documentos de cobrança de débitos apresentados ao consumidor, deverão constar o **nome, o endereço e o número de inscrição no CPF ou no CNPJ do fornecedor** do produto ou serviço correspondente."

**CDC art. 71 — é CRIME:**
> "Utilizar, na cobrança de dívidas, de ameaça, coação, constrangimento físico ou moral, afirmações falsas incorretas ou enganosas ou de qualquer outro procedimento que exponha o consumidor, injustificadamente, a ridículo **ou interfira com seu trabalho, descanso ou lazer**:
> Pena — Detenção de três meses a um ano e multa."

A expressão **"interfira com seu trabalho, descanso ou lazer"** é a base legal direta para janela de horário e limite de frequência. Cobrança às 23h ou 15 mensagens no mesmo dia caem literalmente aqui.

**CDC art. 54-G** (incluído pela Lei 14.181/2021 — Lei do Superendividamento) veda condutas na cobrança de crédito, notadamente cobrar valor **contestado pelo consumidor** enquanto não solucionada a controvérsia, e recusar entregar cópia do contrato.

→ **Consequência de design:** o app precisa de um estado **"dívida contestada"**. Quando o cliente diz "isso eu já paguei" ou "não foi isso que comprei", o lançamento deve entrar em disputa e **os lembretes automáticos devem parar** até o lojista resolver. Isso não é gentileza — é o art. 54-G.

### 2.2 Regra de horário para cobrar

**Não há lei federal** que fixe horário de cobrança. Há **leis estaduais**, e elas divergem entre si.

**São Paulo — atenção, a lei mudou.** A Lei estadual nº 15.426/2014 (frequentemente citada em blogs desatualizados) foi **revogada pela Lei nº 17.832, de 01/11/2023**, que consolidou a legislação consumerista paulista. O dispositivo vigente é:

**Lei SP nº 17.832/2023, Artigo 51** (Seção III — "Do horário para telefonemas de cobrança de débitos"):
> "Fica estabelecido que os **telefonemas de cobrança de débitos** devem ser realizados de **segunda a sexta-feira, das 8h00 às 20h00, e aos sábados, das 8h00 às 14h00**, excetuando-se os **feriados**, casos em que tais telefonemas são vedados."

**Artigo 52:** o descumprimento sujeita às sanções do **art. 71** e dos arts. 57 a 60 do CDC.

Outros dispositivos da mesma lei que impactam o produto:

- **Art. 49** — transparência dos valores: "Os valores apresentados ao consumidor, quando da cobrança da dívida, deverão ter **clareza quanto ao que efetivamente correspondem, destacando-se o valor originário, bem como o de cada item adicional** àquele, sejam juros, multas, taxas, custas, honorários ou outros, que, somados, correspondem ao valor total cobrado". O parágrafo único estende expressamente a exigência à **"cobrança impressa, por meio eletrônico ou por voz"**.
- **Art. 50** — toda cobrança **por ligação telefônica** deve ser **gravada**, com data e hora, e disponibilizada ao consumidor em até **7 dias úteis** se solicitada.
- **Art. 44, §3º** — para a comunicação de inscrição em cadastro de inadimplentes, "também servirá como prova de realização da comunicação (...) o comprovante de entrega de **correspondência eletrônica, via internet ou qualquer outro aplicativo de mensagem**".

**Achado crítico de interpretação:** o art. 51 fala literalmente em **"telefonemas"**. Ele **não menciona** mensagem de texto, WhatsApp ou e-mail. Já o art. 44, §3º mostra que o legislador paulista *sabe* falar de "aplicativo de mensagem" quando quer. Ou seja, **a restrição literal de horário provavelmente não alcança o WhatsApp** — *não confirmado, sem jurisprudência localizada sobre esse ponto específico na lei nova; verificar com advogado*.

**Isso NÃO significa que se pode mandar WhatsApp de cobrança às 23h.** O art. 71 do CDC (federal, e é crime) proíbe procedimento que "interfira com seu trabalho, **descanso** ou lazer" — e uma notificação de dívida às 23h é exatamente isso. A janela estadual é o **piso de prudência**, não o teto de risco.

**Outros estados** (fontes secundárias, *não confirmado em texto legal oficial*): Rio de Janeiro dias úteis 9h–19h; Minas Gerais dias úteis 9h–18h e sábados 10h–13h. Como o SaaS é nacional e não sabe onde o lojista está, **a solução de engenharia é adotar a janela mais restritiva como default**.

### 2.3 Cobrança por WhatsApp é permitida?

**Sim, o canal em si é lícito.** O que é ilícito é o **modo**. A jurisprudência dos Tribunais de Justiça (TJ-SP, TJ-MG, TJ-SC, TJ-MS) é consistente em três teses:

1. **Cobrança em grupo de WhatsApp ou rede social = dano moral.** "O excesso do credor ao promover cobrança vexatória de dívida em ambiente virtual público, expondo o nome e imagem do devedor, causa dano moral indenizável." A conduta "ultrapassa a fronteira jurídica entre o exercício regular e o abuso de direito, atingindo a honra do autor, de modo a atrair a incidência do **art. 927 do Código Civil**".
2. **Cobrança dirigida a terceiros** (vizinho, parente, patrão, colega) alheios à relação contratual = dano moral.
3. **Cobrança reservada, direta e educada = exercício regular de direito**, sem dano.

*Os acórdãos específicos foram localizados via agregador (JusBrasil) e não em repositório oficial de tribunal — os números de processo não foram confirmados em fonte primária. Verificar com advogado antes de citar em material comercial.*

### 2.4 Guard-rails que o software DEVE ter

Estes deixam de ser "boas práticas" e viram **requisitos funcionais derivados de norma**:

| Guard-rail | Fundamento | Implementação |
|---|---|---|
| **Janela de horário** | CDC art. 71; Lei SP 17.832 art. 51 | Scheduler nunca dispara fora de seg–sex 9h–18h / sáb 9h–13h (default conservador, união das regras estaduais). Feriados nacionais bloqueados. Configurável, mas **com limites rígidos** — o lojista não pode destravar 22h. |
| **Limite de frequência** | CDC art. 71 ("interfira com trabalho, descanso ou lazer") | Máx. 1 lembrete automático por dívida por dia; máx. ~2–3 por semana; backoff crescente (D+1, D+7, D+15, D+30) e então parar. |
| **Destinatário único** | CDC art. 42 + jurisprudência | O envio é sempre **1:1 para o telefone do próprio devedor**. **Bloquear no código**: sem envio para grupo, sem cópia, sem "contato de referência", sem lista de transmissão. |
| **Linguagem não vexatória** | CDC art. 42 e 71 | Templates **fechados e revisados**. Sem campo de texto livre no envio automático. Sem as palavras "devedor", "caloteiro", "negativado", "protesto", "vamos tomar providências". |
| **Sem ameaça** | CDC art. 71 | Nunca prometer consequência que o lojista não vai executar (ameaça de protesto/SPC que não existe é o clássico do art. 71). |
| **Transparência de valores** | Lei SP 17.832 art. 49 | O template e a tela devem discriminar: **valor originário / multa / juros / total**. Nunca só o total. |
| **Identificação do credor** | CDC art. 42-A | Todo documento/mensagem de cobrança deve trazer **nome, endereço e CPF/CNPJ do lojista**. |
| **Estado "contestada"** | CDC art. 54-G | Botão de contestação → suspende automação. |
| **Opt-out** | Boa prática + Política da Meta | "Responda SAIR para não receber mais" → marca o cliente e para o envio automatizado. |
| **Sem exposição física** | CDC art. 42 e 71 | Se houver modo caderneta/impressão, **nunca** gerar "lista de devedores" afixável no balcão. Esse é o pecado original do fiado analógico. |
| **Audit log** | LGPD art. 37 | Registrar cada envio: quando, para quem, qual template, por qual usuário. É a prova de defesa do lojista *e* do SaaS. |

> **Insight de produto:** esses guard-rails não são só compliance — são o **diferencial competitivo** e a mensagem de marketing do produto. "Cobra sem constranger, dentro da lei" vende melhor para o dono do mercadinho do que "gestão de recebíveis", porque o medo real dele é brigar com o cliente que ele encontra na rua todo dia.

---

## 3. Juros e multa

### 3.1 Multa por atraso

**CDC art. 52, §1º** (redação da Lei 9.298/1996) — texto literal:
> "As multas de mora decorrentes do inadimplemento de obrigações no seu termo **não poderão ser superiores a dois por cento do valor da prestação**."

→ **Teto duro: 2%.** Regra clara, sem controvérsia. **Validação no domínio, não só na UI.**

O art. 52 também impõe **dever de informação prévia** ao consumidor sobre: preço em moeda corrente (I), **montante dos juros de mora e a taxa efetiva anual de juros** (II), acréscimos legais (III), número e periodicidade das prestações (IV) e **soma total a pagar, com e sem financiamento** (V).

→ **Consequência de design:** se o app permitir parcelar o fiado com juros, ele **precisa** gerar e exibir esses cinco itens ao cliente **antes** do aceite. Isso é uma tela obrigatória, não opcional.

### 3.2 Juros de mora — o cenário mudou em 2024

**Código Civil art. 406, na redação da Lei nº 14.905/2024:**
> "Quando não forem convencionados, ou quando o forem sem taxa estipulada, ou quando provierem de determinação da lei, os juros serão fixados de acordo com a **taxa legal**.
> § 1º A taxa legal corresponderá à **taxa referencial do Sistema Especial de Liquidação e de Custódia (Selic), deduzido o índice de atualização monetária** de que trata o parágrafo único do art. 389 deste Código.
> § 2º A metodologia de cálculo da taxa legal e sua forma de aplicação serão definidas pelo Conselho Monetário Nacional e divulgadas pelo Banco Central do Brasil.
> § 3º Caso a taxa legal apresente resultado negativo, este será considerado igual a 0 (zero) para efeito de cálculo dos juros no período de referência."

Ou seja: **se o lojista não convencionar taxa, aplica-se Selic − IPCA.** Isso é *muito* menos do que o 1% ao mês que a prática de mercado assume.

**E se convencionar?** Aí entra a **Lei de Usura (Decreto nº 22.626/1933)**, que veda estipular juros superiores ao **dobro da taxa legal**.

**Ponto crítico:** o **art. 3º da Lei 14.905/2024** afastou a Lei de Usura de certas obrigações:
> "Art. 3º Não se aplica o disposto no Decreto nº 22.626, de 7 de abril de 1933, às obrigações:
> I – contratadas **entre pessoas jurídicas**;
> II – representadas por títulos de crédito ou valores mobiliários;
> III – contraídas perante: a) instituições financeiras e demais instituições autorizadas a funcionar pelo Banco Central do Brasil; b) fundos ou clubes de investimento; c) sociedades de arrendamento mercantil e empresas simples de crédito; d) OSCIPs (Lei 9.790/1999) que se dedicam à concessão de crédito; ou
> IV – realizadas nos mercados financeiro, de capitais ou de valores mobiliários."

**Fiado de mercadinho para pessoa física NÃO se enquadra em nenhuma dessas exceções.** Portanto, **a Lei de Usura continua aplicável ao nosso caso**.

### 3.3 O teto de 12% ao ano — STJ REsp 1.720.656

**STJ, 3ª Turma, REsp 1.720.656, julgado em 28/04/2020:**

Lojas varejistas **não podem cobrar, no crediário, juros remuneratórios superiores a 1% ao mês (12% ao ano)**.

Fundamento: lojas de varejo **não se equiparam a instituições financeiras**, não estão sujeitas à fiscalização do **Conselho Monetário Nacional**, e por isso **não** se beneficiam da exceção da Lei 4.595/1964 (Sistema Financeiro Nacional) nem podem contratar às taxas médias de mercado. Aplicam-se os limites gerais do **Código Civil (arts. 406 e 591)** e da **Lei de Usura**. A decisão referencia a **Súmula 596/STF** (apenas instituições financeiras escapam dos limites de juros do direito comum).

> ⚠️ **Nuance importante e não resolvida:** a Lei 14.905/2024 **alterou o art. 591 do CC**, removendo o teto que constava da redação anterior. O art. 591 hoje diz apenas: *"Destinando-se o mútuo a fins econômicos, presumem-se devidos juros. Parágrafo único. Se a taxa de juros não for pactuada, aplica-se a taxa legal prevista no art. 406."* Como um dos pilares do REsp 1.720.656 era a redação **antiga** do art. 591, e como a "taxa legal" hoje é flutuante (Selic − IPCA) em vez dos históricos 6% a.a., **o teto de 12% a.a. pode estar juridicamente instável para contratos firmados após 30/08/2024**.
> **Não confirmado — não localizei decisão do STJ posterior à Lei 14.905/2024 sobre crediário de varejo. Verificar com advogado.**

### 3.4 Correção monetária

**Permitida e devida.** Código Civil, na redação da Lei 14.905/2024:

- **Art. 389:** "Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros, **atualização monetária** e honorários de advogado. **Parágrafo único.** Na hipótese de o índice de atualização monetária não ter sido convencionado ou não estar previsto em lei específica, será aplicada a variação do **IPCA**, apurado e divulgado pelo IBGE, ou do índice que vier a substituí-lo."
- **Art. 395:** "Responde o devedor pelos prejuízos a que sua mora der causa, mais juros, atualização dos valores monetários e honorários de advogado."
- **Art. 404:** "As perdas e danos, nas obrigações de pagamento em dinheiro, serão pagas com atualização monetária, juros, custas e honorários de advogado, sem prejuízo da pena convencional."

→ **IPCA é o índice legal supletivo.** Mas note a mecânica: como a taxa legal do art. 406 já é **Selic − IPCA**, aplicar "juros legais + correção pelo IPCA" reconstitui a Selic. Aplicar 1% a.m. **e mais** IPCA por cima seria acumulação indevida. *Confirmar a fórmula com contador/advogado antes de implementar cálculo automático.*

### 3.5 Precisa de contrato escrito?

**Juridicamente, não.** A compra e venda a prazo é válida verbalmente. É por isso que o fiado analógico funciona há um século.

**Praticamente, sim** — e esse é justamente o valor do produto. Sem prova escrita:
- Não se pode cobrar **juros e multa** (encargo precisa ser convencionado — art. 406 exige convenção; sem ela, cai a taxa legal supletiva e a multa simplesmente não existe)
- Não se cumpre o dever de informação do **art. 52 do CDC**
- Fica difícil provar a dívida em juízo
- Não se pode negativar com segurança (art. 46 da Lei SP 17.832: "o credor deverá apresentar documento que ateste a natureza da dívida, sua exigibilidade e a inadimplência")

→ **Consequência de design — e este é possivelmente o feature de maior valor do produto:** gerar, no momento da venda, um **comprovante digital de fiado** que o cliente **confirma** (assinatura no celular do lojista, ou aceite por link/WhatsApp), contendo: identificação do lojista (**art. 42-A**), descrição, valor originário, vencimento, e — se houver encargos — os cinco itens do **art. 52 do CDC**. Guardar hash + timestamp. Isso transforma "fiado" em obrigação documentada, com custo marginal zero.

### 3.6 Onde está a linha entre venda a prazo e concessão de crédito regulada

**Esta é a questão mais importante do relatório.** A resposta:

**A linha é a existência de intermediação financeira.**

| Modelo | Regulado pelo BCB? | Por quê |
|---|---|---|
| **Venda a prazo pelo próprio lojista, do próprio estoque, com recursos próprios** | ❌ **Não** | Não há mútuo, não há captação de recursos de terceiros, não há intermediação. É compra e venda com pagamento diferido. É a exata razão pela qual o STJ, no REsp 1.720.656, disse que a loja **não se equipara a instituição financeira**. |
| **Emprestar dinheiro ao cliente** (não vender mercadoria) | ⚠️ Zona de risco | Mútuo feneratício habitual. Pode configurar atividade privativa de instituição financeira. |
| **Captar recursos de terceiros para financiar as vendas** | ✅ **Sim, regulado** | Captação de poupança popular — atividade privativa (Lei 4.595/1964). |
| **Antecipar recebíveis do lojista com recursos próprios ou de investidores** | ✅ **Sim** | Depende da estrutura; exige FIDC, ESC, securitizadora ou instituição autorizada. |
| **SaaS que custodia dinheiro dos usuários** | ✅ **Sim** | Conta de pagamento / emissor de moeda eletrônica — Resolução BCB nº 80/2021. |

**A regra de ouro para este produto:**

> **O SaaS é uma ferramenta de REGISTRO e COMUNICAÇÃO. Quem concede o crédito é o lojista, com dinheiro dele, sobre mercadoria dele. O SaaS nunca é parte na relação de crédito e nunca toca no dinheiro.**

**Perigos de naming e posicionamento** (isto é design de produto, não semântica):

| ❌ Nunca dizer | ✅ Dizer |
|---|---|
| "Concedemos crédito" | "Você registra suas vendas a prazo" |
| "Aprovamos/negamos crédito" | "Você decide a quem vender fiado" |
| "Limite de crédito aprovado pela plataforma" | "Limite que **você** definiu para este cliente" |
| "Antecipamos seu fiado" | (não oferecer) |
| "Carteira de crédito" | "Caderneta digital" |

**Onde o produto atravessaria a linha (features a NÃO construir sem parecer jurídico):**
1. Antecipação/compra dos recebíveis do fiado
2. Garantia de pagamento ao lojista ("se o cliente não pagar, a gente paga")
3. Decisão automatizada de aprovação de crédito **pela plataforma** (além de virar concessão de crédito, dispara o **art. 20 da LGPD** — direito à revisão de decisão automatizada)
4. Custódia de saldo dos usuários

---

## 4. Pix e meios de pagamento

### 4.1 Base normativa

O Pix é um **arranjo de pagamento instituído pelo Banco Central**, disciplinado pelo **Regulamento anexo à Resolução BCB nº 1, de 12/08/2020**. Somente **instituições autorizadas a funcionar pelo BCB** podem ser participantes do Pix (PSPs). A adesão segue procedimentos de Instrução Normativa do BCB (mencionada nas fontes como **IN BCB nº 511**, *número não confirmado em consulta direta ao normativo — verificar*).

### 4.2 Pix Cobrança — QR Code dinâmico com vencimento (COBV)

A API Pix (a partir da v2.1) contempla o objeto **cobrança com vencimento (`cobv`)**, que permite embutir na própria cobrança:

- `calendario.dataDeVencimento` e `validadeAposVencimento`
- **`valor.multa`** (modalidade: valor fixo ou percentual)
- **`valor.juros`** (várias modalidades: ao dia/mês/ano, valor ou percentual)
- **`valor.abatimento`** e **`valor.desconto`** (inclusive desconto por antecipação, com múltiplas datas)
- `devedor` (nome + CPF/CNPJ)
- `infoAdicionais` (campos livres exibidos ao pagador)

Ou seja, **o QR Code de vencimento já resolve tecnicamente todo o cálculo de multa e juros** — o app envia as regras, e o PSP calcula o valor final no momento do pagamento. Isso é uma vantagem grande sobre calcular no próprio SaaS.

> ⚠️ **Mas cuidado:** o campo `devedor` do COBV pede CPF/CNPJ. Isso conflita com a estratégia de não coletar CPF (seção 1.5). **Consequência de design:** usar **COB simples (sem vencimento)** quando não houver CPF, e **COBV** apenas quando o lojista tiver optado por cobrar encargos e tiver o CPF. O produto precisa suportar os dois caminhos.

### 4.3 Pix Automático

**Sim, existe.** Cronologia confirmada:

- **Resolução BCB nº 402, de 22/07/2024** — altera o Regulamento anexo à Resolução BCB nº 1/2020 para **instituir as regras de funcionamento do Pix Automático** e ajustar dispositivos do Pix Agendado.
- **Entrada em produção: 16 de junho de 2025.**
- Oferta **obrigatória** para instituições que atendem usuários **pagadores**; **facultativa** para as que atendem **recebedores**.

**Regras operacionais** (FAQ oficial do BCB e materiais de PSPs):
- Autorização dada **uma única vez** pelo pagador no app do banco dele, com definição de **valor máximo por pagamento** e se permite uso de linha de crédito
- **Gratuito para o pagador pessoa física**; tarifa para a empresa recebedora é livremente negociada
- **Retentativas:** se falhar (ex.: saldo insuficiente), nova tentativa entre 18h e 21h no mesmo dia, e até **3 tentativas adicionais nos 7 dias seguintes** (total de 4)
- **Juros e multa por atraso** são definidos na relação entre pagador e recebedor e **podem ser cobrados no ciclo seguinte**. Se o valor com encargos exceder o valor máximo autorizado, o débito não é executado
- O recebedor deve enviar as instruções de pagamento entre **10 e 2 dias úteis** antes da liquidação
- **Requisitos do recebedor:** pessoa jurídica com **CNPJ ativo** e, conforme materiais de PSPs, empresa **ativa há mais de seis meses**
- O recebedor contrata **um único PSP recebedor**, e passa a debitar contas em qualquer banco

**Faz sentido para fiado?** **Parcialmente — e não no MVP.**

✅ Faz sentido para: cliente recorrente que fecha a conta todo dia 5, feirante com "conta do mês", cliente fiel de alto volume.

❌ Não faz sentido para: o caso dominante do fiado, que é **valor irregular, data irregular, cliente sem saldo em conta**. Pix Automático pressupõe conta bancária com saldo previsível — exatamente o que falta ao público-alvo do fiado.

❌ **Bloqueador prático:** o recebedor precisa ser **PJ com CNPJ ativo** (e possivelmente há 6+ meses). Uma parcela relevante de mercadinhos de bairro é MEI recente ou informal. Isso exclui parte do TAM.

→ **Decisão: roadmap, não MVP.** Pix Cobrança (QR dinâmico) resolve 95% dos casos com 5% da complexidade.

### 4.4 O SaaS precisa ser instituição de pagamento?

**Depende inteiramente de quem toca no dinheiro.**

**Resolução BCB nº 80, de 25/03/2021** disciplina a constituição e o funcionamento de instituições de pagamento e os parâmetros para o pedido de autorização ao BCB. Uma IP precisa de **autorização prévia** do BCB para iniciar atividades, incluindo a modalidade de **emissor de moeda eletrônica**. (Norma posteriormente alterada — a **Resolução BCB nº 494/2025** cria janela de regularização entre 1º e 31 de maio de 2026 para instituições que já operavam antes das datas de corte. *Detalhes de aplicabilidade não confirmados — verificar com advogado se houver qualquer plano de custódia.*)

**Resolução BCB nº 150, de 06/10/2021** consolida as normas sobre arranjos de pagamento e disciplina o **subcredenciador** (subadquirente/facilitador).

**As três arquiteturas possíveis:**

#### 🟢 Arquitetura A — Pix direto para a chave do lojista (RECOMENDADA)

```
Cliente devedor ──Pix──> Chave Pix do LOJISTA (banco dele)
                            │
                            │ webhook / conciliação
                            ▼
                        SaaS (só registra "pago")
```

O SaaS gera o payload do QR Code / copia-e-cola apontando para a **chave Pix do próprio lojista**. O dinheiro **nunca** entra em conta do SaaS.

**Regulatoriamente:** o SaaS **não** é instituição de pagamento, **não** é subcredenciador, **não** participa do arranjo Pix. Ele é um **software de gestão** que gera um payload padronizado (EMV/BR Code). Não há custódia, não há liquidação, não há saldo de terceiros.

✅ **Confirmado: esta é a arquitetura de menor exposição regulatória.**

**Trade-offs honestos:**
- ➖ **Conciliação é o problema.** Sem acesso ao extrato do lojista, o SaaS não sabe automaticamente que o Pix caiu. Soluções: (a) baixa manual pelo lojista (simples, funciona, é o que o MVP deve fazer); (b) Open Finance (complexo, exige instituição regulada); (c) o lojista abre conta no PSP parceiro e o SaaS lê via API (aí a conta é do lojista, não do SaaS — continua ok).
- ➖ Sem taxa de transação → o SaaS monetiza **só por assinatura**. Isso é uma escolha de modelo de negócio, não só de arquitetura.
- ➕ Zero risco de chargeback, zero risco de custódia, zero PCI, zero KYC do lojista pelo SaaS.

#### 🟡 Arquitetura B — PSP como intermediário com subconta do lojista

O SaaS integra um PSP autorizado (Asaas, Efí, Pagar.me, Mercado Pago, Stark Bank). O PSP abre **subconta em nome do lojista**, faz o KYC do lojista, e o dinheiro liquida na subconta **do lojista**. O SaaS pode usar **split** para reter sua comissão.

**Regulatoriamente:** a instituição autorizada é o **PSP**. O SaaS atua como plataforma/integrador. Como o titular da conta é o lojista, não há custódia pelo SaaS. É o modelo padrão de marketplace/SaaS no Brasil.

⚠️ **Ponto de atenção:** se o SaaS usar **conta escrow** ou reter valores dos lojistas, ou se o dinheiro passar por conta do SaaS antes de ir ao lojista, a análise muda e pode configurar atividade regulada. *Verificar com advogado a estrutura exata antes de ligar split ou escrow.*

#### 🔴 Arquitetura C — Dinheiro na conta do SaaS, repasse depois

❌ **Não fazer.** Isso é custódia de recursos de terceiros = instituição de pagamento = autorização do BCB (Resolução 80/2021), capital mínimo, governança, compliance, PLD/FT. Inviável para micro-SaaS.

### 4.5 Comparativo de PSPs

> ⚠️ **Preços de fontes secundárias e páginas comerciais, sujeitos a alteração e a negociação por volume. Confirmar diretamente com cada provedor antes de decidir.**

| PSP | Taxa Pix recebido | Mensalidade | Split | Aceita SaaS/plataforma | Sandbox / API |
|---|---|---|---|---|---|
| **Asaas** | ~**R$ 1,99** por transação recebida (~R$ 0,99 nos 3 primeiros meses) — **valor fixo, não percentual** | Sem mensalidade nos planos base | ✅ Sim, nativo; split gratuito, cobra só o recebimento | ✅ **Sim, explicitamente.** Documenta criação de **subcontas** ("conta filha") para SaaS, marketplaces e ERPs; tem **conta escrow** | ✅ Sandbox e docs públicas (`docs.asaas.com`) |
| **Efí (ex-Gerencianet)** | ~**1,19%** (todos os canais); ~30 Pix grátis/mês pelo app | — | ✅ Split disponível | ✅ Sim | ✅ Sandbox e API Pix documentada; é referência histórica em API Pix |
| **Mercado Pago** | **0%** para muitos vendedores no recebimento imediato; **~0,99%** em algumas condições — regras variam bastante | — | ✅ Sim (marketplace/split) | ✅ Sim | ✅ Sandbox e API maduros |
| **Pagar.me (Stone)** | ~**0,78%** | — | ✅ Split nativo, forte em marketplace | ✅ Sim | ✅ Docs públicas (`docs.pagar.me`) |
| **Stark Bank** | ~**R$ 0,50** por operação de QR Code dinâmico / emissão e liquidação; **~0,20% sobre TPV** para split | — | ✅ Sim | ✅ Sim (foco em empresas de tecnologia) | ✅ API-first, sandbox |

**Análise para este produto — o fator decisivo é o ticket médio.**

Fiado de mercadinho tem ticket **muito baixo** (R$ 20–R$ 150). Isso inverte a lógica normal:

| Ticket | Asaas (R$ 1,99 fixo) | Efí (1,19%) | Pagar.me (0,78%) |
|---|---|---|---|
| R$ 30 | R$ 1,99 = **6,6%** ❌ | R$ 0,36 = 1,19% | R$ 0,23 = 0,78% |
| R$ 100 | R$ 1,99 = **2,0%** | R$ 1,19 = 1,19% | R$ 0,78 = 0,78% |
| R$ 500 | R$ 1,99 = **0,4%** ✅ | R$ 5,95 = 1,19% | R$ 3,90 = 0,78% |

→ **Taxa fixa é péssima para ticket baixo.** Um Pix de R$ 30 no Asaas custa 6,6%. Isso mata a economia do produto.

**Isso é mais um argumento forte para a Arquitetura A** (Pix direto na chave do lojista, taxa zero para o SaaS *e* para o lojista na maioria dos bancos, já que Pix recebido por PF é gratuito e por PJ costuma ser barato ou negociável).

**Recomendação:** MVP com **Arquitetura A** (Pix direto, taxa zero). Manter **Asaas** ou **Pagar.me** mapeados como opção de Fase 2, para lojistas que quiserem conciliação automática e estiverem dispostos a pagar por ela — como *upgrade opcional*, nunca como caminho obrigatório.

---

## 5. WhatsApp

### 5.1 Modelo de preço vigente (confirmado em documentação oficial da Meta)

**Mudou de "por conversa" para "por mensagem" em 1º de julho de 2025.**

Regras confirmadas na documentação de desenvolvedores da Meta:

| Categoria | Cobrança |
|---|---|
| **Marketing** | Sempre cobrada, mesmo dentro da janela de atendimento |
| **Utility** | Cobrada **apenas fora** da janela de atendimento de 24h. **Grátis dentro dela.** |
| **Authentication** | Cobrada fora da janela |
| **Service** / mensagens não-template | **Grátis** dentro da janela de atendimento |

**Janela de atendimento (Customer Service Window — CSW):** abre quando **o usuário manda mensagem para a empresa** e dura **24 horas**. Dentro dela, todas as mensagens não-template são gratuitas, e templates de utility também.

**Free entry point (72h):** se o usuário inicia contato por anúncio *Click-to-WhatsApp* ou botão de CTA da Página, e a empresa responde em até 24h, abre-se uma janela de **72 horas** em que **qualquer tipo de mensagem** é gratuito.

**Volume tiers:** aplicam-se a **utility e authentication** (não a marketing). As mensagens são agregadas no nível do **portfólio de negócios**, somando todas as WABAs do portfólio, e o contador **zera todo mês**. Volumes maiores desbloqueiam taxas menores.

**Faturamento em BRL:** a partir de **1º de julho de 2026**, parceiros e clientes com *Sold-To country* = Brasil no Billing Hub podem criar novas WABAs em **Reais (BRL)**. As tabelas de preço (*rate cards*) são publicadas pela Meta em CSV/PDF.

### 5.2 Lembrete de dívida é utility ou marketing?

**Utility.** É notificação transacional sobre uma transação existente e específica com o cliente — não é promoção. Templates de "lembrete de vencimento", "confirmação de pagamento", "extrato da conta" são classicamente aprovados como *utility*.

⚠️ **Risco de reclassificação:** a Meta reclassifica templates automaticamente. Se o template incluir promoção ("aproveite e venha ver nossas ofertas"), ele vira **marketing** — que custa **~9x mais** no Brasil e é cobrado até dentro da janela de 24h.

→ **Consequência de design: manter os templates de cobrança rigorosamente transacionais.** Nenhuma frase promocional. Nunca misturar cobrança com oferta no mesmo template.

### 5.3 Custo no Brasil

> ⚠️ **Os valores em BRL não foram confirmados na tabela oficial da Meta** — a documentação aponta para rate cards em CSV/PDF que não foram acessíveis na consulta. Os números abaixo vêm de **fontes secundárias** (BSPs e agregadores) e devem ser confirmados no rate card oficial. **Não confirmado.**

| Categoria | Faixa reportada (Brasil) |
|---|---|
| **Utility** | ~**R$ 0,034 – R$ 0,05** por mensagem entregue (fora da janela) |
| **Authentication** | ~R$ 0,15 – R$ 0,19 |
| **Marketing** | ~**R$ 0,31 – R$ 0,38** |
| **Service** (dentro da janela 24h) | **R$ 0,00** |

**Modelagem de custo do produto (com utility a R$ 0,04):**

| Cenário | Lembretes/mês | Custo Meta/mês |
|---|---|---|
| Mercadinho pequeno: 40 clientes fiado, 2 lembretes cada | 80 | **R$ 3,20** |
| Médio: 150 clientes, 3 lembretes cada | 450 | **R$ 18,00** |
| Grande: 400 clientes, 3 lembretes cada | 1.200 | **R$ 48,00** |

**Achado decisivo de economia:** o custo real é **muito menor** que isso, porque **utility dentro da janela de 24h é grátis**. E cobrança gera resposta ("já pago amanhã", "quanto tá?"). Cada resposta abre 24h de mensagens gratuitas.

→ **Consequência de design:** o produto deve ser desenhado para **provocar resposta** (botões de resposta rápida no template: "Vou pagar hoje" / "Vou pagar dia X" / "Quero ver minha conta"). Isso simultaneamente (a) melhora a taxa de recuperação, (b) abre a janela gratuita, (c) reduz o custo marginal, e (d) evita a percepção de spam unilateral, o que protege a qualidade do número.

⚠️ **Custo do BSP em cima:** Twilio cobra ~US$ 0,005/mensagem **além** das taxas da Meta. 360dialog cobra ~€49/mês fixo **sem markup por mensagem**. Para volume baixo, o markup por mensagem é irrelevante; a taxa fixa é que dói. Para volume alto, inverte.

### 5.4 Opt-in — regra da Meta

Confirmado na documentação da Meta ("Get opt-in for WhatsApp"):

- É **obrigatório obter opt-in** antes de enviar mensagens iniciadas pela empresa
- A empresa pode contatar se: (a) a pessoa forneceu o número de telefone; **e** (b) a empresa recebeu permissão de opt-in confirmando que deseja receber mensagens daquela empresa
- O opt-in deve deixar claro que a pessoa **receberá mensagens** e **qual é o nome da empresa**
- **Atualização de novembro/2024:** o opt-in **não precisa mais** especificar que as mensagens virão pelo WhatsApp. Um opt-in genérico para receber mensagens da empresa, coletado em **qualquer canal**, satisfaz o requisito
- Opt-in pode ser coletado em site, anúncio, SMS, URA, caixa eletrônico ou **presencialmente** — mas **não** pode ser coletado dentro do próprio WhatsApp
- Violações levam a **rejeição de template, bloqueio de mensagens ou suspensão da conta**

→ **Consequência de design:** o momento de cadastro do cliente pelo lojista **é** o momento de opt-in. O app precisa de um checkbox explícito ("O cliente autorizou receber lembretes de [Nome da Loja] no WhatsApp"), com **registro de data, hora e usuário** — que serve simultaneamente para a Meta e como salvaguarda de transparência da LGPD (art. 10, §2º) e do art. 37.

### 5.5 Qualidade e bloqueio

A Meta monitora **quality rating** por número. Bloqueios/rebaixamentos vêm de: alto volume de bloqueios pelos usuários, denúncias, baixa taxa de leitura, envio sem opt-in, conteúdo que viola a política.

**Cobrança é intrinsecamente de alto risco de bloqueio** — as pessoas bloqueiam quem cobra. Um número que dispara cobrança em massa **vai** degradar.

→ **Mitigações de arquitetura:** rate limiting agressivo; parar o envio para quem não responde após N tentativas; opt-out fácil e respeitado; **um número por lojista** (não um número compartilhado do SaaS — se um lojista abusar, ele derruba o número de todos); monitorar o quality rating via webhook e pausar automaticamente ao cair para "Medium"/"Low".

### 5.6 Alternativas comparadas

| Opção | Custo | Automação | Risco | Veredito |
|---|---|---|---|---|
| **`wa.me` (Click to Chat)** | **R$ 0** | ❌ Nenhuma — abre o WhatsApp do lojista com a mensagem pronta; ele clica em enviar | **Zero.** É recurso oficial e documentado do WhatsApp | ✅ **MVP** |
| **Cloud API oficial (Meta)** | Por mensagem (ver 5.3) + BSP | ✅ Total | Baixo. Precisa de verificação do negócio, opt-in, templates aprovados | ✅ **Fase 2** |
| **BSP brasileiro** (Zenvia, Take Blip) | Meta + markup do BSP | ✅ Total | Baixo. Suporte e faturamento em BRL; possivelmente melhor posição para transferência internacional | ✅ Alternativa à Fase 2 |
| **API não-oficial** (Evolution API em modo QR, Z-API, Baileys, WPPConnect) | Barato/grátis | ✅ Total | 🔴 **ALTO** | ❌ **Não usar** |

**Riscos concretos da API não-oficial (confirmados em múltiplas fontes, incluindo documentação dos próprios fornecedores):**

- Funcionam por **engenharia reversa** do WhatsApp Web — **violam os Termos de Serviço da Meta**
- A Meta **intensificou a fiscalização** contra integrações não autorizadas, com **bloqueios permanentes sem aviso prévio**
- Consequências do banimento: perda de **todas** as conversas, o número **não pode mais ser usado** no WhatsApp, perda da reputação construída, e os clientes deixam de encontrar o negócio pelo contato que já conheciam
- **Instabilidade**: atualizações do WhatsApp Web quebram a integração até que os mantenedores lancem patch
- A própria documentação da Z-API reconhece o risco de banimento

> 🔴 **Este é o risco existencial do produto.** Se o SaaS usar API não-oficial e o número do lojista for banido, o lojista **perde o canal de contato com toda a clientela do bairro** — um ativo que ele levou anos para construir. Isso não é um bug: é destruição do negócio do cliente. Além do dano reputacional e do risco de responsabilização, é incompatível com vender para pequeno comércio.

### 5.7 Recomendação de arquitetura de mensageria

**Sim: começar com `wa.me` e evoluir.** Justificativa completa:

**Fase 1 — `wa.me` (MVP)**

O app monta `https://wa.me/55DDDNUMERO?text=<mensagem+urlencoded>`. O lojista toca, o WhatsApp dele abre com o texto pronto, ele confere e envia.

| Vantagem | Detalhe |
|---|---|
| **Custo R$ 0** | Nenhuma taxa Meta, nenhum BSP, nenhuma mensalidade |
| **Zero setup** | Sem verificação de negócio, sem WABA, sem aprovação de template, sem número dedicado. O lojista instala e usa **hoje** |
| **Risco regulatório zero** | Recurso oficial e documentado |
| **Risco de banimento zero** | É o WhatsApp normal do lojista |
| **Vantagem de LGPD** | **Nenhum dado pessoal do devedor sai para a API da Meta pelo SaaS.** Não há uso compartilhado nem transferência internacional promovida pelo produto. Isso elimina o problema inteiro da Resolução ANPD 19/2024 no MVP |
| **Vantagem de CDC** | O lojista **lê a mensagem antes de mandar**. Há um humano no loop, o que reduz drasticamente o risco de cobrança vexatória automatizada |
| **Melhor conversão** | Vem do número pessoal que o cliente já conhece e confia, não de um número corporativo desconhecido |

| Desvantagem | Mitigação |
|---|---|
| Não é automático — exige toque do lojista | Fazer uma **fila de cobrança do dia**: "5 clientes para cobrar hoje", com botões grandes em sequência. 5 toques ≠ trabalho. E o lojista *quer* revisar antes de cobrar o cliente que ele vê na rua |
| Não dá para agendar 3h da manhã | **Isso é uma vantagem disfarçada** — resolve o problema de janela de horário por construção |
| Sem confirmação de entrega/leitura | Aceitável no MVP |

**Fase 2 — Cloud API oficial, como upgrade pago**

Gatilho para migrar: lojistas com **mais de ~80–100 clientes fiado**, para quem a fila manual passa a ser trabalho real. Aí sim vale WABA, opt-in formalizado, templates aprovados e o custo por mensagem — que continua irrisório (R$ 3–R$ 50/mês).

**Economia da decisão:** com utility a ~R$ 0,04 e boa parte das mensagens caindo grátis dentro da janela de 24h, o custo de mensageria **nunca é o gargalo do negócio**. O gargalo é **complexidade de onboarding**: exigir que um dono de mercadinho passe por verificação de negócio da Meta antes de usar o produto é o que mata a ativação. `wa.me` remove essa fricção por completo, ao custo de um toque a mais por cobrança.

---

## 6. Nota fiscal e obrigações do lojista

### 6.1 Registrar fiado no app cria obrigação fiscal?

**Não. Registrar não é emitir.** O fato gerador do ICMS é a **circulação da mercadoria** (a venda), não o registro dela num software de gestão. Se o lojista já devia emitir NFC-e naquela venda, ele já devia antes de instalar o app.

**Porém, há um efeito colateral importante:** o app cria um **registro digital datado das vendas**, incluindo as que talvez não estivessem sendo documentadas. Isso é potencialmente uma prova. *Se o app se torna prova de venda não escriturada é questão fiscal — não confirmado; verificar com contador. Mas é assunto que o lojista vai levantar, e o produto precisa de resposta pronta.*

### 6.2 O app precisa emitir NF-e/NFC-e?

**Não, e não deve.**

A **NFC-e (modelo 65)** documenta operações internas destinadas a consumidor final não contribuinte do ICMS, presenciais ou com entrega em domicílio, e **pode ser utilizada inclusive nas vendas a prazo**. A obrigatoriedade e as regras são de **legislação estadual** (cada SEFAZ), e o contribuinte precisa de **credenciamento prévio na SEFAZ** e de **software emissor homologado**. O documento fiscal é o **XML**, que o emitente deve guardar sob sua responsabilidade pelo prazo da legislação tributária (**5 anos**).

→ **A responsabilidade fiscal é 100% do lojista.** Ele é o contribuinte, ele tem a inscrição estadual, ele tem o certificado digital, ele responde pela guarda do XML.

**Emitir NFC-e a partir do SaaS exigiria:** credenciamento por estado (27 legislações diferentes), certificado digital A1 de cada lojista, homologação, contingência (SVC/off-line), gestão de rejeições, cancelamento e inutilização de numeração, guarda de XML por 5 anos. **Isso é um produto inteiro, não uma feature.**

→ **Decisão de arquitetura: NÃO emitir nota fiscal.** Se for necessário, **integrar** com emissor existente (Focus NFe, TecnoSpeed, NFe.io, Bling, Tiny) via API, deixando a responsabilidade fiscal e o certificado com o lojista/parceiro.

⚠️ **Consequência de contrato:** os Termos de Uso devem deixar explícito que **o software não é emissor de documento fiscal** e que a obrigação tributária permanece integralmente com o lojista.

### 6.3 MEI — limites e impacto

- **Limite de faturamento 2026: R$ 81.000/ano** (~R$ 6.750/mês)
- **Nota fiscal:** o MEI é **obrigado** a emitir para venda a **pessoa jurídica**. Para **pessoa física** (consumidor final), a emissão é **facultativa em regra** — só é obrigatória se o cliente solicitar, ou se houver legislação estadual/municipal específica que exija
- ⚠️ **Mudança anunciada: a partir de 2027**, a emissão de nota em vendas para pessoa física deixaria de ser opcional, tornando-se obrigatória em qualquer operação. *Fonte secundária; regra e data não confirmadas em fonte oficial — verificar com contador.*
- A obrigação de emitir **não distingue venda à vista de venda a prazo**

**Impacto no produto:**

1. ✅ **O público-alvo é majoritariamente MEI ou ME.** Isso confirma a tese do produto: são negócios pequenos, sem ERP, sem sistema, com caderneta de papel. **Este é o mercado.**
2. ⚠️ **Sensibilidade a preço é extrema.** R$ 81.000/ano ÷ 12 = R$ 6.750/mês de faturamento **bruto**. Uma assinatura de R$ 100/mês é ~1,5% do faturamento bruto. **O preço tem que ser baixo** (faixa de R$ 20–R$ 50/mês para o plano de entrada é o realista).
3. ⚠️ **Feature de valor real: alerta de limite MEI.** Como o app já conhece as vendas registradas, ele pode avisar "você já faturou R$ 68.000 este ano — atenção ao limite do MEI". Isso é utilidade concreta e barata de construir.
4. ⚠️ **Se a mudança de 2027 se confirmar**, cresce muito a demanda por integração com emissor de NFC-e. Vale manter no radar de roadmap.
5. ✅ **Pix Automático exige CNPJ ativo** (seção 4.3) — MEI tem CNPJ, então é elegível, embora o requisito de "6 meses de atividade" possa excluir MEIs recentes.

---

## 7. Negativação e bureaus

### 7.1 Um pequeno comerciante pode negativar?

**Sim, juridicamente pode** — a inscrição em cadastro de inadimplentes é exercício regular de direito do credor. Mas os requisitos são pesados.

**CDC art. 43 — texto literal dos dispositivos relevantes:**

> "**§ 1°** Os cadastros e dados de consumidores devem ser objetivos, claros, verdadeiros e em linguagem de fácil compreensão, **não podendo conter informações negativas referentes a período superior a cinco anos**.
> **§ 2°** A **abertura de cadastro, ficha, registro e dados pessoais e de consumo deverá ser comunicada por escrito ao consumidor**, quando não solicitada por ele.
> **§ 3°** O consumidor, sempre que encontrar inexatidão nos seus dados e cadastros, poderá exigir sua imediata correção, devendo o arquivista, no prazo de **cinco dias úteis**, comunicar a alteração aos eventuais destinatários das informações incorretas.
> **§ 4°** Os bancos de dados e cadastros relativos a consumidores, os serviços de proteção ao crédito e congêneres são considerados **entidades de caráter público**.
> **§ 5°** **Consumada a prescrição** relativa à cobrança de débitos do consumidor, **não serão fornecidas**, pelos respectivos Sistemas de Proteção ao Crédito, quaisquer informações que possam impedir ou dificultar novo acesso ao crédito junto aos fornecedores."

**Súmula 359 do STJ:**
> "Cabe ao **órgão mantenedor** do Cadastro de Proteção ao Crédito **a notificação do devedor antes de proceder à inscrição**."

→ Ou seja, a notificação do §2º é obrigação do **bureau**, não do lojista. Isso é bom (menos responsabilidade direta) e ruim (o lojista/SaaS não controla se ela foi feita — e se não foi, quem responde é o bureau, mas o consumidor processa quem ele encontra primeiro).

**Súmula 385 do STJ:**
> "Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral quando preexistente legítima inscrição, ressalvado o direito ao cancelamento."

**Lei SP nº 17.832/2023** reforça e detalha (aplicável em SP):
- **Art. 44:** direito de ser informado **previamente, por escrito**, sobre a inscrição, por correspondência enviada **pelo órgão ou empresa mantenedora** para o endereço informado ao credor. **§3º:** serve como prova o comprovante de entrega de correspondência eletrônica, via internet ou **qualquer outro aplicativo de mensagem**
- **Art. 45:** a comunicação deve indicar **nome/razão social do credor, natureza da dívida e prazo para pagamento**, antes de efetivar a inscrição
- **Art. 46:** "Sempre que solicitado pelo consumidor ou pelo banco de dados, o credor deverá apresentar **documento que ateste a natureza da dívida, sua exigibilidade e a inadimplência** por parte do consumidor"
- **Art. 47:** as empresas devem manter **canal direto de comunicação**, indicado no aviso de inscrição, para defesa e contraprova do consumidor

**Prazos:**
- Máximo de permanência: **5 anos** (art. 43, §1º), contados a partir do **dia seguinte ao vencimento** da prestação não paga, independentemente da data da inscrição
- Ou **antes disso**, se consumada a prescrição da pretensão de cobrança (art. 43, §5º)
- Prevalece **o que ocorrer primeiro**

**Como fazer, na prática:**
- **SPC Brasil:** o lojista precisa ser **associado à CDL (Câmara de Dirigentes Lojistas)** da cidade e pagar taxa de uso
- **Serasa Experian:** cadastro/contrato direto com a Serasa Experian
- **Boa Vista SCPC:** contrato direto
- Dados exigidos: nome completo, **CPF**, endereço do devedor, valor, data da compra e do vencimento

**Custos:** *Não confirmado.* As fontes indicam que os valores de mensalidade CDL e de inclusão variam por cidade e por contrato, e não foram localizadas tabelas públicas. Para **consulta** (não inclusão), há preço público: relatório combinado CPF SPC + Serasa a **R$ 22,90**, com adicionais (Ação R$ 9,10; Participação Empresas R$ 5,49; Score Positivo R$ 7,00). *Confirmar diretamente com CDL local / Serasa Experian.*

### 7.2 Recomendação: **NÃO construir. É campo minado.**

**Razões, em ordem de peso:**

1. **Assimetria brutal de risco.** A dívida média é R$ 50–R$ 300. Uma condenação por negativação indevida costuma girar em milhares de reais, mais honorários. **Um erro apaga o lucro de anos de assinatura.**

2. **Exige tudo o que decidimos não coletar.** CPF **e endereço completo**, obrigatoriamente (seção 1.5). Construir negativação obriga a reverter a decisão de minimização de dados de todo o produto.

3. **Exige prova documental da dívida.** Art. 46 da Lei SP 17.832: o credor deve apresentar documento que ateste natureza, exigibilidade e inadimplência. Fiado registrado unilateralmente no app **não é isso** — a menos que haja aceite do cliente (seção 3.5). Um "eu anotei que ele deve" negativado é passivo puro.

4. **O lojista é quem responde — mas ele vai culpar o software.** Se o cliente processar, quem está no polo passivo é o lojista. Mas ele vai dizer "o sistema mandou". Custo de suporte, de reputação e de churn.

5. **Fricção de contratação é incompatível com o produto.** Associação à CDL, contrato com bureau, credenciamento — isso é o oposto do "instalou e usou". Mata a ativação.

6. **Conflito com o posicionamento.** O produto vende "cobre sem constranger, mantenha o cliente". Negativação é o contrário: rompe a relação com o cliente do bairro, que é o ativo do mercadinho. **É estrategicamente contraditório com a proposta de valor.**

7. **Prazos e regras estaduais divergentes** (a Lei SP 17.832 é só São Paulo; outros estados têm regras próprias) multiplicam a superfície de erro para um SaaS nacional.

**Alternativa que entrega 80% do valor com 5% do risco:**

Uma feature de **"Cobrança formal"**: o app gera uma **notificação extrajudicial de débito** em PDF, com identificação completa do credor (**CDC art. 42-A**), discriminação de valores (**Lei SP 17.832 art. 49**), prazo para pagamento e aviso de que o não pagamento poderá levar às medidas cabíveis. O lojista envia por WhatsApp ou entrega em mãos.

Isso: (a) aumenta muito a taxa de recuperação, porque **parece** e **é** oficial; (b) constitui em mora e documenta a cobrança; (c) **não** exige bureau, CDL, CPF obrigatório nem contrato; (d) não gera risco de negativação indevida; (e) é 100% construível em uma sprint.

Se, muito depois, houver demanda comprovada, o caminho é **parceria com um bureau** que assuma o processo, em vez de o SaaS construir a integração.

### 7.3 API de consulta de score de CPF

**Existe, mas é inadequada para este produto.**

| Provedor | Oferta | Preço |
|---|---|---|
| **Serasa Experian** | Portal de Integração / API de consultas; consulta de CPF/CNPJ | Pacote de consultas a partir de ~**R$ 15,99**; pacotes a partir de ~**R$ 269,99** com descontos progressivos. Via revendedores, ~**R$ 5,40** (consulta básica) a ~**R$ 24,00** (score completo com análise de risco) |
| **SPC Brasil** | Loja online + integração; requer associação à CDL para o produto de negativação | CPF SPC + Serasa combinado: **R$ 22,90** |
| **Boa Vista SCPC** | Bureau autorizado | *Não confirmado* |
| **Assertiva Soluções** | Assertiva API, Localize CPF, Crédito Mix, Análise 360, Recupere | **Preço não publicado.** *Não confirmado — contratar diretamente* |
| **Quod** | Bureau de cadastro positivo | *Não confirmado* |

**Requisitos de contratação (comum a todos):** CNPJ ativo, contrato comercial, e — crucialmente — **finalidade legítima declarada** e conformidade com LGPD e com a Lei do Cadastro Positivo (Lei 12.414/2011). Bureaus não vendem consulta avulsa para qualquer um; auditam o uso.

**Por que não faz sentido aqui:**

1. **Economia não fecha.** Uma consulta de R$ 5–R$ 24 para decidir sobre um fiado de R$ 50 é irracional.
2. **O lojista já tem informação melhor.** Ele conhece o cliente pessoalmente há anos. O score da Serasa **não sabe** que o Seu João sempre paga na sexta.
3. **Reposicionaria o produto como concessão de crédito** — exatamente a linha que a seção 3.6 diz para não cruzar.
4. **Dispararia o art. 20 da LGPD** (direito à revisão de decisão automatizada) se o resultado for usado para aprovar/negar.
5. **Exige CPF obrigatório**, revertendo a decisão de minimização.

> **Insight de produto:** o dado de crédito mais valioso para este SaaS **é o que ele mesmo gera** — o histórico de pagamento *daquele cliente naquela loja*. "Este cliente pagou 12 de 14 vezes em dia" é mais preditivo, mais barato, mais defensável juridicamente (base: execução de contrato) e mais útil que qualquer score externo. **E é grátis.**

---

## 8. DECISÕES DE ARQUITETURA IMPOSTAS PELA REGULAÇÃO

### 8.1 O software DEVE

**Dados e privacidade**
1. **DEVE** operar como **operador** e ter contrato de operador (DPA) nos Termos de Uso, com instruções documentadas do controlador (LGPD art. 39).
2. **DEVE** ter isolamento multi-tenant real — dados de um lojista nunca acessíveis a outro.
3. **DEVE** manter **audit log** de toda operação de tratamento: quem visualizou, editou, exportou e enviou cobrança, com timestamp (LGPD art. 37 — obrigatório quando o tratamento se baseia em legítimo interesse).
4. **DEVE** implementar **política de retenção com expurgo automatizado** e anonimização após o prazo (LGPD art. 16).
5. **DEVE** oferecer, em tela, **exportação e eliminação** dos dados de um cliente a pedido (LGPD art. 18).
6. **DEVE** exibir **canal público de privacidade** (mesmo com a dispensa de encarregado da Resolução CD/ANPD nº 2/2022).
7. **DEVE** manter **lista pública de subprocessadores** e mapa de transferências internacionais, com as CPCs da Resolução CD/ANPD nº 19/2024 onde aplicável.
8. **DEVE** ter runbook de incidente com comunicação à ANPD e aos titulares em **3 dias úteis** (Resolução CD/ANPD nº 15/2024).
9. **DEVE** entregar ao lojista modelos prontos de **aviso de privacidade** e de **LIA (teste de legítimo interesse)**.
10. **DEVE** criptografar em repouso e em trânsito, com MFA disponível (LGPD art. 46).

**Cobrança**
11. **DEVE** impor **janela de horário** para envio automatizado — default conservador seg–sex 9h–18h, sáb 9h–13h, feriados nacionais bloqueados (CDC art. 71; Lei SP 17.832/2023 art. 51).
12. **DEVE** impor **rate limiting**: máx. 1 lembrete automático por dívida por dia, com backoff crescente e parada após N tentativas sem resposta (CDC art. 71).
13. **DEVE** enviar **exclusivamente 1:1 para o telefone do próprio devedor**.
14. **DEVE** usar **templates fechados e revisados**, sem texto livre em envio automatizado (CDC art. 42).
15. **DEVE** discriminar na cobrança **valor originário, multa, juros e total**, item a item (Lei SP 17.832/2023 art. 49).
16. **DEVE** incluir em todo documento/mensagem de cobrança o **nome, endereço e CPF/CNPJ do lojista** (CDC art. 42-A).
17. **DEVE** ter estado **"dívida contestada"** que suspende automaticamente os lembretes (CDC art. 54-G).
18. **DEVE** registrar **opt-in explícito** com data, hora e usuário responsável (Política da Meta + LGPD art. 10, §2º).
19. **DEVE** ter **opt-out** funcional e respeitado pela automação.

**Financeiro**
20. **DEVE** validar **multa ≤ 2%** do valor da prestação, no domínio e não só na UI (CDC art. 52, §1º).
21. **DEVE** ter **teto de juros configurável com default conservador** e aviso ao lojista sobre o limite jurisprudencial (STJ REsp 1.720.656 — 12% a.a.).
22. **DEVE** exibir ao consumidor, antes do aceite de parcelamento com encargos, os cinco itens do **CDC art. 52** (preço, juros de mora e taxa efetiva anual, acréscimos, número e periodicidade das prestações, soma total com e sem financiamento).
23. **DEVE** gerar **comprovante digital de fiado com aceite do cliente** (constitui a prova da dívida e viabiliza a cobrança de encargos).
24. **DEVE** deixar o Pix cair **diretamente na chave do lojista** (evita enquadramento como instituição de pagamento — Resolução BCB nº 80/2021).

**Mensageria**
25. **DEVE** usar **API oficial** — `wa.me` (Click to Chat) no MVP, Cloud API/BSP na Fase 2.
26. **DEVE** usar **um número WhatsApp por lojista**, nunca número compartilhado da plataforma.
27. **DEVE** monitorar o **quality rating** e pausar automaticamente ao rebaixamento (na Fase 2).

### 8.2 O software NÃO DEVE

**Dados**
1. **NÃO DEVE** exigir **CPF** como campo obrigatório (LGPD art. 6º, III; Notas Técnicas ANPD 4/2022 e 6/2025).
2. **NÃO DEVE** coletar RG, foto de documento, comprovante de renda, local de trabalho, nome de familiares ou "contato de referência" — todos excessivos e vetores de cobrança vexatória.
3. **NÃO DEVE** registrar **itens individuais da compra** por padrão (risco de inferência de dado sensível — ANPD NT 4/2022). Se houver, deve ser opcional e com aviso.
4. **NÃO DEVE** cruzar bases de lojistas diferentes nem criar base agregada de devedores — isso transformaria o SaaS em bureau de fato, sujeito ao CDC art. 43 e à Lei 12.414/2011.
5. **NÃO DEVE** usar consentimento como base legal principal (é revogável e derruba o registro da dívida).
6. **NÃO DEVE** usar os dados dos devedores para finalidade própria do SaaS (marketing, venda de dados, treinamento de modelo comercializável) — viraria controlador.

**Cobrança**
7. **NÃO DEVE** permitir envio para **grupo de WhatsApp**, lista de transmissão, terceiros ou cópia. Jurisprudência consolidada de dano moral (CC art. 927; CDC arts. 42 e 71).
8. **NÃO DEVE** permitir texto livre em disparo automatizado.
9. **NÃO DEVE** usar linguagem que exponha ou ameace: "devedor", "caloteiro", "negativado", "vamos protestar", "medidas judiciais" (quando não haverá) — CDC art. 71 é **crime**.
10. **NÃO DEVE** gerar **lista de devedores** afixável, imprimível ou compartilhável publicamente.
11. **NÃO DEVE** enviar fora da janela de horário, mesmo que o lojista peça.
12. **NÃO DEVE** continuar cobrando dívida **contestada** (CDC art. 54-G).
13. **NÃO DEVE** misturar cobrança com promoção no mesmo template (reclassifica de utility para marketing e degrada o custo ~9x, além de descaracterizar a natureza transacional).

**Financeiro e regulatório**
14. **NÃO DEVE** **custodiar dinheiro** de lojistas ou de devedores (Resolução BCB nº 80/2021).
15. **NÃO DEVE** antecipar recebíveis, comprar dívida, nem garantir pagamento ao lojista.
16. **NÃO DEVE** apresentar-se como concedente de crédito, nem usar linguagem de "aprovação/negação de crédito pela plataforma".
17. **NÃO DEVE** tomar decisão automatizada de concessão de crédito (LGPD art. 20 + risco de enquadramento regulatório).
18. **NÃO DEVE** permitir multa acima de 2% nem juros acima do teto configurado.

**Mensageria e bureaus**
19. **NÃO DEVE** usar **API não-oficial de WhatsApp** (Evolution API em modo QR, Z-API, Baileys, WPPConnect) — viola os ToS da Meta e expõe o lojista a **banimento permanente do número**, destruindo o canal de contato dele com a clientela.
20. **NÃO DEVE** construir **negativação em bureau** no MVP nem no médio prazo (assimetria de risco, exigência de CPF+endereço+prova documental, fricção de contratação, contradição com o posicionamento).
21. **NÃO DEVE** consultar score externo de CPF (economia não fecha; reposiciona o produto como concessão de crédito).
22. **NÃO DEVE** emitir NF-e/NFC-e (responsabilidade fiscal é do lojista; integrar com emissor terceiro se necessário).

### 8.3 Arquitetura-alvo resumida

```
┌─────────────────────────────────────────────────────────┐
│  LOJISTA (CONTROLADOR)                                  │
│  • decide o cadastro, o crédito, a cobrança e a nota    │
└────────────────────┬────────────────────────────────────┘
                     │  instruções (DPA)
┌────────────────────▼────────────────────────────────────┐
│  SaaS FIADO (OPERADOR) — multi-tenant isolado           │
│                                                          │
│  Cadastro mínimo: apelido + telefone   [CPF opcional]   │
│  Lançamentos + saldo + comprovante com aceite           │
│  Guard-rails: janela horária · rate limit · 1:1 ·       │
│               templates fechados · estado "contestada"  │
│  Audit log (art. 37) · Retenção/expurgo (art. 16)       │
│  Export/delete do titular (art. 18)                     │
└──────┬──────────────────────────────┬───────────────────┘
       │                              │
       │ MVP: wa.me                   │ QR/copia-e-cola Pix
       │ (sem dado para API Meta)     │ apontando para a
       ▼                              ▼ CHAVE DO LOJISTA
  WhatsApp do lojista            Cliente paga → banco do
  (humano no loop)                lojista. Baixa manual.
       │                              
       │ FASE 2 (opcional, pago):     FASE 2 (opcional):
       ▼ Cloud API / BSP              ▼ PSP com subconta
  templates utility               do lojista + split
  opt-in registrado               (Asaas/Pagar.me)
  quality monitoring
```

**O dinheiro nunca entra no SaaS. O dado sensível nunca sai do SaaS. O humano fica no loop da cobrança.**

---

## 9. Riscos residuais e pontos a validar com advogado

| # | Ponto aberto | Por quê importa |
|---|---|---|
| 1 | **Teto de 12% a.a. do REsp 1.720.656 após a Lei 14.905/2024** — o art. 591 do CC, um dos fundamentos da decisão, foi alterado; a "taxa legal" virou Selic−IPCA. Não localizei decisão posterior do STJ | Define o limite de juros que o software pode permitir |
| 2 | **Fórmula de acumulação** juros legais (Selic−IPCA) + correção (IPCA) sem bis in idem | Define o cálculo automático de encargos |
| 3 | Se a **Lei SP 17.832 art. 51** (telefonemas) alcança mensagens de WhatsApp | Define se a janela é obrigação ou prudência |
| 4 | Se **Meta/BSP oferecem as CPCs** da Resolução ANPD 19/2024 | Define a viabilidade da Cloud API na Fase 2 |
| 5 | **Prazo de retenção** exato para dívida quitada | Define o job de expurgo |
| 6 | Se o registro no app pode ser usado como **prova de venda não escriturada** | Objeção comercial certa do lojista |
| 7 | Estrutura exata de **split/escrow** com PSP na Fase 2 | Define se há enquadramento regulatório |
| 8 | Aplicabilidade da **Resolução BCB nº 494/2025** (janela de regularização mai/2026) se houver qualquer custódia | Só relevante se a Arquitetura C for cogitada |
| 9 | **Números de processo** da jurisprudência sobre cobrança em grupo de WhatsApp (localizados via agregador, não em fonte primária) | Necessário antes de citar em material comercial |
| 10 | **Preços atuais** de Meta (rate card BRL), PSPs e bureaus | Todos de fontes secundárias; confirmar antes de modelar preço |

---

## Fontes

### Legislação federal (planalto.gov.br — texto literal consultado)
1. **Lei nº 13.709/2018 (LGPD)** — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — arts. 5º, 6º, 7º, 10, 11, 16, 18, 20, 33, 37, 38, 39, 41, 42, 46, 48
2. **Lei nº 8.078/1990 (CDC)** — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm — arts. 42, 42-A, 43, 52, 54-G, 71
3. **Lei nº 10.406/2002 (Código Civil)** — https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm — arts. 389, 395, 404, 406, 591, 927
4. **Lei nº 14.905/2024** (juros legais e atualização monetária; art. 3º afasta a Lei de Usura em hipóteses específicas) — https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14905.htm
5. **Lei nº 14.181/2021** (Superendividamento; inseriu os arts. 54-A a 54-G no CDC) — via texto compilado do CDC, fonte 2
6. **Decreto nº 22.626/1933** (Lei de Usura) — referenciado nas fontes 4 e 7

### Legislação estadual
7. **Lei SP nº 17.832, de 01/11/2023** (consolida a legislação consumerista paulista; arts. 44 a 52) — https://www.al.sp.gov.br/repositorio/legislacao/lei/2023/lei-17832-01.11.2023.html
8. **Lei SP nº 15.426/2014 — REVOGADA pela Lei 17.832/2023** — https://www.al.sp.gov.br/repositorio/legislacao/lei/2014/lei-15426-22.05.2014.html

### Jurisprudência
9. **STJ, REsp 1.720.656, 3ª Turma, j. 28/04/2020** — crediário de varejo limitado a 12% a.a.; lojas não se equiparam a instituição financeira — https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/Lojas-varejistas-nao-podem-cobrar-no-crediario-juros-acima-de-12--ao-ano.aspx
10. **Súmula 359 do STJ** — https://www.tjba.jus.br/portal/wp-content/uploads/2020/09/STJ-S%C3%BAmula-359.pdf
11. **Súmula 385 do STJ** — https://buscadordizerodireito.com.br/jurisprudencia/4153/sumula-359-stj
12. **TJDFT — Cobrança abusiva / proibição de constrangimento** — https://www.tjdft.jus.br/consultas/jurisprudencia/jurisprudencia-em-temas/cdc-na-visao-do-tjdft-1/praticas-abusivas/proibicao-de-constrangimentos-ou-exposicao-do-consumidor-ao-ridiculo
13. Jurisprudência sobre cobrança vexatória em WhatsApp/rede social (agregador; números não confirmados em fonte primária) — https://www.jusbrasil.com.br/jurisprudencia/busca?q=cobran%C3%A7a+de+d%C3%ADvida+em+grupo+de+whatsapp

### ANPD (gov.br/anpd)
14. **Resolução CD/ANPD nº 2, de 27/01/2022** — agentes de tratamento de pequeno porte; dispensa de encarregado — https://www.normaslegais.com.br/legislacao/resolucao-anpd-2-2022.htm
15. **Resolução CD/ANPD nº 15, de 24/04/2024** — Regulamento de Comunicação de Incidente de Segurança (3 dias úteis) — https://dspace.mj.gov.br/handle/1/12879
16. **Resolução CD/ANPD nº 19, de 23/08/2024** — Regulamento de Transferência Internacional de Dados e Cláusulas-Padrão Contratuais — https://www.editoraroncarati.com.br/v2/Diario-Oficial/Diario-Oficial/RESOLUCAO-CD-ANPD-N%C2%BA-019-DE-23-08-2024.html
17. **ANPD — nota técnica sobre tratamento de dados no setor farmacêutico** (NT 4/2022/CGTP) — https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-nota-tecnica-sobre-tratamento-de-dados-pessoais-no-setor-farmaceutico
18. **ANPD — conclusão de fiscalização de redes de farmácias** (NT 6/2025/FIS/CGF, fev/2025) — https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-conclui-processo-de-fiscalizacao-de-redes-de-farmacias-e-determina-ajustes-de-conduta-no-tratamento-de-dados-pessoais
19. **ANPD — Guia Orientativo: Legítimo Interesse** (fev/2024) — noticiado em https://gcaa.com.br/guia-orientativo-da-anpd-sobre-legitimo-interesse/

### Banco Central (bcb.gov.br)
20. **Resolução BCB nº 1, de 12/08/2020** — Regulamento do arranjo de pagamentos Pix
21. **Resolução BCB nº 402, de 22/07/2024** — institui as regras do Pix Automático (altera o Regulamento anexo à Resolução BCB nº 1/2020) — https://www.legisweb.com.br/legislacao/?id=462334
22. **BCB — FAQ Pix Automático (participantes)** — https://www.bcb.gov.br/content/estabilidadefinanceira/pix/pix-automatico-FAQ-participantes.pdf
23. **BCB — Guia de implementação do Pix Automático** — https://liftchallenge.bcb.gov.br/content/estabilidadefinanceira/pix/automatico/guia_pix_automatico.pdf
24. **Resolução BCB nº 80, de 25/03/2021** — constituição e funcionamento de instituições de pagamento — https://www.legisweb.com.br/legislacao/?id=411674
25. **Resolução BCB nº 150, de 06/10/2021** — arranjos de pagamento e subcredenciador — https://www.legisweb.com.br/legislacao/?id=421572
26. **Agência Gov — Pix Automático começa a valer em 16/06/2025** — https://agenciagov.ebc.com.br/noticias/202506/pix-automatico-chega-em-16-de-junho
27. **Senado — sanção da Lei 14.905/2024** — https://www12.senado.leg.br/noticias/materias/2024/07/01/lula-sanciona-lei-que-uniformiza-juros-para-contratos-sem-taxa-convencionada

### Meta / WhatsApp (developers.facebook.com)
28. **WhatsApp Business Platform — Pricing** — https://developers.facebook.com/docs/whatsapp/pricing/
29. **WhatsApp — Updates to Pricing** (modelo por mensagem desde 01/07/2025; utility grátis na CSW; free entry point 72h; BRL a partir de 01/07/2026) — https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing/
30. **WhatsApp — Get opt-in** — https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in

### Provedores (fontes comerciais — preços a confirmar)
31. **Asaas — preços e taxas** — https://www.asaas.com/precos-e-taxas
32. **Asaas — criação de subcontas** — https://docs.asaas.com/docs/criacao-de-subcontas
33. **Asaas — split de pagamentos** — https://docs.asaas.com/docs/split-de-pagamentos
34. **Asaas — conta escrow** — https://docs.asaas.com/docs/introducao-conta-escrow
35. **Efí — taxa do Pix para empresas** — https://sejaefi.com.br/blog/qual-custo-do-pix
36. **Mercado Pago — custo de receber via Pix e QR** — https://www.mercadopago.com.br/blog/quanto-custa-receber-pagamentos-via-pix-e-codigo-qr
37. **Pagar.me — Pix (API)** — https://docs.pagar.me/reference/pix-2
38. **Stark Bank — split de pagamento** — https://blog.starkbank.com/split-de-pagamento/
39. **OpenPix — cobrança Pix com vencimento, multa e juros** — https://openpix.com.br/articles/cob-pix-vencimento-multa-e-juros/
40. **SPC Brasil — consulta CPF SPC + Serasa** — https://loja.spcbrasil.com.br/consulta-cpf-spc-e-serasa
41. **Serasa Experian — consulta e portal de integração** — https://empresas.serasaexperian.com.br/consulta-serasa/ e https://www.serasaexperian.com.br/portal-integracao/
42. **Assertiva — API** — https://assertivasolucoes.com.br/servicos/api/

### Fiscal
43. **SEFAZ-BA — NFC-e, perguntas e respostas** — https://www.sefaz.ba.gov.br/docs/inspetoria-eletronica/icms/nfce_perguntas_respostas_.pdf
44. **SPED MG — NFC-e, obrigatoriedade** — https://portalsped.fazenda.mg.gov.br/spedmg/nfce/Obrigatoriedade/
45. **Serasa Experian — emissão de NF-e para MEI** — https://www.serasaexperian.com.br/conteudos/como-mei-faz-emissao-de-nota-fiscal/

### Análises jurídicas de apoio
46. **Machado Meyer — correção monetária, juros e usura após a Lei 14.905/24** — https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/bancario-seguros-e-financeiro-ij/correcao-monetaria-juros-e-usura-o-que-muda-com-a-lei-14-905-24
47. **ConJur — Lei 14.905/2024: limites à autonomia privada na pactuação dos juros de mora** — https://conjur.com.br/2024-set-05/lei-no-14-905-2024-limites-a-autonomia-privada-na-pactuacao-dos-juros-de-mora/
48. **Mattos Filho — Lei 17.832/2023 (normas consumeristas SP)** — https://www.mattosfilho.com.br/unico/normas-consumeristas-sao-paulo/
49. **Mayer Brown — fim do período de graça da Resolução ANPD 19/2024** — https://www.mayerbrown.com/pt/insights/publications/2025/08/end-of-grace-period-implementation-of-brazils-standard-contractual-clauses-in-international-transfers-of-personal-data
50. **Migalhas — crimes contra o consumidor: cobrança vexatória** — https://www.migalhas.com.br/depeso/378519/crimes-contra-o-consumidor--cobranca-vexatoria

---

**Reiteração final:** este documento é pesquisa técnica para orientar decisões de engenharia e produto. **Não é parecer jurídico.** Antes do lançamento comercial, os pontos da seção 9 devem ser validados por advogado com atuação em direito digital, consumidor e regulação financeira, e os Termos de Uso, DPA e política de privacidade devem ser redigidos por profissional habilitado.
