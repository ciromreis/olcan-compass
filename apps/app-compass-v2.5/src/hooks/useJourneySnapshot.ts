"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCommunityChronicles } from "@/lib/cms";
import {
  buildJourneySnapshot,
  type CommerceProduct,
  type ContextContentCard,
} from "@/lib/journey";
import { deriveRoutePresenceSignals } from "@/lib/presence-phenotype";
import { useApplicationStore } from "@/stores/applications";
import { useAuthStore } from "@/stores/auth";
import { useAuraStore } from "@/stores/auraStore";
import { useCommerceStore } from "@/stores/canonicalMarketplaceEconomyStore";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { hasOiosArchetypeEstablished, usePsychStore } from "@/stores/psych";

function mapContentCard(item: {
  id: string | number;
  title?: string | null;
  excerpt?: string | null;
  category?: string | null;
  tags?: Array<{ label?: string | null } | string> | null;
}): ContextContentCard {
  return {
    id: String(item.id),
    title: item.title || "Contexto Olcan",
    excerpt: item.excerpt || "Leitura editorial alinhada à sua jornada.",
    href: "/community",
    category: item.category || "Editorial",
    tags: Array.isArray(item.tags)
      ? item.tags
        .map((tag: { label?: string | null } | string) =>
          typeof tag === "string" ? tag.trim() : tag?.label?.trim?.() || ""
        )
        .filter(Boolean)
      : [],
  };
}

export function useJourneySnapshot() {
  const { user } = useAuthStore();
  const { aura } = useAuraStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { sprints } = useSprintStore();
  const { applications } = useApplicationStore();
  const { sessions } = useInterviewStore();
  const { documents } = useForgeStore();
  const { products, featuredProducts } = useCommerceStore();
  const oiosAssessmentComplete = usePsychStore((s) => s.oiosAssessmentComplete);
  const oiosSnapshot = usePsychStore((s) => s.oiosSnapshot);
  const psychLikertComplete = usePsychStore((s) => s.isComplete());
  const psychLikertStarted = usePsychStore(
    (s) =>
      Boolean(s.startedAt) ||
      s.completedDimensions.length > 0 ||
      Object.values(s.answers).some((block) => Object.keys(block || {}).length > 0)
  );
  const hasOiosArchetype = hasOiosArchetypeEstablished({
    oiosAssessmentComplete,
    oiosSnapshot,
  });
  const [contentCards, setContentCards] = useState<ContextContentCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      const chronicles = await fetchCommunityChronicles();
      if (cancelled) return;
      setContentCards((chronicles || []).map(mapContentCard));
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const commerceProducts = useMemo<CommerceProduct[]>(
    () => (products.length > 0 ? products : featuredProducts),
    [featuredProducts, products]
  );

  const routeSignals = useMemo(
    () => deriveRoutePresenceSignals(routes, documents, sessions, getRouteProgress),
    [routes, documents, sessions, getRouteProgress]
  );

  const snapshot = useMemo(
    () =>
      buildJourneySnapshot({
        user,
        aura,
        routes,
        sprints,
        applications,
        sessions,
        documents,
        products: commerceProducts,
        contentCards,
        routeSignals,
        hasOiosArchetype,
        psychLikertComplete,
        psychLikertStarted,
      }),
    [
      user,
      aura,
      routes,
      sprints,
      applications,
      sessions,
      documents,
      commerceProducts,
      contentCards,
      routeSignals,
      hasOiosArchetype,
      psychLikertComplete,
      psychLikertStarted,
    ]
  );

  return {
    snapshot,
    routeSignals,
    contentCards,
  };
}
