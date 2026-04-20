---
title: Roadmap Implementação v2.5
type: drawer
layer: 1
status: active
last_seen: 2026-04-20
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

# Plano de Implantação v2.5 (Roadmap)

**Resumo**: Cronograma e roteiro detallado para a implementação completa da versão 2.5, contemplando a migração do monorepo e ativação dos módulos Micro-SaaS.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Planejamento
**Tags**: #roadmap #v2.5 #planejamento #implantação #olcan
**Criado**: 11/04/2026
**Atualizado**: 20/04/2026

---

## 🧠 Contexto BMAD
O Roadmap v2.5 é o "Norte do Breakthrough". No BMAD, o planejamento estruturado evita que a equipe se perca em distrações técnicas, focando todos os esforços na entrega das funcionalidades que definem a nova geração do ecossistema Olcan.

## Conteúdo

### Fases de Implementação
1. **Fase 1: Estabilização de Core**: Consolidação de stores e refactor de roteamento (CONCLUÍDO).
2. **Fase 2: Ativação de Módulos (Forge/Aura)**: Integração real com as APIs e fluxos de IA (EM ANDAMENTO).
3. **Fase 3: Monetização e Billing**: Setup do Stripe e paywalls de crédito.
4. **Fase 4: Expansão Social**: Guildas, Marketplace e networking.

### Marcos Críticos (Milestones)
- Jan 2026: Início da Arquitetura v2.5.
- Mar 2026: Conclusão do Design System Liquid Glass.
- Abr 2026: Primeira transação de créditos no Forge ✅
- **Abr 17, 2026**: Dossier System implementado ✅

### 📊 Status Atual (Abril 17)

| Phase | Status | Notes |
|-------|--------|-------|
| Fase 1: Core | ✅ Complete | 24 stores |
| Fase 2: Forge/Aura | ✅ In Progress | Polish working |
| Fase 3: Billing | ✅ Complete | Stripe integration |
| **Fase 4: Dossier** | ✅ **NEW** | Opportunity-bound packages |
| **Fase 5: I/O System** | 🎯 **PLANNING** | PDF/Brand Export, Dossier ZIP |
| Fase 6: Social | ⏳ Pending | Guilds, Marketplace |

### 📊 I/O System + Backend Audit (Fase 5-6)

#### I/O Features
| Feature | Status | Priority |
|---------|--------|----------|
| Brand PDF Templates | ⏳ PENDING | HIGH |
| PDFExporter Enhancement | ⏳ PENDING | HIGH |
| Dossier ZIP Export | ⏳ PENDING | HIGH |
| LinkedIn Import | ⏳ PENDING | MEDIUM |

#### Backend Bugs (from [[Backend_API_Audit_v2_5]])

| Domain | Issue | Priority |
|--------|-------|----------|
| Tasks | Leaderboard returns empty (line 279) | 🔴 HIGH |
| Tasks | Achievement claim stub (line 355) | 🔴 HIGH |
| Tasks | Import from non-existent module | 🔴 HIGH |
| Marketplace | Celery tasks not found | 🟡 MEDIUM |
| Psychology | Celery tasks not found | 🟡 MEDIUM |
| Dossiers | Missing export endpoints | 🟡 MEDIUM |
| Billing | Missing cancellation endpoint | 🟡 MEDIUM |
| CMS | No admin content management | 🟡 MEDIUM |

---

## Ligações
- [[Verdade_do_Produto]] ← Estado atual
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[02_Arquitetura_Compass/SPEC_IO_System_v2_5]] ← Sistema I/O

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[02_Arquitetura_Compass/SPEC_IO_System_v2_5]] ← Frontend I/O
- [[02_Arquitetura_Compass/Backend_API_Audit_v2_5]] ← API completa
- [[05_Infraestrutura/HIDDEN_FOLDERS_AUDIT]] ← Hidden folders + code issues
- [[05_Infraestrutura/INFRAESTRUTURA_OVERVIEW]]
- [[03_Produto_Forge/PRD_Geral_Olcan]]
- [[03_Produto_Forge/Spec_Dossier_System_v2_5]]
- [[01_Visao_Estrategica/Verdade_do_Produto]]
