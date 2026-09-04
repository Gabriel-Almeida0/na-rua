# ADR-0011 · A auditoria é o ledger, não trigger nem `pgaudit`

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O art. 37 da LGPD exige registro das operações de tratamento — **especialmente quando o tratamento se baseia em legítimo interesse**, que é o caso da cobrança. E o negócio faz uma pergunta concreta: *"quem lançou este fiado?"*.

## Decisão

**`created_by uuid not null default auth.uid()` na própria linha do lançamento**, mais a tabela `reminders` registrando cada lembrete preparado (quando, para quem, qual tom, por quem).

Sem tabela de audit log genérica, sem extensão.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **`supa_audit`** | 🔴 **Arquivado em 16/02/2025**; último commit em jan/2024. Não se adota extensão arquivada em produto novo |
| **`pgaudit`** | 🔴 *"pgAudit cannot reliably identify application end-users — it tracks database-level roles only"* e é *"best-effort and not transactional"*. Além disso, no plano gratuito do Supabase os logs de banco têm **1 dia de retenção** |
| Tabela de audit log genérica em paralelo | Duplica o dado, pode divergir do ledger, e não responde melhor a nenhuma pergunta |

## Consequências

**Positivas**
- **Transacional** — o registro de autoria e o fato acontecem no mesmo commit, ou nenhum acontece
- **Consultável por SQL**, não por grep em log
- **Imune a política de retenção de log**
- Responde exatamente a pergunta do negócio

**Negativas** — não captura mudanças feitas fora da API (ex.: um `UPDATE` manual no console). Mitigação: o ledger é [append-only forçado em três camadas](0006-append-only-tres-camadas.md), então essas mudanças **não podem acontecer**.

> **Trilha de auditoria não deve ser subproduto. Deve ser o modelo de dados.**
