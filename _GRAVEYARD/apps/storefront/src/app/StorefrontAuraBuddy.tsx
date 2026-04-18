"use client";

/**
 * StorefrontAuraBuddy
 *
 * The marketplace companion widget. It:
 * 1. Checks for the unified olcan_token cookie to determine auth state.
 * 2. Renders a floating Aura figure powered by the shared @olcan/ui-components.
 * 3. Listens for marketplace events and shows animated XP reward toasts.
 * 4. Provides a quick-link back to the full Compass app.
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ShoppingBag, ArrowUpRight, Zap } from "lucide-react";
import {
  ProceduralAuraFigure,
  onOlcanEvent,
  emitOlcanEvent,
} from "@olcan/ui-components";

// XP reward configuration per event type
const XP_REWARDS = {
  productView: 5,
  cartAdd: 15,
  purchaseComplete: 100,
} as const;

// Helper to check standard compass auth cookie
function hasOlcanToken() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("olcan_token=");
}

interface XpToast {
  id: number;
  amount: number;
  reason: string;
}

let toastIdCounter = 0;

export default function StorefrontAuraBuddy() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [xpToasts, setXpToasts] = useState<XpToast[]>([]);
  const [totalXpGained, setTotalXpGained] = useState(0);

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.olcan.com.br";

  useEffect(() => {
    setIsAuthenticated(hasOlcanToken());
  }, []);

  // Show animated XP toast and auto-dismiss
  const showXpToast = useCallback((amount: number, reason: string) => {
    const id = ++toastIdCounter;
    const toast: XpToast = { id, amount, reason };
    setXpToasts((prev) => [...prev.slice(-2), toast]); // Keep max 3
    setTotalXpGained((prev) => prev + amount);

    setTimeout(() => {
      setXpToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Subscribe to marketplace events and award XP locally
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubs = [
      onOlcanEvent("marketplace:product:view", () => {
        showXpToast(XP_REWARDS.productView, "Exploração");
      }),
      onOlcanEvent("marketplace:cart:add", (e) => {
        showXpToast(
          XP_REWARDS.cartAdd,
          `+${e.payload.productName.slice(0, 20)}`
        );
      }),
      onOlcanEvent("marketplace:purchase:complete", (e) => {
        showXpToast(
          XP_REWARDS.purchaseComplete,
          `Compra #${e.payload.orderId.slice(0, 8)}`
        );
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [isAuthenticated, showXpToast]);

  // Shopping companion spec — a vibrant, active figure
  const shoppingSpec = {
    seed: "storefront-aura",
    species: "construct" as const,
    attachment: "orbitals" as const,
    locomotion: "hover" as const,
    eyeStyle: "visor" as const,
    bodyScale: 1.1,
    detailLevel: 4,
    metallic: 0.8,
    symmetry: 0.9,
    primaryHue: 215,
    secondaryHue: 45,
    orbitCount: 2,
    haloIntensity: 0.6,
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* XP Reward Toasts */}
      <div className="pointer-events-none fixed bottom-28 right-6 z-[10000] flex flex-col items-end gap-2">
        <AnimatePresence>
          {xpToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="pointer-events-none flex items-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50/95 to-white/95 px-4 py-2 shadow-[0_8px_32px_rgba(245,158,11,0.2)] backdrop-blur-xl"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-700">
                +{toast.amount} XP
              </span>
              <span className="text-xs text-amber-600/70">{toast.reason}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Companion Widget */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 42, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex max-w-sm flex-col items-end"
        >
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="pointer-events-auto mb-4 w-72 overflow-hidden rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Boutique Ativa
                      </div>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                        Suas compras acumulam AuraXP. Cada interação fortalece
                        sua presença no ecossistema Olcan.
                      </p>
                    </div>
                  </div>

                  {/* Session XP summary */}
                  {totalXpGained > 0 && (
                    <div className="flex items-center justify-between rounded-2xl bg-amber-50/80 px-4 py-2.5 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-800">
                          +{totalXpGained} XP
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-amber-600/70">
                        esta sessão
                      </span>
                    </div>
                  )}

                  {/* Quick link to full Compass */}
                  <a
                    href={`${APP_URL}/aura`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      Abrir Compass
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-brand-600" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsExpanded((current) => !current)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="pointer-events-auto relative overflow-hidden rounded-[26px] border border-white/70 bg-white/70 px-3 py-3 shadow-[0_18px_52px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_rgba(255,255,255,0.6))]">
                <ProceduralAuraFigure spec={shoppingSpec} size={62} active />
              </div>

              <div className="w-40 text-left">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                  {totalXpGained > 0
                    ? `+${totalXpGained} XP`
                    : "Radiante"}
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-700">
                  {isExpanded
                    ? "Toque para minimizar"
                    : "Sua Aura acompanha o marketplace."}
                </p>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Utility hook for product pages to emit marketplace events
// ---------------------------------------------------------------------------

/**
 * Call this from product pages/cart actions to emit typed events
 * that the AuraBuddy will automatically respond to with XP toasts.
 *
 * Usage:
 *   import { useMarketplaceEvents } from './StorefrontAuraBuddy';
 *   const events = useMarketplaceEvents();
 *   events.trackProductView("prod_123", "Adaptador de Tomada");
 */
export function useMarketplaceEvents() {
  return {
    trackProductView: (productId: string, productName: string, category?: string) => {
      emitOlcanEvent(
        "marketplace:product:view",
        { productId, productName, category },
        "storefront"
      );
    },
    trackCartAdd: (productId: string, productName: string, quantity = 1) => {
      emitOlcanEvent(
        "marketplace:cart:add",
        { productId, productName, quantity },
        "storefront"
      );
    },
    trackPurchaseComplete: (
      orderId: string,
      totalAmount: number,
      currency: string,
      itemCount: number
    ) => {
      emitOlcanEvent(
        "marketplace:purchase:complete",
        { orderId, totalAmount, currency, itemCount },
        "storefront"
      );
    },
  };
}
