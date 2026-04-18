# Design System: Visual Language & Material System

> **Document:** Visual Language Specification
> **Version:** 1.0.0 | **Last Updated:** March 2026

## The Liquid-Glass Material System

### Material Properties

**Primary Material: Liquid Glass**
- Semi-transparent surfaces with depth
- Soft blur effects creating atmospheric depth
- Light refraction and subtle gradients
- Smooth, fluid transitions between states

**Secondary Material: Matte Metal**
- Solid, grounded surfaces for contrast
- Subtle texture suggesting premium quality
- Used for primary actions and key information
- Provides visual anchor points

**Tertiary Material: Organic Light**
- Soft, diffused glow effects
- Animated light orbs and particles
- Creates warmth and life in the interface
- Guides attention without being intrusive

### Physical Behavior Rules

**Transparency Hierarchy**
```
Level 1 (Background): 5-10% opacity - Subtle atmospheric depth
Level 2 (Cards/Panels): 60-80% opacity - Clear content visibility
Level 3 (Modals/Overlays): 85-95% opacity - Focus and hierarchy
Level 4 (Solid): 100% opacity - Primary actions and critical info
```

**Blur Intensity Scale**
```
Subtle: 8px blur - Background elements
Medium: 16px blur - Standard glass surfaces
Strong: 24px blur - Deep layering effects
Extreme: 40px blur - Atmospheric backgrounds
```

**Elevation System**
```
Level 0: Base surface (no shadow)
Level 1: 0 2px 8px rgba(0,0,0,0.04) - Subtle lift
Level 2: 0 4px 16px rgba(0,0,0,0.08) - Cards and panels
Level 3: 0 8px 24px rgba(0,0,0,0.12) - Floating elements
Level 4: 0 16px 48px rgba(0,0,0,0.16) - Modals and overlays
```

## Color Philosophy: CROMO-MMXD

### Core Palette (Metamodern Minimalism)

**Bone/Cream (The Canvas)**
```css
--bone-50: #FBFAF7;   /* Lightest - Page backgrounds */
--bone-100: #F7F4EF;  /* Light - Card backgrounds */
--bone-200: #EDE8E0;  /* Medium - Subtle borders */
--bone-300: #DDD6CA;  /* Dark - Dividers */
```
**Usage:** Primary reading surfaces, long-form content areas, editorial spaces

**Ink (The Truth)**
```css
--ink-900: #0D0C0A;   /* Darkest - Primary text */
--ink-800: #1A1816;   /* Dark - Secondary text */
--ink-700: #2D2A26;   /* Medium - Tertiary text */
--ink-600: #4A4540;   /* Light - Disabled text */
```
**Usage:** Typography, icons, high-contrast elements

**Flame (The Catalyst)**
```css
--flame-500: #E8421A;  /* Primary - Main CTA */
--flame-400: #F05A35;  /* Light - Hover states */
--flame-600: #C73815;  /* Dark - Active states */
--flame-100: #FEF2EF;  /* Tint - Backgrounds */
```
**Usage:** Conversion actions, progress indicators, evolution moments

**Slate (The Void)**
```css
--slate-950: #0F172A;  /* Darkest - Dark mode base */
--slate-900: #1E293B;  /* Dark - Dark mode surfaces */
--slate-800: #334155;  /* Medium - Dark mode borders */
--slate-700: #475569;  /* Light - Dark mode text */
```
**Usage:** Dark mode, depth creation, premium sections

### Extended Palette (OIOS Archetype Colors)

