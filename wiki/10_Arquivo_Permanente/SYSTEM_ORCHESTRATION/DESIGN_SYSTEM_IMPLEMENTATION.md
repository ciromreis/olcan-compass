# Design System: Technical Implementation Guide

> **Document:** Implementation Specification
> **Version:** 1.0.0 | **Last Updated:** March 2026

## Technology Stack

### Frontend Framework: Next.js 14 (App Router)

**Why Next.js 14:**
- Server Components for performance
- App Router for modern routing
- Built-in optimization (images, fonts)
- Edge runtime support
- TypeScript native

### Styling: Tailwind CSS v4 + CSS Custom Properties

**Why This Combination:**
- Tailwind for rapid development
- CSS variables for dynamic theming
- Best of utility-first and semantic CSS
- Easy archetype color switching
- Performance optimized

### Animation: Framer Motion

**Why Framer Motion:**
- Declarative animation API
- Spring physics built-in
- Gesture support
- Layout animations
- Server Component compatible

### Icons: Lucide React

**Why Lucide:**
- 1000+ consistent icons
- Tree-shakeable
- Customizable stroke width
- TypeScript support
- No emoji dependency

## Project Structure

### Monorepo Architecture

```
olcan-compass/
├── apps/
│   ├── web/                    # Marketing website (Next.js)
│   ├── app/                    # SaaS application (Next.js)
│   └── docs/                   # Documentation site
├── packages/
│   ├── ui/                     # Shared component library
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── styles/         # CSS and tokens
│   │   │   ├── animations/     # Framer Motion variants
│   │   │   └── utils/          # Helper functions
│   │   └── package.json
│   ├── config/                 # Shared configs (TS, ESLint, Tailwind)
│   └── types/                  # Shared TypeScript types
├── docs/
│   └── v2.5/                   # Design system documentation
└── package.json                # Root package.json
```

### Component Library Structure

```
packages/ui/src/
├── components/
│   ├── primitives/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   └── index.ts
│   ├── composites/
│   │   ├── Navbar/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   └── index.ts
│   ├── patterns/
│   │   ├── NarrativeForge/
│   │   ├── ArchetypeCard/
│   │   ├── MentorCard/
│   │   └── index.ts
│   └── index.ts
├── styles/
│   ├── tokens.css              # Design tokens
│   ├── globals.css             # Global styles
│   ├── animations.css          # Keyframe animations
│   └── utilities.css           # Utility classes
├── animations/
│   ├── variants.ts             # Framer Motion variants
│   └── hooks.ts                # Animation hooks
└── utils/
    ├── archetype-theme.ts      # Archetype theming
    └── cn.ts                   # Class name utility
```

## Design Token Implementation

### CSS Custom Properties File

**File:** `packages/ui/src/styles/tokens.css`

```css
:root {
  /* Primitive Tokens */
  --primitive-bone-50: #FBFAF7;
  --primitive-bone-100: #F7F4EF;
  --primitive-ink-900: #0D0C0A;
  --primitive-flame-500: #E8421A;
  --primitive-slate-950: #0F172A;
  
  /* Semantic Tokens */
  --color-bg-primary: var(--primitive-bone-50);
  --color-text-primary: var(--primitive-ink-900);
  --color-brand-primary: var(--primitive-flame-500);
  
  /* Component Tokens */
  --button-primary-bg: var(--color-brand-primary);
  --card-bg: rgba(255, 255, 255, 0.7);
  
  /* Archetype Dynamic Tokens */
  --archetype-color: var(--primitive-flame-500);
  --archetype-color-alpha-10: color-mix(in srgb, var(--archetype-color) 10%, transparent);
  --archetype-color-alpha-20: color-mix(in srgb, var(--archetype-color) 20%, transparent);
  --archetype-color-alpha-30: color-mix(in srgb, var(--archetype-color) 30%, transparent);
}

[data-theme="dark"] {
  --color-bg-primary: var(--primitive-slate-950);
  --color-text-primary: var(--primitive-bone-50);
  --card-bg: rgba(15, 23, 42, 0.7);
}
```

### Tailwind Configuration

