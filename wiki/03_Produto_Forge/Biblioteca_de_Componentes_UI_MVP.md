---
title: Biblioteca de Componentes UI MVP
type: drawer
layer: 3
status: active
last_seen: 2026-04-23
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
  - Design_System_Central
---

# Biblioteca de Componentes UI (MMXD MVP)

**Resumo**: Status e guia da biblioteca de componentes UI compartilhada (Design System), utilizando Tailwind CSS e Radix UI para garantir consistência visual no ecossistema.
**Importância**: Médio
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #design-system #componentes #UI #frontend #reutilização
**Criado**: 31/03/2026
**Atualizado**: 23/04/2026

---

## ⚠️ IMPORTANTE:Fonte de Verdade

**CONSULTAR PRIMEIRO**: [[wiki/03_Produto_Forge/Design_System_Central]] — Este documento contém a referência definitiva de TODOS os elementos de design (cores, tipografia, componentes, naming).

A Biblioteca de Componentes abaixo é um extrato parcial. Para informações completas, veja Design_System_Central.

---

## 🧠 Contexto BMAD
A Biblioteca MMXD é o "Lego Técnico" da Olcan. No BMAD, componentes reutilizáveis permitem a montagem rápida de novas telas (breakthroughs de interface) com zero custo de re-design, mantendo a integridade visual da marca em todos os pontos de contato.

## Conteúdo

### Componentes Core (Exportados de ui-components)
- **GlassCard**: Container translúcido com blur — `packages/ui-components/src/components/liquid-glass/GlassCard.tsx`
- **GlassButton**: Botão com gradiente e animação — `packages/ui-components/src/components/liquid-glass/GlassButton.tsx`
- **GlassInput**: Campo de entrada — `packages/ui-components/src/components/liquid-glass/GlassInput.tsx`
- **GlassModal**: Modal glass — `packages/ui-components/src/components/liquid-glass/GlassModal.tsx`
- **ProgressBar**: Barra de progresso — `packages/ui-components/src/components/gamification/ProgressBar.tsx`

### Componentes App Local
- **Button**: Com variante `btn-liquid`
- **Card**: Com variantes glass
- **TextInput/Textarea/Select**: Com brand ring focus
- **Avatar, Badge, Progress, ProgressRing**
- **PlanGate**: Paywall component
- **Toast**: Notificações

### Dependências
- **Tailwind CSS**: Estilização baseada em utilitários.
- **Radix UI**: Primitivas de acessibilidade (Modais, Tooltips).
- **Framer Motion**: Orquestração de animações.

## Componentes de Domínio (Forge, Routes, Aura, Marketplace)
Para lista completa, consulte Design_System_Central Section 4.3.

## 🔗 Referências Relacionadas
- [[wiki/03_Produto_Forge/Design_System_Central]] — **FONTE DE VERDADE**
- [[02_Arquitetura_Compass/Guia_de_Design_Visual_Liquid_Glass]]
- [[03_Produto_Forge/Mapeamento_Design_para_Funcionalidade]]

---

## Ligações
- [[Design_System_Central]] ← Referência definitiva
- [[Mapeamento_Design_para_Funcionalidade]] ← UI-Feature mapping
- [[PRD_Geral_Olcan]] ← PRD Geral
