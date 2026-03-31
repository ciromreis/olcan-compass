# 🚀 Quick Start Guide - Next Development Session

**Last Session**: March 25, 2026, 10:45 PM  
**Current Status**: Backend 100% functional, ready for frontend integration  
**Next Focus**: Connect frontend to real API

---

## ⚡ 5-Minute Quick Start

### 1. Start Backend (30 seconds)
```bash
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Verify Backend (30 seconds)
```bash
# Health check
curl http://localhost:8001/health
# Should return: {"status":"healthy","version":"2.5.0"}

# View API docs
open http://localhost:8001/docs
```

### 3. Test Authentication (1 minute)
```bash
# Register
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","username":"devuser","password":"Dev123!","full_name":"Dev User"}'

# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=devuser&password=Dev123!" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Test protected endpoint
curl http://localhost:8001/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
```

### 4. Test Companions (1 minute)
```bash
# Create companion
curl -X POST "http://localhost:8001/api/v1/companions/?name=TestBuddy&companion_type=fox" \
  -H "Authorization: Bearer $TOKEN"

# List companions
curl http://localhost:8001/api/v1/companions/ -H "Authorization: Bearer $TOKEN"

# Feed companion
curl -X POST http://localhost:8001/api/v1/companions/1/feed \
  -H "Authorization: Bearer $TOKEN"
```

✅ **If all above work, backend is ready!**

---

## 🎯 Next Tasks (Priority Order)

### Task 1: Update Auth Store (30-45 min)
**File**: `apps/app-compass-v2/src/stores/authStore.ts` (or similar)

**What to do**:
```typescript
import { apiClient } from '@/lib/api-client';

