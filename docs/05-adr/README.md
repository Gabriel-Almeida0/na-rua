# Registros de Decisão de Arquitetura (ADR)

Cada decisão significativa deste projeto está registrada com **contexto**, **alternativas rejeitadas** e **consequências** — inclusive as negativas.

> **A regra do repositório:** uma decisão sem alternativa rejeitada documentada não é uma decisão. É um hábito.

## Índice

### Dinheiro e integridade
| # | Decisão |
|---|---|
| [0001](0001-ledger-append-only.md) | Ledger append-only com partidas dobradas; saldo derivado |
| [0004](0004-estorno-por-contra-lancamento.md) | Estorno por contra-lançamento; nada é deletado |
| [0005](0005-valores-em-centavos.md) | Valores monetários em centavos (`bigint`) |
| [0006](0006-append-only-tres-camadas.md) | Append-only forçado em três camadas independentes |
| [0011](0011-auditoria-e-o-ledger.md) | A auditoria é o ledger, não trigger nem `pgaudit` |

### Offline e sincronização
| # | Decisão |
|---|---|
| [0002](0002-eventos-idempotentes.md) | Sincronização replica eventos idempotentes com ID gerado no cliente |
| [0003](0003-dexie-outbox-proprio.md) | Dexie + outbox próprio, em vez de sync engine de terceiros |
| [0013](0013-service-worker-serwist.md) | Service worker: Serwist |
| [0015](0015-indexeddb-e-buffer.md) | IndexedDB é buffer de trânsito, não fonte de verdade |

### Segurança e multi-tenancy
| # | Decisão |
|---|---|
| [0007](0007-multi-tenancy-shared-schema.md) | Multi-tenancy por shared schema + `tenant_id` + RLS |
| [0008](0008-papel-fora-do-jwt.md) | O papel vem da tabela de membership, não do JWT |
| [0009](0009-regras-de-rls.md) | Toda policy: `TO authenticated` + `(select fn())` + índice |
| [0010](0010-security-invoker-views.md) | Toda view exposta usa `security_invoker = on` |

### Plataforma e ferramentas
| # | Decisão |
|---|---|
| [0012](0012-backend-supabase.md) | Backend: Supabase (Postgres 17) |
| [0016](0016-rsc-nao-spa.md) | RSC + streaming; SPA client-side rejeitada |
| [0017](0017-orcamento-de-performance.md) | Orçamento de performance: JS ≤ 170 KB na primeira carga |
| [0018](0018-orm-drizzle.md) | ORM: Drizzle 0.45.2, a linha estável |
| [0019](0019-validacao-zod.md) | Validação: Zod 4 |
| [0020](0020-vertical-slices.md) | Vertical slices + núcleo de domínio puro |
| [0021](0021-feature-flags-em-codigo.md) | Feature flags em código, sem serviço externo |
| [0022](0022-repositorio-publico.md) | Repositório público |
| [0023](0023-vercel-pro-ao-faturar.md) | Vercel Pro obrigatório antes do primeiro faturamento |
| [0024](0024-backup-proprio.md) | `pg_dump` diário desde o primeiro dia |

### Produto, regulação e fronteiras
| # | Decisão |
|---|---|
| [0014](0014-whatsapp-wa-me.md) | WhatsApp via `wa.me` no MVP; Cloud API só como upgrade |
| [0025](0025-pix-direto-na-chave-do-lojista.md) | Pix direto na chave do lojista; nunca custodiar dinheiro |
| [0026](0026-cpf-opcional.md) | O CPF do cliente é opcional; dados excessivos não existem no schema |
| [0027](0027-cobranca-nunca-automatica.md) | **A cobrança nunca é automática** — permanente |
| [0028](0028-nao-construir-negativacao.md) | Não construir negativação nem consulta a bureau |
| [0029](0029-nao-emitir-nota-fiscal.md) | Não emitir documento fiscal |

---

## As cinco que carregam o projeto

Se houver tempo para ler apenas cinco:

1. **[0001](0001-ledger-append-only.md) + [0002](0002-eventos-idempotentes.md)** — juntas, resolvem integridade contábil, auditoria e sincronização offline com **um único mecanismo**. É a tese técnica do projeto.
2. **[0003](0003-dexie-outbox-proprio.md)** — por que não usar sync engine, com a análise de risco de plataforma do segmento local-first.
3. **[0008](0008-papel-fora-do-jwt.md)** — a armadilha do JWT que faria um balconista demitido manter acesso.
4. **[0027](0027-cobranca-nunca-automatica.md)** — a feature mais óbvia do produto, recusada por três razões independentes.
5. **[0023](0023-vercel-pro-ao-faturar.md)** — o maior risco **não-técnico** do projeto, e o mais fácil de não enxergar.

## Formato

```markdown
# ADR-NNNN · Título em uma linha

**Status:** Proposta | Aceita | Substituída por ADR-XXXX · **Data:** AAAA-MM-DD

## Contexto      — o problema, com evidência
## Decisão       — o que fazemos
## Alternativas rejeitadas   — o que não fazemos, e por quê
## Consequências — positivas E negativas
## Fontes        — quando houver
```