**File:** `packages/config/tailwind.config.js`

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bone: {
          50: '#FBFAF7',
          100: '#F7F4EF',
          200: '#EDE8E0',
          300: '#DDD6CA'
        },
        ink: {
          600: '#4A4540',
          700: '#2D2A26',
          800: '#1A1816',
          900: '#0D0C0A'
        },
        flame: {
          100: '#FEF2EF',
          400: '#F05A35',
          500: '#E8421A',
          600: '#C73815'
        },
        slate: {
          700: '#475569',
          800: '#334155',
          900: '#1E293B',
          950: '#0F172A'
        }
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.333rem',
        '2xl': '1.777rem',
        '3xl': '2.369rem',
        '4xl': '3.157rem',
        '5xl': '4.209rem'
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem'
      },
      backdropBlur: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '40px'
      }
    }
  },
  plugins: []
};
```

## Component Implementation Patterns

### Button Component

**File:** `packages/ui/src/components/primitives/Button/Button.tsx`

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all';
    
    const variantStyles = {
      primary: 'bg-flame-500 text-bone-50 hover:bg-flame-400 active:bg-flame-600 shadow-md hover:shadow-lg',
      secondary: 'bg-white/70 backdrop-blur-md text-ink-900 border border-white/30 hover:bg-white/85',
      ghost: 'bg-transparent text-ink-900 hover:bg-ink-900/5',
      danger: 'bg-red-500 text-white hover:bg-red-600'
    };
    
    const sizeStyles = {
      sm: 'h-8 px-4 text-sm',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base'
    };
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
```

### Glass Card Component

**File:** `packages/ui/src/components/primitives/Card/Card.tsx`

```typescript
import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'feature' | 'archetype';
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'standard',
      hoverable = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all';
    
    const variantStyles = {
      standard: 'bg-white/70 backdrop-blur-md border border-white/30 shadow-md',
      feature: 'bg-bone-50 border border-bone-300 shadow-xl',
      archetype: 'bg-white/60 backdrop-blur-md border-2 border-[var(--archetype-color)] shadow-[0_0_20px_var(--archetype-color-alpha-30)]'
    };
    
    const paddingStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    
    const Component = hoverable ? motion.div : 'div';
    const motionProps = hoverable ? {
      whileHover: { y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    } : {};
    
    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          hoverable && 'cursor-pointer',
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
```


### Archetype Theme Manager

**File:** `packages/ui/src/utils/archetype-theme.ts`

```typescript
export type OIOSArchetype = 
  | 'institutional_escapee'
  | 'scholarship_cartographer'
  | 'career_pivot'
  | 'global_nomad'
  | 'technical_bridge_builder'
  | 'insecure_corporate_dev'
  | 'exhausted_solo_mother'
  | 'trapped_public_servant'
  | 'academic_hermit'
  | 'executive_refugee'
  | 'creative_visionary'
  | 'lifestyle_optimizer';

export type EvolutionStage = 'rookie' | 'champion' | 'ultimate';

export type FearCluster = 'competence' | 'rejection' | 'loss' | 'irreversibility';

const ARCHETYPE_COLORS: Record<OIOSArchetype, string> = {
  institutional_escapee: '#2563EB',
  scholarship_cartographer: '#D4AF37',
  career_pivot: '#F59E0B',
  global_nomad: '#0EA5E9',
  technical_bridge_builder: '#059669',
  insecure_corporate_dev: '#EC4899',
  exhausted_solo_mother: '#10B981',
  trapped_public_servant: '#7C3AED',
  academic_hermit: '#8B5CF6',
  executive_refugee: '#64748B',
  creative_visionary: '#DB2777',
  lifestyle_optimizer: '#94A3B8'
};

const STAGE_PROPERTIES: Record<EvolutionStage, {
  opacity: string;
  iconSize: string;
  glowIntensity: string;
}> = {
  rookie: { opacity: '0.4', iconSize: '32px', glowIntensity: '0.15' },
  champion: { opacity: '1', iconSize: '48px', glowIntensity: '0.3' },
  ultimate: { opacity: '1', iconSize: '64px', glowIntensity: '0.5' }
};

export class ArchetypeThemeManager {
  applyTheme(archetype: OIOSArchetype, stage: EvolutionStage) {
    const root = document.documentElement;
    const color = ARCHETYPE_COLORS[archetype];
    const stageProps = STAGE_PROPERTIES[stage];
    
    // Set archetype color
    root.style.setProperty('--archetype-color', color);
    
    // Set stage properties
    root.style.setProperty('--stage-color-opacity', stageProps.opacity);
    root.style.setProperty('--stage-icon-size', stageProps.iconSize);
    root.style.setProperty('--stage-glow-intensity', stageProps.glowIntensity);
    
    // Apply body classes
    document.body.className = `archetype-${archetype} stage-${stage}`;
  }
  
  getArchetypeColor(archetype: OIOSArchetype): string {
    return ARCHETYPE_COLORS[archetype];
  }
}

// React hook for archetype theming
export function useArchetypeTheme(archetype: OIOSArchetype, stage: EvolutionStage) {
  useEffect(() => {
    const manager = new ArchetypeThemeManager();
    manager.applyTheme(archetype, stage);
  }, [archetype, stage]);
}
```

