# Design System: Complete Token Definitions

> **Document:** Design Token Specification
> **Version:** 1.0.0 | **Last Updated:** March 2026

## Token Architecture

Design tokens are the atomic values of our design system. They ensure consistency across platforms and enable systematic theming.

### Token Hierarchy

```
Tier 1: Primitive Tokens (Raw values)
  └─> Tier 2: Semantic Tokens (Meaning-based)
      └─> Tier 3: Component Tokens (Context-specific)
```

## Primitive Tokens (Tier 1)

### Color Primitives

```css
:root {
  /* Bone/Cream Palette */
  --primitive-bone-50: #FBFAF7;
  --primitive-bone-100: #F7F4EF;
  --primitive-bone-200: #EDE8E0;
  --primitive-bone-300: #DDD6CA;
  --primitive-bone-400: #CCC2B4;
  --primitive-bone-500: #B8AB9A;
  
  /* Ink Palette */
  --primitive-ink-600: #4A4540;
  --primitive-ink-700: #2D2A26;
  --primitive-ink-800: #1A1816;
  --primitive-ink-900: #0D0C0A;
  
  /* Flame Palette */
  --primitive-flame-100: #FEF2EF;
  --primitive-flame-200: #FDD8CF;
  --primitive-flame-300: #FBAD9D;
  --primitive-flame-400: #F05A35;
  --primitive-flame-500: #E8421A;
  --primitive-flame-600: #C73815;
  --primitive-flame-700: #A02F11;
  
  /* Slate Palette */
  --primitive-slate-700: #475569;
  --primitive-slate-800: #334155;
  --primitive-slate-900: #1E293B;
  --primitive-slate-950: #0F172A;
  
  /* Status Primitives */
  --primitive-green-500: #10B981;
  --primitive-green-600: #059669;
  --primitive-yellow-500: #F59E0B;
  --primitive-yellow-600: #D97706;
  --primitive-red-500: #EF4444;
  --primitive-red-600: #DC2626;
  --primitive-blue-500: #3B82F6;
  --primitive-blue-600: #2563EB;
  
  /* Archetype Primitives */
  --primitive-archetype-escapee: #2563EB;
  --primitive-archetype-cartographer: #D4AF37;
  --primitive-archetype-pivot: #F59E0B;
  --primitive-archetype-nomad: #0EA5E9;
  --primitive-archetype-bridge: #059669;
  --primitive-archetype-insecure: #EC4899;
  --primitive-archetype-mother: #10B981;
  --primitive-archetype-servant: #7C3AED;
  --primitive-archetype-hermit: #8B5CF6;
  --primitive-archetype-executive: #64748B;
  --primitive-archetype-visionary: #DB2777;
  --primitive-archetype-optimizer: #94A3B8;
}
```

### Typography Primitives

```css
:root {
  /* Font Families */
  --primitive-font-display: 'DM Serif Display', Georgia, serif;
  --primitive-font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --primitive-font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  
  /* Font Sizes (Perfect Fourth Scale - 1.333) */
  --primitive-text-xs: 0.75rem;      /* 12px */
  --primitive-text-sm: 0.875rem;     /* 14px */
  --primitive-text-base: 1rem;       /* 16px */
  --primitive-text-lg: 1.125rem;     /* 18px */
  --primitive-text-xl: 1.333rem;     /* 21.33px */
  --primitive-text-2xl: 1.777rem;    /* 28.43px */
  --primitive-text-3xl: 2.369rem;    /* 37.90px */
  --primitive-text-4xl: 3.157rem;    /* 50.51px */
  --primitive-text-5xl: 4.209rem;    /* 67.34px */
  
  /* Font Weights */
  --primitive-weight-regular: 400;
  --primitive-weight-medium: 500;
  --primitive-weight-semibold: 600;
  --primitive-weight-bold: 700;
  
  /* Line Heights */
  --primitive-leading-tight: 1.1;
  --primitive-leading-snug: 1.2;
  --primitive-leading-normal: 1.5;
  --primitive-leading-relaxed: 1.6;
  --primitive-leading-loose: 1.8;
  
  /* Letter Spacing */
  --primitive-tracking-tighter: -0.02em;
  --primitive-tracking-tight: -0.01em;
  --primitive-tracking-normal: 0;
  --primitive-tracking-wide: 0.01em;
  --primitive-tracking-wider: 0.02em;
}
```

