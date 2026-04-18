/**
 * Olcan Compass v2.5 — Product Event Bus
 *
 * Central pub/sub system that connects product actions to gamification,
 * analytics, and companion evolution. This is the "wiring" layer that
 * makes the gamification system react to real user outcomes.
 *
 * Architecture:
 *   Product action (e.g. save document)
 *     → emit(event)
 *       → gamification store (XP, achievements, quests)
 *       → companion evolution (product signals)
 *       → analytics (observability)
 *
 * Usage:
 *   import { eventBus } from "@/lib/event-bus";
 *   eventBus.emit("document.created", { docId, docType });
 *
 * Canonical event types are defined in PRODUCT_EVENTS below.
 * DO NOT add gamification logic to product stores — emit events here instead.
 */

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export type ProductEventType =
  // Document / Forge
  | "document.created"
  | "document.saved"
  | "document.version_saved"
  | "document.exported"
  | "document.imported"
  | "document.polished"
  | "document.shared"
  // Interview
  | "interview.started"
  | "interview.completed"
  | "interview.score_improved"
  // Route
  | "route.selected"
  | "route.milestone_completed"
  | "route.sprint_created"
  // Application
  | "application.created"
  | "application.submitted"
  | "application.status_changed"
  // Assessment / Psychology
  | "assessment.started"
  | "assessment.completed"
  | "archetype.assigned"
  // Marketplace
  | "marketplace.booking_created"
  | "marketplace.review_submitted"
  | "marketplace.product_purchased"
  // Companion / Aura
  | "companion.created"
  | "companion.cared"
  | "companion.evolved"
  | "companion.battle_started"
  | "companion.battle_won"
  // Social
  | "guild.joined"
  | "guild.event_participated"
  | "social.followed"
  // Engagement
  | "user.daily_active"
  | "user.streak_updated"
  | "user.profile_completed";

export interface ProductEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  type: ProductEventType;
  timestamp: string;
  userId?: string | number;
  payload: T;
}

type EventListener<T extends Record<string, unknown> = Record<string, unknown>> = (
  event: ProductEvent<T>
) => void;

// ─────────────────────────────────────────────────────────────────────────────
// EVENT BUS IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

class ProductEventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private wildcardListeners = new Set<EventListener>();
  private history: ProductEvent[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * Emit a product event. All registered listeners will be called synchronously.
   */
  emit<T extends Record<string, unknown>>(
    type: ProductEventType,
    payload: T = {} as T,
    userId?: string | number
  ): void {
    const event: ProductEvent<T> = {
      type,
      timestamp: new Date().toISOString(),
      userId,
      payload,
    };

    // Store in history (capped)
    this.history.push(event as ProductEvent);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }

    // Notify specific listeners
    const specific = this.listeners.get(type);
    if (specific) {
      specific.forEach((cb) => {
        try {
          cb(event as ProductEvent);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${type}":`, err);
        }
      });
    }

    // Notify wildcard listeners
    this.wildcardListeners.forEach((cb) => {
      try {
        cb(event as ProductEvent);
      } catch (err) {
        console.error(`[EventBus] Error in wildcard listener:`, err);
      }
    });

    if (process.env.NODE_ENV === "development") {
      console.debug(`[EventBus] ${type}`, payload);
    }
  }

  /**
   * Subscribe to a specific event type. Returns an unsubscribe function.
   */
  on<T extends Record<string, unknown>>(
    type: ProductEventType,
    listener: EventListener<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as EventListener);
    return () => this.listeners.get(type)?.delete(listener as EventListener);
  }

  /**
   * Subscribe to ALL events. Returns an unsubscribe function.
   */
  onAny(listener: EventListener): () => void {
    this.wildcardListeners.add(listener);
    return () => this.wildcardListeners.delete(listener);
  }

  /**
   * Subscribe to a specific event type, fire once, then auto-unsubscribe.
   */
  once<T extends Record<string, unknown>>(
    type: ProductEventType,
    listener: EventListener<T>
  ): () => void {
    const wrapper: EventListener = (event) => {
      listener(event as ProductEvent<T>);
      unsub();
    };
    const unsub = this.on(type, wrapper);
    return unsub;
  }

  /**
   * Get recent event history (last N events).
   */
  getHistory(limit = 20): ProductEvent[] {
    return this.history.slice(-limit);
  }

  /**
   * Clear all listeners (useful for testing).
   */
  clear(): void {
    this.listeners.clear();
    this.wildcardListeners.clear();
  }
}

// Singleton instance
export const eventBus = new ProductEventBus();

// ─────────────────────────────────────────────────────────────────────────────
// GAMIFICATION BRIDGE
// Connects eventBus events → useGamificationStore actions.
// Call initGamificationBridge() once at app startup (in layout or provider).
// ─────────────────────────────────────────────────────────────────────────────

let bridgeInitialized = false;

