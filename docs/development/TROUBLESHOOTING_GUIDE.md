# 🔧 Troubleshooting Guide - Olcan Compass v2.5

**Last Updated**: March 26, 2026, 4:00 AM

---

## 🚨 Common Issues & Solutions

### Backend Issues

#### Issue 1: Backend won't start
**Error**: `Address already in use` or port conflict

**Solution**:
```bash
# Check what's using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
# (Remember to update frontend .env.local)
```

---

#### Issue 2: Database errors on startup
**Error**: `Foreign key constraint failed` or table errors

**Solution**:
```bash
# Delete database and restart (recreates tables)
cd apps/api-core-v2
rm compass_v25.db
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

#### Issue 3: Import errors
**Error**: `ModuleNotFoundError: No module named 'aiosqlite'`

**Solution**:
```bash
cd apps/api-core-v2
pip install aiosqlite
# Or install all requirements
pip install -r requirements.txt
```

---

### Frontend Issues

#### Issue 4: Frontend won't start
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

---

#### Issue 5: Network errors / Can't connect to backend
**Error**: `Failed to fetch` or `Network Error`

**Checklist**:
1. Backend running? → `curl http://localhost:8001/health`
2. Correct API URL? → Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8001`
3. CORS configured? → Backend should allow `http://localhost:3000`
4. Restart frontend after .env changes

**Solution**:
```bash
# Verify backend
curl http://localhost:8001/health

# Check .env.local
cat apps/app-compass-v2/.env.local

# Restart frontend (Ctrl+C then)
npm run dev
```

---

#### Issue 6: Environment variables not loading
**Error**: API calls go to wrong URL

**Solution**:
```bash
# .env.local changes require restart
# Stop frontend (Ctrl+C)
# Start again
npm run dev

# Verify in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

### Authentication Issues

#### Issue 7: "Could not validate credentials"
**Error**: 401 Unauthorized on protected endpoints

**Possible Causes**:
- Token expired (30 min)
- Token not sent
- Token format wrong
- User doesn't exist

**Solution**:
```javascript
// Browser console - check token
localStorage.getItem('access_token')

// If null or expired, login again
// Or clear and re-login
localStorage.clear()
// Then login from UI
```

---

#### Issue 8: Login fails with valid credentials
**Error**: "Erro ao fazer login"

**Debug Steps**:
```bash
# Test backend directly
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!"

# Check response
# If 200 OK → Frontend issue
# If 401 → Wrong credentials
# If 500 → Backend error (check logs)
```

---

#### Issue 9: "Username already registered"
**Error**: Can't register with email

**Cause**: Username auto-generated from email already exists

**Solution**:
- Use different email
- Or manually delete user from database:
```bash
sqlite3 apps/api-core-v2/compass_v25.db
DELETE FROM users WHERE email='user@example.com';
.quit
```

---

### Companion Issues

#### Issue 10: Companion not appearing after creation
**Error**: Created but not in list

**Debug Steps**:
```javascript
// Browser console
// Check if API call succeeded
// Network tab → Check response

// Check store state
// React DevTools → Stores

// Try refreshing page
location.reload()

// Or fetch companions manually
// (if you have access to store)
companionStore.fetchCompanions()
```

---

#### Issue 11: Stats not updating after feed/train
**Error**: Energy/XP doesn't change

**Possible Causes**:
- API call failed
- Store not updating
- UI not re-rendering

**Debug Steps**:
```javascript
// Check network tab for API response
// Should see POST to /companions/{id}/feed or /train

// Check response body
// Should have updated energy/xp

// Check console for errors

// Try refreshing page
```

---

#### Issue 12: "Not enough energy to train"
**Error**: Can't train companion

**Cause**: Companion has < 10 energy

**Solution**:
```javascript
// Feed companion first to restore energy
// Each feed gives +20 energy (max 100)

// Or check current energy
// Should be displayed in UI
```

---

### Data Persistence Issues

#### Issue 13: Data lost after refresh
**Error**: User logged out or companions gone

**Possible Causes**:
- localStorage cleared
- Token expired
- Store not persisting

**Debug Steps**:
```javascript
// Check localStorage
localStorage.getItem('access_token')
localStorage.getItem('olcan-auth')
localStorage.getItem('companion-store')

// If null, data was cleared
// Login again to restore
```

---

#### Issue 14: Database data lost
**Error**: All users/companions gone

**Cause**: Database file deleted or corrupted

**Solution**:
```bash
# Check if database exists
ls -lh apps/api-core-v2/compass_v25.db

