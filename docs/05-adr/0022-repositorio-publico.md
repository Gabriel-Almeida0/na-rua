# ADR-0022 · Repositório público

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

É um projeto de portfólio. E há um efeito colateral que não é óbvio.

## Decisão

**Repositório público no GitHub, licença MIT.**

## Justificativa

**1. É portfólio.** Um recrutador precisa conseguir abrir o código e a documentação direto do link.

**2. ⭐ CI vira gratuito e ilimitado.** Documentação oficial: *"GitHub Actions usage is free... for public repositories that use standard GitHub-hosted runners."*

Isso importa concretamente:

| | Repo privado | Repo público |
|---|---|---|
| Minutos/mês (Free) | 2.000 | **ilimitado** |
| Testcontainers + pgTAP + Playwright em todo push | Come a cota rápido | Sem restrição |

A suíte de [testes de RLS](0009-regras-de-rls.md) é inegociável e roda em todo push. Repositório público remove qualquer desculpa de custo para não rodá-la.

**3. Documentação pública é o produto do portfólio.** A pesquisa e as ADRs valem tanto quanto o código — e só valem se forem legíveis por quem chega.

## Alternativas rejeitadas

**Repositório privado.** Perde o link clicável, perde o CI gratuito, e não protege nada que precise de proteção: não há segredo comercial no código, e os segredos de verdade vivem em variáveis de ambiente.

## Consequências

**Positivas** — CI ilimitado, portfólio navegável, e a disciplina saudável de escrever sabendo que alguém vai ler.

**Negativas / cuidados obrigatórios**
- ❌ Nenhuma chave, token ou string de conexão no repositório — nunca
- ❌ Nenhum dado real de lojista ou de cliente, nem em fixture, nem em screenshot
- ✅ Secret scanning e push protection habilitados
- ✅ Dados de teste sempre sintéticos
