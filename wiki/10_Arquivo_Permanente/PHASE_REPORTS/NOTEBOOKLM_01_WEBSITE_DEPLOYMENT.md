# Olcan Compass — Website Deployment Document
> Google NotebookLM Source · Part 1 of 4
> Last updated: April 8, 2026

---

## What This Document Covers

This document is about the **public website only**: `apps/site-marketing-v2.5/`. It covers its current state, the deployment blockers, what needs to be resolved before it can ship fully, and what refinements are still needed.

---

## What the Website Is

The Olcan public website is an independent product — not a marketing wrapper for the app. It is the public front door for Olcan Compass. Users can:

- Discover Olcan and its services without logging in
- Browse product pages (marketplace coming soon, currently showing waitlist)
- Sign up for the waitlist
- Read blog content (integration with olcan-blog-adk planned, stubs exist)
- Access legal pages (privacy policy, terms)
- View the CEO page

The app (`app-compass-v2.5`) is the authenticated product. The website links to it but is deployed separately.

**Domain:** `www.olcan.com.br`
**Current Vercel URL:** `https://site-marketing-v25.vercel.app` (outdated, 4 days old)

---

## Current Technical State

### What Works Locally
- ✅ `npm run build` succeeds — all 18 static pages generated
- ✅ Dev server runs on port 3001
- ✅ 13 core routes functional
- ✅ No fake data — marketplace shows "coming soon" with waitlist
- ✅ Security headers configured (CSP, HSTS, X-Frame-Options)
- ✅ Google Analytics (GA4) integration
- ✅ Mautic email marketing integration
- ✅ LGPD-compliant cookie banner
- ✅ Mobile-responsive navigation

### What's Live on Vercel (Outdated)
- The live deployment at `https://site-marketing-v25.vercel.app` is 4 days old
- Missing: CEO page, blog changes, marketplace updates, Payload CMS admin panel
- The code is ahead of the deployed version

### What's Blocking Full Deployment

The deployment is NOT blocked by broken code — the code builds perfectly locally. The blocker is a **Vercel build environment conflict** between:

1. **Next.js 15.5.14** (what the site uses, latest)
2. **Payload CMS 3.81.0** (expects Next.js < 15.5.0, peer dependency conflict)
3. **Monorepo structure** (pnpm workspaces — Vercel needs manual root directory config)

Eight deployment attempts have failed. The local build succeeds in 82 seconds.

---

## Website Routes (18 Pages)

```
/                        → Homepage (hero, products, blog feed, globe)
/marketplace             → Marketplace (static fallback products, waitlist)
/marketplace/[slug]      → Product detail pages
/blog                    → Blog listing (stubs exist, integration pending)
/blog/[slug]             → Individual blog post
/sobre/ceo               → CEO page (7 components: hero, timeline, methodology, etc.)
/contato                 → Contact form
/diagnostico             → Diagnostic/assessment page
/privacidade             → Privacy policy (LGPD)
/termos                  → Terms of service
/admin                   → Payload CMS admin panel (requires DB setup)
/sitemap.ts              → XML sitemap
/og                      → Open Graph image generation
```

---

## Deployment Blocker — Resolution Steps

### Option 1: Fix via Vercel Dashboard (Fastest — ~10 minutes)

This is the recommended path:

1. Go to **https://vercel.com/dashboard** → project `site-marketing-v25`
2. Go to **Settings → General**
3. Set the following:
   - **Root Directory:** `apps/site-marketing-v2.5`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --legacy-peer-deps`
   - **Output Directory:** `.next`
4. Go to **Deployments** tab → click **Redeploy** on latest commit from branch `feature/v2.5-core`

### Option 2: Downgrade Next.js to Resolve Peer Conflict

Change `next` version in `apps/site-marketing-v2.5/package.json`:
```json
"next": "^15.4.11"
```
This resolves the Payload CMS peer dependency conflict. Requires testing after downgrade.

### Option 3: Separate Payload CMS

Remove Payload CMS from the website deployment and move it to a standalone service. This makes the website lighter and removes the peer dependency issue entirely.

---

## Environment Variables Required in Vercel

### Essential (Required for Build to Succeed)
```
NEXT_PUBLIC_SITE_URL=https://www.olcan.com.br
NEXT_PUBLIC_API_URL=https://api.olcan.com.br/api/v1
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace.olcan.com.br
NEXT_PUBLIC_MEDUSA_URL=https://marketplace.olcan.com.br
EMAIL_FROM=contato@olcan.com.br
```

### Payload CMS (Required for Admin Panel at /admin)
```
PAYLOAD_SECRET=<min 32 chars, secure random string>
JWT_SECRET=<min 32 chars, secure random string>
DATABASE_URI=postgresql://user:password@host:5432/database?schema=payload
```
**Status:** These 3 variables are NOT yet set in Vercel. Without them, `/admin` returns a 500 error.

### Optional (Analytics & Marketing)
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_MAUTIC_URL=
```

---

## Database Setup for Payload CMS (Admin Panel)

The admin panel at `/admin` requires a PostgreSQL database. Recommended options:

