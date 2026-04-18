---
title: Plano de Go-Live v2.5 Abril 2026
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Plano de Go-Live v2.5 (Abril 2026)

**Resumo**: Plano operacional para transformar o estado atual do `olcan-compass v2.5` em um release candidate real, com escopo congelado, critérios de aceite e tickets priorizados por risco.
**Importância**: Crítica
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #go-live #release #v2.5 #audit #launch
**Criado**: 17/04/2026
**Atualizado**: 17/04/2026

---

## Decisão Executiva

**Não fazer switch completo da v2 para a v2.5 no estado atual.**

O caminho correto é um **lançamento v2.5 Core Cut**, preservando apenas os fluxos que já têm base funcional suficiente e escondendo tudo que ainda está ilustrativo, placeholder, desalinhado ou sem cobertura operacional.

### Escopo recomendado para o go-live

**Manter no launch**
- Autenticação e bootstrap de sessão
- Dashboard
- Routes / Readiness / Sprints
- Tasks
- Forge core
- Interviews core sem prometer análise vocal real
- Marketplace MVP se a reserva básica e mensagens funcionarem em staging
- Marketing site

**Retirar do launch visível**
- Aura achievements e quests persistentes, se backend final não estiver pronto
- Guilds como superfície principal
- Forge Lab
- Nudge Engine
- Voice analysis vendida como análise real
- Qualquer fluxo que dependa de placeholder de IA ou fallback silencioso

---

## Go / No-Go Criteria

### P0 obrigatórios para liberar staging beta
- Root scripts de build e type-check funcionando a partir da raiz do monorepo
- App v2.5 buildando sem depender de rotas “em desenvolvimento” no menu principal
- API com suíte mínima de smoke/integration passando em ambiente isolado
- Nenhuma tela do core com lorem ipsum, dados fakes ou banners contraditórios
- Navegação principal refletindo apenas o escopo realmente lançado
- Secrets e flags de produção revisados

### P0 obrigatórios para switch de produção
- Smoke manual completo em staging
- Fluxos críticos com evidência de execução fim a fim
- Rollback plan documentado
- Freeze de branch/release e tree limpa

---

## Checklist de Execução

### Track 1: Release Engineering
- Corrigir scripts raiz para apontar para pacotes reais
- Definir um único comando de build por superfície: app, api, site
- Criar branch de release limpa
- Remover ruído de arquivos deletados/modificados sem relação com o launch

### Track 2: Product Surface Control
- Remover da navegação todas as superfícies não launch-ready
- Revisar command palette para não expor áreas ocultas
- Desindexar rotas não lançadas do sitemap e da descoberta interna

### Track 3: Core Journey Hardening
- Onboarding
- Dashboard
- Routes + Tasks
- Forge
- Interviews
- Marketplace MVP

### Track 4: Design Consistency
- Consolidar tokens e classes visuais
- Remover heranças antigas de paleta e componentes paralelos
- Corrigir overflow, spacing e contraste em telas core

### Track 5: Backend Reliability
- Separar testes herméticos de testes dependentes de infra
- Corrigir falhas contratuais reais
- Formalizar fallback honesto para IA e voz sem vender funcionalidade inexistente

---

## Tickets P0

### P0-01 Corrigir release scripts da raiz
**Problema**
- `package.json` raiz referencia filtros inexistentes para v2.5.

**Arquivos**
- `package.json`
- `pnpm-workspace.yaml`
- `apps/app-compass-v2.5/package.json`
- `apps/site-marketing-v2.5/package.json`

**Aceite**
- `pnpm build:v2.5` funciona da raiz
- `pnpm lint:v2.5` funciona da raiz
- `pnpm` não retorna “No projects matched the filters”

---

### P0-02 Criar branch de release limpa
**Problema**
- O repositório está com volume alto de arquivos deletados, modificados e não rastreados.

**Arquivos**
- Repositório inteiro

**Aceite**
- `git status` do branch de release exibe apenas mudanças intencionais do release
- Sem mistura de reorganização de wiki, cemitério de código e feature work fora do escopo

---

### P0-03 Esconder superfícies não prontas da navegação principal
**Problema**
- A navegação principal ainda promove áreas cuja entrega real é parcial.

**Arquivos**
- `apps/app-compass-v2.5/src/lib/navigation.ts`
- `apps/app-compass-v2.5/src/app/(app)/layout.tsx`
- `apps/app-compass-v2.5/src/lib/product-flags.ts`

