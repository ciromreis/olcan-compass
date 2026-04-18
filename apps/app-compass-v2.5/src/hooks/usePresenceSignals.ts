/**
 * usePresenceSignals Hook - v2.5
 * 
 * Consolidates data from across stores to generate the "Phenotype Signals"
 * that drive Aura manifestation and Atlas recombination.
 */

import { useMemo } from 'react';
import { useForgeStore } from '@/stores/forge';
import { useInterviewStore } from '@/stores/interviews';
import { useRouteStore } from '@/stores/routes';
import { deriveRoutePresenceSignals, RoutePresenceSignal } from '@/lib/presence-phenotype';

export function usePresenceSignals(): RoutePresenceSignal[] {
  const documents = useForgeStore((state) => state.documents);
  const sessions = useInterviewStore((state) => state.sessions);
  const routes = useRouteStore((state) => state.routes);
  const getRouteProgress = useRouteStore((state) => state.getRouteProgress);

  return useMemo(() => {
    return deriveRoutePresenceSignals(
      routes,
      documents,
      sessions,
      (id) => getRouteProgress(id)
    );
  }, [routes, documents, sessions, getRouteProgress]);
}
