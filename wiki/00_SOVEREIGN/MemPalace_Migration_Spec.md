# MemPalace Migration Spec
**Adaptado para Olcan Compass v2.5**
**Data**: 17/04/2026
**Status**: Planeado

---

## O Conceito MemPalace Aplicado

| Conceito MemPalace | Equivalente Olcan | Descrição |
|-------------------|------------------|-----------|
| **Wing** | Arena Principal | Área temática maior (ex: Produto, Arquitetura, Estratégia) |
| **Room** | Categoria/Pasta | Tópico específico dentro de uma wing (ex: UI, Backend, Auth) |
| **Drawer** | Documento.md | Arquivo individual com conhecimento |
| **Knowledge Graph** | Grafo de Conhecimento | Entidades com validade temporal |
| **Backlinks** | Referências Bidirecionais | Docs que se conectam entre si |

---

## As 10 Wings do Olcan

### Wing 00: 🏛️ SOVEREIGN (Truth Source)
*A autoridade máxima - bússola global*
- `00_SOVEREIGN/` → 5 drawers principais
  - `Olcan_Master_PRD_v2_5.md` - PRD Master completo
  - `Verdade_do_Produto.md` - Estado atual real
  - `Grafo_de_Conhecimento_Olcan.md` - Mapa visual
  - `Analise_Historiador_Nexus.md` - Análise Nexus
  - `MemPalace_Migration_Spec.md` - Esta especificação

### Wing 01: 🎯 ESTRATEGICA (Strategic Vision)
*Visão, missão e roadmap*
- `01_Visao_Estrategica/` → ~12 drawers

### Wing 02: 🏗️ ARQUITETURA (Technical Architecture)
*Sistemas, API, infraestrutura*
- `02_Arquitetura_Compass/` → ~35 drawers

### Wing 03: 🔨 PRODUTO (Product & Design)
*UI, features, UX*
- `03_Produto_Forge/` → ~18 drawers

### Wing 04: ✨ AURA (Gamification & Companion)
*Ecossistema Aura, companions*
- `04_Ecossistema_Aura/` → ~8 drawers

### Wing 05: 💰 ECONOMIC (Economic Intelligence)
*Finanças, escrow, pricing*
- `05_Inteligencia_Economica/` → ~3 drawers

### Wing 06: 📝 NARRATIVE (AI & Scoring)
*Narrative Forge, IA scoring*
- `06_Inteligencia_Narrativa/` → ~2 drawers

### Wing 07: 🤖 AGENTES (AI Agents)
*Nexus, automação, agentes*
- `07_Agentes_IA/` → ~7 drawers

### Wing 08: 🚀 OPERATIONS (Onboarding & Runbooks)
*Procedimentos, guias, runbooks*
- `00_Onboarding_Inicio/` → ~14 drawers

### Wing 09: 📦 ARCHIVE (Permanent Archive)
*Histórico - não é para leitura ativa*
- `10_Arquivo_Permanente/` → ~267 drawers

---

## Estrutura de Backlinks (O Problema Atual)

**Problema**: Wiki atual tem 719 ficheiros mas:
- Poucos backlinks entre docs importantes
- Arquivo Permanente está separado mas não referenciado
- Grafo de conhecimento não conecta bem

**Solução**: Sistema dewikilinks interno

### Template de Wikilink
```markdown
## Ligações
- [[Grafo_de_Conhecimento_Olcan]] ← Superior
- [[Verdade_do_Produto]] ← Contexto
- [[Arquitetura_v2_5_Compass]] ← Técnica
```

### frontmatter obrigatório para docs principais
```yaml
---
title: Título do Doc
type: wing/room/drawer
layer: 0-9
status: active/deprecated
last_seen: 2026-04-17
backlinks:
  - doc_name
---
```

---

## Plano de Migração

### Fase 1: Frontmatter ✅ (17/04/2026)
- [x] Adicionar frontmatter a docs principais
- [x] Criar sistema de backlinks

### Fase 2: Deduplicação (Pendente)
- [ ] Identificar docs duplicados
- [ ] Consolidar em drawers únicos
- [ ] Criar redirections

### Fase 3: Grafo (Pendente)
- [ ] Atualizar Grafo_de_Conhecimento_Olcan
- [ ] Criar entidades com validade
- [ ] Definir relações

### Fase 4: CLAUDE.md (Hoje+3)
- [ ] Atualizar metodologia
- [ ] Guia de navegação

---

## 📊 Métricas Atuais → Meta (Updated: 2026-04-17)

| Métrica | Antes | Depois |
|--------|-------|--------|
| Docs com frontmatter | ~5 | 6+ (major) |
| Backlinks ativos | ~20 | 30+ |
| Wiki-code sync | stale | ✅ synced |
| Docs com backlinks | 6 | 87 |

---

## 🗝️ Navegação após Migração

Para um agente IA (ex: próximo sessão):

1. **Começar sempre aqui**:
   - `wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md` (PRD Master)
   - `wiki/00_SOVEREIGN/Verdade_do_Produto.md` (Realidade atual)

2. **Se precisa de contexto**:
   - `wiki/00_SOVEREIGN/Grafo_de_Conhecimento_Olcan.md` (Mapa visual)

3. **Se precisa de técnica**:
   - `wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md`

4. **Se precisa de operação**:
   - `wiki/00_Onboarding_Inicio/Padroes_de_Codigo.md`

5. **Se precisa de arquivo**:
   - `wiki/10_Arquivo_Permanente/00_MASTER_INDEX.md`

---

## Legenda de Status

| Status | Significado |
|--------|------------|
| `active` | Doc ativo, para leitura |
| `stale` | Precisa de revisão |
| `deprecated` | Substituído por outro |
| `archived` | Histórico, referência |
| `template` | Template para novos docs |