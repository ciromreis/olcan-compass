---
title: Blueprint Sistema de Tarefas
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
---

# Blueprint: Motor de Tarefas (Gamified Task Engine)

**Resumo**: Especificação técnica e funcional do sistema de gestão de tarefas do Olcan Compass, integrando mecânicas de RPG, XP, Auras e o "Narrative Forge".
**Importância**: Crítica (Core SaaS)
**Status**: Ativo
**Camada (Layer)**: Produto / Gamificação
**Tags**: #tasks #xp #rpg #gamification #forge #roadmap
**Criado**: 15/04/2026

---

## 🎯 Visão Geral
O Motor de Tarefas não é apenas um "To-do list". É um sistema de orientação que guia o usuário através da "Jornada do Herói" da migração de carreira, recompensando o momentum e penalizando a inércia via mecânicas de **Aura e Streaks**.

---

## 🎲 Mecânicas de RPG e Progressão

### 1. Sistema de Níveis (1 a 10)
O usuário evolui de **Explorador** até **Lenda**. Cada nível desbloqueia novos benefícios na plataforma (ex: acesso a mentoria, templates premium).

### 2. Cálculo de XP (Pontos de Experiência)
| Atividade | Recompensa (XP) | Observação |
| :--- | :--- | :--- |
| Tarefa Crítica | 50 XP | Ex: Agendamento de Visto. |
| Tarefa Padrão | 10 XP | Ex: Revisar parágrafo do CV. |
| Milestone de Rota | 150-500 XP | Atingir 25%, 50%, 100% da rota. |
| Check-in Diário | 5 XP | Mantém a Aura acordada. |

### 3. Sistema de Streaks (Fogo)
- **Janela de Graça**: 36 horas. Isso permite que usuários em diferentes fusos horários não percam o streak por um atraso de poucas horas.
- **Bônus**: +5 XP por dia de streak ativo.

---

## 🛠️ O Motor de Templates (Routes)
O sistema carrega templates predefinidos dependendo do destino escolhido no onboarding:
- **Canadá (Express Entry)**: ~40 tarefas táticas.
- **Alemanha (Opportunity Card)**: ~35 tarefas táticas.
- **EUA (EB-2 NIW)**: Foco em evidências e narrativas.

---

## 🐉 Integração com Aura (Companions)
A Aura atua como o "Narrative Engine" das tarefas:
1. **Sugestão**: "Notei que você está a 2 tarefas de desbloquear a 'Medalha do Navegador'. Vamos fechar o CV hoje?"
2. **Celebração**: Animações cinemáticas e mensagens personalizadas ao completar tarefas de alta dificuldade.
3. **Alerta de Inércia**: A Aura "esfria" visualmente se o usuário ignorar tarefas críticas por mais de 7 dias.

---

## 🏁 Critérios de Sucesso (KPIs)
- **Engajamento**: >70% dos usuários completam ao menos 1 tarefa/dia.
- **Retenção de Streak**: >50% mantêm streaks de 7+ dias.

---

## 🔗 Referências Relacionadas
- [[04_Ecossistema_Aura/Mestre_de_Companions.md]]
- [[02_Arquitetura_Compass/Seguranca_e_Entitlements.md]]
- [[03_Produto_Forge/PRD_Master_Ethereal_Glass.md]]