# If missing, it was deleted
# Restart backend to recreate
# But data is lost - need to re-register
```

---

### UI Issues

#### Issue 15: Loading spinner never stops
**Error**: UI stuck in loading state

**Possible Causes**:
- API call hanging
- Error not caught
- Loading state not reset

**Solution**:
```javascript
// Check network tab
// Is request still pending?

// Check console for errors

// Force refresh
location.reload()

// Check backend logs
// Is backend responding?
```

---

#### Issue 16: Error messages not displaying
**Error**: Errors happen but no message shown

**Cause**: Error display not implemented in UI

**Temporary Solution**:
```javascript
// Check browser console for errors
// Errors are logged even if not displayed

// Check store.error
// Error message is stored there
```

---

### CORS Issues

#### Issue 17: CORS errors in browser
**Error**: `Access-Control-Allow-Origin` error

**Solution**:
```bash
# Check backend .env has correct origins
cat apps/api-core-v2/.env
# Should have: CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart backend after changes
```

---

### Token Issues

#### Issue 18: Token expires too quickly
**Error**: Logged out after 30 minutes

**Cause**: Access token has 30 min expiry

**Temporary Solution**:
- Login again when expired
- Refresh token not implemented yet

**Future Solution**:
- Implement refresh token flow
- Auto-refresh before expiry

---

## 🔍 Debugging Tools

### Browser DevTools

**Console Tab**:
```javascript
// Check errors
// Check logs
// Run debug commands

// Useful commands
localStorage.getItem('access_token')
localStorage.clear()
location.reload()
```

**Network Tab**:
- View all API requests
- Check request/response
- Check status codes
- Check headers (Authorization)

**Application Tab**:
- View localStorage
- View cookies
- Clear storage

---

### Backend Logs

**View Logs**:
- Backend logs appear in terminal where uvicorn is running
- Shows SQL queries
- Shows request logs
- Shows errors

**Useful Info**:
- Request method and path
- Response status code
- SQL queries executed
- Error tracebacks

---

### Database Inspection

**SQLite Browser** (if installed):
```bash
sqlite3 apps/api-core-v2/compass_v25.db

# List tables
.tables

# View users
SELECT * FROM users;

# View companions
SELECT * FROM companions;

# Exit
.quit
```

---

## 🚑 Emergency Fixes

### Nuclear Option: Reset Everything
```bash
# Stop both servers (Ctrl+C in both terminals)

# Delete database
rm apps/api-core-v2/compass_v25.db

# Clear frontend localStorage
# In browser console:
localStorage.clear()

# Restart backend
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Restart frontend
cd apps/app-compass-v2
npm run dev

# Refresh browser
# Register new account
# Start fresh
```

---

### Reset Just Frontend
```bash
# Stop frontend (Ctrl+C)

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Restart
npm run dev

# Clear browser cache and localStorage
# Ctrl+Shift+R (hard refresh)
localStorage.clear()
```

---

### Reset Just Backend
```bash
# Stop backend (Ctrl+C)

# Delete database
rm compass_v25.db

# Reinstall dependencies
pip install -r requirements.txt

# Restart
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📞 Getting Help

### Check Documentation
1. `SESSION_FINAL_SUMMARY.md` - Overview
2. `TEST_INTEGRATION.md` - Testing guide
3. `API_ENDPOINTS_TESTED.md` - API reference
4. `FRONTEND_INTEGRATION_COMPLETE.md` - Integration details

### Debug Checklist
- [ ] Backend running? (`curl http://localhost:8001/health`)
- [ ] Frontend running? (Browser opens to localhost:3000)
- [ ] .env.local correct? (API_URL=http://localhost:8001)
- [ ] Token present? (`localStorage.getItem('access_token')`)
- [ ] Console errors? (F12 → Console tab)
- [ ] Network errors? (F12 → Network tab)
- [ ] Backend logs? (Terminal where uvicorn runs)

### Quick Health Check
```bash
# Backend
curl http://localhost:8001/health
# Should return: {"status":"healthy","version":"2.5.0"}

# Frontend
curl http://localhost:3000
# Should return HTML

# Database
ls -lh apps/api-core-v2/compass_v25.db
# Should show file with size > 0
```

---

## 💡 Prevention Tips

### Best Practices
1. **Always check backend is running** before testing frontend
2. **Clear localStorage** when switching between test users
3. **Check console** for errors before reporting issues
4. **Restart servers** after .env changes
5. **Keep terminal logs visible** to see errors immediately

### Development Workflow
1. Start backend first
2. Wait for "Application startup complete"
3. Start frontend
4. Wait for "Ready in Xs"
5. Open browser
6. Check console for errors
7. Test features
8. Check logs if issues

---

**Remember**: Most issues are simple fixes - check the basics first! 🔧
