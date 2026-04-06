/**
 * Canonical Marketplace Economy Store (v2.5)
 * 
 * This is the SINGLE SOURCE OF TRUTH for the system economy:
 * - Aura Points (XP/Level)
 * - Credits (Standard Currency)
 * - Gems (Premium Currency)
 * - Digital Assets (Items, Skills, Companions)
 * 
 * For real-world BRL products and service bookings, see:
 * - ecommerceStore.ts (Products/Cart)
 * - marketplace.ts (Service Providers/Bookings)
 */

export * from "./marketplaceStore";

// Convenience selectors for the canonical economy
import { useMarketplaceStore } from "./marketplaceStore";

export const useEconomy = () => useMarketplaceStore((state) => state.economy);
export const useInventory = () => useMarketplaceStore((state) => state.inventory);
export const useMarketplaceAssets = () => useMarketplaceStore((state) => state.assets);

export const useBalances = () => useMarketplaceStore((state) => ({
  aura: state.economy?.auraPoints || 0,
  credits: state.economy?.credits || 0,
  gems: state.economy?.gems || 0,
  level: state.economy?.level || 1,
}));
