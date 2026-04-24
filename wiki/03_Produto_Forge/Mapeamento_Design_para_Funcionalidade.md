---
title: Mapeamento Design para Funcionalidade
type: drawer
layer: 3
status: active
last_seen: 2026-04-23
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
  - Design_System_Central
---

# Mapeamento Design para Funcionalidade

**Resumo**: Documento de ponte entre os mockups/designs no Figma e as funcionalidades implementadas no código do Olcan Compass v2.5.
**Importância**: Médio
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #design #UX #funcionalidade #mapeamento #implementação
**Criado**: 24/03/2026
**Atualizado**: 23/04/2026

---

## ⚠️ IMPORTANTE:Fonte de Verdade

**CONSULTAR PRIMEIRO**: [[wiki/03_Produto_Forge/Design_System_Central]] — Este documento contém a referência definitiva de TODOS os elementos de design (cores, tipografia, componentes, naming).

---

## 🧠 Contexto BMAD
Este mapeamento garante a "Fidelidade do Breakthrough". No BMAD, a experiência visual (UI) deve ser o veículo perfeito para o valor funcional. Se o design promete uma interação e o código não entrega, o breakthrough é enfraquecido.

## Conteúdo

### Sistema Liquid Glass (Produção)
- **Conceito**: Interfaces translúcidas que simbolizam clareza e futuro.
- **Componentes**: Glass Cards, Backgrounds dinâmicos, Micro-interações Framer Motion.
- **Classes CSS**: `.liquid-glass`, `.glass-panel`, `.card-surface` — veja `globals.css`

### Mapeamento por Tela
- **Onboarding Quiz**: Design focado em baixo atrito -> Conectado à `oiosApi`.
- **Narrative Forge HUD**: Interface de editor rica -> Conectado à `forgeApi`.
- **Aura Companion Widget**: HUD flutuante -> Conectado à persistência de estado do companheiro.
- **Dossier Export**: PDF styling com cores #001338 — see `enhanced-export.ts`

### Cores por Funcionalidade
| Area | Cor Primary | Accent |
|------|-----------|-------|
| Forge/Editor | brand-500 (#001338) | — |
| Routes | brand-400 (#213F73) | — |
| Aura/Companion | #8B5CF6 (violet) | #F59E0B |
| Gamification | #F59E0B (amber) | — |
| Marketplace | brand-500 (#001338) | Semantic success |
| Tasks | brand-500 (#001338) | — |

## 🔗 Referências Relacionadas
- [[wiki/03_Produto_Forge/Design_System_Central]] — **FONTE DE VERDADE**
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[03_Produto_Forge/Implementacao_Construtor_CV]]

---

## Ligações
- [[Design_System_Central]] ← Referência definitiva
- [[Biblioteca_de_Componentes_UI_MVP]] ← Lista componentes
- [[Arquitetura_v2_5_Compass]] ← Arquitetura técnica
