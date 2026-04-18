import type { UserPlan } from "@/stores/profile";

function demoRelaxed(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/**
 * Merge persisted subscription UI state with API truth.
 * API `is_premium` only upgrades (never downgrades local plan) until billing is fully server-driven.
 */
export function effectiveUserPlan(storedPlan: UserPlan, isPremiumFromApi?: boolean | null): UserPlan {
  if (isPremiumFromApi) {
    if (storedPlan === "premium") return "premium";
    return "pro";
  }
  return storedPlan;
}

export function isPaidPlan(plan: UserPlan): boolean {
  return plan === "pro" || plan === "premium";
}

/** Max Forge documents for the plan (Infinity = unlimited). */
export function maxForgeDocuments(plan: UserPlan): number {
  if (demoRelaxed()) return Number.POSITIVE_INFINITY;
  if (plan === "pro" || plan === "premium") return Number.POSITIVE_INFINITY;
  return 3;
}

/** Max mobility routes the user may have. */
export function maxRoutes(plan: UserPlan): number {
  if (demoRelaxed()) return Number.POSITIVE_INFINITY;
  if (plan === "premium") return Number.POSITIVE_INFINITY;
  if (plan === "pro") return 3;
  return 1;
}

export function canCreateForgeDocument(plan: UserPlan, documentCount: number): boolean {
  return documentCount < maxForgeDocuments(plan);
}

export function canCreateRoute(plan: UserPlan, routeCount: number): boolean {
  return routeCount < maxRoutes(plan);
}

/** Version diff / compare within Forge (paid feature). */
export function canUseForgeVersionCompare(plan: UserPlan): boolean {
  if (demoRelaxed()) return true;
  return isPaidPlan(plan);
}