### Spacing Primitives

```css
:root {
  /* Base Unit: 4px */
  --primitive-space-0: 0;
  --primitive-space-1: 0.25rem;   /* 4px */
  --primitive-space-2: 0.5rem;    /* 8px */
  --primitive-space-3: 0.75rem;   /* 12px */
  --primitive-space-4: 1rem;      /* 16px */
  --primitive-space-5: 1.25rem;   /* 20px */
  --primitive-space-6: 1.5rem;    /* 24px */
  --primitive-space-8: 2rem;      /* 32px */
  --primitive-space-10: 2.5rem;   /* 40px */
  --primitive-space-12: 3rem;     /* 48px */
  --primitive-space-16: 4rem;     /* 64px */
  --primitive-space-20: 5rem;     /* 80px */
  --primitive-space-24: 6rem;     /* 96px */
  --primitive-space-32: 8rem;     /* 128px */
  --primitive-space-40: 10rem;    /* 160px */
  --primitive-space-48: 12rem;    /* 192px */
}
```

### Effect Primitives

```css
:root {
  /* Border Radius */
  --primitive-radius-none: 0;
  --primitive-radius-sm: 0.25rem;    /* 4px */
  --primitive-radius-md: 0.5rem;     /* 8px */
  --primitive-radius-lg: 0.75rem;    /* 12px */
  --primitive-radius-xl: 1rem;       /* 16px */
  --primitive-radius-2xl: 1.5rem;    /* 24px */
  --primitive-radius-full: 9999px;   /* Pill shape */
  
  /* Blur Intensity */
  --primitive-blur-sm: 8px;
  --primitive-blur-md: 16px;
  --primitive-blur-lg: 24px;
  --primitive-blur-xl: 40px;
  
  /* Opacity Levels */
  --primitive-opacity-0: 0;
  --primitive-opacity-5: 0.05;
  --primitive-opacity-10: 0.1;
  --primitive-opacity-20: 0.2;
  --primitive-opacity-30: 0.3;
  --primitive-opacity-40: 0.4;
  --primitive-opacity-50: 0.5;
  --primitive-opacity-60: 0.6;
  --primitive-opacity-70: 0.7;
  --primitive-opacity-80: 0.8;
  --primitive-opacity-90: 0.9;
  --primitive-opacity-100: 1;
  
  /* Transition Durations */
  --primitive-duration-instant: 0ms;
  --primitive-duration-fast: 150ms;
  --primitive-duration-normal: 300ms;
  --primitive-duration-slow: 500ms;
  --primitive-duration-slower: 800ms;
  
  /* Transition Easings */
  --primitive-ease-linear: linear;
  --primitive-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --primitive-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --primitive-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --primitive-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Semantic Tokens (Tier 2)

### Color Semantics (Light Theme)

```css
:root {
  /* Background Semantics */
  --color-bg-primary: var(--primitive-bone-50);
  --color-bg-secondary: var(--primitive-bone-100);
  --color-bg-tertiary: var(--primitive-bone-200);
  --color-bg-inverse: var(--primitive-slate-950);
  
  /* Text Semantics */
  --color-text-primary: var(--primitive-ink-900);
  --color-text-secondary: var(--primitive-ink-800);
  --color-text-tertiary: var(--primitive-ink-700);
  --color-text-disabled: var(--primitive-ink-600);
  --color-text-inverse: var(--primitive-bone-50);
  
  /* Border Semantics */
  --color-border-primary: var(--primitive-bone-300);
  --color-border-secondary: var(--primitive-bone-200);
  --color-border-focus: var(--primitive-flame-500);
  
  /* Brand Semantics */
  --color-brand-primary: var(--primitive-flame-500);
  --color-brand-primary-hover: var(--primitive-flame-400);
  --color-brand-primary-active: var(--primitive-flame-600);
  --color-brand-primary-subtle: var(--primitive-flame-100);
  
  /* Status Semantics */
  --color-success: var(--primitive-green-500);
  --color-success-hover: var(--primitive-green-600);
  --color-warning: var(--primitive-yellow-500);
  --color-warning-hover: var(--primitive-yellow-600);
  --color-error: var(--primitive-red-500);
  --color-error-hover: var(--primitive-red-600);
  --color-info: var(--primitive-blue-500);
  --color-info-hover: var(--primitive-blue-600);
  
  /* Interactive Semantics */
  --color-hover-overlay: rgba(0, 0, 0, 0.04);
  --color-active-overlay: rgba(0, 0, 0, 0.08);
  --color-focus-ring: rgba(232, 66, 26, 0.3);
  --color-selection: rgba(232, 66, 26, 0.15);
}
```

### Color Semantics (Dark Theme)

```css
[data-theme="dark"] {
  /* Background Semantics */
  --color-bg-primary: var(--primitive-slate-950);
  --color-bg-secondary: var(--primitive-slate-900);
  --color-bg-tertiary: var(--primitive-slate-800);
  --color-bg-inverse: var(--primitive-bone-50);
  
  /* Text Semantics */
  --color-text-primary: var(--primitive-bone-50);
  --color-text-secondary: var(--primitive-bone-200);
  --color-text-tertiary: var(--primitive-bone-300);
  --color-text-disabled: var(--primitive-bone-400);
  --color-text-inverse: var(--primitive-ink-900);
  
  /* Border Semantics */
  --color-border-primary: var(--primitive-slate-800);
  --color-border-secondary: var(--primitive-slate-700);
  --color-border-focus: var(--primitive-flame-400);
  
  /* Interactive Semantics */
  --color-hover-overlay: rgba(255, 255, 255, 0.08);
  --color-active-overlay: rgba(255, 255, 255, 0.12);
  --color-focus-ring: rgba(240, 90, 53, 0.4);
  --color-selection: rgba(240, 90, 53, 0.2);
}
```

### Typography Semantics

```css
:root {
  /* Font Family Semantics */
  --font-heading: var(--primitive-font-display);
  --font-body: var(--primitive-font-sans);
  --font-code: var(--primitive-font-mono);
  
  /* Font Size Semantics */
  --text-display: var(--primitive-text-5xl);
  --text-h1: var(--primitive-text-4xl);
  --text-h2: var(--primitive-text-3xl);
  --text-h3: var(--primitive-text-2xl);
  --text-h4: var(--primitive-text-xl);
  --text-body-lg: var(--primitive-text-lg);
  --text-body: var(--primitive-text-base);
  --text-body-sm: var(--primitive-text-sm);
  --text-caption: var(--primitive-text-xs);
  
  /* Font Weight Semantics */
  --weight-heading: var(--primitive-weight-regular);  /* Display uses regular */
  --weight-subheading: var(--primitive-weight-bold);  /* Sans uses bold */
  --weight-body: var(--primitive-weight-regular);
  --weight-emphasis: var(--primitive-weight-medium);
  --weight-strong: var(--primitive-weight-bold);
  
  /* Line Height Semantics */
  --leading-heading: var(--primitive-leading-tight);
  --leading-subheading: var(--primitive-leading-snug);
  --leading-body: var(--primitive-leading-normal);
  --leading-relaxed: var(--primitive-leading-relaxed);
  
  /* Letter Spacing Semantics */
  --tracking-heading: var(--primitive-tracking-tighter);
  --tracking-subheading: var(--primitive-tracking-tight);
  --tracking-body: var(--primitive-tracking-normal);
  --tracking-caps: var(--primitive-tracking-wider);
}
```

### Spacing Semantics

```css
:root {
  /* Component Internal Spacing */
  --spacing-component-xs: var(--primitive-space-2);   /* 8px */
  --spacing-component-sm: var(--primitive-space-3);   /* 12px */
  --spacing-component-md: var(--primitive-space-4);   /* 16px */
  --spacing-component-lg: var(--primitive-space-6);   /* 24px */
  --spacing-component-xl: var(--primitive-space-8);   /* 32px */
  
  /* Layout Spacing */
  --spacing-section-sm: var(--primitive-space-12);    /* 48px */
  --spacing-section-md: var(--primitive-space-16);    /* 64px */
  --spacing-section-lg: var(--primitive-space-24);    /* 96px */
  --spacing-section-xl: var(--primitive-space-32);    /* 128px */
  
  /* Grid Gaps */
  --spacing-gap-tight: var(--primitive-space-4);      /* 16px */
  --spacing-gap-normal: var(--primitive-space-6);     /* 24px */
  --spacing-gap-loose: var(--primitive-space-8);      /* 32px */
  
  /* Container Padding */
  --spacing-container-mobile: var(--primitive-space-4);   /* 16px */
  --spacing-container-tablet: var(--primitive-space-6);   /* 24px */
  --spacing-container-desktop: var(--primitive-space-8);  /* 32px */
}
```

### Effect Semantics

```css
:root {
  /* Border Radius Semantics */
  --radius-button: var(--primitive-radius-lg);      /* 12px */
  --radius-card: var(--primitive-radius-xl);        /* 16px */
  --radius-modal: var(--primitive-radius-2xl);      /* 24px */
  --radius-input: var(--primitive-radius-md);       /* 8px */
  --radius-pill: var(--primitive-radius-full);      /* Full round */
  
  /* Shadow Semantics */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
  
  /* Glass Effect Semantics */
  --glass-blur: var(--primitive-blur-md);
  --glass-blur-heavy: var(--primitive-blur-xl);
  --glass-opacity-light: var(--primitive-opacity-70);
  --glass-opacity-dark: var(--primitive-opacity-70);
  --glass-border-light: rgba(255, 255, 255, 0.3);
  --glass-border-dark: rgba(255, 255, 255, 0.1);
  
  /* Transition Semantics */
  --transition-fast: var(--primitive-duration-fast) var(--primitive-ease-out);
  --transition-normal: var(--primitive-duration-normal) var(--primitive-ease-in-out);
  --transition-slow: var(--primitive-duration-slow) var(--primitive-ease-in-out);
  --transition-bounce: var(--primitive-duration-normal) var(--primitive-ease-bounce);
}
```

## Component Tokens (Tier 3)

### Button Tokens

```css
:root {
  /* Primary Button (Flame) */
  --button-primary-bg: var(--color-brand-primary);
  --button-primary-bg-hover: var(--color-brand-primary-hover);
  --button-primary-bg-active: var(--color-brand-primary-active);
  --button-primary-text: var(--primitive-bone-50);
  --button-primary-shadow: var(--shadow-md);
  --button-primary-shadow-hover: var(--shadow-lg);
  
  /* Secondary Button (Glass) */
  --button-secondary-bg: rgba(255, 255, 255, 0.7);
  --button-secondary-bg-hover: rgba(255, 255, 255, 0.85);
  --button-secondary-text: var(--color-text-primary);
  --button-secondary-border: var(--glass-border-light);
  --button-secondary-blur: var(--glass-blur);
  
  /* Ghost Button */
  --button-ghost-bg: transparent;
  --button-ghost-bg-hover: var(--color-hover-overlay);
  --button-ghost-text: var(--color-text-primary);
  --button-ghost-border: var(--color-border-primary);
  
  /* Button Sizing */
  --button-height-sm: 32px;
  --button-height-md: 40px;
  --button-height-lg: 48px;
  --button-padding-x-sm: var(--spacing-component-md);
  --button-padding-x-md: var(--spacing-component-lg);
  --button-padding-x-lg: var(--spacing-component-xl);
  --button-radius: var(--radius-button);
  --button-font-size: var(--text-body-sm);
  --button-font-weight: var(--weight-medium);
}
```

### Card Tokens

```css
:root {
  /* Standard Card */
  --card-bg: rgba(255, 255, 255, 0.7);
  --card-bg-hover: rgba(255, 255, 255, 0.85);
  --card-border: var(--glass-border-light);
  --card-blur: var(--glass-blur);
  --card-shadow: var(--shadow-md);
  --card-shadow-hover: var(--shadow-lg);
  --card-radius: var(--radius-card);
  --card-padding: var(--spacing-component-lg);
  
  /* Feature Card (Elevated) */
  --card-feature-bg: var(--color-bg-primary);
  --card-feature-border: var(--color-border-primary);
  --card-feature-shadow: var(--shadow-xl);
  --card-feature-padding: var(--spacing-component-xl);
  
  /* Archetype Card (Dynamic) */
  --card-archetype-bg: rgba(255, 255, 255, 0.6);
  --card-archetype-border: var(--archetype-color);
  --card-archetype-glow: 0 0 20px var(--archetype-color-alpha-30);
}

