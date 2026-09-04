# Qualidade e observabilidade

> Fundamentação em [pesquisa técnica](00-pesquisa-tecnica.md) §6 e §7.

## Onde investir esforço de teste

O orçamento de qualidade vai para onde o dano é irreversível. Nesta ordem:

| Prioridade | O que | Se falhar |
|---|---|---|
| 🔴 **1** | **Integridade do dinheiro** — saldo, arredondamento, estorno | Dinheiro errado. Prejuízo real do lojista |
| 🔴 **2** | **Isolamento multi-tenant** — RLS | Vazamento de dado de terceiro. Incidente LGPD |
| 🔴 **3** | **Sincronização** — nada se perde, nada duplica | A causa nº 1 de desinstalação em 3 países |
| 🟠 4 | Layout em aparelho real | Botão coberto = app inutilizável |
| 🟠 5 | Performance em celular fraco | Abandono silencioso |
| 🟡 6 | Fluxos de ponta a ponta | |

---

## Estratégia de testes

| Camada | Ferramenta | Escopo | Veredito |
|---|---|---|---|
| **Domínio puro** | Vitest 5 (node) | `calcularSaldo()`, `Centavos`, validação de encargos, montagem de lembrete | **Faça, com cobertura alta** |
| **Segurança (RLS)** | **pgTAP + `supabase test db`** | Isolamento por tenant, papéis, append-only | 🔴 **Inegociável** |
| Bootstrap da suíte de RLS | `rlsautotest` (beta) | Gera esqueleto cobrindo tabela × comando × identidade | Use como **gerador**, não como garantia |
| **Integração** | Testcontainers + Vitest | Só as queries críticas e as invariantes do ledger | Seletivo |
| **E2E** | Playwright, **com CPU throttling** | 3 a 5 cenários | Não 50 |
| **Performance** | Lighthouse CI | Orçamento como assertion no CI | Todo push |

> **Não usar Vitest Browser Mode.** Já haverá Playwright; manter dois runners de browser num projeto solo é custo puro.

⚠️ Vitest 5 exige **Node ≥ 22.12.0** e Vite ≥ 6.4.0 — pode obrigar a subir o Node do CI.

### As invariantes como teste

