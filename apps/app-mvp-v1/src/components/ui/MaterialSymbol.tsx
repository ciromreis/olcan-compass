import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface MaterialSymbolProps extends BaseComponentProps {
  name: string
  size?: number
}

/**
 * Material Symbols Outlined icon (webfont).
 * Ensure the font is loaded in `src/index.css`.
 */
export const MaterialSymbol = forwardRef<HTMLSpanElement, MaterialSymbolProps>(
  ({ className, name, size = 22, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('material-symbols-outlined leading-none select-none', className)}
        style={{ fontSize: size }}
        aria-hidden="true"
        {...props}
      >
        {name}
      </span>
    )
  }
)

MaterialSymbol.displayName = 'MaterialSymbol'

