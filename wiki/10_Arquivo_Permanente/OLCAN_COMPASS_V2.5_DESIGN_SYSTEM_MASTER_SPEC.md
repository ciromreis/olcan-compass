# Olcan Compass v2.5 Design System Master Specification

**Version:** 2.5.0  
**Status:** Planning & Documentation Phase  
**Last Updated:** 2026-03-24  
**Purpose:** Master planning document for Olcan Compass app and company website redesign

---

## 🎯 Vision Statement

Transform Olcan Compass from AI-slop aesthetics (emojis, generic cards) to a **liquid-glass metamodern visual system** with **game-like interactions** that feel high-end, functional, and intentionally crafted.

### Current State Problems
- ❌ AI-slot visual language (generic, soulless)
- ❌ Emoji-heavy interface (unprofessional)
- ❌ Ugly, generic card components
- ❌ No cohesive design system
- ❌ Lacks premium feel and intentional craft

### Target State Goals
- ✅ Liquid-glass metamodern aesthetic (depth, transparency, blur)
- ✅ Game-like interaction patterns (responsive, delightful, engaging)
- ✅ Custom React component library (not off-the-shelf)
- ✅ High-end visual language that signals quality
- ✅ Functional and accessible despite visual complexity
- ✅ Comprehensive documentation for future development

---

## 🎨 Visual Language: Liquid-Glass Metamodernism

### Core Aesthetic Principles

**1. Liquid-Glass Material System**
- **Glassmorphism foundation**: Frosted glass effects with backdrop blur
- **Depth layers**: Multiple z-index planes creating spatial hierarchy
- **Transparency gradients**: 5-15% opacity overlays with blur(20-40px)
- **Refraction effects**: Subtle light bending at component edges
- **Surface tension**: Rounded corners (12-24px) suggesting liquid surfaces

**2. Metamodern Color Philosophy**
- **Oscillation between states**: Colors shift between warm/cool, saturated/desaturated
- **Ironic sincerity**: Playful gradients that still feel professional
- **Depth through color**: Darker backgrounds (near-black) to make glass pop
- **Accent system**: Vibrant but sophisticated (not neon, not pastel)

**3. Game-Like Interaction Patterns**
- **Hover states**: Subtle lift, glow, or ripple effects
- **Click feedback**: Satisfying micro-animations (spring physics)
- **State transitions**: Smooth morphing between UI states (not instant)
- **Progress indicators**: Game-style progress bars, XP-like feedback
- **Reward moments**: Celebratory animations for completions

### Visual Hierarchy System

```
Layer 0: Deep background (near-black, #0a0a0f)
Layer 1: Primary glass surfaces (blur-xl, opacity-10)
Layer 2: Secondary glass cards (blur-lg, opacity-15)
Layer 3: Interactive elements (blur-md, opacity-20)
Layer 4: Focused/active states (blur-sm, opacity-25, glow)
Layer 5: Overlays and modals (blur-2xl, opacity-8)
```

---

## 🧩 Custom React Component Architecture

### Design System Structure

```
/design-system
  /primitives
    - Glass.tsx          # Base glass surface component
    - Blur.tsx           # Backdrop blur wrapper
    - Glow.tsx           # Glow effect component
    - Gradient.tsx       # Gradient background system
  
  /atoms
    - Button.tsx         # Game-like button with states
    - Input.tsx          # Glass input fields
    - Badge.tsx          # Status badges (not emojis)
    - Icon.tsx           # Custom icon system (not emoji)
    - Avatar.tsx         # User avatars with glass frame
  
  /molecules
    - Card.tsx           # Liquid-glass card (replaces ugly cards)
    - Modal.tsx          # Glass modal with backdrop
    - Dropdown.tsx       # Glass dropdown menu
    - Tooltip.tsx        # Floating glass tooltip
    - ProgressBar.tsx    # Game-style progress indicator
  
  /organisms
    - Navigation.tsx     # Glass navigation bar
    - Sidebar.tsx        # Collapsible glass sidebar
    - Dashboard.tsx      # Dashboard layout system
    - DataTable.tsx      # Glass data table
  
  /templates
    - AppLayout.tsx      # Main app layout
    - LandingLayout.tsx  # Website landing layout
  
  /theme
    - colors.ts          # Color system
    - spacing.ts         # Spatial rhythm
    - motion.ts          # Animation presets
    - glass.ts           # Glass effect presets
```

