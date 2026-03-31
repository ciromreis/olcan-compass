# 🧪 Integration Testing Guide

**Date**: March 26, 2026, 3:45 AM  
**Status**: Ready for Testing

---

## ✅ Pre-Test Checklist

### Backend Server
- ✅ Running on `http://localhost:8001`
- ✅ Health endpoint responding
- ✅ Database connected
- ✅ All endpoints tested via curl

### Frontend Server
- ✅ Running on `http://localhost:3000`
- ✅ Environment configured (`NEXT_PUBLIC_API_URL=http://localhost:8001`)
- ✅ Stores integrated with API client
- ✅ Loading states added
- ✅ Error handling added

---

## 🎯 Test Scenarios

### Test 1: User Registration Flow

**Steps**:
1. Open browser: `http://localhost:3000`
2. Navigate to registration page
3. Fill in form:
   - Email: `testuser@example.com`
   - Password: `Test123!`
   - Full Name: `Test User`
4. Click "Register" button

**Expected Results**:
- ✅ Loading spinner shows during registration
- ✅ No errors displayed
- ✅ User is automatically logged in
- ✅ Redirected to dashboard/home
- ✅ User name displayed in UI
- ✅ Token stored in localStorage

**Verification**:
```javascript
// Open browser console (F12)
localStorage.getItem('access_token') // Should return JWT token
```

---

### Test 2: User Login Flow

**Steps**:
1. Logout if logged in
2. Navigate to login page
3. Fill in form:
   - Email/Username: `testuser@example.com`
   - Password: `Test123!`
4. Click "Login" button

**Expected Results**:
- ✅ Loading spinner shows during login
- ✅ No errors displayed
- ✅ User is logged in
- ✅ Redirected to dashboard/home
- ✅ User data displayed
- ✅ Token stored in localStorage

**Verification**:
```javascript
// Browser console
localStorage.getItem('access_token') // Should return JWT token
```

---

### Test 3: Companion Creation Flow

**Steps**:
1. Ensure you're logged in
2. Navigate to companion creation page
3. Fill in form:
   - Name: `Sparky`
   - Type: `fox` (or select from dropdown)
4. Click "Create Companion" button

**Expected Results**:
- ✅ Loading spinner shows during creation
- ✅ No errors displayed
- ✅ Companion appears in list
- ✅ Companion stats displayed correctly:
   - Level: 1
   - XP: 0
   - Energy: 100
   - Evolution Stage: egg

**Verification**:
```javascript
// Browser console
// Check companion store state
```

---

### Test 4: Feed Companion Flow

**Steps**:
1. Ensure you have a companion created
2. Navigate to companion detail page
3. Note current energy and XP
4. Click "Feed" button

**Expected Results**:
- ✅ Loading spinner shows briefly
- ✅ No errors displayed
- ✅ Energy increases (up to max 100)
- ✅ XP increases by 10
- ✅ UI updates immediately
- ✅ Success message shown (if implemented)

**Verification**:
```javascript
// Check companion stats in UI
// Energy should increase by 20 (max 100)
// XP should increase by 10
```

---

### Test 5: Train Companion Flow

**Steps**:
1. Ensure companion has at least 10 energy
2. Note current energy, XP, and level
3. Click "Train" button

**Expected Results**:
- ✅ Loading spinner shows briefly
- ✅ No errors displayed
- ✅ Energy decreases by 10
- ✅ XP increases by 50
- ✅ Level up occurs if XP threshold reached
- ✅ UI updates immediately

**Verification**:
```javascript
// Check companion stats in UI
// Energy should decrease by 10
// XP should increase by 50
// Level may increase if XP >= XP to next
```

---

### Test 6: Error Handling - Invalid Login

**Steps**:
1. Navigate to login page
2. Enter invalid credentials:
   - Email: `wrong@example.com`
   - Password: `WrongPass123!`
3. Click "Login" button

**Expected Results**:
- ✅ Loading spinner shows
- ✅ Error message displayed
- ✅ User remains on login page
- ✅ No token stored
- ✅ Error is user-friendly

---

### Test 7: Error Handling - Duplicate Registration

**Steps**:
1. Navigate to registration page
2. Try to register with existing email:
   - Email: `testuser@example.com`
   - Password: `Test123!`
   - Full Name: `Test User`
3. Click "Register" button

**Expected Results**:
- ✅ Loading spinner shows
- ✅ Error message displayed: "Username already registered"
- ✅ User remains on registration page
- ✅ No token stored

---

### Test 8: Error Handling - Train Without Energy

**Steps**:
1. Create a companion
2. Train it multiple times until energy < 10
3. Try to train again

**Expected Results**:
- ✅ Error message displayed
- ✅ Button disabled or error shown
- ✅ Companion stats unchanged

---

### Test 9: Token Persistence

**Steps**:
1. Login successfully
2. Close browser tab
3. Open new tab to `http://localhost:3000`

**Expected Results**:
- ✅ User still logged in
- ✅ User data displayed
- ✅ No need to login again

---