- **Neon** (https://neon.tech) — free tier, recommended
- **Supabase** (https://supabase.com) — free tier
- **Railway** (https://railway.app) — paid, simple setup

Connection string format:
```
postgresql://user:password@host.region.neon.tech:5432/database?schema=payload
```

Note: `?schema=payload` at the end is required.

---

## What Needs Refinement After Deployment

These are items that are deployed but still incomplete or need content:

### Content Gaps
- Blog posts are stubs — no real content yet (awaiting olcan-blog-adk integration)
- Marketplace product pages use static fallback data (3 products: Cidadão do Mundo, Kit, Rota)
- CEO page is built but may need copywriting review
- `/diagnostico` page exists but its purpose and content need definition

### Technical Refinements
- Blog integration with `olcan-blog-adk` is planned but not implemented
- Public store pages from the app are not yet linked (app public routes don't exist yet)
- Payload CMS collections need real content (Archetypes, Chronicles, Pages)
- Analytics events not fully configured (GA4 setup present but conversion tracking pending)

### Design & UX Refinements
- Globe animation performance on mobile needs testing
- Marketplace "coming soon" section could be enhanced
- SEO meta tags need review per page

---

## What the Website Does NOT Do (By Design)

- No companion system UI — that's app-only
- No Forge / document editing — that's app-only
- No user profile or dashboard — requires login
- No booking or payments
- No real-time marketplace data (uses static fallbacks until app store routes are built)

---

## How the Website Connects to the App

The website and app are **two separate Vercel deployments** but share:

- Same design system (`packages/design-tokens/` — Olcan Navy, DM Serif/DM Sans, liquid-glass)
- Same backend (`api-core-v2.5`)
- Future: public store pages from the app linked from the website

Authentication boundary:
```
olcan.com (website, no auth)
  → app.olcan.com/store (app public routes, no auth) — NOT YET BUILT
    → app.olcan.com/dashboard (authenticated) — NOT YET BUILT
```

---

## Immediate Action Items for Website Shipping

| Priority | Action | Owner | Complexity |
|----------|--------|-------|-----------|
| 🔴 Critical | Fix Vercel build settings (Option 1 above) | Olcan | 10 min |
| 🔴 Critical | Add PAYLOAD_SECRET, JWT_SECRET, DATABASE_URI to Vercel | Olcan | 20 min |
| 🔴 Critical | Set up PostgreSQL database for Payload CMS | Olcan | 30 min |
| 🟡 High | Configure custom domain (www.olcan.com.br) in Vercel | Olcan | 15 min |
| 🟡 High | Create admin user in Payload CMS after deployment | Olcan | 5 min |
| 🟡 High | Add real GA4 tracking ID to environment variables | Olcan | 5 min |
| 🟢 Medium | Add real blog content via Payload CMS | Content | Days |
| 🟢 Medium | Review and finalize copywriting on all pages | Content | Days |
| 🟢 Low | Integrate olcan-blog-adk for automated blog content | Dev | Weeks |

---

## Testing Checklist After Successful Deployment

- [ ] Site loads at production URL
- [ ] Homepage: hero, products, globe animation, blog feed
- [ ] CEO page (`/sobre/ceo`): all 7 components visible
- [ ] Marketplace page: 3 fallback products display with images
- [ ] Blog listing: posts visible (even if stub content)
- [ ] Contact form submits without error
- [ ] Privacy and terms pages load
- [ ] Admin panel (`/admin`): loads after DB setup
- [ ] Security headers verified at `securityheaders.com`
- [ ] Mobile responsive design — test on phone
- [ ] No JavaScript console errors
- [ ] HTTPS enforced (no mixed content)

---

## Branch & Git State

- **Active branch:** `feature/v2.5-core`
- **Latest commit:** `77f8b11` — "fix(vercel): add .npmrc with legacy-peer-deps for Payload CMS compatibility"
- **Code is ahead of the live deployment** — 6 commits made on April 6, 2026 for deployment fixes
- All changes are isolated to `apps/site-marketing-v2.5` — v2 apps were not touched

---

## Key Files for Website Development

```
apps/site-marketing-v2.5/
├── CLAUDE.md                    ← Development rules and context
├── vercel.json                  ← Vercel deployment config (NEEDS MANUAL DASHBOARD OVERRIDE)
├── next.config.mjs              ← Security headers, Next.js config
├── .env.example                 ← All required environment variables
├── src/
│   ├── app/                     ← 18 routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── EnhancedNavbar.tsx
│   │   │   └── EnhancedFooter.tsx
│   │   ├── home/
│   │   │   └── MarketplaceSection.tsx
│   │   └── ceo/                 ← 7 CEO page components
│   ├── lib/
│   │   └── mercur-client.ts     ← Product fetching with static fallbacks
│   └── payload.config.ts        ← Payload CMS configuration
└── docs/
    ├── MARKETING_SITE_DEPLOYMENT.md   ← Full deployment guide
    └── DEPLOYMENT_STATUS_FINAL.md     ← Current blocker analysis
```
