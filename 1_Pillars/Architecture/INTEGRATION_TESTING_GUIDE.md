# 🧪 Integration Testing Guide - Olcan Compass v2.5

**Date**: March 30, 2026  
**Purpose**: Step-by-step testing guide for companion system integration  
**Status**: Ready for Testing

---

## 🎯 TESTING OBJECTIVES

1. Verify companion system works end-to-end
2. Confirm all navigation links function correctly
3. Test backend API integration
4. Validate Portuguese consistency
5. Check performance and UX

---

## 🚀 PRE-TESTING SETUP

### 1. Start Backend API
```bash
cd apps/api-core-v2
uvicorn app.main:app --reload --port 8001
```

**Verify**: Backend running at http://localhost:8001

### 2. Start Frontend
```bash
cd apps/app-compass-v2
npm run dev
```

**Verify**: Frontend running at http://localhost:3000

### 3. Check Demo Mode
**File**: `src/middleware.ts` and `src/app/(app)/layout.tsx`  
**Verify**: `DEMO_MODE = true` for testing without login

---

## 📋 TEST SCENARIOS

### Test Suite 1: Navigation & Routing

#### Test 1.1: Sidebar Navigation
**Steps**:
1. Open http://localhost:3000/dashboard
2. Look at left sidebar
3. Find "Companion" with Heart icon

**Expected**:
- ✅ "Companion" appears in "Base" section
- ✅ Heart icon visible
- ✅ Label in Portuguese

**Pass Criteria**: Companion visible in navigation

---

#### Test 1.2: Navigate to Companion
**Steps**:
1. Click "Companion" in sidebar
2. Wait for page load

**Expected**:
- ✅ URL changes to `/companion`
- ✅ Page loads without errors
- ✅ Companion visual appears
- ✅ All text in Portuguese

**Pass Criteria**: Companion page loads successfully

---

#### Test 1.3: Achievements Link
**Steps**:
1. On companion page, click "Conquistas" button
2. Wait for redirect

**Expected**:
- ✅ Redirects to `/aura/achievements`
- ✅ Achievements page loads
- ✅ No 404 error

**Pass Criteria**: Achievements accessible

---

#### Test 1.4: Quests Link
**Steps**:
1. On companion page, click "Missões" button
2. Wait for redirect

**Expected**:
- ✅ Redirects to `/aura/quests`
- ✅ Quests page loads
- ✅ No 404 error

**Pass Criteria**: Quests accessible

---

### Test Suite 2: Dashboard Integration

#### Test 2.1: Companion Card Visibility
**Steps**:
1. Go to http://localhost:3000/dashboard
2. Scroll down to find companion status card

**Expected**:
- ✅ Companion card appears after lifecycle cards
- ✅ Shows companion name
- ✅ Shows level and evolution stage
- ✅ Shows energy and health bars
- ✅ Shows XP progress

**Pass Criteria**: Companion card visible and complete

---

#### Test 2.2: Companion Card Click
**Steps**:
1. Click anywhere on companion status card
2. Wait for navigation

**Expected**:
- ✅ Navigates to `/aura` or `/companion`
- ✅ Page loads successfully
- ✅ No errors in console

**Pass Criteria**: Card click navigates correctly

---

#### Test 2.3: Care Alert
**Steps**:
1. If companion energy < 30%, check for alert
2. Look for warning message

**Expected**:
- ✅ "Aura Dissonante" alert shows if energy low
- ✅ Alert has amber styling
- ✅ Alert pulses/animates

**Pass Criteria**: Low energy alert works

---

### Test Suite 3: Companion Creation (Onboarding)

#### Test 3.1: Access Onboarding
**Steps**:
1. Go to http://localhost:3000/companion/discover
2. Wait for page load

**Expected**:
- ✅ Onboarding page loads
- ✅ Shows welcome message
- ✅ Shows name input field
- ✅ All text in Portuguese

**Pass Criteria**: Onboarding page accessible

---

#### Test 3.2: Enter Name
**Steps**:
1. Type companion name (e.g., "Atlas")
2. Click "Próximo" button

**Expected**:
- ✅ Name input accepts text
- ✅ Button enables when name entered
- ✅ Advances to archetype selection
- ✅ Shows 12 archetype options

**Pass Criteria**: Name step works

---

#### Test 3.3: Select Archetype
**Steps**:
1. Click one archetype card
2. Verify selection highlights
3. Click "Criar Companion" button

**Expected**:
- ✅ Selected archetype highlights
- ✅ Create button enables
- ✅ Shows loading state
- ✅ Redirects to `/companion` after creation

**Pass Criteria**: Archetype selection and creation works

---

#### Test 3.4: Verify Creation
**Steps**:
1. After redirect, check companion page
2. Verify companion appears with chosen name and archetype

