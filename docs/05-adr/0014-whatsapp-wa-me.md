# ADR-0014 · WhatsApp via `wa.me` no MVP; Cloud API só como upgrade

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

82% dos pequenos negócios usam WhatsApp como principal canal. A cobrança precisa sair por lá. Há três caminhos: link `wa.me`, Cloud API oficial da Meta, ou API não-oficial.

## Decisão

**MVP: `wa.me`.** O app monta `https://wa.me/55DDDNUMERO?text=<mensagem>`, o WhatsApp do lojista abre com o texto pronto, e **ele aperta enviar**.

Cloud API oficial vira upgrade pago na Fase 3, com gatilho em ~80–100 clientes fiado.

## Alternativas rejeitadas

### 🔴 API não-oficial (Evolution API em modo QR, Z-API, Baileys, WPPConnect)

Funcionam por engenharia reversa do WhatsApp Web e **violam os Termos de Serviço da Meta**. A Meta intensificou a fiscalização, com **bloqueios permanentes sem aviso prévio**.

> **Se o número do lojista for banido, ele perde o canal de contato com toda a clientela do bairro — um ativo que levou anos para construir.** Isso não é um bug: é destruição do negócio do cliente.

É o risco existencial do produto, e a decisão é permanente.

### Cloud API oficial desde o MVP

Tecnicamente viável e barata (utility a ~R$ 0,04, e **grátis dentro da janela de 24h**). Rejeitada por **fricção de onboarding**: exigir que um dono de mercadinho passe por verificação de negócio da Meta, criação de WABA e aprovação de template antes de usar o produto **mata a ativação**.

## Consequências

**Positivas**

| Vantagem | Detalhe |
|---|---|
| Custo **R$ 0** | Nenhuma taxa Meta, nenhum BSP, nenhuma mensalidade |
| **Zero setup** | O lojista instala e usa hoje |
| Risco de banimento **zero** | É o WhatsApp normal dele |
| ⭐ **Elimina uma camada regulatória inteira** | Nenhum dado pessoal do devedor sai para a API da Meta → **a Resolução ANPD 19/2024 (transferência internacional) sai do escopo do MVP** |
| ⭐ **Reduz o risco de CDC** | O lojista **lê antes de mandar**. Humano no loop |
| Melhor conversão | Vem do número que o cliente já conhece |

**Negativas**

| Desvantagem | Mitigação |
|---|---|
| Exige um toque por cobrança | **Fila do dia**: "5 pessoas para lembrar hoje", botões em sequência. E o lojista *quer* revisar antes de cobrar quem ele vê na rua |
| Não dá para agendar | **É vantagem disfarçada** — resolve a janela de horário por construção |
| Sem confirmação de entrega | Rastreamos "preparado" e "marcado como enviado" |

> Uma decisão tomada por custo e por risco de banimento acabou melhorando simultaneamente a conformidade com a LGPD, a conformidade com o CDC e a conversão. Quando isso acontece, geralmente é sinal de que a restrição estava certa.
