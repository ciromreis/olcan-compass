# Phase 0: Build Stabilization - Execution Plan

**Goal:** Fix build, remove error masking, consolidate duplicates, remove stubs

---

## ✅ COMPLETED

### 1. Audit Complete
- 151 pages total (16 stubs < 50 lines)
- 21 stores (4 companion duplicates)
- No @olcan/ui-components imports remaining
- Website builds successfully

### 2. Config Fixed
- Removed `ignoreBuildErrors: true` from next.config.mjs
- Removed `ignoreDuringBuilds: true` from eslint
- Real errors will now surface

---

## 🔧 IN PROGRESS

### 3. Fix Prerender Errors

**Error:** "Unsupported Server Component type: {...}"
**Affected Pages:** Multiple pages during static generation

**Root Cause:** Empty/stub pages trying to prerender without proper exports

**Solution:**
1. Identify all empty stub pages (< 10 lines)
2. Delete stub pages OR add proper default export
3. Re-run build to verify fix

---

## 📋 NEXT STEPS

### 4. Consolidate Duplicate Stores

**Deprecated (to delete):**
- `stores/companionStore.ts` - marked deprecated
- `stores/realCompanionStore.ts` - marked deprecated
- `stores/companionPersonalityStore.ts` - check usage first

**Canonical (keep):**
- `stores/auraStore.ts` - single source of truth
- `stores/canonicalCompanionStore.ts` - re-exports auraStore

**Action:**
1. Find all imports of deprecated stores
2. Replace with `@/stores/canonicalCompanionStore`
3. Delete deprecated files
4. Verify no broken imports

### 5. Remove Stub Pages

**Criteria:** Pages with < 50 lines that don't render real content

**Process:**
1. List all stub pages
2. Categorize: delete vs. keep for future
3. Delete confirmed stubs
4. Update navigation/routes if needed

### 6. Verify Portuguese

**Check:** All authenticated pages use Portuguese text

**Files to audit:**
- `app/(app)/**/*.tsx` - all authenticated pages
- Look for English strings in UI
- Check placeholder text

### 7. Clean Build Test

**Final verification:**
```bash
cd apps/app-compass-v2.5
rm -rf .next
npm run build
```

**Success criteria:**
- No TypeScript errors
- No prerender errors
- All working pages build successfully
- Only 25-30 real pages remain

---

## 🎯 CURRENT ACTION

Deleting empty stub pages to fix prerender errors.
