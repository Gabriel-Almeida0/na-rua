# ADR-0020 · Arquitetura: vertical slices + núcleo de domínio puro

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O erro clássico em projeto de portfólio é achar que "impressiona tecnicamente" significa "tem muitas camadas". Não significa.

**A complexidade real deste projeto não está na organização das camadas.** Está em três lugares: **dinheiro** (saldo, arredondamento, estorno), **isolamento multi-tenant**, e **sincronização offline** (duas fontes de verdade).

> Camada gasta em outra coisa é camada roubada dessas três.

## Decisão

**Vertical slices** — cada fatia com sua página, Server Action, schema e query, combinando naturalmente com o App Router:

```
app/caderneta/  · app/clientes/  · app/lembretes/  · app/fechamento/
```

Mais **um núcleo de domínio puro em uma pasta, não quatro camadas**:

```
lib/dominio/    calcularSaldo() · Centavos · validarEncargos() · montarLembrete()
```

Funções puras: sem I/O, sem React, sem Drizzle. **Isso entrega o benefício real da arquitetura hexagonal — o domínio testável em isolamento — sem nenhuma interface, container de DI ou repositório.**

Mais **DDD muito leve**: linguagem ubíqua ("fiado", "caderneta", "quitar") e tipos de valor (`Centavos`). É 100% do DDD que dá retorno aqui.

## Alternativas rejeitadas

| Padrão | Por que não |
|---|---|
| **Hexagonal / Ports & Adapters completo** | O ponto é poder trocar o adapter. **Não vamos trocar o Postgres.** `IRepositorioDeFiado` com uma única implementação é cerimônia pura: paga indireção em todo arquivo e nunca cobra o benefício |
| **Clean Architecture (4 camadas)** | O benefício é de **colaboração**: ownership de camadas, trabalho paralelo entre times. **Não existe quando um dev é dono de tudo.** Todo custo, zero benefício |
| **Repository genérico sobre Drizzle** | O Drizzle já é a abstração sobre SQL. Envolvê-lo é abstrair uma abstração: perde type-safety composicional, ganha nada |
| **CQRS com barramento/mediator** | Fowler: *"you should be very cautious about using CQRS"*, *"adding CQRS to such a system can add significant complexity"*. Este app é CRUD com regra financeira — exatamente o caso que ele descreve como inadequado |
| **Event Sourcing "de verdade"** | ⚠️ **Não confundir com o ledger.** Ledger = fatos de negócio imutáveis que já são a linguagem do domínio. Event sourcing = o estado da aplicação inteira reconstruído de eventos, com versionamento de schema, projeções e replay. **O primeiro é contabilidade. O segundo é infraestrutura. Fazemos o primeiro** |
| **Monorepo / Turborepo** | Um app, um deploy, um dev. É decoração |

## Consequências

**Positivas** — o esforço arquitetural fica onde o domínio é difícil; o domínio é testável sem mock; a leitura do código é local (tudo de uma feature num lugar).

**Negativas** — menos "arquitetura visível" para quem confunde camadas com qualidade. É um trade-off deliberado, e este ADR existe para defendê-lo.

> Um revisor sênior lendo *"decidi por ledger append-only + idempotency keys porque isso torna a sincronização offline uma união de conjuntos sem conflito"* fica muito mais impressionado do que lendo `src/application/usecases/CreateFiadoUseCase.ts`.
