# ADR-0024 · `pg_dump` diário desde o primeiro dia

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Dois fatos que, juntos, formam um risco inaceitável:

1. 🔴 **O plano gratuito do Supabase não tem backup nenhum.** Nem snapshot, nem PITR.
2. O produto guarda **o dinheiro que o lojista tem a receber**, e perda de dados é a causa nº 1 de desinstalação nos apps concorrentes.

> *"Eu perdi meu celular e quando fui logar em outro eu perdi tudo, minha carteira de clientes... Fiquei num prejuízo enorme."*

Se um app perder o dado do lojista, ele não volta. Não há segunda chance neste job.

## Decisão

**`pg_dump` diário para storage próprio, a partir do primeiro dia em que existir dado real de cliente.** Cron gratuito no GitHub Actions.

Mais um `select 1` diário, que resolve de quebra outro problema: **o plano gratuito pausa o projeto após 1 semana de inatividade, com resume manual.**

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Confiar no backup do provedor | **Não existe no Free.** No Pro existe, e ainda assim manteríamos o dump próprio — backup que você não consegue restaurar sozinho não é backup |
| Só migrar para o Pro | Resolve, mas só quando houver receita. O backup precisa existir **antes** disso |
| Backup semanal | Perder uma semana de lançamentos de fiado é perder dinheiro real do lojista |

## Consequências

**Positivas** — custo zero (repositório público = Actions ilimitado), e o dado sobrevive a qualquer coisa que aconteça com o provedor.

**Negativas** — mais uma peça de infra para manter. Mitigação: é um workflow de ~15 linhas.

## Regra de aceite

> **Um backup que nunca foi restaurado não é um backup.**

O [checklist de release](../04-arquitetura/07-qualidade-e-observabilidade.md) exige, além do dump do dia, **uma restauração confirmada num banco de teste**.
