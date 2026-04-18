# Design System: Motion and Animation Patterns

> **Document:** Motion Design Specification
> **Version:** 1.0.0 | **Last Updated:** March 2026

## Motion Philosophy

### Metamodern Motion Principles

**Purposeful, Not Decorative**
- Every animation serves a functional purpose
- Motion guides attention and understanding
- Transitions reveal relationships between elements
- Animations provide feedback and confirmation

**Liquid Physics**
- Smooth, organic easing curves
- Fluid state transitions
- Natural acceleration and deceleration
- Subtle spring physics for premium feel

**Performance First**
- GPU-accelerated properties only (transform, opacity)
- 60fps minimum on all devices
- Respect prefers-reduced-motion
- Lazy load complex animations

## Animation Duration System

### Duration Scale

```css
:root {
  --duration-instant: 0ms;      /* Immediate feedback */
  --duration-fast: 150ms;       /* Micro-interactions */
  --duration-normal: 300ms;     /* Standard transitions */
  --duration-slow: 500ms;       /* Emphasis animations */
  --duration-slower: 800ms;     /* Complex sequences */
  --duration-slowest: 1200ms;   /* Hero animations */
}
```

### Duration Usage Guidelines

**Instant (0ms):**
- Theme switching
- Reduced motion preference
- Immediate state changes

**Fast (150ms):**
- Button hover states
- Icon color changes
- Tooltip appearances
- Focus indicators

**Normal (300ms):**
- Card hover elevations
- Modal open/close
- Dropdown menus
- Tab switching

**Slow (500ms):**
- Page transitions
- Complex state changes
- Multi-step animations
- Archetype evolution effects

**Slower (800ms):**
- Hero section reveals
- Onboarding sequences
- Achievement celebrations

**Slowest (1200ms):**
- Full-page transitions
- Digimon evolution sequences
- Major milestone animations

## Easing Functions

### Easing Curve Library

```css
:root {
  /* Standard Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Custom Easings */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-swift: cubic-bezier(0.55, 0, 0.1, 1);
  --ease-liquid: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Spring Physics (for Framer Motion) */
  --spring-gentle: { type: 'spring', stiffness: 100, damping: 15 };
  --spring-bouncy: { type: 'spring', stiffness: 300, damping: 20 };
  --spring-snappy: { type: 'spring', stiffness: 400, damping: 25 };
}
```

### Easing Usage Guidelines

**Ease-Out (Default):**
- Element entering viewport
- Hover states
- Expanding elements
- Most UI transitions

**Ease-In:**
- Element leaving viewport
- Collapsing elements
- Dismissing notifications

**Ease-In-Out:**
- Continuous animations
- Looping effects
- Bidirectional transitions

**Bounce:**
- Success confirmations
- Achievement unlocks
- Playful interactions
- Evolution moments

**Liquid:**
- Glass surface transitions
- Morphing shapes
- Fluid state changes
- Premium interactions

## Core Animation Patterns

### Fade Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

/* Fade In Up (Entrance) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out);
}

/* Fade Out Down (Exit) */
@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.fade-out-down {
  animation: fadeOutDown var(--duration-normal) var(--ease-in);
}
```

### Scale Animations

```css
/* Scale In (Entrance) */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-out);
}

/* Pulse (Attention) */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.pulse {
  animation: pulse var(--duration-slow) var(--ease-in-out) infinite;
}
```

### Slide Animations

```css
/* Slide In Right (Sidebar) */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

/* Slide Down (Dropdown) */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down {
  animation: slideDown var(--duration-fast) var(--ease-out);
}
```

### Glow Animations

```css
/* Glow Pulse (Archetype) */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--archetype-color-alpha-20);
  }
  50% {
    box-shadow: 0 0 40px var(--archetype-color-alpha-40);
  }
}

.glow-pulse {
  animation: glowPulse var(--duration-slower) var(--ease-in-out) infinite;
}