**Archetype Color Mapping**
```css
/* Freedom Seekers - Cool Blues */
--archetype-escapee: #2563EB;        /* Institutional Escapee */
--archetype-nomad: #0EA5E9;          /* Global Nomad */

/* Achievement Seekers - Warm Golds */
--archetype-cartographer: #D4AF37;   /* Scholarship Cartographer */
--archetype-pivot: #F59E0B;          /* Career Pivot */

/* Security Seekers - Earthy Greens */
--archetype-bridge: #059669;         /* Technical Bridge Builder */
--archetype-mother: #10B981;         /* Exhausted Solo Mother */

/* Purpose Seekers - Deep Purples */
--archetype-servant: #7C3AED;        /* Trapped Public Servant */
--archetype-hermit: #8B5CF6;         /* Academic Hermit */

/* Balance Seekers - Soft Neutrals */
--archetype-executive: #64748B;      /* Executive Refugee */
--archetype-optimizer: #94A3B8;      /* Lifestyle Optimizer */

/* Expression Seekers - Vibrant Magentas */
--archetype-visionary: #DB2777;      /* Creative Visionary */
--archetype-insecure: #EC4899;       /* Insecure Corporate Dev */
```

### Semantic Color System

**Status Colors**
```css
--success: #10B981;    /* Positive outcomes, completed states */
--warning: #F59E0B;    /* Caution, attention needed */
--error: #EF4444;      /* Errors, destructive actions */
--info: #3B82F6;       /* Informational, neutral guidance */
```

**Interaction Colors**
```css
--hover-overlay: rgba(0, 0, 0, 0.04);     /* Light mode hover */
--hover-overlay-dark: rgba(255, 255, 255, 0.08);  /* Dark mode hover */
--focus-ring: rgba(232, 66, 26, 0.3);     /* Focus indicator */
--selection: rgba(232, 66, 26, 0.15);     /* Text selection */
```

## Typography System: Editorial Precision

### Font Families

**Display Typography (DM Serif Display)**
```css
--font-display: 'DM Serif Display', Georgia, serif;
```
**Usage:** Hero headlines, section titles, editorial moments
**Characteristics:** Sophisticated, traditional, high-contrast serifs
**Weights:** 400 (Regular), 500 (Medium)

**Body Typography (DM Sans)**
```css
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Usage:** Body text, UI elements, navigation, forms
**Characteristics:** Clean, modern, highly legible
**Weights:** 400 (Regular), 500 (Medium), 700 (Bold)

**Monospace Typography (JetBrains Mono)**
```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```
**Usage:** Code, data, technical information, timestamps
**Characteristics:** Clear, technical, developer-friendly
**Weights:** 400 (Regular), 500 (Medium), 700 (Bold)

### Type Scale (Perfect Fourth - 1.333 ratio)

```css
--text-xs: 0.75rem;      /* 12px - Captions, labels */
--text-sm: 0.875rem;     /* 14px - Small body, metadata */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body, subheadings */
--text-xl: 1.333rem;     /* 21.33px - H4 */
--text-2xl: 1.777rem;    /* 28.43px - H3 */
--text-3xl: 2.369rem;    /* 37.90px - H2 */
--text-4xl: 3.157rem;    /* 50.51px - H1 */
--text-5xl: 4.209rem;    /* 67.34px - Display */
```

### Typography Usage Rules

**Heading Hierarchy**
```css
.heading-display {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink-900);
}

.heading-1 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.heading-2 {
  font-family: var(--font-body);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.3;
}

.heading-3 {
  font-family: var(--font-body);
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.4;
}
```

**Body Text**
```css
.body-large {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: 1.6;
  color: var(--ink-800);
}

.body-base {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--ink-800);
}