### Component Requirements

**Every custom component must:**
1. Support glass morphism variants (subtle, medium, strong)
2. Include hover/active/focus states with micro-animations
3. Be fully accessible (ARIA, keyboard navigation)
4. Support dark mode (primary) and light mode (secondary)
5. Have TypeScript definitions
6. Include Storybook documentation
7. Be performance-optimized (CSS transforms, GPU acceleration)

---

## 🎮 Game-Like Interaction Patterns

### Micro-Interaction Library

**Button Interactions:**
- Hover: Lift 2px, glow increase, blur intensify
- Click: Spring animation (scale 0.98 → 1.02 → 1.0)
- Success: Ripple effect + color shift
- Loading: Shimmer animation across surface

**Card Interactions:**
- Hover: Lift 4px, shadow expand, border glow
- Drag: Tilt based on cursor position (3D effect)
- Expand: Smooth morph to modal size
- Collapse: Reverse morph with ease-out

**Navigation Interactions:**
- Tab switch: Sliding glass indicator
- Page transition: Fade + slight scale
- Scroll: Parallax depth on background layers
- Menu open: Cascade animation (stagger children)

### Animation Timing System

```typescript
const motion = {
  instant: '0ms',
  fast: '150ms',
  base: '250ms',
  slow: '400ms',
  slower: '600ms',
  
  easing: {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
  }
}
```

---

## 🏗️ Technical Implementation Strategy

### Technology Stack Recommendations

**Core Framework:**
- React 18+ (with Suspense, Transitions)
- TypeScript (strict mode)
- Next.js 14+ (if SSR needed for website)

**Styling & Animation:**
- Tailwind CSS 4.0 (utility-first, custom glass utilities)
- Framer Motion (for complex animations)
- CSS Custom Properties (for theme switching)
- PostCSS (for backdrop-filter polyfills if needed)

**Component Development:**
- Storybook 8+ (component documentation)
- Radix UI primitives (accessible foundations)
- Custom styling layer (no default Radix styles)

**Performance:**
- React.memo for glass components (expensive renders)
- CSS containment for blur boundaries
- will-change hints for animated elements
- Intersection Observer for lazy animations

### Glass Effect Implementation Pattern

```typescript
// Base glass component pattern
interface GlassProps {
  variant?: 'subtle' | 'medium' | 'strong';
  blur?: number;
  opacity?: number;
  glow?: boolean;
  children: React.ReactNode;
}

const Glass: React.FC<GlassProps> = ({
  variant = 'medium',
  blur,
  opacity,
  glow = false,
  children
}) => {
  const presets = {
    subtle: { blur: 20, opacity: 0.05 },
    medium: { blur: 32, opacity: 0.10 },
    strong: { blur: 48, opacity: 0.15 },
  };
  
  const config = {
    blur: blur ?? presets[variant].blur,
    opacity: opacity ?? presets[variant].opacity,
  };
  
  return (
    <div className={cn(
      'glass-surface',
      'backdrop-blur-[var(--blur)]',
      'bg-white/[var(--opacity)]',
      'border border-white/20',
      'rounded-2xl',
      glow && 'shadow-glow'
    )}
    style={{
      '--blur': `${config.blur}px`,
      '--opacity': config.opacity,
    }}>
      {children}
    </div>
  );
};
```

---

## 📐 Design Token System

### Color Palette

