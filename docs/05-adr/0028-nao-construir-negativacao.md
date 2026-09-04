# ADR-0028 · Não construir negativação nem consulta a bureau

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

"Negativar quem não paga" é pedido óbvio e monetizável. Juridicamente, o pequeno comerciante **pode** negativar. Na prática, é um campo minado.

## Decisão

**Não construir negativação em bureau, nem no MVP, nem no médio prazo. Não consultar score externo de CPF.**

## As sete razões

**1. 🔴 Assimetria brutal de risco.** A dívida média é R$ 50–300. Uma condenação por negativação indevida gira em milhares de reais mais honorários. **Um erro apaga o lucro de anos de assinatura.**

**2. Exige exatamente o que decidimos não coletar.** CPF **e endereço completo**, obrigatoriamente — revertendo toda a [minimização de dados](0026-cpf-opcional.md).

**3. Exige prova documental da dívida.** A legislação consumerista paulista (Lei 17.832/2023, art. 46) determina que o credor apresente documento que ateste natureza, exigibilidade e inadimplência. **Um fiado anotado unilateralmente não é isso.**

**4. O lojista responde — mas vai culpar o software.** *"O sistema mandou."* Custo de suporte, de reputação e de churn.

**5. A fricção mata a ativação.** Associação à CDL, contrato com bureau, credenciamento. É o oposto de "instalou e usou".

**6. ⭐ Contradiz o posicionamento.** O produto vende *"cobre sem constranger, mantenha o cliente"*. Negativação rompe com o cliente do bairro, que é **o ativo do mercadinho**. É estrategicamente contraditório.

**7. Regras estaduais divergentes** multiplicam a superfície de erro para um produto nacional.

## Sobre a consulta de score

| Provedor | Preço |
|---|---|
| SPC + Serasa (combinado) | R$ 22,90 |
| Serasa (avulsa) | ~R$ 35,00 |
| Via revendedores | R$ 5,40 – 24,00 |

Rejeitada porque: **(a)** R$ 5–24 para decidir um fiado de R$ 50 é irracional; **(b)** o lojista já tem informação melhor — ele conhece a pessoa há anos, e o score da Serasa **não sabe** que o Seu João sempre paga na sexta; **(c)** reposicionaria o produto como concessão de crédito; **(d)** dispararia o art. 20 da LGPD (direito à revisão de decisão automatizada); **(e)** exigiria CPF obrigatório.

## A alternativa: 80% do valor, 5% do risco

### Cobrança formal
Gerar uma **notificação extrajudicial de débito em PDF**, com identificação completa do credor (CDC art. 42-A), discriminação de valores (valor originário / multa / juros / total) e prazo para pagamento. O lojista envia ou entrega em mãos.

Isso: **(a)** aumenta a recuperação porque *parece* e *é* oficial; **(b)** constitui em mora e documenta a cobrança; **(c)** não exige bureau, CDL, CPF nem contrato; **(d)** não gera risco de negativação indevida; **(e)** é construível numa sprint.

### ⭐ Score interno de comportamento

> **O dado de crédito mais valioso para este produto é o que ele mesmo gera.**

*"Este cliente pagou 12 de 14 vezes em dia, costuma acertar dia 5"* é mais preditivo para **esta loja** que qualquer score genérico, é mais defensável juridicamente (base legal: execução de contrato), e é **grátis**.

## Consequências

**Positivas** — risco jurídico próximo de zero, coerência com a minimização e com o posicionamento, e uma feature substituta mais barata e mais alinhada.

**Negativas** — perde-se um argumento de venda que soa forte. Aceitável: é um argumento que venderia o produto errado.

**Se um dia houver demanda comprovada**, o caminho é **parceria com um bureau** que assuma o processo — nunca construir a integração.
