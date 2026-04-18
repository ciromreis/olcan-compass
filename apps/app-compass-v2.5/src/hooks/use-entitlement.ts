/**
 * useEntitlement — React hook wrapping entitlement.ts
 *
 * Usage:
 *   const { allowed, requiredPlan, rule } = useEntitlement('forge_ai_polish')
 *   if (!allowed) return <PlanGate feature="forge_ai_polish" />
 */

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { effectiveUserPlan } from '@/lib/entitlements'
import { canAccess, type FeatureKey, type EntitlementResult } from '@/lib/entitlement'
export function useEntitlement(feature: FeatureKey): EntitlementResult {
  const storedPlan = useProfileStore((s) => s.plan)
  const isPremium = useAuthStore((s) => s.user?.is_premium)
  return useMemo(
    () => canAccess(feature, effectiveUserPlan(storedPlan, isPremium)),
    [feature, storedPlan, isPremium]
  )
}

/**
 * Returns effective plan (profile + API `is_premium`) and subscription UI state.
 */
export function usePlanStatus() {
  const storedPlan = useProfileStore((s) => s.plan)
  const isPremium = useAuthStore((s) => s.user?.is_premium)
  const subscriptionStatus = useProfileStore((s) => s.subscriptionStatus)
  const plan = useMemo(
    () => effectiveUserPlan(storedPlan, isPremium),
    [storedPlan, isPremium]
  )
  return {
    plan,
    storedPlan,
    subscriptionStatus,
    isPro: plan !== 'free',
    isPremium: plan === 'premium',
  }
}
