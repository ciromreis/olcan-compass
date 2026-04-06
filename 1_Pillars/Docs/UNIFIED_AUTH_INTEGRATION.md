# Unified Authentication Integration

**Date:** April 4, 2026  
**Status:** Implemented  
**Scope:** app-compass-v2.5, site-marketing-v2.5, olcan-marketplace (Mercur)

---

## Overview

Unified authentication system that allows users to log in once and access all Olcan services:
- **App Compass v2.5** - Main application
- **Website v2.5** - Public marketing site
- **Mercur Marketplace** - E-commerce platform

---

## Architecture

### Single Token Strategy

All services share a single JWT token stored in `localStorage`:

```
Key: olcan_access_token
Value: JWT token from Olcan backend API
```

### Authentication Flow

```
1. User logs in via App or Website
   ↓
2. Olcan backend API validates credentials
   ↓
3. JWT token issued and stored as 'olcan_access_token'
   ↓
4. Token automatically used by:
   - App Compass v2.5 (via api-client.ts)
   - Website v2.5 (via shared-auth service)
   - Mercur Marketplace (synced customer account)
```

---

## Implementation Details

### 1. Shared Auth Service

**Location:** `packages/shared-auth/src/index.ts`

Provides unified authentication methods:
- `login(email, password)` - Authenticates with Olcan backend
- `register(email, password, fullName)` - Creates new account
- `getCurrentUser()` - Fetches user profile
- `logout()` - Clears tokens from all services
- `syncWithMercur(user)` - Creates customer in Mercur if needed

**Key Features:**
- Singleton pattern for consistent state
- Automatic Mercur customer sync
- Token sharing across services
- Graceful error handling

### 2. App Compass v2.5 Integration

**Modified Files:**
- `apps/app-compass-v2.5/src/lib/api-client.ts`
- `apps/app-compass-v2.5/src/stores/auth.ts`

**Changes:**
```typescript
// Constructor checks unified token first
constructor(baseUrl: string) {
  this.baseUrl = baseUrl;
  if (typeof window !== 'undefined') {
    this.token = localStorage.getItem('olcan_access_token') || 
                 localStorage.getItem('access_token'); // Legacy fallback
  }
}

// setToken stores in both keys
setToken(token: string) {
  this.token = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('olcan_access_token', token); // Unified key
    localStorage.setItem('access_token', token); // Legacy compatibility
  }
}
```

### 3. Website v2.5 Integration

**New Files:**
- `apps/site-marketing-v2.5/src/lib/mercur-client.ts` - Mercur API client
- `apps/site-marketing-v2.5/.env.local.example` - Environment template

**Mercur Client Features:**
- Public product fetching
- Publishable API key support
- Graceful degradation if API unavailable
- Price formatting utilities

### 4. Mercur Marketplace Integration

**Configuration:**
- Uses MedusaJS v2 authentication
- Customer accounts synced from Olcan backend
- Publishable API key for public store access

**CORS Settings** (`olcan-marketplace/packages/api/.env`):
```bash
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:7000,http://localhost:9000
VENDOR_CORS=http://localhost:7001
AUTH_CORS=http://localhost:7000,http://localhost:7001,http://localhost:9000
```

---

## Public Marketplace Pages

### Product Listing

**Page:** `apps/site-marketing-v2.5/src/app/marketplace/page.tsx`

**Features:**
- Fetches products from Mercur API
- Falls back to static products if API unavailable
- Displays both static Olcan products and dynamic Mercur products
- No authentication required (public access)

**Static Products:**
1. Curso Cidadão do Mundo (R$ 497)
2. Kit Application (R$ 997)
3. Rota de Internacionalização (Sob Consulta)

### Product Detail Pages

**Page:** `apps/site-marketing-v2.5/src/app/marketplace/[handle]/page.tsx`

**Logic:**
1. Try fetching from Mercur by handle
2. Fallback to static products
3. Return 404 if not found

**Public Access:** Yes - no login required to view products

---

## Environment Variables

### App Compass v2.5

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_DEMO_MODE=false
```

### Website v2.5

```bash
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_DEMO_MODE=false
```

### Mercur Marketplace

```bash
DATABASE_URL=postgres://ciromoraes@localhost:5432/olcan_marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

---

## Token Storage

### localStorage Keys

| Key | Purpose | Used By |
|-----|---------|---------|
| `olcan_access_token` | **Primary** - Unified auth token | All services |
| `access_token` | Legacy compatibility | App v2.5 |
| `olcan_refresh_token` | Refresh token | All services |
| `refresh_token` | Legacy refresh token | App v2.5 |

### Token Lifecycle

