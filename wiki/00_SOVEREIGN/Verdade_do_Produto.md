---
title: Verdade do Produto (Estado Real)
type: drawer
layer: 0
status: active
last_seen: 2026-04-21
backlinks:
  - Olcan_Master_PRD_v2_5
  - Grafo_de_Conhecimento_Olcan
  - Spec_Dossier_System_v2_5
  - MemPalace_Migration_spec
---

<!-- Naviado por: MemPalace — Navegabilidade sistêmica -->

# O Que o Olcan Compass É — Estado Real (Verdade do Produto)

**Resumo**: Este documento é o status definitivo e sem inflação do produto, descrevendo o que realmente funciona vs. o que é apenas código ou promessa.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Identidade
**Tags**: #audit #status #honestidade #verdade #estratégia
**Criado**: 12/04/2026
**Atualizado**: 21/04/2026
**Versão**: 2.5

## 📊 snapshotCode: 2026-04-21

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

### O Que Realmente Existe (Abril 18, 2026 — atualizado por implementação)

#### 🔴 BLOCKER: Auth Register/Login retorna 500 em produção (2026-04-21)

**Contexto**: O model `User` no ORM declarava `username: str` NOT NULL, mas nenhuma
migration criou essa coluna no PostgreSQL de produção. Isso crashava **todo endpoint
autenticado** (`/auth/register`, `/auth/login`, `/auth/me`, dossiers, forge, etc.).

**Fix aplicado** (commit `40d8736`, deployed via Render auto-deploy):
- Migration `0026_add_users_username` — adiciona coluna nullable, backfill do email local-part
- `user.py:30` — `username` agora `nullable=True`
- `auth.py:155-167` — register auto-gera username único do email
- `health.py:48` — endpoint `/api/migrate-db-render` para forçar migration remotamente

**Status**: Deployed mas `POST /api/auth/register` **ainda retorna 500**.
O agente anterior (Claude) não conseguiu diagnosticar a causa raiz antes de esgotar limite.

**Investigação necessária**:
1. Verificar se migration `0026` realmente executou (`GET /api/migrate-db-render?secret_key=olcan2026omega`)
2. Checar stack trace real nos logs do Render
3. Possível: outros campos do User model (forge_credits, subscription_plan, etc.) também não existem na tabela
4. **Enquanto auth não funcionar, NENHUMA feature autenticada funciona** (forge, dossier, interviews, etc.)

---

#### ⚡ MAIO: Document Forge v2.5 (IMPLEMENTADO COMPLETO)
**Features implementadas nesta sessão:**

1. **14 Document Types**: cv, resume, motivation_letter, cover_letter, statement_of_purpose, personal_statement, research_proposal, scholarship_essay, recommendation, transcript, language_cert, portfolio, writing_sample, other

2. **Document Templates** (`document-templates.ts`):
   - 7 templates com estrutura completa
   - Section guidance com word counts
   - Tips e common mistakes por tipo

3. **Enhanced Export** (`enhanced-export.ts`):
   - PDF com branding Olcan
   - DOCX editável
   - Bundle export

4. **Task Dashboard** (`TaskDashboard.tsx`):
   - Status/priority distribution
   - Completion metrics
   - Tab "Painel" na página /tasks

5. **Bulk Document Creator** (`BulkDocumentCreator.tsx`):
   - Create múltiplos docs para aplicações paralelas
   - Templates por tipo de oportunidade
   - Scholarship, Master, PhD, Job

6. **Task-Document Linking** (`TaskDocumentLinker.tsx`):
   - Vincular tarefas a documentos específicos
   - Readiness indicators

7. **Quick Polish Actions** (`QuickPolishActions.tsx`):
   - Fix passive voice
   - Strengthen verbs
   - Fix common typos
   - Add transitions

8. **Document Transformer** (`DocumentTransformer.tsx`):
   - Tone: formal, casual, persuasive, academic
   - Length: expand, condense
   - Style: clear, impactful, storytelling

9. **Writing Tips Panel** (`WritingTipsPanel.tsx`):
   - Tips contextuais por tipo de documento

10. **Application Document Actions** (`ApplicationDocumentActions.tsx`):
    - Quick create/view docs na lista de aplicações

---

**Status**: Build Passando ✅
**Backend sync**: ⚠️ Pendente

#### ABRIL 18: Novas Implementações Document Forge

**Features implementadas HOJE:**

