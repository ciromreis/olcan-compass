# Immediate Actions Required — Olcan Compass Integration

**Date:** April 6, 2026  
**Priority:** Critical  
**Estimated Time:** 4-8 hours

---

## ✅ Completed Today

### 1. Comprehensive Integration Audit
- **Created:** `docs/INTEGRATION_AUDIT_2025.md`
- **Identified:** 47 critical issues across 8 categories
- **Documented:** 3 separate authentication systems
- **Mapped:** Complete architecture of v2.5, marketing site, and MedusaJS

### 2. Environment Variable Documentation
- **Created:** `docs/ENVIRONMENT_VARIABLES.md`
- **Documented:** All required variables for each service
- **Included:** Security best practices and secret generation commands
- **Added:** Migration guide from current state to unified config

### 3. Security Fixes
- **Updated:** `apps/app-compass-v2.5/.env.example` with complete variable set
- **Sanitized:** `apps/site-marketing-v2.5/.env.local` (replaced exposed secrets with placeholders)
- **Added:** Environment variable validation warnings in code

### 4. Code Quality Improvements
- **Removed:** Hardcoded URLs from `api-client.ts`
- **Removed:** Hardcoded URLs from `marketplace-client.ts`
- **Added:** Development logging for configuration validation
- **Verified:** Commerce bridge API exists in FastAPI

---

## 🔴 Critical Actions — Do Today

### 1. Rotate Exposed Secrets (30 minutes)

**Why:** Secrets were found in `.env.local` file (though gitignored, they should be rotated as best practice)

**Actions:**
```bash
# Generate new secrets
NEW_MEDUSA_KEY=$(openssl rand -base64 32)
NEW_PAYLOAD_SECRET=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Update apps/site-marketing-v2.5/.env.local
# Replace pk_REPLACE_WITH_ACTUAL_KEY with actual MedusaJS publishable key
# Replace REPLACE_WITH_SECURE_SECRET with $NEW_PAYLOAD_SECRET

# Update olcan-marketplace/packages/api/.env
# Ensure JWT_SECRET matches FastAPI JWT_SECRET_KEY
```

### 2. Create Missing .env Files (15 minutes)

**Missing files:**
- `apps/api-core-v2.5/.env.example`
- `olcan-marketplace/packages/api/.env.example`

**Actions:**
```bash
# Copy templates
cp apps/api-core-v2.5/.env apps/api-core-v2.5/.env.example
cp olcan-marketplace/packages/api/.env olcan-marketplace/packages/api/.env.example

# Replace real values with placeholders
# Commit .env.example files to repository
```

### 3. Verify Commerce Bridge Service (30 minutes)

**File:** `apps/api-core-v2.5/app/services/commerce_bridge.py`

**Check:**
- Service implementation exists and is complete
- Returns proper product schema matching marketing site expectations
- Handles errors gracefully (returns empty array on failure)
- Includes static fallback data for build time

**Test:**
```bash
# Start FastAPI backend
cd apps/api-core-v2.5
python -m uvicorn app.main:app --reload --port 8001

# Test endpoint
curl http://localhost:8001/api/v1/commerce/public/products?limit=10
```

### 4. Fix Marketing Site Build (1 hour)

**Issue:** Build fails with ECONNREFUSED when fetching products

**Solution A: Static Fallback**
```typescript
// apps/site-marketing-v2.5/src/lib/mercur-client.ts
export async function getMercurProducts(options?: { limit?: number }): Promise<StorefrontProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/public/products?${query.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return STATIC_FALLBACK_PRODUCTS; // Add static data
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching commerce bridge products:', error);
    return STATIC_FALLBACK_PRODUCTS; // Graceful degradation
  }
}
```

**Solution B: ISR Instead of SSG**
```typescript
// apps/site-marketing-v2.5/app/marketplace/page.tsx
export const revalidate = 60; // Enable ISR instead of SSG
```

---

## 🟡 High Priority — This Week

### 5. Complete Shared Auth Package (4 hours)

**File:** `packages/shared-auth/src/index.ts`

**Required:**
1. Add TypeScript build configuration
2. Create React hooks:
   ```typescript
   export function useAuth()
   export function useUser()
   export function useSession()
   ```
3. Create Next.js middleware:
   ```typescript
   export function withAuth(config)
   ```
4. Implement token refresh logic
5. Add MedusaJS customer sync
6. Add Payload CMS auth strategy

**Test:**
```bash
cd packages/shared-auth
pnpm build
pnpm test
```

### 6. Database Consolidation (4 hours)

**Current state:**
- FastAPI: SQLite (development)
- MedusaJS: Separate PostgreSQL
- Payload CMS: Separate PostgreSQL

**Target state:**
- Single PostgreSQL database
- Schema separation: `public.*`, `medusa.*`, `payload.*`

**Actions:**
```bash
# 1. Set up PostgreSQL locally
docker run -d \
  --name olcan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=olcan_dev \
  -p 5432:5432 \
  postgres:15

# 2. Update all DATABASE_URL variables
# 3. Run migrations for each service
# 4. Test connections
```

### 7. Add Security Headers (30 minutes)

**Files to update:**
- `apps/app-compass-v2.5/next.config.mjs`
- `apps/site-marketing-v2.5/next.config.mjs`

**Add:**
```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // ... rest of config
};
```

### 8. Update .gitignore Patterns (15 minutes)

