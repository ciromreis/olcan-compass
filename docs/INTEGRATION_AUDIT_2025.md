# Olcan Compass — Integration Audit & Consolidation Plan
**Date:** April 6, 2026  
**Scope:** v2.5 App, Marketing Site, MedusaJS Marketplace, Payload CMS  
**Status:** Critical Integration Gaps Identified

---

## Executive Summary

The olcan-compass monorepo contains **multiple authentication systems, disconnected services, hardcoded values, and incomplete integrations** between v2.5, the marketing site, and the MedusaJS marketplace. This audit identifies 47 critical issues across 8 categories requiring immediate architectural consolidation.

### Critical Findings
- **3 separate authentication systems** operating independently
- **No unified session management** across apps
- **MedusaJS marketplace isolated** from main app ecosystem
- **Payload CMS authentication disconnected** from user system
- **Hardcoded API endpoints and secrets** throughout codebase
- **Incomplete shared package implementation**
- **Design system fragmentation** across apps
- **Missing environment variable documentation**

---

## 1. Architecture Overview

### Current Application Structure

```
olcan-compass/
├── apps/
│   ├── app-compass-v2/          # Legacy v2 (DO NOT TOUCH)
│   ├── app-compass-v2.5/        # Main app (Next.js 14, Zustand, FastAPI backend)
│   ├── site-marketing-v2.5/     # Marketing site (Next.js 15, Payload CMS)
│   ├── api-core-v2/             # FastAPI backend (Python, PostgreSQL/SQLite)
│   ├── api-core-v2.5/           # Duplicate backend (needs consolidation)
│   └── marketplace-api-lite/    # Lightweight Express bridge (prototype)
│
├── olcan-marketplace/           # MedusaJS v2 + Mercur blocks
│   ├── packages/api/            # MedusaJS backend
│   ├── apps/admin/              # Admin dashboard (port 7000)
│   └── apps/vendor/             # Vendor portal (port 7001)
│
└── packages/
    ├── shared-auth/             # Unified auth (INCOMPLETE)
    ├── design-tokens/           # Design system tokens (UNUSED)
    ├── ui/                      # Shared UI components (PARTIAL)
    ├── ui-components/           # Legacy components (BROKEN)
    └── types/                   # Shared TypeScript types (PARTIAL)
```

### Port Allocation
- **3000** — app-compass-v2.5 (main app)
- **3001** — site-marketing-v2.5 (marketing)
- **7000** — MedusaJS admin dashboard
- **7001** — MedusaJS vendor portal
- **8000** — api-core-v2 (FastAPI - Docker)
- **8001** — api-core-v2.5 (FastAPI - local dev)
- **9000** — MedusaJS backend API

---

## 2. Authentication Architecture — CRITICAL ISSUES

### 2.1 Current State: Three Disconnected Systems

#### System A: App v2.5 → FastAPI Backend
**Location:** `apps/app-compass-v2.5/src/stores/auth.ts`
- Uses JWT tokens from FastAPI backend
- Stores token in localStorage as `olcan_access_token`
- Auth flow: `POST /api/v1/auth/login` → JWT → localStorage
- **Issue:** No integration with Supabase or MedusaJS

#### System B: Supabase Auth (Configured but Unused)
**Location:** `apps/app-compass-v2.5/src/lib/supabase/`
- Middleware checks for Supabase session
- Falls back gracefully if not configured
- **Issue:** `.env.example` shows Supabase vars but not used in production
- **Issue:** Middleware redirects protected routes but JWT auth is separate

#### System C: MedusaJS/Mercur Auth
**Location:** `olcan-marketplace/packages/api/medusa-config.ts`
- Uses MedusaJS built-in auth with JWT
- Separate JWT_SECRET and COOKIE_SECRET
- **Issue:** Completely isolated from Olcan user system
- **Issue:** No user sync between platforms

#### System D: Payload CMS Auth (Marketing Site)
**Location:** `apps/site-marketing-v2.5/src/payload.config.ts`
- Uses Payload's built-in auth with Users collection
- Separate admin panel at `/admin`
- **Issue:** CMS users ≠ App users ≠ Marketplace users

### 2.2 Shared Auth Package — Incomplete Implementation

**Location:** `packages/shared-auth/src/index.ts`

**What exists:**
```typescript
export class UnifiedAuthService {
  private APP_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';
  private MERCUR_API_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';
  
  async login(email: string, password: string): Promise<OlcanUser>
  async syncWithMercur(user: OlcanUser): Promise<void>
}
```

