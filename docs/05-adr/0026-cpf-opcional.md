# ADR-0026 · O CPF do cliente é opcional; dados excessivos não existem no schema

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O reflexo de qualquer sistema de cobrança é pedir CPF. Três coisas desaconselham isso aqui.

**1. Não é necessário.** Para registrar "João da padaria deve R$ 47,00", o CPF não acrescenta nada. O telefone já identifica e já é o canal de contato. O princípio da necessidade da LGPD (art. 6º, III) exige tratamento *"limitado ao mínimo necessário"*.

**2. A ANPD já autuou o varejo por isso.** As Notas Técnicas 4/2022 e 6/2025 apontam **coleta excessiva e sem transparência de CPF**, e a conclusão do processo de fiscalização de redes de farmácias determinou ajustes de conduta.

**3. É o dado que mais aumenta o risco de vazamento**, por ser a chave de cruzamento com bases externas — desproporcional ao benefício.

E há um argumento de produto: **cada campo extra no cadastro é um ponto de decisão onde a pessoa abandona.** O fluxo acontece com um cliente esperando no balcão.

## Decisão

1. **Só o nome é obrigatório.** CPF, telefone e todo o resto são opcionais.
2. Quando exibido, o campo CPF é **colapsado e rotulado com a finalidade**: *"Só preencha se for emitir nota fiscal"*.
3. **Não existem colunas** para RG, foto de documento, comprovante de renda, local de trabalho, endereço do devedor ou "contato de referência".

O item 3 não é omissão de MVP — todos esses são excessivos e são **vetores clássicos de cobrança vexatória**.

## Quando o CPF passa a ser necessário

| Situação | Necessário? |
|---|---|
| Registrar fiado, saldo, lembrete | ❌ Não |
| NFC-e com identificação do consumidor | ✅ Se o cliente pedir |
| Pix Cobrança **com vencimento** (COBV) | ⚠️ A API exige no campo `devedor` — por isso o padrão é COB simples |
| Cobrança judicial | ✅ Qualificação da parte |
| Negativar em bureau | ✅ — e por isso [não construímos negativação](0028-nao-construir-negativacao.md) |

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| CPF obrigatório | Coleta excessiva, fricção no balcão, e risco desproporcional |
| CPF "opcional mas em destaque" | Na prática vira obrigatório. O campo fica colapsado |
| Coletar endereço "para o caso de precisar cobrar" | É o caso de uso da negativação, que não construímos |

## Consequências

**Positivas** — cadastro em ~15 segundos, superfície de risco de vazamento drasticamente menor, e coerência com o posicionamento.

**Negativas** — algumas features futuras (COBV, cobrança judicial) precisam pedir o CPF **naquele momento**, com a finalidade explicada. É o desenho correto: coletar quando for necessário, não por precaução.
