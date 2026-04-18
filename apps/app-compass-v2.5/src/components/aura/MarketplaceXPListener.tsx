"use client";

/**
 * MarketplaceXPListener
 *
 * Component mounted in the app layout that listens for
 * cross-surface marketplace events and forwards them to the
 * event-driven gamification engine.
 *
 * This closes the loop:
 *   marketplace.olcan.com.br (emits events)
 *     → app.olcan.com.br (this listener)
 *       → GamificationStore (processes rewards)
 *         → AuraRail (reflects evolution)
 */

import { useEffect } from "react";
import { onOlcanEvent } from "@/lib/olcan-events";
import { useGamificationStore } from "@/stores/eventDrivenGamificationStore";

const XP_MAP = {
  "marketplace:product:view": 5,
  "marketplace:cart:add": 15,
  "marketplace:purchase:complete": 250, 
} as const;

export function MarketplaceXPListener() {
  const handleProductEvent = useGamificationStore((s) => s.handleProductEvent);
  const addXP = useGamificationStore((s) => s.addXP);

  useEffect(() => {
    const unsubs = [
      onOlcanEvent("marketplace:product:view", () => {
        handleProductEvent("marketplace.product.viewed", {});
        addXP(XP_MAP["marketplace:product:view"], "marketplace_view");
      }),
      onOlcanEvent("marketplace:cart:add", () => {
        handleProductEvent("marketplace.cart.added", {});
        addXP(XP_MAP["marketplace:cart:add"], "marketplace_cart");
      }),
      onOlcanEvent("marketplace:purchase:complete", () => {
        // This is the big one: Close the loop between economic action and professional evolution
        handleProductEvent("marketplace.booking.created", {});
        // XP is handled inside handleProductEvent for this specific event type
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [handleProductEvent, addXP]);

  // This is a pure side-effect component — no UI
  return null;
}
