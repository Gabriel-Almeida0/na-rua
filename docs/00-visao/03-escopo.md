# Escopo e não-escopo

> Documento de visão · Ver também [features e priorização](../03-produto/01-features-e-priorizacao.md).

## Princípio de corte

O produto tem **uma pergunta de aceitação** para qualquer feature nova:

> Isso ajuda o lojista a **não perder o dado**, a **anotar mais rápido que a caneta**, ou a **receber sem brigar**?

Se a resposta for não, fica fora. Sem exceção, e não importa quão barato pareça.

## MVP — o escopo mínimo defensável

| # | Capacidade | Justificativa |
|---|---|---|
| 1 | Anotar fiado para cliente existente em **3 toques / < 8 s** | É o fluxo mais usado. A referência a bater é 6 s de caneta no caderno |
| 2 | Cadastrar cliente no meio da venda com **só o nome obrigatório** | Cada campo extra é um ponto de abandono. Sem CPF, sem e-mail, sem endereço |
| 3 | Receber pagamento total e parcial, com **tela de quitação comemorativa** | Fecha o loop de valor e é o momento de deleite do produto |
| 4 | **Funcionar 100% offline**, com a mesma confirmação visual do modo online | Conectividade instável é a regra, não a exceção |
| 5 | Sincronizar em segundo plano sem nunca perder lançamento | Ledger append-only + IDs idempotentes gerados no cliente |
| 6 | Tela inicial responde **"quanto tá na rua"** e **"quem tá atrasado"** em 0 toques | É a pergunta nº 1 do lojista e a lacuna nº 1 dos concorrentes |
| 7 | Vencimento por **dia do mês / quinzena**, não date picker | O prazo real é colado no dia do salário do cliente |
| 8 | **Lembrete pronto no WhatsApp** em 3 tons, editável, com Pix e valor exato | Via `wa.me`: custo zero, risco zero, humano no loop |
| 9 | **Link público** para o cliente ver a própria conta, sem app e sem login | Modelo de dois lados falhou no Khatabook |
| 10 | Editar e estornar qualquer lançamento, **para sempre** | "Não consigo corrigir" é reclamação recorrente nos 3 países |
| 11 | Lançar com **data retroativa em 1 toque** ("ontem") | Reclamação transcultural: o lojista esquece de anotar na correria |
| 12 | Backup em nuvem + **exportação local** (arquivo + resumo no próprio WhatsApp) | A objeção nº 1 à migração do papel |
| 13 | Migração de aparelho como fluxo guiado | Causa nº 1 de perda de dados e de desinstalação |
| 14 | Papéis **dono / gerente / balconista** com permissões distintas | O balconista lança no balcão, mas não vê o caixa nem apaga histórico |
| 15 | Estado **"conta contestada"** que suspende lembretes | CDC art. 54-G. Não é gentileza, é obrigação |

## Fase 2 — depois de validado o MVP

- **Comprovante digital de fiado com aceite do cliente** (assinatura no celular do lojista ou aceite por link). Transforma o fiado em obrigação documentada e habilita a cobrança de encargos.
- **Score interno de comportamento** por cliente, construído do próprio histórico da loja.
- **Limite de crédito definido pelo lojista** com aviso no momento da venda — que avisa, nunca bloqueia.
- **Cobrança formal**: notificação extrajudicial em PDF com identificação completa do credor (CDC art. 42-A) e discriminação de valores. Entrega 80% do valor da negativação com 5% do risco.
- **Pix Cobrança com QR dinâmico** no valor exato.
- **Alerta de limite do MEI** ("você já faturou R$ 68.000 este ano").
- **Multi-loja e versão web** para o PC do caixa.

## Fase 3 — condicional

- **WhatsApp Cloud API oficial** como upgrade pago, com opt-in formalizado e templates aprovados. Gatilho: lojistas com mais de ~80–100 clientes fiado, para quem a fila manual vira trabalho real.
- **PSP com conciliação automática** (Asaas / Pagar.me) como upgrade opcional, nunca caminho obrigatório.
- **Migração para PowerSync**, se e somente se a fila própria virar gargalo medido.

## Fora de escopo — permanente

Estas não voltam a ser discutidas sem um documento que refute a evidência que as excluiu.

| Item | Fundamento da exclusão |
|---|---|
| Estoque, PDV, NF-e, fiscal | [Proposta de valor](02-proposta-de-valor.md) — sair do vazio de mercado |
| Emissão de documento fiscal | 27 legislações estaduais, certificado digital por lojista, guarda de XML por 5 anos |
| Antecipação de recebível, garantia de pagamento, empréstimo | Vira instituição regulada pelo BCB. Matou o produto P2P do OkCredit |
| Custódia de dinheiro dos usuários | Resolução BCB nº 80/2021 — capital mínimo, PLD/FT, autorização prévia |
| Decisão automatizada de concessão de crédito **pela plataforma** | LGPD art. 20 + risco de enquadramento regulatório |
| Base cruzada de devedores entre lojas | Transformaria o SaaS em bureau de crédito de fato |
| Negativação em SPC/Serasa | Assimetria de risco brutal; exige CPF + endereço + prova documental |
| Consulta de score externo de CPF | R$ 5–24 por consulta para decidir um fiado de R$ 50. A economia não fecha |
| **Envio automático de cobrança** | CDC art. 42 e 71; destrói a relação; é a promessa central do produto |
| Envio para grupo, lista de transmissão ou terceiros | Jurisprudência consolidada de dano moral |
| API não-oficial de WhatsApp | Banimento permanente do número do lojista — destrói o ativo dele |
| Anúncios, em qualquer plano | Causa direta de 1★ e de desinstalação nos 3 países analisados |
| App para o cliente devedor | Modelo de dois lados falhou no Khatabook |

## O que o MVP deliberadamente não otimiza

Registrado para não virar discussão depois:

- **Busca sofisticada de clientes.** A carteira real tem 8–15 pessoas; a lista cabe numa tela. Busca simples basta.
- **Relatórios e gráficos.** Não é um ERP. "Tá na rua", "recebi hoje" e "quem tá atrasado" respondem tudo que o lojista pergunta.
- **iOS nativo.** É PWA. Instala no iOS pelo menu Compartilhar (com as limitações documentadas em [sincronização offline](../04-arquitetura/04-sincronizacao-offline.md)).
- **Internacionalização.** O produto é brasileiro por dentro: o vocabulário, a régua de cobrança e o Pix são o produto.
