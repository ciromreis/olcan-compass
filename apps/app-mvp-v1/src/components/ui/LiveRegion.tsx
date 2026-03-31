import { useEffect, useRef } from 'react'

export interface LiveRegionProps {
  /** Message to announce */
  message: string
  /** Politeness level */
  politeness?: 'polite' | 'assertive'
  /** Whether to clear after announcing */
  clearAfter?: number
}

/**
 * Live region for screen reader announcements
 * Used for dynamic content updates
 */
export function LiveRegion({ message, politeness = 'polite', clearAfter = 1000 }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message || !ref.current) return

    ref.current.textContent = message

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = ''
        }
      }, clearAfter)
      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  )
}
