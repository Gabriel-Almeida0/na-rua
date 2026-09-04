# Princípios de design

> Derivado da [pesquisa de UX](00-pesquisa-ux.md). Cada princípio traz a fonte que o sustenta. Princípio sem fonte é preferência, e preferência não entra aqui.

## O contexto que define tudo

O usuário está **em pé, atrás do balcão, com um cliente esperando**, num Android de entrada, com sinal ruim, possivelmente ao sol, possivelmente com uma mão segurando sacola. Ele tem 35 a 60 anos, escolaridade formal menor que a média e **77% de chance de nunca ter feito um curso de gestão**.

Ele não vai aprender o app. Ele vai desistir e voltar pro caderno.

---

## P1 · Uma tarefa por tela, coluna única

Usuários de baixo letramento **não escaneiam** — eles "aram" o texto linha por linha, têm campo de visão estreito e perdem elementos fora do fluxo principal.

**Regra:** nunca duas colunas. Nunca abas dentro de uma tela de tarefa. Navegação linear.

*Fonte: Nielsen Norman Group, "Writing for Lower-Literacy Users".*

---

## P2 · Densidade acima de respiro

⚠️ **Este princípio contradiz o instinto de designer.**

A pesquisa de campo do Google Next Billion Users encontrou que os usuários **rejeitaram muito espaço em branco e cores apagadas**. Interfaces densas e vibrantes ressoaram melhor.

**Regra:** blocos coloridos sólidos, cartões cheios, números grandes. **Não imitar app de banco premium branco e minimalista.**

*Fonte: Google Design, "Connectivity, Culture and Credit".*

---

## P3 · O número é o herói

O saldo é a informação. Tudo o mais é legenda.

**Regra:** valor em pelo menos **40sp, peso bold, na primeira dobra**. Texto explicativo abaixo, menor. O lojista precisa ler de longe, sem óculos, no meio do movimento.

---

## P4 · Ícone nunca vem sozinho

O público não compartilha nosso vocabulário de ícones. Um ícone de "seta pra baixo" não significa nada universal.

**Regra:** todo ícone acompanhado de rótulo em palavra.

**Corolário crítico — nunca usar `+` e `−` como significantes.** Erro real de um concorrente, relatado por usuária:
> *"Achei um pouco confuso que quando é pra adicionar débitos tem o +, mas se entra no nome do cliente lá o + quer dizer valor pago... Me confundi e acabei colocando valor positivo quando era negativo"*

Num app de dívida, erro de polaridade é dinheiro errado. Use palavras: **"Anotar fiado"** (vermelho) versus **"Recebi"** (verde), com ícones distintos.

---

## P5 · Zero digitação de texto sempre que possível

| Campo | Como se preenche |
|---|---|
| Valor | Teclado numérico, foco automático |
| Cliente | Lista tocável, 5 mais recentes no topo |
| Data | Chips: "hoje", "ontem" |
| Descrição | **Opcional e colapsada** |
| Nome | Só no cadastro, uma vez |

*Fonte: Google NBU, princípio de minimizar entrada de texto.*

---

## P6 · Cor com significado fixo, sempre redundante

| Cor | Significado |
|---|---|
| 🟢 Verde | Pago, quitado, em dia |
| 🔴 Vermelho | Atrasado |
| ⚪ Cinza | Em dia, sem urgência |
| 🟡 Amarelo | Atenção, vence em breve |

**Regra:** cor **nunca sozinha**. Sempre acompanhada de ícone **e** palavra ("Atrasou 6 dias"). Só cor exclui quem tem baixa visão — e desaparece ao sol.

*Fonte: web.dev, "Offline UX design guidelines" — comunicar por múltiplos canais juntos.*

---

## P7 · Nada é irreversível sem desfazer

Diálogo de confirmação só antes de ação com consequência séria e **irreversível**. Confirmação em ação rotineira treina o usuário a ignorar: *"se você gritar 'lobo' vezes demais, as pessoas param de prestar atenção"*.

**Regra:**
- Lançar fiado, receber pagamento → **sem modal**. Barra **"Desfazer"** por 8 segundos.
- **A única confirmação modal do app** é apagar cliente com saldo em aberto.
- Todo lançamento é editável e estornável **para sempre**.

*Fonte: NN/g, "Confirmation Dialogs Can Prevent User Errors" e "Preventing User Errors".*

---

## P8 · A tarefa principal não rola

