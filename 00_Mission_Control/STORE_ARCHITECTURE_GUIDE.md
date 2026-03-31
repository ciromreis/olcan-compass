# 🏗️ Store Architecture Guide - Olcan Compass v2.5

**Date**: March 30, 2026  
**Purpose**: Document store structure and usage patterns  
**Status**: Canonical Reference

---

## 📊 STORE INVENTORY

### Total Stores: 36

**Category Breakdown**:
- Core Features: 12 stores
- Companion/Gamification: 6 stores
- E-commerce: 2 stores
- Admin/Analytics: 4 stores
- Utilities: 12 stores

---

## 🎯 COMPANION/GAMIFICATION STORES

### The Companion System Confusion

**Problem**: Multiple stores for the same feature with different names

**Stores**:
1. `auraStore.ts` - **CANONICAL** (newest, most complete)
2. `companionStore.ts` - Legacy, deprecated
3. `realCompanionStore.ts` - Alternative implementation, deprecated
4. `companionPersonalityStore.ts` - Personality system (keep separate)
5. `gamificationStore.ts` - General gamification (keep separate)
6. `eventDrivenGamificationStore.ts` - Event system (keep separate)

### Resolution

**Use This Pattern**:
```typescript
// For companion features, ALWAYS use auraStore
import { useAuraStore, useAura } from '@/stores/auraStore'

// For gamification events
import { useGamificationStore } from '@/stores/eventDrivenGamificationStore'

// For personality-specific features
import { useCompanionPersonalityStore } from '@/stores/companionPersonalityStore'
```

**Why "Aura"?**
- Frontend uses "Aura" branding (metamodern aesthetic)
- Backend API uses "companion" endpoints
- `auraStore` bridges this gap
- Companion page wraps Aura system with simpler branding

**Migration Path**:
1. All new code uses `auraStore`
2. Old `companionStore` imports should be updated
3. `realCompanionStore` should not be used
4. Add deprecation warnings to old stores

---

## 🛍️ E-COMMERCE STORES

### Marketplace Confusion

**Problem**: Two marketplace stores with different purposes

**Stores**:
1. `marketplaceStore.ts` - Virtual items, in-app economy
2. `ecommerceStore.ts` - Real products, service providers, orders

### Resolution

**Use This Pattern**:
```typescript
// For in-app virtual items (boosts, cosmetics)
import { useMarketplaceStore } from '@/stores/marketplaceStore'

// For real products and services
import { useEcommerceStore } from '@/stores/ecommerceStore'
```

**Clear Separation**:
- `marketplaceStore`: Gamification items, virtual currency
- `ecommerceStore`: Real money transactions, Stripe integration

---

## 📚 CORE FEATURE STORES

### Authentication & User
```typescript
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
```

**Purpose**: User authentication, profile management

**Key Methods**:
- `login()`, `logout()`, `register()`
- `fetchProfile()`, `updateProfile()`

### Applications
```typescript
import { useApplicationStore } from '@/stores/applications'
```

**Purpose**: Job application tracking

**Key Methods**:
- `fetchApplications()`, `createApplication()`
- `updateStatus()`, `getStats()`

### Routes
```typescript
import { useRouteStore } from '@/stores/routes'
```

**Purpose**: Career route planning

**Key Methods**:
- `fetchRoutes()`, `createRoute()`
- `updateMilestone()`, `calculateProgress()`

### Sprints
```typescript
import { useSprintStore } from '@/stores/sprints'
```

**Purpose**: Sprint/task management

**Key Methods**:
- `fetchSprints()`, `createSprint()`
- `updateTask()`, `completeSprint()`

### Forge (Documents)
```typescript
import { useForgeStore } from '@/stores/forge'
// OR for enhanced features
import { useForgeEnhancedStore } from '@/stores/forge-enhanced'
```

**Purpose**: Document creation and management

**Key Methods**:
- `fetchDocuments()`, `createDocument()`
- `generateVersion()`, `analyzeQuality()`

### Interviews
```typescript
import { useInterviewStore } from '@/stores/interviews'
```

**Purpose**: Interview practice and tracking

**Key Methods**:
- `fetchSessions()`, `createSession()`
- `submitAnswer()`, `getStats()`

### Community
```typescript
import { useCommunityStore } from '@/stores/community'
```

**Purpose**: Community content, discussions

**Key Methods**:
- `fetchFeed()`, `createPost()`
- `addComment()`, `saveReference()`

### Guilds
```typescript
import { useGuildStore } from '@/stores/guildStore'
```

**Purpose**: Guild/team management

**Key Methods**:
- `fetchGuilds()`, `createGuild()`
- `joinGuild()`, `leaveGuild()`

---

## 🔧 UTILITY STORES

### Error Handling
```typescript
import { useErrorStore } from '@/stores/errorStore'
```

**Purpose**: Global error management

**Key Methods**:
- `addError()`, `clearErrors()`
- `getErrors()`, `hasErrors()`

### Theme
```typescript
import { useThemeStore } from '@/stores/themeStore'
```

**Purpose**: Theme and appearance

**Key Methods**:
- `setTheme()`, `toggleTheme()`
- `getTheme()`, `applyTheme()`

### Real-time
```typescript
import { useRealtimeStore } from '@/stores/realtimeStore'
```

**Purpose**: WebSocket connections, real-time updates

**Key Methods**:
- `connect()`, `disconnect()`
- `subscribe()`, `unsubscribe()`

### Performance
```typescript
import { usePerformanceStore } from '@/stores/performanceStore'
```

