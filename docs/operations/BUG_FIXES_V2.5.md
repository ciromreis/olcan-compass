# Bug Fixes for V2.5 - Implementation Guide

**Date**: March 26, 2026, 6:00 AM  
**Status**: In Progress

---

## ✅ Fixed Issues

### 1. Critical Frontend Error - React Hooks in Store ✅

**Issue**: Frontend crashed with "Invalid hook call" error
- `themeStore.ts` was using `useCallback` outside of React component
- Caused complete application failure on load

**Fix Applied**:
- Removed `useCallback` import and usage
- Converted to regular functions
- Added SSR safety check for `document` access
- Added missing `ThemeColors` type definition

**Files Modified**:
- `apps/app-compass-v2/src/stores/themeStore.ts`

**Status**: ✅ FIXED - Frontend now loads successfully

---

## 🔧 Issues to Fix (From Bug Report)

### 2. Login Slowness and Initial Failure ⏳

**Problem**: Cold starts cause timeouts, first login attempt fails

**Root Cause**:
- Serverless functions + Neon DB cold starts
- 30s Axios timeout too short for first request
- No retry logic

**Solution Required**:
1. Add retry logic with exponential backoff in `src/lib/api.ts`
2. Extend `maxDuration` in `next.config.mjs`
3. Implement silent retry for auth endpoints

**Priority**: HIGH
**Estimated Time**: 1 hour

---

### 3. Route Creation Error - 500 Crash ⏳

**Problem**: "Não foi possível criar a rota na API" - generic error hides 500 crash

**Root Cause**:
- `GET /routes/templates` tries to access `.temporal_match_score`
- Property not defined in `RouteTemplateResponse` schema
- Causes `AttributeError` and 500 crash

**Solution Required**:
1. Add `temporal_match_score: Optional[int] = None` to schema
2. Update error handling in `stores/routes.ts` to show real errors

**Files to Modify**:
- `apps/api/app/schemas/route.py`
- `apps/web-v2/src/stores/routes.ts`

**Priority**: HIGH
**Estimated Time**: 30 minutes

---

### 4. Interview Timer Memory Leak ⏳

**Problem**: Timer continues running after interview finishes

**Root Cause**:
- `setInterval` in `[id]/session/page.tsx` never cleared
- No `clearInterval` on `isFinished = true`
- Causes memory leak and battery drain

**Solution Required**:
```typescript
useEffect(() => {
  if (isFinished) {
    clearInterval(timerRef.current)
    return
  }
  
  timerRef.current = setInterval(() => {
    // timer logic
  }, 1000)
  
  return () => clearInterval(timerRef.current)
}, [isFinished])
```

**Priority**: MEDIUM
**Estimated Time**: 15 minutes

---

### 5. Interview Duration Calculation Error ⏳

**Problem**: Shows 5916 minutes instead of actual time

**Root Cause**:
- Uses calendar delta `completedAt - startedAt`
- If user starts Tuesday, finishes Saturday = days of difference
- Should use `time_spent_seconds` from responses

**Solution Required**:
1. Sum `time_spent_seconds` from all responses
2. Don't use calendar delta
3. Update both backend and frontend calculation

**Files to Modify**:
- `apps/api/app/api/routes/interview.py`
- `apps/web-v2/src/stores/interviews.ts`

**Priority**: MEDIUM
**Estimated Time**: 30 minutes

---

### 6. Interview History Filter Bug ⏳

**Problem**: Sessions with score 0 don't appear in history

**Root Cause**:
- Filter uses `if (remote.overall_score)` 
- Score of 0 is falsy, gets filtered out
- Wrong key names also cause issues

**Solution Required**:
```typescript
// Change from:
if (remote.overall_score)

// To:
if (remote.overall_score !== undefined && remote.overall_score !== null)
```

**Priority**: MEDIUM
**Estimated Time**: 15 minutes

---

### 7. Community Navigation Loop ⏳