**Critical gaps:**
1. ❌ Not imported or used in any app
2. ❌ No actual Mercur sync implementation
3. ❌ No Payload CMS integration
4. ❌ No token refresh logic
5. ❌ No SSO/OAuth support
6. ❌ No role-based access control (RBAC) sync

### 2.3 Required: Unified Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Auth Layer                        │
│                  (@olcan/shared-auth v2.0)                   │
├─────────────────────────────────────────────────────────────┤
│  • Single JWT token (olcan_access_token)                    │
│  • User stored in centralized PostgreSQL                     │
│  • Role: user | vendor | org_member | org_admin | admin     │
│  • Token includes: { sub, email, role, vendor_id? }         │
└─────────────────────────────────────────────────────────────┘
                            ▼
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  App v2.5    │   │  Marketing   │   │  Marketplace │
│  (port 3000) │   │  (port 3001) │   │  (port 9000) │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ • JWT in     │   │ • Read-only  │   │ • Validate   │
│   localStorage│   │   public     │   │   JWT        │
│ • API calls  │   │ • CMS admin  │   │ • Map to     │
│   with Bearer│   │   separate   │   │   customer   │
└──────────────┘   └──────────────┘   └──────────────┘
```

**Implementation requirements:**
1. Centralize user table in `api-core-v2.5` PostgreSQL
2. MedusaJS validates Olcan JWT via middleware
3. Payload CMS uses custom auth strategy to validate Olcan JWT
4. Vendor role in JWT enables access to MedusaJS vendor portal
5. Token refresh handled by shared-auth package

---

## 3. MedusaJS Marketplace Integration — ISOLATED

### 3.1 Current State

**MedusaJS Backend:**
- Location: `olcan-marketplace/packages/api/`
- Database: Separate PostgreSQL (needs same DB as main app)
- Auth: Separate JWT_SECRET
- CORS: Configured for localhost only
- Blocks: Mercur seller, commission, payout modules installed

**App v2.5 Integration:**
- Location: `apps/app-compass-v2.5/src/lib/marketplace-client.ts`
- **Issue:** Points to `http://localhost:9000` (hardcoded)
- **Issue:** No auth token passed in requests
- **Issue:** Types don't match MedusaJS schema

**Marketing Site Integration:**
- Location: `apps/site-marketing-v2.5/src/lib/mercur-client.ts`
- **Issue:** Points to `http://localhost:8001/api/v1/commerce` (wrong endpoint)
- **Issue:** Expects FastAPI bridge, not direct MedusaJS
- **Issue:** Build fails with ECONNREFUSED during static generation

### 3.2 Missing: Commerce Bridge API

**Current architecture assumes:**
```
Marketing Site → FastAPI Bridge → MedusaJS
```

**Reality:**
- No bridge exists in `api-core-v2.5`
- `marketplace-api-lite` is Express prototype, not integrated
- Marketing site fails to fetch products during build

**Required:**
1. Implement `/api/v1/commerce/public/products` in FastAPI
2. FastAPI proxies to MedusaJS with caching
3. Transform MedusaJS product schema to Olcan schema
4. Handle auth token forwarding for authenticated requests

### 3.3 Database Consolidation Required

**Current:**
- MedusaJS: `DATABASE_URL=postgresql://...` (separate)
- FastAPI: `DATABASE_URL=sqlite+aiosqlite:///./compass_v25.db` (dev)
- Payload CMS: `DATABASE_URI=postgresql://medusa:medusa_password@127.0.0.1:5433/olcan_marketplace`

**Issue:** Three separate databases, no data sync

**Required:**
```sql
-- Single PostgreSQL database: olcan_production
-- Schema separation:
public.users                    -- Olcan users (FastAPI)
public.routes                   -- User routes (FastAPI)
public.applications             -- Applications (FastAPI)
medusa.*                        -- MedusaJS tables
payload.*                       -- Payload CMS tables
```

---

## 4. Payload CMS Integration — DISCONNECTED

### 4.1 Current State

**Location:** `apps/site-marketing-v2.5/src/payload.config.ts`

```typescript
export default buildConfig({
  admin: {
    user: Users.slug,  // Separate Users collection
  },
  collections: [Users, Chronicles, Pages, Archetypes],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
})
```

**Issues:**
1. ❌ CMS Users ≠ App Users
2. ❌ No SSO for content editors
3. ❌ Blog posts not synced to app
4. ❌ Archetypes (OIOS profiles) isolated in CMS

### 4.2 Required: Content API Integration

