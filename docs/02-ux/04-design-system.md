# Design system

> Especificação de tokens e componentes. Decorre dos [princípios de design](01-principios-de-design.md).
>
> Este documento existe para que a implementação não precise reinterpretar a pesquisa a cada tela.

## Fundamento em uma frase

> **Denso, colorido, número grande, botão gordo, zero fonte web.**

Não é preferência estética. Cada item vem de restrição de campo: espaço em branco foi rejeitado pelo público-alvo; contraste de 300:1 vira menos de 2:1 ao sol; e uma fonte web em 4G ruim é FOIT garantido sem nenhum ganho num app utilitário.

---

## Tipografia

**Font stack do sistema. Orçamento de fonte web: 0 KB.**

```css
--fonte: system-ui, -apple-system, "Segoe UI", Roboto,
         "Helvetica Neue", Arial, sans-serif;
--fonte-num: ui-monospace, "SF Mono", "Roboto Mono", monospace;
```

`--fonte-num` só para colunas de valores em extratos, onde o alinhamento de dígitos ajuda a conferência.

| Papel | Tamanho | Peso | Uso |
|---|---|---|---|
| **Herói** | 44sp | 800 | "Tá na rua", saldo do cliente |
| **Confirmação** | 48sp | 800 | Saldo novo na tela de "Anotado!" |
| Título | 24sp | 700 | Título de tela |
| Valor em lista | 20sp | 700 | Valor por cliente |
| Corpo | 16sp | 400 | Texto padrão. **Nunca menor que 16sp** |
| Apoio | 14sp | 400 | "Atrasou 6 dias", legendas |
| Mínimo absoluto | 12sp | 600 | Só em badge, e sempre com peso alto |

**Regra:** o layout precisa sobreviver à fonte do sistema em **130% e 200%**.

---

## Cores

Significado fixo, **sempre redundante com ícone e palavra**. Todas as combinações abaixo atingem no mínimo 4,5:1; os pares de status atingem 7:1.

```css
:root {
  /* Tinta e fundo — preto real sobre branco real, por causa do sol */
  --tinta:        #111111;   /* texto principal */
  --tinta-fraca:  #4A4A4A;   /* apoio. NUNCA usar cinza mais claro que isto */
  --fundo:        #FFFFFF;
  --fundo-tela:   #F4F4F5;
  --borda:        #D4D4D8;

  /* Status */
  --atrasado:     #C62828;   /* vermelho  · 🔴 · "Atrasou X dias" */
  --atrasado-bg:  #FFEBEE;
  --atencao:      #B45309;   /* âmbar     · 🟡 · "Vence dia 5"    */
  --atencao-bg:   #FFF8E1;
  --pago:         #1B5E20;   /* verde     · 🟢 · "Quitado"        */
  --pago-bg:      #E8F5E9;
  --neutro:       #52525B;   /* cinza     · ⚪ · "Em dia"          */

  /* Ações — cores distintas para eliminar erro de polaridade */
  --fiado:        #C62828;   /* ANOTAR FIADO — sai dinheiro   */
  --receber:      #1B5E20;   /* RECEBI       — entra dinheiro */
  --marca:        #0B5FFF;   /* links, foco, seleção          */
}
```

### Regras de cor

1. **Cor nunca sozinha.** Sempre cor + ícone + palavra.
2. **Nunca cinza claro sobre branco.** `--tinta-fraca` é o limite.
3. **Nunca texto sobre foto.**
4. **Tema escuro não é o padrão** — piora a legibilidade ao sol.
5. `--fiado` e `--receber` são cores **opostas e inconfundíveis**, porque a confusão débito/crédito é erro documentado que custa dinheiro real.

---

## Espaçamento e alvos

Escala de 4: `4 · 8 · 12 · 16 · 24 · 32 · 48`.

