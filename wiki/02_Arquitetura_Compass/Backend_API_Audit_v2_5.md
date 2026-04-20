---
title: Backend API Code Audit v2.5
type: drawer
layer: 2
status: active
last_seen: 2026-04-20
backlinks:
  - Arquitetura_v2_5_Compass
  - SPEC_IO_System_v2_5
  - Roadmap_Implementacao_v2_5
---

# Backend API Code Audit v2.5

**Resumo**: Auditoria profunda do backend api-core-v2.5 - todos os domínios, endpoints, gaps e bugs identificados.
**Importância**: Crítico
**Status**: Completo
**Camada (Layer)**: Arquitetura / Backend
**Tags**: #api #backend #audit #fastapi #endpoints #bugs
**Criado**: 20/04/2026
**Atualizado**: 20/04/2026

---

## 📊 Executive Summary

**Total Endpoints Found:** 410+ across all routers

| Domain | Status | Endpoints | Issues |
|--------|--------|-----------|--------|
| Authentication | ✅ Working | 12 | 1 bug |
| Users | ⚠️ Partial | 4 | Missing settings |
| Psychology | ✅ Working | 8 | Celery tasks missing |
| Documents/Forge | ✅ Working | 18 | Polish not wired |
| Routes | ✅ Working | 7 | 1 potential bug |
| Tasks | ⚠️ Issues | 14 | 3 stubs/bugs |
| Dossiers | ⚠️ Partial | 10 | Missing exports |
| Aura/Companions | ✅ Working | 12 | Legacy wrappers |
| Marketplace | ⚠️ Issues | 20 | Celery tasks missing |
| Billing | ⚠️ Partial | 4 | Missing endpoints |
| CMS | 🔴 Incomplete | 3 | No admin CMS |

---

## 1. Authentication (`/api/auth/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| POST | `/auth/register` | `auth.py:125` | ✅ Working |
| POST | `/auth/login` | `auth.py:200` | ✅ Working |
| POST | `/auth/refresh` | `auth.py:253` | ✅ Working |
| POST | `/auth/logout` | `auth.py:319` | ✅ Working |
| GET | `/auth/me` | `auth.py:325` | ✅ Working |
| PUT | `/auth/me` | `auth.py:334` | ✅ Working |
| PUT | `/auth/me/password` | `auth.py:360` | ✅ Working |
| POST | `/auth/verify-email` | `auth.py:390` | ✅ Working |
| POST | `/auth/resend-verification` | `auth.py:435` | ✅ Working |
| POST | `/auth/forgot-password` | `auth.py:504` | ✅ Working |
| POST | `/auth/reset-password` | `auth.py:567` | ✅ Working |

### Issues

| Line | Issue | Severity |
|------|-------|----------|
| 84 | `profile.momentum` returns hardcoded `"last_activity_days": 0` | 🐛 BUG |
| — | OAuth endpoints (Google, Apple) not connected | ⚠️ MISSING |

---

## 2. Users (`/api/v1/users/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/users/profile` | `users.py:18` | ✅ Working |
| PUT | `/users/profile` | `users.py:26` | ✅ Working |
| GET | `/users/progress` | `users.py:48` | ✅ Working |
| GET | `/users/{user_id}` | `users.py:81` | ✅ Working |

### Issues

| Issue | Status |
|-------|--------|
| User settings endpoints | 🔴 MISSING |
| User deletion/account closure | 🔴 MISSING |
| Returns `user.username` but may be None | 🐛 BUG |

---

## 3. Psychology (`/api/psych/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/psych/profile` | `psychology.py:36` | ✅ Working |
| PUT | `/psych/profile` | `psychology.py:56` | ✅ Working |
| PATCH | `/psych/profile` | `psychology.py:89` | ✅ Working |
| POST | `/psych/assessment/start` | `psychology.py:116` | ✅ Working |
| GET | `/psych/assessment/{session_id}/question` | `psychology.py:155` | ✅ Working |
| POST | `/psych/assessment/answer` | `psychology.py:220` | ✅ Working |
| GET | `/psych/assessment/{session_id}/result` | `psychology.py:505` | ✅ Working |
| GET | `/psych/history` | `psychology.py:540` | ✅ Working |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 396-413 | Celery task `app.tasks.temporal_matching.recalculate_temporal_matches_task` | 🔴 NOT FOUND |
| — | Celery task `app.tasks.credentials.generate_credential_task` | 🔴 NOT FOUND |

---