As [dez invariantes verificáveis](../03-produto/02-regras-de-negocio.md#10-invariantes-verificáveis) rodam como asserções contra o banco. Qualquer violação é bug crítico, não warning.

```
I1  Para toda transação: Σ débitos = Σ créditos
I3  Nenhuma linha do ledger jamais sofreu UPDATE ou DELETE
I4  Saldo(cliente) == Σ lançamentos(cliente), sem exceção
I6  Nenhum lançamento é visível a um usuário fora do tenant
I7  Toda multa ≤ 2% do valor da prestação
```

### Testes de sincronização — os cenários obrigatórios

Estes reproduzem exatamente as falhas que derrubaram os concorrentes:

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Lançar offline, fechar o app, reabrir online | Lançamento sobe. Saldo bate |
| 2 | Lançar e apertar salvar 3 vezes com rede oscilando | **Um** lançamento. `ON CONFLICT DO NOTHING` |
| 3 | Dois dispositivos offline lançam para o mesmo cliente | Ambos entram. Saldos **somam**. Zero conflito |
| 4 | Servidor responde 500 no meio do lote | Fila preservada. Retry com backoff |
| 5 | Estorno offline de lançamento já sincronizado | Contra-lançamento sobe. Original intacto |
| 6 | Limpar dados do site e restaurar por telefone | Tudo volta. Contagem local == remota |
| 7 | Migrar de aparelho | Idem, sem ticket de suporte |
| 8 | Fila parada há 7 dias | Alerta ao lojista. Nada perdido |

---

## 🔴 A matriz de QA de layout

Isto não é zelo excessivo. **A BukuWarung colheu dezenas de reviews 1★ porque a barra de navegação do Android cobria o botão "0" do teclado numérico e o botão Salvar.**

> *"tombol 'simpan' tertutup navigation bar"* — o botão salvar fica coberto pela barra de navegação
> *"gabisa masukan nominal! sedih banget harus aku uninstall"* — não consigo digitar o valor, desinstalei chorando

É um teste de 5 minutos que ninguém fez, e custou o produto.

### Matriz obrigatória, a cada release

| Eixo | Valores |
|---|---|
| Android | 8 → 15 |
| Navegação do sistema | **barra de gestos** E **barra de 3 botões** |
| Tela | 5" / 720p **e** 6,7" |
| Fonte do sistema | 100% · 130% · 200% |
| Teclado | aberto **e** fechado |

**Critério de aprovação:** nenhum botão primário e nenhuma tecla numérica abaixo do inset da barra de navegação, em nenhuma combinação.

---

## Orçamento de performance

Referência: edição 2026 do *Performance Inequality Gap* — rede P75 de 9 Mbps / 100 ms RTT, dispositivo Samsung Galaxy A24. O orçamento "3s JS-light" é ~307 KiB de JS. **Adotamos ~55% dele**, porque o app é aberto várias vezes por dia com um cliente esperando.

| Item | Orçamento | Falha o build? |
|---|---|---|
| **JS na 1ª carga (rota principal)** | **≤ 170 KB** comprimido | ✅ Sim |
| JS total | ≤ 300 KB comprimido | ✅ Sim |
| Conteúdo total (1ª carga) | ≤ 600 KB | ✅ Sim |
| **Fontes web** | **0 KB** | ✅ Sim |
| **INP (p75)** | **≤ 200 ms** | Monitorado em campo |
| LCP (p75, mobile) | ≤ 2,5 s | ✅ Sim |
| CLS | ≤ 0,1 | ✅ Sim |
| Cold start em Android Go | < 2 s até tela útil | Manual |
| Página pública da conta | < 50 KB | ✅ Sim |

### Contexto que justifica o rigor

- Página mobile mediana hoje: **2,6 MiB** — maior que o DOOM original
- JS mobile: 680 KiB no p50, **1,3 MiB no p75**
- *"budget device CPUs have not meaningfully improved since 2022"*. Abaixo de US$ 100 = performance de um Galaxy A50 de **2019**
- ⭐ **Contra SPA:** o RUM Archive mostra que sites explicitamente SPA geram, em média, **uma soft navigation por hard navigation** — *"Sessions this shallow make a mockery of the idea that we can justify more up-front JavaScript to deliver SPA technology"*

### Táticas, em ordem de retorno

| # | Técnica | Impacto |
|---|---|---|
| 1 | **Fronteiras `"use client"` bem colocadas** | ⭐⭐⭐ Marque **folhas** (campo de valor, botão de quitar), não containers. **Se você escreveu `"use client"` num `layout.tsx` ou `page.tsx`, provavelmente errou** |
| 2 | RSC por padrão + Server Actions para mutação | ⭐⭐⭐ Lista, extrato e saldo são Server Components: zero JS enviado |
| 3 | Streaming com `<Suspense>` | ⭐⭐⭐ Shell em ~200 ms enquanto a query roda. Ataca LCP direto |
| 4 | Evitar hidratação pesada | ⭐⭐⭐ INP ruim em Android de entrada é quase sempre isso |
| 5 | Font stack do sistema | ⭐⭐ Zero KB, zero FOIT |
| 6 | `next/dynamic` para o raro e pesado | ⭐⭐ Exportação de PDF e afins fora do bundle principal |
| 7 | React Compiler | ⭐ Só **depois** de medir. Custo: builds mais lentos |

### ⚠️ Armadilhas de medição

- **INP não entra no score do Lighthouse.** O proxy de lab é o **TBT** (maior peso individual, 30%). **Otimize TBT no lab e valide INP em campo.**
- `@lhci/cli@0.15.1` **fixa `lighthouse@12.6.1`**, enquanto o PageSpeed Insights roda LH 13. Os nomes de audit divergem. **Mitigação: asserte sobre métricas (LCP, TBT, CLS) e budgets de recurso, nunca sobre nomes de audit.**
- O CrUX só tem dados com volume — um projeto novo não terá. **Enviar `web-vitals` para o PostHog** é o RUM real.
- CPU throttling: a doc não publica multiplicadores fixos. Desde o Chrome 134 há **calibração automática** com presets de low-tier e mid-tier — é essa a opção certa.
- ⚠️ **Estado operacional do WebPageTest não confirmado** (403 persistente, docs 404, redirecionamento de domínio). Confirmar manualmente antes de depender.

**O teste que não tem substituto:** rodar o app num **Android de entrada real** antes de cada release. Emulador não sente calor, throttling térmico nem pressão de GC.

---

## CI

✅ **Repositório público = GitHub Actions grátis e ilimitado** (runners padrão). Isso remove qualquer desculpa de custo para rodar a suíte completa em todo push.

```yaml
# Pipeline conceitual
- typecheck + lint
- vitest        # domínio puro
- supabase test db   # pgTAP: RLS e append-only  ← inegociável
- testcontainers     # invariantes do ledger
- build + bundle budget  # falha se JS > 170 KB
- lighthouse ci      # assertions por métrica
- playwright         # 3-5 cenários, com throttling
```

Mais um cron diário: `pg_dump` para storage próprio (o plano gratuito do Supabase **não tem backup nenhum**) e um `select 1` para impedir a pausa por inatividade de 1 semana.

---

## Observabilidade

| Serviço | Uso | Free tier |
|---|---|---|
| **Sentry** | Erros + `replaysOnErrorSampleRate: 1.0`, `replaysSessionSampleRate: 0` | 5k erros, **50 replays**, 5 GB logs |
| **PostHog** | Eventos, funil, **session replay**, RUM de Web Vitals, feature flags | 1M eventos, 5k replays, 1M flags |
| **Axiom** | Logs estruturados de Server Actions e telemetria de sync | 500 GB/mês, permanente |

**Os 50 replays/mês do Sentry parecem ridículos e são** — mas com `replaysOnErrorSampleRate: 1.0` eles bastam.

> ⭐ **Ver o lojista tentando anotar um fiado num Android travando é o dado mais valioso que este projeto vai ter.** Analytics de pageview responde "quantas visitas". Replay responde *"ele desistiu no meio porque o campo de valor é ruim de digitar com uma mão segurando sacola?"*.

### O que instrumentar em primeiro lugar

| Sinal | Por quê |
|---|---|
| **Tamanho da fila do outbox** e idade do item mais antigo | Detecta sync quebrado antes do lojista perceber |
| **Tempo até flush** (p90) | > 24 h em massa = problema de infra |
| **Falhas de sync não resolvidas** | > 0,1% é incidente |
| **Divergência de saldo entre dispositivos** | **> 0 é incidente P0** |
| Duração do fluxo "anotar fiado" | A métrica-produto central |
| Taxa de "Desfazer" em 8 s | > 3% → investigar rótulos e polaridade |
| Crash-free sessions | > 99,5% |

### Feature flags: em código, sem serviço

Não contratamos serviço de feature flag, e a razão é honesta: **você é um dev. Um.** Não existe "time de produto querendo ligar experimento sem deploy", que é o problema que essas ferramentas resolvem.

E adicionar um serviço de flag é adicionar **uma dependência de rede no caminho crítico de um app que precisa funcionar offline** — o oposto do requisito.

Usamos o **Flags SDK (MIT) com `decide()` em código**. É "flags as code": o *call site* não muda quando um adapter for adicionado depois. Ver [ADR-0021](../05-adr/0021-feature-flags-em-codigo.md).

---

## Checklist de release

**Integridade**
- [ ] Todas as 10 invariantes do ledger passam
- [ ] Suíte pgTAP de RLS verde
- [ ] Os 8 cenários de sincronização passam
- [ ] `pg_dump` do dia confirmado e **restaurado num banco de teste**

**Segurança**
- [ ] Database Advisors (Splinter) sem alerta crítico
- [ ] Toda view exposta tem `security_invoker = on`
- [ ] Toda policy tem `TO authenticated` + `(select …)` + índice na coluna
- [ ] Toda tabela nova tem `store_id` e RLS habilitada e forçada

**Layout**
- [ ] Matriz completa: Android 8→15 × gestos e 3 botões × 5" e 6,7" × fonte 100/130/200% × teclado aberto
- [ ] Nenhum botão primário abaixo do inset de navegação

**Performance**
- [ ] JS 1ª carga ≤ 170 KB
- [ ] LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT dentro do orçamento
- [ ] Testado em Android de entrada **real**
- [ ] Página pública < 50 KB

**Produto**
- [ ] Nenhuma interrupção no caminho de anotar ou receber
- [ ] Item offline visualmente idêntico ao online
- [ ] As 8 travas de cobrança ativas e testadas
- [ ] Nenhuma palavra da lista proibida na interface
