# Quick Fix: Admin Login Issue

**Error:** "Unexpected token 'C', "Created" is not valid JSON"

**Cause:** The password reset endpoint returned a 201 status with text "Created" instead of JSON.

---

## ✅ Solution: Use Direct Login

The admin account exists and has an auth identity. Try logging in directly:

### Option 1: Direct Login (Recommended)

1. **Open:** http://localhost:7000
2. **Click "Login" (not "Create Account")**
3. **Enter:**
   - Email: `admin@olcan.com`
   - Password: Try `olcan2026` or any password you may have set

### Option 2: Clear Browser Cache

The JSON error might be cached:

1. **Open DevTools** (F12)
2. **Right-click refresh button**
3. **Select "Empty Cache and Hard Reload"**
4. **Try login again**

### Option 3: Use Incognito/Private Window

1. **Open incognito window**
2. **Go to:** http://localhost:7000
3. **Try login**

---

## 🔍 Debugging

If login still fails, check the browser console (F12 → Console) for the actual error.

The API logs show:
```
POST /auth/user/emailpass/reset-password (201) - 186.820 ms
```

This means password reset worked, but the response format caused the JSON parse error in the UI.

---

## 🆘 Alternative: Create Publishable Key via SQL

If you can't access the admin panel, create the API key directly:

```sql
-- Connect to database
psql -U ciromoraes -d olcan_marketplace

-- Create publishable API key
INSERT INTO publishable_api_key (id, created_at, updated_at, created_by, revoked_by, revoked_at)
VALUES (
  'pk_' || substr(md5(random()::text), 1, 24),
  NOW(),
  NOW(),
  NULL,
  NULL,
  NULL
)
RETURNING id;
```

Copy the returned `pk_...` key and add to website `.env.local`.

---

## 📝 Next Steps

1. Try direct login at http://localhost:7000
2. If successful, go to Settings → API Keys
3. Create publishable key
4. Add to website and restart

**The admin account exists and is ready - just need to get past this UI JSON error!**
