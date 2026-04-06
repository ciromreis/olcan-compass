# 🚀 Daily Development Reference - Quick Start

**Last Updated**: March 26, 2026, 4:00 AM

---

## ⚡ Quick Start (30 seconds)

```bash
# Terminal 1 - Backend
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2 - Frontend  
cd apps/app-compass-v2
npm run dev

# Browser
open http://localhost:3000
```

---

## ✅ Health Check (10 seconds)

```bash
# Backend alive?
curl http://localhost:8001/health

# Frontend alive?
curl http://localhost:3000

# Database exists?
ls apps/api-core-v2/compass_v25.db
```

---

## 🔑 Quick Test Flow (2 minutes)

1. **Register**: `http://localhost:3000` → Register page
2. **Login**: Use credentials you just created
3. **Create Companion**: Name it, pick type
4. **Feed**: Click feed button → Energy +20, XP +10
5. **Train**: Click train button → Energy -10, XP +50

---

## 📊 Current Status

**Backend**: ✅ 95% Complete
- All core endpoints working
- Database persisting data
- Authentication functional

**Frontend**: ✅ 75% Complete  
- Stores integrated with API
- UI components ready
- Needs testing and polish

**Integration**: ✅ 85% Complete
- Data flows working
- Token management working
- Needs UI testing

---

## 🎯 Today's Priorities

### If Testing
1. Test registration flow
2. Test login flow
3. Test companion creation
4. Test feed/train
5. Report any issues

### If Developing
1. Add loading spinners to UI
2. Add error toast messages
3. Add success notifications
4. Improve form validation
5. Test edge cases

---

## 📁 Key Files

**Backend**:
- Main: `apps/api-core-v2/app/main.py`
- Auth: `apps/api-core-v2/app/api/v1/auth.py`
- Companions: `apps/api-core-v2/app/api/v1/companions.py`

**Frontend**:
- API Client: `apps/app-compass-v2/src/lib/api-client.ts`
- Auth Store: `apps/app-compass-v2/src/stores/auth.ts`
- Companion Store: `apps/app-compass-v2/src/stores/companionStore.ts`

**Config**:
- Backend: `apps/api-core-v2/.env`
- Frontend: `apps/app-compass-v2/.env.local`

---

## 🔧 Common Commands

**Reset Database**:
```bash
rm apps/api-core-v2/compass_v25.db
# Restart backend
```

**Clear Frontend Cache**:
```javascript
// Browser console
localStorage.clear()
location.reload()
```

**View API Docs**:
```
http://localhost:8001/docs
```

**Check Logs**:
- Backend: Terminal where uvicorn runs
- Frontend: Browser console (F12)

---

## 🐛 Quick Fixes

**Backend won't start**:
```bash
lsof -i :8001
kill -9 <PID>
```

**Frontend won't start**:
```bash
lsof -i :3000
kill -9 <PID>
```

**Can't connect to backend**:
```bash
# Check .env.local
cat apps/app-compass-v2/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Token expired**:
```javascript
localStorage.clear()
// Login again
```

---

## 📚 Documentation

1. `SESSION_FINAL_SUMMARY.md` - Complete overview
2. `TEST_INTEGRATION.md` - Testing scenarios
3. `TROUBLESHOOTING_GUIDE.md` - Common issues
4. `API_ENDPOINTS_TESTED.md` - API reference
5. `FRONTEND_INTEGRATION_COMPLETE.md` - Integration guide

---

## 🎯 Next Milestones

- [ ] Complete UI testing
- [ ] Add visual feedback (loading/errors)
- [ ] Test all edge cases
- [ ] Add remaining features
- [ ] Prepare for production

---

## 💡 Remember

- Backend must run before frontend
- Check console for errors first
- Restart after .env changes
- Clear localStorage between tests
- Database resets lose all data

---

**Current Focus**: UI Testing & Polish  
**Estimated Time to MVP**: 1-2 weeks  
**Overall Progress**: 75% Complete

---

*Keep this file open while developing!* 📌
