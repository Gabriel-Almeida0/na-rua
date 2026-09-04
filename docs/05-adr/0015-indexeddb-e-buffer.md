# ADR-0015 · IndexedDB é buffer de trânsito, não fonte de verdade

**Status:** Aceita · **Data:** 2026-09-04

## Contexto

Quase todo tutorial de PWA trata o IndexedDB como armazenamento durável. **Ele não é** — e num app financeiro isso é falha crítica.

| Navegador | Eviction |
|---|---|
| Chrome/Chromium | Sob pressão de disco, LRU — **pula origens com persistência concedida** |
| Firefox | Sob pressão. Persistente: até 50% do disco |
| **Safari** | 🔴 **Apaga o storage de origens sem interação do usuário nos últimos 7 dias de uso do navegador** |

Um lojista que sai de férias por uma semana e usa iPhone perderia a caderneta local.

## Decisão

1. **Pedir persistência**, dentro de um gesto do usuário, depois que ele salvou algo relevante:
   ```ts
   const persistido = await navigator.storage.persist()
   ```
2. **Tratar o IndexedDB como buffer de trânsito. A verdade é o Postgres.**
3. Alertar quando a fila ficar velha demais.
4. [`pg_dump` diário](0024-backup-proprio.md) e exportação local disponível a qualquer momento.

## O insight que muda o produto

O Chrome **não mostra prompt** para persistência — decide por heurística: nível de engajamento, **site instalado ou favoritado**, e **permissão de notificação concedida**.

> ⭐ Pedir permissão de notificação e conseguir a instalação na tela de início **não são só features de engajamento — são o mecanismo pelo qual o app conquista storage persistente.**

Isso reposiciona o convite de instalação de "nice to have" para **requisito de durabilidade**, e muda quando e como ele é oferecido.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Assumir que o IndexedDB é durável | Falso em todos os navegadores, e catastroficamente falso no Safari |
| Depender só da nuvem | Contradiz o requisito offline. O app precisa funcionar sem rede |
| OPFS | Sujeito às mesmas regras de cota e eviction |

## Consequências

**Positivas** — o modelo mental correto se propaga para todo o resto do design: fila com idade monitorada, alerta de sync velho, backup próprio, exportação sempre disponível.

**Negativas** — `persist()` pode retornar `false`, e o usuário pode limpar os dados do site. Não há como impedir. A mitigação é ter **sempre** uma segunda cópia: no servidor e no backup.
