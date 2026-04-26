---
title: Arquitetura de Sistemas Olcan
type: drawer
layer: 2
status: active
last_seen: 2026-04-26
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Arquitetura de Sistemas Olcan — Ecossistema Topográfico Unificado

**Resumo**: Visão canônica da topologia do ecossistema Olcan. Todo o tráfego inter-app passa pelo Nexus Bridge (API Core). Nenhum nó fala diretamente com outro.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #arquitetura #infraestrutura #monorepo #stack #técnico #nexus #topologia
**Criado**: 10/04/2026
**Atualizado**: 26/04/2026

---

## 🧠 Contexto BMAD

A arquitetura Olcan adota a visão de **Ecossistema Topográfico Unificado**: os sub-apps não são silos isolados — são **nós** interconectados via o Nexus Bridge. O monorepo (`olcan-compass`) garante que tokens de design, tipos TypeScript e lógica de negócio sejam compartilhados, eliminando drift entre frontends.

**Regra Inviolável**: n8n, Marketplace e App nunca se comunicam ponto-a-ponto. Todo fluxo de dados passa obrigatoriamente pela `api.olcan.com.br` para integridade de dados e SSO unificado.

---

## 🗺️ Mapa Topográfico do Ecossistema

```
┌─────────────────────────────────────────────────────────────┐
│                    OLCAN ECOSYSTEM                          │
│                                                             │
│  [The Vitrine]          [The Core OS]      [The Services]   │
│  olcan.com.br           compass/app         marketplace     │
│  Next.js 14             Next.js 14          MedusaJS        │
│  Payload CMS            Zustand (≤24)       Stripe Connect  │
│         │                    │                    │          │
│         └────────────────────┼────────────────────┘          │
│                              │                               │
│              ┌───────────────▼───────────────┐              │
│              │      THE ORCHESTRATOR         │              │
│              │   api.olcan.com.br            │              │
│              │   FastAPI · PostgreSQL        │              │
│              │   Redis · Docker · Render     │              │
│              │   ← NEXUS BRIDGE →            │              │
│              └───────────┬───────────────────┘              │
│                          │                                   │
│         ┌────────────────┼──────────────────┐               │
│         │                │                  │               │
│  [Operator Portals] [Automation Brain] [CRM Engine]         │
│  admin/vendors/staff   n8n.olcan.com.br  mautic.olcan.com.br│
│  Next.js Middleware    GCP VM            Mautic             │
│  Twenty CRM (staff)   35.238.150.117    Marketing Auto      │
│                                                             │
│         [The Discovery Layer]                               │
│         zenith.olcan.com.br                                 │
│         Zenith Microservice · CMS Curation                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Nós do Ecossistema

### 1. The Vitrine
| Campo | Valor |
|---|---|
| Domínios | `olcan.com.br`, `www.olcan.com.br` |
| Stack | Next.js 14, Payload CMS |
| Propósito | Topo de funil, marketing, captura de leads, branding Liquid Glass |

### 2. The Core OS
| Campo | Valor |
|---|---|
| Domínios | `compass.olcan.com.br`, `app.olcan.com.br` |
| Stack | Next.js 14, Zustand (máximo 24 stores) |
| Propósito | Diagnósticos OIOS, Narrative Forge, Tasks, Dossier System |

### 3. The Services Layer
| Campo | Valor |
|---|---|
| Domínio | `marketplace.olcan.com.br` |
| Stack | MedusaJS, Stripe Connect |
| Propósito | Motor de e-commerce, listagens de provedores, capacidades de escrow |

### 4. The Operator Portals
| Campo | Valor |
|---|---|
| Domínios | `admin.olcan.com.br`, `vendors.olcan.com.br`, `staff.olcan.com.br` |
| Stack | Next.js Middleware routing, Twenty CRM (staff) |
| Propósito | Governança da plataforma, inventário de parceiros, pipelines de vendas internas via Twenty CRM |

### 5. The Orchestrator (Nexus Bridge)
| Campo | Valor |
|---|---|
| Domínio | `api.olcan.com.br` |
| Stack | FastAPI, PostgreSQL, Redis, Docker on Render |
| Propósito | **Fonte única da verdade.** Auth provider, operações de banco de dados, middleware de toda comunicação inter-app |

### 6. The Automation Brain
| Campo | Valor |
|---|---|
| Domínio | `n8n.olcan.com.br` |
| Stack | n8n auto-hospedado (GCP VM — IP `35.238.150.117`) |
| Propósito | Orquestração invisível de workflows entre Stripe, permissões do app e Mautic |

### 7. The CRM Engine
| Campo | Valor |
|---|---|
| Domínio | `mautic.olcan.com.br` |
| Stack | Mautic |
| Propósito | Automação de marketing, lead scoring e sequências automatizadas de email |

### 8. The Discovery Layer
| Campo | Valor |
|---|---|
| Domínio | `zenith.olcan.com.br` |
| Stack | Zenith Microservice |
| Propósito | Governança estratégica e curadoria de dados CMS (atualmente via fallback `NEXT_PUBLIC_ZENITH_API_URL`) |

---

## 🔐 Modelo de Autenticação Unificada (SSO)

O **API Core** é o único provedor de identidade do ecossistema.

- Todos os tokens JWT são emitidos e validados por `api.olcan.com.br`.
- Transições cross-domain compartilham as mesmas chaves de validação JWT.
- Nenhum sub-app implementa autenticação própria — todas as verificações de sessão passam pelo Nexus Bridge.
- Ver [[02_Arquitetura_Compass/Integracao_Autenticacao_Unificada]] para detalhes de implementação.

---

## 🏗️ Estrutura do Monorepo

```
olcan-compass/
├── apps/
│   ├── compass/          # Core OS (Next.js 14)
│   ├── website/          # The Vitrine (Next.js 14 + Payload CMS)
│   └── api/              # The Orchestrator (FastAPI)
├── packages/
│   ├── ui/               # Componentes compartilhados, Design Tokens
│   └── types/            # Tipos TypeScript compartilhados
```

**Regra de URLs de Serviço**: Todos os endpoints de subdomínio devem ser centralizados em `lib/api-endpoints.ts`. Proibido hardcode de URLs em stores, componentes ou rotas de API. Ver [[00_Onboarding_Inicio/Padroes_de_Codigo]].

---

## Stack Tecnológica por Camada

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14/15, Tailwind CSS, Framer Motion |
| State Management | Zustand (≤ 24 stores no Core OS) |
| Backend | FastAPI (Python) |
| E-commerce | MedusaJS |
| Banco de Dados | PostgreSQL (Neon), Redis (Caching) |
| Automação | n8n (self-hosted GCP) |
| CRM Marketing | Mautic |
| CRM Staff/Sales | Twenty CRM |
| IA | OpenAI API (GPT-4o), ElevenLabs (Voz) |
| Infraestrutura | Docker, Render, Vercel, Cloudflare |

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[02_Arquitetura_Compass/Integracao_Autenticacao_Unificada]]
- [[02_Arquitetura_Compass/Escalabilidade_Backend]]
- [[02_Arquitetura_Compass/Guia_Tecnico_CRM_Integration]]
- [[05_Infraestrutura/DNS_CLOUDFLARE]]
- [[00_Onboarding_Inicio/Padroes_de_Codigo]]
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
