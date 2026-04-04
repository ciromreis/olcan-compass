## Canonical Stores – v2.5

**Goal:** give agents and developers a single, reliable surface for shared state in the v2.5 app so we avoid duplicate “spines” and conflicting behavior.

### Companion / Aura

- **Canonical entrypoint**: `@/stores/canonicalCompanionStore`
- **Backed by**: `auraStore.ts`
- **Use for**: anything related to the career companion / aura (identity, evolution, care loop, streaks, archetypes, events).
- **Do not use**: `companionStore.ts` or `realCompanionStore.ts` for new work (they are legacy and marked `@deprecated`).

### Gamification

- **Canonical entrypoint**: `@/stores/canonicalGamificationStore`
- **Backed by**: `eventDrivenGamificationStore.ts`
- **Use for**: achievements, quests, streak multipliers, and listening to canonical gamification events.
- **Do not use**: `gamificationStore.ts` for new work (it is legacy and marked `@deprecated`).

### Marketplace – Providers / Bookings / Conversations

- **Canonical entrypoint**: `@/stores/canonicalMarketplaceProviderStore`
- **Backed by**: `marketplace.ts`
- **Use for**: providers, listings, bookings, conversations, payouts, and anything related to marketplace supply and transactions.

### Marketplace – Economy / Items / Currencies

- **Canonical entrypoint**: `@/stores/canonicalMarketplaceEconomyStore`
- **Backed by**: `marketplaceStore.ts`
- **Use for**: items, inventory, coins, gems and other marketplace economy / rewards state.

### Import pattern

In components and routes, prefer importing from the canonical entrypoints:

```ts
import { useAuraStore } from '@/stores/canonicalCompanionStore'
import { useGamificationStore } from '@/stores/canonicalGamificationStore'
import { useMarketplaceStore as useProviderMarketplaceStore } from '@/stores/canonicalMarketplaceProviderStore'
import { useMarketplaceStore as useEconomyMarketplaceStore } from '@/stores/canonicalMarketplaceEconomyStore'
```

This is the contract v2.5 agents should rely on when extending features or wiring new flows.

