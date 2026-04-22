---
title: Diagnóstico de Organização - Olcan Compass v2.5
type: drawer
layer: 2
status: completed
last_seen: 2026-04-22
backlinks:
  - Verdade_do_Produto
  - Arquitetura_v2_5_Compass
  - Repositorio_Organizacao_v2_5
---

# Diagnóstico de Organização - v2.5

**Data**: 2026-04-22
**Escopo**: Frontend + Backend + Wiki

---

## 📊 Estrutura do Projeto

### apps/
| Pasta | Tipo | Status | Notas |
|------|------|--------|-------|
| `app-compass-v2.5` | Frontend (Next.js) | ✅ ATIVO | 37 dirs, main app |
| `api-core-v2.5` | Backend (FastAPI) | ✅ ATIVO | 33 dirs |
| `site-marketing-v2.5` | Marketing | ✅ ATIVO | |
| `app-compass-v2` | Frontend v2 | 🔒 FROZEN | não modificar |
| `api-core-v2` | Backend v2 | 🔒 FROZEN | não modificar |

### Root Files (essenciais)
- CLAUDE.md, README.md, package.json
- docker-compose.yml, render.yaml, vercel.json
- pnpm-workspace.yaml

---

## ✅ Limpezas Realizadas Sessão

1. **Dossier endpoints consolidados** → só em `auth.py`
2. **Stripe dependency** adicionada
3. **Empty frontend.log** removido
4. **CLAUDE.md** atualizado para auditores

---

## 📝 Wiki Atualização Necessária Contínua

- [x] Verdade_do_Produto.md
- [x] Diagnostico_Organizacao_v2_5.md (novo)
- [ ] Arquitetura_v2_5_Compass.md
- [ ] Repositorio_Organizacao_v2_5.md