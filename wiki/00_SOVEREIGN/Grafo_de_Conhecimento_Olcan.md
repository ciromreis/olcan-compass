---
title: Grafo de Conhecimento Olcan
type: drawer
layer: 0
status: active
last_seen: 2026-04-21
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
  - Radiografia_do_Produto
  - Spec_Dossier_System_v2_5
  - MemPalace_Migration_Spec
---

# Grafo de Conhecimento Olcan Compass (Final-Fidelity)

**Resumo**: Mapa visual multidimensional absoluto, integrando a Jornada do Usuário, a Operação Nexus, o Marketplace e a Visão Mestra de CEO com a estrutura de Arquivo Permanente.
**Importância**: Crítica (Bússola Global)
**Status**: Ativo
**Camada (Layer)**: Planejamento / Wiki
**Tags**: #grafo #wiki #obsidian #mermaid #masterview #highfidelity #segurança #economia #ia #archivo
**Criado**: 15/04/2026
**Atualizado**: 18/04/2026
**Atualizado**: 17/04/2026

---

## 🗺️ O Super-Mapa do Ecossistema (v2.5)

Este grafo representa o estado final da consolidação "Ground Truth" (Karpathy Technique), onde o conhecimento ativo está separado do histórico, mas acessível.

```mermaid
graph TD
    %% === THE AUTH GATE (everything depends on this) ===
    AUTH[🔴 Auth Gate — 500 in prod]:::blocker

    %% === STAKEHOLDER ENTRY POINTS ===
    User((End User)):::user_node
    Vendor((Provider)):::vendor_node
    OrgAdmin((Org Admin)):::org_node
    CEO((CEO)):::ceo_node
    Admin((Platform Admin)):::admin_node

    User --> AUTH
    Vendor --> AUTH
    OrgAdmin --> AUTH

    %% === USER CRITICAL PATH (code exists, blocked by auth) ===
    subgraph View_User ["End User Journey (Tier 1 — needs auth fix only)"]
        AUTH --> Quiz[OIOS Quiz ⚠️ needs seed]
        Quiz --> Archetype[Archetype Result]
        AUTH --> Forge[Narrative Forge ✅]
        Forge --> Docs[Documents CRUD ✅]
        Forge --> Polish[AI Polish ⚠️ needs keys]
        Forge --> Dossier[Dossier System ✅]
        Dossier --> Export[DOCX Export ✅]
        AUTH --> Routes[Route Planning ✅]
        AUTH --> Interviews[Interview Sim ✅]
        AUTH --> Apps[Application Tracker ✅]
        AUTH --> Readiness[Readiness Score ✅]
    end

    %% === REVENUE PATH ===
    subgraph View_CEO ["CEO: Revenue & Metrics (Tier 3 — needs Stripe)"]
        AUTH --> Billing[Billing API ⚠️ needs Stripe]
        Billing --> Credits[Credit Packs]
        Billing --> Subs[Subscriptions]
        Credits --> Revenue[💰 First Revenue]
        Subs --> Revenue
        CEO --> AdminPanel[Admin Dashboard 🟡 reads stores]
        CEO --> Analytics[Analytics API ✅]
        CEO --> CRM[CRM Bridge ⚠️ needs Twenty]
    end

    %% === VENDOR PATH ===
    subgraph View_Vendor ["Provider: Marketplace (Tier 4 — after revenue)"]
        AUTH --> ProviderOnboard[Provider Onboarding]
        ProviderOnboard --> Services[Service Listings ✅ backend]
        Services --> Bookings[Bookings ✅ backend]
        Bookings --> Payouts[Payouts 🔴 no Stripe Connect]
        Vendor --> ProviderOnboard
    end

    %% === ADMIN PATH ===
    subgraph View_Admin ["Admin: Operations"]
        Admin --> UserMgmt[User Management ✅]
        Admin --> ProviderVerify[Provider Verification ✅]
        Admin --> Moderation[Content Moderation 🟡]
        Admin --> EconIntel[Economics Intelligence ✅]
    end

    %% === ORG PATH ===
    subgraph View_Org ["Org Admin: B2B (future)"]
        OrgAdmin --> Members[Member Management ✅]
        OrgAdmin --> Cohorts[Cohort Tracking 🟡]
    end

    %% === DEPENDENCIES ===
    Revenue -.->|enables| View_Vendor
    Export -->|core value proof| Revenue
    Archetype -->|personalizes| Routes
    Archetype -->|personalizes| Readiness

    %% === STYLING ===
    classDef blocker fill:#ef4444,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    classDef user_node fill:#8B5CF6,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    classDef vendor_node fill:#F59E0B,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    classDef org_node fill:#10B981,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    classDef ceo_node fill:#EF4444,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    classDef admin_node fill:#6366F1,stroke:#fff,stroke-width:3px,color:#fff,font-weight:bold
    style View_User fill:#f5f3ff,stroke:#8B5CF6
    style View_CEO fill:#fdf2f2,stroke:#EF4444
    style View_Vendor fill:#fff7ed,stroke:#F59E0B
    style View_Admin fill:#eef2ff,stroke:#6366F1
    style View_Org fill:#ecfdf5,stroke:#10B981
```

