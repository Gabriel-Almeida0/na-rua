# Fluxos críticos — especificação

> Especificação normativa. Wireframes e fundamentação em [pesquisa de UX](00-pesquisa-ux.md); princípios em [princípios de design](01-principios-de-design.md).
>
> Cada fluxo tem **critério de aceite mensurável**. Fluxo sem critério não é implementado.

## Tela base

```
┌──────────────────────────────────┐
│  Mercadinho da Marlene      ⚙    │  topo: identidade + config
├──────────────────────────────────┤  (nenhuma ação crítica aqui)
│                                  │
│   NA RUA                         │
│   R$ 1.847,50                    │  ← número herói, 44sp bold, ≥7:1
│   12 pessoas · 3 atrasadas       │
│                                  │
├──────────────────────────────────┤
│  [ Todos ]  [ Atrasados 3 ]      │  ← 2 filtros. Só isso.
├──────────────────────────────────┤
│  🔴 Dona Maria       R$ 240,00   │
│     Atrasou 6 dias    [ Lembrar ]│  ← ação inline
│  🔴 Seu Antônio      R$ 180,00   │
│     Atrasou 2 dias    [ Lembrar ]│
│  🟡 Seu João          R$ 85,00   │
│     Vence dia 5                  │
│  ⚪ Cleide            R$ 32,00   │
│     Em dia                       │
├──────────────────────────────────┤
│  [    ➕  ANOTAR FIADO      ]    │  ← 64dp, metade inferior
└──────────────────────────────────┘
```

**Ordenação da lista:** atrasados primeiro (maior atraso no topo), depois por valor. A–Z fica disponível na engrenagem — é pedido real de usuários, mas não pode ser o padrão.

---

## F1 · Anotar fiado — cliente existente ⭐ O FLUXO QUE DECIDE O PRODUTO

**Critério de aceite:** 3 toques · **< 8 s (p50)** · sem rolagem em tela de 5" · sem campo obrigatório além do valor.
**Referência a bater:** escrever "Maria — 18,50" no caderno leva **~6 segundos**.

```
[➕ ANOTAR FIADO]        🔍 Buscar…              Dona Maria
       │                 ┌──────────────┐        deve R$ 240,00
       │ T1              │ Dona Maria   │ T2     ┌──────────────┐
       └────────────────►│ Seu João     │───────►│   R$ 18,50   │
                         │ Cleide       │        └──────────────┘
                         │ …            │        [1][2][3]
                         └──────────────┘        [4][5][6]
                         [+ Cliente novo]        [7][8][9]
                         ↑ 5 recentes no topo    [,][0][⌫]
                                                 ▸ o que levou? (opcional)
                                                 [  ✓ ANOTAR  ] T3
                                                        │
                                                        ▼
                                            ┌──────────────────────┐
                                            │        ✓ verde       │
                                            │      Anotado!        │
                                            │  Dona Maria agora    │
                                            │  deve R$ 258,50      │ 48sp
                                            │ [Desfazer] [+ outro] │ 8 s
                                            └──────────────────────┘
```

### Decisões e fundamento

| Decisão | Fundamento |
|---|---|
| Ordem **quem → quanto** | No balcão o lojista já sabe quem é antes de somar `[H]` validar |
| **5 mais recentes no topo** da lista | Carteira real tem 8–15 pessoas: cabe sem rolar. Resolve *"não consigo achar o cliente"* |
| Descrição **opcional e colapsada** | Campo obrigatório aqui mata o fluxo. E registrar itens pode criar dado sensível por inferência (ANPD) |
| Data = hoje, **chip "ontem" em 1 toque** | Reclamação transcultural: *"ontem fiz uma venda fiado e com a correria não anotei"* |
| **Sem confirmação modal** | Ação rotineira e reversível → Desfazer, não modal |
| Botão Salvar **acima** do teclado, respeitando insets | O bug que quebrou a BukuWarung |
| Foco automático no campo de valor, teclado numérico já aberto | Elimina um toque |

### Estados de erro

