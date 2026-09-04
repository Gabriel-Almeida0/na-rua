# Requisitos de conformidade

> Tradução da [pesquisa regulatória](00-pesquisa-regulatoria.md) em requisitos acionáveis. Cada item é verificável e tem dono no código.
>
> ⚠️ **Pesquisa técnica, não parecer jurídico.** Os pontos abertos da seção final devem ser validados por advogado antes do lançamento comercial.

## O modelo em uma frase

> **O dinheiro nunca entra. O dado pessoal nunca sai. O humano fica no loop da cobrança.**

## Papéis LGPD

| Ator | Papel | Sobre quais dados |
|---|---|---|
| **Lojista** | **Controlador** | Dados dos clientes devedores. Ele decide quem cadastrar, quando cobrar e quanto tempo guardar |
| **Na Rua** | **Operador** | Trata em nome do lojista, seguindo as instruções dele |
| **Na Rua** | **Controlador** | Dados do próprio lojista (cadastro, assinatura) |

⚠️ **Ser operador não é escudo.** O art. 42 §1º I estabelece responsabilidade solidária quando o operador descumpre a lei ou não segue instruções lícitas.

🔴 **A linha é frágil, e uma feature a atravessa.** Se o produto cruzar bases de lojistas diferentes para detectar "o devedor que deve em 5 lojas", **deixa de ser SaaS de gestão e vira bureau de crédito de fato** — com as obrigações do art. 43 do CDC e da Lei 12.414/2011. É comercialmente tentador e está [permanentemente fora de escopo](../00-visao/03-escopo.md).

## Base legal

| Base | Artigo | Uso |
|---|---|---|
| **Execução de contrato** | art. 7º, **V** | ✅ **Principal.** A venda a prazo é contrato do qual o devedor é parte |
| **Legítimo interesse** | art. 7º, **IX** + art. 10 | ✅ Complementar, para a cobrança e a retenção de histórico |
| Exercício regular de direitos | art. 7º, VI | ✅ Cobrança judicial |
| **Consentimento** | art. 7º, I | ⚠️ **Evitar como base principal** — é revogável (art. 8º §5º). Se o devedor revogar, o lojista perde a base para manter o registro da dívida. É armadilha de design |

**Consequência:** não construir tela de "aceite o termo" como pré-requisito para registrar a dívida.

**Dado de dívida não é dado sensível** (o rol do art. 5º, II é taxativo). Mas: ⚠️ a ANPD alertou que **histórico de compras pode permitir inferência de dado sensível** (saúde, por exemplo). Por isso a descrição do item é **sempre opcional** e nunca padrão.

---

## O software DEVE

### Dados e privacidade
| # | Requisito | Base |
|---|---|---|
| D1 | Contrato de operador (DPA) nos Termos de Uso, com instruções documentadas | LGPD art. 39 |
| D2 | Isolamento multi-tenant real — dados de um lojista nunca acessíveis a outro | art. 46 |
| D3 | **Audit log de toda operação**: quem viu, editou, exportou e enviou cobrança, com timestamp | **art. 37** — obrigatório sob legítimo interesse |
| D4 | Política de retenção com **expurgo automatizado** e anonimização | art. 16 |
| D5 | Tela de **exportação e eliminação** dos dados de um cliente | art. 18 |
| D6 | **Canal público de privacidade** visível | Res. CD/ANPD nº 2/2022 |
| D7 | **Lista pública de subprocessadores** e mapa de transferências | art. 18, VII; art. 33 |
| D8 | Runbook de incidente: comunicação à ANPD e aos titulares em **3 dias úteis** | Res. CD/ANPD nº 15/2024 |
| D9 | Entregar ao lojista **modelos prontos** de aviso de privacidade e de teste de legítimo interesse (LIA) | art. 10 §2º |
| D10 | Criptografia em repouso e em trânsito; MFA disponível | art. 46 |

> ⭐ **D9 é diferencial, não só obrigação.** Um mercadinho jamais vai redigir um LIA sozinho — e sem isso o lojista fica exposto, e nós junto, por solidariedade.

> ✅ **Boa notícia:** a Resolução CD/ANPD nº 2/2022 **dispensa** agentes de pequeno porte da obrigação de indicar encarregado (DPO). Mas exige o canal de comunicação com o titular (D6), e **não dispensa** nenhuma outra obrigação.

### Cobrança
| # | Requisito | Base |
|---|---|---|
| C1 | **Janela de horário**: seg–sex 9h–18h, sáb 9h–13h, feriados bloqueados | CDC art. 71; Lei SP 17.832/2023 art. 51 |
| C2 | **Rate limit**: máx. 1 lembrete por dívida por dia, backoff crescente, parada após N tentativas | CDC art. 71 |
| C3 | Envio **exclusivamente 1:1** para o telefone do devedor | CDC art. 42; jurisprudência |
| C4 | **Templates fechados**, sem texto livre em envio automatizado | CDC art. 42 |
| C5 | Discriminar **valor originário / multa / juros / total** | Lei SP 17.832 art. 49 |
| C6 | **Nome, endereço e CPF/CNPJ do lojista** em toda mensagem e documento de cobrança | **CDC art. 42-A** |
| C7 | Estado **"dívida contestada"** que suspende os lembretes | **CDC art. 54-G** |
| C8 | **Opt-in explícito** registrado com data, hora e usuário | Política Meta + LGPD art. 10 §2º |
| C9 | **Opt-out** funcional e respeitado | Boa prática + Política Meta |