### Theme Toggle Component

**File:** `packages/ui/src/components/composites/ThemeToggle/ThemeToggle.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) setTheme(stored);
  }, []);
  
  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };
  
  return (
    <div className="inline-flex items-center bg-bone-100 dark:bg-slate-900 border border-bone-300 dark:border-slate-800 rounded-full p-1">
      <ThemeButton
        active={theme === 'light'}
        onClick={() => applyTheme('light')}
        icon={<Sun size={16} />}
        label="Light"
      />
      <ThemeButton
        active={theme === 'dark'}
        onClick={() => applyTheme('dark')}
        icon={<Moon size={16} />}
        label="Dark"
      />
      <ThemeButton
        active={theme === 'system'}
        onClick={() => applyTheme('system')}
        icon={<Monitor size={16} />}
        label="System"
      />
    </div>
  );
}

function ThemeButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        active 
          ? 'text-bone-50 bg-flame-500' 
          : 'text-ink-700 hover:text-ink-900 dark:text-bone-300 dark:hover:text-bone-50'
      )}
      whileTap={{ scale: 0.95 }}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </motion.button>
  );
}
```

## Glass Effect Implementation

### Backdrop Filter Utility

**File:** `packages/ui/src/styles/utilities.css`

```css
/* Glass Surface Utilities */
.glass-light {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-frosted {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Glow Utilities */
.glow-soft {
  box-shadow: 0 0 20px rgba(232, 66, 26, 0.15);
}

.glow-flame {
  box-shadow: 
    0 0 30px rgba(232, 66, 26, 0.3),
    0 0 60px rgba(232, 66, 26, 0.15);
}

.glow-archetype {
  box-shadow: 
    0 0 20px var(--archetype-color-alpha-30),
    0 0 40px var(--archetype-color-alpha-15);
}
```

### Tailwind Glass Plugin

**File:** `packages/config/tailwind-glass-plugin.js`

```javascript
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  addUtilities({
    '.glass-light': {
      'background': 'rgba(255, 255, 255, 0.7)',
      'backdrop-filter': 'blur(16px) saturate(180%)',
      'border': '1px solid rgba(255, 255, 255, 0.3)'
    },
    '.glass-dark': {
      'background': 'rgba(15, 23, 42, 0.7)',
      'backdrop-filter': 'blur(16px) saturate(180%)',
      'border': '1px solid rgba(255, 255, 255, 0.1)'
    },
    '.glass-frosted': {
      'background': 'rgba(255, 255, 255, 0.5)',
      'backdrop-filter': 'blur(40px) saturate(200%)',
      'border': '1px solid rgba(255, 255, 255, 0.2)'
    }
  });
});
```

## Animation Implementation

### Framer Motion Variants Library

**File:** `packages/ui/src/animations/variants.ts`

```typescript
import { Variants } from 'framer-motion';

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
  }
};

// Stagger children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Modal animations
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  }
};

// Archetype evolution
export const evolutionVariants: Variants = {
  initial: { scale: 1, filter: 'brightness(1)' },
  evolving: {
    scale: [1, 1.1, 1.05, 1],
    filter: [
      'brightness(1)',
      'brightness(1.5)',
      'brightness(1.3)',
      'brightness(1)'
    ],
    transition: {
      duration: 1.5,
      times: [0, 0.3, 0.7, 1],
      ease: [0.68, -0.55, 0.265, 1.55]
    }
  }
};

// Scroll reveal
export const scrollRevealVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }
};
```