**Background Layers:**
```css
--bg-deep: #0a0a0f;           /* Layer 0: Canvas */
--bg-base: #12121a;           /* Layer 1: Primary surface */
--bg-elevated: #1a1a24;       /* Layer 2: Elevated surface */
--bg-overlay: #22222e;        /* Layer 3: Overlay */
```

**Glass Tints:**
```css
--glass-neutral: rgba(255, 255, 255, 0.10);
--glass-primary: rgba(139, 92, 246, 0.15);   /* Violet tint */
--glass-success: rgba(16, 185, 129, 0.15);   /* Emerald tint */
--glass-warning: rgba(245, 158, 11, 0.15);   /* Amber tint */
--glass-danger: rgba(239, 68, 68, 0.15);     /* Red tint */
```

**Accent Colors:**
```css
--accent-primary: #8b5cf6;    /* Violet */
--accent-secondary: #06b6d4;  /* Cyan */
--accent-tertiary: #f59e0b;   /* Amber */
--accent-success: #10b981;    /* Emerald */
```

**Glow Effects:**
```css
--glow-subtle: 0 0 20px rgba(139, 92, 246, 0.3);
--glow-medium: 0 0 40px rgba(139, 92, 246, 0.5);
--glow-strong: 0 0 60px rgba(139, 92, 246, 0.7);
```

