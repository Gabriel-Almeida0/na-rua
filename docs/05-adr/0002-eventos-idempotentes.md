# ADR-0002 · Sincronização replica eventos idempotentes com ID gerado no cliente

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

O app funciona offline por design. O lojista lança fiado sem rede, a rede volta, e o lançamento precisa subir — sem duplicar, sem sumir, e sem perguntar nada a ele.

Cenários reais: toque duplo no botão salvar, retry automático, sinal oscilando no meio do POST, dois balconistas offline lançando para o mesmo cliente.

## Decisão

1. O **ID do lançamento é um ULID/UUIDv7 gerado no dispositivo**, antes de qualquer chamada de rede.
2. A sincronização replica **eventos**, nunca saldo.
3. O servidor aplica `INSERT … ON CONFLICT (id) DO NOTHING`.
4. O servidor **nunca envia DELETE** para o cliente.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| **LWW no campo `saldo`** | 🔴 Com saldo 100, A lança +50 e B lança +40 offline → o merge produz 150 **ou** 140. **Uma das compras evaporou.** O sistema converge lindamente para um número errado, sem erro em lugar nenhum |
| **PN-Counter CRDT no saldo** | Converge corretamente para 190, mas **não garante invariantes**: o limite de crédito foi violado e nenhuma réplica jamais teve a informação para impedir. Invariante de desigualdade é o exemplo canônico do que CRDT não resolve sem coordenação |
| Idempotency key só na borda da API | Funciona, mas gerar o ID na **origem** cobre também o retry local e a fila offline |
| UUIDv4 | Aleatório, fragmenta o índice B-tree do Postgres e degrada insert em volume |

## Consequências

**Positivas**
- Reenvio é inofensivo por construção
- **Dois balconistas offline não conflitam**: ambos os lançamentos entram e somam. Correto por construção
- Auditoria de graça: quem lançou, quando e de qual dispositivo está na própria linha
- ULID/UUIDv7 são ordenáveis por tempo, preservando a localidade do índice

**Negativas**
- O limite de crédito **não pode ser garantido offline**. A decisão de produto correspondente: o limite **avisa, nunca bloqueia**, e o estouro descoberto na sincronização vira alerta ao dono — nunca rollback silencioso. *Rollback silencioso de dinheiro é pior que estouro de limite.*

## Fontes

- Stripe — *Designing robust and predictable APIs with idempotency*
- *Consistent Local-First Software: Enforcing Safety and Invariants* (2024)
