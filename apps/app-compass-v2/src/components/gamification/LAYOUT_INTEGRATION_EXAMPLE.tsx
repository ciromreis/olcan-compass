/**
 * App Layout with Gamification Integration
 * 
 * This is an EXAMPLE showing how to integrate the gamification system
 * at the layout level so all pages have access to event-driven gamification.
 * 
 * Copy this pattern to your actual layout.tsx file at:
 * /apps/app-compass-v2/src/app/(app)/layout.tsx
 */

'use client'

import { ReactNode } from 'react'
import { GamificationIntegration, GamificationDebugger } from '@/components/gamification'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayoutWithGamification({ children }: AppLayoutProps) {
  return (
    <>
      {/* 
        GamificationIntegration wires all domain events to the gamification store.
        Place it once at the layout level so all pages benefit from it.
      */}
      <GamificationIntegration />
      
      {/* 
        Optional: Debug overlay for development.
        Remove or conditionally render in production.
      */}
      {process.env.NODE_ENV === 'development' && <GamificationDebugger />}
      
      {/* Your existing layout content */}
      <div className="min-h-screen bg-surface-bg">
        {/* ... your sidebar/header components ... */}
        
        <main className="flex-1">
          {children}
        </main>
        
        {/* ... your footer components ... */}
      </div>
    </>
  )
}

/**
 * ALTERNATIVE: Per-Page Integration
 * 
 * If you prefer to enable gamification only on specific pages,
 * add GamificationIntegration to each page instead of the layout:
 * 
 * ```tsx
 * // In your page.tsx files
 * import { GamificationIntegration } from '@/components/gamification'
 * 
 * export default function MyPage() {
 *   return (
 *     <>
 *       <GamificationIntegration />
 *       <div>Your page content</div>
 *     </>
 *   )
 * }
 * ```
 */