**Expected**:
- ✅ Companion name matches input
- ✅ Archetype matches selection
- ✅ Level = 1
- ✅ Energy = 100
- ✅ Stats initialized

**Pass Criteria**: Companion created successfully

---

### Test Suite 4: Care Activities

#### Test 4.1: Nutrir (Feed)
**Steps**:
1. Note current energy and XP
2. Click "Nutrir" button
3. Wait for response

**Expected**:
- ✅ Energy decreases by 5
- ✅ XP increases by 10
- ✅ Button shows loading state
- ✅ Success feedback appears

**Pass Criteria**: Feed activity works

---

#### Test 4.2: Treinar (Train)
**Steps**:
1. Note current energy and XP
2. Click "Treinar" button
3. Wait for response

**Expected**:
- ✅ Energy decreases by 15
- ✅ XP increases by 20
- ✅ Stats may increase
- ✅ Success feedback appears

**Pass Criteria**: Train activity works

---

#### Test 4.3: Interagir (Play)
**Steps**:
1. Note current energy and XP
2. Click "Interagir" button
3. Wait for response

**Expected**:
- ✅ Energy decreases by 8
- ✅ XP increases by 8
- ✅ Happiness may increase
- ✅ Success feedback appears

**Pass Criteria**: Play activity works

---

#### Test 4.4: Descansar (Rest)
**Steps**:
1. Note current energy
2. Click "Descansar" button
3. Wait for response

**Expected**:
- ✅ Energy increases (recovery)
- ✅ XP increases by 5
- ✅ No energy cost
- ✅ Success feedback appears

**Pass Criteria**: Rest activity works

---

#### Test 4.5: Insufficient Energy
**Steps**:
1. Reduce energy to < 15
2. Try to click "Treinar" (costs 15)

**Expected**:
- ✅ Button appears disabled
- ✅ Button has reduced opacity
- ✅ Click does nothing
- ✅ No error thrown

**Pass Criteria**: Energy validation works

---

### Test Suite 5: Leveling & Evolution

#### Test 5.1: XP Progress
**Steps**:
1. Perform multiple care activities
2. Watch XP bar fill

**Expected**:
- ✅ XP bar animates smoothly
- ✅ Shows current/next level XP
- ✅ Percentage updates correctly

**Pass Criteria**: XP tracking works

---

#### Test 5.2: Level Up
**Steps**:
1. Gain enough XP to level up
2. Watch for level up feedback

**Expected**:
- ✅ Level increases
- ✅ XP resets to 0
- ✅ XP to next level increases
- ✅ Celebration animation appears
- ✅ Stats may increase

**Pass Criteria**: Level up works

---

#### Test 5.3: Evolution Check
**Steps**:
1. Look for "Evolution Check" component
2. Check evolution requirements

**Expected**:
- ✅ Shows current evolution stage
- ✅ Shows next stage requirements
- ✅ Shows progress toward evolution
- ✅ Button to evolve when ready

**Pass Criteria**: Evolution tracking works

---

### Test Suite 6: Portuguese Consistency

#### Test 6.1: Companion Page
**Steps**:
1. Review all text on `/companion`
2. Check buttons, labels, descriptions

**Expected**:
- ✅ No English terms
- ✅ All buttons in Portuguese
- ✅ All labels in Portuguese
- ✅ All descriptions in Portuguese

**Pass Criteria**: 100% Portuguese

---

#### Test 6.2: Dashboard
**Steps**:
1. Review companion card text
2. Check all labels and descriptions

**Expected**:
- ✅ "Energia" not "Energy"
- ✅ "Sincronia" or "Experiência" not "XP"
- ✅ "Nível" not "Level"
- ⚠️ "Aura Dissonante" acceptable (metamodern branding)

**Pass Criteria**: Portuguese with intentional branding terms

---

#### Test 6.3: Navigation
**Steps**:
1. Check all navigation labels
2. Verify companion-related items

**Expected**:
- ✅ "Companion" label
- ✅ "Conquistas" not "Achievements"
- ✅ "Missões" not "Quests"

**Pass Criteria**: All navigation in Portuguese

---

### Test Suite 7: Performance

#### Test 7.1: Page Load Time
**Steps**:
1. Open DevTools Network tab
2. Navigate to `/companion`
3. Measure load time

**Expected**:
- ✅ Initial load < 3 seconds
- ✅ No blocking resources
- ✅ Images load progressively

**Pass Criteria**: Acceptable performance

---

#### Test 7.2: Animation Performance
**Steps**:
1. Perform care activities
2. Watch animations
3. Check for jank or stuttering

**Expected**:
- ✅ Smooth 60fps animations
- ✅ No layout shifts
- ✅ No visual glitches

**Pass Criteria**: Smooth animations

---

#### Test 7.3: Bundle Size
**Steps**:
1. Run `npm run build`
2. Check bundle sizes

