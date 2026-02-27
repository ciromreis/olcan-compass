/**
 * Component Library Type Patterns and Conventions
 * 
 * This file establishes TypeScript patterns for all UI components in the MMXD library.
 * All components should follow these conventions for consistency and type safety.
 */

import { ReactNode, ComponentPropsWithoutRef } from 'react'

/**
 * Base props that all UI components should extend
 */
export interface BaseComponentProps {
  /** Additional CSS classes to apply */
  className?: string
  /** Child elements */
  children?: ReactNode
  /** Test ID for testing purposes */
  'data-testid'?: string
}

/**
 * Common size variants used across components
 */
export type Size = 'sm' | 'md' | 'lg'

/**
 * Common color variants for semantic states
 */
export type SemanticVariant = 'default' | 'success' | 'warning' | 'error' | 'mirror'

/**
 * Common visual variants for components
 */
export type VisualVariant = 'primary' | 'secondary' | 'ghost' | 'outline'

/**
 * Loading state props for interactive components
 */
export interface LoadingProps {
  /** Whether the component is in a loading state */
  loading?: boolean
  /** Custom loading text or element */
  loadingText?: ReactNode
}

/**
 * Disabled state props for interactive components
 */
export interface DisabledProps {
  /** Whether the component is disabled */
  disabled?: boolean
}

/**
 * Props for components that can be rendered as different HTML elements
 */
export interface PolymorphicProps<T extends React.ElementType = 'div'> {
  /** The element type to render as */
  as?: T
}

/**
 * Helper type to merge component props with HTML element props
 * Usage: ComponentProps<'button'> & MyCustomProps
 */
export type ComponentProps<T extends keyof JSX.IntrinsicElements> = 
  ComponentPropsWithoutRef<T> & BaseComponentProps

/**
 * Helper type for components with children
 */
export interface WithChildren {
  children: ReactNode
}

/**
 * Helper type for components with optional children
 */
export interface WithOptionalChildren {
  children?: ReactNode
}

/**
 * Props for components that support click interactions
 */
export interface ClickableProps {
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void
  /** Whether the component is clickable */
  clickable?: boolean
}

/**
 * Props for components with icon support
 */
export interface WithIcon {
  /** Icon element to display */
  icon?: ReactNode
  /** Icon position relative to content */
  iconPosition?: 'left' | 'right'
}

/**
 * Props for form components with validation
 */
export interface ValidationProps {
  /** Whether the field has an error */
  error?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Helper text to display */
  helperText?: string
  /** Whether the field is required */
  required?: boolean
}

/**
 * Props for components with animation support
 */
export interface AnimationProps {
  /** Whether to animate the component */
  animate?: boolean
  /** Animation duration override */
  animationDuration?: 'fast' | 'normal' | 'slow'
}

/**
 * Props for components that support Map/Forge UI modes
 */
export interface UIModeSupportProps {
  /** Current UI mode (Map = high-density, Forge = minimalist) */
  uiMode?: 'map' | 'forge'
}

/**
 * Props for components with psychological adaptation
 */
export interface PsychAdaptiveProps {
  /** Psychological profile context for UI adaptation */
  psychProfile?: {
    anxiety: number
    agency: number
  }
}

/**
 * Helper to extract variant types from a const object
 * Usage: const variants = { primary: '...', secondary: '...' } as const
 *        type Variant = ExtractVariant<typeof variants>
 */
export type ExtractVariant<T> = keyof T

/**
 * Helper to create discriminated union types for component variants
 * Ensures type safety when different variants have different props
 */
export type VariantProps<
  TVariant extends string,
  TProps extends Record<TVariant, unknown>
> = {
  [K in TVariant]: { variant: K } & TProps[K]
}[TVariant]

/**
 * Helper type for ref forwarding
 */
export type ForwardedRef<T> = React.ForwardedRef<T>

/**
 * Common ARIA props for accessibility
 */
export interface AriaProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-hidden'?: boolean
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-live'?: 'polite' | 'assertive' | 'off'
  role?: string
}

/**
 * Props for components with responsive behavior
 */
export interface ResponsiveProps {
  /** Hide on mobile viewports */
  hideOnMobile?: boolean
  /** Hide on desktop viewports */
  hideOnDesktop?: boolean
}

/**
 * Props for components with theme support
 */
export interface ThemeProps {
  /** Color theme variant */
  theme?: 'void' | 'lux' | 'lumina' | 'neutral'
}