| Situação | Comportamento |
|---|---|
| Valor vazio | Botão desabilitado com rótulo `Digite o valor`. Sem alerta vermelho |
| Valor fora do padrão (> 10× o ticket médio do cliente) | Faixa amarela **que não bloqueia**: `R$ 1.850,00? Confere aí — a Dona Maria costuma levar uns R$ 20.` `[Tá certo]` `[Corrigir]` |
| Sem internet | Salva igual, com a **mesma** confirmação. Pílula no topo: `Sem internet — está tudo anotado aqui` |
| App fechou no meio | Rascunho recuperado: `Você tinha começado uma anotação da Dona Maria. Continuar?` |
| Toque duplo no salvar | **Impossível duplicar** — o ID do lançamento é gerado no cliente e o servidor faz `ON CONFLICT DO NOTHING` |

---

## F2 · Cadastrar cliente no meio da venda

**Critério de aceite:** nome + 1 toque. **Nada mais é obrigatório.** < 15 s adicionais.

```
┌──────────────────────────────────┐
│  Quem é o freguês?               │
│  ┌────────────────────────────┐  │
│  │ Maria da Padaria           │  │ ← ÚNICO campo obrigatório
│  └────────────────────────────┘  │
│                                  │
│  📱 WhatsApp (dá pra deixar      │
│     pra depois)                  │
│  ┌────────────────────────────┐  │ ← OPCIONAL, rotulado como tal
│  │ (  )                       │  │   [Pegar da agenda] 1 toque
│  └────────────────────────────┘  │
│  ☐ Ele autorizou receber         │ ← opt-in registrado com
│     lembretes no WhatsApp        │   data, hora e usuário
│                                  │
│  [   Pronto, anotar fiado   ]    │
└──────────────────────────────────┘
```

### Regras duras

- ❌ **Sem CPF.** Não é necessário para a finalidade — princípio da necessidade da LGPD (art. 6º, III). A ANPD já autuou o varejo por coleta excessiva de CPF.
- ❌ Sem e-mail, endereço, RG, data de nascimento, foto, local de trabalho, "contato de referência". Todos excessivos e vetores clássicos de cobrança vexatória.
- ❌ O cliente final **não cria conta e não confirma nada**.
- ✅ **Rotular o campo opcional com a palavra "opcional"**, em vez de asterisco no obrigatório.
- ✅ **Permitir apelido.** No bairro o cliente é "Maria da Padaria", "Seu Zé do 12". `[H]` decisão de nomenclatura mais arriscada do produto — validar em campo.
- ✅ Puxar da agenda com 1 toque, com justificativa em uma linha. **Jamais importar tudo automaticamente.**
- ✅ **Opt-in explícito registrado** (data, hora, usuário) — exigência da Meta e salvaguarda de transparência da LGPD.

**Erro de duplicidade:** `Você já tem uma "Maria". Essa é a mesma ou é outra pessoa?` `[É a mesma]` `[É outra Maria]`

---

## F3 · Receber pagamento

**Critério de aceite:** 3 toques para total · 4 + digitação para parcial · < 6 s.

Na ficha do cliente, duas ações lado a lado, 56 dp: **`💰 RECEBI`** e **`+ Fiado`**.

```
┌──────────────────────────────────┐
│  Quanto a Dona Maria te pagou?   │
│  ┌────────────────────────────┐  │
│  │        R$ 258,50           │  │ ← PRÉ-PREENCHIDO com o total
│  └────────────────────────────┘  │
│  [ Pagou tudo ] [ Pagou metade ] │ ← atalhos de 1 toque
│  Como pagou? (opcional)          │
│  [ 💵 Dinheiro ]  [ 📱 Pix ]     │
│  [       ✓ DAR BAIXA        ]    │
└──────────────────────────────────┘
```

**Quitação total → tela de celebração.** É o momento de deleite do produto:

```
            🎉
   Conta da Dona Maria
        QUITADA!
   Ela não te deve nada
 [ Mandar comprovante no zap ]
 [          Fechar          ]
```