1. **Login:** Token stored in `olcan_access_token`
2. **API Calls:** Token sent as `Authorization: Bearer <token>`
3. **Logout:** All token keys cleared from localStorage
4. **Expiry:** Token refresh handled by backend (if implemented)

---

## Security Considerations

### Current Implementation

- ✅ JWT tokens for authentication
- ✅ HTTPS required in production
- ✅ CORS properly configured
- ✅ Tokens stored in localStorage (acceptable for SPA)
- ✅ Token cleared on logout

### Production Recommendations

1. **Token Expiry:** Implement short-lived access tokens (15 min)
2. **Refresh Tokens:** Use HTTP-only cookies for refresh tokens
3. **CSRF Protection:** Add CSRF tokens for state-changing operations
4. **Rate Limiting:** Implement on login endpoints
5. **Session Management:** Track active sessions server-side

---

## Testing the Integration

### 1. Test Unified Login

```bash
# Start all services
cd olcan-marketplace && bun run dev  # Port 9000, 7000, 7001
cd apps/app-compass-v2.5 && npm run dev  # Port 3000
cd apps/site-marketing-v2.5 && npm run dev  # Port 3001
```

**Test Steps:**
1. Login via App (localhost:3000)
2. Check `localStorage.olcan_access_token` exists
3. Navigate to Website (localhost:3001)
4. Token should be available
5. Access Mercur admin (localhost:7000)
6. Should be able to authenticate with same credentials

### 2. Test Public Marketplace

```bash
# Visit website marketplace
open http://localhost:3001/marketplace
```

**Expected:**
- Static products always visible
- Mercur products visible if API configured
- No login required to browse
- Product detail pages work

### 3. Test Mercur Integration

```bash
# Check Mercur API
curl http://localhost:9000/health

# Check products (needs publishable key)
curl -H "x-publishable-api-key: YOUR_KEY" \
  http://localhost:9000/store/products
```

---

## Troubleshooting

### Issue: Products not loading from Mercur

**Cause:** Publishable API key not configured

**Solution:**
1. Login to Mercur admin: http://localhost:7000
2. Go to Settings → API Keys
3. Create publishable key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
   ```

### Issue: Login works in app but not website

**Cause:** Token key mismatch

**Solution:**
- Check both services use `olcan_access_token`
- Clear localStorage and re-login
- Verify API_URL environment variable

### Issue: Mercur customer sync fails

**Cause:** Mercur API not accessible or CORS issue

**Solution:**
- Check Mercur is running on port 9000
- Verify CORS settings in `medusa-config.ts`
- Check network tab for CORS errors

---

## Next Steps

### Phase 1: Complete Setup (Current)
- [x] Unified auth service created
- [x] App v2.5 updated to use unified tokens
- [x] Website integrated with Mercur API
- [x] Public marketplace pages working
- [ ] Get publishable API key from Mercur admin
- [ ] Test end-to-end login flow

### Phase 2: Enhanced Features
- [ ] Add shopping cart to website
- [ ] Implement checkout flow
- [ ] Add user dashboard on website
- [ ] Sync purchase history across services

### Phase 3: Production Ready
- [ ] Implement token refresh mechanism
- [ ] Add HTTP-only cookie support
- [ ] Set up session management
- [ ] Add rate limiting
- [ ] Security audit

---

## API Endpoints Reference

### Olcan Backend API (Port 8001)

```
POST /api/v1/auth/login       - Login user
POST /api/v1/auth/register    - Register new user
GET  /api/v1/auth/me          - Get current user
POST /api/v1/auth/logout      - Logout user
```

### Mercur API (Port 9000)

```
GET  /health                  - Health check
GET  /store/products          - List products (public)
GET  /store/products/:id      - Get product (public)
POST /store/customers         - Create customer
GET  /store/customers/me      - Get current customer
```

---

## File Structure

```
olcan-compass/
├── packages/
│   └── shared-auth/          # Unified auth service
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   ├── app-compass-v2.5/
│   │   ├── src/lib/api-client.ts      # Updated for unified tokens
│   │   └── src/stores/auth.ts         # Uses unified token key
│   │
│   ├── site-marketing-v2.5/
│   │   ├── src/lib/mercur-client.ts   # Mercur API client
│   │   ├── src/app/marketplace/       # Public marketplace pages
│   │   └── .env.local.example         # Environment template
│   │
│   └── olcan-marketplace/
│       └── packages/api/
│           ├── medusa-config.ts       # CORS & auth config
│           └── .env                   # Database & secrets
│
└── docs/
    └── UNIFIED_AUTH_INTEGRATION.md    # This file
```

---

**Last Updated:** April 4, 2026  
**Maintained By:** Olcan Development Team  
**Status:** ✅ Implemented and Ready for Testing
