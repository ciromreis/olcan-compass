/**
 * Accessibility utilities for keyboard navigation and focus management
 */

/**
 * Focus trap for modals and overlays
 * Keeps focus within a container element
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when trap activates
    firstElement?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [containerRef, isActive])
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Get focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

/**
 * Check if element is visible and focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  if (element.tabIndex < 0) return false

  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return false

  return true
}

/**
 * Restore focus to previously focused element
 */
export function useFocusReturn() {
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    previousFocusRef.current?.focus()
  }

  return { saveFocus, restoreFocus }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * Handle keyboard navigation for lists
 */
export function handleListKeyboardNavigation(
  e: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onIndexChange: (index: number) => void,
  onSelect?: (index: number) => void
) {
  switch (e.key) {
    case KeyboardKeys.ARROW_DOWN:
      e.preventDefault()
      onIndexChange(Math.min(currentIndex + 1, itemCount - 1))
      break
    case KeyboardKeys.ARROW_UP:
      e.preventDefault()
      onIndexChange(Math.max(currentIndex - 1, 0))
      break
    case KeyboardKeys.HOME:
      e.preventDefault()
      onIndexChange(0)
      break
    case KeyboardKeys.END:
      e.preventDefault()
      onIndexChange(itemCount - 1)
      break
    case KeyboardKeys.ENTER:
    case KeyboardKeys.SPACE:
      e.preventDefault()
      onSelect?.(currentIndex)
      break
  }
}

// Re-export React for the hooks
import React from 'react'
