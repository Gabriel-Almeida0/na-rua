# Pesquisa de UX — Na Rua

> **Status:** pesquisa concluída · **Data:** 04/09/2026
> **Método:** 22 buscas distintas + leitura de fontes primárias + coleta direta de reviews da Google Play (6 apps: 3 BR, 2 Índia, 1 Indonésia).
>
> **Convenção de confiança:** `[E]` evidência verificada na fonte · `[E-2]` evidência de segunda mão · `[H]` hipótese a validar · `[NE]` não encontrado.

---

# Pesquisa de UX — App de Fiado Digital para Comércio de Bairro (Brasil)

**Data:** 04/09/2026 · **Método:** 22 buscas web distintas + leitura de fontes primárias + coleta direta de reviews da Google Play via endpoint público de reviews (3 apps BR + 3 apps de referência internacional).

**Convenção de confiança usada no relatório:**
- `[E]` **Evidência** — dado verificado na fonte citada.
- `[E-2]` **Evidência de segunda mão** — dado que aparece em fonte jornalística/blog citando um estudo que eu **não** consegui acessar na origem.
- `[H]` **Hipótese a validar** — inferência de design minha, não é achado de pesquisa. Cada `[H]` traz como validar.
- `[NE]` **Não encontrado** — busquei e não achei.

---

## 1. Pesquisa sobre o comportamento real

### 1.1 O tamanho e a natureza do problema

`[E]` A fonte primária mais sólida que encontrei é a pesquisa Sebrae 2018 com 1.000 MEIs, reproduzida integralmente no relatório do Banco Central *"Educação Financeira dos Microempreendedores Individuais"* (texto produzido pelo Sebrae com contribuições do Depef/BCB). Números diretos do documento:

| Indicador | Valor |
|---|---|
| MEIs que **vendem a prazo de maneira informal (o popular fiado)** | **42%** |
| Dos que vendem fiado, **já tiveram problema para receber** | **86%** |
| Registram **gastos em um caderno** | **50%** |
| Registram **receitas em um caderno** | **47%** |
| Registram gastos **em computador** | 21% |
| Registram receitas **em computador** | 17% |
| **Não fazem** registro de gastos / de receitas | 33% / 39% |
| **Nunca fizeram** curso ou treinamento de administração financeira | 77% |
| Às vezes ficam **sem saber como pagarão as contas** do negócio | 50% |
| Não acompanham o saldo de caixa ou o fazem 1x/mês | ~1/3 |

O documento ainda registra duas frases decisivas para o design:

> "Essa prática tende a ser mais frequente em **negócios mais simples, de menor porte e onde a proximidade ao consumidor final é maior**."

> "uma característica marcante desse segmento é a **maior concentração de pessoas mais velhas e com menor nível de escolaridade formal**."

Fonte: [1] — https://www.bcb.gov.br/Nor/relcidfin/docs/art9_educacao_finanaceira_MEIs.pdf

**Leitura de UX:** o concorrente número 1 não é outro app. É o **caderno**, usado por ~metade do público-alvo, e a **não-anotação**, praticada por ~1/3. O app precisa ganhar do caderno em velocidade, não em funcionalidade.

`[E-2]` Pesquisa Kantar Worldpanel citada pela imprensa: 14,1 milhões de famílias usaram a caderneta ao menos uma vez para comprar em mercadinhos, padarias e açougues; o uso é mais intenso nas classes D/E (38%) e C (28%) contra 27% da média nacional. **Não consegui acessar o relatório original da Kantar** — trate como indicativo, não como número auditado. Fonte: [2] — https://dcomercio.com.br/publicacao/s/a-velha-caderneta-do-fiado-esta-de-volta

