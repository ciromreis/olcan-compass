---
title: Design System Central (Source of Truth)
type: drawer
layer: 3
status: active
last_seen: 2026-04-23
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
  - Grafo_de_Conhecimento_Olcan
  - Guia_Mestre_Design_System_Master
  - Guia_de_Design_Visual_Liquid_Glass
  - Biblioteca_de_Componentes_UI_MVP
  - Mapeamento_Design_para_Funcionalidade
  - PRD_Master_Ethereal_Glass
  - PRD_Geral_Olcan
  - Arquitetura_v2_5_Compass
  - Carta_do_Projeto_Olcan_v2.5
  - Backend_API_Audit_v2_5
  - SPEC_IO_System_v2_5
  - Repositorio_Organizacao_v2_5
  - Padroes_de_Codigo
  - INFRAESTRUTURA_OVERVIEW
---

<!-- 
  O DESIGN SYSTEM OLCAN COMPASS — DOCUMENTO MESTRE VERDADE
  ============================================
  
  Este documento é a fonte definitiva de VERDADE para TODOS os elementos de design 
  do Olcan Compass v2.5. Qualquer questão de design deve ser resolvida 
  consultando este documento PRIMERO.
  
  McKinsey-style MECE Organization:
  - Cores (Colors)
  - Tipografia (Typography)  
  - Componentes (Components)
  - Naming Conventions
  - Imagens e Assets
  - Sistema Glass
  - Backlinks Completos
-->

# Design System Central — Olcan Compass v2.5
## Fonte Definitiva de Verdade para Design

**Propósito**: Este documento consolida TODO o sistema de design do Olcan Compass em uma única fonte de verdade, organizando MECE (Mutually Exclusive, Collectively Exhaustive). Qualquer agente ou humano deve consultar este documento primeiro antes de implementar elementos de design.
**Status**: Ativo
**Última Atualização**: 2026-04-23
**Autoridade**: SOVEREIGN GROUND TRUTH (v2.5)

---

## Tabela de Conteúdo