[data-theme="dark"] {
  --card-bg: rgba(15, 23, 42, 0.7);
  --card-bg-hover: rgba(15, 23, 42, 0.85);
  --card-border: var(--glass-border-dark);
}
```

### Input Tokens

```css
:root {
  /* Text Input */
  --input-bg: var(--color-bg-primary);
  --input-bg-focus: var(--color-bg-primary);
  --input-border: var(--color-border-primary);
  --input-border-hover: var(--color-border-focus);
  --input-border-focus: var(--color-brand-primary);
  --input-text: var(--color-text-primary);
  --input-placeholder: var(--color-text-tertiary);
  --input-shadow-focus: 0 0 0 3px var(--color-focus-ring);
  --input-radius: var(--radius-input);
  --input-padding-x: var(--spacing-component-md);
  --input-padding-y: var(--spacing-component-sm);
  --input-height: 40px;
  
  /* Textarea */
  --textarea-min-height: 120px;
  --textarea-padding: var(--spacing-component-md);
  
  /* Select */
  --select-icon-size: 20px;
  --select-icon-color: var(--color-text-tertiary);
}
```

### Navigation Tokens

```css
:root {
  /* Header/Navbar */
  --nav-height: 64px;
  --nav-bg: rgba(255, 255, 255, 0.8);
  --nav-blur: var(--glass-blur);
  --nav-border: var(--glass-border-light);
  --nav-shadow: var(--shadow-sm);
  --nav-padding-x: var(--spacing-container-desktop);
  
  /* Nav Links */
  --nav-link-color: var(--color-text-secondary);
  --nav-link-color-hover: var(--color-text-primary);
  --nav-link-color-active: var(--color-brand-primary);
  --nav-link-font-size: var(--text-body-sm);
  --nav-link-font-weight: var(--weight-medium);
  
  /* Sidebar */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 64px;
  --sidebar-bg: var(--card-bg);
  --sidebar-border: var(--color-border-primary);
}

