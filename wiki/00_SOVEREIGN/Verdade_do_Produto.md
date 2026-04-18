---
title: Verdade do Produto (Estado Real)
type: drawer
layer: 0
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Grafo_de_Conhecimento_Olcan
  - MemPalace_Migration_Spec
---

# O Que o Olcan Compass É — Estado Real (Verdade do Produto)

**Resumo**: Este documento é o status definitivo e sem inflação do produto, descrevendo o que realmente funciona vs. o que é apenas código ou promessa.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Identidade
**Tags**: #audit #status #honestidade #verdade #estratégia
**Criado**: 12/04/2026
**Atualizado**: 17/04/2026

## 📊 snapshotCode: 2026-04-17

---

## 🧠 Contexto BMAD
A "Verdade do Produto" é a peça central da integridade do desenvolvimento ágil no BMAD. Ela combate o ciclo de "inflação de documentação" onde IAs declaram recursos como prontos prematuramente. Este arquivo serve como o ponto de auditoria supremo para qualquer novo agente ou auditor humano.

## Conteúdo

### O Que é o Produto
O Olcan Compass é uma plataforma de suporte de carreira para imigrantes e profissionais navegando em novos mercados. Sua visão completa inclui:

- **Carrrer Companions** — Companheiros virtuais em estilo RPG vinculados aos 12 arquétipos Olcan Compass Core, com estágios de evolução, missões, guildas e gamificação.
- **Narrative Forge** — Polimento de documentos impulsionado por IA para currículos, cartas de apresentação, ensaios e outros.
- **Simulador de Entrevista** — Prática de entrevista via IA baseada em voz.
- **Marketplace** — Conecta usuários com mentores verificados, advogados de imigração, tradutores, além de permitir a compra de itens, como produtos digitais e físicos.
- **Loja Online** — Níveis de assinatura (freemium + premium) e recursos de pagamento por uso.

---

### O Que Realmente Existe (Abril 17, 2026 — atualizado por sessão de auditoria profunda, passível de auditoria e mudança)

#### ⚡ NOVEMBRO: Dossier System (PRIORIDADE MÁXIMA)
**Implementado nesta sessão:**
- ✅ Dossier Store com full CRUD (600+ linhas)
- ✅ Type system completo (`dossier-system.ts` - 640+ linhas)
- ✅ List page `/dossiers` com stats dashboard
- ✅ Detail page `/dossiers/[id]` com 4 tabs
- ✅ Document Wizard multi-step (CV, Motivation Letter, Research Proposal)
- ✅ Document Type Selector (9 tipos)
- ✅ Tabs UI component criado
- ✅ Button "outline" variant adicionado
- ⚠️ Backend sync ainda não implementado
- ⚠️ AI content generation não implementado

#### Funcionando Totalmente
- ✅ Autenticação de usuário (registro, login, JWT)
- ✅ CRUD básico de companheiro (criar, visualizar, atividades de alimentar/treinar/jogar/descansar)
- ✅ Website público (ao vivo no Vercel)
- ✅ Backend v2.5 API (funcional, rotas registradas, Docker Postgres disponível)
- ✅ **Build do App v2.5 passando** (23 stores, ~140 páginas, limpo)
- ✅ Routes OS frontend + backend conectados (`routesApi` com fallback gracioso)
- ✅ Forge frontend + backend conectados (`forgeApi` → `/api/v1/documents/*`)
  - **BUG CORRIGIDO (12 Abr):** Rota de documentos v1 não estava montada. Agora corrigido.
- ✅ Quiz de psicologia Olcan Compass Core em `/onboarding/quiz` — **TOTALMENTE CONECTADO à API do backend**.
- ✅ AI Polish do Narrative Forge (`POST /forge/polish`) — deduz créditos, retorna conteúdo polido.
- ✅ Sistema de créditos Forge — 3 créditos no cadastro, compra via pacotes Stripe.
- ✅ Checkout de assinatura via Stripe (`POST /billing/subscription-checkout`).

#### Construído Parcialmente (Código existe, não verificado ponta-a-ponta)
- ⚠️ Lógica de evolução do companheiro (backend parcial, frontend apenas UI básica)
- ⚠️ Simulador de Entrevista — CRUD de sessões/filtros existe, sem endpoints de áudio/IA.
- ⚠️ Marketplace — CRUD de provedores/reservas existe, sem provedores reais ou Stripe Connect.
- ⚠️ Atribuição de arquétipo Olcan Compass Core — lógica construída, requer seeding do DB para teste.
- ⚠️ Webhooks de assinatura — construídos, requerem configuração de segredo do Stripe.
- ⚠️ Aplicação de direitos no lado do servidor — gates no cliente via `entitlements.ts`.

#### NOVEMBRO: Routes + Sprints + Tasks + Dossier
**Implementado nesta sessão:**
- ✅ Sprints store + page (`/sprints`, `/sprints/[id]`)
- ✅ Task store + page (`/tasks`)
- ✅ Dossier System completo (tipo, store, UI)
- ✅ 24 stores total
- ⚠️ Backend sync não conectado

#### NOVEMBRO: UI Components
**Corrigido nesta sessão:**
- ✅ Componente Tabs criado
- ✅ Button variant "outline" adicionado
- ✅ Type errors: 30+ → 0

#### Ainda Não Construído
- ❌ Gamificação (missões, conquistas, rankings, batalhas, guildas)
- ❌ Áudio/IA do Simulador de Entrevista
- ❌ Provedores reais do Marketplace
- ❌ Recursos Sociais
- ❌ Backend sync para dossier/sprints/tasks

#### Status de Receita — Primeiro Recurso Pronto ✅
**Paywall de Créditos do Forge (TOTALMENTE IMPLEMENTADO):**
- ✅ Usuários começam com 3 créditos gratuitos.
- ✅ Endpoint de polimento impõe requisito de crédito (HTTP 402 se insuficiente).
- ✅ Pacotes de crédito: "starter" (10 créditos, R$9), "pro" (50 créditos, R$39).
- ✅ Componente `CreditBalance` mostra saldo + botão de compra.
- ✅ Integração Stripe Checkout e Webhooks.

---

### Cronogramas Realistas

| Objetivo | Tempo Estimado |
|----------|----------------|
| Consolidação de Stores (Fase 1-3) | ✅ Concluído (41→23 stores) |
| Correção de bugs críticos de roteamento | ✅ Concluído |
| Fiação do quiz Olcan Compass Core ao backend | 1–2 semanas |
| Primeiro recurso de receita | 2–3 semanas |
| Testes ponta-a-ponta | 1 semana |
| **App v2.5 pronto para substituir v2** | **4–6 semanas** |

## 🔗 Referências Relacionadas
- [[Carta_do_Projeto_Olcan_v2.5]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[03_Produto_Forge/PRD_Geral_Olcan]]
- [[MemPalace_Migration_Spec]] ← Metodologia Wiki

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Grafo_de_Conhecimento_Olcan]] ← Mapa visual
