# lib/ Directory Reorganization Plan

## Current State

**68 files** in a single flat directory - difficult to navigate and maintain.

---

## Proposed Structure

```
src/lib/
├── api/                    # API clients and fetchers (8 files)
│   ├── api-client.ts
│   ├── api.ts
│   ├── marketplace-client.ts
│   ├── medusa-client.ts
│   ├── cms.ts
│   └── supabase/          # Supabase client (existing dir)
│
├── auth/                   # Authentication utilities (4 files)
│   ├── auth-redirect.ts
│   ├── auth-redirect.test.ts
│   ├── roles.ts
│   └── roles.test.ts
│
├── entitlements/           # Subscription & access control (2 files)
│   ├── entitlements.ts
│   └── entitlement.ts
│
├── analytics/             # Analytics & monitoring (9 files)
│   ├── monitoring.ts
│   ├── observability.ts
│   ├── observability.test.ts
│   ├── observability-incidents.ts
│   ├── observability-incidents.test.ts
│   ├── product-analytics.ts
│   ├── olcan-events.ts
│   ├── admin-audit.ts
│   └── admin-audit.test.ts
│
├── psychology/            # OIOS psychology system (4 files)
│   ├── archetypes.ts
│   ├── oios-archetype-display.ts
│   ├── presence-phenotype.ts
│   ├── quiz-questions.ts
│   └── quiz-questions-pt.ts
│
├── forge/                 # Forge document system (4 files)
│   ├── forge-interview-loop.ts
│   ├── ats-analyzer.ts
│   ├── analysis.ts
│   └── audio-recorder.ts
│
├── journey/               # User journey & routes (5 files)
│   ├── journey.ts
│   ├── route-planner.ts
│   ├── navigation.ts
│   ├── navigation.test.ts
│   └── sprint-planner.ts
│
├── marketplace/           # Marketplace & commerce (3 files)
│   ├── storefront-links.ts
│   ├── community-artifacts.ts
│   └── community-reuse.ts
│
├── community/             # Community features (2 files)
│   ├── community-feedback.ts
│   ├── guild.ts
│   └── leaderboard.ts
│
├── finance/               # Financial calculations (2 files)
│   ├── finance-metrics.ts
│   ├── finance-metrics.test.ts
│   ├── payout-transitions.ts
│   └── payout-transitions.test.ts
│
├── features/              # Feature-specific logic (6 files)
│   ├── achievements.ts
│   ├── quests.ts
│   ├── battle.ts
│   ├── aura-presence.ts
│   ├── inventory.ts
│   └── readiness-gate.ts
│
├── utils/                 # General utilities (5 files)
│   ├── utils.ts
│   ├── format.ts
│   ├── text-normalize.ts
│   ├── text-normalize.test.ts
│   ├── file-export.ts
│   └── file-export.test.ts
│
├── config/                # Configuration (2 files)
│   ├── production-config.ts
│   └── product-flags.ts
│
└── types/                 # Type definitions & schemas
    ├── application-submission.ts
    └── application-submission.test.ts
```

---

## Migration Strategy

### Phase 1: Create Directory Structure

```bash
cd apps/app-compass-v2.5/src/lib

# Create new directories
mkdir -p api auth entitlements analytics psychology forge journey \
         marketplace community finance features utils config types
```

### Phase 2: Move Files

