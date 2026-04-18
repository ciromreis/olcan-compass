# Implementation Plan: Compass v2 Frontend

## Context

The backend is 100% complete with all engines implemented. The frontend exists but is a minimal scaffold that doesn't implement the Metamodern Design System (MMXD) philosophy from the PRD.

## Goal

Transform the frontend from a generic React app into a proper MMXD-driven interface that embodies the "Serious Play" philosophy and oscillates between The Map (high-density) and The Forge (minimalist) modes.

## Constraints & Approach

Given the complexity and my capabilities, I'll take an **incremental, foundation-first approach**:

1. **Design Tokens First** - Establish the visual language
2. **Core Components** - Build reusable UI primitives
3. **One Complete Flow** - Implement one engine end-to-end as a template
4. **Iterate** - Expand to other engines

## Phase 1: Design System Foundation (THIS SESSION)

### 1.1 Design Tokens
**File**: `apps/web/src/design-tokens.json`

```json
{
  "colors": {
    "void": {
      "primary": "#001338",
      "light": "#001A4D",
      "lighter": "#002266"
    },
    "ignis": {
      "100": "#FF6B35",
      "200": "#FF8C42",
      "300": "#FFAD5A"
    },
    "neutral": {
      "800": "#0A0D1A",
      "700": "#1A1F33",
      "600": "#2A3347",
      "500": "#3D4A66",
      "400": "#556080",
      "300": "#707DB2",
      "200": "#9AA5CC",
      "100": "#C4CCE6"
    },
    "semantic": {
      "success": "#4CAF50",
      "warning": "#FFC107",
      "error": "#F44336",
      "mirror": "#9C27B0"
    }
  },
  "typography": {
    "fonts": {
      "heading": "Merriweather Sans",
      "body": "Source Sans Variable",
      "mono": "JetBrains Mono"
    },
    "scale": {
      "h1": "48px",
      "h2": "36px",
      "h3": "28px",
      "body-large": "18px",
      "body": "16px",
      "body-small": "14px",
      "caption": "12px"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px"
  }
}
```

### 1.2 Tailwind Configuration
Update `apps/web/tailwind.config.js` to use design tokens:

```javascript
import tokens from './src/design-tokens.json'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: tokens.colors.void,
        ignis: tokens.colors.ignis,
        neutral: tokens.colors.neutral,
        ...tokens.colors.semantic,
      },
      fontFamily: {
        heading: [tokens.typography.fonts.heading, 'sans-serif'],
        body: [tokens.typography.fonts.body, 'sans-serif'],
        mono: [tokens.typography.fonts.mono, 'monospace'],
      },
      spacing: tokens.spacing,
    },
  },
  plugins: [],
}
```

### 1.3 Core Components

**Button** (`apps/web/src/components/ui/Button.tsx`)
- Variants: Primary (Ignis), Secondary (Neutral), Ghost
- Sizes: Small, Medium, Large
- States: Default, Hover, Disabled, Loading

**Card** (`apps/web/src/components/ui/Card.tsx`)
- Types: Default, Opportunity, FearReframe, IdentityMirror
- Supports: Header, Body, Footer slots

**Input** (`apps/web/src/components/ui/Input.tsx`)
- Validation states
- Error messages
- Label support

**Progress** (`apps/web/src/components/ui/Progress.tsx`)
- Linear progress bar
- Circular progress (for scores)
- Ignis accent for active state

### 1.4 Typography System
**File**: `apps/web/src/components/ui/Typography.tsx`

Components: `H1`, `H2`, `H3`, `Body`, `BodySmall`, `Caption`

## Phase 2: The Mirror (Onboarding Flow)

**Why start here?**
- First user experience
- Self-contained flow
- Demonstrates MMXD principles
- Creates psychological profile that drives rest of system

### 2.1 Onboarding Pages
1. **Welcome** - Brand introduction
2. **Personal Info** - Name, email, country
3. **Mobility Intent** - Route selection
4. **Psychological Assessment** - 8-12 questions
5. **Identity Mirror** - Radar chart with results

### 2.2 Components Needed
- `QuestionCard` - Single question display
- `ProgressBar` - Shows completion
- `RadarChart` - Final results visualization
- `ArchetypeCard` - Shareable identity card

### 2.3 State Management
```typescript
interface OnboardingState {
  step: number
  answers: Record<string, any>
  profile: PsychProfile | null
}
```

## Phase 3: The Operating Map (Dashboard)

### 3.1 Dashboard Layout
- **Header**: User profile, notifications
- **Sidebar**: Module navigation (FIND/DECIDE/BUILD)
- **Main**: Current state visualization
- **Action Panel**: Next recommended action

### 3.2 State-Driven UI
```typescript
interface DashboardState {
  mobilityState: 'exploring' | 'preparing' | 'applying' | 'awaiting' | 'iterating'
  psychState: 'uncertain' | 'structuring' | 'building_confidence' | 'executing'
  readinessScore: number
  nextAction: Action
  blockers: Blocker[]
}
```

