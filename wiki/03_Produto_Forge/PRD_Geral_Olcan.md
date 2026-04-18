---
title: PRD Geral Olcan Compass
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
  - PRD_Master_Ethereal_Glass
---

# PRD Geral: Olcan Compass (Core Vision)

**Resumo**: Documento de Requisitos do Produto (PRD) que define a visão completa do Olcan Compass, incluindo os 5 níveis de serviço e a integração da narrativa.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Identidade
**Tags**: #prd #produto #visão #requisitos #olcan
**Criado**: 10/01/2026
**Atualizado**: 17/04/2026

---

## 🧠 Contexto BMAD
Este PRD é o fundamento de todas as decisões de produto. No BMAD, ele serve como o "Backbone" que conecta a identidade do usuário (Olcan Compass Core) às soluções práticas de carreira. Qualquer novo breakthrough deve ser validado contra os objetivos centrais listados aqui.

## Conteúdo

### Visão do Produto
O Olcan Compass não é apenas uma ferramenta de busca de emprego; é um **Sistema Operacional de Mobilidade de Carreira** gamificado. Ele resolve a dor da incerteza e da falta de guia em novos mercados.

### Os 5 Níveis de Serviço
1. **Layer 1: Identidade (Olcan Compass Core)** - Diagnóstico de arquétipos.
2. **Layer 2: Route OS** - Planejamento estratégico de carreira.
3. **Layer 3: Execução (Forge/Simulador)** - Ferramentas de produção de documentos e prática.
4. **Layer 4: Serviços (Marketplace)** - Conexão com especialistas.
5. **Layer 5: Social (Comunidade)** - Guildas e networking de arquétipos.

### Requisitos Funcionais Core
- **Quiz Olcan Compass Core**: Motor de avaliação psicológica.
- **Narrative Forge**: AI Editor para documentos de alta performance.
- **Companion Aura**: HUD gamificado que acompanha o progresso.
- **Route Engine**: Gerador de roadmap dinâmico.

### Critérios de Aceite
- Sincronização em tempo real entre web e mobile.
- Design Liquid Glass consistente.
- Latência de respostas de IA < 3s.

---

## 📊 Feature Inventory (Abril 2026)

### Implemented: Layer 3 - Dossier System
**NOVO: Substitui documento solto por pacote aplicação**
- `/dossiers` - Lista de dossiers com stats
- `/dossiers/[id]` - Detail com tabs (Overview, Documents, Tasks, Readiness)
- Document Wizard multi-step (CV, Motivation Letter, Research Proposal)
- Opportunity-bound application packages
- Readiness scoring automático

### API Endpoints (v2.5)
- `/api/v1/auth/*` - Authentication
- `/api/v1/documents/*` - Forge documents
- `/api/v1/users/*` - User management
- `/api/v1/marketplace/*` - Marketplace
- `/api/v1/companions/*` - Aura companions
- `/api/v1/leaderboard/*` - Rankings
- `/api/commerce_proxy/*` - Stripe integration

### Stores (24 total)
- Core: auth, profile, psych
- Feature: forge, routes, interviews, applications
- Gamification: auraStore, archetypeStore
- Commerce: marketplace, economics
- NEW: dossier, sprints, taskStore

---

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Verdade_do_Produto]] ← Estado real
- [[PRD_Master_Ethereal_Glass]] ← Design System

## 🔗 Referências Relacionadas
- [[01_Visao_Estrategica/Verdade_do_Produto]]
- [[01_Visao_Estrategica/Carta_do_Projeto_Olcan_v2.5]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