/* Flame Glow (CTA) */
@keyframes flameGlow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(232, 66, 26, 0.3),
      0 0 40px rgba(232, 66, 26, 0.15);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(232, 66, 26, 0.5),
      0 0 60px rgba(232, 66, 26, 0.25),
      0 0 90px rgba(232, 66, 26, 0.1);
  }
}

.flame-glow {
  animation: flameGlow var(--duration-slower) var(--ease-in-out) infinite;
}
```

## Micro-Interactions

### Button Interactions

```css
.btn {
  transition: 
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
  transition-duration: var(--duration-instant);
}

/* Loading state */
.btn.loading::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin var(--duration-slow) linear infinite;
  margin-left: var(--spacing-component-xs);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Card Interactions

```css
.card {
  transition: 
    transform var(--duration-normal) var(--ease-liquid),
    box-shadow var(--duration-normal) var(--ease-liquid),
    background var(--duration-normal) var(--ease-liquid);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card.interactive:active {
  transform: translateY(-2px);
}
```

### Input Interactions

```css
.input {
  transition: 
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.input:focus {
  border-color: var(--input-border-focus);
  box-shadow: var(--input-shadow-focus);
}

/* Character counter animation */
.char-counter {
  transition: color var(--duration-fast) var(--ease-out);
}

.char-counter.warning {
  color: var(--color-warning);
  animation: pulse var(--duration-slow) var(--ease-in-out) infinite;
}

.char-counter.error {
  color: var(--color-error);
  animation: shake var(--duration-normal) var(--ease-bounce);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

## Page Transitions

### Route Transition Pattern

```css
/* Page enter animation */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: 
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

/* Page exit animation */
.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: 
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-fast) var(--ease-in);
}
```

### Framer Motion Variants

```typescript
// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1]
    }
  }
};

// Stagger children animation
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

## Complex Animation Sequences

### Archetype Evolution Animation

**Sequence:**
1. Card scales up (1.05x) with glow intensification
2. Icon morphs to next evolution stage
3. Color transitions to new archetype color
4. Particle effects burst outward
5. Card settles back with new state

**Framer Motion Implementation:**
```typescript
export const evolutionSequence = {
  initial: { scale: 1, filter: 'brightness(1)' },
  evolving: {
    scale: [1, 1.05, 1.05, 1],
    filter: [
      'brightness(1)',
      'brightness(1.2)',
      'brightness(1.2)',
      'brightness(1)'
    ],
    transition: {
      duration: 1.2,
      times: [0, 0.3, 0.7, 1],
      ease: 'easeInOut'
    }
  }
};
```

### Loading Skeleton Animation

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer var(--duration-slower) linear infinite;
}
```

### Success Celebration Animation

```typescript
// Confetti burst on achievement
export const celebrationVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      ease: [0.68, -0.55, 0.265, 1.55]
    }
  }
};

// Checkmark draw animation
export const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut' },
      opacity: { duration: 0.2 }
    }
  }
};
```

## Interaction Feedback Patterns

### Hover Feedback

**Standard Hover:**
```css
.interactive {
  transition: transform var(--duration-fast) var(--ease-out);
}

.interactive:hover {
  transform: translateY(-2px);
}
```

**Glass Surface Hover:**
```css
.glass-interactive {
  transition: 
    transform var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.glass-interactive:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow-lg);
}
```

### Click Feedback

**Ripple Effect:**
```css
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--color-hover-overlay);
  transform: translate(-50%, -50%);
  transition: width var(--duration-normal), height var(--duration-normal);
}

.ripple:active::after {
  width: 300px;
  height: 300px;
}
```

### Focus Feedback

```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  transition: outline-offset var(--duration-fast) var(--ease-out);
}

:focus-visible:hover {
  outline-offset: 4px;
}
```

## Loading States

### Spinner Animations

```css
/* Standard Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border-primary);
  border-right-color: var(--color-brand-primary);
  border-radius: 50%;
  animation: spin var(--duration-slow) linear infinite;
}

/* Dots Loader */
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

.dots-loader {
  display: flex;
  gap: var(--spacing-component-xs);
}

