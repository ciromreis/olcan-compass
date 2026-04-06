"use client";

import { Zap, Coins, Gem, Trophy } from "lucide-react";
import { useBalances } from "@/stores/canonicalMarketplaceEconomyStore";
import { cn } from "@/lib/utils";

interface EconomyHUDProps {
  className?: string;
}

export function EconomyHUD({ className }: EconomyHUDProps) {
  const { aura, credits, gems, level } = useBalances();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Level & Aura XP */}
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 shadow-sm transition-all hover:border-brand-300">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500 text-[10px] font-bold text-white">
          Lvl {level}
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-brand-500 fill-brand-500" />
          <span className="text-caption font-bold text-brand-600">{aura.toLocaleString()}</span>
        </div>
      </div>

      {/* Credits */}
      <div className="flex items-center gap-2 rounded-xl border border-silver-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:border-silver-300">
        <Coins className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-caption font-bold text-text-primary">{credits.toLocaleString()}</span>
      </div>

      {/* Gems */}
      <div className="flex items-center gap-2 rounded-xl border border-silver-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:border-silver-300">
        <Gem className="h-3.5 w-3.5 text-cyan-500 fill-cyan-500" />
        <span className="text-caption font-bold text-text-primary">{gems.toLocaleString()}</span>
      </div>

      {/* Achievements Indicator (Optional) */}
      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-silver-200 bg-white text-text-muted transition-all hover:text-brand-500 hover:border-brand-200">
        <Trophy className="h-4 w-4" />
      </div>
    </div>
  );
}