**Ação**
- Remover `Aura` persistente, `Guilds`, `Forge Lab`, `Nudge Engine` e extras que não estejam launch-ready do menu e do command palette.

**Aceite**
- O usuário só enxerga áreas suportadas pelo escopo do launch
- Nenhuma rota “coming soon” aparece como core product area

---

### P0-04 Revisar e cortar placeholders de produto em áreas críticas
**Problema**
- Existem superfícies com banners honestos, conteúdo ilustrativo ou lorem ipsum, o que invalida a percepção de produto pronto.

**Arquivos**
- `apps/app-compass-v2.5/src/components/product/ComingSoonPanel.tsx`
- `apps/app-compass-v2.5/src/app/(app)/aura/achievements/page.tsx`
- `apps/app-compass-v2.5/src/app/(app)/guilds/page.tsx`
- `apps/app-compass-v2.5/src/app/(app)/forge-lab/[id]/page.tsx`
- `apps/app-compass-v2.5/src/app/(app)/interviews/[id]/voice/page.tsx`
- `apps/app-compass-v2.5/src/components/modals/DocumentPreviewModal.tsx`

**Ação**
- Ou implementar de verdade, ou retirar do launch, ou mover para área interna/flag desativada.

**Aceite**
- Nenhuma tela do launch contém “Em desenvolvimento”
- Nenhuma tela do launch deriva análise de voz de score sintético sem aviso de produto interno
- Nenhuma modal core usa lorem ipsum default

---

### P0-05 Revalidar o core journey fim a fim
**Problema**
- A suíte E2E atual é fraca, parcial e aparentemente desalinhada do app real.

**Arquivos**
- `apps/app-compass-v2.5/tests/e2e/critical-user-journey.spec.ts`
- `apps/app-compass-v2.5/tests/e2e/onboarding.spec.ts`
- `apps/app-compass-v2.5/tests/e2e/quick-verify.spec.ts`
- `apps/app-compass-v2.5/playwright.config.ts`

**Ação**
- Reescrever os E2E para o fluxo que realmente vai a produção.

**Fluxos obrigatórios**
- login / register
- onboarding útil
- criação de rota
- criação de tarefa
- criação/edição/export de documento no Forge
- sessão de entrevista básica
- booking básico de marketplace, se mantido no launch

**Aceite**
- Um conjunto pequeno e realista de E2Es passa em staging
- Testes não dependem de selectors ou títulos obsoletos

---

### P0-06 Isolar e endurecer a API para release
**Problema**
- A suíte atual tem muitos skips, falhas de ambiente e falhas reais misturadas.

**Arquivos**
- `apps/api-core-v2.5/pytest.ini`
- `apps/api-core-v2.5/app/core/config.py`
- `apps/api-core-v2.5/tests/integration/test_end_to_end_flows.py`
- `apps/api-core-v2.5/tests/security/test_security.py`

**Ação**
- Separar testes que exigem DB/infra de testes unitários herméticos
- Criar smoke suite obrigatória para CI/release
- Corrigir contratos quebrados de modelo/endpoint

**Aceite**
- Smoke suite de release passando
- Falhas reais identificadas e tratadas separadamente das falhas de ambiente
- Sem erro contratual como `invalid keyword argument for Route`

---

### P0-07 Remover promessas falsas no backend de IA
**Problema**
- Há rotas e serviços que ainda retornam placeholder, mock analysis ou stub fallback.

**Arquivos**
- `apps/api-core-v2.5/app/services/interview_service.py`
- `apps/api-core-v2.5/app/services/document_service.py`
- `apps/api-core-v2.5/app/api/routes/narrative.py`
- `apps/api-core-v2.5/app/api/routes/tasks.py`
- `apps/api-core-v2.5/app/services/voice_analysis_service.py`

**Ação**
- Ou entregar a funcionalidade mínima real
- Ou mudar contrato/UI para “beta/internal”
- Ou desabilitar a superfície

**Aceite**
- Nenhuma feature lançada vende IA profunda com payload placeholder
- Fallbacks degradam com clareza, não com aparência de feature pronta

---

### P0-08 Fechar segredos, flags e defaults inseguros para produção
**Problema**
- A configuração base ainda usa defaults inseguros e depende de disciplina operacional.

**Arquivos**
- `apps/api-core-v2.5/app/core/config.py`
- `.env.local`
- arquivos de deployment relevantes