**Parcial:** `✓ Recebido R$ 100,00` / `Ainda falta R$ 158,50` — nunca "saldo devedor".

| Situação | Comportamento |
|---|---|
| Pagou mais que devia | `Ela te pagou R$ 20,00 a mais. Quer deixar como crédito pra próxima?` `[Deixar de crédito]` `[Corrigir]` |
| Baixa errada | Desfazer por 8 s **e** item editável no histórico para sempre |
| Cliente já zerado | Botão vira `Sem conta aberta`, desabilitado — **não some**, para não confundir |

---

## F4 · Ver quem está devendo

**Critério de aceite: 0 toques.** É a tela inicial.

- Semáforo redundante: cor + ícone + palavra ("Atrasou 6 dias")
- **Apenas 2 filtros.** Cada opção a mais é uma linha que o usuário lê inteira ou ignora inteira
- ❌ Sem gráfico, sem donut, sem aging, sem percentual de inadimplência
- ❌ Nunca a palavra "inadimplentes"

---

## F5 · Cobrar sem constranger ⭐ O FLUXO MAIS DELICADO

**Critério de aceite:** 3 toques até o WhatsApp aberto com o texto pronto.

```
┌──────────────────────────────────┐
│  Mandar recadinho pra Dona Maria │
│  Escolha o jeito:                │
│   ● Bem de leve      ← DEFAULT   │
│   ○ Direto                       │
│   ○ Só o valor                   │
│  ┌────────────────────────────┐  │
│  │ Oi, Dona Maria! Tudo bem?  │  │ ← EDITÁVEL de verdade
│  │ Passando pra lembrar da    │  │
│  │ conta aqui do mercadinho,  │  │
│  │ tá em R$ 240,00. Quando    │  │
│  │ der, é só passar aqui 😊   │  │
│  │ Meu Pix: 11 98888-7777     │  │
│  └────────────────────────────┘  │
│  [    Abrir no WhatsApp     ]    │
│  ⓘ Você que manda. O app não     │
│    manda nada sozinho.           │ ← sempre visível
└──────────────────────────────────┘
```

### As 8 travas — não flexionáveis

| # | Trava | Fundamento |
|---|---|---|
| 1 | **"Enviar automaticamente" não existe**, nem escondido em configurações | CDC art. 42 e 71; destrói a relação; é a promessa central do produto |
| 2 | O app **abre** o WhatsApp com o texto; **o humano aperta enviar** | Mantém pessoa no loop, reduz drasticamente o risco de cobrança vexatória |
| 3 | **Sempre 1:1 para o telefone do devedor.** Sem grupo, sem lista de transmissão, sem cópia, sem terceiros | Jurisprudência consolidada de dano moral |
| 4 | Fora da janela **seg–sex 9–18h / sáb 9–13h**, o app avisa: `Tá tarde. Melhor mandar amanhã de manhã?` | CDC art. 71 ("interfira com trabalho, descanso ou lazer"); Lei SP 17.832/2023 art. 51 |
| 5 | **Máximo 1 lembrete sugerido por cliente por semana.** `Você já lembrou a Dona Maria há 2 dias. Quer mandar de novo mesmo?` | CDC art. 71 |
| 6 | Mensagem discrimina **valor originário / multa / juros / total** quando houver encargos, e traz nome, endereço e CNPJ/CPF do lojista | Lei SP 17.832 art. 49; **CDC art. 42-A** |
| 7 | Conta **contestada** suspende automaticamente qualquer sugestão de lembrete | **CDC art. 54-G** |
| 8 | **Nunca a palavra "cobrança" na interface.** É "lembrete", "recadinho", "avisar" | Tom de voz — ver [microcopy](03-microcopy.md) |

**Todo envio é registrado** (quando, para quem, qual tom, por qual usuário). É a prova de defesa do lojista — e nossa. Exigência do art. 37 da LGPD.

---

## F6 · Fechar o dia

**Critério de aceite: 1 toque.**

Três blocos: **Anotei fiado hoje** (vermelho suave) · **Recebi hoje** (verde) · **TÁ NA RUA** (número herói) + lista de atrasados.

