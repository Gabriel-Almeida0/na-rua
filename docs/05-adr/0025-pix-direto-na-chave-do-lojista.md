# ADR-0025 · Pix direto na chave do lojista; nunca custodiar dinheiro

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O cliente precisa conseguir pagar. Há três arquiteturas possíveis, e a escolha entre elas define se o produto é um software de gestão ou uma instituição financeira.

## Decisão

**O Na Rua gera o payload do QR Code apontando para a chave Pix do próprio lojista. O dinheiro nunca entra em conta nossa.** No MVP, o lojista dá baixa manualmente.

## Alternativas rejeitadas

| Arquitetura | Por que não |
|---|---|
| **PSP com subconta e split** | Viável e regulatoriamente correto (a instituição autorizada é o PSP). Fica como **upgrade opcional na Fase 2**, nunca caminho obrigatório. ⚠️ Se houver escrow ou o dinheiro passar por conta nossa, a análise muda completamente |
| 🔴 **Dinheiro na conta do SaaS, repasse depois** | Custódia de recursos de terceiros = instituição de pagamento = autorização prévia do BCB (Resolução nº 80/2021), capital mínimo, governança, PLD/FT. **Inviável para micro-SaaS** |

## As duas justificativas

**1. Regulatória.** Sem custódia, sem liquidação e sem saldo de terceiros, o produto é um software de gestão que gera um payload padronizado (BR Code). Não é instituição de pagamento, não é subcredenciador, não participa do arranjo Pix.

**2. ⭐ Econômica — e esta é decisiva.** O fiado tem ticket muito baixo, o que **inverte a lógica normal de escolha de PSP**:

| Ticket | Asaas (R$ 1,99 fixo) | Efí (1,19%) | Pagar.me (0,78%) |
|---|---|---|---|
| **R$ 30** | R$ 1,99 = **6,6%** 🔴 | R$ 0,36 | R$ 0,23 |
| R$ 100 | 2,0% | 1,19% | 0,78% |
| R$ 500 | 0,4% | 1,19% | 0,78% |

**Um Pix de R$ 30 no Asaas custaria 6,6%.** Isso mata a economia do produto.

## Consequências

**Positivas** — zero exposição regulatória, zero chargeback, zero PCI, zero KYC de lojista, custo zero.

**Negativas**
- ➖ **Conciliação manual no MVP.** O lojista dá baixa. É simples e funciona — e não é pior que o caderno
- ➖ **Sem receita transacional.** O produto monetiza só por assinatura. É escolha de modelo de negócio, e está alinhada com a lição do OkCredit e da BukuWarung

## Nota — Pix Automático

Existe (Resolução BCB nº 402/2024, em produção desde 16/06/2025), mas não serve ao caso dominante: pressupõe **valor regular, data regular e saldo em conta** — exatamente o que falta ao público do fiado. E exige recebedor **PJ com CNPJ ativo**, o que exclui parte do público-alvo. Roadmap, não MVP.

⚠️ Este documento é pesquisa técnica, não parecer jurídico.
