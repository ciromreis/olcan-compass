# Website ↔ App v2.5 Bridge

This document defines the integration contract between the public website (`site-marketing-v2.5`) and the authenticated app (`app-compass-v2.5`). It is the single source of truth for what is shared and what is separate.

---

## Principle

The website and the app are **two independent deployments** but they share:
1. A design language (tokens, typography, colors)
2. A backend (api-core-v2.5)
3. Specific public-facing pages from the app

They do NOT share a codebase, node_modules, or routing.

---

## Shared Design System

Both deployments must visually match. The design source of truth is `packages/design-tokens/`.

### Color Palette
- **Olcan Navy:** Primary brand blue (`#0A1628` or similar)
- **Bone/Cream:** Background and surface accents
- **Flame:** CTA accents
- **Ink:** Text primary
- **Slate:** Text secondary

### Typography
- **Display:** DM Serif Display (headings, hero text)
- **Body:** DM Sans (UI text, body copy)

### Visual Style
- Liquid-glass aesthetic: `backdrop-filter: blur()`, translucent surfaces
- Smooth transitions, Framer Motion animations
- Glassmorphism: `bg-white/10 backdrop-blur border border-white/20`

### Implementation
When adding new components to either deployment, import design tokens from `packages/design-tokens/` rather than hard-coding values.

---

## Public Store Pages (No Login Required)

These pages exist in `app-compass-v2.5` but must be accessible without authentication. They are linked from the website.

### Intended Public Pages

| Page | App Route | Purpose | Status |
|------|-----------|---------|--------|
| Service Categories | `/store` | Browse what's available | ❌ Not built |
| Provider Preview | `/store/providers/[id]` | See mentor/lawyer profile | ❌ Not built |
| Service Detail | `/store/services/[id]` | Pricing + description | ❌ Not built |
| Waitlist | `/waitlist` | Early access signup | ✅ On website |
| Pricing | `/pricing` | Subscription tiers | ❌ Not built |

### How They Connect

The website links to app pages for deeper exploration. Example flow:
1. User lands on website → MarketplaceSection shows "coming soon" + waitlist
2. When store is built: website links → `app.olcan.com/store` (public routes, no login wall)
3. User wants to book → prompted to log in / sign up → enters authenticated app

### Authentication Boundary

```
website (no auth)  →  app public routes (no auth)  →  app authenticated routes (require login)
olcan.com          →  app.olcan.com/store            →  app.olcan.com/dashboard
```

The app must implement **two route zones**:
- Public zone: `/store/*`, `/pricing`, `/providers/*` — no auth required
- Authenticated zone: `/dashboard/*`, `/forge/*`, `/companion/*` — auth required

---

## Data Flow

```
website                           api-core-v2.5
 │                                      │
 ├── waitlist form ─────────────────► POST /waitlist
 │
 └── (future) store previews ───────► GET /store/categories (public)
                                    ► GET /store/providers (public)

app-compass-v2.5                  api-core-v2.5
 │                                      │
 ├── public store pages ────────────► GET /store/* (public)
 │
 └── authenticated routes ──────────► all protected endpoints (JWT)
```

---

## What the Website Should NOT Contain

- Companion system UI (app-only)
- Forge / document editing (app-only)
- User profile/dashboard (app-only)
- Any feature behind authentication

---

## Blog Integration (Planned)

Source: `olcan-blog-adk` (Python-based content automation)

Integration path:
1. Blog posts authored in olcan-blog-adk
2. Published to a headless CMS (Contentful, Sanity, or MDX files)
3. Consumed by website at `/blog/[slug]`
4. Website blog routes already exist as stubs in `site-marketing-v2.5`

Not yet implemented. When building, coordinate between the two repos to agree on the content schema before writing integration code.