---

## 🏁 A Versão Definitiva
Este ecossistema de Wiki agora cobre:
1.  **Visão Mestra**: KPIs Reais e Matriz de Comando.
2.  **Inteligência Econômica & Narrativa**: O cérebro por trás dos resultados.
3.  **Visual Blueprint**: 27 telas de UI alta fidelidade.
4.  **Memória de Elite**: Arquivo categorizado e Mece.

---

## 🔗 Navegação Mestra por Wing

### 🏛️ 00_SOVEREIGN — Fonte da Verdade
- [[00_SOVEREIGN/Olcan_Master_PRD_v2_5]] — visão completa do produto
- [[00_SOVEREIGN/Verdade_do_Produto]] — estado real do produto (sem inflação)
- [[00_SOVEREIGN/Radiografia_do_Produto]] — **multi-stakeholder x-ray** (2026-04-21)
- [[00_SOVEREIGN/Agent_Knowledge_Handbook]] — manual para agentes IA
- [[00_SOVEREIGN/Analise_Historiador_Nexus]] — contexto histórico e decisões
- [[00_SOVEREIGN/MemPalace_Migration_Spec]] — metodologia do wiki

### 🎯 01_Visao_Estrategica — O Porquê
- [[01_Visao_Estrategica/Visao_Mestra_CEO]] — dashboard executivo (4 quadrantes, 5 KPIs)
- [[01_Visao_Estrategica/Roadmap_Implementacao_v2_5]] — roadmap atual
- [[01_Visao_Estrategica/Carta_do_Projeto_Olcan_v2.5]] — pacto fundador do projeto
- [[01_Visao_Estrategica/Verdade_Final_v2_5]] — análise de gaps pré-lançamento

### 🏗️ 02_Arquitetura_Compass — O Como
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]] — arquitetura principal (hub técnico)
- [[02_Arquitetura_Compass/Referencia_de_API]] — referência de endpoints
- [[02_Arquitetura_Compass/Seguranca_e_Entitlements]] — segurança e permissões
- [[02_Arquitetura_Compass/Guia_de_Arquitetura_de_Stores]] — stores Zustand
- [[02_Arquitetura_Compass/Proximas_Tarefas_de_Codigo]] — tarefas imediatas de código

### 📦 03_Produto_Forge — O Quê
- [[03_Produto_Forge/PRD_Geral_Olcan]] — PRD geral (hub de produto)
- [[03_Produto_Forge/PRD_Master_Ethereal_Glass]] — design system e UI blueprint
- [[03_Produto_Forge/Spec_Narrative_Forge]] — spec da feature Forge
- [[03_Produto_Forge/Spec_Simulador_de_Entrevista]] — spec do simulador
- [[03_Produto_Forge/Spec_Dossier_System_v2_5]] — sistema de dossier completo (18/04/2026)
- [[03_Produto_Forge/Jornadas_do_Usuario]] — fluxos do usuário

### 🎮 04_Ecossistema_Aura — Gamificação
- [[04_Ecossistema_Aura/Mestre_de_Companions]] — sistema de companions
- [[04_Ecossistema_Aura/Estrategia_de_Gamificacao]] — estratégia de XP e aura
- [[04_Ecossistema_Aura/Especificacao_de_Arquitetos_OIOS]] — 12 arquétipos OIOS

### 💰 05_Inteligencia_Economica — Motor de Arbitragem
- [[05_Inteligencia_Economica/Spec_Inteligencia_Economica]] — escrow, Pareto, custo de oportunidade

### 🧠 06_Inteligencia_Narrativa — IA do Forge
- [[06_Inteligencia_Narrativa/Spec_Narrative_Forge]] — scoring de IA, detecção de clichês

### 🤖 07_Agentes_IA — Sistema Nexus
- [[07_Agentes_IA/Enciclopedia_Nexus_Agentes]] — catálogo de todas as divisões
- [[07_Agentes_IA/Catalogo_de_Agentes_Especialistas]] — personas (Valentino, Mary, Leon...)
- [[07_Agentes_IA/Estrategia_Nexus_Agentes]] — pipeline de 7 fases

### 🚀 00_Onboarding_Inicio — Execução
- [[00_Onboarding_Inicio/Plano_GoLive_v2_5_Abril_2026]] — plano de lançamento v2.5
- [[00_Onboarding_Inicio/Runbook_de_Deployment]] — runbook de deployment
- [[00_Onboarding_Inicio/Padroes_de_Codigo]] — padrões de código