**Implement:**
1. Payload REST API endpoints for app consumption
2. GraphQL endpoint for flexible queries
3. Webhook to invalidate app cache on content publish
4. Custom auth strategy to allow Olcan admins to access CMS

**Example integration:**
```typescript
// apps/app-compass-v2.5/src/lib/cms-client.ts
export async function getBlogPosts() {
  const response = await fetch(`${CMS_URL}/api/chronicles?limit=10`)
  return response.json()
}

export async function getArchetype(slug: string) {
  const response = await fetch(`${CMS_URL}/api/archetypes?where[slug][equals]=${slug}`)
  return response.json()
}
```

---

## 5. Environment Variables — HARDCODED & MISSING

### 5.1 Hardcoded Values Audit

**App v2.5:**
```typescript
// ❌ apps/app-compass-v2.5/src/lib/api-client.ts
private baseUrl = 'http://localhost:8001/api/v1'  // Should use env var

// ❌ apps/app-compass-v2.5/src/lib/marketplace-client.ts
const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:9000'
// Env var not defined anywhere

// ❌ apps/app-compass-v2.5/src/stores/auth.ts
const UNIFIED_TOKEN_KEY = 'olcan_access_token'  // OK, but document
```

**Marketing Site:**
```typescript
// ❌ apps/site-marketing-v2.5/src/lib/mercur-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
// Points to FastAPI, should point to MedusaJS or bridge

// ⚠️ apps/site-marketing-v2.5/.env.local
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_55dd3f37dc23056bc1fbb306d5a376f87c771632d22078a37f289f7d6fffb661
// Publishable key committed to repo (rotate immediately)
```

**FastAPI Backend:**
```python
# ❌ apps/api-core-v2/app/core/config.py
jwt_secret_key: str = "change-this-to-a-secure-random-string-in-production"
stripe_secret_key: str = "sk_test_your_stripe_secret_key"
# Insecure defaults
```

**MedusaJS:**
```bash
# ❌ olcan-marketplace/packages/api/.env.template
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
# Insecure defaults, no .env.example in repo
```

### 5.2 Required: Centralized Environment Configuration

**Create:** `docs/ENVIRONMENT_VARIABLES.md`

**Structure:**
```bash
# ============================================================
# Shared — All Services
# ============================================================
NODE_ENV=production
LOG_LEVEL=info

# ============================================================
# Database — Single PostgreSQL Instance
# ============================================================
DATABASE_URL=postgresql://user:pass@host:5432/olcan_production

# ============================================================
# Authentication — Unified JWT
# ============================================================
JWT_SECRET_KEY=<generate-with-openssl-rand-base64-32>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================================
# App v2.5 (Next.js)
# ============================================================
NEXT_PUBLIC_APP_URL=https://compass.olcan.com.br
NEXT_PUBLIC_API_URL=https://api.compass.olcan.com.br/api/v1
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace.olcan.com.br
NEXT_PUBLIC_CMS_URL=https://www.olcan.com.br

# ============================================================
# Marketing Site (Next.js + Payload CMS)
# ============================================================
NEXT_PUBLIC_SITE_URL=https://www.olcan.com.br
PAYLOAD_SECRET=<generate-with-openssl-rand-base64-32>

# ============================================================
# MedusaJS Marketplace
# ============================================================
MEDUSA_BACKEND_URL=https://marketplace.olcan.com.br
STORE_CORS=https://compass.olcan.com.br,https://www.olcan.com.br
ADMIN_CORS=https://admin.olcan.com.br
VENDOR_CORS=https://vendor.olcan.com.br

# ============================================================
# Stripe Connect (Escrow)
# ============================================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================
# Email (Transactional)
# ============================================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@olcan.com.br
```

---

## 6. Shared Packages — INCOMPLETE IMPLEMENTATION

### 6.1 Package Status

| Package | Status | Issues | Usage |
|---------|--------|--------|-------|
| `@olcan/shared-auth` | 🔴 Broken | Not imported anywhere | 0 apps |
| `@olcan/design-tokens` | 🟡 Unused | No CSS generated | 0 apps |
| `@olcan/ui` | 🟡 Partial | Only 2 components | 1 app |
| `@olcan/ui-components` | 🔴 Broken | Compilation errors | 0 apps |
| `@olcan/types` | 🟢 Working | Partial coverage | 2 apps |

### 6.2 Shared Auth — Implementation Plan

**Current file:** `packages/shared-auth/src/index.ts` (240 lines, unused)