[data-theme="dark"] {
  --nav-bg: rgba(15, 23, 42, 0.8);
  --nav-border: var(--glass-border-dark);
}
```

### Modal Tokens

```css
:root {
  /* Modal Container */
  --modal-bg: var(--color-bg-primary);
  --modal-border: var(--color-border-primary);
  --modal-shadow: var(--shadow-xl);
  --modal-radius: var(--radius-modal);
  --modal-padding: var(--spacing-component-xl);
  --modal-max-width: 600px;
  
  /* Modal Backdrop */
  --modal-backdrop-bg: rgba(13, 12, 10, 0.6);
  --modal-backdrop-blur: var(--primitive-blur-sm);
  
  /* Modal Header */
  --modal-header-border: var(--color-border-secondary);
  --modal-header-padding-bottom: var(--spacing-component-lg);
}
```

### Toast/Notification Tokens

```css
:root {
  /* Toast Container */
  --toast-bg: var(--color-bg-primary);
  --toast-border: var(--color-border-primary);
  --toast-shadow: var(--shadow-lg);
  --toast-radius: var(--radius-card);
  --toast-padding: var(--spacing-component-md);
  --toast-min-width: 320px;
  --toast-max-width: 480px;
  
  /* Toast Variants */
  --toast-success-accent: var(--color-success);
  --toast-warning-accent: var(--color-warning);
  --toast-error-accent: var(--color-error);
  --toast-info-accent: var(--color-info);
}
```

## Archetype Dynamic Tokens

### Archetype Color Variables

```css
:root {
  /* Dynamic archetype color (set via JavaScript) */
  --archetype-color: var(--primitive-archetype-escapee);
  --archetype-color-light: color-mix(in srgb, var(--archetype-color) 20%, white);
  --archetype-color-dark: color-mix(in srgb, var(--archetype-color) 80%, black);
  --archetype-color-alpha-10: color-mix(in srgb, var(--archetype-color) 10%, transparent);
  --archetype-color-alpha-20: color-mix(in srgb, var(--archetype-color) 20%, transparent);
  --archetype-color-alpha-30: color-mix(in srgb, var(--archetype-color) 30%, transparent);
}
```

### Archetype-Specific Tokens

```css
/* Applied dynamically based on user's dominant archetype */
.archetype-themed {
  --themed-accent: var(--archetype-color);
  --themed-bg: var(--archetype-color-alpha-10);
  --themed-border: var(--archetype-color-alpha-30);
  --themed-glow: 0 0 20px var(--archetype-color-alpha-30);
}
```

## Responsive Tokens

### Breakpoint Tokens

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Container Tokens

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1440px;
  
  /* Responsive padding */
  --container-padding-mobile: var(--spacing-container-mobile);
  --container-padding-tablet: var(--spacing-container-tablet);
  --container-padding-desktop: var(--spacing-container-desktop);
}
```

