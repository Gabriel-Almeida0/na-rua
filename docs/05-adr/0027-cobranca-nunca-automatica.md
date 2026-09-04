# ADR-0027 · A cobrança nunca é automática

**Status:** Aceita · **Data:** 2026-09-04 · **Permanente**

## Contexto

A feature mais óbvia de um app de fiado é o disparo automático de cobrança. É a primeira coisa que qualquer pessoa pediria. **E é a que destruiria o produto.**

## Decisão

**Não existe envio automático de cobrança. Em versão nenhuma. Nem escondido em configurações.**

O app **prepara** a mensagem. O lojista **lê**, edita se quiser, e **manda com o dedo dele**, pelo WhatsApp dele.

A promessa aparece em toda tela de lembrete:

> **"Você que manda. O app não manda nada sozinho."**

## As três razões independentes

Qualquer uma bastaria. As três juntas tornam a decisão permanente.

### 1. Legal
- **CDC art. 42:** *"o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça"*
- **CDC art. 71 é crime** (detenção de 3 meses a 1 ano) para cobrança que *"interfira com seu trabalho, descanso ou lazer"*
- **CDC art. 54-G** veda cobrar valor contestado pelo consumidor enquanto não solucionada a controvérsia
- Jurisprudência consolidada de dano moral por cobrança em grupo ou dirigida a terceiros

### 2. Relacional
O fiado **é** o mecanismo de fidelização. A pesquisa de campo mostra que o lojista prefere **absorver R$ 100 de prejuízo a romper a relação** com alguém que ele encontra na rua todo dia. Cobrança agressiva recupera o valor de hoje ao custo do cliente de amanhã.

### 3. De negócio
Se o app manda mensagem sozinho e o freguês some da loja, **o lojista culpa o app e desinstala no mesmo dia — e conta para os vizinhos.** O boca a boca é exatamente o canal de aquisição deste mercado. Um envio automático mal recebido não perde um cliente: perde a rua inteira.

## As 8 travas derivadas

| # | Trava |
|---|---|
| 1 | "Enviar automaticamente" **não existe** |
| 2 | O app abre o WhatsApp com o texto; **o humano aperta enviar** |
| 3 | Sempre **1:1 para o telefone do devedor**. Grupo, lista, cópia e terceiros bloqueados no código |
| 4 | Fora de **seg–sex 9h–18h / sáb 9h–13h** (feriados bloqueados), o app avisa antes |
| 5 | **Máximo 1 lembrete sugerido por cliente por semana** |
| 6 | Templates fechados, sem nenhuma palavra da lista proibida |
| 7 | Mensagem traz nome, endereço e CNPJ/CPF do lojista (**CDC art. 42-A**) e discrimina valor originário / multa / juros / total |
| 8 | Conta **contestada** suspende automaticamente qualquer sugestão (**CDC art. 54-G**) |

Todo lembrete preparado é registrado — prova de defesa do lojista, e exigência do art. 37 da LGPD.

## Consequências

**Positivas** — ⭐ **as travas são o produto, não o compliance.** "Cobra sem constranger, dentro da lei" vende melhor para o dono do mercadinho do que "gestão de recebíveis", porque o medo real dele é brigar com o cliente que ele encontra na padaria.

E há um efeito colateral bom: como o envio é manual, [`wa.me` é suficiente](0014-whatsapp-wa-me.md) — o que zera o custo de mensageria e elimina a transferência internacional de dados do escopo do MVP.

**Negativas** — exige um toque do lojista por cobrança. Mitigação: a **fila do dia** transforma isso em 5 toques em sequência. E ele *quer* revisar.

## Métrica de guarda

**Churn de freguês após lembrete < 5%.** Se subir, o tom está agressivo e está destruindo relações — e a feature **regride**, não se otimiza por cima.