**`[ Mandar resumo pro meu zap ]`** — subestimado e importante: é **backup percebido**. Reviews mostram terror de perda de dados e pedido literal de *"backup no próprio celular, não na nuvem"*. Mandar o resumo pro próprio WhatsApp dá ao lojista a mesma segurança psicológica do caderno físico.

❌ Sem margem, sem lucro, sem DRE, sem gráfico.

---

## F7 · Cliente consulta a própria conta

**Sem app. Sem cadastro. Sem login.**

O modelo de dois lados falhou no Khatabook — review real: *"If I am a customer of the nearby Kirana Store and owner makes an entry on my name, those entries are not getting synced in my login"*.

O lojista gera um link (`narua.app/c/<token aleatório>`) e manda no WhatsApp. O cliente abre no navegador:

```
Mercadinho da Marlene
Rua das Flores, 120 · CNPJ 00.000.000/0001-00

Oi, Dona Maria!
Sua conta está em
R$ 240,00                      ← 44sp

── O que você levou ──
04/09   R$ 18,50
03/09   R$ 42,00
05/08   pagou R$ 100,00 ✓

Pra pagar por Pix:
┌────────────────────┐
│  11 98888-7777     │
│  [ Copiar chave ]  │
└────────────────────┘
[ QR Code ]

Atualizado hoje às 14:32
```

### Regras de privacidade e dignidade

| Regra | Fundamento |
|---|---|
| Só o próprio saldo. **Nunca** lista de outros devedores | Expor dívida a terceiros é prática abusiva |
| Token aleatório longo — **não** o telefone, não ID sequencial | Evita enumeração |
| Link **expira** (30 dias) e pode ser revogado | Minimização, LGPD |
| Identificação completa do credor na página | **CDC art. 42-A** |
| **Nenhuma palavra de cobrança**: "sua conta", nunca "sua dívida" nem "em atraso" | CDC art. 42 |
| Sem vermelho pulsante, sem contador de dias de atraso | O objetivo é informar, não pressionar |
| Página **< 50 KB**, funciona em 2G/3G | 69% da classe DE em pré-pago com pacote limitado |

`[H]` **Maior risco não testado do produto.** Validar com 8–10 devedores reais antes do lançamento.

---

## F8 · Migração de aparelho

Não é suporte. É **fluxo de produto de primeira classe**, com tela própria, porque é a causa nº 1 de perda de dados e de desinstalação.

**Critério de aceite:** o lojista consegue restaurar tudo num aparelho novo **sem abrir ticket** e **sem lembrar de senha**.

- Recuperação por **número de telefone**, não por senha esquecida (múltiplas reviews relatam perda de acesso exatamente por aí)
- Trocar o número é **autoatendimento**. Na BukuWarung isso levava 2 semanas de suporte
- **Perder o login nunca pode significar perder o caderno:** o app lê os dados locais mesmo sem autenticação
- Antes de qualquer migração de schema: snapshot local automático

---

## Estados de sincronização — o que mostrar

| Estado | Mostrar | **Nunca** mostrar |
|---|---|---|
| Offline, tudo gravado | Pílula discreta: `Sem internet — está tudo anotado aqui` | Ícone vermelho de erro · "Falha ao conectar" · modal |
| Salvando offline | Confirmação **idêntica** à online: tela verde, saldo novo | Spinner · "Pendente" · item cinza na lista |
| Voltou a rede | Toast de 2 s: `Tudo salvo na nuvem ✓` | Barra de progresso persistente |
| Sem sync há > 48 h | Faixa amarela informativa: `Faz 2 dias que não conecta. Suas anotações estão salvas no celular.` | "Risco de perda de dados" |
| Dois aparelhos divergiram | **Nada.** Os dois lançamentos entram e somam | Diálogo "Resolver conflito" |

O último caso não é escolha de UX — é consequência do [ledger append-only](../04-arquitetura/03-ledger-e-integridade.md). Conflito de saldo **não existe por construção**.