.dots-loader span {
  width: 8px;
  height: 8px;
  background: var(--color-brand-primary);
  border-radius: 50%;
  animation: dotPulse var(--duration-slow) ease-in-out infinite;
}

.dots-loader span:nth-child(2) {
  animation-delay: 0.15s;
}

.dots-loader span:nth-child(3) {
  animation-delay: 0.3s;
}
```

### Progress Indicators

```css
/* Linear Progress Bar */
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-brand-primary);
  transition: width var(--duration-normal) var(--ease-out);
}

/* Circular Progress */
@keyframes circularProgress {
  0% { stroke-dashoffset: 283; }
  100% { stroke-dashoffset: 0; }
}

.circular-progress {
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  animation: circularProgress var(--duration-slower) var(--ease-out) forwards;
}
```

### Skeleton Screens

```css
.skeleton-text {
  height: 1em;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  animation: shimmer var(--duration-slower) linear infinite;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  animation: shimmer var(--duration-slower) linear infinite;
}

.skeleton-card {
  height: 200px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  animation: shimmer var(--duration-slower) linear infinite;
}
```

## Scroll-Based Animations

### Parallax Scrolling

```typescript
// Framer Motion scroll-linked animation
import { useScroll, useTransform } from 'framer-motion';

export const ParallaxSection = ({ children }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  
  return (
    <motion.div style={{ y, opacity }}>
      {children}
    </motion.div>
  );
};
```

### Scroll Reveal

```typescript
// Reveal on scroll into viewport
export const scrollRevealVariants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1]
    }
  }
};

// Usage with Intersection Observer
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={scrollRevealVariants}
>
  {content}
</motion.div>
```

### Sticky Header Behavior

```css
.navbar {
  position: sticky;
  top: 0;
  transition: 
    background var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    backdrop-filter var(--duration-normal) var(--ease-out);
}

.navbar.scrolled {
  background: var(--nav-bg);
  backdrop-filter: blur(var(--nav-blur));
  box-shadow: var(--nav-shadow);
}
```

## Modal and Overlay Animations

### Modal Enter/Exit

```typescript
// Modal animation variants
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

// Backdrop animation
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### Dropdown Menu Animation

```typescript
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: [0, 0, 0.2, 1]
    }
  }
};
```

## Gesture Animations

### Swipe Gestures

```typescript
// Swipe to dismiss (mobile)
import { motion, PanInfo } from 'framer-motion';

export const swipeToDismiss = {
  drag: "x",
  dragConstraints: { left: 0, right: 0 },
  dragElastic: 0.2,
  onDragEnd: (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Dismiss action
    }
  }
};
```

### Pull to Refresh

```typescript
export const pullToRefreshVariants = {
  idle: { y: 0 },
  pulling: { y: 60 },
  refreshing: { 
    y: 60,
    transition: { duration: 0.3 }
  },
  complete: {
    y: 0,
    transition: { duration: 0.3 }
  }
};
```

## Reduced Motion Support

### Accessibility Override

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Preserve essential feedback */
  .btn:hover {
    transform: none;
    /* Keep color/shadow changes */
  }
  
  .card:hover {
    transform: none;
    /* Keep elevation changes */
  }
}
```

### Reduced Motion Variants

```typescript
// Conditional animation based on user preference
import { useReducedMotion } from 'framer-motion';

export const useAdaptiveAnimation = () => {
  const shouldReduceMotion = useReducedMotion();
  
  return shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
};
```

## Performance Optimization

### GPU Acceleration

```css
/* Force GPU acceleration for smooth animations */
.will-animate {
  will-change: transform, opacity;
}

/* Remove will-change after animation */
.animated {
  will-change: auto;
}
```

### Animation Budget

**Per Page Limits:**
- Maximum 5 simultaneous animations
- Maximum 3 infinite animations
- Total animation weight < 100ms per frame

**Optimization Techniques:**
- Use transform and opacity only
- Avoid animating width, height, top, left
- Debounce scroll-based animations
- Lazy load complex animations

---

**Next Document:** DESIGN_SYSTEM_OIOS_INTEGRATION.md - OIOS archetype visual language
