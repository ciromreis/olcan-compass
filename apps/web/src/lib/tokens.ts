/**
 * Design Token Utilities
 * 
 * TypeScript utilities to consume design-tokens.json with type safety.
 * Provides typed accessors for colors, typography, spacing, and animations.
 */

import tokens from '../design-tokens.json'

// Type definitions for design tokens
export type ColorCategory = keyof typeof tokens.colors
export type VoidShade = keyof typeof tokens.colors.void
export type LuxShade = keyof typeof tokens.colors.lux
export type LuminaShade = keyof typeof tokens.colors.lumina
export type NeutralShade = keyof typeof tokens.colors.neutral
export type SemanticColor = keyof typeof tokens.colors.semantic
export type SpacingSize = keyof typeof tokens.spacing
export type TransitionDuration = keyof typeof tokens.transitions
export type TypographyScale = keyof typeof tokens.typography.scale
export type FontFamily = keyof typeof tokens.typography.fonts

/**
 * Get a color value from the design tokens
 * @param category - Color category (void, lux, lumina, neutral, semantic)
 * @param shade - Specific shade within the category (optional for semantic colors)
 * @returns Hex color string
 */
export function getColor(category: 'void', shade: VoidShade): string
export function getColor(category: 'lux', shade: LuxShade): string
export function getColor(category: 'lumina', shade: LuminaShade): string
export function getColor(category: 'neutral', shade: NeutralShade): string
export function getColor(category: 'semantic', shade: SemanticColor): string
export function getColor(category: ColorCategory, shade?: string): string {
  if (!shade) {
    throw new Error(`Shade is required for color category: ${category}`)
  }
  
  const colorGroup = tokens.colors[category] as Record<string, string>
  const color = colorGroup[shade]
  
  if (!color) {
    throw new Error(`Color not found: ${category}.${shade}`)
  }
  
  return color
}

/**
 * Get a spacing value from the design tokens
 * @param size - Spacing size (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
 * @returns Spacing value as string (e.g., "16px")
 */
export function getSpacing(size: SpacingSize): string {
  const spacing = tokens.spacing[size]
  
  if (!spacing) {
    throw new Error(`Spacing not found: ${size}`)
  }
  
  return spacing
}

/**
 * Get a font family from the design tokens
 * @param family - Font family type (heading, body, mono)
 * @returns Font family name
 */
export function getFontFamily(family: FontFamily): string {
  const font = tokens.typography.fonts[family]
  
  if (!font) {
    throw new Error(`Font family not found: ${family}`)
  }
  
  return font
}

/**
 * Get typography scale values for a specific variant
 * @param variant - Typography variant (h1, h2, h3, h4, body-large, body, body-sm, caption)
 * @param viewport - Viewport size (desktop or mobile)
 * @returns Typography configuration object
 */
export function getTypography(
  variant: TypographyScale,
  viewport: 'desktop' | 'mobile' = 'desktop'
): {
  size: string
  weight: string
  lineHeight: string
} {
  const scale = tokens.typography.scale[variant] as any
  
  if (!scale) {
    throw new Error(`Typography variant not found: ${variant}`)
  }
  
  return {
    size: scale[viewport],
    weight: scale.fontWeight,
    lineHeight: scale.lineHeight
  }
}

/**
 * Get a transition duration from the design tokens
 * @param duration - Duration type (fast, base, slow, slower)
 * @returns Duration value as string (e.g., "250ms")
 */
export function getTransitionDuration(duration: TransitionDuration): string {
  const value = tokens.transitions[duration]
  
  if (!value) {
    throw new Error(`Transition duration not found: ${duration}`)
  }
  
  return value
}

/**
 * Export raw tokens for direct access when needed
 */
export const designTokens = tokens

/**
 * Helper to convert spacing size to numeric value (in pixels)
 * @param size - Spacing size
 * @returns Numeric value in pixels
 */
export function getSpacingValue(size: SpacingSize): number {
  const spacing = getSpacing(size)
  return parseInt(spacing.replace('px', ''), 10)
}

/**
 * Helper to convert transition duration to numeric value (in milliseconds)
 * @param duration - Duration type
 * @returns Numeric value in milliseconds
 */
export function getTransitionDurationValue(duration: TransitionDuration): number {
  const value = getTransitionDuration(duration)
  return parseInt(value.replace('ms', ''), 10)
}