**Automated script:**
```bash
#!/bin/bash
# migrate-lib.sh

set -e

LIB_DIR="apps/app-compass-v2.5/src/lib"
cd "$LIB_DIR"

echo "📦 Reorganizing lib/ directory..."

# API
mv api-client.ts api/ 2>/dev/null || true
mv api.ts api/ 2>/dev/null || true
mv marketplace-client.ts api/ 2>/dev/null || true
mv medusa-client.ts api/ 2>/dev/null || true
mv cms.ts api/ 2>/dev/null || true

# Auth
mv auth-redirect.ts auth/ 2>/dev/null || true
mv auth-redirect.test.ts auth/ 2>/dev/null || true
mv roles.ts auth/ 2>/dev/null || true
mv roles.test.ts auth/ 2>/dev/null || true

# Entitlements
mv entitlements.ts entitlements/ 2>/dev/null || true
mv entitlement.ts entitlements/ 2>/dev/null || true

# Analytics
mv monitoring.ts analytics/ 2>/dev/null || true
mv observability.ts analytics/ 2>/dev/null || true
mv observability.test.ts analytics/ 2>/dev/null || true
mv observability-incidents.ts analytics/ 2>/dev/null || true
mv observability-incidents.test.ts analytics/ 2>/dev/null || true
mv product-analytics.ts analytics/ 2>/dev/null || true
mv olcan-events.ts analytics/ 2>/dev/null || true
mv admin-audit.ts analytics/ 2>/dev/null || true
mv admin-audit.test.ts analytics/ 2>/dev/null || true

# Psychology
mv archetypes.ts psychology/ 2>/dev/null || true
mv oios-archetype-display.ts psychology/ 2>/dev/null || true
mv presence-phenotype.ts psychology/ 2>/dev/null || true
mv quiz-questions.ts psychology/ 2>/dev/null || true
mv quiz-questions-pt.ts psychology/ 2>/dev/null || true

# Forge
mv forge-interview-loop.ts forge/ 2>/dev/null || true
mv ats-analyzer.ts forge/ 2>/dev/null || true
mv analysis.ts forge/ 2>/dev/null || true
mv audio-recorder.ts forge/ 2>/dev/null || true

# Journey
mv journey.ts journey/ 2>/dev/null || true
mv route-planner.ts journey/ 2>/dev/null || true
mv navigation.ts journey/ 2>/dev/null || true
mv navigation.test.ts journey/ 2>/dev/null || true
mv sprint-planner.ts journey/ 2>/dev/null || true

# Marketplace
mv storefront-links.ts marketplace/ 2>/dev/null || true
mv community-artifacts.ts marketplace/ 2>/dev/null || true
mv community-reuse.ts marketplace/ 2>/dev/null || true

# Community
mv community-feedback.ts community/ 2>/dev/null || true
mv guild.ts community/ 2>/dev/null || true
mv leaderboard.ts community/ 2>/dev/null || true

# Finance
mv finance-metrics.ts finance/ 2>/dev/null || true
mv finance-metrics.test.ts finance/ 2>/dev/null || true
mv payout-transitions.ts finance/ 2>/dev/null || true
mv payout-transitions.test.ts finance/ 2>/dev/null || true

# Features
mv achievements.ts features/ 2>/dev/null || true
mv quests.ts features/ 2>/dev/null || true
mv battle.ts features/ 2>/dev/null || true
mv aura-presence.ts features/ 2>/dev/null || true
mv inventory.ts features/ 2>/dev/null || true
mv readiness-gate.ts features/ 2>/dev/null || true
mv readiness-gate.test.ts features/ 2>/dev/null || true
mv readiness-history.ts features/ 2>/dev/null || true
mv readiness-history.test.ts features/ 2>/dev/null || true

# Utils
mv utils.ts utils/ 2>/dev/null || true
mv format.ts utils/ 2>/dev/null || true
mv text-normalize.ts utils/ 2>/dev/null || true
mv text-normalize.test.ts utils/ 2>/dev/null || true
mv file-export.ts utils/ 2>/dev/null || true
mv file-export.test.ts utils/ 2>/dev/null || true

# Config
mv production-config.ts config/ 2>/dev/null || true
mv product-flags.ts config/ 2>/dev/null || true
mv product-flags.test.ts config/ 2>/dev/null || true

# Types
mv application-submission.ts types/ 2>/dev/null || true
mv application-submission.test.ts types/ 2>/dev/null || true

echo "✅ Migration complete!"
```

### Phase 3: Update Imports

**Find and replace script:**
```bash
#!/bin/bash
# update-imports.sh

# This script needs to be run carefully
# Manual review recommended

# Example replacements:
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/api-client|@/lib/api/api-client|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/auth-redirect|@/lib/auth/auth-redirect|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/entitlements|@/lib/entitlements/entitlements|g'
# ... continue for all files
```

### Phase 4: Test Thoroughly

```bash
# Run TypeScript compiler
npm run type-check

# Run tests
npm test

# Build
npm run build

# Manual testing
# - Test all major flows
# - Verify no import errors
```

---

## Alternative: Barrel Exports

Instead of moving files, create barrel exports for cleaner imports:

**lib/api/index.ts:**
```typescript
export { default as apiClient } from '../api-client';
export { default as api } from '../api';
export { default as marketplaceClient } from '../marketplace-client';
export { default as medusaClient } from '../medusa-client';
export { default as cms } from '../cms';
```

**Usage:**
```typescript
// Before
import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';

// After
import { apiClient, api } from '@/lib/api';
```

**Pros:**
- No file movement required
- Backward compatible
- Cleaner imports

**Cons:**
- Still 68 files in root directory
- Need to maintain barrel files

---

## Recommendation

**For immediate improvement:** Use barrel exports (low risk, immediate benefit)

**For long-term:** Full reorganization (better structure, requires more work)

### Suggested Approach:

1. ✅ Create barrel export files (this week)
2. ✅ Update imports gradually over 2-3 weeks
3. ✅ Move files once all imports updated
4. ✅ Remove old files

---

## Implementation Checklist

- [ ] Create directory structure
- [ ] Create barrel export files
- [ ] Update 10% of imports (test)
- [ ] Update remaining imports
- [ ] Move files to new locations
- [ ] Run full test suite
- [ ] Manual QA testing
- [ ] Deploy to staging
- [ ] Monitor for 48 hours
- [ ] Deploy to production

---

## Risk Mitigation

### Low Risk Approach
1. Create barrel exports (no breaking changes)
2. Update imports incrementally
3. Test after each batch
4. Deploy to staging first

### High Risk Approach (NOT recommended)
1. Move all files at once
2. Update all imports at once
3. Hope tests catch everything

---

## Timeline

**Week 1:**
- Create barrel exports
- Update 20% of imports

**Week 2:**
- Update remaining imports
- Test thoroughly

**Week 3:**
- Move files
- Final testing
- Deploy to staging

**Week 4:**
- Deploy to production
- Monitor

---

**Last Updated:** April 13, 2026  
**Status:** Planning phase