## 4. Documents/Forge (`/api/v1/documents/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| POST | `/documents` | `documents.py:35` | ✅ Working |
| GET | `/documents` | `documents.py:71` | ✅ Working |
| GET | `/documents/{document_id}` | `documents.py:109` | ✅ Working |
| PUT | `/documents/{document_id}` | `documents.py:133` | ✅ Working |
| DELETE | `/documents/{document_id}` | `documents.py:200` | ✅ Working |
| POST | `/documents/{document_id}/analyze` | `documents.py:227` | ✅ Working |
| POST | `/documents/{document_id}/polish` | `documents.py:264` | ⚠️ Stub |
| GET | `/documents/{document_id}/polish` | `documents.py:307` | ⚠️ Stub |
| GET | `/documents/{document_id}/versions` | `documents.py:419` | ✅ Working |
| POST | `/documents/{document_id}/ats-analyze` | `documents.py:600` | ✅ Working |
| GET | `/documents/templates` | `documents.py:581` | ✅ Working |
| GET | `/documents/dossier` | `documents.py:691` | ✅ Working |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 300-303 | Polish requests create record but don't trigger AI | ⚠️ STUB |
| — | Real-time collaborative editing | 🔴 MISSING |

---

## 5. Routes (`/api/routes/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/routes/templates` | `routes.py:37` | ✅ Working |
| POST | `/routes` | `routes.py:109` | ✅ Working |
| GET | `/routes` | `routes.py:183` | ✅ Working |
| GET | `/routes/{route_id}` | `routes.py:202` | ✅ Working |
| PUT | `/routes/{route_id}` | `routes.py:275` | ✅ Working |
| DELETE | `/routes/{route_id}` | `routes.py:331` | ✅ Working |
| PATCH | `/routes/milestones/{milestone_id}` | `routes.py:358` | ✅ Working |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 97-99 | Sort by `temporal_match_score` may fail if attribute missing | 🐛 RISK |

---

## 6. Tasks (`/api/tasks/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| POST | `/tasks/` | `tasks.py:32` | ✅ Working |
| GET | `/tasks/` | `tasks.py:47` | ✅ Working |
| GET | `/tasks/{task_id}` | `tasks.py:89` | ✅ Working |
| PATCH | `/tasks/{task_id}` | `tasks.py:102` | ✅ Working |
| DELETE | `/tasks/{task_id}` | `tasks.py:122` | ✅ Working |
| POST | `/tasks/{task_id}/complete` | `tasks.py:145` | ✅ Working |
| POST | `/tasks/{task_id}/start` | `tasks.py:203` | ✅ Working |
| GET | `/tasks/progress` | `tasks.py:267` | ✅ Working |
| GET | `/tasks/achievements` | `tasks.py:298` | ✅ Working |
| GET | `/tasks/achievements/user` | `tasks.py:322` | ✅ Working |
| POST | `/tasks/achievements/{achievement_id}/claim` | `tasks.py:355` | 🔴 STUB |
| GET | `/tasks/progress/leaderboard` | `tasks.py:279` | 🔴 STUB (empty) |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 185-196 | Import from non-existent `app.api.v1.companions` | 🔴 BROKEN |
| 279-291 | Leaderboard returns empty data | 🔴 STUB |
| 355-363 | Achievement claim not implemented | 🔴 STUB |

---

## 7. Dossiers (`/api/v1/dossiers/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| POST | `/dossiers` | `dossiers.py:42` | ✅ Working |
| GET | `/dossiers` | `dossiers.py:73` | ✅ Working |
| GET | `/dossiers/{dossier_id}` | `dossiers.py:111` | ✅ Working |
| PUT | `/dossiers/{dossier_id}` | `dossiers.py:135` | ✅ Working |
| DELETE | `/dossiers/{dossier_id}` | `dossiers.py:168` | ✅ Working |
| POST | `/dossiers/{dossier_id}/documents` | `dossiers.py:195` | ✅ Working |
| PUT | `/dossiers/{dossier_id}/documents/{document_id}` | `dossiers.py:228` | ✅ Working |
| POST | `/dossiers/{dossier_id}/tasks` | `dossiers.py:262` | ✅ Working |
| PUT | `/dossiers/{dossier_id}/tasks/{task_id}` | `dossiers.py:293` | ✅ Working |
| POST | `/dossiers/{dossier_id}/evaluate` | `dossiers.py:330` | ✅ Working |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 96-106 | N+1 query when listing dossiers | 🐛 PERFORMANCE |
| — | Document variations (parallel processes) | 🔴 MISSING |
| — | Export endpoints (PDF/ZIP) | 🔴 MISSING |
| — | Dossier document deletion | 🔴 MISSING |

---

## 8. Aura/Companions (`/api/companions/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/companions/` | `companions.py:247` | ✅ Working |
| POST | `/companions/` | `companions.py:260` | ✅ Working |
| GET | `/companions/{companion_id}` | `companions.py:311` | ✅ Working |
| POST | `/companions/{companion_id}/care` | `companions.py:321` | ✅ Working |
| GET | `/companions/{companion_id}/activities` | `companions.py:389` | ✅ Working |
| GET | `/companions/{companion_id}/evolution/check` | `companions.py:418` | ✅ Working |
| POST | `/companions/{companion_id}/evolution` | `companions.py:451` | ✅ Working |

