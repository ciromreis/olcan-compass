---
title: Próximas Tarefas de Código
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Roadmap_Implementacao_v2_5
---

## 🧠 Contexto BMAD
Esta lista é o "Backlog de Breakthroughs Imediatos". No BMAD, a clareza sobre o que deve ser feito a seguir é o que mantém a velocidade de desenvolvimento. Cada item aqui é uma peça necessária para completar o quebra-cabeça da v2.5.

## Conteúdo

### Prioridade 1: Crítico para Onboarding
- [x] Dossier System implementado ✅
- [x] Document Wizard ✅
- [ ] Backend sync para Dossier/API
- [ ] Seed do banco para questões OIOS

### Prioridade 2: Monetização (First Revenue)
- [x] Stripe credits integration ✅
- [ ] Production Stripe keys

### Prioridade 3: Backend Sync
- [ ] Dossier API endpoints
- [ ] Sprints API endpoints
- [ ] Tasks API endpoints

---

## 🔗 Referências
- [[Verdade_do_Produto]] ← Estado atual
- [[Roadmap_Implementacao_v2_5]] ← Roadmap
- [ ] Resolver redundâncias de stores em páginas de dashboard.
- [ ] Finalizar tradução para PT-BR de menus remanescentes.

---

## 💡 Agent Insights (Aprendido)

**Coisas que agentes esquecem:**
1. **Branding** - Não assumir nomes consistente; usar "Olcan Compass" não "Compass" ou "Olcan"
2. **Type check** - Sempre rodar antes de commit
3. **Backend sync** - Features novas precisam de endpoints API
4. **Seeding** - Sempre que adicionar dados seed,文档á-los

**Padrões de erros recorrentes:**
- Button variants não existem → adicionar ao component
- Tabs não existem → criar componente
- Importações quebradas → verificar paths
