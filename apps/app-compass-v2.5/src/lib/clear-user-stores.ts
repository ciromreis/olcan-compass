/**
 * clearUserStores — wipes all user-bound Zustand persisted stores.
 *
 * Call this on logout AND on successful login/register of any user, so that
 * data from a previous session never leaks into a new user's view.
 *
 * Background: all stores below use Zustand `persist` with localStorage keys.
 * They are NOT cleared by auth.ts's logout() by default, which means User A's
 * profile/intake/psych/forge data stays in localStorage and in-memory until
 * this function is called.
 */

import { useProfileIntakeStore } from "@/stores/profileIntake";
import { useProfileStore } from "@/stores/profile";
import { usePsychStore } from "@/stores/psych";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useForgeStore } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { useInterviewStore } from "@/stores/interviews";
import { useAuraStore } from "@/stores/auraStore";
import { useArchetypeStore } from "@/stores/archetypeStore";
import { useGamificationStore } from "@/stores/eventDrivenGamificationStore";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useCommunityStore } from "@/stores/community";
import { useOrgStore } from "@/stores/org";

export function clearUserStores(): void {
  useProfileIntakeStore.getState().reset();
  useProfileStore.getState().reset();
  usePsychStore.getState().reset();
  useSprintStore.getState().reset();
  useRouteStore.getState().reset();
  useForgeStore.getState().reset();
  useApplicationStore.getState().reset();
  useInterviewStore.getState().reset();
  useAuraStore.getState().resetStore();
  useArchetypeStore.getState().reset();
  useGamificationStore.getState().reset();
  useMarketplaceStore.getState().reset();
  useCommunityStore.getState().reset();
  useOrgStore.getState().reset();
}
