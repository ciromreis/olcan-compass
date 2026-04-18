---
title: Arquitetura Website Marketing
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Arquitetura do Website de Marketing

**Resumo**: Especificação técnica da infraestrutura do site de marketing da Olcan, utilizando Next.js 14, Payload CMS e design Liquid Glass.
**Importância**: Alto
**Status**: Concluído
**Camada (Layer)**: Execução
**Tags**: #arquitetura #nextjs #payloadcms #marketing #frontend
**Criado**: 05/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A arquitetura do website foi projetada para ser modular e facilmente atualizável via CMS, permitindo que o marketing itere rapidamente sem depender de sprints de engenharia do core app. No BMAD, isso representa a separação de preocupações entre a "vitrine" e a "fábrica".

## Conteúdo

### Tecnologias Core
- **Framework**: Next.js 14 (App Router).
- **CMS**: Payload CMS 3.0 (Headless).
- **Styling**: Tailwind CSS + Framer Motion para animações "Liquid Glass".
- **Deployment**: Vercel.

### Desafios de Integração
- **Peer Dependencies**: Conflitos entre Next.js 15 e Payload 3.x exigem o uso de `--legacy-peer-deps` no build.
- **Shared Tokens**: Uso de tokens de design centralizados para manter paridade visual com o App Compass.

### Estrutura de Rotas
- `/`: Home (Metamodern Hero).
- `/blog`: Insights e atualizações.
- `/about`: Visão institucional.
- `/ceo`: Perfil do fundador e jornada Olcan.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Implementacao_Sistemas_Marketing]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
