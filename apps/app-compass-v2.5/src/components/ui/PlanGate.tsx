"use client"

/**
 * PlanGate — Blocks UI behind a plan requirement.
 *
 * Usage (full-page gate):
 *   <PlanGate feature="forge_ai_polish">
 *     <ForgeAIPanel />
 *   </PlanGate>
 *
 * Usage (inline lock badge — no children needed):
 *   <PlanGate feature="forge_coach" inline />
 */

import { type ReactNode } from 'react'
import Link from 'next/link'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useEntitlement } from '@/hooks/use-entitlement'
import { type FeatureKey, PLAN_LABELS, PLAN_PRICES, nextPlan } from '@/lib/entitlement'
import { useProfileStore } from '@/stores/profile'
import { cn } from '@/lib/utils'

interface PlanGateProps {
  feature: FeatureKey
  /** When true, renders a compact lock icon inline instead of a full block */
  inline?: boolean
  /** Content to show when plan allows the feature */
  children?: ReactNode
  /** Custom message for the upgrade prompt */
  message?: string
  className?: string
}

export function PlanGate({
  feature,
  inline = false,
  children,
  message,
  className,
}: PlanGateProps) {
  const { allowed, requiredPlan, rule } = useEntitlement(feature)
  const currentPlan = useProfileStore((s) => s.plan)

  if (allowed) {
    // Feature is accessible — render children as-is
    return <>{children}</>
  }

  if (inline) {
    return (
      <span
        title={`Requer plano ${requiredPlan ? PLAN_LABELS[requiredPlan] : 'superior'}`}
        className="inline-flex items-center gap-1 text-caption font-semibold text-text-muted"
      >
        <Lock className="w-3 h-3" />
        {requiredPlan ? PLAN_LABELS[requiredPlan] : 'Pro'}
      </span>
    )
  }

  const upgrade = requiredPlan ? nextPlan(currentPlan) ?? requiredPlan : 'pro'
  const upgradeLabel = PLAN_LABELS[upgrade]
  const upgradePrice = PLAN_PRICES[upgrade]

  return (
    <div
      className={cn(
        'relative rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-8 text-center shadow-glass-sm',
        className,
      )}
    >
      {/* Blurred preview of children behind the gate */}
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40 mb-6">
          {children}
        </div>
      )}

      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Lock className="w-7 h-7 text-brand-500" />
        </div>

        <div className="space-y-2 max-w-sm">
          <h3 className="font-heading text-h4 text-text-primary">
            {rule.label}
          </h3>
          <p className="text-body-sm text-text-secondary">
            {message || rule.description}
          </p>
          <p className="text-caption font-semibold text-brand-500 uppercase tracking-wider">
            Disponível no plano {upgradeLabel} · {upgradePrice}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/subscription/checkout?plan=${upgrade}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Fazer Upgrade para {upgradeLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/subscription"
            className="text-body-sm text-text-secondary hover:text-text-primary font-medium underline underline-offset-2 transition-colors"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Lock badge — tiny, for nav items or feature labels
 */
export function PlanLockBadge({ feature }: { feature: FeatureKey }) {
  const { allowed, requiredPlan } = useEntitlement(feature)
  if (allowed) return null
  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-500 border border-brand-100">
      <Lock className="w-2.5 h-2.5" />
      {requiredPlan ? PLAN_LABELS[requiredPlan] : 'Pro'}
    </span>
  )
}