1. [Cores (Colors)](#1-cores-colors)
2. [Tipografia (Typography)](#2-tipografia-typography)
3. [Sistema Glass](#3-sistema-glass)
4. [Biblioteca de Componentes](#4-biblioteca-de-componentes)
5. [Convenções de Naming](#5-convenções-de-naming)
6. [Imagens e Assets](#6-imagens-e-assets)
7. [Arquetipos e Cores de Companion](#7-arquetipos-e-cores-de-companion)
8. [Tokens Ortográficos PT-BR](#8-tokens-ortográficos-pt-br)
9. [Especificações de Export (PDF/DOCX)](#9-especificações-de-export-pdfdocx)
10. [Mapa de Backlinks](#10-mapa-de-backlinks)

---

## 1. Cores (Colors)

### 1.1 Paleta Primária — Brand (Definitiva)

| Token | Hex | Uso | Fonte |
|-------|-----|-----|-------|
| `brand-500` | `#001338` | Cor primária — Navy Deep | `tokens.json` + `globals.css` |
| `brand-600` | `#000E2C` | Hover states | `tokens.json` |
| `brand-400` | `#213F73` | Links, secundárias | `tokens.json` |
| `brand-300` | `#566C94` | Bordas subtle | `tokens.json` |
| `brand-200` | `#8B9AB5` | Backgrounds subtle | `tokens.json` |
| `brand-100` | `#C0C8D6` | Superfícies claras | `tokens/json` |
| `brand-50` | `#E6EAF0` | Hover, highlights | `tokens.json` |

### 1.2 Paleta Secundária — Navy Extended

| Token | Hex | Uso |
|-------|-----|-----|
| `navy-500` | `#2C335A` | Gradientes |
| `navy-600` | `#21264D` | Botões liquid |
| `navy-700` | `#151A33` | Dark sections |
| `navy-800` | `#0A0D1A` | Footer escuro |
| `navy-900` | `#05060D` | Backgrounds max |

**Fonte**: `globals.css` lines 7-22 define `--olcan-navy-*` e `--olcan-brand-*`

### 1.3 Cores de Accent (Momentum/Progress)

| Token | Hex | Uso | Status |
|-------|-----|-----|--------|
| `fire` | `#FF844B` | Momentum, progress indicators | PRD (ASPIRATIONAL) — NÃO implementada em Tailwind |
| `gold` | `#FBBF24` | Hefesto Fire (Legacy) | `_GRAVEYARD/tasks.md` — DEPRECATED |
| `blue-accent` | `#3B82F6` | Interactive/links | `SPEC_IO_System_v2_5.md` |

**⚠️ ATENÇÃO**: `#FF844B` (Fire Accent) está definida no PRD_Master_Ethereal_Glass, mas NÃO existe em `tokens.json` ou Tailwind. Precisa ser adicionada.

### 1.4 Cores Superficiais (Surface)

| Token | Valor | Uso |
|-------|-------|-----|
| `surface-bg` | `#F8FAFC` | Page background |
| `surface-card` | `rgba(255,255,255,0.8)` | Card glass |
| `surface-elevated` | `#FFFFFF` | Elevated surfaces |
| `surface-overlay` | `rgba(10,10,11,0.4)` | Modals, overlays |
| `surface-glass` | `rgba(255,255,255,0.15)` | Glass panels |

**Fonte**: `tokens.json` lines 84-90

### 1.5 Cores Semânticas (Semantic)

| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#3D8B5E` | Positive states |
| `warning` | `#64748B` | Caution |
| `error` | `#962D2D` | Error/negative |
| `info` | `#4A7A5C` | Information |

### 1.6 Cores de Fundo Alternativas

| Token | Hex | Uso |
|-------|-----|-----|
| `bone-500` | `#F9F6F0` | Cream backgrounds |
| `silver-500` | `#ADB5BD` | Neutral gray |
| `ink-500` | `#0A0A0B` | Text primary |

### 1.7 Cores de Texto (Text)

| Token | Valor |
|-------|-------|
| `text-primary` | `#0A0A0B` |
| `text-secondary` | `#475569` |
| `text-muted` | `#94A3B8` |
| `text-inverse` | `#F8FAFC` |

### 1.8 Consolidado — CSS Custom Properties

```css
/* globals.css — These are the DEFINITIVE values */
:root {
  /* Brand */
  --olcan-brand-500: #001338;
  --olcan-brand-700: #000d28;
  
  /* Navy Extended */
  --olcan-navy-500: #2c335a;
  --olcan-navy-600: #21264d;
  
  /* Semantic */
  --olcan-success: #3d8b5e;
  --olcan-warning: #a3aab2;
  --olcan-error: #c4402a;
  --olcan-info: #4a7a5c;
  
  /* Surface */
  --surface-bg: #f8fafc;
  --surface-card: rgba(255,255,255,0.8);
  
  /* Text */
  --text-primary: #0a0d1a;
  --text-secondary: #4a507a;
  --text-muted: #8a8a8a;
}
```

---

## 2. Tipografia (Typography)

### 2.1 Família de Fontes (Definitivas)

| Uso | Font Family | Fallback | Fonte |
|----|-----------|----------|-------|
| Headings (Display, H1-H2) | `DM Serif Display` | serif | `tokens.json` |
| Body/UI (H3-H6, paragraphs) | `DM Sans` | sans-serif | `tokens.json` |
| Mono (Code, data) | `JetBrains Mono` | monospace | `tokens.json` |
| Emphasis (Editorial) | `Source Sans 3` | sans-serif | `globals.css:386` |

### 2.2 Escala Tipográfica

| Token | Desktop | Mobile | Line Height | Font Weight | Letter Spacing |
|-------|---------|--------|------------|-------------|-----------------|
| `display` | 56px | 40px | 1.1 | 800 | -0.02em |
| `h1` | 40px | 32px | 1.2 | 700 | -0.01em |
| `h2` | 32px | 26px | 1.25 | 600 | -0.005em |
| `h3` | 24px | 20px | 1.3 | 600 | — |
| `h4` | 20px | 18px | 1.4 | 600 | — |
| `body-lg` | 18px | 16px | 1.6 | 400 | — |
| `body` | 16px | 14px | 1.6 | 400 | — |
| `body-sm` | 14px | 13px | 1.5 | 400 | — |
| `caption` | 12px | 11px | 1.4 | 500 | — |

### 2.3 Configuração Tailwind

```typescript
// apps/app-compass-v2.5/tailwind.config.ts
fontFamily: {
  heading: ["var(--font-heading)", "DM Serif Display", "serif"],
  emphasis: ["var(--font-emphasis)", "DM Sans", "sans-serif"],
  body: ["var(--font-body)", "DM Sans", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
}
```

### 2.4 Variantes Contraditórias Encontradas

| Fonte Mencionada | Localização | Status |
|----------------|------------|--------|
| `Source Sans` | PRD_Master_Ethereal_Glass:52 | CONTRADICTION — nunca implementada |
| `Montserrat, Inter` | `_GRAVEYARD/tasks.md` | DEPRECATED — legado |
| `Georgia` | `enhanced-export.ts` | Apenas para PDF output |

---

## 3. Sistema Glass

### 3.1 Implementações de Glass (Produção)

O sistema "Liquid Glass" é a implementação de производство atual. Existe em VARIAS formas:

| Classe CSS | Definição | Localização |
|------------|-----------|-------------|
| `.liquid-glass` | Base glassmorphism | `globals.css:150` |
| `.liquid-glass-hover` | Glass com hover | `globals.css:178` |
| `.glass-deep` | High blur (40px) | `globals.css:192` |
| `.glass-panel` | Panel (24px blur) | `globals.css:210` |
| `.glass-panel-dark` | Dark variant | `globals.css:222` |
| `.card-surface` | Card container | `globals.css:234` |
| `.frosted-overlay` | Overlay effects | `globals.css:287` |

### 3.2 Propriedades CSS do Glass

```css
/* Base Liquid Glass — Default */
.liquid-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(10,13,26,0.1);
}

/* Glass Panel — Enhanced */
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* Card Surface */
.card-surface {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(0,19,56,0.08);
}
```

### 3.3 Especificação PRD vs. Produção

| Característica | PRD (Aspiracional) | Produção (Atual) |
|--------------|------------------|----------------|
| Blur | 24px | 20px (liquid), 24px (panel) |
| Background | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.7)` |
| Glows de Ambiente | SIM | NÃO implementado |
| Profundidade Cinemática | SIM | NÃO implementado |

**STATUS**: PRD define Ethereal Glass como visão. Produção usa Liquid Glass (mais conservador).

---

## 4. Biblioteca de Componentes

### 4.1 Componentes UI Exports (Working)

Localização: `packages/ui-components/src/index.ts`

| Componente | Arquivo | Status |
|-----------|--------|--------|
| `GlassCard` | `components/liquid-glass/GlassCard.tsx` | ✅ EXPORTED |
| `GlassButton` | `components/liquid-glass/GlassButton.tsx` | ✅ EXPORTED |
| `GlassModal` | `components/liquid-glass/GlassModal.tsx` | ✅ EXPORTED |
| `GlassInput` | `components/liquid-glass/GlassInput.tsx` | ✅ EXPORTED |
| `ProgressBar` | `components/gamification/ProgressBar.tsx` | ✅ EXPORTED |
| `cn` (utility) | `utils/cn.ts` | ✅ EXPORTED |

### 4.2 Componentes UI — App Local

| Componente | Arquivo | Notas |
|-----------|--------|-------|
| `Button` | `src/components/ui/Button.tsx` | `btn-liquid` variant |
| `Card` | `src/components/ui/Card.tsx` | Glass variants |
| `TextInput` | `src/components/ui/TextInput.tsx` | Brand ring |
| `Textarea` | `src/components/ui/Textarea.tsx` | Brand ring |
| `Select` | `src/components/ui/Select.tsx` | Brand ring |
| `Progress` | `src/components/ui/Progress.tsx` | Brand fill |
| `ProgressRing` | `src/components/ui/ProgressRing.tsx` | Brand stroke |
| `Avatar` | `src/components/ui/Avatar.tsx` | Brand bg |
| `Badge` | `src/components/ui/Badge.tsx` | various |
| `PlanGate` | `src/components/ui/PlanGate.tsx` | Paywall |
| `Toast` | `src/components/ui/Toast.tsx` | Brand colors |
| `LoadingSpinner` | `src/components/loading/LoadingSpinner.tsx` | Brand spin |
| `ConfirmationModal` | `src/components/ui/ConfirmationModal.tsx` | Brand |
| `SuccessModal` | `src/components/modals/SuccessModal.tsx` | Brand |
| `UpgradeModal` | `src/components/modals/UpgradeModal.tsx` | Brand |
| `OnboardingWelcomeModal` | `src/components/modals/OnboardingWelcomeModal.tsx` | Brand |

### 4.3 Componentes de Domínio

| Categoria | Componentes |
|-----------|-------------|
| **Forge** | `DossierHub.tsx`, `DocumentGuidancePanel.tsx`, `ProfileDocumentIntegrator.tsx`, `EnhancedDocumentPanel.tsx`, `ExportControlPanel.tsx`, `VariationsManager.tsx`, `PDFExporter.tsx`, `DocumentTransformer.tsx`, `QuickPolishActions.tsx`, `WritingTipsPanel.tsx`, `CVTemplates.tsx`, `ATSAnalyzer.tsx` |
| **Routes** | `RouteMetadataSidebar.tsx`, `RoutePreview.tsx`, `RouteBuilderForm.tsx`, `CategorySelector.tsx` |
| **Aura** | `AuraVisual.tsx`, `ProceduralAuraFigure.tsx`, `AuraRail.tsx`, `GlobalAuraBuddy.tsx`, `EvolutionRitualOverlay.tsx`, `EvolutionCheck.tsx` |
| **Gamification** | `StreakVisualizer.tsx`, `Leaderboard.tsx`, `AchievementShowcase.tsx`, `QuestDashboard.tsx`, `LevelUpModal.tsx`, `GamificationPanel.tsx` |
| **Marketplace** | `ProductCard.tsx`, `FlagshipProductCard.tsx`, `ShoppingCartDrawer.tsx`, `ReviewForm.tsx`, `EconomyHUD.tsx` |
| **Psych/OIOS** | `OiosEntryPrompt.tsx`, `OiosSnapshotCard.tsx` |
| **Tasks** | `TaskDashboard.tsx`, `TaskList.tsx`, `TaskDetail.tsx`, `TaskCreateForm.tsx`, `TaskDocumentLinker.tsx`, `TaskCalendar.tsx` |

### 4.4 Componentes com Erros (Commented Out)

| Componente | Motivo |
|-----------|-------|
| `CompanionCard` | Errors — commented in export |
| `CompanionAvatar` | Errors — commented in export |
| `EvolutionViewer` | Errors — commented in export |
| `AbilityBadge` | Errors — commented in export |
| `WeatherEffects` | Errors — commented in export |
| `NanoBananaImage` | Errors — commented in export |

---

## 5. Convenções de Naming

### 5.1 Regras de Branding (OBRIGATÓRIO)

| Contexto | Forma Correta | Errado |
|---------|--------------|-------|
| Produto completo | **Olcan Compass** | Compass, Olcan |
| Nome curto | **Compass** | Olcan (só) |
| Feature Dossier | **Dossier** | Olcan Dossier |
| Footer copyright | **Olcan Compass** | Olcan |

**Fonte**: CLAUDE.md line 218: "Branding: Always 'Olcan Compass' (not 'Compass' or 'Olcan' alone)"

### 5.2 Violações Encontradas (A CORRIGIR)

| Localização | Violação | Correção |
|-----------|---------|---------|
| `dashboard/page.tsx:80` | "Bem-vindo ao Compass" | "Bem-vindo ao Olcan Compass" |
| `marketplace/page.tsx:166` | "Loja Olcan" | "Olcan Marketplace" |
| `ExportControlPanel.tsx:113` | "Olcan Dossier" | "Dossier" |
| Footer (múltiplos) | "Olcan" | "Olcan Compass" |

### 5.3 Nomenclatura de Sistema (Design)

| Termo em Uso | Significado | Status |
|-------------|-------------|--------|
| **Liquid Glass** | Sistema de produção | ✅ ATIVO |
| **Ethereal Glass** | Visão aspiracional PRD | ⚠️ NÃO IMPLEMENTADO |
| **Metamodern** | Filosofia de design | 📖 DOCUMENTAÇÃO |
| **MMXD** | Metamodern Experience Design | 📖 DOCUMENTAÇÃO |
| **Clinical Boutique** | Termo legacy | ❌ DEPRECATED |

### 5.4 Nomenclatura de Componentes

|_prefix_| Significado |
|---------|------------|
| `glass-*` | Componentes Glass |
| `liquid-*` |Classes CSS glass |
| `brand-*` | Cores/tokens |
| `surface-*` | Superfícies |
| `text-*` | Cores de texto |

---

## 6. Imagens e Assets

### 6.1 Assets Localizados

```
apps/app-compass-v2.5/public/
├── olcan-logo.png                    // Logo principal (140x40)
├── images/olcan-logo.png            // DUPLICATA — remover
├── images/hero/
│   ├── globe.png
│   ├── nomad.png
│   ├── corporate.png
│   └── scholarship.png
├── images/creature-compass.png      // Companion sprite
├── images/creature-scholar.png     // Companion sprite variant
├── images/fractal_pattern_bg.png    // Background texture
├── images/binary_matrix_bg.png      // Background texture
├── images/hero-globe.png
├── grid.svg                      // Decorative SVG
└── placeholder-product.png
```

### 6.2 Issues de Assets

1. **Duplicate logos**: `olcan-logo.png` existe em 2 localizações
2. **No SVG logo**: Apenas PNG (sem crisp scaling)
3. **No companion sprite sheets**: PNGs individuais
4. **No brand asset guidelines**: Ausente na wiki

### 6.3 Logo Specifications

| Propriedade | Valor |
|-----------|-------|
| Primary logo | `olcan-logo.png` (140x40) |
| Alt text | "Olcan Compass" |
| Background | Transparent |
| Formato | PNG (precisa SVG) |

---

## 7. Arquetipos e Cores de Companion

### 7.1 Os 12 Arquetipos OIOS

| Arquétipo | Cor Primária | Hex | Secondary | Accent | Espécie |
|----------|-----------|-----|----------|--------|--------|
| **Architect** | Violet | `#8B5CF6` | `#A78BFA` | `#FBBF24` | Fox |
| **Innovator** | Cyan | `#06B6D4` | `#22D3EE` | `#FBBF24` | Dragon |
| **Creator** | Emerald | `#10B981` | `#34D399` | `#FBBF24` | Lioness |
| **Diplomat** | Teal | `#06B6D4` | `#67E8F9` | `#3B82F6` | Water Spirit |
| **Pioneer** | Orange | `#F97316` | `#FB923C` | `#FBBF24` | Phoenix |
| **Scholar** | Indigo | `#6366F1` | `#818CF8` | `#FBBF24` | Owl |
| **Strategist** | Violet | `#8B5CF6` | `#A78BFA` | `#FBBF24` | Fox |
| **Guardian** | Amber | `#F59E0B` | `#FBBF24` | — | Elephant |
| **Visionary** | Purple | `#A855F7` | `#C084FC` | — | Hydra |
| **Academic** | Blue | `#3B82F6` | `#60A5FA` | — | Griffin |
| **Communicator** | Pink | `#EC4899` | `#F472B6` | — | Hummingbird |
| **Analyst** | Teal | `#14B8A6` | `#2DD4BF` | — | Arachne |

**Fonte**: `packages/ui-components/src/utils/companionColors.ts`

### 7.2 Cores de Companion — Tailwind

```typescript
// packages/ui-components/tailwind.config.ts
companion: {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  glow: 'rgba(139, 92, 246, 0.6)',
  aura: 'rgba(6, 182, 212, 0.4)',
  sparkle: 'rgba(255, 215, 0, 0.8)'
}
```

### 7.3 Arquetipos Visuais (PRD)

| Arquétipo | Marcador Visual |
|----------|----------------|
| Architect | Blue Geometric Patterns |
| Bridge Builder | Amber Flow Lines |
| Strategist | Silver Radar Charts |
| Explorer | Green Pulse Orbs |
| Craftsman | Steel Fractal Textures |
| Sentinel | White Shield Grids |
| Alchemist | Purple Gradient Glows |
| Catalyst | Fire Accent Sparks |
| Oracle | Deep Violet Eyes |
| Mentor | Gold Aura Radiance |
| Rebel | Neon Red Vectors |
| Guardian | Platinum Mesh Layers |

**Fonte**: `Olcan_Master_PRD_v2_5.md`

---

## 8. Tokens Ortográficos PT-BR

### 8.1 Labels de Interface

| Elemento | PT-BR | EN |
|----------|-------|-----|
| Heading principal | "Olcan Compass" | "Olcan Compass" |
| Heading secundário | "O Compass" | "the Compass" |
| Dashboard | "Painel de Controle" | "Dashboard" |
| Routes | "Rotas de Mobilidade" | "Career Routes" |
| Forge | "Oficina de Narrativa" | "Narrative Forge" |
| Aura | "Companheiro" | "Aura Companion" |
| Marketplace | " marketplace" | " marketplace" |
| Dossier | "Dossier de Candidatura" | "Application Dossier" |

### 8.2 Convenções de Texto

```typescript
// Regras de copywriting:
// - Cabeçalhos: "DM Serif Display" (font-heading)
// - Corpo: "DM Sans" (font-body)
// - Ênfase editorial: "Source Sans 3" italic (text-emphasis)
// - Código/dados: "JetBrains Mono" (font-mono)
// - Textos em PT-BR usar:
//   - Acentuação correta
//   - Plural: "documentos" não "docs"
//   - "você" (Informal) ou "o candidato" (Formal)
```

---

## 9. Especificações de Export (PDF/DOCX)

### 9.1 Cores de Export (PDF)

| Elemento | Cor | Fonte |
|----------|-----|-------|
| Heading 1 | `#001338` | `enhanced-export.ts:122` |
| Heading 2 | `#001338` | `enhanced-export.ts:123` |
| Border | `#001338` | line 131 |
| Footer | `#001338` | line 1739 |

### 9.2 Especificações DOCX

```typescript
// docx-export.ts:10
font: "Calibri"
size: "11pt"
```

### 9.3 Branding no Dossier Export

```html
<!-- dossier export page -->
<span>Gerado pelo Olcan Compass</span>
<!-- Footer -->
<span>Gerado pelo Olcan Compass · Professional Mobility Platform · olcan.com</span>
```

**Fonte**: `dossiers/[id]/export/page.tsx` lines 385, 1562, 1797

---

## 10. Mapa de Backlinks

### 10.1 Estrutura de Backlinks — Design System

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                    wiki/00_SOVEREIGN (VERDADE)                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Olcan_Master_PRD_v2_5 ──────────► DESIGN_SYSTEM_CENTRAL      ││
│  │ Verdade_do_Produto ─────────────► DESIGN_SYSTEM_CENTRAL      ││
│  │ Grafo_de_Conhecimento_Olcan ──► DESIGN_SYSTEM_CENTRAL      ││
│  └──────────────────────────────────────────────────────────────┘│
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────────┐    ┌────────────────────┐
│ 02_ARQUITETURA│    │ 03_PRODUTO_FORGE    │    │ 01_VISAO_ESTRATÉGICA│
├──────────────┤    ├──────────────────────┤    ├────────────────────┤
│Guia_Mestre_  │    │ PRD_Master_         │    │ Carta_do_Projeto_   │
│Design_System │    │ Ethereal_Glass      │    │ Olcan_v2.5         │
│_Master       │◄──►│ PRD_Geral_Olcan     │    │                    │
│              │    │ Biblioteca_        │    │                    │
│Guia_de_      │    │ Componentes_UI_    │    │                    │
│Design_Visual │◄──►│ MVP               │    │                    │
│_Liquid_Glass │    │                   │    │                    │
│              │    │ Mapeamento_Design │    │                    │
│Arquitetura_  │    │ para_Funcionalid  │    │                    │
│v2_5_Compass  │    │ e                 │    │                    │
└──────────────┘    └────────────────────┘    └────────────────────┘
                               │
                               │  Backlinks Obrigatórios
                               ▼
                    ┌─────────────────────────┐
                    │ Design_System_Central.md  │
                    │ (ESTE DOCUMENTO)       │
                    └─────────────────────────┘
```

### 10.2 Backlinks — Este Documento

**Este documento está linkado de:**

| Documento | Link Type |
|-----------|----------|
| `Olcan_Master_PRD_v2_5.md` | Bidirectional |
| `Verdade_do_Produto.md` | Bidirectional |
| `Grafo_de_Conhecimento_Olcan.md` | Bidirectional |
| `Guia_Mestre_Design_System_Master.md` | Bidirectional |
| `Guia_de_Design_Visual_Liquid_Glass.md` | Bidirectional |
| `Biblioteca_de_Componentes_UI_MVP.md` | Bidirectional |
| `Mapeamento_Design_para_Funcionalidade.md` | Bidirectional |
| `PRD_Master_Ethereal_Glass.md` | Reference (aspirational) |
| `PRD_Geral_Olcan.md` | Reference |
| `Arquitetura_v2_5_Compass.md` | Reference |
| `Carta_do_Projeto_Olcan_v2.5.md` | Reference |

### 10.3 Referências — Arquitetura Técnica

| Necessidade | Ler Este Documento Primeiro |
|------------|---------------------------|
| Quais cores usar | Design_System_Central |
| Quais componentes usar | Biblioteca_de_Componentes_UI_MVP |
| Como implementar Glass | Guia_de_Design_Visual_Liquid_Glass |
| Visão de design | PRD_Master_Ethereal_Glass |
| Filosofia design | Guia_Mestre_Design_System_Master |
| Estado atual code | Verdade_do_Produto |
| Arquitetura técnica | Arquitetura_v2_5_Compass |

---

## 11. Matriz de Decisão — Design Questions

| Pergunta | Resposta | Fonte |
|----------|---------|-------|
| "Qual cor primary?" | `#001338` (brand-500) | `tokens.json` |
| "Qual cor accent momentum?" | `#FF844B` (NÃO IMPLEMENTADA) | PRD_Master_Ethereal_Glass |
| "Qual font heading?" | DM Serif Display | `tokens.json` |
| "Qual font body?" | DM Sans | `tokens.json` |
| "Glass blur padrão?" | 20px | `globals.css` |
| "ComponentesGlass disponíveis?" | GlassCard, GlassButton, GlassInput, GlassModal | `packages/ui-components` |
| "Nome produto completo?" | Olcan Compass | CLAUDE.md rule |
| "Companion cores por tipo?" | 12 cores según companionColors.ts | `ui-components` |

---

## 12. Quick Reference Table

| Element | Value | File |
|---------|-------|------|
| Brand Primary | `#001338` | `tokens.json:brand.500` |
| Brand Secondary | `#213F73` | `tokens.json:brand.400` |
| Background | `#F8FAFC` | `tokens.json:surface.background` |
| Success | `#3D8B5E` | `tokens.json:semantic.success` |
| Error | `#962D2D` | `tokens.json:semantic.error` |
| Font Heading | DM Serif Display | `tokens.json:fonts.heading` |
| Font Body | DM Sans | `tokens.json:fonts.body` |
| Font Mono | JetBrains Mono | `tokens.json:fonts.mono` |
| Glass Blur | 20px | `globals.css:.liquid-glass` |
| Button Style | btn-liquid | `globals.css:.btn-liquid` |
| Card Style | card-surface | `globals.css:.card-surface` |

---

## 13. Status de Implementação

| Feature |Status| Notes |
|---------|------|--------|
| Cores brand (#001338) | ✅ IMPLEMENTED | tokens.json |
| Tipografia (DM Serif/DM Sans) | ✅ IMPLEMENTED | tokens.json |
| Liquid Glass CSS | ✅ IMPLEMENTED | globals.css |
| GlassButton componente | ✅ IMPLEMENTED | ui-components |
| GlassCard componente | ✅ IMPLEMENTED | ui-components |
| GlassInput componente | ✅ IMPORTED | ui-components |
| GlassModal componente | ✅ EXPORTED | ui-components |
| Export PDF styling | ✅ IMPLEMENTED | enhanced-export.ts |
| Fire Accent (#FF844B) | ❌ NOT IMPLEMENTED | PRD aspirational |
| Ethereal Glass glows | ❌ NOT IMPLEMENTED | PRD aspirational |
| Dark mode | ❌ NOT IMPLEMENTED | PRD aspirational |
| SVG logo | ❌ MISSING | Need to create |

---

## 14. Ligações (Links) — Completion

- [[Olcan_Master_PRD_v2_5]] ← Visão completa do produto
- [[Verdade_do_Produto]] ← Estado atual honesty
- [[Grafo_de_Conhecimento_Olcan]] ← Mapa visual
- [[Guia_Mestre_Design_System_Master.md]] ← Filosofia sistema
- [[Guia_de_Design_Visual_Liquid_Glass.md]] ← Implementaçãoglass
- [[Biblioteca_de_Componentes_UI_MVP.md]] ← Lista componentes (minimal)
- [[Mapeamento_Design_para_Funcionalidade.md]] ← Mapeamento UI-Feature
- [[PRD_Master_Ethereal_Glass.md]] ← Visão Ethereal (aspirational)
- [[tokens.json]] ← SOURCE OF TRUTH colors
- [[globals.css]] ← SOURCE OF TRUTH CSS classes

---

## 15. Conclusão — Design System Truth

### O que funciona:

1. **Cores #001338 (brand)** — tokenized em `tokens.json`, usado em toda parte
2. **Tipografia DM Serif/DM Sans** — implementada, funcionando
3. **Sistema Liquid Glass** — CSS classes em `globals.css`, funcionando
4. **Componentes Glass*** — exportando de `ui-components`, funcionando

### O que NÃO funciona:

1. **#FF844B Fire Accent** — só no PRD, não em código
2. **Ethereal Glass visuals** — aspiracional, não implementado
3. **Dark mode** — não implementado
4. **Naming consistency** — violações em ~28 arquivos

### Regra de Ouro:

> **Qualquer decisão de design → Consultar ESTE documento PRIMEIRO.**
> Se a resposta não está aqui → NÃO está definida.

---

**Document Status**: ACTIVE
**Valid From**: 2026-04-23
**Valid Until**: 2026-07-23
**Custodian**: Design System Authority
**Classification**: SOVEREIGN GROUND TRUTH

---

_Fim do Documento_