**Problem**: Clicking "respostas" returns to main community page

**Root Cause**:
- `CommunityContextSection.tsx` wraps all cards with `<Link href="/community">`
- Should link to specific post: `/community/[id]`
- Detail page `app/community/[id]/page.tsx` doesn't exist

**Solution Required**:
1. Fix link to use dynamic `href={`/community/${post.id}`}`
2. Create `app/community/[id]/page.tsx` detail page
3. Remove `.slice(0, 2)` limitation on responses

**Priority**: HIGH
**Estimated Time**: 1 hour

---

### 8. Sprint Creation Performance Issue ⏳

**Problem**: "Não foi possível criar o Sprint" - timeout on large sprints

**Root Cause**:
- `Promise.all` fires 10-20+ concurrent `POST /{sprint_id}/tasks`
- Exhausts database connection pool
- Causes 5xx errors and timeouts

**Solution Required**:
1. Create batch endpoint: `POST /sprints/{id}/tasks/batch`
2. Accept array of tasks in single request
3. Process in single transaction

**Files to Create/Modify**:
- `apps/api/app/schemas/sprint.py` - Add `SprintTaskBulkCreate`
- `apps/api/app/api/routes/sprints.py` - Add batch endpoint
- `apps/web-v2/src/stores/sprints.ts` - Use batch endpoint

**Priority**: HIGH
**Estimated Time**: 1.5 hours

---

### 9. SMTP Not Configured ⏳

**Problem**: Email verification fails in production

**Root Cause**:
- SMTP server not configured
- Blocks new user registration flow

**Solution Required**:
1. Configure SMTP credentials in environment
2. Add fallback for development (console log)
3. Add proper error handling

**Priority**: MEDIUM
**Estimated Time**: 30 minutes

---

### 10. Sprint Name Concatenation UX ⏳

**Problem**: Template name + user input concatenates

**Root Cause**:
- Input pre-filled with template name
- User types without clearing
- Results in: "Sprint FinanceiroMeu Teste"

**Solution Required**:
```typescript
<input
  value={sprintName}
  onChange={(e) => setSprintName(e.target.value)}
  onFocus={(e) => e.target.select()} // Select all on focus
/>
```

**Priority**: LOW
**Estimated Time**: 5 minutes

---

### 11. Dropdown Instability in Route Creation ⏳

**Problem**: "Prazo desejado" dropdown shows visual instability

**Root Cause**: Likely state management issue in custom dropdown

**Solution Required**:
- Debug dropdown component
- Ensure proper state management
- Add debouncing if needed

**Priority**: LOW
**Estimated Time**: 30 minutes

---

## 📋 Implementation Priority

### Critical (Do First)
1. ✅ Frontend React hooks error - FIXED
2. Route creation 500 error
3. Community navigation loop
4. Sprint creation performance

### High Priority (Do Next)
5. Login retry logic
6. Interview timer memory leak
7. Interview duration calculation

### Medium Priority (Do After)
8. Interview history filter
9. SMTP configuration
10. Dropdown stability

### Low Priority (Polish)
11. Sprint name UX
12. Generic error messages

---

## 🧪 Testing Checklist

After each fix:
- [ ] Test in development environment
- [ ] Verify no new errors in console
- [ ] Test edge cases
- [ ] Update documentation
- [ ] Create regression test if possible

---

## 📊 Progress Tracking

**Total Issues**: 11
**Fixed**: 1 ✅
**In Progress**: 0
**Pending**: 10 ⏳

**Estimated Total Time**: 6-8 hours
**Priority Fixes Time**: 3-4 hours

---

## 🔄 Next Steps

1. Fix route creation error (30 min)
2. Fix community navigation (1 hour)
3. Fix sprint batch endpoint (1.5 hours)
4. Add retry logic to API calls (1 hour)
5. Fix interview timer issues (45 min)

**Total for Priority Fixes**: ~4.5 hours

---

*Last Updated: March 26, 2026, 6:00 AM*