### Spacing Scale (8px base)

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-24: 6rem;    /* 96px */
```

### Typography Scale

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Border Radius Scale

```css
--radius-sm: 0.5rem;   /* 8px - small elements */
--radius-md: 0.75rem;  /* 12px - cards, buttons */
--radius-lg: 1rem;     /* 16px - large cards */
--radius-xl: 1.5rem;   /* 24px - modals */
--radius-2xl: 2rem;    /* 32px - hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 🎭 Component Specifications

### 1. Glass Card Component (Replaces Ugly Cards)

**Visual Requirements:**
- Frosted glass background with backdrop blur
- Subtle border with gradient (top lighter, bottom darker)
- Hover: Lift 4px, glow appears, blur intensifies
- Click: Spring animation feedback
- Support for header, body, footer slots

**Variants:**
- `default`: Standard glass card
- `elevated`: Stronger glass effect, higher z-index
- `interactive`: Hover effects enabled
- `flat`: Minimal glass, more subtle

**Props API:**
```typescript
interface GlassCardProps {
  variant?: 'default' | 'elevated' | 'interactive' | 'flat';
  glow?: boolean;
  glowColor?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

### 2. Game-Style Button Component

**Visual Requirements:**
- Glass surface with colored tint overlay
- Glow effect on hover (color-matched)
- Spring animation on click
- Loading state with shimmer
- Success state with ripple effect

**Variants:**
- `primary`: Violet tint, strong glow
- `secondary`: Cyan tint, medium glow
- `ghost`: Transparent, border only
- `danger`: Red tint, warning glow

**States:**
- Default, Hover, Active, Focus, Loading, Success, Disabled

**Props API:**
```typescript
interface GameButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
}
```

### 3. Status Badge Component (Replaces Emojis)

**Visual Requirements:**
- Small glass pill with colored glow
- Icon + text (no emojis)
- Pulsing animation for active states
- Subtle gradient background

**Variants:**
- `success`: Green glow
- `warning`: Amber glow
- `error`: Red glow
- `info`: Blue glow
- `neutral`: White glow

### 4. Glass Input Component

**Visual Requirements:**
- Glass surface that intensifies on focus
- Floating label animation
- Border glow on focus (color-coded for validation)
- Error state with red glow + shake animation
- Success state with green glow + checkmark

**Features:**
- Auto-complete support
- Password visibility toggle
- Character counter
- Validation feedback

### 5. Modal/Dialog Component

**Visual Requirements:**
- Full-screen backdrop with blur
- Centered glass modal with strong blur
- Slide-up + fade-in animation
- Close button with hover glow
- Escape key support

### 6. Navigation Component

**Visual Requirements:**
- Fixed glass bar at top (app) or side (dashboard)
- Active tab indicator (sliding glass pill)
- Hover states with glow
- Smooth transitions between sections

### 7. Data Visualization Cards

**Visual Requirements:**
- Glass container with chart/graph
- Animated data entry (not instant)
- Hover tooltips with glass styling
- Color-coded data points matching accent system

---

## 🎬 Animation & Motion System

### Animation Principles

1. **Purposeful Motion**: Every animation serves a function (feedback, guidance, delight)
2. **Spring Physics**: Natural, bouncy feel (not linear)
3. **Staggered Sequences**: Children animate in cascade
4. **Respect Reduced Motion**: Disable decorative animations for accessibility

### Motion Presets

```typescript
const motionPresets = {
  // Entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.25 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  
  // Interaction animations
  lift: {
    whileHover: { y: -4, transition: { duration: 0.2 } }
  },
  
  press: {
    whileTap: { scale: 0.98 }
  },
  
  glow: {
    whileHover: { 
      boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
      transition: { duration: 0.3 }
    }
  }
};
```

### Page Transition System

```typescript
const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4 }
  }
};
```

---

## 🔧 Technical Implementation Guidelines

### CSS Architecture

**Approach: Tailwind + Custom Utilities**

```css
/* Custom Tailwind utilities for glass effects */
@layer utilities {
  .glass-subtle {
    @apply backdrop-blur-xl bg-white/5 border border-white/10;
  }
  
  .glass-medium {
    @apply backdrop-blur-2xl bg-white/10 border border-white/20;
  }
  
  .glass-strong {
    @apply backdrop-blur-3xl bg-white/15 border border-white/30;
  }
  
  .glow-primary {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
  }
  
  .glow-hover {
    transition: box-shadow 0.3s ease;
  }
  
  .glow-hover:hover {
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.7);
  }
}
```

### Performance Optimization

**Critical Rules:**
1. Use `will-change: transform` sparingly (only during animation)
2. Prefer `transform` and `opacity` for animations (GPU-accelerated)
3. Use `contain: layout style paint` for glass components
4. Lazy load heavy blur effects below fold
5. Reduce blur intensity on mobile (performance)

**Mobile Considerations:**
```typescript
const isMobile = window.innerWidth < 768;
const blurAmount = isMobile ? 'blur-lg' : 'blur-2xl';
const glowIntensity = isMobile ? 0.3 : 0.5;
```

### Accessibility Requirements

**Non-Negotiable:**
- Minimum 4.5:1 contrast ratio for text on glass
- Focus indicators visible on all interactive elements
- Keyboard navigation for all components
- Screen reader announcements for state changes
- Reduced motion support (disable decorative animations)

**Testing Checklist:**
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Reduced motion respected

---

## 📱 Responsive Design Strategy

### Breakpoint System

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Adaptive Glass Effects

**Mobile (< 768px):**
- Reduce blur intensity (performance)
- Simplify animations (fewer spring effects)
- Larger touch targets (min 44px)
- Simplified hover states (tap-based)

**Tablet (768px - 1024px):**
- Medium blur intensity
- Full animation support
- Hybrid touch/mouse interactions

**Desktop (> 1024px):**
- Full blur intensity
- Complex hover states
- Parallax and 3D effects
- Multi-layer depth

---

## 🎨 Design System Documentation Structure

### Required Documentation Files

**1. Design Principles (`/docs/design-principles.md`)**
- Visual language philosophy
- Metamodern aesthetic explanation
- Game-like interaction rationale
- Accessibility commitment

**2. Component Library (`/docs/components/`)**
- One file per component
- Visual examples (screenshots or Storybook links)
- Props API documentation
- Usage examples
- Do's and Don'ts

**3. Token Reference (`/docs/tokens.md`)**
- All design tokens with visual examples
- Color swatches
- Spacing scale visualization
- Typography specimens

**4. Animation Guidelines (`/docs/motion.md`)**
- Motion principles
- Animation presets
- Timing functions
- Performance considerations

**5. Implementation Guide (`/docs/implementation.md`)**
- Setup instructions
- Tech stack rationale
- Code patterns
- Performance optimization

**6. Migration Guide (`/docs/migration-from-v2.md`)**
- How to replace old components
- Emoji → Icon mapping
- Old card → Glass card conversion
- Breaking changes

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up design token system
- [ ] Create base Glass primitive component
- [ ] Implement color and spacing utilities
- [ ] Set up Storybook environment
- [ ] Document design principles

### Phase 2: Atomic Components (Week 3-4)
- [ ] Build Button component (all variants)
- [ ] Build Input component (all states)
- [ ] Build Badge component (replaces emojis)
- [ ] Build Icon system
- [ ] Build Avatar component
- [ ] Write component documentation

### Phase 3: Molecular Components (Week 5-6)
- [ ] Build Glass Card component (replaces ugly cards)
- [ ] Build Modal/Dialog component
- [ ] Build Dropdown component
- [ ] Build Tooltip component
- [ ] Build Progress indicators
- [ ] Add animation system

### Phase 4: Organism Components (Week 7-8)
- [ ] Build Navigation component
- [ ] Build Sidebar component
- [ ] Build Dashboard layout
- [ ] Build Data Table component
- [ ] Integration testing

### Phase 5: Templates & Pages (Week 9-10)
- [ ] Create app layout templates
- [ ] Create website layout templates
- [ ] Build example pages
- [ ] Performance optimization
- [ ] Accessibility audit

### Phase 6: Migration & Polish (Week 11-12)
- [ ] Replace old components in app
- [ ] Replace old components in website
- [ ] Visual QA pass
- [ ] Performance testing
- [ ] Documentation finalization

---

## 🎯 Success Metrics

### Visual Quality
- [ ] No emojis in UI (replaced with custom icons/badges)
- [ ] All cards use glass morphism system
- [ ] Consistent depth hierarchy across all screens
- [ ] Smooth 60fps animations on desktop
- [ ] Professional, high-end aesthetic achieved

### Functionality
- [ ] All components fully accessible (WCAG AA)
- [ ] Mobile performance acceptable (30fps minimum)
- [ ] Component library documented in Storybook
- [ ] TypeScript types for all components
- [ ] Unit tests for component logic

### Developer Experience
- [ ] Clear documentation for all components
- [ ] Easy to add new components following patterns
- [ ] Design tokens centralized and maintainable
- [ ] Storybook serves as living documentation
- [ ] Migration guide helps transition from v2.0

---

## 🧠 Key Design Decisions

### Why Liquid-Glass Metamodernism?

**Metamodernism** oscillates between modernist clarity and postmodern playfulness:
- **Modern**: Clean, functional, purposeful
- **Postmodern**: Playful, ironic, self-aware
- **Metamodern**: Sincere about being playful, functional about being beautiful

**Liquid-Glass** suggests:
- Fluidity (adaptable, responsive)
- Transparency (honest, clear)
- Depth (sophisticated, layered)
- Refraction (transformative, dynamic)

### Why Game-Like Interactions?

Games have solved engagement and feedback better than any other medium:
- **Immediate feedback**: Users know their actions registered
- **Satisfying micro-moments**: Every click feels good
- **Progressive disclosure**: Complexity revealed gradually
- **Reward systems**: Positive reinforcement for actions

### Why Custom React Components?

Off-the-shelf component libraries (Material-UI, Chakra, etc.) create:
- Generic look (everyone uses them)
- Difficult customization (fighting defaults)
- Bundle bloat (unused features)
- Design constraints (limited by library)

Custom components provide:
- Unique visual identity
- Exact implementation of design vision
- Minimal bundle size (only what you need)
- Full control over behavior and styling

---

## 📋 Next Steps for Implementation

### Before Building Anything:

1. **Audit Current v2.5 State**
   - Document all existing components
   - Screenshot current UI for before/after
   - List all emoji usage to replace
   - Identify all card components to migrate

2. **Create Visual Mockups**
   - Design key screens in Figma/Sketch
   - Show glass effect examples
   - Define exact color values
   - Create animation storyboards

3. **Technical Proof of Concept**
   - Build one glass card component
   - Test performance on target devices
   - Validate accessibility
   - Confirm browser support

4. **Finalize Documentation**
   - Complete component specifications
   - Write implementation guidelines
   - Create migration plan
   - Set up project structure

### When Ready to Build:

1. Set up design system package structure
2. Implement primitives (Glass, Blur, Glow)
3. Build atoms (Button, Input, Badge, Icon)
4. Compose molecules (Card, Modal, Dropdown)
5. Create organisms (Navigation, Sidebar, Dashboard)
6. Build templates and integrate into app
7. Migrate existing screens progressively
8. Polish and optimize

---

## 🔗 Related Documentation

**To Be Created:**
- `COMPONENT_LIBRARY_SPEC.md` - Detailed component specifications
- `VISUAL_LANGUAGE_GUIDE.md` - Visual design guidelines with examples
- `ANIMATION_PLAYBOOK.md` - Animation patterns and timing
- `ACCESSIBILITY_CHECKLIST.md` - Accessibility requirements per component
- `PERFORMANCE_GUIDE.md` - Optimization strategies for glass effects
- `MIGRATION_GUIDE.md` - How to transition from v2.0 to v2.5

**Skills to Leverage from Agency Workspace:**
- `ui-designer.md` - For component visual design
- `ux-architect.md` - For interaction patterns
- `frontend-developer.md` - For React implementation
- `accessibility-auditor.md` - For WCAG compliance
- `code-reviewer.md` - For code quality
- `technical-writer.md` - For documentation

---

## 💡 Open Questions & Decisions Needed

### Design Decisions:
- [ ] Exact color palette (need brand colors?)
- [ ] Typography choices (which fonts?)
- [ ] Icon system (custom SVG set or library?)
- [ ] Illustration style (if needed)
- [ ] Logo treatment in glass system

### Technical Decisions:
- [ ] Monorepo or separate package for design system?
- [ ] Storybook hosting (where to deploy?)
- [ ] Testing strategy (Jest + RTL? Playwright?)
- [ ] Build tool (Vite? Rollup? tsup?)
- [ ] Package distribution (npm? private registry?)

### Scope Decisions:
- [ ] App and website share same design system?
- [ ] Mobile app (React Native) needs separate components?
- [ ] Admin dashboard uses same or different visual language?
- [ ] Marketing site needs different component set?

---

## 🎓 Learning Resources

### Visual Inspiration:
- Apple's design language (depth, materials, motion)
- Stripe's dashboard (sophisticated data visualization)
- Linear's UI (glass effects, smooth animations)
- Vercel's website (modern, clean, fast)
- Game UIs: Destiny 2, Halo Infinite (HUD design)

### Technical References:
- Framer Motion documentation (animation patterns)
- Radix UI primitives (accessible foundations)
- Josh Comeau's CSS courses (animation, layout)
- Tailwind CSS v4 documentation (custom utilities)
- Web.dev performance guides (optimization)

---

## 📝 Document Maintenance

**This document should be updated when:**
- Design decisions are finalized
- Component specifications are detailed
- Technical stack is confirmed
- Implementation begins (track progress)
- New patterns emerge during development

**Owner:** Design + Engineering leads  
**Review Cadence:** Weekly during active development  
**Status:** Living document - expect iteration

---

*This specification is a planning document. No code should be written until visual mockups are approved and technical decisions are finalized.*
