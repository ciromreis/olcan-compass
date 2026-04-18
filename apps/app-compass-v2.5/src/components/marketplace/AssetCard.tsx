"use client";

import { useState } from "react";
import { 
  Zap, 
  Sparkles, 
  Shield, 
  Crown, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { 
  MarketplaceAsset, 
  useMarketplaceStore, 
  getAssetRarityInfo,
  formatCurrency,
  canAfford
} from "@/stores/canonicalMarketplaceEconomyStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface AssetCardProps {
  asset: MarketplaceAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { purchaseAsset, economy, inventory } = useMarketplaceStore();
  const rarityInfo = getAssetRarityInfo(asset.rarity);
  
  const isOwned = inventory.some(item => item.assetId === asset.id);
  const afford = canAfford(asset, economy);

  const handlePurchase = async () => {
    if (!afford || isPurchasing || isOwned) return;
    
    setIsPurchasing(true);
    try {
      await purchaseAsset(asset.id);
      // Optional: Add success toast here
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const getRarityIcon = () => {
    switch (asset.rarity) {
      case 'mythic': return <Flame className="h-5 w-5" />;
      case 'legendary': return <Crown className="h-5 w-5" />;
      case 'epic': return <Sparkles className="h-5 w-5" />;
      case 'rare': return <Shield className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-2xl border bg-white/90 p-4 transition-all hover:-translate-y-1 hover:shadow-lg",
      asset.rarity === 'mythic' ? "border-red-200 bg-gradient-to-br from-white to-red-50" :
      asset.rarity === 'legendary' ? "border-slate-200 bg-gradient-to-br from-white to-slate-50" :
      asset.rarity === 'epic' ? "border-purple-200 bg-gradient-to-br from-white to-purple-50" :
      "border-silver-200"
    )}>
      {/* Rarity Header */}
      <div className="flex items-center justify-between">
        <span className={cn(
          "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
          `text-[${rarityInfo.color}]`
        )}>
          {getRarityIcon()}
          {rarityInfo.label}
        </span>
        <span className="rounded-lg bg-silver-50 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
          {asset.assetType.toUpperCase()}
        </span>
      </div>

      {/* Asset Content */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl border-2 shadow-inner",
          `border-[${rarityInfo.color}]/20 bg-white`
        )}>
          <span className="text-h2">{asset.icon}</span>
        </div>
        
        <h3 className="mt-4 font-heading text-body font-bold text-text-primary">
          {asset.name}
        </h3>
        <p className="mt-1 text-caption text-text-muted line-clamp-2">
          {asset.description}
        </p>
      </div>

      {/* Stats/Abilities (Optional) */}
      <div className="mt-4 flex flex-1 flex-col gap-2">
        {asset.assetType === 'skill' && !!asset.metadata?.powerLevel && (
          <div className="flex items-center justify-between rounded-lg bg-silver-50 px-3 py-1.5 text-caption">
            <span className="text-text-secondary">Poder</span>
            <span className="font-bold text-brand-500">Lv.{String(asset.metadata.powerLevel)}</span>
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 flex flex-col gap-2 border-t border-silver-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-heading text-body-sm font-bold text-brand-500">
            {formatCurrency(asset.price, asset.currency)}
          </div>
          <div className="flex items-center gap-1 text-steel-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">+{Math.round(asset.price * 5)} XP</span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant={isOwned ? "secondary" : "primary"}
          disabled={!afford || isPurchasing || isOwned}
          onClick={handlePurchase}
          className="w-full"
        >
          {isPurchasing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isOwned ? (
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Adquirido</span>
          ) : !afford ? (
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Saldo insuficiente</span>
          ) : (
            "Desbloquear agora"
          )}
        </Button>
      </div>
      
      {/* Decorative effect for Mythic/Legendary */}
      {['mythic', 'legendary'].includes(asset.rarity) && (
        <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl group-hover:bg-brand-500/20" />
      )}
    </div>
  );
}