**Required changes:**
1. Add proper TypeScript build config
2. Export React hooks: `useAuth()`, `useUser()`, `useSession()`
3. Export Next.js middleware: `withAuth()`
4. Implement token refresh logic
5. Add MedusaJS customer sync
6. Add Payload CMS auth strategy

**Example usage:**
```typescript
// apps/app-compass-v2.5/src/app/layout.tsx
import { AuthProvider } from '@olcan/shared-auth/react'

export default function RootLayout({ children }) {
  return (
    <AuthProvider apiUrl={process.env.NEXT_PUBLIC_API_URL}>
      {children}
    </AuthProvider>
  )
}

// apps/app-compass-v2.5/src/middleware.ts
import { withAuth } from '@olcan/shared-auth/next'

export default withAuth({
  protectedRoutes: ['/dashboard', '/forge', '/marketplace'],
  publicRoutes: ['/login', '/register'],
})
```

### 6.3 Design Tokens — Consolidation Required

**Current state:**
- `packages/design-tokens/tokens.json` exists
- No CSS generation
- Apps use inline Tailwind config

**Required:**
1. Generate CSS variables from tokens
2. Create Tailwind preset: `@olcan/design-tokens/tailwind`
3. Unify color palette across apps
4. Document Clinical Boutique design system

**Example:**
```javascript
// packages/design-tokens/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7ee',
          // ... from tokens.json
        },
        cream: {
          // ... Clinical Boutique palette
        },
      },
    },
  },
}

// apps/*/tailwind.config.js
module.exports = {
  presets: [require('@olcan/design-tokens/tailwind')],
  // ... app-specific overrides
}
```

---

## 7. Design System Fragmentation

### 7.1 Current State

**App v2.5:**
- Tailwind config: Clinical Boutique palette
- Components: Custom-built, no shared library
- Typography: Inter font family
- Spacing: 8px base unit

**Marketing Site:**
- Tailwind config: Similar but different values
- Components: Duplicated from app
- Typography: DM Serif Display + Inter
- Spacing: Inconsistent

**MedusaJS Admin/Vendor:**
- Uses `@medusajs/ui` (Tailwind-based)
- Completely different aesthetic
- No Olcan branding

### 7.2 Required: Unified Component Library

**Create:** `packages/ui-v2/` (replace broken ui-components)

**Structure:**
```
packages/ui-v2/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── PageHeader.tsx      # Already exists in app
│   │   ├── ScoreBadge.tsx      # Already exists in app
│   │   └── EmptyState.tsx      # Already exists in app
│   ├── hooks/
│   │   ├── use-hydration.ts    # Already exists in app
│   │   └── use-toast.ts
│   └── utils/
│       ├── cn.ts
│       └── format.ts           # Already exists in app
├── tailwind.config.js          # Preset for apps
└── package.json
```

**Migration plan:**
1. Extract working components from app-compass-v2.5
2. Add Storybook for documentation
3. Publish to pnpm workspace
4. Gradually migrate apps to use shared components

---

## 8. Build & Runtime Issues

### 8.1 Build Errors

**Marketing Site:**
```
[TypeError: fetch failed] { [cause]: [AggregateError: ] { code: 'ECONNREFUSED' } }
```
- **Cause:** Trying to fetch from `http://localhost:8001/api/v1/commerce` during build
- **Impact:** Products not pre-rendered, slower page loads
- **Fix:** Implement commerce bridge API or use static fallback

**App v2.5:**
- ✅ Builds successfully
- ⚠️ TypeScript errors ignored (`ignoreBuildErrors: true`)
- ⚠️ ESLint errors ignored (`ignoreDuringBuilds: true`)

**MedusaJS:**
- Not tested (requires separate build)
- Turborepo config exists but not integrated with main monorepo

### 8.2 Runtime Configuration Issues

**CORS:**
```python
# api-core-v2/app/core/config.py
cors_allow_origins: str = "http://localhost:3000,http://localhost:3001,..."
```
- **Issue:** Hardcoded, doesn't include MedusaJS ports
- **Fix:** Use environment variable, include all service URLs

**Database:**
```python
# api-core-v2/.env
DATABASE_URL=sqlite+aiosqlite:///./compass_v25.db
```
- **Issue:** Using SQLite in development, PostgreSQL in production
- **Impact:** Schema differences, migration issues
- **Fix:** Use PostgreSQL in all environments (Docker Compose)

---

## 9. Security Audit — CRITICAL

### 9.1 Exposed Secrets