"Anotar fiado" cabe numa tela de 5 polegadas sem scroll. Rolagem faz o usuário de baixo letramento perder o lugar visual.

---

## P9 · Confirmação física e óbvia

Depois de salvar: tela verde, o **saldo novo em letra enorme**, vibração curta. O lojista precisa **ver de longe** que gravou, sem ler.

`[H]` Derivado dos princípios de NN/g e NBU — **validar em teste de balcão.**

---

## P10 · Sem jargão financeiro

Ver [glossário](../00-visao/04-glossario.md). Nunca "inadimplente", "saldo devedor", "recebíveis", "régua de cobrança", "amortização".

---

## P11 · O item offline é idêntico ao item online

**Regra:** um lançamento salvo sem internet **nunca** aparece acinzentado, "pendente" ou visualmente diferente na lista.

**Por quê:** marcar o item como incerto ensina o lojista a desconfiar do app — e desconfiança significa manter o caderno em paralelo, que é a morte da adoção.

> A pílula discreta no topo comunica o estado da **conexão**. O **lançamento** está salvo e é tratado como salvo.

*Fonte: web.dev — não bloqueie a interface, enfileire as tarefas, use linguagem de ação e não jargão.*

---

## P12 · Nada interrompe o balcão

**Nunca**, durante "anotar fiado" ou "receber": anúncio, paywall, pedido de avaliação, prompt de atualização, tour, pesquisa de satisfação.

Evidência do que acontece quando se ignora isso:
> *"Propaganda a cada lançamento"* · *"mal cadastrei, não consegui sequer pôr a primeira cliente, 3 anúncios seguidos"* · *"it kinda blocks you post login and you'll not be able to see any transactions"*

**No Na Rua não há anúncio em plano nenhum.**

---

## Acessibilidade — requisitos numéricos

| Item | Requisito | Fonte |
|---|---|---|
| **Alvo de toque** | Mínimo **48×48 dp**. Botões primários ("Anotar fiado", "Recebi"): **56–64 dp** de altura | Material Design / Android Accessibility; satisfaz WCAG 2.5.8 AA e 2.5.5 AAA |
| **Contraste de texto** | **4,5:1** normal, 3:1 para texto grande. Nos números e status: mirar **7:1 (AAA)** | WCAG 2.2 SC 1.4.3 |
| **Legibilidade ao sol** | Preto sobre branco, nunca cinza claro. Pesos bold. Sem texto sobre foto | Sob sol forte, um LCD de 200 nits com 300:1 no escuro cai para **menos de 2:1** |
| **Uma mão** | Ações primárias na **metade inferior** da tela. Nada crítico no topo | Padrão de plataforma |
| **Fonte grande do sistema** | Layout sobrevive a 130% e 200% | `[H]` derivado do perfil etário |
| **Aparelho fraco** | Primeira tela útil em **< 2 s** em Android Go. Lista virtualizada, sem animação pesada, sem splash | Google NBU |
| **Tela pequena** | Testar em 5" / 720p **com a barra de navegação por 3 botões ligada** | Bug real que quebrou a BukuWarung |

### A regra de QA que vale mais que todas

> **Nenhum botão primário e nenhum teclado numérico podem ficar abaixo do inset da barra de navegação do sistema, com o teclado aberto, em nenhuma combinação de aparelho.**

Matriz obrigatória: Android 8→15 × barra de gestos **e** barra de 3 botões × 5" e 6,7" × fonte 100%/130%/200% × teclado aberto.

---

## Os anti-padrões

| ❌ Não faça | Por quê |
|---|---|
| Tela branca minimalista com muito respiro | Rejeitada em campo pelo público-alvo |
| Ícone sem rótulo | Vocabulário de ícones não é compartilhado |
| `+` / `−` como significante de débito/crédito | Erro de polaridade documentado = dinheiro errado |
| Cinza claro sobre branco | Desaparece ao sol |
| Gráfico, donut, aging de recebíveis | Não é ERP. O lojista não pergunta isso |
| Confirmação modal em ação rotineira | Treina o usuário a ignorar avisos |
| Item offline acinzentado | Ensina desconfiança no app |
| Chamada de rede bloqueando a tela inicial | *"o app só abre se desligar a internet"* — bug real |
| Login obrigatório para ler os próprios dados | Perder o login não pode significar perder o caderno |
| Fonte web | 0 KB é o orçamento. FOIT em 4G ruim, sem ganho num app utilitário |
