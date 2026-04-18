"use client";

import { useEffect, useState } from "react";
import { Zap, ShoppingCart } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface CreditBalanceProps {
  /** Refreshes the balance when this changes (e.g. after a polish call). */
  refreshKey?: number;
  className?: string;
}

export function CreditBalance({ refreshKey = 0, className }: CreditBalanceProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiClient
      .getForgeCredits()
      .then((data) => { if (mounted) setCredits(data.forge_credits); })
      .catch(() => { if (mounted) setCredits(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [refreshKey]);

  async function handleBuy() {
    setBuyLoading(true);
    try {
      const result = await apiClient.createBillingCheckout("starter");
      window.location.href = result.checkout_url;
    } catch {
      setBuyLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-1.5 text-sm text-white/50 animate-pulse", className)}>
        <Zap className="w-3.5 h-3.5" />
        <span>—</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          credits === 0
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : credits !== null && credits <= 2
            ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
            : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
        )}
      >
        <Zap className="w-3 h-3" />
        <span>{credits ?? "—"} créditos</span>
      </div>

      {credits !== null && credits <= 3 && (
        <button
          onClick={handleBuy}
          disabled={buyLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50"
        >
          <ShoppingCart className="w-3 h-3" />
          {buyLoading ? "..." : "Comprar"}
        </button>
      )}
    </div>
  );
}