### Custom Animation Hooks

**File:** `packages/ui/src/animations/hooks.ts`

```typescript
import { useReducedMotion } from 'framer-motion';
import { Variants } from 'framer-motion';

// Adaptive animation based on user preference
export function useAdaptiveAnimation(
  fullAnimation: Variants,
  reducedAnimation: Variants
): Variants {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ? reducedAnimation : fullAnimation;
}

// Scroll-triggered animation
export function useScrollReveal() {
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-100px' }
  };
}

// Stagger animation for lists
export function useStaggerAnimation(staggerDelay: number = 0.1) {
  return {
    variants: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: staggerDelay }
      }
    }
  };
}
```

## Responsive Implementation

### Breakpoint Hooks

**File:** `packages/ui/src/utils/use-breakpoint.ts`

```typescript
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else if (width < 1280) setBreakpoint('desktop');
      else setBreakpoint('large');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
```

## Performance Optimization

### Image Optimization

**Next.js Image Component Usage:**
```typescript
import Image from 'next/image';

// Optimized archetype spirit image
<Image
  src="/spirits/institutional-escapee.svg"
  alt="Institutional Escapee Spirit"
  width={64}
  height={64}
  priority={false}
  loading="lazy"
/>
```

### Font Loading Strategy

**File:** `apps/web/app/layout.tsx`

```typescript
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Animation Performance

**GPU Acceleration:**
```css
/* Force GPU acceleration for animated elements */
.will-animate {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Remove after animation completes */
.animated {
  will-change: auto;
}
```

**Intersection Observer for Scroll Animations:**
```typescript
import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => callback(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [callback, options]);
  
  return ref;
}
```

## Accessibility Implementation

### Focus Management

**File:** `packages/ui/src/utils/focus-trap.ts`

```typescript
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstElement.focus();
  
  return () => element.removeEventListener('keydown', handleTabKey);
}
```

### ARIA Labels and Announcements

```typescript
// Screen reader announcement utility
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

// Usage in components
import { announce } from '@/utils/accessibility';

function handleSave() {
  // ... save logic
  announce('Document saved successfully', 'polite');
}
```

## Testing Strategy

### Component Testing

**File:** `packages/ui/src/components/primitives/Button/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-flame-500');
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('disables when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('meets accessibility standards', () => {
    render(<Button>Accessible</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Accessible');
  });
});
```

### Visual Regression Testing

**Storybook Configuration:**
```typescript
// .storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/react-vite'
};
```

**Component Story:**
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...'
  }
};
```

## Build and Deployment

### Build Configuration

**File:** `packages/ui/package.json`

```json
{
  "name": "@olcan/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "lint": "eslint src/",
    "test": "vitest",
    "storybook": "storybook dev -p 6006"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0"
  }
}
```

### CSS Build Process

**PostCSS Configuration:**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {} : false
  }
};
```

## Documentation Standards

### Component Documentation Template

```typescript
/**
 * Button Component
 * 
 * A customizable button component with multiple variants and states.
 * Supports loading states, icons, and full accessibility.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 * 
 * @example With icon
 * ```tsx
 * <Button variant="secondary" icon={<ArrowRight />} iconPosition="right">
 *   Continue
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...);
```

### Storybook Documentation

Each component must have:
- Overview and purpose
- All variants demonstrated
- Interactive controls
- Accessibility notes
- Code examples
- Do's and don'ts

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Set up monorepo structure
- Create design token system
- Implement base CSS architecture
- Set up Tailwind configuration

### Phase 2: Primitives (Week 2)
- Build Button, Input, Card components
- Implement glass effects
- Create animation variants
- Set up Storybook

### Phase 3: Composites (Week 3)
- Build Navbar, Modal, Toast
- Implement theme toggle
- Create archetype theme manager
- Add responsive behaviors

### Phase 4: Patterns (Week 4)
- Build NarrativeForge components
- Create ArchetypeCard
- Implement MentorCard
- Add complex animations

### Phase 5: Integration (Week 5)
- Integrate with existing v2 app
- Migrate pages incrementally
- Test across devices
- Performance optimization

### Phase 6: Polish (Week 6)
- Refine animations
- Accessibility audit
- Visual QA
- Documentation completion

---

**Implementation Complete:** All design system documents created and ready for development
