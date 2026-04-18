/**
 * Lightweight browser event bridge for Olcan cross-surface signals (e.g. marketplace → app).
 * Replaces the removed `@olcan/ui-components` helper with the same contract.
 */
export function onOlcanEvent(eventName: string, handler: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const listener: EventListener = () => {
    handler();
  };
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}
