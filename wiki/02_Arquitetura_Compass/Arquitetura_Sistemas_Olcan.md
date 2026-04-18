---
title: Arquitetura de Sistemas Olcan
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Arquitetura de Sistemas Olcan (Visão Técnica)

**Resumo**: Visão geral da infraestrutura e stack tecnológica que sustenta o ecossistema Olcan, incluindo o monorepo e as conexões entre apps.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #arquitetura #infraestrutura #monorepo #stack #técnico
**Criado**: 10/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A arquitetura de sistemas Olcan segue o princípio de modularidade do BMAD. O monorepo permite que o conhecimento técnico seja compartilhado entre o Website (Marketing) e o App Compass (Produto), garantindo que breakthroughs em um domínio (ex: UI Liquid Glass) sejam rapidamente replicados no outro.

## Conteúdo

### Estrutura do Monorepo
- **apps/**: Contém o App Compass v2/v2.5, o Website de Marketing e a API Core.
- **packages/**: Bibliotecas compartilhadas de UI, tokens e tipos.

### Stack Tecnológica Core
- **Frontend**: Next.js 14/15, Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python), MedusaJS (E-commerce).
- **Banco de Dados**: PostgreSQL (Neon), Redis (Caching).
- **IA**: OpenAI API (GPT-4o), ElevenLabs (Voz).

### Estratégia de Integração
- Comunicação via REST API e Webhooks.
- Autenticação unificada via JWT.
- Shared Design Tokens para paridade visual.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[02_Arquitetura_Compass/Escalabilidade_Backend]]
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