| Elemento | Altura mínima |
|---|---|
| Qualquer alvo tocável | **48 dp** |
| Botão primário ("ANOTAR FIADO", "RECEBI") | **64 dp** |
| Botão secundário | 56 dp |
| Linha de cliente na lista | 64 dp |
| Tecla do teclado numérico | 56 dp |

**Regra inviolável:** todo botão primário fica na **metade inferior** da tela e **acima do inset da barra de navegação do sistema**, com o teclado aberto. Ver a matriz de QA em [qualidade](../04-arquitetura/07-qualidade-e-observabilidade.md).

---

## Componentes

### `<NumeroHeroi>`
O saldo. 44sp/800, com rótulo acima em 14sp maiúsculo espaçado (`NA RUA`) e contexto abaixo em 14sp (`12 pessoas · 3 atrasadas`).

### `<LinhaCliente>`
```
🔴  Dona Maria                    R$ 240,00
    Atrasou 6 dias                [ Lembrar ]
```
64 dp. Semáforo à esquerda (cor + emoji), nome, valor à direita em 20sp/700, status em 14sp, ação inline quando aplicável.

### `<TecladoValor>`
Teclado numérico próprio, não o do sistema — garante controle de layout e evita o bug de sobreposição. Teclas de 56 dp. Vírgula, zero e backspace na última linha. **O botão de salvar fica acima do teclado, sempre visível.**

### `<BarraDesfazer>`
Barra inferior, 8 segundos, com contagem visível. Substitui todo diálogo de confirmação em ação rotineira.

### `<PilulaConexao>`
Pílula discreta no topo, âmbar, texto em uma linha. **Nunca vermelha, nunca modal, nunca bloqueia.**

### `<TelaConfirmacao>`
Fundo `--pago-bg`, ✓ grande, "Anotado!", saldo novo em 48sp, e duas ações: `[Desfazer]` e `[Anotar outro]`. Auto-dismiss em 2,5 s. Vibração curta.

### `<SeletorTom>`
Três opções de rádio para o lembrete, com o texto resultante **num campo editável de verdade** logo abaixo, e a promessa `Você que manda` fixada no rodapé.

---

## Orçamento de performance

Requisito de design, não só de engenharia:

| Item | Orçamento |
|---|---|
| JS na primeira carga | **≤ 170 KB** comprimido |
| JS total | ≤ 300 KB comprimido |
| Conteúdo total | ≤ 600 KB |
| **Fonte web** | **0 KB** |
| INP (p75) | **≤ 200 ms** |
| LCP (p75, mobile) | ≤ 2,5 s |
| CLS | ≤ 0,1 |
| Primeira tela útil em Android Go | **< 2 s** |

Consequências de design: sem biblioteca de ícones completa (só os SVGs usados, inline), sem biblioteca de animação, sem biblioteca de gráficos, sem framework de componentes pesado. Tailwind CSS 4 com purge agressivo.

---

## Checklist de aceite visual

Nenhuma tela entra sem passar por todos:

- [ ] Coluna única, sem rolagem na tarefa principal em tela de 5"
- [ ] Todo ícone tem rótulo em palavra
- [ ] Todo status tem cor **+** ícone **+** palavra
- [ ] Nenhum `+` ou `−` como significante de débito/crédito
- [ ] Botão primário ≥ 56 dp, na metade inferior
- [ ] Testado com barra de navegação por **3 botões** e teclado aberto
- [ ] Testado com fonte do sistema em 130% e 200%
- [ ] Contraste ≥ 4,5:1 (≥ 7:1 nos números e status)
- [ ] Nenhum cinza mais claro que `--tinta-fraca` sobre branco
- [ ] Ação reversível tem Desfazer; nenhuma confirmação modal em ação rotineira
- [ ] Item salvo offline é **visualmente idêntico** ao item online
- [ ] Nenhum jargão financeiro na tela
- [ ] Nenhuma interrupção (anúncio, paywall, avaliação, update) no caminho de anotar ou receber