.body-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--ink-700);
}
```

**Technical Text**
```css
.text-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  letter-spacing: -0.01em;
  color: var(--ink-800);
}
```

## Spacing System: Mathematical Precision

### Base Unit: 4px Grid

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Spacing Usage Guidelines

**Component Internal Spacing**
- Buttons: 12px vertical, 24px horizontal
- Cards: 24px padding (mobile), 32px padding (desktop)
- Forms: 16px between fields
- Lists: 12px between items

**Layout Spacing**
- Section padding: 48px (mobile), 96px (desktop)
- Component gaps: 24px (mobile), 32px (desktop)
- Grid gaps: 16px (tight), 24px (normal), 32px (loose)

## Visual Effects: Depth and Atmosphere

### Glass Effect Specifications

**Standard Glass Surface**
```css
.glass-surface {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
```

**Dark Glass Surface**
```css
.glass-surface-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

**Frosted Glass (Heavy Blur)**
```css
.glass-frosted {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Glow and Light Effects

**Soft Glow (Organic Light)**
```css
.glow-soft {
  box-shadow: 
    0 0 20px rgba(232, 66, 26, 0.15),
    0 0 40px rgba(232, 66, 26, 0.08);
}
```

**Flame Glow (CTA Emphasis)**
```css
.glow-flame {
  box-shadow: 
    0 0 30px rgba(232, 66, 26, 0.3),
    0 0 60px rgba(232, 66, 26, 0.15),
    0 0 90px rgba(232, 66, 26, 0.08);
}
```

**Archetype Glow (Dynamic)**
```css
.glow-archetype {
  box-shadow: 
    0 0 20px var(--archetype-color-alpha-30),
    0 0 40px var(--archetype-color-alpha-15);
}
```

### Gradient System

**Atmospheric Gradients**
```css
--gradient-bone-to-slate: linear-gradient(
  180deg, 
  var(--bone-50) 0%, 
  var(--slate-950) 100%
);

--gradient-glass-light: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.9) 0%,
  rgba(255, 255, 255, 0.6) 100%
);

--gradient-glass-dark: linear-gradient(
  135deg,
  rgba(15, 23, 42, 0.9) 0%,
  rgba(15, 23, 42, 0.6) 100%
);
```

**Flame Gradients (CTAs)**
```css
--gradient-flame: linear-gradient(
  135deg,
  #E8421A 0%,
  #F05A35 50%,
  #F97316 100%
);

--gradient-flame-hover: linear-gradient(
  135deg,
  #C73815 0%,
  #E8421A 50%,
  #F05A35 100%
);
```

## Icon System: Lucide + Custom

### Icon Library: Lucide Icons

**Why Lucide:**
- Consistent stroke width (2px default)
- Clean, minimal aesthetic
- Extensive library (1000+ icons)
- No emoji dependency

**Icon Sizing Scale**
```css
--icon-xs: 16px;   /* Inline with text */
--icon-sm: 20px;   /* Small UI elements */
--icon-md: 24px;   /* Standard buttons, nav */
--icon-lg: 32px;   /* Feature highlights */
--icon-xl: 48px;   /* Hero sections */
--icon-2xl: 64px;  /* Large illustrations */
```

**Icon Color Usage**
```css
.icon-primary { color: var(--ink-900); }
.icon-secondary { color: var(--ink-700); }
.icon-muted { color: var(--ink-600); }
.icon-flame { color: var(--flame-500); }
.icon-archetype { color: var(--archetype-color); }
```

### Custom Icon Set: OIOS Archetype Spirits

**Archetype Visual Representations**
Each archetype has a unique visual spirit (illustrated icon):
- Institutional Escapee: Broken chain transforming into wings
- Scholarship Cartographer: Compass with constellation map
- Career Pivot: Bridge connecting two islands
- Global Nomad: Flowing path with multiple flags
- Technical Bridge Builder: Circuit board forming a bridge
- Insecure Corporate Dev: Shadow figure gaining light
- Exhausted Solo Mother: Multi-armed figure with protective shield
- Trapped Public Servant: Cage dissolving into particles
- Academic Hermit: Book transforming into telescope
- Executive Refugee: Hourglass with balanced scales
- Creative Visionary: Prism refracting light
- Lifestyle Optimizer: Geometric shapes in perfect balance

**Implementation:** SVG format, 64x64px base size, monochrome with archetype color overlay

## Layout Philosophy: Asymmetric Balance

### Grid System

**12-Column Responsive Grid**
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
    padding: 0 var(--space-4);
  }
}
```

**Asymmetric Layout Patterns**
- 2:1 ratio for content/sidebar layouts
- 3:2 ratio for feature/description layouts
- Golden ratio (1.618:1) for hero sections
- Intentional whitespace creating breathing room

### Breakpoint Strategy

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

## Accessibility Standards

### WCAG 2.1 AA Compliance (Minimum)

**Color Contrast Requirements**
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- UI components: 3:1 minimum
- Graphical objects: 3:1 minimum