1. **DossierHub** (`DossierHub.tsx`):
   - Hub central de candidaturas paralelas
   - Agrupamento por oportunidade
   - Indicadores de urgência (≤14 dias)
   - Stats: total, ativos, concluídos, docs pendentes
   - Expandable timeline por processo

2. **ExportControlPanel** (`ExportControlPanel.tsx`):
   - Botão flutuante próximo ao companion bar
   - Seleção por processo ou global
   - Formatos: DOCX, PDF, ZIP (implementado)
   - Badge com contagem docs prontos

3. **VariationsManager** (`VariationsManager.tsx`):
   - Gestão de variações de documentos
   - Criar variação para nova oportunidade
   - Clonar para todos os processos
   - Tracking por variante

4. **DossierTimeline** (`DossierTimeline.tsx`):
   - Visualização cronológica
   - Prazos, documentos, tarefas
   - Agrupamento por mês
   - Indicadores de urgência

5. **DocumentGuidancePanel** (`DocumentGuidancePanel.tsx`):
   - Guias contextuais por tipo
   - Estrutura, dicas, erros comuns
   - Suporte a CMS (`document-guidance`)
   - Fallback com templates built-in

6. **ProfileDocumentIntegrator** (`ProfileDocumentIntegrator.tsx`):
   - Inserção de dados do perfil via click
   - Campos: header, summary, experience, education, skills, languages, achievements
   - Conditional fields por tipo de documento

7. **EnhancedDocumentPanel** (`EnhancedDocumentPanel.tsx`):
   - Painel de gestão avançado
   - Readyness granular: draft → review → export_ready → submitted
   - Quick actions: editar, exportar, coach IA, versões

8. **CMS Enhancement** (`cms.ts`):
   - `fetchDocumentGuidance(docType)`
   - `fetchAllDocumentGuidance()`
   - Interface `CMSDocumentGuidance`

9. **Integração Layout**:
   - ExportControlPanel no app layout (floating)
   - Timeline view tab na página /forge
   - DocumentGuidancePanel no editor sidebar
   - ProfileDocumentIntegrator no editor sidebar

**Status**: Build Passando ✅ | Typecheck ✅ | Lint ✅

---

#### NOVEMBRO: Dossier System
**Implementado anteriormente:**
- ✅ Dossier Store com full CRUD (600+ linhas)
- ✅ Type system completo (`dossier-system.ts` - 640+ linhas)
- ✅ List page `/dossiers` com stats dashboard
- ✅ Detail page `/dossiers/[id]` com 4 tabs
- ✅ Document Wizard multi-step (CV, Motivation Letter, Research Proposal)
- ✅ Document Type Selector (9 tipos)
- ⚠️ Backend sync ainda não implementado

#### Funcionando Totalmente
- ✅ Autenticação de usuário (registro, login, JWT)
- ✅ CRUD básico de companheiro (criar, visualizar, atividades de alimentar/treinar/jogar/descansar)
- ✅ Website público (ao vivo no Vercel)
- ✅ Backend v2.5 API (funcional, rotas registradas, Docker Postgres disponível)
- ✅ **Build do App v2.5 passando** (26 stores, 169 páginas, limpo)
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

#### Bugs Conhecidos em Produção (2026-04-21)
- 🔴 **Auth 500** — Register e Login retornam HTTP 500 (ver blocker acima)
- 🐛 `profile.momentum` retorna `last_activity_days: 0` hardcoded (`auth.py:84`)
- 🐛 `user.username` pode ser None (endpoint `/users/{user_id}` não trata)
- 🔴 Tasks `tasks.py:185-196` importa de `app.api.v1.companions` que não existe
- 🔴 Celery tasks referenciadas em psychology e marketplace não existem

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
| Consolidação de Stores (Fase 1-3) | ✅ Concluído (41→26 stores) |
| Correção de bugs críticos de roteamento | ✅ Concluído |
| **Auth 500 blocker fix** | **URGENTE — bloqueia tudo** |
| Fiação do quiz Olcan Compass Core ao backend | 1–2 semanas (após auth fix) |
| Primeiro recurso de receita | 2–3 semanas (após auth fix) |
| Testes ponta-a-ponta | 1 semana |
| **App v2.5 pronto para substituir v2** | **4–6 semanas (após auth fix)** |

## 🔗 Referências Relacionadas
- [[Carta_do_Projeto_Olcan_v2.5]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[03_Produto_Forge/PRD_Geral_Olcan]]
- [[MemPalace_Migration_Spec]] ← Metodologia Wiki

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Grafo_de_Conhecimento_Olcan]] ← Mapa visual
