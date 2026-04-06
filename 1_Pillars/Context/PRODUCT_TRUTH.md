# What Olcan Compass Is — Honest Product State

This document is the definitive, no-inflation status of the product. Read this before estimating work or claiming features are ready.

---

## What the Product Is

Olcan Compass is a career support platform for immigrants and professionals navigating new markets. Its full vision includes:

- **Career companions** — RPG-style virtual companions tied to 12 OIOS archetypes, with evolution stages, quests, guilds, and gamification
- **Narrative Forge** — AI-powered document polishing for CVs, personal statements, essays
- **Interview Simulator** — Voice-based AI interview practice
- **Marketplace** — Connects users with verified mentors, immigration lawyers, and translators
- **Online store** — Subscription tiers (freemium + premium) and pay-per-use features

---

## What Actually Exists (April 2026)

### Fully Working
- ✅ User authentication (registration, login, JWT)
- ✅ Basic companion CRUD (create, view, feed/train/play/rest activities)
- ✅ Public website (13 routes, build passes, no fake data)
- ✅ Backend v2.5 API (functional, routes registered)

### Partially Built (Scaffolded But Not Functional)
- ⚠️ Companion evolution logic (backend partial, frontend basic UI only)
- ⚠️ Design system (Tailwind config, some glass components — not complete)
- ⚠️ OIOS archetype data model (enum defined, no quiz or logic)
- ⚠️ Forge components (~13 UI components built, but app won't compile due to ui-components blocker)

### Not Built Yet
- ❌ Gamification (quests, achievements, leaderboards, battles, guilds)
- ❌ Narrative Forge (no backend endpoints, no AI integration)
- ❌ Interview Simulator (no audio, no AI, no endpoints)
- ❌ Marketplace (no provider profiles, no booking, no Stripe)
- ❌ Online store / subscriptions (no payment processing, no usage limits)
- ❌ Social features (no guilds, no messaging, no friend system)

### Revenue Status
**Zero revenue-generating features are implemented.** The path to first revenue requires at minimum: a subscription paywall, or marketplace booking + Stripe Connect, or a single pay-per-use AI feature with billing.

---

## The Compile Blocker

`app-compass-v2.5` and `app-compass-v2` both fail to build because they depend on `@olcan/ui-components`, which has 16 TypeScript errors and an invalid dist/ folder.

The website (`site-marketing-v2.5`) does NOT depend on this package and works fine.

**Recommended next step for the app:** Execute Option B — replace ~30 import statements from `@olcan/ui-components` to `@/components/ui`. Estimated time: ~2 hours. See `OPCAO_B_STATUS.md` for exact instructions.

---

## Realistic Timelines

| Goal | Estimated Time |
|------|---------------|
| Fix compile blocker (Option B) | ~2 hours |
| Deploy website + backend v2.5 | ~0 hours (ready now) |
| Core companion experience (visual evolution, achievements) | 4–6 weeks |
| First revenue feature (subscription or pay-per-use) | 2–3 weeks after blocker fixed |
| Full v2.5 vision | 4–6 months of focused development |

---

## What to Focus On Next

The most impactful sequence:

1. **Deploy the website and backend** — works now, zero risk
2. **Fix the compile blocker** (Option B) — unlocks all app development
3. **Build one complete revenue feature** — pick Narrative Forge + simple paywall, or a subscription tier
4. **Iterate toward full marketplace** — after first revenue proof

Do not attempt to build everything simultaneously. The architecture supports incremental delivery.
