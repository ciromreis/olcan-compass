# MMXD UI Component Library

This directory contains the Metamodern Design System (MMXD) component library for Olcan Compass. All components follow design tokens defined in `src/design-tokens.json` and support psychological state-driven UI adaptation.

## Usage

Import components from the barrel export:

```typescript
import { Button, Card, Input, Typography } from '@/components/ui'
```

## Component Conventions

### 1. TypeScript Strict Mode

All components use TypeScript strict mode with full type safety:

```typescript
import { ComponentProps, BaseComponentProps } from '@/components/ui'

interface MyComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function MyComponent({ className, variant = 'primary', ...props }: MyComponentProps) {
  // Implementation
}
```

### 2. Design Token Integration

Use the token utilities for consistent styling:

```typescript
import { getColor, getSpacing, getAnimationDuration } from '@/lib/tokens'

const primaryColor = getColor('lumina', '200')
const spacing = getSpacing('md')
const duration = getAnimationDuration('normal')
```

### 3. Tailwind Class Composition

Use the `cn()` utility for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  disabled && 'disabled-classes',
  className
)} />
```

### 4. Accessibility

All interactive components must include:
- Keyboard navigation support
- ARIA attributes for screen readers
- Focus indicators with sufficient contrast
- Semantic HTML elements

```typescript
<button
  aria-label="Submit form"
  aria-disabled={disabled}
  tabIndex={disabled ? -1 : 0}
>
  Submit
</button>
```

### 5. Responsive Design

Use mobile-first approach with Tailwind breakpoints:

```typescript
<div className="flex flex-col md:flex-row lg:gap-lg">
  {/* Mobile: column, Desktop: row */}
</div>
```

### 6. Animation

Use Framer Motion for complex animations, CSS transitions for simple states:

```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.25 }}
>
  Content
</motion.div>
```

Respect `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.1 }}
>
  Content
</motion.div>
```

### 7. UI Mode Support (Map/Forge)

Components that adapt to psychological state should accept `uiMode` prop:

```typescript
interface AdaptiveComponentProps extends UIModeSupportProps {
  // other props
}

export function AdaptiveComponent({ uiMode = 'map', ...props }: AdaptiveComponentProps) {
  return (
    <div className={cn(
      'base-classes',
      uiMode === 'map' && 'high-density-classes',
      uiMode === 'forge' && 'minimalist-classes'
    )}>
      {/* Content */}
    </div>
  )
}
```

### 8. Loading States

Interactive components should support loading states:

```typescript
interface ButtonProps extends LoadingProps, DisabledProps {
  // other props
}

export function Button({ loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading ? <LoadingSpinner /> : children}
    </button>
  )
}
```

### 9. Error Handling

Form components should support validation states:

```typescript
interface InputProps extends ValidationProps {
  // other props
}

export function Input({ error, errorMessage, helperText, ...props }: InputProps) {
  return (
    <div>
      <input
        aria-invalid={error}
        aria-describedby={error ? 'error-message' : 'helper-text'}
        {...props}
      />
      {error && <span id="error-message">{errorMessage}</span>}
      {!error && helperText && <span id="helper-text">{helperText}</span>}
    </div>
  )
}
```

### 10. Portuguese-First Microcopy

All text content should be in Portuguese (pt-BR) with Alchemical voice:

```typescript
// Good: Prophetic + ironic, empowering without toxic positivity
const microcopy = {
  success: 'Sua jornada avança. Continue.',
  error: 'Algo não funcionou. Vamos tentar de novo?',
  empty: 'Nada aqui ainda. Que tal começar?'
}

// Avoid: Generic, corporate, or overly enthusiastic
const avoid = {
  success: 'Parabéns! Você é incrível!',
  error: 'Erro fatal do sistema',
  empty: 'Sem dados'
}
```

## Component Structure

```
ui/
├── README.md                 # This file
├── index.ts                  # Barrel export
├── types.ts                  # Shared type patterns
├── Button.tsx                # Base components
├── Card.tsx
├── Input.tsx
├── Progress.tsx
├── Typography.tsx
└── [future components]
```

## Testing

All components should include:
- Unit tests for logic and variants
- Accessibility tests (keyboard nav, ARIA, contrast)
- Responsive behavior tests
- Visual regression tests for design token changes

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct variant classes', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-lumina')
  })

  it('supports keyboard navigation', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })
})
```

## Design Tokens Reference

### Colors
- **Void**: Dark navy background (`#001338`, `#001A4D`, `#002266`)
- **Lux**: Silver accents (`#E8EDF4`, `#D4DCE8`, `#B8C4D8`)
- **Lumina**: Blue interactive elements (`#93C5FD`, `#60A5FA`, `#3B82F6`)
- **Neutral**: Gray scale (`800` to `100`)
- **Semantic**: Success, Warning, Error, Mirror

### Typography
- **Heading**: Merriweather Sans (700, 600)
- **Body**: Source Sans 3 (400)
- **Mono**: JetBrains Mono (400)

### Spacing
- `xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px
- `xl`: 32px, `2xl`: 48px, `3xl`: 64px, `4xl`: 96px

### Animation
- **Duration**: fast (150ms), normal (250ms), slow (350ms)
- **Easing**: cubic-bezier functions for smooth transitions

## Resources

- Design tokens: `src/design-tokens.json`
- Token utilities: `src/lib/tokens.ts`
- Class utilities: `src/lib/utils.ts`
- Type patterns: `src/components/ui/types.ts`