// Replace mock register function
async register(email: string, username: string, password: string) {
  try {
    const user = await apiClient.register({
      email,
      username,
      password,
      full_name: username
    });
    // Update store state with user
    this.user = user;
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Replace mock login function
async login(username: string, password: string) {
  try {
    const tokens = await apiClient.login({ username, password });
    // Token is automatically stored by apiClient
    const user = await apiClient.getCurrentUser();
    this.user = user;
    this.isAuthenticated = true;
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Replace mock logout function
async logout() {
  try {
    await apiClient.logout();
    this.user = null;
    this.isAuthenticated = false;
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

**Test**: Try logging in from the UI

---

### Task 2: Update Companion Store (45-60 min)
**File**: `apps/app-compass-v2/src/stores/companionStore.ts` (or similar)

**What to do**:
```typescript
import { apiClient } from '@/lib/api-client';

// Replace mock fetch companions
async fetchCompanions() {
  try {
    const companions = await apiClient.getCompanions();
    this.companions = companions;
    return companions;
  } catch (error) {
    console.error('Failed to fetch companions:', error);
    throw error;
  }
}

// Replace mock create companion
async createCompanion(name: string, type: string) {
  try {
    const companion = await apiClient.createCompanion({
      name,
      companion_type: type
    });
    this.companions.push(companion);
    return companion;
  } catch (error) {
    console.error('Failed to create companion:', error);
    throw error;
  }
}

// Replace mock feed companion
async feedCompanion(id: number) {
  try {
    const result = await apiClient.feedCompanion(id);
    // Update companion in store
    const companion = this.companions.find(c => c.id === id);
    if (companion) {
      companion.energy = result.energy;
      companion.xp = result.xp;
    }
    return result;
  } catch (error) {
    console.error('Failed to feed companion:', error);
    throw error;
  }
}

// Replace mock train companion
async trainCompanion(id: number) {
  try {
    const result = await apiClient.trainCompanion(id);
    // Update companion in store
    const companion = this.companions.find(c => c.id === id);
    if (companion) {
      companion.level = result.level;
      companion.xp = result.xp;
      companion.energy = result.energy;
    }
    return result;
  } catch (error) {
    console.error('Failed to train companion:', error);
    throw error;
  }
}
```

**Test**: Create a companion from the UI, then feed/train it

---

### Task 3: Add Loading States (30 min)

**What to do**:
```typescript
// In your store
isLoading = false;
error = null;

async login(username: string, password: string) {
  this.isLoading = true;
  this.error = null;
  try {
    const tokens = await apiClient.login({ username, password });
    const user = await apiClient.getCurrentUser();
    this.user = user;
    this.isAuthenticated = true;
    return user;
  } catch (error) {
    this.error = error.message;
    throw error;
  } finally {
    this.isLoading = false;
  }
}
```

**In your component**:
```tsx
{authStore.isLoading && <LoadingSpinner />}
{authStore.error && <ErrorMessage message={authStore.error} />}
<button disabled={authStore.isLoading}>
  {authStore.isLoading ? 'Logging in...' : 'Login'}
</button>
```

---

### Task 4: Add Error Handling (30 min)

**What to do**:
```typescript
// Create error handler utility
export function handleApiError(error: any) {
  if (error.message.includes('401')) {
    return 'Invalid credentials. Please try again.';
  }
  if (error.message.includes('400')) {
    return error.message; // Usually has good error message
  }
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred.';
}

// Use in components
try {
  await authStore.login(username, password);
} catch (error) {
  const message = handleApiError(error);
  toast.error(message); // or however you show errors
}
```

---

### Task 5: Test Everything (1 hour)

**Test Checklist**:
```
Authentication Flow:
□ Register new user from UI
□ Login with credentials from UI
□ See user info displayed
□ Logout works
□ Protected routes redirect to login
□ Invalid credentials show error
□ Duplicate username shows error

Companion Flow:
□ Create companion from UI
□ See companion in list
□ View companion details
□ Feed companion (energy increases, XP increases)
□ Train companion (energy decreases, XP increases)
□ Level up works when XP threshold reached
□ Error shown when training without energy
□ Companion list updates after actions

Edge Cases:
□ Network error handling
□ Invalid inputs
□ Token expiration
□ Concurrent requests
```

---

## 📁 Key Files Reference

### Backend
- **Main App**: `apps/api-core-v2/app/main.py`
- **Auth Service**: `apps/api-core-v2/app/services/auth_service.py`
- **Auth Endpoints**: `apps/api-core-v2/app/api/v1/auth.py`
- **Companion Endpoints**: `apps/api-core-v2/app/api/v1/companions.py`
- **Database**: `apps/api-core-v2/compass_v25.db`
- **Environment**: `apps/api-core-v2/.env`

### Frontend
- **API Client**: `apps/app-compass-v2/src/lib/api-client.ts` ✅ READY
- **Auth Store**: `apps/app-compass-v2/src/stores/authStore.ts` ⏳ NEEDS UPDATE
- **Companion Store**: `apps/app-compass-v2/src/stores/companionStore.ts` ⏳ NEEDS UPDATE

### Documentation
- **API Endpoints**: `API_ENDPOINTS_TESTED.md` - All endpoints with examples
- **Working Status**: `BACKEND_WORKING_STATUS.md` - What's working
- **Complete Summary**: `DEVELOPMENT_COMPLETE_SUMMARY.md` - Full session summary
- **This Guide**: `QUICK_START_NEXT_SESSION.md`

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
```bash
# Check if port is in use
lsof -i :8001

# Kill existing process
pkill -f "uvicorn app.main:app"

# Start fresh
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Issue: Database errors
```bash
# Reset database
cd apps/api-core-v2
rm compass_v25.db
# Restart server (tables will be recreated)
```

### Issue: Token validation fails
```typescript
// Clear tokens and login again
localStorage.clear();
// Then login from UI
```

### Issue: CORS errors
```bash
# Check .env file has correct origins
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart backend after changing .env
```

---

## 📊 Current Status

### ✅ Complete
- Backend server running
- Database connected
- Authentication working
- Companion system working
- API client created
- All endpoints tested

### 🔄 In Progress
- Frontend store integration
- UI component updates

### ⏳ Not Started
- Error handling in UI
- Loading states in UI
- End-to-end testing
- Production deployment

---

## 🎯 Success Criteria for Next Session

By end of next session, you should have:
- ✅ Users can register from UI
- ✅ Users can login from UI
- ✅ Users can create companions from UI
- ✅ Users can feed/train companions from UI
- ✅ Loading states show during API calls
- ✅ Errors display to users
- ✅ All data persists in database

**Estimated Time**: 3-5 hours

---

## 💡 Pro Tips

1. **Test Backend First**: Always verify backend is working before debugging frontend
2. **Use API Docs**: http://localhost:8001/docs is your friend
3. **Check Console**: Browser console shows API errors
4. **Check Network Tab**: See actual API requests/responses
5. **Clear Storage**: When in doubt, clear localStorage and cookies
6. **Read Errors**: Error messages usually tell you exactly what's wrong

---

## 🚀 Let's Go!

You have everything you need:
- ✅ Working backend
- ✅ Complete API client
- ✅ Clear next steps
- ✅ Test examples
- ✅ Troubleshooting guide

**Just follow the tasks in order and you'll have a working app in a few hours!**

Good luck! 🎉

---

*P.S. If you get stuck, check the documentation files or the API docs at http://localhost:8001/docs*
