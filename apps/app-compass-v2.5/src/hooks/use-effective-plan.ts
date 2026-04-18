"use client";

import { useMemo } from "react";
import { effectiveUserPlan } from "@/lib/entitlements";
import type { UserPlan } from "@/stores/profile";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore } from "@/stores/profile";

/** Plan from subscription UI + API `is_premium` (upgrades only). */
export function useEffectivePlan(): UserPlan {
  const storedPlan = useProfileStore((s) => s.plan);
  const isPremium = useAuthStore((s) => s.user?.is_premium);
  return useMemo(
    () => effectiveUserPlan(storedPlan, isPremium),
    [storedPlan, isPremium]
  );
}