`[NE]` Não encontrei nenhuma etnografia acadêmica brasileira, indexada em SciELO ou repositório universitário, dedicada especificamente ao **fiado em mercadinho**. O que existe são: (a) reportagens com material etnográfico bom, (b) teses sobre comércio de bairro em geral (ex.: *"Comércio de bairro e sua metamorfose diante da dinâmica urbana"*, UFPel — https://guaiaca.ufpel.edu.br/handle/prefix/4777), (c) um artigo internacional sobre dívida em periferias brasileiras (*Iberoamericana*, https://iberoamericana.se/en/articles/10.16993/iberoamericana.560) que **não consegui abrir** (timeout duplo) — não uso nada dele. **Isso é uma lacuna real: recomendo pesquisa de campo própria antes do detalhamento fino.**

### 1.2 Como o fiado funciona na prática (material etnográfico verificado)

`[E]` Reportagem do **Diário do Nordeste** com mercadinhos de Fortaleza:
- O registro é em **caderneta de papel**, e a caderneta hoje é quase decorativa em muitas lojas.
- O prazo tradicional era **mensal**; encurtou para **quinzenal** nos que ainda vendem fiado.
- A carteira de fiado é **minúscula e curada**: um comerciante atende ~8 clientes fiado; outro mantinha ~10 depois de "limpar" os maus pagadores.
- Motivo de abandono: prejuízo, inflação de alimentos, concorrência de supermercado e cartão.
- Um lojista de 58 anos: só vendem fiado para ~8 fregueses "**porque são conhecidos**".

Fonte: [3] — https://diariodonordeste.verdesmares.com.br/negocios/vender-fiado-esta-cada-vez-mais-raro-nos-mercadinhos-de-fortaleza-era-muito-prejuizo-1.3265741

`[E]` Reportagem do **Brasil de Fato** sobre fiado nas periferias:
- Critério de concessão é **proximidade e conhecimento pessoal**, não score. O comerciante Gladson Ferreira: *"Eu moro aqui muitos anos antes de montar o comércio. Conheço todos os vizinhos."*
- Ele mantém **um caderno brochura com ~15 nomes**.
- O ciclo de pagamento é **atrelado ao recebimento do salário/benefício no fim do mês** — o economista Aécio Oliveira: os clientes *"geralmente, não têm fluxo de renda no dia a dia, e quando recebem no fim do mês"*.
- **Não há juros**: o preço é o mesmo à vista e fiado. Justificativa do lojista: *"A rotatividade de mercadoria é alta"*.
- Um calote documentado: **~R$ 100**.
- O cliente entende a interdependência. Elvis Marlon: *"Eu sempre pago porque, se não, ele não vende, né?"*
- Os comerciantes **absorvem a perda em vez de cobrar formalmente**.

Fonte: [4] — https://www.brasildefato.com.br/2022/07/08/crise-economica-aumenta-venda-de-fiado-nas-periferias/

**Síntese operacional do fiado real:**

| Dimensão | Realidade observada | Consequência de design |
|---|---|---|
| Tamanho da carteira | 8 a 15 devedores ativos | Lista completa cabe numa tela. **Não precisa de busca complexa, nem de importação em massa.** |
| Ticket | dezenas de reais | Teclado numérico simples resolve; centavos importam pouco |
| Prazo | mensal → quinzenal, colado no dia de pagamento do cliente | Vencimento deveria ser **"dia 5", "dia 20", "quinzena"**, não um date picker de calendário |
| Juros | **zero** | Nunca falar em juros, multa, encargo, taxa |
| Concessão | conhecimento pessoal, vizinhança | Não pedir CPF, não pedir score, não pedir endereço obrigatório |
| Cobrança | evitada, perda absorvida | **Cobrança automática é o maior risco do produto** (ver 1.3) |
| Registro | caderno brochura, à mão, na hora | O app tem que ser mais rápido que uma caneta |

### 1.3 O ritual social: por que o lojista não quer parecer que está cobrando

Este é o ponto que mais restringe o design. Três camadas de evidência:

**(a) Camada relacional** `[E]` — o fiado *é* o mecanismo de fidelização. As reportagens mostram que quem vende fiado o faz para quem conhece e por quem tem apreço, e que o comerciante prefere engolir o prejuízo (~R$ 100) a romper a relação. Fonte: [4].

**(b) Camada de negócio** `[E-2]` — a literatura de mercado brasileira descreve o comportamento com precisão: o lojista **adia a cobrança por medo de parecer chato ou de perder a venda seguinte**, e o cliente **se afasta da loja por vergonha** quando está devendo. E: uma cobrança agressiva "recupera o valor de hoje ao custo do cliente de amanhã"; uma cobrança frouxa "ensina ao cliente que o atraso não tem consequência". Fontes: [5] https://blog.recargapay.com.br/chega-de-calote-como-cobrar-clientes-sem-perder-a-amizade/ · [6] https://blog.nubank.com.br/vender-fiado/ (conteúdo de blog de empresa — direcional, não é pesquisa)

**(c) Camada legal** `[E]` — o **art. 42 do CDC** (Lei 8.078/90): *"Na cobrança de débitos, o consumidor inadimplente **não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça**."* O TJDFT lista como cobrança abusiva: ligações excessivas e reiteradas, cobrança em horário inadequado, **exposição da dívida a terceiros**, linguagem intimidatória. Fontes: [7] https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm · [8] https://www.tjdft.jus.br/institucional/imprensa/campanhas-e-produtos/direito-facil/edicao-semanal/cobranca-abusiva

**Restrições de design que decorrem disso (não negociáveis):**

1. **Nunca enviar mensagem de cobrança sozinho.** Nenhum disparo automático. O app **prepara**, o lojista **lê**, edita se quiser, e **manda com o dedo dele**. O remetente sempre é a pessoa, nunca o sistema.
2. **Nunca expor a dívida a terceiros.** Sem grupo, sem lista de transmissão, sem "mural de devedores", sem compartilhar print com nome de terceiro.
3. **Nunca usar linguagem de cobrança bancária.** "Inadimplente", "em atraso há X dias", "protesto", "negativação" — fora.
4. **O default do tom é o lembrete, não a cobrança.** A própria BukuWarung descreve esse mecanismo como principal valor: a mensagem automática é uma *"soft message"* que "ajuda o comerciante a não se sentir envergonhado, ao mesmo tempo em que lembra o cliente profissionalmente". Fonte: [9] https://acv.vc/insights/acv-portfolio-news/meet-bukuwarung-the-bookkeeping-app-built-for-indonesias-60-million-micromerchants/
5. **Escalonamento deve ser sugerido, nunca imposto.** A prática brasileira documentada em conteúdo de mercado sugere: lembrete no D+1, reforço em ~15 dias, e só depois medidas duras — mas o app deve parar no lembrete gentil e deixar o resto fora do produto. Fonte: [10] https://www.cora.com.br/blog/como-cobrar-por-whatsapp/ `[E-2]`

### 1.4 Os atores

| Ator | Papel | O que o design precisa dar a ele | Confiança |
|---|---|---|---|
| **Dono(a)** | Concede o fiado, decide o limite pelo conhecimento pessoal, absorve a perda, cobra (ou não) | Visão do "quanto tem na rua", controle da cobrança, sensação de segurança do dado | `[E]` fontes [1][3][4] |
| **Balconista / funcionário** | Lança a venda no balcão com o cliente esperando | Fluxo de 3–4 toques, sem login toda vez, **sem poder apagar histórico nem ver o total do caixa** | `[H]` — o papel existe na prática do balcão, mas não achei fonte que descreva a divisão de permissões. **Validar em campo.** |
| **Cliente devedor** | Compra, paga no dia do salário, se afasta por vergonha quando deve | Ver o próprio saldo **sem instalar nada** e sem ser exposto | `[E]` para o comportamento (fonte [4] e [5]); `[H]` para a solução |
| **Familiares do dono** (cônjuge, filho/a) | Frequentemente é quem "entende de celular" e instala/configura o app | Onboarding que possa ser feito por outra pessoa e depois "entregue" ao dono; nada que dependa de e-mail pessoal do filho | `[H]` — padrão conhecido de mediação tecnológica em NBU, mas **não encontrei fonte brasileira específica**. Validar. |

---

## 2. Princípios de design para este público

### 2.1 O que a pesquisa publicada diz

**Google Next Billion Users** `[E]` — nove princípios do framework, direto do Google Design:

1. **Conectividade não confiável** → projetar para funcionar offline ou com conexão intermitente ("offline first").
2. **Aparelhos de baixo custo** → maioria dos smartphones de mercados emergentes custa US$40–60, com ~512MB de memória e tela pequena. Otimizar para hardware velho (o Google Translate ocupa ~5MB).
3. **Dados caros** → orçamento típico de ~250MB/mês pré-pago; gente desliga o celular à noite para não gastar sem querer.
4. **Infraestrutura de pagamento limitada** → só 2% dos indianos têm cartão de crédito; desenhar para dinheiro e transferência.
5. **Contexto cultural importa** → linguagem que constrói confiança ("seu número está seguro com a gente") resolve medos reais.
6. **Multilíngue e baixa alfabetização** → **minimizar entrada de texto**; usar ícones, affordances visuais.
7. **Infraestrutura social** → confiança vem do boca a boca e da comunidade.
8. **Densidade visual em vez de minimalismo** → **usuários rejeitaram muito espaço em branco e cores apagadas**; interfaces densas e vibrantes ressoaram melhor.
9. **Encanto importa** mesmo em app utilitário.
10. Ação crítica: **fazer pesquisa de campo no local** — as suposições costumam não bater com o uso real.

Fonte: [11] — https://design.google/library/connectivity-culture-and-credit

> ⚠️ O princípio 8 contradiz o instinto de designer ocidental. **Não faça uma tela branca minimalista com muito respiro.** Faça uma tela densa, colorida, com números grandes e blocos sólidos.

**Nielsen Norman Group — usuários de baixo letramento** `[E]`:
- Eles **"aram" o texto** linha por linha em vez de escanear; leem palavra por palavra, gastando tempo em palavras polissilábicas.
- Têm **campo de visão estreito** e perdem elementos fora do fluxo principal.
- **Não escaneiam**: ou leem cada opção de navegação com atenção, ou pulam tudo.
- **Satisficing**: escolhem a primeira opção que aparece, independentemente de relevância.
- Recomendações: **coluna única**; **minimizar rolagem** (perdem o lugar visual); evitar texto em movimento; navegação linear e simplificada; busca tolerante a erro de digitação.
- Efeito medido num redesenho: taxa de sucesso de usuários de baixo letramento **46% → 82%**; e **usuários de alto letramento também melhoraram** com o mesmo redesenho.

Fonte: [12] — https://www.nngroup.com/articles/writing-for-lower-literacy-users/

**Literatura HCI — framework SARAL** `[E-2]` (li o abstract; o PDF integral está atrás de paywall — HTTP 403). Revisão de duas décadas de literatura HCI com pessoas de baixa alfabetização identifica **quatro construtos essenciais**: (1) **navegação simplificada**, (2) **entrada e saída multimodal**, (3) **recuperação de erro**, (4) **relevância cultural**. Fonte: [13] — https://dl.acm.org/doi/10.1145/3449210 · Revisão complementar: [14] https://dl.acm.org/doi/10.1145/3578837.3578842 · Survey: [15] https://dl.acm.org/doi/abs/10.1561/1100000047

**NN/g — prevenção e recuperação de erro** `[E]`:
- Usar diálogo de confirmação **apenas** antes de ações com consequência séria, especialmente **irreversíveis**.
- **Não usar confirmação em ações rotineiras** — "se você gritar 'lobo' vezes demais, as pessoas param de prestar atenção".
- Ser específico: nunca "Tem certeza?"; explicar o que é "isso" em termos do usuário.
- **Desfazer** deixa o usuário mais seguro para experimentar, porque o erro fica barato.

Fontes: [16] https://www.nngroup.com/articles/confirmation-dialog/ · [17] https://www.nngroup.com/articles/user-mistakes/

### 2.2 Princípios acionáveis para ESTE app

| # | Princípio | Regra concreta | Base |
|---|---|---|---|
| P1 | **Uma tarefa por tela, coluna única** | Nunca duas colunas. Nunca abas dentro de uma tela de tarefa. | [12] |
| P2 | **Densidade > respiro** | Blocos coloridos sólidos, cartões cheios. Não imitar app de banco premium branco. | [11] |
| P3 | **O número é o herói** | Saldo do cliente em ≥ 40sp, peso bold, na primeira dobra. Texto explicativo abaixo, menor. | [12] (campo de visão estreito) + [11] |
| P4 | **Ícone sempre acompanhado de rótulo** | Nunca ícone sozinho. O público não compartilha nosso vocabulário de ícones. | [11] princípio 6, [13] |
| P5 | **Zero digitação de texto sempre que possível** | Valor = teclado numérico. Cliente = lista. Data = chips ("hoje", "ontem"). Nome só no cadastro. | [11] princípio 6 |
| P6 | **Cor com significado fixo e redundante** | Verde = pago/quitado; vermelho = vencido; cinza = em dia. **Sempre com ícone e palavra junto** — nunca cor sozinha. | [18] web.dev: usar texto, ícone e cor juntos, porque só cor exclui quem tem baixa visão |
| P7 | **Nada é irreversível sem desfazer** | Lançou errado → "Desfazer" por 8s em barra inferior. Confirmação modal só para **apagar cliente com saldo**. | [16][17] |
| P8 | **Sem rolagem na tarefa principal** | Lançar venda cabe numa tela sem scroll em 5". | [12] |
| P9 | **Feedback de confirmação físico e óbvio** | Após salvar: som curto opcional + vibração + tela verde com o saldo novo em letra enorme. O lojista precisa **ver de longe** que gravou. | `[H]` — derivado de [12]+[11], **validar em teste de balcão** |
| P10 | **Sem jargão financeiro** | Ver seção 6. | [11] princípio 6, [12] |

### 2.3 Acessibilidade prática

| Item | Requisito | Fonte |
|---|---|---|
| **Alvo de toque** | **Mínimo 48×48 dp** (Material Design / Android Accessibility) — ≈9 mm físicos, dentro da faixa recomendada de 7–10 mm. Isso já satisfaz WCAG 2.5.8 AA (24×24 CSS px) e 2.5.5 AAA (44×44). Para os botões primários deste app (**Anotar fiado**, **Recebi**) recomendo **56–64 dp de altura**. | `[E]` [19] https://support.google.com/accessibility/android/answer/7101858 · [20] https://m1.material.io/usability/accessibility.html · [21] https://www.wcag.com/developers/2-5-8-target-size-minimum-level-aa/ |
| **Contraste de texto** | WCAG 1.4.3 AA: **4,5:1** para texto normal; **3:1** para texto grande (≥18pt, ou 14pt bold). Para uso ao sol, mirar **7:1 (AAA)** nos números e status. | `[E]` [22] https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| **Sol na tela** | Sob sol forte, um LCD comum de 200 nits que tem 300:1 no escuro cai para **menos de 2:1**. Ou seja: **o contraste que você projeta no Figma praticamente desaparece na calçada.** Implicações: preto sobre branco (não cinza sobre branco), pesos bold, evitar cinza #999, evitar texto sobre foto, evitar tema escuro como padrão. | `[E]` [23] https://www.gsmarena.com/gsmarena_lab_tests-review-751p2.php |
| **Uma mão** | Ações primárias na **metade inferior** da tela; FAB e barra de ação embaixo; nada crítico no topo. | `[E]` para o requisito de tamanho ([19][20]); `[H]` para a alocação vertical — os dados de "thumb zone" que circulam (ex.: 49% usam uma mão; caso Spotify 34%→3% de mis-tap) vêm de posts de blog **sem estudo primário rastreável**. Não use esses números; use o padrão de plataforma. |
| **Aparelho fraco/lento** | APK enxuto, sem animação pesada, sem splash longo, lista virtualizada, primeira tela útil em <2s em Android Go. Referência: Facebook Lite ~2MB; Google Translate ~5MB. | `[E]` [11] |
| **Tela pequena** | Testar em 5" / 720p, densidade hdpi, **e com a barra de navegação por botões ligada** (ver o bug real da BukuWarung na seção 4). | `[E]` reviews BukuWarung [24] |
| **Fonte grande do sistema** | Layout precisa sobreviver a fonte 130–200% (público 35–60 anos frequentemente aumenta a fonte). | `[H]` — decorrente do perfil etário em [1]. Validar. |

---

## 3. Offline-first e conectividade

### 3.1 Evidência sobre conectividade no público-alvo

`[E]` **TIC Domicílios 2024 / Cetic.br-NIC.br**:
- Internet disponível em **100% dos lares da classe A**, mas em **68% dos lares das classes D e E**.
- **72% dos usuários de internet da classe DE acessam exclusivamente pelo celular.**
- Planos **pré-pagos, mais limitados em pacote de dados**, chegam a **69% na classe DE**.
- Na classe DE, 37% usam só Wi-Fi, 6% só rede móvel, 57% ambos.

Fontes: [25] https://cetic.br/media/analises/tic_domicilios_2024_principais_resultados.pdf · [26] https://www.cetic.br/media/docs/publicacoes/2/20250512115624/tic_domicilios_2024_resumo_executivo.pdf · [27] https://nic.br/noticia/na-midia/acesso-a-internet-em-residencias-de-areas-urbanas-brasileiras-salta-de-13-para-85-em-20-anos-aponta-pesquisa-tic-domicilios-2024/

`[NE]` **Não encontrei** nenhum estudo que meça qualidade/estabilidade de conexão **dentro de mercadinhos brasileiros** especificamente (fundos de loja, câmara fria, banca de feira, sinal atrás da prateleira metálica). Isso é uma lacuna e é exatamente onde o app vai quebrar. **Hipótese a validar em campo:** o pior sinal da loja está justamente no balcão/estoque.

`[E]` Contexto de canal: **82% dos MEIs e MPEs apontam o WhatsApp como principal canal de comunicação e vendas** (12ª Pesquisa Pulso dos Pequenos Negócios, Sebrae, 8,2 mil empreendedores, fev–mar/2026). Instagram 57%, Facebook 30%. Fonte: [28] https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/

`[E-2]` Pagamento: **96% dos pequenos negócios aceitam Pix** e ~60% têm o Pix como principal meio de recebimento (Sebrae/Ipespe). Fonte: [29] https://www.otempo.com.br/economia/2026/6/4/60-das-pequenas-empresas-no-brasil-tem-o-pix-como-principal-meio-de-pagamento-diz-sebrae

**Consequência:** o app precisa ser **offline-first de verdade** (não "cache"), o canal de saída é **WhatsApp**, e a chave Pix do lojista é um campo de altíssimo valor no lembrete.

### 3.2 Padrões de UX offline (evidência)

`[E]` **web.dev — Offline UX design guidelines**:
- **Diga ao usuário o estado E o que ele ainda pode fazer** diante de falha de rede.
- Use **linguagem de ação**, não jargão: em vez de dizer "offline", diga o que dá para fazer.
- Comunique por **múltiplos canais juntos** — texto + ícone + cor — porque só cor exclui usuários com deficiência visual.
- **Não bloqueie a interface.** Nada de modal de loading travando o uso: *"deixe o usuário continuar navegando e enfileire as tarefas que serão executadas e sincronizadas quando a conexão melhorar."*
- Feedback de sync por **toast curto no rodapé** ou carimbo de "atualizado às HH:MM".

Fonte: [18] — https://web.dev/articles/offline-ux-design-guidelines

`[E]` **Google — Design guidelines for offline & sync**: a barra de status de sincronização **só deve aparecer quando for relevante** — nas telas/componentes que vão mudar quando o sync terminar. Fonte: [30] https://developers.google.com/open-health-stack/design/offline-sync-guideline

`[E]` **BukuWarung** foi construída assim por decisão explícita: como muitos comerciantes usavam **planos pré-pagos e smartphones de baixo custo**, o app precisava ser **o mais leve possível e funcionar offline** para o usuário acessar e atualizar registros a qualquer momento. Fonte: [31] https://cloud.google.com/customers/bukuwarung

### 3.3 Como comunicar sincronização sem assustar — regras propostas

`[H]` (fundamentadas em [18] e [30]; validar com teste)

| Estado | O que mostrar | O que NÃO mostrar |
|---|---|---|
| Offline, tudo gravado local | **Nada de alarmante.** Uma pílula discreta no topo: `Sem internet — está tudo anotado aqui` | ❌ Ícone vermelho de erro. ❌ "Falha ao conectar". ❌ Modal. |
| Salvando enquanto offline | Confirmação **igual** à do modo online: tela verde, saldo novo, "Anotado!" | ❌ Spinner. ❌ "Pendente". ❌ Item cinza/apagado na lista. |
| Voltou a rede, subindo | Toast de 2s no rodapé: `Tudo salvo na nuvem ✓` | ❌ Barra de progresso persistente. |
| Nunca sincronizou em >48h | Faixa amarela informativa: `Faz 2 dias que não conecta. Suas anotações estão salvas no celular. Quando pegar internet, mando pra nuvem.` | ❌ "Risco de perda de dados". |
| Conflito (dois aparelhos) | Nunca perguntar ao lojista qual versão vale. **Sempre somar lançamentos** (modelo de eventos/ledger append-only, não de "estado do saldo"). Se houver ambiguidade, mostrar como dois lançamentos e deixar ele apagar um. | ❌ Diálogo "Resolver conflito". |

**Regra de ouro:** o item lançado offline **nunca** aparece visualmente diferente do item online. Deixar item "pendente" acinzentado ensina o lojista a **desconfiar do app** — e desconfiança nesse produto significa manter o caderno em paralelo, que é a morte da adoção.

---

## 4. Benchmark de UX dos concorrentes

**Método:** coletei os reviews mais recentes diretamente da Google Play (endpoint público de reviews, ordenados por mais novos), em pt-BR/BR para os apps brasileiros e em en/IN e en/ID para os de referência. Volume analisado: ~120 reviews por app onde disponível. Todas as citações abaixo são **verbatim**.

### 4.1 Brasil — "Controle de vendas: Meu fiado" (com.masterapps.controledevendas)

Fonte: [32] https://play.google.com/store/apps/details?id=com.masterapps.controledevendas

**Reclamação nº1 — PERDA DE DADOS. É catastrófica e recorrente:**
> ⭐1 *"Registrei minhas vendas de setembro, fui abrir hoje o App, infelizmente perdi todo meu controle de vendas os registros simplesmente sumiram do nada. Minha sorte que registro no caderno, por que se fosse depender só do app, estaria numa situação complicada."*

> ⭐1 *"Teve uma atualização agora no fim d outubro que apagou todas as pessoas q me devia. Tomei um prejuiso bem alto por confiar no app..."*

> ⭐1 *"Sumiram todas as vendas após a atualização, muito chocada com isso."*

> ⭐1 *"Por favor o q aconteceu com app? Minhas vendas todas sumiram to apavorada"*

> ⭐1 *"Péssimo, atualizou pra uma versão paga e apagou a maioria das minhas vendas que eu por confiar no app não tinha anotado em nenhum outro lugar"*

**Reclamação nº2 — anúncio no meio do fluxo de trabalho:**
> ⭐1 *"Propaganda demais nem cheguei a cadastra um cliente. Abriu. 4 propagandas"*
> ⭐1 *"Propaganda a cada lançamento, valores não somam após virada de mês, baixa do cliente precisa ser uma a uma."*

**Reclamação nº3 — não consegue achar o cliente (falta busca):**
> ⭐4 *"Tô sentindo falta da opção de pesquisar um cliente. Minha lista de clientes tá grande, quero achar alguém tenho sair procurando na lista."*
> ⭐4 *"não consigo pelo nome, não sei é erro"*
> ⭐4 *"deveria ter a opção organizar os clientes por ordem alfabética"*

**Reclamação nº4 — não dá para lançar com data retroativa (mata o caso de uso real!):**
> ⭐3 *"ontem fiz uma venda fiado e com a correria não anotei, hoje foi fazer a anotação lá e já não consigo colocar mais a data da venda que foi ontem"*
> ⭐1 *"Deveria aceitar notas antigas de outras datas e anos"*

**Reclamação nº5 — não tem visão consolidada de quem deve:**
> ⭐1 *"tem que acessar manualmente cada cliente para saber quanto cada um deve, ao invés de ter um [resumo]"*
> ⭐4 *"nas vendas pendentes, tinha que ter a opção de aparecer 'todos os meses', assim teria uma visão geral de quem está pendente ao invés de ir clicando em cada mês"*

**Reclamação nº6 — paywall antes de provar valor:**
> ⭐1 *"Deveria liberar pra testar todos os recursos por pelo menos uma semana... Desinstalei assim que fui testar e vi campos bloqueados..."*
> ⭐1 *"Paguei r$ 19,90 para nada"*

**Reclamação nº7 — trava/fecha ao salvar, e perda de acesso:**
> ⭐1 *"Não está salvando as vendas, o app fecha ao tentar salvar, está com bug acabei de comprar e agora me arrependi"*
> ⭐1 *"App fechou do nada e não aceita mais minha digital nem minha senha. Enviei email pedindo ajuda e não obtive resposta."*

**Reclamação nº8 — prompt de avaliação intrusivo:**
> ⭐1 *"Estou usando ainda e ruim mesmo avaliando toda hora aparecer msm"*

**Elogios (padrão claro):** as palavras que se repetem são **simples, prático, rápido, intuitivo, fácil de mecher**.
> ⭐5 *"Muito bom. Simples mas muito eficiente."* · ⭐5 *"App muito bom, fácil, intuitivo, rápido..."* · ⭐5 *"Gostei do APP bem simples de mecher e muito útil!!"*

Note o vocabulário: **"fácil de mecher"** aparece em mais de um app. É a expressão nativa de usabilidade deste público.

### 4.2 Brasil — "Fiado - Controle de Vendas" (br.com.mobiletkbrazil.fiado)

Fonte: [33] https://play.google.com/store/apps/details?id=br.com.mobiletkbrazil.fiado

**Perda de acesso à própria conta:**
> ⭐1 *"hoje fui entrar e não mostrou minha lista que deixei salvo... ao inserir e-mail e senha, dava inválido... cliquei em 'esqueci minha senha', e apareceu e-mail inválido."*

> ⭐1 *"usei durante uma semana e me arrependi, coloquei vários cliente a minha sorte q marquei em papel, pq se não já era td ia perde todos os clientes"*

**Sem total geral (a pergunta nº1 do lojista fica sem resposta):**
> ⭐3 *"Seria perfeito se o app somasse todos os devedores."*
> ⭐5 *"É bom mas, não há como saber a soma geral"*

**Sinal de +/− ambíguo — erro de polaridade, gravíssimo num app de dívida:**
> ⭐3 *"Achei um pouco confuso que quando é pra adicionar debitos tem o +, mas se entra no nome do cliente lá o + quer dizer valor pago... Me confundi e acabei colocando valor positivo quando era negativo"*

**Não dá para editar nem apagar lançamento errado:**
> ⭐3 *"Lancei um crédito quando na verdade é um débito e não encontrei opção de alteração ou excluir."*
> ⭐3 *"não consigo alterar dados salvos e nao tem a opcao para deletar valores"*

**Falta o botão de WhatsApp (o canal real):**
> ⭐3 *"Prático, mas poderia ter a opção de compartilhar no watts."*
> ⭐4 *"Falta opção de mandar pro cliente pelo whats, ficaria super completo, pq a tela q aparece o valor de debito e credito detalhados **não tem o nome da cliente, portanto nem print serve**."*

☝️ Esse último review é ouro: o lojista **já está tirando print e mandando no WhatsApp** hoje. O produto só precisa formalizar o que ele já faz.

**Arredondamento errado destrói a confiança:**
> ⭐3 *"quando você coloca um valor por exemplo 518,44 ele coloca 518,45"*

**Duplicação de lançamento:**
> ⭐5 *"Estava funcionando perfeitamente até que começou a duplicar o que era lançado"*

### 4.3 Brasil — "Caderno de Fiado" (com.ilgnergames.cadernodefiado)

Fonte: [34] https://play.google.com/store/apps/details?id=com.ilgnergames.cadernodefiado — posicionamento na própria loja: *"Controle de dívidas, fiado e cobranças rápidas via WhatsApp. 100% offline"*. Contém anúncios. Volume de reviews com texto é baixo; os que há são positivos e genéricos (*"gostei bastante do aplicativo, bem fácil de mecher"*, *"tooooop! era o que precisava!"*). **Amostra pequena demais para conclusões — não use como benchmark.**

### 4.4 Índia — Khatabook (~4,4★, ~590 mil avaliações)

Fonte: [35] https://play.google.com/store/apps/details?id=com.vaibhavkalpe.android.khatabook

**Padrão dominante nos reviews recentes: o app virou um funil de empréstimo e o lojista odiou.**
> ⭐1 *"Calls with loan offers everyday, man I dont need a loan... stop calling me"*
> ⭐1 *"please stop the newsence loan offers. just cibil effect. no loan very irritating."*
> ⭐1 *"Very poor experience with Business Loans... collection calls were rude. Auto-debit was attempted 5–6 times daily even after manual payments"*

**Update-wall (bloqueio pedindo atualizar quando já está atualizado):**
> ⭐1 *"The app is good but it asks for update even when on the latest version and it kinda blocks you post login and you'll not be able to see any transactions."*
> ⭐1 *"always tell to update while I m using the latest version"*

**Monetização retroativa de função que era grátis:**
> ⭐1 *"I am regular user for khata book but currently no use because you charge rs 99 per month"*
> ⭐1 *"very very poor.. 3 entries allowed."*

**Perda silenciosa de dados:**
> ⭐3 *"sometime I experienced that this app automatically deleted some of my customers"*

**Lentidão (não conseguia nem desinstalar por causa dos dados do cliente — refém):**
> ⭐1 *"the app lags so much while internet is on, that it automatically closed the app and i cannot even uninstall it because of customer data."*

**Falta de edição de data:**
> ⭐2 *"Entry me Date change ka option nahi hai wo aek badi problem"* (não tem opção de mudar a data no lançamento — é um problemão)

☝️ **Mesma reclamação de data retroativa que no app brasileiro.** Isso é um padrão transcultural, não um acaso.

**Falha do modelo de dois lados:**
> ⭐1 *"If I am a customer of the nearby Kirana Store and owner makes an entry on my name, those entries are not getting synced in my login"*

### 4.5 Índia — OkCredit (~4,6★, ~430 mil avaliações)

Fonte: [36] https://play.google.com/store/apps/details?id=in.okcredit.merchant

Padrão quase idêntico: **anúncios + assinatura sobre função que era grátis** dominam os reviews negativos.
> ⭐1 *"lots of advertisements is there. not good app for general use..."*
> ⭐1 *"I am paying my monthly subscription @99 per month but ads are taking my much time while using the app."*
> ⭐1 (hindi) *"ads bahut zyada aane lagti hai ye bilkul download mat karna"* — muitos anúncios, não baixem
> ⭐1 *"Best App For the Use But my account Is logged Out But now To Login account the Otp is not receiving"* — **perda de acesso por OTP não chegar**

### 4.6 Indonésia — BukuWarung

Fonte: [24] https://play.google.com/store/apps/details?id=com.bukuwarung

Este é o caso mais instrutivo, porque os bugs são exatamente os que este projeto vai cometer:

**BUG DE LAYOUT vs BARRA DE NAVEGAÇÃO DO ANDROID — dezenas de reviews, o app ficou inutilizável:**
> ⭐1 *"Tombol 0 terhalang tombol navigasi"* — o botão "0" ficou atrás da barra de navegação do sistema
> ⭐2 *"tombol simpan bawah dan tombol angka 0 jd tertutup jika hp masih ada navigasi tombol bawahnya"* — o botão salvar e o "0" ficam cobertos em celular com barra de botões
> ⭐1 *"layarnya terlalu besar sampai kepotong di layar jadi gabisa masukan nominal! sedih banget harus aku uninstall"* — não consegue digitar o valor, desinstalou chorando
> ⭐1 *"tombol 'simpan' tertutup navigation bar juga, sehingga kesulitan buat menyimpan data baru"*

☝️ **Uma barra de navegação por botões cobrindo o teclado numérico e o botão Salvar destruiu o produto.** Isso é um teste de QA de 5 minutos que ninguém fez. Colocar no checklist obrigatório.

**Perda de dados na troca de aparelho / reinstalação — repetido dezenas de vezes:**
> ⭐1 *"data kasir penjualan hilang semua sejak 2023 sampek sekarang"* — perdeu tudo desde 2023
> ⭐2 *"data transaksi 4 tahun terakhir malah hilang"* — 4 anos de transações sumiram
> ⭐1 *"semua data stok saya hilang setelah ganti hp"* — perdeu tudo ao trocar de celular
> ⭐2 *"coba lah buat fitur back up di internal storage hp sendiri, jangan backup di cloud"* — **pedido explícito por backup local no próprio celular, não na nuvem**

**Troca de número de telefone é um pesadelo (login por telefone):**
> ⭐1 *"untuk sekedar tukar no hp aja sampai 2 minggu gk selesai"* — 2 semanas só para trocar o número
> ⭐3 *"Kenapa syarat ganti nomor HP ribet banget... sekelas shopeepay, dana, gopay, ovo, ga seribet ini"*
> ⭐1 *"tidak terima otp, tidak bisa daftar"* — não recebe OTP, não consegue cadastrar

**Force close constante, e uma pista técnica valiosa:**
> ⭐2 *"setelah update aplikasinya force closed trs min, **tapi kalo internet dimatikan dia bisa dibuka**"* — o app abre **se desligar a internet**! Ou seja, uma chamada de rede na inicialização derruba o app.

**Medo de desinstalar (refém dos próprios dados):**
> ⭐2 *"mau uninstall takut dataku ilang semua"* — quer desinstalar mas tem medo de perder tudo

### 4.7 Padrões consolidados do benchmark

**O que faz DESINSTALAR (ordenado por gravidade observada):**

| # | Causa | Evidência |
|---|---|---|
| 1 | **Perda de dados** (sync, update, troca de aparelho, reinstalação) | BR [32][33], IN [35], ID [24] — em **todos** os mercados |
| 2 | **Perda de acesso à conta** (senha/OTP/e-mail inválido, biometria) | BR [33], IN [36], ID [24] |
| 3 | **Anúncio ou paywall no meio da tarefa** | BR [32], IN [35][36] |
| 4 | **Monetização retroativa** de função que era grátis | IN [35][36] |
| 5 | **Botão coberto / não consegue digitar o valor** | ID [24] |
| 6 | **Não dá para corrigir ou apagar lançamento errado** | BR [32][33] |
| 7 | **Não dá para lançar com data de ontem** | BR [32], IN [35] |
| 8 | **Não achar o cliente na lista** (sem busca, sem ordem alfabética) | BR [32] |
| 9 | **Não ter o total geral** ("quanto tenho na rua") | BR [33] |
| 10 | Crash ao salvar / lentidão / duplicação | BR [32][33], IN [35], ID [24] |
| 11 | Sem canal de suporte humano (só bot) | ID [24], IN [35] |
| 12 | Prompt de avaliação repetitivo | BR [32] |

**O que ELOGIAM:** exatamente três coisas — **simples, rápido, "fácil de mecher"**. Nunca elogiam recursos.

**Conclusão estratégica:** o mercado de fiado digital **não é ganho por features**. É ganho por **não perder o dado, não perder o login e não atrapalhar o balcão**. Todo o orçamento de engenharia deveria ir para durabilidade de dados e velocidade do lançamento.

---

## 5. Fluxos críticos

Notação: `[T]` = toques. Contagem exclui abrir o app. Alvos de toque marcados `[H]` — são metas de design derivadas do contexto de balcão (fonte [3][4]: cliente esperando, mão ocupada), a serem validadas por teste cronometrado.

### 5.0 Arquitetura de tela base

```
┌──────────────────────────────────┐
│  Zé Mercadinho          ⚙        │  ← topo: identidade + config (sem ações críticas)
├──────────────────────────────────┤
│                                  │
│   NA RUA                         │
│   R$ 1.847,50                    │  ← número herói, 44sp bold, contraste ≥7:1
│   12 pessoas · 3 atrasadas       │
│                                  │
├──────────────────────────────────┤
│  🔴 Dona Maria       R$ 240,00   │  ← lista, ordenada por: atrasados > valor
│     atrasou 6 dias               │
│  🟡 Seu João         R$ 85,00    │
│     vence dia 5                  │
│  ⚪ Cleide           R$ 32,00    │
│     em dia                       │
│  ...                             │
├──────────────────────────────────┤
│  [  ➕  ANOTAR FIADO  ]          │  ← 64dp, metade inferior, sempre visível
└──────────────────────────────────┘
```

Regras: coluna única (NN/g [12]); cor **sempre** com ícone + palavra (web.dev [18]); densidade alta, cor saturada (Google NBU [11]); botão primário 64dp (Material [20]).

---

### 5.a Lançar venda fiado — cliente que já existe ⭐ FLUXO MAIS USADO

**Objetivo:** registrar valor devido de um cliente conhecido enquanto ele está no balcão.
**Alvo: 3 toques + digitação do valor. Máximo aceitável: 4 toques. Tempo alvo: < 8 segundos.** `[H]`
**Comparação obrigatória:** escrever "Maria — 18,50" no caderno leva ~6s. Se o app for mais lento, ele perde.

```
TELA 1 — Início                    TELA 2 — Quem é?            TELA 3 — Quanto?
                                   
[➕ ANOTAR FIADO]  ──T1──►  🔍 Buscar...          ──T2──►   Dona Maria
                            ┌──────────────┐              deve R$ 240,00
                            │ Dona Maria   │              ┌──────────────┐
                            │ Seu João     │              │   R$ 18,50   │  ← foco automático
                            │ Cleide       │              └──────────────┘     teclado numérico
                            │ ...          │                 já aberto
                            └──────────────┘              [ 1 ][ 2 ][ 3 ]
                            [+ Cliente novo]              [ 4 ][ 5 ][ 6 ]
                            ↑ últimos 5 no topo           [ 7 ][ 8 ][ 9 ]
                                                          [ , ][ 0 ][ ⌫ ]
                                                          
                                                          [ ✓ ANOTAR ]  ──T3──►
                                                          
                                                          ▸ (opcional) "o que levou?"
                                                             colapsado, NÃO obrigatório
```

```
TELA 4 — Confirmação (2,5s, auto-dismiss)
┌──────────────────────────────────┐
│         ✓ (verde cheio)          │
│                                  │
│         Anotado!                 │
│                                  │
│      Dona Maria agora deve       │
│         R$ 258,50                │  ← 48sp, o lojista lê de longe
│                                  │
│  [ Desfazer ]   [ Anotar outro ] │  ← desfazer por 8s (NN/g [17])
└──────────────────────────────────┘
```

**Decisões e por quê:**
- **Ordem "quem → quanto"**, não "quanto → quem". No balcão o lojista já sabe quem é antes de somar. `[H]` validar.
- **Lista de clientes com os 5 mais recentes no topo.** Com 8–15 devedores ([3][4]), a lista inteira cabe sem rolagem — resolve a reclamação "não consigo achar o cliente" [32]. Busca existe, mas quase nunca é necessária.
- **Descrição do produto é opcional e colapsada.** Campo obrigatório aqui mata o fluxo. (Baymard: cada campo extra é um ponto de decisão onde a pessoa desiste — [37] https://baymard.com/blog/fast-and-easy-user-sign-up)
- **Data = hoje por padrão, mas editável com 1 toque** (chip "ontem"). Isto resolve a reclamação transcultural nº7 ([32][35]).
- **Sem confirmação modal.** É ação rotineira e reversível → NN/g diz explicitamente para não usar confirmação em ação rotineira [16]. Usar **Desfazer** [17].
- **Botão Salvar acima do teclado, com `windowSoftInputMode` e safe-area/`navigationBarInsets` respeitados** — o bug que quebrou a BukuWarung [24].

**Estados de erro:**
| Situação | Microcopy |
|---|---|
| Valor vazio | Botão fica desabilitado com rótulo cinza: `Digite o valor` (sem alerta vermelho) |
| Valor absurdo (> 10× o ticket médio do cliente) | Faixa amarela, não bloqueia: `R$ 1.850,00? Confere aí — normalmente é uns R$ 20.` + [Tá certo] [Corrigir] |
| Sem internet | Salva igual. Pílula no topo: `Sem internet — está tudo anotado aqui` |
| App fechou no meio | Rascunho recuperado ao reabrir: `Você tinha começado uma anotação da Dona Maria. Continuar?` |

---

### 5.b Cadastrar cliente novo no meio de uma venda

**Objetivo:** não interromper a venda. **Alvo: nome + 1 toque. Nada mais é obrigatório.**

```
Na busca de clientes:  [+ Cliente novo]  ──►

┌──────────────────────────────────┐
│  Quem é o freguês?               │
│  ┌────────────────────────────┐  │
│  │ Maria da Padaria           │  │  ← ÚNICO campo obrigatório
│  └────────────────────────────┘  │     autocapitalize=words
│                                  │
│  📱 WhatsApp (dá pra deixar      │
│     pra depois)                  │
│  ┌────────────────────────────┐  │
│  │ (  )                       │  │  ← OPCIONAL, rotulado como opcional
│  └────────────────────────────┘  │     [Pegar da agenda] ← 1 toque
│                                  │
│  [    Pronto, anotar fiado   ]   │
└──────────────────────────────────┘
```

**Regras duras (todas fundamentadas):**
- ❌ **Sem CPF.** Não é necessário para a finalidade → princípio da necessidade/minimização da LGPD; e coletar CPF já traz o negócio para o escopo da lei. [38] https://sebrae.com.br/sites/PortalSebrae/artigos/o-que-e-lgpd-e-a-flexibilizacao-para-os-pequenos-negocios,a4d326df5c136810VgnVCM1000001b00320aRCRD
- ❌ **Sem e-mail, sem endereço, sem RG, sem data de nascimento, sem foto obrigatória, sem "limite de crédito".**
- ❌ **O cliente final NÃO cria conta, não instala app, não confirma nada.** Ver 5.g.
- ✅ **Rotular o campo opcional com a palavra "opcional"** em vez de asterisco no obrigatório — Baymard mediu ~25% mais conversão nessa forma (estudo B2B, 500 usuários) [37]. `[E-2]` — não abri o relatório completo (paywall Baymard).
- ✅ **Permitir apelido, não nome completo.** No comércio de bairro o cliente é "Maria da Padaria", "Seu Zé do 12", "Bigode". `[H]` — derivado de [3][4]; **validar em campo**, é a decisão de nomenclatura mais arriscada do produto.
- ✅ **Puxar da agenda do celular com 1 toque** (permissão pedida no momento, com justificativa em uma linha), mas **jamais importar tudo automaticamente**.

**Erro:** nome duplicado → `Você já tem uma "Maria". Essa é a mesma ou é outra pessoa?` [É a mesma] [É outra Maria]

---

### 5.c Receber pagamento (parcial e total)

**Objetivo:** dar baixa rápido, e — o mais importante — **fazer o lojista sentir a satisfação de zerar a conta**.
**Alvo: 3 toques para pagamento total; 4 + digitação para parcial.**

```
Ficha do cliente:
┌──────────────────────────────────┐
│  ← Dona Maria           📱 ⋯     │
│                                  │
│      Deve R$ 258,50              │  ← número herói
│      desde 12 de agosto          │
│                                  │
│  [  💰 RECEBI  ]  [ + Fiado ]    │  ← 2 ações, lado a lado, 56dp
│                                  │
│  ── O que ela levou ──           │
│  hoje       R$ 18,50             │
│  ontem      R$ 42,00   ⋯         │  ← ⋯ = editar/apagar (resolve [32][33])
│  05/08  pagou R$ 100,00 ✓        │
└──────────────────────────────────┘
```

Toque em **RECEBI**:

```
┌──────────────────────────────────┐
│  Quanto a Dona Maria te pagou?   │
│                                  │
│  ┌────────────────────────────┐  │
│  │        R$ 258,50           │  │ ← PRÉ-PREENCHIDO com o total
│  └────────────────────────────┘  │
│                                  │
│  [ Pagou tudo ] [ Pagou metade ] │ ← atalhos, 1 toque
│                                  │
│  Como pagou?  (opcional)         │
│  [ 💵 Dinheiro ] [ 📱 Pix ]      │
│                                  │
│  [       ✓ DAR BAIXA        ]    │
└──────────────────────────────────┘
```

**Total → tela de celebração (este é o momento de deleite; Google NBU princípio 9 [11]):**
```
┌──────────────────────────────────┐
│            🎉                    │
│                                  │
│      Conta da Dona Maria         │
│           QUITADA!               │  ← verde, 40sp
│                                  │
│      Ela não te deve nada        │
│                                  │
│  [ Mandar comprovante no zap ]   │  ← opcional, gera recibo
│  [        Fechar             ]   │
└──────────────────────────────────┘
```

**Parcial:**
```
      ✓ Recebido R$ 100,00
      
      Ainda falta R$ 158,50        ← não diz "saldo devedor"
      
      [ Desfazer ]  [ Fechar ]
```

**Estados de erro:**
| Situação | Microcopy |
|---|---|
| Pagou mais que devia | `Ela te pagou R$ 20,00 a mais. Quer deixar esse valor como crédito pra próxima?` [Deixar de crédito] [Corrigir valor] |
| Deu baixa errado | `Desfazer` por 8s + item editável no histórico para sempre |
| Cliente já estava zerado | Botão RECEBI vira `Sem conta aberta` (desabilitado, cinza) — não some, para não confundir |

---

### 5.d Ver quem está devendo e quem está vencido

**Objetivo:** responder "quem tá me devendo?" em **0 toques** — a resposta é a tela inicial.

```
┌──────────────────────────────────┐
│  NA RUA                          │
│  R$ 1.847,50                     │
│  12 pessoas · 3 atrasadas        │
├──────────────────────────────────┤
│  [ Todos ] [ Atrasados 3 ]       │  ← 2 filtros. Só isso.
├──────────────────────────────────┤
│  🔴 Dona Maria      R$ 240,00    │
│     Atrasou 6 dias    [ Lembrar ]│  ← ação inline, 1 toque
│                                  │
│  🔴 Seu Antônio     R$ 180,00    │
│     Atrasou 2 dias    [ Lembrar ]│
│                                  │
│  🟡 Seu João         R$ 85,00    │
│     Vence dia 5                  │
│                                  │
│  ⚪ Cleide           R$ 32,00    │
│     Em dia                       │
└──────────────────────────────────┘
```

**Decisões:**
- **Ordenação:** atrasados primeiro (maior atraso no topo), depois por valor. Nunca alfabética por padrão — mas oferecer A–Z na engrenagem (reclamação real [32]).
- **Semáforo redundante:** cor + emoji/ícone + palavra ("Atrasou 6 dias"), nunca cor sozinha [18].
- **Somente 2 filtros.** Público de baixo letramento não escaneia; cada opção a mais é uma opção que ele lê linha a linha ou ignora inteira [12].
- ❌ Sem gráfico, sem donut, sem "aging de recebíveis", sem tabela.
- ❌ **Nunca chamar de "inadimplentes"** nem mostrar percentual de inadimplência.

---

### 5.e Cobrar sem constranger (WhatsApp)

**Este é o fluxo mais delicado do produto.** Restrições da seção 1.3 valem integralmente.

**Objetivo:** o lojista manda um lembrete que **soa como ele**, não como um banco.
**Alvo: 3 toques até o WhatsApp aberto com o texto pronto.**

```
[ Lembrar ] ──T1──►

┌──────────────────────────────────┐
│  Mandar recadinho pra Dona Maria │
│                                  │
│  Escolha o jeito:                │
│                                  │
│  ● Bem de leve                   │  ← DEFAULT
│  ○ Direto                        │
│  ○ Só o valor                    │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Oi, Dona Maria! Tudo bem?  │  │  ← EDITÁVEL, campo de texto real
│  │ Passando pra lembrar da    │  │
│  │ conta aqui do mercadinho,  │  │
│  │ tá em R$ 240,00. Quando    │  │
│  │ der, é só passar aqui 😊   │  │
│  │ Se quiser, meu Pix é       │  │
│  │ 11 98888-7777              │  │
│  └────────────────────────────┘  │
│                                  │
│  [   Abrir no WhatsApp   ]       │  ← T3
│                                  │
│  ⓘ Você que manda. O app não     │
│    manda nada sozinho.           │  ← promessa explícita, sempre visível
└──────────────────────────────────┘
```

**Os três tons (todos editáveis, o lojista pode salvar o dele):**

**1. "Bem de leve"** (default)
> `Oi, Dona Maria! Tudo bem? Passando só pra lembrar da conta aqui do mercadinho, tá em R$ 240,00. Quando der, é só passar aqui 😊 Se ficar melhor, meu Pix é 11 98888-7777. Abraço!`

**2. "Direto"**
> `Oi, Dona Maria, tudo bem? A conta aqui no mercadinho está em R$ 240,00, venceu dia 5. Dá pra acertar essa semana? Se precisar dividir, a gente conversa. Pix: 11 98888-7777`

**3. "Só o valor"** (para quem tem intimidade e não quer floreio)
> `Oi Dona Maria! Sua conta: R$ 240,00. Pix 11 98888-7777. Obrigado! 🙏`

**Trava de produto — regras que o time NÃO pode flexibilizar depois:**
1. `Enviar automaticamente` **não existe como opção**, nem escondida em configurações. Justificativa: art. 42 do CDC (constrangimento) [7][8] + risco de destruir a relação [3][4][5].
2. O app **abre o WhatsApp com o texto**; quem aperta enviar é o humano. (`https://wa.me/55DDDNUMERO?text=...`)
3. **Nunca mensagem em grupo ou lista de transmissão** — seria expor a dívida a terceiros, prática listada como abusiva pelo TJDFT [8].
4. Sugerir horário: se for antes das 8h ou depois das 20h, avisar `Tá tarde. Melhor mandar amanhã de manhã?` — alinhado à orientação de horário adequado [8][10].
5. **Máximo 1 lembrete sugerido por cliente por semana.** Se o lojista pedir de novo antes disso: `Você já lembrou a Dona Maria há 2 dias. Quer mandar de novo mesmo?`
6. **Nunca a palavra "cobrança" na UI.** É "lembrete", "recadinho", "avisar".

---

### 5.f Fechar o dia / ver quanto tem "na rua"

**Objetivo:** dar ao lojista a sensação de controle no fim do expediente. **Alvo: 1 toque.**

```
┌──────────────────────────────────┐
│  ← Fechamento de hoje            │
│     Quinta, 4 de setembro        │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Anotei fiado hoje         │  │
│  │  R$ 312,40                 │  │  ← vermelho suave
│  │  9 anotações               │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Recebi hoje               │  │
│  │  R$ 480,00                 │  │  ← verde
│  │  4 pessoas pagaram         │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  TÁ NA RUA                 │  │
│  │  R$ 1.847,50               │  │  ← número herói, 44sp
│  │  com 12 pessoas            │  │
│  │  R$ 420,00 atrasado        │  │
│  └────────────────────────────┘  │
│                                  │
│  Quem tá atrasado:               │
│  🔴 Dona Maria    R$ 240,00      │
│  🔴 Seu Antônio   R$ 180,00      │
│                                  │
│  [ Mandar resumo pro meu zap ]   │  ← backup psicológico + real
└──────────────────────────────────┘
```

**Decisões:**
- **"Tá na rua"** é o KPI emocional. Foi a reclamação nº1 de falta em app brasileiro: *"Seria perfeito se o app somasse todos os devedores"* [33].
- ❌ Sem margem, sem lucro, sem DRE, sem gráfico. Isso não é um ERP.
- ✅ **"Mandar resumo pro meu zap"** é subestimado: é backup percebido. Reviews mostram terror de perda de dados [32][24]; mandar o resumo pro próprio WhatsApp dá ao lojista a mesma segurança do caderno físico. `[H]` — validar, mas o pedido de "backup no próprio celular" aparece literalmente nos reviews da BukuWarung [24].

---

### 5.g Cliente consulta o próprio saldo

**Resposta curta: link público, sem app, sem cadastro, sem senha.**

**Evidência contra exigir app do cliente:** o modelo de dois lados **falhou na Índia**. Review verbatim do Khatabook:
> ⭐1 *"If I am a customer of the nearby Kirana Store and owner makes an entry on my name, those entries are not getting synced in my login"* [35]

**Evidência a favor do link:** o WhatsApp é o canal de 82% dos pequenos negócios [28], e o lojista **já manda print hoje** — inclusive reclamando que o print não serve porque não tem o nome do cliente [33].

**Desenho proposto:**

```
Lojista, na ficha do cliente:  [ ⋯ ] → [ Mandar a conta no zap ]

Gera:  mercadinho.app/c/9f3k2p   (token aleatório, não sequencial)

O cliente abre no navegador — SEM instalar nada, SEM login:

┌──────────────────────────────────┐
│  Mercadinho do Zé                │
│  Rua das Flores, 120             │
│                                  │
│  Oi, Dona Maria!                 │
│                                  │
│  Sua conta está em               │
│  R$ 240,00                       │  ← 44sp
│                                  │
│  ── O que você levou ──          │
│  04/09  R$ 18,50                 │
│  03/09  R$ 42,00                 │
│  05/08  pagou R$ 100,00 ✓        │
│                                  │
│  Pra pagar por Pix:              │
│  ┌────────────────────────────┐  │
│  │  11 98888-7777             │  │
│  │  [ Copiar chave ]          │  │
│  └────────────────────────────┘  │
│  [ QR Code ]                     │
│                                  │
│  Atualizado hoje às 14:32        │
└──────────────────────────────────┘
```

**Regras de privacidade e dignidade:**
| Regra | Por quê |
|---|---|
| Só o próprio saldo. Nunca lista de outros devedores. | Expor dívida a terceiros é prática abusiva [8] |
| Token aleatório longo, **não** o telefone nem ID sequencial | Evita enumeração |
| Link **expira** (ex.: 30 dias) e pode ser revogado | Minimização LGPD [38] |
| **Nenhuma palavra de cobrança** na página: "sua conta", nunca "sua dívida", nunca "em atraso" | Art. 42 CDC [7] |
| Sem "vencido em vermelho pulsante" | O objetivo é informar, não pressionar |
| Página **sem app, sem login, sem cadastro** | Modelo de dois lados falhou [35] |
| Página leve (<50KB), funciona em 2G/3G | Dados caros e limitados: 69% da classe DE em pré-pago [25]; NBU [11] |

`[H]` **A validar:** se o cliente devedor aceita bem receber esse link ou se ele soa como cobrança formal. É o maior risco não testado do produto. Teste com 8–10 clientes reais antes de lançar.

---

## 6. Microcopy e tom de voz

### 6.1 Tom

**O app fala como um vizinho prestativo que entende de caderno, não como um banco.**

| Atributo | É | Não é |
|---|---|---|
| Pessoa | 2ª pessoa direta: "você", "seu freguês" | "o usuário", "o cliente cadastrado" |
| Registro | Português falado de balcão | Português corporativo/jurídico |
| Frases | Curtas, uma ideia por frase, 6ª–8ª série de leitura (NN/g [12]) | Períodos compostos, subordinadas |
| Emoji | Pouco e funcional (✓ 🔴 💰 🎉) | Emoji decorativo em toda linha |
| Erro | Diz o que fazer agora | Diz o que deu errado tecnicamente |
| Cobrança | "lembrar", "recadinho", "avisar" | "cobrar", "notificar", "acionar" |

**Base:** NN/g recomenda 6ª série na home e 8ª nas demais páginas para baixo letramento [12]; Google NBU recomenda minimizar texto e usar linguagem que construa confiança [11].

### 6.2 Glossário — como chamar cada coisa

**Termos com origem verificada:** `[E]` "fiado" e "pendura/pindura" são termos lusófonos populares para comprar e pagar depois; a origem de "pendura" é o **prego onde o comerciante pendurava as contas dos fregueses** em tabernas, mercearias e farmácias. A grafia correta é "pendura"; "pindura" ocorre em algumas regiões. Sinônimo: "colocar no prego". Fonte: [39] https://pt.wikipedia.org/wiki/Pindura

`[NE]` **Não encontrei** nenhum levantamento dialetológico (tipo ALiB — Atlas Linguístico do Brasil) mapeando os termos de fiado por região. A tabela abaixo separa o que é verificado do que é hipótese.

| Conceito | ✅ Use na UI | ⚠️ Regional (só como sinônimo aceito na busca) | ❌ Nunca na UI |
|---|---|---|---|
| A venda a prazo | **fiado** `[E]` [39] | pendura/pindura `[E]` [39]; "no prego" `[E]` [39]; "na conta"; "na caderneta" `[H]` | crédito, crediário, venda a prazo, financiamento, empréstimo |
| O registro | **caderneta**, **caderno**, **conta** | "a firma", "o papelzinho" `[H]` | ledger, extrato, razão, conta corrente |
| Quem deve | **freguês**, **cliente**, **quem tá devendo** | "meu povo", "o pessoal" `[H]` | devedor, inadimplente, tomador, mutuário |
| O valor devido | **quanto deve**, **a conta** | "o débito", "o que ficou" `[H]` | saldo devedor, principal, exposição |
| Total emprestado | **tá na rua**, **na rua** `[H]` | "espalhado", "no mundo" `[H]` | carteira, recebíveis, contas a receber, capital de giro |
| Pagar tudo | **quitar**, **pagou tudo**, **zerou** | "acertou", "limpou a conta" `[H]` | liquidar, amortizar, dar quitação |
| Pagar em parte | **pagou uma parte**, **abateu** | "deu um por conta" `[H]` | amortização parcial, pagamento parcial |
| Passou do prazo | **atrasou**, **tá atrasado** | "tá enrolando" `[H]` | inadimplência, vencido, mora, default |
| Lembrar de pagar | **lembrar**, **mandar um recadinho**, **avisar** | "dar um toque" `[H]` | cobrança, notificação de débito, régua de cobrança |
| Anotar a venda | **anotar**, **pendurar** | "botar na conta", "marcar" `[H]` | lançar, registrar transação, debitar |
| Dar baixa | **recebi**, **dar baixa** | "acertei com ele" `[H]` | conciliar, baixar título, quitação parcial |
| Novo cliente | **freguês novo**, **cliente novo** | — | cadastro de cliente, onboarding de cliente, KYC |

> ⚠️ **"Na rua" precisa de teste.** É expressão real do comércio, mas eu **não encontrei fonte** documentando seu uso e compreensão neste contexto exato. Testar contra a alternativa neutra "**Tenho pra receber**".

### 6.3 Strings prontas (20)

**Botões e ações**
1. `➕ ANOTAR FIADO`
2. `💰 RECEBI`
3. `Pronto, anotar fiado`
4. `Pagou tudo`
5. `Mandar recadinho no zap`
6. `Desfazer`
7. `Mandar a conta pro freguês`

**Estados vazios**
8. *(primeira abertura)* `Aqui vai ficar a lista de quem te deve.` / `Anote o primeiro fiado e pronto — o caderno pode descansar.` + `[Anotar o primeiro]`
9. *(ninguém devendo)* `Ninguém te deve nada agora. 🎉` / `Tá tudo em dia por aqui.`
10. *(filtro atrasados vazio)* `Nenhum atrasado. Seu povo tá pagando direitinho.`
11. *(cliente sem histórico)* `A conta da Dona Maria tá zerada.`

**Confirmações**
12. `Anotado! Dona Maria agora deve R$ 258,50`
13. `Conta da Dona Maria QUITADA! Ela não te deve nada.`
14. `Recebido R$ 100,00. Ainda falta R$ 158,50.`
15. `Voltei atrás. A conta da Dona Maria está em R$ 240,00 de novo.`

**Erros e avisos**
16. *(offline)* `Sem internet — está tudo anotado aqui no seu celular. Quando pegar sinal, eu guardo na nuvem.`
17. *(sem sync há 2 dias)* `Faz 2 dias que não pego internet. Suas anotações estão salvas aqui, pode ficar tranquilo.`
18. *(valor fora do padrão)* `R$ 1.850,00? Confere aí — a Dona Maria costuma levar uns R$ 20.` `[Tá certo]` `[Corrigir]`
19. *(apagar cliente com saldo — a única confirmação modal do app)* `A Dona Maria ainda deve R$ 240,00. Se você apagar, some tudo e não dá pra voltar atrás.` `[Apagar mesmo assim]` `[Deixar quieto]`
20. *(WhatsApp sem número)* `Não tenho o zap da Dona Maria. Quer botar agora?` `[Botar o número]` `[Depois]`

**Bônus — a promessa de confiança, que deve aparecer em toda tela de lembrete**
21. `Você que manda. O app não manda nada sozinho.`

---

## 7. Riscos de UX e armadilhas

Ordenados por probabilidade × dano. **Cada risco está ancorado numa evidência de fracasso real, não em opinião.**

### 🔴 Risco 1 — Perda de dados (RISCO EXISTENCIAL)
`[E]` É a causa nº1 de nota 1★ em **todos os quatro apps** que analisei — Brasil, Índia e Indonésia. Reviews: *"perdi todo meu controle de vendas"* [32]; *"apagou todas as pessoas q me devia. Tomei um prejuiso bem alto por confiar no app"* [32]; *"data transaksi 4 tahun terakhir malah hilang"* [24].

O agravante é psicológico: o caderno **nunca** apaga sozinho. Um app que apaga é objetivamente pior que papel, e o lojista sabe disso — por isso mantém o caderno em paralelo (*"Minha sorte que registro no caderno"* [32]), e isso é o fim da adoção.

**Mitigações:**
- Banco local como fonte de verdade; nuvem é réplica, não o contrário.
- **Ledger append-only**: lançamentos nunca são sobrescritos, só estornados. Sync jamais faz `DELETE` vindo do servidor.
- **Exportação local** (arquivo no celular + resumo no próprio WhatsApp), atendendo ao pedido literal dos usuários [24].
- Migração de aparelho testada como **fluxo de produto de primeira classe**, não como suporte.
- Antes de qualquer migração de schema: snapshot local automático.

### 🔴 Risco 2 — Perda de acesso à conta
`[E]` *"ao inserir e-mail e senha, dava inválido... cliquei em 'esqueci minha senha', e apareceu e-mail inválido"* [33]; *"the Otp is not receiving"* [36]; *"App fechou do nada e não aceita mais minha digital nem minha senha"* [32]; BukuWarung: 2 semanas para trocar o número de telefone [24].

**Mitigações:**
- **O app funciona 100% sem conta.** Login é opcional, oferecido depois do valor entregue (ex.: no 10º lançamento, enquadrado como "quer que eu guarde uma cópia?").
- Se houver login: **nunca bloquear a leitura dos dados locais** por falta de autenticação. Perder o login ≠ perder o caderno.
- Trocar de número deve ser autoatendimento, não ticket de suporte.

### 🔴 Risco 3 — Cobrança automática destruindo a relação
`[E]` Restrição legal (art. 42 CDC [7], TJDFT [8]) + restrição relacional (o lojista prefere absorver R$ 100 de perda a cobrar [4]; adia por medo de perder a próxima venda [5]).

Se o app manda mensagem sozinho e o freguês some da loja, **o lojista culpa o app e desinstala no mesmo dia** — e conta para os vizinhos, que é exatamente o canal de aquisição desse mercado (NBU princípio 7: confiança vem do boca a boca [11]).

**Mitigação:** ver as 6 travas da seção 5.e. Não implementar envio automático **em versão nenhuma**.

### 🟠 Risco 4 — Onboarding longo / pedir dado demais
`[E]` Baymard: o formulário médio tem 14,88 elementos quando só 7–8 são necessários, e cada campo extra é um ponto de decisão onde a pessoa abandona [37]. `[E]` LGPD: princípio da necessidade — se nome e telefone bastam, não colete mais; coletar CPF já traz a lei para o negócio [38]. `[E]` Público mais velho e de menor escolaridade formal [1].

**Regras:** ❌ Sem CPF/CNPJ. ❌ Sem e-mail. ❌ Sem importar todos os clientes de uma vez. ❌ Sem tour de 6 telas. ❌ Sem "escolha seu plano" antes de usar. ✅ Primeiro fiado anotado em **menos de 60 segundos** desde a instalação.

### 🟠 Risco 5 — Exigir que o cliente final tenha o app
`[E]` O modelo falhou visivelmente no Khatabook: *"If I am a customer of the nearby Kirana Store and owner makes an entry on my name, those entries are not getting synced in my login"* [35]. A carteira típica tem 8–15 devedores [3][4] — pedir que cada um instale um app é irrealista.

**Mitigação:** link público sem app (5.g).

### 🟠 Risco 6 — Anúncio e paywall no meio do balcão
`[E]` *"Propaganda demais nem cheguei a cadastra um cliente. Abriu. 4 propagandas"* [32]; *"Propaganda a cada lançamento"* [32]; *"ads are taking my much time while using the app"* — de um assinante pagante [36]; *"Desinstalei assim que fui testar e vi campos bloqueados"* [32].

**Regra:** o fluxo "anotar fiado" e "receber" **nunca** é interrompido — nem por anúncio, nem por paywall, nem por pedido de avaliação, nem por prompt de atualização. Cliente esperando no balcão é contexto de urgência real [3][4].

### 🟠 Risco 7 — Monetização retroativa
`[E]` Khatabook e OkCredit: *"currently no use because you charge rs 99 per month"* [35], *"3 entries allowed"* [35], *"ab paise lagne lage bekar he"* [36]. Cobrar por algo que já era grátis é o gatilho de raiva mais visível nos dois apps.

**Mitigação:** o núcleo (anotar, receber, ver quem deve, lembrar) é **grátis para sempre e sem limite de clientes**. Monetizar em periferia (multi-loja, relatório, funcionário, PDV/estoque).

### 🟡 Risco 8 — Botão coberto / valor não digitável
`[E]` Foi o que quebrou a BukuWarung: *"Tombol 0 terhalang tombol navigasi"*, *"tombol 'simpan' tertutup navigation bar"*, *"gabisa masukan nominal! sedih banget harus aku uninstall"* [24].

**Mitigação:** matriz de QA obrigatória — Android 8→15 × barra de gestos **e** barra de 3 botões × 5"/6,7" × fonte 100%/130%/200% × teclado aberto. Nenhum botão primário abaixo do inset da navegação.

### 🟡 Risco 9 — Não conseguir corrigir erro
`[E]` *"Lancei um crédito quando na verdade é um débito e não encontrei opção de alteração ou excluir"* [33]; *"Não consigo excluir vendas pagas"* [32]; *"Entry me Date change ka option nahi hai"* [35]. E o erro de polaridade: *"quando é pra adicionar debitos tem o +, mas se entra no nome do cliente lá o + quer dizer valor pago... acabei colocando valor positivo quando era negativo"* [33].

**Mitigações:** SARAL lista **error recovery** como um dos 4 construtos essenciais para baixo letramento [13]. Todo lançamento é editável e estornável, para sempre. Data retroativa em 1 toque. **Nunca usar "+/−" como significante** — usar palavras: "Anotar fiado" (vermelho) vs "Recebi" (verde), com ícone distinto.

### 🟡 Risco 10 — Chamada de rede na inicialização
`[E]` Pista técnica dos reviews da BukuWarung: *"aplikasinya force closed trs, tapi kalo internet dimatikan dia bisa dibuka"* — o app só abre com a internet **desligada** [24]. `[E]` E o Khatabook chegou a bloquear a leitura por um update-wall: *"it kinda blocks you post login and you'll not be able to see any transactions"* [35].

**Regra:** a tela inicial renderiza a partir do banco local **antes** de qualquer chamada de rede. Nenhuma feature flag, remote config ou verificação de versão pode bloquear a tela.

### 🟡 Risco 11 — Estética de fintech branca e minimalista
`[E]` Achado contraintuitivo do Google NBU: usuários **rejeitaram** espaço em branco e cores apagadas; interfaces densas e vibrantes ressoaram melhor [11]. `[E]` Sob sol forte, contraste de 300:1 vira <2:1 [23] — cinza claro sobre branco desaparece na porta da loja.

### 🟡 Risco 12 — Virar funil de empréstimo
`[E]` É o que aconteceu com o Khatabook e o que mais gera 1★ hoje: *"Calls with loan offers everyday, man I dont need a loan"*, *"fraud app Please don't take loan from this app"*, *"Auto-debit was attempted 5–6 times daily"* [35].

**Aviso estratégico:** a tentação de monetizar via crédito é enorme e destruiu a percepção de um app com 590 mil avaliações. Se for haver crédito, precisa ser opt-in explícito, sem ligação ativa, sem débito automático.

### 🔵 Risco 13 — Balconista com acesso total
`[H]` Se o funcionário puder apagar lançamentos e ver o total do caixa, o dono não instala. **Não encontrei evidência**; é hipótese forte. **Validar em campo antes de construir qualquer perfil de permissão.**

### 🔵 Risco 14 — "Limite de crédito" automático
`[H]` A concessão é feita por conhecimento pessoal, não por score [3][4]. Um limite calculado pelo app provavelmente será ignorado ou ofenderá. **Validar antes de construir.** Alternativa mais segura: limite que **o próprio lojista** define, e que só gera um aviso discreto — nunca bloqueia a venda.

---

## 8. Métricas de UX

### 8.1 A métrica-mãe

> **% de lojistas que anotam pelo menos um fiado no dia seguinte à instalação (D1 Lançamento).**

Não é "abriu o app". É **anotou**. Retorno no dia seguinte significa que o app venceu o caderno numa transação real. Se essa métrica for baixa, nada mais importa.

### 8.2 Funil de ativação

| Métrica | Definição | Meta proposta | Base |
|---|---|---|---|
| **TTFV — Tempo até o 1º fiado anotado** | Instalação → 1º lançamento salvo | **< 60 s (p50), < 120 s (p90)** | `[H]` — meta derivada do princípio "3 telas ou menos, autenticação adiada até depois do valor" [40] |
| **% que anota o 1º fiado na 1ª sessão** | | **> 70%** | `[H]` |
| **% que chega ao 3º cliente cadastrado** | Proxy de "migrou o caderno" | **> 45% em D7** | `[H]` |
| **% que dá a 1ª baixa de pagamento** | Fecha o loop de valor | **> 50% em D14** | `[H]` |

### 8.3 Velocidade dos fluxos (medir em produção, p50 e p90)

| Fluxo | Toques alvo | Tempo alvo p50 | Como medir |
|---|---|---|---|
| **Lançar fiado (cliente existente)** ⭐ | **3** | **< 8 s** | timestamp do toque em "Anotar fiado" → gravação |
| Cadastrar cliente no meio da venda | +2 | < 15 s adicionais | |
| Receber pagamento total | 3 | < 6 s | |
| Ver quem está atrasado | **0** | instantâneo | tela inicial |
| Preparar lembrete de WhatsApp | 3 | < 10 s | até `Intent` do WhatsApp |
| Ver "tá na rua" | 1 | instantâneo | |

**Referência competitiva a bater:** anotar "Maria — 18,50" no caderno leva ~6 s. `[H]` — **medir isso com cronômetro em campo** e usar como linha de base oficial do produto.

### 8.4 Retenção

`[E-2]` Benchmarks públicos para apps de fintech/banking: D1 ~28–30%, D7 ~17,6–18%, D30 ~11,6–12%. Fonte: [41] https://mwm.ai/glossary/retention · [42] https://prooflytics.io/blog/d7-d30-retention-benchmarks-by-app-category

> ⚠️ **Esses números são de agregadores comerciais de mercado, não de estudo revisado por pares.** Use como ordem de grandeza, não como meta contratual.

**Meta proposta:** este app é de uso **diário obrigatório** (toda venda fiado passa por ele), então deve se comportar como app de hábito, não como app de fintech de consulta. Alvo: **D1 > 40%, D7 > 30%, D30 > 22%** `[H]`.

**Métrica melhor que retenção de abertura — retenção de comportamento:**
- **DAL — Dias Ativos com Lançamento** por lojista/semana. Meta: ≥ 4/7 `[H]`
- **Índice de paralelismo com o caderno** — pergunta única no app após 14 dias: *"Você ainda anota no caderno também?"*. É o indicador real de substituição. Meta: < 30% em D30 `[H]`

### 8.5 Métricas de saúde e confiança (as que previnem os riscos da seção 7)

| Métrica | Por que | Alerta |
|---|---|---|
| **Taxa de lançamento desfeito** (Desfazer em 8s) | Mede erro no fluxo mais crítico | > 3% → investigar polaridade/rótulos [33] |
| **Taxa de edição/estorno posterior** | Mede erro não percebido na hora | > 8% |
| **Lançamentos com data retroativa** | Valida a necessidade documentada [32][35] | se > 15%, o chip "ontem" precisa ser mais proeminente |
| **% de sessões offline** | Dimensiona o problema real de rede | rastrear por região |
| **Tempo até sync** (p90) | | > 24h em massa = problema de infra |
| **Falhas de sync não resolvidas** | | **> 0,1% é incidente** |
| **Divergência de saldo entre aparelhos** | | **Deve ser 0. Qualquer ocorrência é P0** |
| **Crash-free sessions** | BukuWarung morreu disso [24] | **> 99,5%** |
| **Cold start em Android Go** | NBU [11] | **< 2 s até tela útil** |
| **Tamanho do APK** | 250MB/mês de dados [11] | **< 15 MB** |

### 8.6 Métricas do fluxo de cobrança (as mais delicadas)

| Métrica | Meta | Cuidado |
|---|---|---|
| % de lembretes **editados** antes de enviar | Alta é **bom** (30–50%) `[H]` | Se ~0%, os templates estão bons **ou** o campo não parece editável — testar |
| Tempo entre gerar o lembrete e o pagamento | mediana < 5 dias | mede eficácia real |
| **% de lembretes gerados mas NÃO enviados** | Rastrear | é o sinal mais honesto de desconforto do lojista com o tom |
| **Churn de freguês após lembrete** (cliente para de comprar) | **< 5%** `[H]` | ⚠️ **Esta é a métrica de guarda do produto.** Se subir, o tom está agressivo demais e está destruindo relações — exatamente o risco descrito em [4][5]. |
| NPS/pergunta única: *"O recadinho ficou do jeito que você falaria?"* | > 80% sim | |

### 8.7 O que NÃO medir como sucesso

- ❌ **Tempo de sessão** — quanto menor, melhor. Este app é uma ferramenta de 8 segundos.
- ❌ **Telas por sessão** — mais telas = fluxo pior.
- ❌ **Número de clientes cadastrados** — a carteira real tem 8–15 pessoas [3][4]. Cadastro em massa é sinal de que alguém importou a agenda inteira, não de que está usando.
- ❌ **Taxa de recuperação de dívida** — não é a métrica do lojista. A métrica dele é *"não perdi o controle e não perdi o freguês"*.

---

## Resumo executivo em 10 linhas

1. O concorrente é o **caderno** (50% dos MEIs) e a **não-anotação** (~1/3), não outro app `[E]`.
2. A carteira real é de **8 a 15 devedores**, sem juros, com vencimento colado no dia do salário `[E]`.
3. **Perda de dados** é a causa nº1 de desinstalação em BR, Índia e Indonésia — é risco existencial, não bug `[E]`.
4. **Cobrança automática é proibida** por três razões independentes: legal (art. 42 CDC), relacional (o lojista prefere perder R$ 100) e de negócio `[E]`.
5. O lojista **já manda print no WhatsApp** — o produto só precisa formalizar isso `[E]`.
6. O cliente final **não instala nada**: link público, sem login. O modelo de dois lados falhou no Khatabook `[E]`.
7. Interface **densa e colorida**, não branca e minimalista — é achado de campo do Google NBU `[E]`.
8. **Nada obrigatório além do nome** no cadastro: sem CPF, sem e-mail, sem endereço `[E]`.
9. O fluxo de lançar fiado tem que caber em **3 toques e 8 segundos** ou perde para a caneta `[H]`.
10. **Faça pesquisa de campo.** Faltam etnografias brasileiras publicadas sobre fiado em mercadinho, dados de conectividade dentro da loja, e validação do vocabulário ("na rua", "freguês", apelidos) — as três lacunas `[NE]` deste relatório.

---

## Fontes

1. Banco Central do Brasil / Sebrae — *Educação Financeira dos Microempreendedores Individuais* (Relatório de Cidadania Financeira; pesquisa Sebrae 2018, n=1.000 MEIs) — https://www.bcb.gov.br/Nor/relcidfin/docs/art9_educacao_finanaceira_MEIs.pdf ✅ *lido na íntegra*
2. Diário do Comércio — *A velha caderneta do fiado está de volta* (dados Kantar Worldpanel) — https://dcomercio.com.br/publicacao/s/a-velha-caderneta-do-fiado-esta-de-volta ⚠️ *via busca; relatório Kantar original não acessado*
3. Diário do Nordeste — *Vender 'fiado' está cada vez mais raro nos mercadinhos de Fortaleza* — https://diariodonordeste.verdesmares.com.br/negocios/vender-fiado-esta-cada-vez-mais-raro-nos-mercadinhos-de-fortaleza-era-muito-prejuizo-1.3265741 ✅
4. Brasil de Fato — *Crise econômica aumenta venda de "fiado" nas periferias* — https://www.brasildefato.com.br/2022/07/08/crise-economica-aumenta-venda-de-fiado-nas-periferias/ ✅
5. RecargaPay Blog — *Chega de calote: como cobrar clientes sem perder a amizade* — https://blog.recargapay.com.br/chega-de-calote-como-cobrar-clientes-sem-perder-a-amizade/ ⚠️ *conteúdo de marca*
6. Nubank Blog — *Fiado: o problema de vender para receber o pagamento depois* — https://blog.nubank.com.br/vender-fiado/ ⚠️ *conteúdo de marca*
7. Planalto — Lei 8.078/1990 (CDC), **art. 42** — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm ✅
8. TJDFT — *Cobrança Abusiva* (Direito Fácil) — https://www.tjdft.jus.br/institucional/imprensa/campanhas-e-produtos/direito-facil/edicao-semanal/cobranca-abusiva ✅
9. ACV — *Meet BukuWarung, the bookkeeping app built for Indonesia's 60 million micromerchants* — https://acv.vc/insights/acv-portfolio-news/meet-bukuwarung-the-bookkeeping-app-built-for-indonesias-60-million-micromerchants/ ✅
10. Cora — *Como cobrar por WhatsApp: dicas e modelos para empresas* — https://www.cora.com.br/blog/como-cobrar-por-whatsapp/ ⚠️ *conteúdo de marca*
11. **Google Design — *Connectivity, Culture and Credit* (UX Design for Next Billion Users)** — https://design.google/library/connectivity-culture-and-credit ✅ *lido na íntegra*
12. **Nielsen Norman Group — *Writing for Lower-Literacy Users*** — https://www.nngroup.com/articles/writing-for-lower-literacy-users/ ✅ *lido na íntegra*
13. ACM TOCHI — *Actionable UI Design Guidelines for Smartphone Applications Inclusive of Low-Literate Users* (framework SARAL) — https://dl.acm.org/doi/10.1145/3449210 ⚠️ *paywall (HTTP 403); só abstract*
14. ACM — *Interface design guidelines for low literature users: a literature review* — https://dl.acm.org/doi/10.1145/3578837.3578842 ⚠️ *só abstract*
15. Medhi-Thies et al. — *User Interface Design for Low-literate and Novice Users: Past, Present and Future* — https://dl.acm.org/doi/abs/10.1561/1100000047 ⚠️ *só abstract*
16. Nielsen Norman Group — *Confirmation Dialogs Can Prevent User Errors* — https://www.nngroup.com/articles/confirmation-dialog/ ✅
17. Nielsen Norman Group — *Preventing User Errors: Avoiding Conscious Mistakes* — https://www.nngroup.com/articles/user-mistakes/ ✅
18. **web.dev (Google) — *Offline UX design guidelines*** — https://web.dev/articles/offline-ux-design-guidelines ✅ *lido na íntegra*
19. Android Accessibility Help — *Touch target size* — https://support.google.com/accessibility/android/answer/7101858 ✅
20. Material Design — *Accessibility / Usability* — https://m1.material.io/usability/accessibility.html ✅
21. WCAG.com — *2.5.8 Target Size (Minimum) — Level AA* — https://www.wcag.com/developers/2-5-8-target-size-minimum-level-aa/ ✅
22. **W3C WAI — *Understanding SC 1.4.3: Contrast (Minimum)*** — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ✅
23. GSMArena Lab Tests — *Display tests: contrast and sunlight legibility* — https://www.gsmarena.com/gsmarena_lab_tests-review-751p2.php ✅
24. **Google Play — BukuWarung** (reviews coletados 04/09/2026, ~120 mais recentes, en/ID) — https://play.google.com/store/apps/details?id=com.bukuwarung ✅ *coleta primária*
25. Cetic.br / NIC.br — *TIC Domicílios 2024 — Principais Resultados* — https://cetic.br/media/analises/tic_domicilios_2024_principais_resultados.pdf ✅
26. Cetic.br — *TIC Domicílios 2024 — Resumo Executivo* — https://www.cetic.br/media/docs/publicacoes/2/20250512115624/tic_domicilios_2024_resumo_executivo.pdf ✅
27. NIC.br — *Acesso à Internet em residências urbanas salta de 13% para 85% em 20 anos* — https://nic.br/noticia/na-midia/acesso-a-internet-em-residencias-de-areas-urbanas-brasileiras-salta-de-13-para-85-em-20-anos-aponta-pesquisa-tic-domicilios-2024/ ✅
28. **Agência Sebrae — *WhatsApp se consolida nas vendas on-line*** (12ª Pesquisa Pulso dos Pequenos Negócios, n=8.200, fev–mar/2026) — https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/ ✅
29. O Tempo — *60% das pequenas empresas têm o Pix como principal meio de pagamento* (Sebrae/Ipespe) — https://www.otempo.com.br/economia/2026/6/4/60-das-pequenas-empresas-no-brasil-tem-o-pix-como-principal-meio-de-pagamento-diz-sebrae ⚠️ *jornalística; relatório Sebrae/Ipespe original não acessado*
30. Google Open Health Stack — *Design Guidelines for Offline & Sync* — https://developers.google.com/open-health-stack/design/offline-sync-guideline ✅
31. Google Cloud — *BukuWarung Case Study* — https://cloud.google.com/customers/bukuwarung ✅
32. **Google Play — "Controle de vendas: Meu fiado"** (120 reviews mais recentes, pt-BR, coletados 04/09/2026) — https://play.google.com/store/apps/details?id=com.masterapps.controledevendas ✅ *coleta primária*
33. **Google Play — "Fiado - Controle de Vendas"** (reviews pt-BR, coletados 04/09/2026) — https://play.google.com/store/apps/details?id=br.com.mobiletkbrazil.fiado ✅ *coleta primária*
34. Google Play — "Caderno de Fiado" — https://play.google.com/store/apps/details?id=com.ilgnergames.cadernodefiado ⚠️ *amostra de reviews pequena demais*
35. **Google Play — Khatabook** (120 reviews mais recentes, en/IN, coletados 04/09/2026) — https://play.google.com/store/apps/details?id=com.vaibhavkalpe.android.khatabook ✅ *coleta primária*
36. **Google Play — OkCredit** (120 reviews mais recentes, en/IN, coletados 04/09/2026) — https://play.google.com/store/apps/details?id=in.okcredit.merchant ✅ *coleta primária*
37. Baymard Institute — *Conversion: Reducing Sign Up Friction* — https://baymard.com/blog/fast-and-easy-user-sign-up ⚠️ *relatório completo atrás de paywall*
38. Sebrae — *O que é LGPD e a flexibilização para os pequenos negócios* — https://sebrae.com.br/sites/PortalSebrae/artigos/o-que-e-lgpd-e-a-flexibilizacao-para-os-pequenos-negocios,a4d326df5c136810VgnVCM1000001b00320aRCRD ✅
39. Wikipédia — *Pindura / Fiado* (etimologia de "pendura") — https://pt.wikipedia.org/wiki/Pindura ⚠️ *fonte terciária*
40. Prooflytics — *D7 and D30 Retention Benchmarks by App Category* — https://prooflytics.io/blog/d7-d30-retention-benchmarks-by-app-category ⚠️ *benchmark comercial*
41. MWM — *Retention (D1/D7/D30) — Mobile App Retention Benchmarks* — https://mwm.ai/glossary/retention ⚠️ *benchmark comercial*
42. Guaiaca/UFPel — *Comércio de bairro e sua metamorfose diante da dinâmica urbana* (dissertação) — https://guaiaca.ufpel.edu.br/handle/prefix/4777 ⚠️ *listado como leitura futura; não acessado*
43. Iberoamericana — *Entre Cuidado e Exploração: Quando a Dívida Entra nas Relações* — https://iberoamericana.se/en/articles/10.16993/iberoamericana.560 ❌ *não acessado (timeout duplo); nenhuma afirmação deste relatório se apoia nele*

---

### Lacunas assumidas (`[NE]`) — o que pesquisar a seguir

1. **Etnografia brasileira acadêmica do fiado em mercadinho** — não existe publicada e acessível. Recomendo 8–12 visitas de campo (observação de balcão + entrevista) em 2 regiões distintas.
2. **Conectividade dentro da loja** — nenhum dado. Medir com app de teste em 20 lojas: sinal no balcão, no estoque, na câmara fria.
3. **Vocabulário regional do fiado** — nenhum levantamento dialetológico encontrado. Testar "na rua", "freguês", "pendura", "quitar", "recadinho" com 30 lojistas em 3 regiões antes de congelar a UI.
4. **Divisão de papéis dono × balconista** — hipótese não validada; define toda a arquitetura de permissões.
5. **Recepção do cliente devedor ao link público** — o maior risco não testado. Testar com 8–10 devedores reais antes do lançamento.
