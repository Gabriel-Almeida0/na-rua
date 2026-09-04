# ADR-0021 · Feature flags em código, sem serviço externo

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Feature flags resolvem um problema específico: **um time de produto querendo ligar e desligar experimento sem deploy.**

## Decisão

**Flags SDK (`flags@4.3.0`, MIT) com `decide()` em código.** Sem serviço externo.

## Justificativa

**1. O problema que essas ferramentas resolvem não existe aqui.** Você é um dev. Um. Não há time de produto esperando um toggle.

**2. 🔴 E o custo é direto contra o requisito central.** Adicionar Flagsmith ou Unleash é adicionar **uma dependência de rede no caminho crítico de um app que precisa funcionar offline em 4G ruim** — exatamente o oposto do requisito.

Há precedente do estrago: uma review real da BukuWarung relata *"o app fecha sozinho, mas se desligar a internet ele abre"* — uma chamada de rede na inicialização derrubava o app inteiro. E o Khatabook chegou a bloquear a leitura por um update-wall: *"it kinda blocks you post login and you'll not be able to see any transactions"*.

**3. "Flags as code" não fecha a porta.** O *call site* não muda quando um adapter for adicionado depois — dá para plugar `@flags-sdk/posthog` no futuro **sem refatorar**.

## Alternativas rejeitadas

| Opção | Por que não |
|---|---|
| **Flagsmith** | Dependência de rede no caminho crítico. Free: 50k requests/mês, 1 membro |
| **Unleash** | Sem free hospedado. E ⚠️ **AGPL-3.0** — copyleft de rede |
| **PostHog remote evaluation** | Cobra por check. Com local evaluation no servidor o custo despenca, mas continua sendo dependência de rede |

## Consequências

**Positivas** — zero dependência de rede, zero custo, zero configuração; e a porta de saída existe.

**Negativas** — mudar uma flag exige deploy. **Aceitável:** o único caso que justificaria serviço externo é kill switch em produção às 3h da manhã, e para isso o deploy do projeto é rápido o bastante.

**Regra derivada:** nenhuma feature flag, remote config ou verificação de versão pode bloquear a renderização da tela inicial. Ela renderiza do banco local **antes** de qualquer chamada de rede.