**Purpose**: Performance monitoring

**Key Methods**:
- `trackMetric()`, `getMetrics()`
- `reportPerformance()`

### Analytics
```typescript
import { useAnalyticsStore } from '@/stores/analyticsStore'
```

**Purpose**: User analytics and tracking

**Key Methods**:
- `trackEvent()`, `trackPageView()`
- `setUserProperties()`

---

## 🎨 ADMIN STORES

### Admin
```typescript
import { useAdminStore } from '@/stores/admin'
```

**Purpose**: Admin panel functionality

**Key Methods**:
- `fetchUsers()`, `fetchStats()`
- `moderateContent()`, `manageSettings()`

### Organization
```typescript
import { useOrgStore } from '@/stores/org'
```

**Purpose**: Organization management

**Key Methods**:
- `fetchOrg()`, `updateOrg()`
- `manageMembers()`, `manageRoles()`

### Observability
```typescript
import { useObservabilityStore } from '@/stores/observability'
```

**Purpose**: System monitoring and logging

**Key Methods**:
- `logEvent()`, `trackError()`
- `getMetrics()`, `getLogs()`

---

## 🎯 SPECIALIZED STORES

### Audio
```typescript
import { useAudioStore } from '@/stores/audioStore'
```

**Purpose**: Audio playback and management

### YouTube
```typescript
import { useYoutubeStore } from '@/stores/youtubeStore'
```

**Purpose**: YouTube integration

### Nudge Engine
```typescript
import { useNudgeStore } from '@/stores/nudge'
```

**Purpose**: Behavioral nudges and prompts

### Psychology
```typescript
import { usePsychStore } from '@/stores/psych'
```

**Purpose**: Psychological profiling

### Economics
```typescript
import { useEconomicsStore } from '@/stores/economics'
```

**Purpose**: Economic intelligence

### Settings
```typescript
import { useSettingsStore } from '@/stores/settings'
```

**Purpose**: User settings and preferences

---

## 📋 BEST PRACTICES

### 1. Store Selection
```typescript
// ✅ GOOD - Use the right store for the job
import { useAuraStore } from '@/stores/auraStore'
import { useEcommerceStore } from '@/stores/ecommerceStore'

// ❌ BAD - Using deprecated stores
import { useCompanionStore } from '@/stores/companionStore'
import { useRealCompanionStore } from '@/stores/realCompanionStore'
```

### 2. Store Initialization
```typescript
// ✅ GOOD - Initialize in useEffect
useEffect(() => {
  fetchAura()
}, [fetchAura])

// ❌ BAD - Initialize in render
const aura = useAura()
fetchAura() // This will cause infinite loops
```

### 3. Store Composition
```typescript
// ✅ GOOD - Use multiple stores when needed
const { companion } = useAuraStore()
const { achievements } = useGamificationStore()
const { products } = useEcommerceStore()

// ❌ BAD - Trying to get everything from one store
const { companion, achievements, products } = useAuraStore() // Won't work
```

### 4. State Updates
```typescript
// ✅ GOOD - Use store actions
const { performCareActivity } = useAuraStore()
await performCareActivity('feed')

// ❌ BAD - Direct state mutation
aura.energy += 10 // This won't work with Zustand
```

---

## 🔄 MIGRATION GUIDE

### From Old Companion Store to Aura Store

**Before**:
```typescript
import { useCompanionStore } from '@/stores/companionStore'

const { companion, feedCompanion } = useCompanionStore()
```

**After**:
```typescript
import { useAuraStore, useAura } from '@/stores/auraStore'

const companion = useAura()
const { performCareActivity } = useAuraStore()

// Use performCareActivity('feed') instead of feedCompanion()
```

### From Marketplace Store to Ecommerce Store

**Before**:
```typescript
import { useMarketplaceStore } from '@/stores/marketplaceStore'

const { items, purchaseItem } = useMarketplaceStore()
```

**After** (for real products):
```typescript
import { useEcommerceStore } from '@/stores/ecommerceStore'

const { products, addToCart } = useEcommerceStore()
```

**Keep** (for virtual items):
```typescript
import { useMarketplaceStore } from '@/stores/marketplaceStore'

const { items, purchaseItem } = useMarketplaceStore()
```

---

## 🚨 DEPRECATION NOTICES

### Deprecated Stores (Do Not Use)
1. `companionStore.ts` - Use `auraStore.ts` instead
2. `realCompanionStore.ts` - Use `auraStore.ts` instead

### Stores to Merge (Future)
1. `forge.ts` + `forge-enhanced.ts` - Should be consolidated
2. Consider merging personality into main aura store

---

## 📊 STORE DEPENDENCIES

### Core Dependencies
```
auth → profile → applications, routes, sprints
aura → gamification → achievements, quests
ecommerce → marketplace (virtual items)
```

### Initialization Order
1. `auth` - Must be first
2. `profile` - After auth
3. Feature stores - After profile
4. Utility stores - Anytime

---

## 🎯 FUTURE IMPROVEMENTS

### Short-term
1. Add deprecation warnings to old stores
2. Update all imports to use canonical stores
3. Document remaining stores

### Medium-term
1. Consolidate forge stores
2. Merge personality into aura store
3. Add store performance monitoring

### Long-term
1. Consider moving to Redux Toolkit
2. Implement proper state persistence
3. Add state time-travel debugging

---

**Summary**: Use `auraStore` for companion features, `ecommerceStore` for real products, and avoid deprecated stores. When in doubt, check this guide.
