# Build Quality Roadmap - Execução Sistemática

**Objetivo:** Build limpo com TypeScript strict, sem stubs, stores consolidados  
**Estratégia:** Corrigir incrementalmente, testar após cada grupo de mudanças

---

## 🎯 FASE 1: CORRIGIR BUILD ERRORS (Em Progresso)

### ✅ Completado
- [x] Syntax error em `aura/page.tsx` corrigido
- [x] Imports restaurados corretamente

### ⏳ Em Teste
- [ ] Build completo sem syntax errors
- [ ] Identificar todos os Type errors restantes

---

## 📋 FASE 2: CORRIGIR TYPE ERRORS

### Estratégia
1. Agrupar erros por tipo (unused vars, any types, missing imports)
2. Corrigir por categoria, não por arquivo
3. Testar após cada categoria

### Categorias Identificadas
- **Unused imports** (~10 arquivos)
- **Any types** (~5 arquivos)
- **Missing type imports** (~3 arquivos)

---

## 🗑️ FASE 3: LIMPAR STUB PAGES

### Páginas < 30 linhas para revisar
```
Total identificado: ~13 páginas
Estratégia: Deletar ou adicionar content mínimo
```

### Critério de Decisão
- **Deletar:** Páginas vazias ou placeholder sem funcionalidade
- **Manter:** Páginas com estrutura básica mas incompletas
- **Completar:** Páginas core do produto

---

## 🔄 FASE 4: CONSOLIDAR STORES

### Stores Deprecated (Deletar)
```typescript
// Já marcados com @deprecated
- stores/companionStore.ts
- stores/realCompanionStore.ts
- stores/gamificationStore.ts
```

### Stores Canonical (Manter)
```typescript
// Fonte única de verdade
- stores/auraStore.ts
- stores/canonicalCompanionStore.ts (re-export)
- stores/eventDrivenGamificationStore.ts
- stores/canonicalGamificationStore.ts (re-export)
```

### Ação
1. Buscar imports dos deprecated
2. Substituir por canonical
3. Deletar arquivos deprecated
4. Testar build

---

## 🇧🇷 FASE 5: VERIFICAR PORTUGUÊS

### Páginas Autenticadas para Auditar
```
app/(app)/**/*.tsx
```

### Checklist
- [ ] Sem termos em inglês expostos ao usuário
- [ ] Branding Olcan correto
- [ ] Terminologia acessível (não técnica)

---

## ✅ FASE 6: BUILD FINAL

### Critérios de Sucesso
```bash
cd apps/app-compass-v2.5
npm run build
# ✅ Compiled successfully
# ✅ No TypeScript errors
# ✅ No ESLint errors
# ✅ All pages render
```

---

## 📊 PROGRESSO ATUAL

**Fase 1:** 50% (syntax error corrigido, testando build)  
**Fase 2:** 0%  
**Fase 3:** 0%  
**Fase 4:** 0%  
**Fase 5:** 0%  
**Fase 6:** 0%

**Tempo Estimado Restante:** 2-3 dias

---

## 🎯 PRÓXIMA AÇÃO

Aguardando resultado do build test para identificar Type errors restantes.