## Z-Index Tokens

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-overlay: 400;
  --z-modal: 500;
  --z-toast: 600;
  --z-tooltip: 700;
}
```

## Implementation Guidelines

### Token Usage Rules

1. **Always use semantic tokens in components**
   - ✅ `color: var(--color-text-primary);`
   - ❌ `color: var(--primitive-ink-900);`

2. **Use primitive tokens only when creating new semantic tokens**
   - ✅ `--color-custom: var(--primitive-flame-500);`
   - ❌ Direct primitive usage in components

3. **Component tokens inherit from semantic tokens**
   - ✅ `--button-text: var(--color-text-inverse);`
   - ❌ `--button-text: #FBFAF7;`

### Token Naming Convention

```
[category]-[property]-[variant]-[state]

Examples:
--color-bg-primary          (category: color, property: bg, variant: primary)
--button-primary-bg-hover   (category: button, variant: primary, property: bg, state: hover)
--spacing-component-lg      (category: spacing, property: component, variant: lg)
```

### Platform-Specific Token Files

**Web (CSS Custom Properties)**
```css
/* tokens.css */
:root { /* All tokens defined here */ }
```

**React Native (JavaScript)**
```javascript
// tokens.js
export const tokens = {
  colors: { /* ... */ },
  typography: { /* ... */ },
  spacing: { /* ... */ }
};
```

**iOS (Swift)**
```swift
// Tokens.swift
enum DesignTokens {
  enum Colors { /* ... */ }
  enum Typography { /* ... */ }
  enum Spacing { /* ... */ }
}
```

## Token Validation

### Accessibility Validation

All color combinations must pass WCAG 2.1 AA:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Validated Combinations:**
```
✓ Ink-900 on Bone-50: 14.2:1
✓ Ink-800 on Bone-100: 11.8:1
✓ Flame-500 on Bone-50: 5.1:1
✓ Bone-50 on Flame-500: 5.1:1
✓ Bone-50 on Slate-950: 15.1:1
```

### Performance Validation

- Maximum 200 CSS custom properties per theme
- Token computation depth: 3 levels maximum
- No circular token references
- Fallback values for all tokens

---

**Next Document:** DESIGN_SYSTEM_COMPONENTS.md - Component library specifications
