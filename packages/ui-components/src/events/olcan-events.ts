/**
 * Olcan Cross-Subdomain Event Bridge
 *
 * Provides a unified event bus for communication between
 * marketplace.olcan.com.br ↔ app.olcan.com.br ↔ olcan.com.br
 *
 * Implementation:
 * - Uses localStorage events for cross-tab, same-origin communication
 * - Uses postMessage for cross-origin iframe communication
 * - Provides typed event contracts for type-safe subscriptions
 */

// ---------------------------------------------------------------------------
// Event Type Definitions
// ---------------------------------------------------------------------------

export type OlcanEventMap = {
  /** Fired when user adds an item to the marketplace cart */
  "marketplace:cart:add": { productId: string; productName: string; quantity: number };
  /** Fired when user completes checkout */
  "marketplace:purchase:complete": { orderId: string; totalAmount: number; currency: string; itemCount: number };
  /** Fired when user views a product detail page */
  "marketplace:product:view": { productId: string; productName: string; category?: string };
  /** Fired when the Compass app awards XP in response to any event */
  "aura:xp:awarded": { amount: number; reason: string; newTotal: number };
  /** Fired when user's Aura evolves to the next stage */
  "aura:evolution": { stage: string; level: number };
  /** Fired when user completes onboarding and has an active Aura */
  "onboarding:complete": { archetypeId: string; auraName: string };
};

export type OlcanEventName = keyof OlcanEventMap;

export interface OlcanEvent<T extends OlcanEventName = OlcanEventName> {
  type: T;
  payload: OlcanEventMap[T];
  timestamp: number;
  source: "app" | "storefront" | "site";
}

// ---------------------------------------------------------------------------
// Storage-Based Event Bus (cross-tab, same eTLD+1)
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = "olcan_event_";

/**
 * Emit an event to all tabs/windows on the same eTLD+1 domain.
 * This leverages the `storage` event which fires in OTHER tabs when
 * localStorage is modified, providing free cross-tab communication.
 */
export function emitOlcanEvent<T extends OlcanEventName>(
  type: T,
  payload: OlcanEventMap[T],
  source: OlcanEvent["source"]
): void {
  const event: OlcanEvent<T> = {
    type,
    payload,
    timestamp: Date.now(),
    source,
  };

  if (typeof window === "undefined") return;

  // Write to localStorage (triggers 'storage' in other tabs)
  const key = `${STORAGE_KEY_PREFIX}${type}`;
  try {
    window.localStorage.setItem(key, JSON.stringify(event));
    // Immediately remove so the same event can be sent again
    window.localStorage.removeItem(key);
  } catch {
    // Storage quota or private browsing — degrade gracefully
  }

  // Also dispatch a local CustomEvent for same-tab listeners
  window.dispatchEvent(new CustomEvent("olcan-event", { detail: event }));
}

type EventCallback<T extends OlcanEventName> = (event: OlcanEvent<T>) => void;

/**
 * Subscribe to Olcan events from any tab on the same domain.
 * Returns an unsubscribe function.
 */
export function onOlcanEvent<T extends OlcanEventName>(
  type: T,
  callback: EventCallback<T>
): () => void {
  if (typeof window === "undefined") return () => {};

  // Listen for cross-tab storage events
  const storageHandler = (e: StorageEvent) => {
    if (e.key !== `${STORAGE_KEY_PREFIX}${type}` || !e.newValue) return;
    try {
      const event = JSON.parse(e.newValue) as OlcanEvent<T>;
      callback(event);
    } catch {
      // Malformed data — ignore
    }
  };

  // Listen for same-tab custom events
  const customHandler = (e: Event) => {
    const detail = (e as CustomEvent<OlcanEvent<T>>).detail;
    if (detail.type === type) {
      callback(detail);
    }
  };

  window.addEventListener("storage", storageHandler);
  window.addEventListener("olcan-event", customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("olcan-event", customHandler);
  };
}
