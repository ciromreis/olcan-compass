# Avaliação Honesta: Sistema de Companions Aura

---
title: Avaliação Honesta Sistema Companions
type: drawer
layer: 04
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

**Resumo**: Auditoria franca sobre o estado de implementação do sistema de companheiros virtuais (Aura), identificando o que é funcional vs. o que é placeholder.
**Importância**: Alto
**Status**: Auditado
**Camada (Layer)**: Identidade
**Tags**: #aura #companheiros #audit #gamificação #honestidade
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
Esta avaliação combate a "ilusão de progresso" na gamificação. No BMAD, o sistema Aura deve ser um motor de retenção real. Se ele for apenas visual sem mecânica de fundo, ele falha em seu propósito estratégico. Este audit foca no que precisamos para tornar o Companion um elemento indispensável na jornada.

## Conteúdo

### Status de Implementação (Realidade: 30% Concluído)
- **Funcional**: Operações básicas de cuidado (Nutrir, Treinar, Descansar) com persistência via `apiClient`.
- **Placeholder**: Evolução visual real (as trocas de forma ainda são estáticas), sistema de batalhas e guildas (zero código de frontend).
- **Crítico**: O Companion é atualmente **invisível** na navegação principal e pouco proeminente no dashboard.

### Problemas Identificados
1. **Stores Conflitantes**: Três stores diferentes (`canonical`, `real`, `normal`) gerenciam o companheiro, o que é um risco de estado.
2. **Descobrimento**: Novos usuários não têm um fluxo de "nascimento" ou escolha de primeiro companheiro.

### Recomendações Prioritárias
- Integrar o Companion permanentemente na barra lateral de navegação.
- Criar o "Hatching Ceremony" vinculado ao Quiz Olcan Compass Core.
- Unificar o gerenciamento de estado em uma única `useCompanionStore`.

## 🔗 Referências Relacionadas
- [[04_Ecossistema_Aura/Estrategia_de_Gamificacao]]
- [[04_Ecossistema_Aura/Spec_Gamificacao_Olcan Compass Core]]
- [[03_Produto_Forge/PRD_Geral_Olcan]]

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Verdade_do_Produto]] ← Estado atual