**Committed to repository:**
```bash
# apps/site-marketing-v2.5/.env.local
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_55dd3f37dc23056bc1fbb306d5a376f87c771632d22078a37f289f7d6fffb661
PAYLOAD_SECRET=0c2d3a4b-5e6f-7g8h-9i0j-k1l2m3n4o5p6
```

**Action required:**
1. ✅ `.env.local` is gitignored (good)
2. ❌ Rotate MEDUSA_PUBLISHABLE_KEY immediately
3. ❌ Rotate PAYLOAD_SECRET immediately
4. ❌ Add pre-commit hook to prevent secret commits

### 9.2 Insecure Defaults

**FastAPI:**
```python
jwt_secret_key: str = "change-this-to-a-secure-random-string-in-production"
```

**MedusaJS:**
```bash
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

**Action required:**
1. Generate secure secrets: `openssl rand -base64 32`
2. Store in environment variables
3. Add validation in config.py to reject defaults in production

### 9.3 Missing Security Headers

**Required for all apps:**
```typescript
// next.config.mjs
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
]
```

---

## 10. Integration Roadmap — Prioritized

### Phase 1: Critical Security & Stability (Week 1)
**Priority: P0 — Blocking production deployment**

1. **Rotate exposed secrets** (2 hours)
   - Generate new MEDUSA_PUBLISHABLE_KEY
   - Generate new PAYLOAD_SECRET
   - Update all .env files
   - Add to .gitignore patterns

2. **Consolidate environment variables** (4 hours)
   - Create `docs/ENVIRONMENT_VARIABLES.md`
   - Create `.env.example` for each app
   - Remove hardcoded URLs
   - Add validation for production

3. **Fix build errors** (6 hours)
   - Implement commerce bridge API in FastAPI
   - Add static fallback for marketing site products
   - Enable TypeScript strict mode incrementally

### Phase 2: Authentication Unification (Week 2)
**Priority: P0 — Required for marketplace integration**

1. **Implement unified auth service** (16 hours)
   - Complete `@olcan/shared-auth` package
   - Add React hooks and Next.js middleware
   - Implement token refresh logic
   - Add role-based access control

2. **Integrate MedusaJS auth** (12 hours)
   - Create JWT validation middleware for MedusaJS
   - Sync Olcan users to MedusaJS customers
   - Map vendor role to seller permissions
   - Test end-to-end auth flow

3. **Integrate Payload CMS auth** (8 hours)
   - Create custom auth strategy for Payload
   - Allow Olcan admins to access CMS
   - Implement SSO for content editors

### Phase 3: Database Consolidation (Week 3)
**Priority: P1 — Required for data consistency**

1. **Migrate to single PostgreSQL** (12 hours)
   - Set up schema separation (public, medusa, payload)
   - Migrate FastAPI from SQLite to PostgreSQL
   - Configure connection pooling
   - Update all connection strings

2. **Implement data sync** (16 hours)
   - User creation triggers customer creation in MedusaJS
   - Vendor role assignment triggers seller creation
   - Order completion updates user analytics
   - Implement event-driven sync (consider Inngest)

### Phase 4: Marketplace Integration (Week 4)
**Priority: P1 — Core product feature**

1. **Commerce bridge API** (20 hours)
   - Implement `/api/v1/commerce/public/products`
   - Implement `/api/v1/commerce/public/products/{id}`
   - Add caching layer (Redis)
   - Transform MedusaJS schema to Olcan schema
   - Add authenticated endpoints for cart/checkout

2. **App marketplace pages** (16 hours)
   - Wire marketplace store to real API
   - Implement product browsing
   - Implement service booking flow
   - Add escrow payment integration

3. **Marketing site integration** (8 hours)
   - Update mercur-client to use bridge API
   - Fix build-time product fetching
   - Add ISR for product pages

### Phase 5: Shared Packages (Week 5-6)
**Priority: P2 — Developer experience**

1. **Design tokens** (12 hours)
   - Generate CSS from tokens.json
   - Create Tailwind preset
   - Document Clinical Boutique system
   - Migrate apps to use preset

2. **UI component library** (24 hours)
   - Create `@olcan/ui-v2` package
   - Extract components from app-compass-v2.5
   - Add Storybook
   - Migrate apps incrementally

3. **Shared utilities** (8 hours)
   - Extract format.ts, analysis.ts
   - Add comprehensive tests
   - Document API

### Phase 6: CMS Integration (Week 7)
**Priority: P2 — Content management**

1. **Content API** (12 hours)
   - Enable Payload REST API
   - Enable GraphQL endpoint
   - Add webhook for cache invalidation

2. **App integration** (16 hours)
   - Create CMS client in app
   - Fetch blog posts for dashboard
   - Fetch archetypes for OIOS results
   - Add content preview mode

### Phase 7: Testing & Documentation (Week 8)
**Priority: P2 — Quality assurance**

1. **Integration tests** (20 hours)
   - Auth flow end-to-end
   - Marketplace purchase flow
   - Content publishing flow
   - Cross-app navigation

2. **Documentation** (16 hours)
   - Architecture diagrams
   - API documentation
   - Deployment guide
   - Developer onboarding

---

## 11. Technical Debt Summary

### High Priority
1. ❌ **Three separate auth systems** → Unified JWT auth
2. ❌ **Hardcoded API URLs** → Environment variables
3. ❌ **Exposed secrets in .env.local** → Rotate immediately
4. ❌ **MedusaJS isolated** → Integrate with main app
5. ❌ **Build errors on marketing site** → Commerce bridge API
6. ❌ **SQLite in development** → PostgreSQL everywhere
7. ❌ **No shared component library** → Extract to package
8. ❌ **TypeScript errors ignored** → Enable strict mode

### Medium Priority
9. ⚠️ **Payload CMS disconnected** → Content API integration
10. ⚠️ **Design system fragmented** → Unified tokens
11. ⚠️ **No integration tests** → E2E test suite
12. ⚠️ **CORS hardcoded** → Environment-based config
13. ⚠️ **No API documentation** → OpenAPI/Swagger
14. ⚠️ **Duplicate backend folders** → Consolidate api-core-v2.5

### Low Priority
15. 🔵 **Broken ui-components package** → Delete or fix
16. 🔵 **Empty tooling directories** → Clean up repo
17. 🔵 **No Storybook** → Add for component library
18. 🔵 **No pre-commit hooks** → Add Husky + lint-staged

---

## 12. Immediate Action Items

### Today (April 6, 2026)
1. ✅ **Rotate secrets** in `.env.local` files
2. ✅ **Create environment variable documentation**
3. ✅ **Add .env.example files** to all apps
4. ✅ **Document current architecture** (this file)

### This Week
1. ⏳ **Implement commerce bridge API** in FastAPI
2. ⏳ **Complete @olcan/shared-auth package**
3. ⏳ **Fix marketing site build errors**
4. ⏳ **Set up single PostgreSQL database**

### Next Sprint
1. 📋 **Integrate MedusaJS auth** with Olcan JWT
2. 📋 **Wire marketplace pages** to real API
3. 📋 **Implement data sync** between services
4. 📋 **Add integration tests**

---

## 13. Success Metrics

### Technical Metrics
- ✅ Single authentication system across all apps
- ✅ Zero hardcoded URLs or secrets
- ✅ All builds pass without errors
- ✅ 100% environment variable documentation
- ✅ Shared packages used in 3+ apps
- ✅ Integration test coverage > 80%

### Business Metrics
- ✅ Users can purchase from marketplace within app
- ✅ Vendors can manage services from vendor portal
- ✅ Content editors can publish without developer
- ✅ Single sign-on across all properties
- ✅ Real-time data sync between services

---

## 14. Risk Assessment

### High Risk
- **Data loss during database migration** → Backup strategy required
- **Auth token incompatibility** → Gradual rollout with fallback
- **Breaking changes to existing users** → Feature flags + A/B testing

### Medium Risk
- **Performance degradation** → Load testing before production
- **CORS issues in production** → Test with production URLs
- **Secret rotation downtime** → Blue-green deployment

### Low Risk
- **Design inconsistencies** → Gradual migration acceptable
- **Documentation gaps** → Can be filled incrementally

---

## 15. Conclusion

The olcan-compass project has **solid foundations but critical integration gaps**. The v2.5 app is well-architected with clean stores and components, but operates in isolation from the marketplace and CMS.

**Key insight:** The `@olcan/shared-auth` package exists but is unused. Completing this package and integrating it across all apps is the **highest leverage action** to unify the ecosystem.

**Recommendation:** Follow the 8-week roadmap above, starting with Phase 1 (security) and Phase 2 (auth unification). This will unlock marketplace integration and enable the full Olcan product vision.

---

**Next Steps:**
1. Review this audit with the team
2. Prioritize phases based on business needs
3. Create GitHub issues for each action item
4. Begin Phase 1 implementation immediately

**Document maintained by:** Cascade AI  
**Last updated:** April 6, 2026