**Add to root `.gitignore`:**
```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# Secrets
*.pem
*.key
*.crt
service-account*.json

# MCP API keys
.mcp.json

# IDE secrets
.vscode/settings.json
```

---

## 🔵 Medium Priority — Next Sprint

### 9. Implement Unified Auth Flow (2 days)

**Phase 2 from audit document:**
1. Complete `@olcan/shared-auth` package
2. Integrate MedusaJS auth with JWT validation
3. Integrate Payload CMS auth with custom strategy
4. Test end-to-end auth flow

### 10. Wire Marketplace Pages (2 days)

**Pages to connect:**
- `apps/app-compass-v2.5/src/app/marketplace/page.tsx`
- `apps/app-compass-v2.5/src/app/marketplace/[id]/page.tsx`
- `apps/app-compass-v2.5/src/app/marketplace/bookings/page.tsx`

**Connect to:**
- Real MedusaJS API via commerce bridge
- Marketplace store with actual data
- Booking flow with escrow integration

### 11. CMS Content Integration (1 day)

**Implement:**
1. Payload REST API client in app
2. Fetch blog posts for dashboard
3. Fetch archetypes for OIOS results
4. Add content preview mode

---

## 📋 Verification Checklist

Before considering integration complete, verify:

### Environment Variables
- [ ] All apps have `.env.example` files
- [ ] No hardcoded URLs in codebase
- [ ] All secrets rotated from defaults
- [ ] Environment variable documentation complete
- [ ] Validation added for production config

### Authentication
- [ ] Single JWT token works across all apps
- [ ] Token stored in localStorage as `olcan_access_token`
- [ ] MedusaJS validates Olcan JWT
- [ ] Payload CMS accepts Olcan JWT for admins
- [ ] Token refresh works automatically

### Database
- [ ] Single PostgreSQL instance running
- [ ] All services connected to same database
- [ ] Schema separation configured
- [ ] Migrations run successfully
- [ ] Connection pooling configured

### Commerce Integration
- [ ] Commerce bridge API returns products
- [ ] Marketing site builds without errors
- [ ] App marketplace pages show real data
- [ ] Booking flow works end-to-end
- [ ] Escrow integration functional

### Security
- [ ] All secrets rotated
- [ ] Security headers added
- [ ] CORS configured correctly
- [ ] .gitignore patterns updated
- [ ] Pre-commit hooks added (optional)

### Build & Deploy
- [ ] App v2.5 builds successfully
- [ ] Marketing site builds successfully
- [ ] MedusaJS builds successfully
- [ ] FastAPI starts without errors
- [ ] All services run concurrently

---

## 🚀 Quick Start Commands

### Start All Services

```bash
# Terminal 1: PostgreSQL
docker start olcan-postgres

# Terminal 2: Redis
docker run -d --name olcan-redis -p 6379:6379 redis:7

# Terminal 3: FastAPI Backend
cd apps/api-core-v2.5
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 4: MedusaJS Backend
cd olcan-marketplace/packages/api
bun run dev

# Terminal 5: App v2.5
cd apps/app-compass-v2.5
pnpm dev

# Terminal 6: Marketing Site
cd apps/site-marketing-v2.5
pnpm dev --port 3001
```

### Run Tests

```bash
# App v2.5
cd apps/app-compass-v2.5
pnpm test

# FastAPI
cd apps/api-core-v2.5
pytest

# Shared Auth
cd packages/shared-auth
pnpm test
```

### Build for Production

```bash
# Build all apps
pnpm build:v2.5
pnpm build:site

# Check for errors
pnpm lint:v2.5
pnpm lint:site
```

---

## 📞 Support & Resources

### Documentation
- **Integration Audit:** `docs/INTEGRATION_AUDIT_2025.md`
- **Environment Variables:** `docs/ENVIRONMENT_VARIABLES.md`
- **V2 Migration Plan:** `docs/planning/V2_MIGRATION_PLAN.md`
- **Marketplace Canon:** `docs/v2.5/MARKETPLACE_CANON.md`

### External Resources
- **MedusaJS Docs:** https://docs.medusajs.com
- **Mercur Docs:** https://docs.mercurjs.com
- **Payload CMS Docs:** https://payloadcms.com/docs
- **Next.js Docs:** https://nextjs.org/docs

### Key Files
- **Shared Auth:** `packages/shared-auth/src/index.ts`
- **Commerce Bridge:** `apps/api-core-v2.5/app/api/routes/commerce.py`
- **Marketplace Client:** `apps/app-compass-v2.5/src/lib/marketplace-client.ts`
- **CMS Client:** `apps/site-marketing-v2.5/src/lib/mercur-client.ts`

---

## 🎯 Success Criteria

**Week 1 Complete When:**
- ✅ All secrets rotated
- ✅ Environment variables documented
- ✅ Commerce bridge API working
- ✅ Marketing site builds successfully
- ✅ No hardcoded URLs in codebase

**Week 2 Complete When:**
- ✅ Unified auth working across all apps
- ✅ Single PostgreSQL database
- ✅ MedusaJS integrated with app
- ✅ Security headers added
- ✅ All builds passing

**Week 4 Complete When:**
- ✅ Marketplace pages fully functional
- ✅ CMS content integrated
- ✅ Shared packages in use
- ✅ Integration tests passing
- ✅ Ready for staging deployment

---

**Last Updated:** April 6, 2026  
**Next Review:** April 7, 2026  
**Owner:** Olcan Engineering Team