**Aceite**
- Ambiente de produção falha cedo se secrets default existirem
- Stripe/OpenAI/SMTP/DB revisados
- Flags de superfícies não prontas desligadas por padrão

---

## Tickets P1

### P1-01 Consolidar design system real
**Arquivos**
- `packages/ui-components/**`
- `packages/design-tokens/**`
- `apps/app-compass-v2.5/src/**`

**Ação**
- Reaproximar v2.5 da biblioteca compartilhada ou formalizar uma nova fonte única de verdade.

**Aceite**
- Sem mistura arbitrária de `purple`, `pink`, `gray`, `slate`, `dark:` e variações legadas nas telas core

---

### P1-02 UX audit das telas de maior tráfego
**Telas**
- `/dashboard`
- `/routes`
- `/tasks`
- `/forge`
- `/interviews`
- `/marketplace`
- `/onboarding/archetypes`

**Aceite**
- Corrigir overflow, hierarquia, estados vazios, loading e CTA primário

---

### P1-03 Marketplace MVP honesto
**Arquivos**
- `apps/app-compass-v2.5/src/app/(app)/marketplace/**`
- `apps/app-compass-v2.5/src/stores/marketplace.ts`
- `apps/app-compass-v2.5/src/app/(app)/marketplace/provider/[id]/book/page.tsx`

**Ação**
- Confirmar se booking, mensagens, reviews e escrow estão realmente prontos; senão, reduzir para catálogo + lead capture ou booking básico.

---

### P1-04 Harmonizar marketing site com app launch
**Arquivos**
- `apps/site-marketing-v2.5/**`

**Ação**
- Garantir que o marketing não prometa features que o app ainda escondeu do launch.

---

## Tickets P2

### P2-01 Retomar Aura social completa
**Arquivos**
- `apps/app-compass-v2.5/src/app/(app)/aura/**`
- `apps/app-compass-v2.5/src/app/(app)/guilds/**`
- `apps/api-core-v2.5/app/services/quest_service.py`

### P2-02 Retomar Nudge Engine como camada operacional real
**Arquivos**
- `apps/app-compass-v2.5/src/app/(app)/nudge-engine/page.tsx`
- `apps/app-compass-v2.5/src/stores/nudge.ts`

### P2-03 Retomar voice intelligence real
**Arquivos**
- `apps/app-compass-v2.5/src/app/(app)/interviews/[id]/voice/page.tsx`
- `apps/api-core-v2.5/app/services/voice_analysis_service.py`

### P2-04 Retomar Forge Lab como produto separado ou esconder definitivamente
**Arquivos**
- `apps/app-compass-v2.5/src/app/(app)/forge-lab/**`

---

## Sequência Recomendada

### Semana 1
- P0-01 release scripts
- P0-02 branch limpa
- P0-03 hide surfaces
- P0-04 cut placeholders
- P0-08 config/flags/secrets

### Semana 2
- P0-05 E2E reais
- P0-06 smoke API
- P0-07 IA/fallback honesto
- P1-02 UX polish core journey

### Semana 3
- Staging beta fechado
- Correções finais
- Go / No-Go review com evidência

---

## Evidências Obrigatórias para o Go-Live

- Video/screenshot do fluxo de onboarding
- Video/screenshot do fluxo de rota + tarefas
- Video/screenshot do fluxo de Forge
- Video/screenshot do fluxo de entrevista core
- Video/screenshot do fluxo de marketplace MVP, se incluído
- Logs de build da app, site e API
- Resultado da smoke suite
- Lista final de rotas visíveis no launch

---

## Nota Final

O problema principal não é “falta de código”. O problema é **diferença entre superfície aparente e maturidade real**. O launch deve favorecer credibilidade: menos áreas, mais consistência, menos promessa implícita, mais execução sólida.

---

## 🔗 Referências Relacionadas

- [[02_Arquitetura_Compass/Prontidao_Deployment_v2_5]] — critérios de prontidão técnica (portão de qualidade)
- [[00_Onboarding_Inicio/Plano_de_Testes_E2E]] — suite de testes obrigatória para go/no-go
- [[01_Visao_Estrategica/Verdade_Final_v2_5]] — estado honesto do produto pré-lançamento
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]] — arquitetura que será lançada
- [[00_Onboarding_Inicio/Runbook_de_Deployment]] — runbook de deployment

## Ligações
- [[00_SOVEREIGN/Verdade_do_Produto]] ← Estado atual real
- [[00_SOVEREIGN/Olcan_Master_PRD_v2_5]] ← Visão master do produto