### Financeiro
| # | Requisito | Base |
|---|---|---|
| F1 | **Multa ≤ 2%** validada **no domínio**, não só na UI | CDC art. 52 §1º |
| F2 | Teto de juros configurável, default conservador, com aviso sobre o limite jurisprudencial | STJ REsp 1.720.656 |
| F3 | Exibir os **cinco itens do art. 52** antes do aceite de parcelamento com encargos | CDC art. 52 |
| F4 | **Comprovante digital de fiado com aceite do cliente** | Constitui prova e viabiliza encargos |
| F5 | **Pix direto na chave do lojista** | Res. BCB nº 80/2021 |

### Mensageria
| # | Requisito |
|---|---|
| M1 | **API oficial** — `wa.me` no MVP, Cloud API na Fase 3 |
| M2 | **Um número por lojista**, nunca compartilhado da plataforma |
| M3 | Monitorar quality rating e pausar automaticamente ao rebaixamento (Fase 3) |

---

## O software NÃO DEVE

### Dados
1. ❌ Exigir **CPF** como campo obrigatório
2. ❌ Coletar RG, foto de documento, comprovante de renda, local de trabalho, "contato de referência"
3. ❌ Registrar **itens individuais da compra por padrão** — risco de inferência de dado sensível
4. 🔴 **Cruzar bases de lojistas** nem criar base agregada de devedores
5. ❌ Usar **consentimento** como base legal principal
6. ❌ Usar dados dos devedores para finalidade própria (marketing, venda, modelo comercializável)

### Cobrança
7. 🔴 Permitir envio para **grupo**, lista de transmissão, terceiros ou cópia
8. ❌ Permitir texto livre em disparo automatizado
9. 🔴 Usar linguagem que exponha ou ameace — **CDC art. 71 é crime**
10. ❌ Gerar **lista de devedores** afixável, imprimível ou compartilhável
11. ❌ Enviar fora da janela de horário, **mesmo que o lojista peça**
12. ❌ Continuar cobrando dívida **contestada**
13. ❌ Misturar cobrança com promoção no mesmo template

### Financeiro e regulatório
14. 🔴 **Custodiar dinheiro** de lojistas ou devedores
15. 🔴 Antecipar recebíveis, comprar dívida ou garantir pagamento
16. ❌ Apresentar-se como concedente de crédito
17. ❌ Tomar **decisão automatizada de concessão de crédito** — LGPD art. 20
18. ❌ Permitir multa acima de 2% nem juros acima do teto

### Mensageria e bureaus
19. 🔴 **API não-oficial de WhatsApp** — banimento permanente do número do lojista
20. ❌ Construir **negativação** em bureau
21. ❌ Consultar score externo de CPF
22. ❌ Emitir NF-e / NFC-e

---

## Naming — a linha entre software e instituição financeira

**A regra de ouro:**

> O Na Rua é ferramenta de **registro e comunicação**. Quem concede o crédito é o **lojista**, com dinheiro dele, sobre mercadoria dele. A plataforma nunca é parte na relação de crédito e nunca toca no dinheiro.

Venda a prazo pelo próprio lojista, do próprio estoque, com recursos próprios, **não é operação bancária** e não exige autorização do BCB — é exatamente por isso que o STJ, no REsp 1.720.656, decidiu que a loja **não se equipara a instituição financeira**.

**Nomenclatura importa juridicamente:**

| ❌ Nunca dizer | ✅ Dizer |
|---|---|
| "Concedemos crédito" | "Você registra suas vendas a prazo" |
| "Aprovamos/negamos crédito" | "Você decide a quem vender fiado" |
| "Limite aprovado pela plataforma" | "Limite que **você** definiu para este cliente" |
| "Antecipamos seu fiado" | *(não oferecer)* |
| "Carteira de crédito" | "Caderneta" |

---

## Pontos abertos — validar com advogado antes do lançamento

| # | Ponto |
|---|---|
| 1 | Teto de 12% a.a. do REsp 1.720.656 **após a Lei 14.905/2024** — o art. 591 do CC, um dos fundamentos da decisão, foi alterado, e a "taxa legal" virou Selic − IPCA. Não há decisão posterior do STJ localizada |
| 2 | Fórmula de acumulação de juros legais + correção pelo IPCA, sem bis in idem |
| 3 | Se o art. 51 da Lei SP 17.832 (que fala literalmente em **"telefonemas"**) alcança mensagens de WhatsApp |
| 4 | Se Meta/BSP oferecem as Cláusulas-Padrão Contratuais da Res. ANPD 19/2024 — define a viabilidade da Cloud API na Fase 3 |
| 5 | Prazo exato de retenção para dívida quitada (os 5 anos são analogia, não regra expressa) |
| 6 | Se o registro no app pode ser usado como prova de venda não escriturada — objeção comercial certa |
| 7 | Estrutura exata de split com PSP na Fase 2 |
| 8 | Números de processo da jurisprudência sobre cobrança em grupo (localizados via agregador, não em fonte primária) |

> ⚠️ **Sobre o item 3:** o art. 51 fala em "telefonemas" e o art. 44 §3º da mesma lei menciona explicitamente "aplicativo de mensagem" — o legislador sabe distinguir. Isso sugere que a restrição literal de horário **pode não alcançar o WhatsApp**. **Isso não significa que se pode mandar cobrança às 23h:** o art. 71 do CDC é federal, é crime, e proíbe procedimento que interfira com o descanso. **A janela estadual é o piso de prudência, não o teto de risco.**