**Expected**:
- ✅ Companion page < 200KB
- ✅ Dashboard < 100KB
- ✅ Reasonable code splitting

**Pass Criteria**: Acceptable bundle sizes

---

### Test Suite 8: Error Handling

#### Test 8.1: Backend Down
**Steps**:
1. Stop backend API
2. Try to perform care activity
3. Check error handling

**Expected**:
- ✅ User-friendly error message
- ✅ No crash or white screen
- ✅ Retry option available

**Pass Criteria**: Graceful error handling

---

#### Test 8.2: Network Error
**Steps**:
1. Throttle network to "Slow 3G"
2. Try to load companion page
3. Check loading states

**Expected**:
- ✅ Loading indicator shows
- ✅ Page eventually loads
- ✅ No timeout errors

**Pass Criteria**: Handles slow network

---

#### Test 8.3: Invalid Data
**Steps**:
1. Mock API to return invalid data
2. Check error boundaries

**Expected**:
- ✅ Error boundary catches error
- ✅ Fallback UI shows
- ✅ No console errors

**Pass Criteria**: Error boundaries work

---

## 📊 TEST RESULTS TEMPLATE

### Test Session: [Date/Time]
**Tester**: [Name]  
**Environment**: [Dev/Staging/Production]  
**Browser**: [Chrome/Firefox/Safari]

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Sidebar Navigation | ⬜ | |
| 1.2 | Navigate to Companion | ⬜ | |
| 1.3 | Achievements Link | ⬜ | |
| 1.4 | Quests Link | ⬜ | |
| 2.1 | Companion Card Visibility | ⬜ | |
| 2.2 | Companion Card Click | ⬜ | |
| 2.3 | Care Alert | ⬜ | |
| 3.1 | Access Onboarding | ⬜ | |
| 3.2 | Enter Name | ⬜ | |
| 3.3 | Select Archetype | ⬜ | |
| 3.4 | Verify Creation | ⬜ | |
| 4.1 | Nutrir (Feed) | ⬜ | |
| 4.2 | Treinar (Train) | ⬜ | |
| 4.3 | Interagir (Play) | ⬜ | |
| 4.4 | Descansar (Rest) | ⬜ | |
| 4.5 | Insufficient Energy | ⬜ | |
| 5.1 | XP Progress | ⬜ | |
| 5.2 | Level Up | ⬜ | |
| 5.3 | Evolution Check | ⬜ | |
| 6.1 | Companion Page Portuguese | ⬜ | |
| 6.2 | Dashboard Portuguese | ⬜ | |
| 6.3 | Navigation Portuguese | ⬜ | |
| 7.1 | Page Load Time | ⬜ | |
| 7.2 | Animation Performance | ⬜ | |
| 7.3 | Bundle Size | ⬜ | |
| 8.1 | Backend Down | ⬜ | |
| 8.2 | Network Error | ⬜ | |
| 8.3 | Invalid Data | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Warning | ⬜ Not Tested

---

## 🐛 BUG REPORT TEMPLATE

### Bug #[Number]
**Severity**: [Critical/High/Medium/Low]  
**Test**: [Test ID and Name]  
**Browser**: [Browser/Version]

**Description**:
[What happened]

**Expected**:
[What should happen]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Screenshots**:
[Attach if relevant]

**Console Errors**:
```
[Paste console errors]
```

**Impact**:
[How this affects users]

---

## ✅ SIGN-OFF CRITERIA

### Minimum for Staging
- [ ] All navigation tests pass
- [ ] Companion creation works
- [ ] At least 2 care activities work
- [ ] No critical bugs
- [ ] Portuguese consistency verified

### Minimum for Production
- [ ] All tests pass (100%)
- [ ] No high/critical bugs
- [ ] Performance acceptable
- [ ] Error handling verified
- [ ] Cross-browser tested

---

## 🎯 PRIORITY TESTS

If time is limited, test these first:

1. **Critical Path** (Must Work):
   - Navigation to companion
   - Companion creation
   - One care activity
   - Dashboard integration

2. **High Priority** (Should Work):
   - All care activities
   - Achievements/quests links
   - Portuguese consistency
   - Basic error handling

3. **Medium Priority** (Nice to Have):
   - Level up
   - Evolution
   - Performance
   - Advanced error handling

---

## 📝 NOTES

### Known Issues
- Aura page uses metamodern terminology (intentional)
- Multiple companion stores exist (documented)
- Backend integration not yet tested

### Testing Tips
1. Test in incognito mode to avoid cache issues
2. Check browser console for errors
3. Test on both desktop and mobile
4. Try different browsers
5. Document everything

---

**Status**: Ready for Testing  
**Next**: Execute test suite and document results  
**Blocker**: None - all tests can be run now
