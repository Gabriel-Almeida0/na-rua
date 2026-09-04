# ADR-0023 · Vercel Pro obrigatório antes do primeiro faturamento

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Este é o maior risco **não-técnico** do projeto, e ele passa despercebido com facilidade.

Documentação oficial da Vercel, citação literal:

> **"Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan."**

E a definição é ampla:

> *"any Deployment that is used for the purpose of financial gain of **anyone** involved in **any part of the production** of the project, including a paid employee or consultant writing the code"*

Inclui explicitamente qualquer forma de solicitar ou processar pagamento — **e até pedir doações.**

## Decisão

- **Fase de portfólio puro** (sem cobrar, sem doação, sem anúncio): **Vercel Hobby**, R$ 0
- **No momento em que o primeiro lojista pagar qualquer coisa: Vercel Pro** (US$ 20/seat/mês), **antes** e não depois

Isso é um **marco explícito do roadmap**, não uma nota de rodapé.

## Alternativa

**Cloudflare Workers/Pages**, que não tem essa cláusula. Fica registrada como plano B legítimo se o custo for proibitivo no momento da transição.

## Consequências

**Positivas** — o custo é previsível e está planejado. E quando ele chegar, o produto já se paga: a US$ 45/mês total (Supabase Pro US$ 25 + Vercel Pro US$ 20), **dois assinantes de R$ 29,90 cobrem a infra inteira**.

**Negativas** — é um degrau de custo. Mas é conhecido, é pequeno, e é a diferença entre operar dentro dos termos e operar fora deles.

**Limites orientativos do Hobby:** 100 GB de Fast Data Transfer, 4 CPU-hrs, 1M invocações, 100 deploys/dia, 1 build concorrente.
