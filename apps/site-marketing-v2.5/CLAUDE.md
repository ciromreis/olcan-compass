# Olcan Website — `site-marketing-v2.5`

This is the **Olcan public website**. It is an independent product with its own content, routes, and deployment, not merely a marketing wrapper for the app.

---

## Status

- **Build:** ✅ Passes — `npm run build` succeeds
- **Dev server:** ✅ Runs on port 3001 — `npm run dev`
- **Routes:** 13 routes fully functional
- **Deploy-ready:** Yes — Vercel recommended
- **Fake data:** Removed. Marketplace shows "coming soon" with waitlist.

---

## Identity & Role

The website exists independently of the app. Users can:
- Discover Olcan and its services without logging in
- Browse public store pages (see bridge docs below)
- Sign up for the waitlist
- Read blog content (integration with olcan-blog-adk planned)
- Access legal pages (privacy policy, terms)

The app (`app-compass-v2.5`) is the authenticated product. The website is the public front door.

---

## Connection to v2.5 App

The website and the app share elements without being the same deployment:

### Shared Design System
Both use the same liquid-glass aesthetic, Olcan Navy Blue palette, and DM Serif / DM Sans typography. The source of truth for design tokens is `packages/design-tokens/`.

### Public Store Pages
Certain store pages from the app are accessible without login and are surfaced on the website:
- Browse service categories (no login)
- View provider profile previews (no login)
- Service pricing and description pages (no login)
- Waitlist / early access sign-up flow

These pages live in the app but are linked from the website. See `_CONTEXT/WEBSITE_V25_BRIDGE.md` at the monorepo root for the full bridge architecture.

### Blog Integration
Content created by `olcan-blog-adk` (../../../olcan-blog-adk/) is published to the website. The integration is planned, not yet implemented.

---

## Running the Website

```bash
cd apps/site-marketing-v2.5
npm run dev      # http://localhost:3001
npm run build    # verify before deploying
```

---

## Key Components

```
src/
  app/          # 13 Next.js routes
  components/
    layout/
      EnhancedNavbar.tsx    # Mobile-responsive navigation
      EnhancedFooter.tsx    # Rich footer with links
    home/
      MarketplaceSection.tsx  # "Coming Soon" with waitlist
```

---

## What NOT to Do

- Do not add fake provider profiles or invented statistics
- Do not merge this into `app-compass-v2.5/` — they are separate deployments
- Do not break the shared design token connection with the app