### 3.3 Modules
- **FIND** (Oracle) - Opportunity search
- **DECIDE** (Mirror) - Scenario comparison
- **BUILD** (Forge) - Document creation

## Phase 4: The Forge (Narrative Engine)

### 4.1 Editor Interface
- Monochromatic background (Void primary)
- Centered content area (max-width: 800px)
- Generous whitespace
- Minimal chrome

### 4.2 Block Editor
- Text blocks
- Heading blocks
- List blocks
- Quote blocks

### 4.3 Olcan Score Meter
- Real-time feedback
- Dimensions: Clarity, Coherence, Authenticity
- Non-intrusive display (top-right corner)

### 4.4 Version Control
- Save versions
- Compare versions (diff view)
- Restore previous versions

## Phase 5: The Oracle (Application Management)

### 5.1 Search Interface
- Semantic search bar
- Filter sidebar (country, language, budget, deadline)
- Results grid

### 5.2 Opportunity Cards
- Viability score indicator
- Structural viability pruner (visual redaction of disqualified options)
- Watchlist toggle
- Quick actions

### 5.3 Comparison View
- Side-by-side comparison
- ROI calculations
- Deadline tracking

## Phase 6: Intelligence Layer

### 6.1 AI Integration
- Connect to backend AI endpoints
- Real-time analysis
- Structured feedback display

### 6.2 Contextual Triggers
- Fear reframe cards (when analysis paralysis detected)
- Marketplace suggestions (when scores low)
- Mentorship prompts (when stuck)

### 6.3 Psychological Adaptation
- UI tone adapts to psych profile
- Pacing adjusts to discipline score
- Risk flags based on anxiety level

## Implementation Strategy

### For This Session (What I Can Do)
1. ✅ Fix auth bug (DONE)
2. ✅ Create status documentation (DONE)
3. ✅ Create implementation plan (THIS FILE)
4. 🎯 Create design tokens file
5. 🎯 Update Tailwind config
6. 🎯 Build 3-5 core components (Button, Card, Input, Progress, Typography)
7. 🎯 Create a simple example page showing components

### For Next Session (Next AI Agent)
1. Implement The Mirror onboarding flow
2. Connect to backend psychology endpoints
3. Build radar chart visualization
4. Create identity card component

### For Future Sessions
- Dashboard with state-driven navigation
- The Forge editor
- The Oracle search
- Marketplace integration
- AI analysis integration

## Success Criteria

### Phase 1 Complete When:
- [ ] Design tokens file exists and is valid JSON
- [ ] Tailwind config uses design tokens
- [ ] 5 core components built and documented
- [ ] Example page shows all components
- [ ] Components follow MMXD principles (serious, calm, professional)

### Phase 2 Complete When:
- [ ] User can complete onboarding flow
- [ ] Psychological profile is created and stored
- [ ] Identity Mirror displays radar chart
- [ ] Archetype card is generated
- [ ] Flow takes 8-12 minutes

### Phase 3 Complete When:
- [ ] Dashboard shows user's current state
- [ ] Modules are locked/unlocked based on state
- [ ] Next action is clearly displayed
- [ ] Navigation adapts to psychological profile

## Technical Notes

### Font Loading
Add to `apps/web/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
```

### State Management
Continue using Zustand for client state:
- `useAuthStore` (existing)
- `useOnboardingStore` (new)
- `useDashboardStore` (new)
- `useEditorStore` (new)

### API Integration
All backend endpoints are ready. Frontend just needs to call them:
- `/api/psych/*` - Psychology engine
- `/api/narratives/*` - Narrative engine
- `/api/interviews/*` - Interview engine
- `/api/applications/*` - Application management
- `/api/sprints/*` - Readiness engine
- `/api/marketplace/*` - Marketplace

## Risks & Mitigations

### Risk: Scope Too Large
**Mitigation**: Incremental approach. One complete flow before moving to next.

### Risk: Design System Complexity
**Mitigation**: Start with tokens and 5 core components. Expand as needed.

### Risk: MMXD Philosophy Hard to Implement
**Mitigation**: Focus on key principles:
- Serious, not gamified
- Oscillation between modes
- Psychological adaptation
- Portuguese-first
- Unexpected vulnerability in microcopy

### Risk: AI Integration Complexity
**Mitigation**: Backend has placeholders. Frontend can show mock data initially.

## Next Steps

**Immediate (This Session):**
1. Create design tokens file
2. Update Tailwind config
3. Build core components
4. Create component showcase page

**Next Session:**
1. Read this plan
2. Read PRD sections on The Mirror
3. Implement onboarding flow
4. Connect to psychology endpoints

**Future:**
- Dashboard
- The Forge
- The Oracle
- Full MMXD implementation

---

**Remember**: The backend is solid. Focus on frontend. One flow at a time. Quality over quantity.