### Test 10: Logout Flow

**Steps**:
1. Ensure you're logged in
2. Click "Logout" button

**Expected Results**:
- ✅ User logged out
- ✅ Redirected to login page
- ✅ Token removed from localStorage
- ✅ User data cleared from store

**Verification**:
```javascript
// Browser console
localStorage.getItem('access_token') // Should return null
```

---

## 🐛 Common Issues & Solutions

### Issue: "Network Error" or "Failed to fetch"

**Possible Causes**:
- Backend not running
- Wrong API URL in `.env.local`
- CORS not configured

**Solutions**:
```bash
# Check backend is running
curl http://localhost:8001/health

# Check .env.local has correct URL
cat apps/app-compass-v2/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8001

# Restart frontend after .env changes
# Ctrl+C in frontend terminal, then npm run dev
```

---

### Issue: "Could not validate credentials"

**Possible Causes**:
- Token expired (30 min expiry)
- Token not sent with request
- Token format incorrect

**Solutions**:
```javascript
// Check token exists
localStorage.getItem('access_token')

// If expired, logout and login again
// Or clear localStorage and login
localStorage.clear()
```

---

### Issue: Companion not appearing after creation

**Possible Causes**:
- API call failed silently
- Store not updating
- UI not re-rendering

**Solutions**:
```javascript
// Check browser console for errors
// Check network tab for API response
// Try refreshing the page
// Check companion store state
```

---

### Issue: Loading spinner never stops

**Possible Causes**:
- API call hanging
- Error not caught
- Loading state not reset

**Solutions**:
```javascript
// Check browser console for errors
// Check network tab for request status
// Refresh page
// Check backend logs
```

---

## 📊 Test Results Template

### Test Session: [Date/Time]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | User Registration | ⏳ | |
| 2 | User Login | ⏳ | |
| 3 | Companion Creation | ⏳ | |
| 4 | Feed Companion | ⏳ | |
| 5 | Train Companion | ⏳ | |
| 6 | Invalid Login Error | ⏳ | |
| 7 | Duplicate Registration Error | ⏳ | |
| 8 | Train Without Energy Error | ⏳ | |
| 9 | Token Persistence | ⏳ | |
| 10 | Logout Flow | ⏳ | |

**Legend**: ✅ Pass | ❌ Fail | ⏳ Not Tested | ⚠️ Partial

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend logs show in terminal where uvicorn is running
# Look for:
# - SQL queries
# - Request logs
# - Error messages
```

### Check Frontend Console
```javascript
// Open browser DevTools (F12)
// Console tab shows:
// - JavaScript errors
// - API call logs
// - Store state changes
```

### Check Network Tab
```
// Browser DevTools → Network tab
// Shows:
// - API requests
// - Response status codes
// - Request/response bodies
// - Request headers (including Authorization)
```

### Check localStorage
```javascript
// Browser console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
localStorage.getItem('olcan-auth') // Zustand persisted state
localStorage.getItem('companion-store') // Zustand persisted state
```

### Check Store State
```javascript
// In React DevTools or console
// Auth store state
// Companion store state
```

---

## 🚀 Quick Test Script

**Run this in browser console after each major action**:

```javascript
// Check authentication
console.log('Token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');

// Check stores (if you have React DevTools)
// Or add console.log in store actions

// Quick API test
fetch('http://localhost:8001/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(d => console.log('User:', d))
.catch(e => console.error('Error:', e));
```

---

## ✅ Success Criteria

### Minimum Viable Test
- ✅ Can register new user
- ✅ Can login with credentials
- ✅ Can create companion
- ✅ Can feed companion
- ✅ Can train companion
- ✅ Stats update correctly
- ✅ Can logout

### Full Test
- ✅ All 10 test scenarios pass
- ✅ No console errors
- ✅ Loading states show
- ✅ Error messages display
- ✅ Data persists after refresh
- ✅ Token management works
- ✅ UI updates immediately

---

## 📝 Next Steps After Testing

### If All Tests Pass ✅
1. Document any UI/UX improvements needed
2. Add visual polish (animations, transitions)
3. Add success toast notifications
4. Add loading skeletons
5. Improve error messages
6. Add form validation
7. Test edge cases
8. Add automated tests

### If Tests Fail ❌
1. Note which tests failed
2. Check error messages in console
3. Check network tab for API responses
4. Check backend logs
5. Fix issues one at a time
6. Re-test after each fix
7. Document solutions

---

## 🎯 Testing Priorities

### High Priority (Must Work)
1. ✅ User registration
2. ✅ User login
3. ✅ Companion creation
4. ✅ Feed companion
5. ✅ Train companion

### Medium Priority (Should Work)
6. ✅ Error handling
7. ✅ Token persistence
8. ✅ Logout
9. ✅ Loading states

### Low Priority (Nice to Have)
10. ✅ Success messages
11. ✅ Animations
12. ✅ Form validation
13. ✅ Edge cases

---

**Ready to test!** Open `http://localhost:3000` and start with Test 1. 🚀
