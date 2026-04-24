---
title: PRD Master Ethereal Glass
type: drawer
layer: 3
status: active
last_seen: 2026-04-23
backlinks:
  - PRD_Geral_Olcan
  - Guia_Mestre_Design_System_Master
  - Verdade_do_Produto
  - Design_System_Central
---

# PRD Master: Ethereal Glass (Visão de Produto)

**Resumo**: Documento de Visão e Requisitos de Produto para a interface "Ethereal Glass". Este é o blueprint estético e funcional para a experiência mobile-first da Olcan Compass.
**Importância**: Crítica (Bússola de Produto)
**Status**: Ativo
**Camada (Layer)**: Produto / Design
**Tags**: #prd #etherealglass #design #mobile #ux #vision
**Criado**: 15/04/2026
**Atualizado**: 23/04/2026

---

## ⚠️ STATUS: Visão Aspiracional — NÃO Implementado

**IMPORTANTE**: Este documento descreve a VISÃO FUTURA do design system. As características abaixo são aspiracionais e NÃO estão implementadas no código atual.

**Para a implementação ATUAL, consultar**: [[wiki/03_Produto_Forge/Design_System_Central]]

As diferenças principais:
- Ethereal Glass usa cores Dark/Midnight como background
- Produção usa Light theme (#F8FAFC)
- Fire Accent (#FF844B) NÃO implementada em Tailwind
- Glows de Ambiente NÃO implementados

---

## 🎯 O Pitch
O Olcan Compass é um sistema operacional de carreira imersivo para profissionais de alta ambição do Global South (especialmente Brasil/LATAM). Ele substitui planilhas caóticas por um "cockpit" estratégico e calmo para a migração internacional de carreira.

---

## 🎨 Direção de Design: "Ethereal Glass"
Inspirado por **Linear (Mobile)** e **Amie**, o design utiliza:
- **Superfícies Matte**: Tons de "Midnight" profundos.
- **Frosted Glass**: Paineis translúcidos com blur de fundo (24px).
- **Glows de Ambiente**: Substituição de preenchimentos sólidos por brilhos suaves.
- **Profundidade Cinemática**: Uso de camadas Z para hierarquia de informações.

### Paleta de Cores Core
- **Midnight (#001338)**: Fundo principal.
- **Fire Accent (#FF844B)**: Ações de momentum e progresso.
- **Glass Surface**: `rgba(255, 255, 255, 0.08)`.

---

## 🛤️ Rotas e Fluxos de Alta Fidelidade

O sistema é dividido em rotas de jornada que espelham o progresso do usuário:

1.  **The Diagnostic Mirror**: Chat inicial bot-driven para identificação de arquétipo.
2.  **The Living Dashboard**: Um mapa de constelação não-linear de progresso.
3.  **Route: FIND (Discovery)**: Cartas de vidro empilhadas para descoberta de oportunidades (Match Score).
4.  **Route: DECIDE (Matrix)**: Gráficos de radar e "Fear-setting" modals para tomada de decisão.
5.  **Route: BUILD (Editor)**: Revisão de documentos com "Olcan Rubric" (Scores de IA).
6.  **Sprint Command**: Check-in semanal com visualização de streak "Fire".

---

## 🧬 Mecânicas Fundamentais
- **Aha-Moment Paywall**: O diagnóstico culmina em uma revelação de arquétipo tão precisa que gera o desejo imediato de entrar no Compass.
- **Corporificação**: Pistas sobre a mistura de arquétipos do usuário são dadas através dos **Companions** (Sistema Aura).

---

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Catalogo_de_Rotas_UI.md]]
- [[02_Arquitetura_Compass/Guia_Mestre_Design_System_Master.md]]
- [[wiki/03_Produto_Forge/Design_System_Central]] — **IMPLEMENTAÇÃO ATUAL**

---

## Ligações
- [[Design_System_Central]] ← Implementação atual (definitiva)
- [[Biblioteca_de_Componentes_UI_MVP]] ← Lista componentes
- [[Guia_de_Design_Visual_Liquid_Glass]] ← Guia de implementação
- [[Guia_Mestre_Design_System_Master]] ← Filosofia sistema
- [[Verdade_do_Produto]] ← Estado atual