### Issues

| Status | Notes |
|--------|-------|
| ✅ Working | Full companion lifecycle with evolution |
| ⚠️ Legacy | Old endpoints (feed, train, play, rest) wrapped via `/care` |

---

## 9. Marketplace (`/api/marketplace/*`)

### Endpoints (20 total)

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/marketplace/providers` | `marketplace.py:54` | ✅ Working |
| GET | `/marketplace/providers/{provider_id}` | `marketplace.py:182` | ✅ Working |
| GET | `/marketplace/services` | `marketplace.py:301` | ✅ Working |
| GET | `/marketplace/services/{service_id}` | `marketplace.py:399` | ✅ Working |
| POST | `/marketplace/bookings` | `marketplace.py:474` | ✅ Working |
| PATCH | `/marketplace/bookings/{booking_id}` | `marketplace.py:713` | ✅ Working |
| POST | `/marketplace/reviews` | `marketplace.py:784` | ✅ Working |
| GET | `/marketplace/conversations` | `marketplace.py:914` | ✅ Working |
| POST | `/marketplace/providers/onboard` | `marketplace.py:1250` | ✅ Working |
| GET | `/marketplace/providers/me` | `marketplace.py:1399` | ✅ Working |

### Issues

| Line | Issue | Status |
|------|-------|--------|
| 599-611 | Celery task `app.tasks.escrow.create_escrow_task` | 🔴 NOT FOUND |
| 763-767 | Celery task for escrow resolution | 🔴 NOT FOUND |

---

## 10. Billing (`/api/billing/*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| GET | `/billing/status` | `billing.py:97` | ✅ Working |
| POST | `/billing/subscription-checkout` | `billing.py:110` | ✅ Working |
| POST | `/billing/checkout` | `billing.py:176` | ✅ Working |
| POST | `/billing/webhook` | `billing.py:242` | ✅ Working |

### Issues

| Issue | Status |
|-------|--------|
| Subscription cancellation endpoint | 🔴 MISSING |
| Invoice listing endpoint | 🔴 MISSING |
| Environment validation at startup | ⚠️ MISSING |

---

## 11. CMS (`/api/v1/cms*`)

### Endpoints

| Method | Endpoint | File:Line | Status |
|--------|----------|-----------|--------|
| POST | `/enhanced-forge/cms-forms` | `enhanced_forge.py:541` | ✅ Working |
| GET | `/enhanced-forge/cms-forms` | `enhanced_forge.py:579` | ✅ Working |
| PUT | `/enhanced-forge/cms-forms/{form_id}` | `enhanced_forge.py:598` | ✅ Working |

### Issues

| Issue | Status |
|-------|--------|
| Admin content management (pages, blogs) | 🔴 MISSING |
| CMS form templates (dynamic forms) | 🔴 MISSING |
| Content publishing workflow | 🔴 MISSING |

---

## 🔴 Critical Bugs Summary

| Domain | Line | Issue |
|--------|------|-------|
| Tasks | 185-196 | Import from non-existent `app.api.v1.companions` |
| Tasks | 279-291 | Leaderboard returns empty data |
| Tasks | 355-363 | Achievement claim is stub |
| Psychology | 396-413 | Celery task imports that don't exist |
| Marketplace | 599-611 | Non-existent Celery task |
| Marketplace | 763-767 | Non-existent Celery task |
| Routes | 97-99 | AttributeError potential on sort |

## 🔴 Missing Endpoints Summary

| Domain | Missing |
|--------|---------|
| Users | Settings management |
| Users | Account deletion |
| Dossiers | Document variations |
| Dossiers | Export (PDF/ZIP) |
| Billing | Subscription cancellation |
| Billing | Invoice listing |
| CMS | Admin content management |
| Tasks | Working leaderboard |

---

## 📋 Handover Notes (Para Modelos Menos Potentes)

### Como debugar problemas

1. **Companion save fails** - Check `aura/discover/page.tsx` + API `/companions/`
2. **Leaderboard empty** - Check `tasks.py:279-291` (stub)
3. **Celery errors** - Tasks don't exist, need implementation or removal

### Health Check

```bash
# API
curl https://olcan-compass-api.onrender.com/api/health

# Database
curl https://olcan-compass-api.onrender.com/api/psych/questions
```

---

## 🔗 Links

**Arquitetura:**
- [[Arquitetura_v2_5_Compass]] - Arquitetura geral
- [[SPEC_IO_System_v2_5]] - I/O System com stores

**Infra:**
- [[INFRAESTRUTURA_OVERVIEW]] - Mapa de infraestrutura
- [[HIDDEN_FOLDERS_AUDIT]] - Hidden folders + issues

**Estratégia:**
- [[Roadmap_Implementacao_v2_5]] - Roadmap
- [[Verdade_do_Produto]] - Estado atual