export function initGamificationBridge(): () => void {
  if (bridgeInitialized) return () => {};
  bridgeInitialized = true;

  // Lazy import to avoid circular deps at module load time
  const getStore = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { useGamificationStore } = require("@/stores/eventDrivenGamificationStore");
      return useGamificationStore.getState();
    } catch {
      return null;
    }
  };

  const unsubs: Array<() => void> = [];

  // ── Document events ────────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("document.created", () => {
      const store = getStore();
      if (!store) return;
      store.handleProductEvent("document.created", { count: 1 });
      store.checkAchievementProgress("document.created", 1);
      store.updateQuestProgress("document.created");
    })
  );

  unsubs.push(
    eventBus.on("document.version_saved", () => {
      const store = getStore();
      if (!store) return;
      store.updateQuestProgress("document.version_saved");
    })
  );

  unsubs.push(
    eventBus.on("document.polished", () => {
      const store = getStore();
      if (!store) return;
      store.addXP(25, "document_polished");
      store.updateQuestProgress("document.polished");
    })
  );

  unsubs.push(
    eventBus.on("document.exported", () => {
      const store = getStore();
      if (!store) return;
      store.addXP(10, "document_exported");
    })
  );

  // ── Interview events ───────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("interview.completed", (event) => {
      const store = getStore();
      if (!store) return;
      store.handleProductEvent("interview.completed", event.payload);
      store.checkAchievementProgress("interview.completed", 1);
      store.updateQuestProgress("interview.completed");
      store.addXP(50, "interview_completed");
    })
  );

  unsubs.push(
    eventBus.on("interview.score_improved", (event) => {
      const store = getStore();
      if (!store) return;
      const delta = (event.payload.delta as number) || 0;
      if (delta > 0) store.addXP(Math.floor(delta * 2), "interview_improvement");
    })
  );

  // ── Route events ───────────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("route.selected", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("route.selected", 1);
      store.updateQuestProgress("route.selected");
      store.addXP(100, "route_selected");
    })
  );

  unsubs.push(
    eventBus.on("route.milestone_completed", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("route.milestone.completed", 1);
      store.updateQuestProgress("route.milestone.completed");
      store.addXP(200, "milestone_completed");
    })
  );

  // ── Application events ─────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("application.submitted", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("application.submitted", 1);
      store.updateQuestProgress("application.submitted");
      store.addXP(500, "application_submitted");
    })
  );

  // ── Assessment events ──────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("assessment.completed", () => {
      const store = getStore();
      if (!store) return;
      store.addXP(150, "assessment_completed");
      store.updateQuestProgress("assessment.completed");
    })
  );

  // ── Marketplace events ─────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("marketplace.booking_created", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("marketplace.booking.created", 1);
      store.updateQuestProgress("marketplace.booking.created");
      store.addXP(250, "booking_created");
    })
  );

  unsubs.push(
    eventBus.on("marketplace.review_submitted", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("marketplace.review.submitted", 1);
      store.addXP(100, "review_submitted");
    })
  );

  // ── Companion events ───────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("companion.created", (event) => {
      const store = getStore();
      if (!store) return;
      store.handleAuraEvent({ type: "aura.created", timestamp: event.timestamp, payload: event.payload });
    })
  );

  unsubs.push(
    eventBus.on("companion.cared", (event) => {
      const store = getStore();
      if (!store) return;
      store.handleAuraEvent({ type: "aura.cared", timestamp: event.timestamp, payload: event.payload });
    })
  );

  unsubs.push(
    eventBus.on("companion.evolved", (event) => {
      const store = getStore();
      if (!store) return;
      store.handleAuraEvent({ type: "aura.evolved", timestamp: event.timestamp, payload: event.payload });
    })
  );

  unsubs.push(
    eventBus.on("companion.battle_won", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("battle.won", 1);
      store.addXP(350, "battle_won");
    })
  );

  // ── Social events ──────────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("guild.joined", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("guild.joined", 1);
      store.addXP(150, "guild_joined");
    })
  );

  // ── Engagement events ──────────────────────────────────────────────────────
  unsubs.push(
    eventBus.on("user.daily_active", () => {
      const store = getStore();
      if (!store) return;
      store.checkAchievementProgress("user.day_active", 1);
      store.updateStreak("daily_care");
    })
  );

  return () => {
    unsubs.forEach((u) => u());
    bridgeInitialized = false;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANION EVOLUTION BRIDGE
// Connects product progress signals → companion XP / evolution.
// ─────────────────────────────────────────────────────────────────────────────

export function initCompanionEvolutionBridge(): () => void {
  const getAuraStore = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { useAuraStore } = require("@/stores/auraStore");
      return useAuraStore.getState();
    } catch {
      return null;
    }
  };

  const unsubs: Array<() => void> = [];

  // High-value product actions grant companion XP
  const XP_GRANTS: Partial<Record<ProductEventType, number>> = {
    "document.created": 20,
    "document.polished": 30,
    "interview.completed": 60,
    "route.milestone_completed": 80,
    "application.submitted": 150,
    "assessment.completed": 50,
    "marketplace.booking_created": 40,
  };

  Object.entries(XP_GRANTS).forEach(([eventType, xp]) => {
    unsubs.push(
      eventBus.on(eventType as ProductEventType, () => {
        const store = getAuraStore();
        if (!store) return;
        // If the store has an addXP method, call it
        if (typeof store.addXP === "function") {
          store.addXP(xp, `product_event:${eventType}`);
        }
      })
    );
  });

  return () => unsubs.forEach((u) => u());
}