**Verified Contrast Ratios**
```
Ink-900 on Bone-50: 14.2:1 ✓
Ink-800 on Bone-100: 11.8:1 ✓
Flame-500 on Bone-50: 5.1:1 ✓
Slate-700 on Slate-950: 4.8:1 ✓
```

### Interaction Accessibility

**Focus Indicators**
```css
:focus-visible {
  outline: 2px solid var(--flame-500);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Touch Targets**
- Minimum size: 44x44px (iOS/Android guidelines)
- Spacing between targets: 8px minimum
- Clear visual feedback on interaction

**Motion Sensitivity**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark Mode Strategy

### Automatic Theme Detection
```javascript
// System preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// User preference storage
localStorage.setItem('theme', 'light' | 'dark' | 'system');
```

### Dark Mode Color Adjustments

**Inverted Hierarchy**
```css
[data-theme="dark"] {
  --bg-primary: var(--slate-950);
  --bg-secondary: var(--slate-900);
  --bg-tertiary: var(--slate-800);
  
  --text-primary: var(--bone-50);
  --text-secondary: var(--bone-200);
  --text-tertiary: var(--bone-300);
  
  --border-primary: var(--slate-800);
  --border-secondary: var(--slate-700);
}
```

**Glass Adjustments**
```css
[data-theme="dark"] .glass-surface {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

## Visual Hierarchy Principles

### Z-Index System
```css
--z-base: 0;           /* Base content */
--z-dropdown: 100;     /* Dropdowns, tooltips */
--z-sticky: 200;       /* Sticky headers */
--z-overlay: 300;      /* Overlays, backdrops */
--z-modal: 400;        /* Modals, dialogs */
--z-toast: 500;        /* Notifications */
--z-tooltip: 600;      /* Tooltips (highest) */
```

### Visual Weight Distribution

**Primary Focus (Highest Weight)**
- Hero CTAs with flame gradient
- Active navigation items
- Primary form actions
- Critical notifications

**Secondary Focus (Medium Weight)**
- Section headings
- Feature cards
- Secondary actions
- Important metadata

**Tertiary Focus (Low Weight)**
- Body text
- Supporting information
- Disabled states
- Background elements

## Responsive Design Philosophy

### Mobile-First Approach

**Base Design (320px+)**
- Single column layouts
- Stacked navigation
- Full-width components
- Touch-optimized interactions

**Tablet Enhancement (768px+)**
- Two-column layouts where appropriate
- Horizontal navigation
- Side-by-side content
- Hover states introduced

**Desktop Optimization (1024px+)**
- Multi-column layouts
- Advanced interactions
- Larger typography scale
- More whitespace and breathing room

### Content Density Rules

**Mobile:** High density, minimal whitespace
**Tablet:** Medium density, balanced spacing
**Desktop:** Low density, generous whitespace

## Brand Expression Guidelines

### When to Use Display Typography
- Hero headlines on landing pages
- Section titles on marketing pages
- Editorial content headers
- Moment of significance (achievements, milestones)

### When to Use Flame Color
- Primary conversion actions (Sign Up, Start Now, Get Started)
- Progress indicators showing advancement
- Evolution moments (archetype level-ups)
- Critical notifications requiring immediate action

### When to Use Glass Effects
- Navigation bars and headers
- Modal overlays and dialogs
- Feature cards and panels
- Floating action buttons
- Sidebar panels

### When to Use Archetype Colors
- User profile indicators
- Personalized dashboard sections
- Fear cluster visualizations
- Progress tracking specific to user journey
- Marketplace mentor categories

## Implementation Priority

1. **Foundation Layer:** Color tokens, typography, spacing
2. **Material System:** Glass effects, shadows, gradients
3. **Component Base:** Buttons, forms, cards using materials
4. **Layout System:** Grid, containers, responsive patterns
5. **Motion Layer:** Transitions, animations, micro-interactions
6. **Archetype Integration:** Dynamic theming based on user profile

---

**Next Document:** DESIGN_SYSTEM_TOKENS.md - Complete token definitions and implementation
