/**
 * Gamification Integration Provider - Olcan Compass v2.5
 * 
 * This component wires all domain events to the gamification system.
 * Migrated to use the Aura store and MMXD event system.
 */

'use client'

import { useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'
import { useAuraStore, type AuraEvent } from '@/stores/auraStore'
import { useGamificationStore, type GamificationEvent } from '@/stores/eventDrivenGamificationStore'

export function GamificationIntegration() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // 1. Initialize gamification system
    useGamificationStore.getState().initializeGamification()

    // 2. Subscribe to Aura events → gamification
    const unsubscribeAura = useAuraStore
      .getState()
      .onAuraEvent((event: AuraEvent) => {
        // Map AuraEvent to whatever handleCompanionEvent expects if needed
        // For now, assuming compatibility as they share the same base structure
        useGamificationStore.getState().handleCompanionEvent(event as any)
      })

    // 3. Subscribe to gamification events → UI celebrations
    const unsubscribeGamification = useGamificationStore
      .getState()
      .onGamificationEvent((event: GamificationEvent) => {
        // Gamification events are handled by the celebration system
        // No logging needed in production
      })

    return () => {
      unsubscribeAura()
      unsubscribeGamification()
    }
  }, [])

  return null
}

export function useProductGamification() {
  return {
    emitDocumentCreated: () => {
      useGamificationStore.getState().handleProductEvent('document.created', {})
    },
    emitInterviewCompleted: (score?: number) => {
      useGamificationStore.getState().handleProductEvent('interview.completed', { score })
    },
    emitApplicationSubmitted: () => {
      useGamificationStore.getState().handleProductEvent('application.submitted', {})
    },
    emitRouteSelected: (routeId: string) => {
      useGamificationStore.getState().handleProductEvent('route.selected', { routeId })
    },
    emitMilestoneCompleted: (milestoneId: string) => {
      useGamificationStore.getState().handleProductEvent('route.milestone.completed', { milestoneId })
    },
    emitServiceBooked: (providerId: string) => {
      useGamificationStore.getState().handleProductEvent('marketplace.booking.created', { providerId })
    },
    emitReviewSubmitted: () => {
      useGamificationStore.getState().handleProductEvent('marketplace.review.submitted', {})
    },
    emitGuildJoined: (guildId: string) => {
      useGamificationStore.getState().handleProductEvent('guild.joined', { guildId })
    },
    emitBattleParticipated: (won: boolean) => {
      useGamificationStore.getState().handleProductEvent(
        won ? 'battle.won' : 'battle.participated',
        {}
      )
    },
    emitActiveDay: () => {
      useGamificationStore.getState().handleProductEvent('user.active_day', {})
    },
  }
}

export function useGamificationEvents(
  callback: (event: GamificationEvent) => void
) {
  useEffect(() => {
    return useGamificationStore.getState().onGamificationEvent(callback)
  }, [callback])
}

/**
 * Debugger component to monitor gamification state
 */
export function GamificationDebugger() {
  // Hook must be called unconditionally — guard happens after
  const progress = useGamificationStore((state) => state.userProgress)

  if (process.env.NODE_ENV === 'production') return null
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 rounded-2xl bg-ink-950/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl font-display text-caption uppercase tracking-widest">
      <div className="flex items-center gap-2 mb-2 text-gold-500">
        <Zap className="w-4 h-4" />
        DEBUG AURA
      </div>
      <div>LV.{progress.level} ({progress.totalXP} XP)</div>
    </div>
  )
}
