"use client";

import { useState, useEffect } from "react";

/**
 * Prevents hydration mismatch with Zustand persisted stores in Next.js SSR.
 * Returns `false` during SSR and the first client render, then `true` after hydration.
 *
 * Usage:
 *   const ready = useHydration();
 *   if (!ready) return <Skeleton />;
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
