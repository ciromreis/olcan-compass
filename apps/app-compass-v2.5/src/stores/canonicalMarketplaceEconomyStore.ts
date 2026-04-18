/**
 * Canonical Marketplace Economy Store (v2.5)
 *
 * Single surface for:
 * - In-app economy (aura, credits, gems, digital assets) → useMarketplaceStore
 * - BRL / catalog products (API + commerceService) → useCommerceStore
 *
 * Service providers / bookings: canonicalMarketplaceProviderStore + marketplace.ts
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { commerceService, type Product } from "@/services/commerce";
import { type ArchetypeId } from "@/lib/archetypes";
import { api } from '@/lib/api';

// ══════════════════════════════════════════════════════════════════════════════
// IN-APP ECONOMY STORE (Digital Assets, Aura Points, Credits, Gems)
// ══════════════════════════════════════════════════════════════════════════════

// Types
export type AssetType = 'item' | 'skill' | 'companion' | 'accessory' | 'bundle';
export type CurrencyType = 'aura' | 'credits' | 'gems' | 'brl';
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface MarketplaceAsset {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  assetType: AssetType;
  price: number;
  currency: CurrencyType;
  rarity: RarityType;
  icon: string;
  thumbnail?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAsset {
  id: string;
  assetId: string;
  userId: string;
  assetType: AssetType;
  quantity: number;
  unlockedAt: string;
  metadata?: Record<string, unknown>;
  asset?: MarketplaceAsset | null;
}

export interface UserEconomy {
  auraPoints: number; // System level/XP points
  credits: number;    // Paid currency (formerly coins)
  gems: number;       // Premium currency
  level: number;
  nextLevelXp: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'reward' | 'burn' | 'refund';
  amount: number;
  currency: CurrencyType;
  status: 'pending' | 'completed' | 'failed';
  assetId?: string;
  assetName?: string;
  createdAt: string;
}

interface MarketplaceState {
  // State
  assets: MarketplaceAsset[];
  inventory: InventoryAsset[];
  economy: UserEconomy | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAssets: (params?: Record<string, string>) => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchEconomy: () => Promise<void>;
  purchaseAsset: (assetId: string, quantity?: number) => Promise<void>;
  useAsset: (inventoryId: string) => Promise<void>;
  earnCredits: (amount: number, source?: string) => Promise<void>;
  addAuraPoints: (amount: number, source?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearError: () => void;
}

// API functions — uses shared axios client with auth interceptors
const ECONOMY_PREFIX = '/v1/marketplace';

class MarketplaceAPI {
  static async getAssets(params?: Record<string, string>) {
    const { data } = await api.get(`${ECONOMY_PREFIX}/assets`, { params });
    return data;
  }

  static async getInventory() {
    const { data } = await api.get(`${ECONOMY_PREFIX}/inventory`);
    return data;
  }

  static async getEconomy() {
    const { data } = await api.get(`${ECONOMY_PREFIX}/economy`);
    return data;
  }

  static async purchaseAsset(assetId: string, quantity: number = 1) {
    const { data } = await api.post(`${ECONOMY_PREFIX}/purchase/${assetId}`, null, {
      params: { quantity },
    });
    return data;
  }

  static async useAsset(inventoryId: string) {
    const { data } = await api.post(`${ECONOMY_PREFIX}/use/${inventoryId}`);
    return data;
  }

  static async earnCredits(amount: number, source: string = 'daily_bonus') {
    const { data } = await api.post(`${ECONOMY_PREFIX}/earn-credits`, { amount, source });
    return data;
  }

  static async addAuraPoints(amount: number, source: string = 'activity_complete') {
    const { data } = await api.post(`${ECONOMY_PREFIX}/aura-points`, { amount, source });
    return data;
  }

  static async getCategories() {
    const { data } = await api.get(`${ECONOMY_PREFIX}/categories`);
    return data;
  }
}

// Store implementation
export const useMarketplaceStore = create<MarketplaceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        assets: [],
        inventory: [],
        economy: null,
        categories: [],
        isLoading: false,
        error: null,
        
        // Actions
        fetchAssets: async (params?: Record<string, string>) => {
          set({ isLoading: true, error: null });
          
          try {
            const assets = await MarketplaceAPI.getAssets(params);
            set({ assets, isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch assets' 
            });
          }
        },
        
        fetchInventory: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const inventory = await MarketplaceAPI.getInventory();
            set({ inventory, isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch inventory' 
            });
          }
        },
        
        fetchEconomy: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const economy = await MarketplaceAPI.getEconomy();
            set({ economy, isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch economy' 
            });
          }
        },
        
        purchaseAsset: async (assetId: string, quantity: number = 1) => {
          set({ isLoading: true, error: null });
          
          try {
            const asset = get().assets.find(a => a.id === assetId);
            await MarketplaceAPI.purchaseAsset(assetId, quantity);
            
            // Handle Side Effects
            if (asset) {
              if (asset.assetType === 'companion') {
                const { createAura } = (await import('./auraStore')).useAuraStore.getState();
                await createAura(asset.name, (asset.metadata?.archetype as ArchetypeId) ?? 'institutional_escapee');
              } else if (asset.assetType === 'skill') {
                const { updateAura, aura } = (await import('./auraStore')).useAuraStore.getState();
                if (aura) {
                  const newAbility = {
                    id: assetId,
                    name: asset.name,
                    description: asset.description,
                    abilityType: 'active' as const,
                    powerLevel: (asset.metadata?.powerLevel as number) || 1,
                    cooldown: (asset.metadata?.cooldown as number) || 60,
                    isUnlocked: true,
                    unlockedAt: new Date().toISOString()
                  };
                  await updateAura({ abilities: [...aura.abilities, newAbility] });
                }
              }
            }

            // Refresh economy and inventory
            await Promise.all([
              get().fetchEconomy(),
              get().fetchInventory()
            ]);
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to purchase asset' 
            });
          }
        },
        
        useAsset: async (inventoryId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            await MarketplaceAPI.useAsset(inventoryId);
            
            // Refresh inventory and economy
            await Promise.all([
              get().fetchInventory(),
              get().fetchEconomy()
            ]);
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to use asset' 
            });
          }
        },
        
        earnCredits: async (amount: number, source: string = 'daily_bonus') => {
          set({ isLoading: true, error: null });
          
          try {
            await MarketplaceAPI.earnCredits(amount, source);
            await get().fetchEconomy();
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to earn credits' 
            });
          }
        },

        addAuraPoints: async (amount: number, source: string = 'activity_complete') => {
          set({ isLoading: true, error: null });
          
          try {
            await MarketplaceAPI.addAuraPoints(amount, source);
            await get().fetchEconomy();
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to add aura points' 
            });
          }
        },
        
        fetchCategories: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await MarketplaceAPI.getCategories();
            set({ categories: response.categories, isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch categories' 
            });
          }
        },
        
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'marketplace-economy-store',
        partialize: (state) => ({
          economy: state.economy,
          inventory: state.inventory,
        }),
      }
    ),
    {
      name: 'marketplace-economy-store',
    }
  )
);

// Hooks for easier usage
export const useEconomy = () => useMarketplaceStore((state) => state.economy);
export const useInventory = () => useMarketplaceStore((state) => state.inventory);
export const useMarketplaceAssets = () => useMarketplaceStore((state) => state.assets);

export const useBalances = () =>
  useMarketplaceStore((state) => ({
    aura: state.economy?.auraPoints || 0,
    credits: state.economy?.credits || 0,
    gems: state.economy?.gems || 0,
    level: state.economy?.level || 1,
  }));

// Utility functions
export function getAssetRarityInfo(rarity: string) {
  const rarityMap = {
    common: { label: "Comum", color: "text-gray-600", name: 'Common', description: 'Standard asset', icon: '📦' },
    rare: { label: "Raro", color: "text-blue-600", name: 'Rare', description: 'Uncommon asset', icon: '💎' },
    epic: { label: "Épico", color: "text-purple-600", name: 'Epic', description: 'Special asset', icon: '⭐' },
    legendary: { label: "Lendário", color: "text-steel-600", name: 'Legendary', description: 'Ultra rare asset', icon: '👑' },
    mythic: { label: "Mítico", color: "text-red-600", name: 'Mythic', description: 'One of a kind', icon: '🔥' },
  };
  return rarityMap[rarity as keyof typeof rarityMap] || rarityMap.common;
}

export function canAfford(asset: { price: number; currency: string }, economy: UserEconomy | null) {
  if (!economy) return false;
  const balanceMap: Record<string, number> = {
    aura: economy.auraPoints,
    credits: economy.credits,
    gems: economy.gems,
  };
  const balance = balanceMap[asset.currency];
  return balance !== undefined ? balance >= asset.price : false;
}

export function formatCurrency(amount: number, currency: string) {
  if (currency === 'brl') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }
  
  const symbols: Record<string, string> = {
    aura: "AP",
    credits: "CR",
    gems: "GM",
  };
  return `${symbols[currency] || ""} ${amount.toLocaleString("pt-BR")}`;
}

export const getAssetCategoryInfo = (category: string) => {
  const categories = {
    companion: {
      name: 'Companions',
      description: 'New Auras to join your journey',
      icon: '🧬'
    },
    skill: {
      name: 'Skills',
      description: 'Abilities to boost your Aura',
      icon: '⚡'
    },
    accessory: {
      name: 'Accessories',
      description: 'Customization items',
      icon: '🎀'
    },
    consumable: {
      name: 'Consumables',
      description: 'Temporary boosts and items',
      icon: '🧪'
    }
  };
  
  return categories[category as keyof typeof categories] || { name: category, description: '', icon: '📦' };
};

export const getEffectTypeInfo = (effectType: string) => {
  const effectTypes = {
    xp_boost: {
      name: 'XP Boost',
      description: 'Increases companion experience',
      icon: '⬆️',
      color: '#10b981'
    },
    happiness_boost: {
      name: 'Happiness Boost',
      description: 'Increases companion happiness',
      icon: '😊',
      color: '#f59e0b'
    },
    energy_boost: {
      name: 'Energy Boost',
      description: 'Increases companion energy',
      icon: '⚡',
      color: '#3b82f6'
    },
    health_boost: {
      name: 'Health Boost',
      description: 'Increases companion health',
      icon: '❤️',
      color: '#ef4444'
    }
  };
  
  return effectTypes[effectType as keyof typeof effectTypes] || null;
};

export const getDailyBonus = () => {
  const today = new Date().toDateString();
  const lastBonus = localStorage.getItem('lastDailyBonus');
  
  if (lastBonus === today) {
    return { canClaim: false, amount: 0 };
  }
  
  // Calculate bonus based on user level or other factors
  const baseBonus = 100;
  const bonusAmount = baseBonus + Math.floor(Math.random() * 50);
  
  return { canClaim: true, amount: bonusAmount };
};

export const claimDailyBonus = async () => {
  const { canClaim, amount } = getDailyBonus();
  
  if (!canClaim) {
    throw new Error('Daily bonus already claimed today');
  }
  
  // Mark as claimed
  localStorage.setItem('lastDailyBonus', new Date().toDateString());
  
  return amount;
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMERCE STORE (Real-world products, BRL payments, Medusa-backed)
// ══════════════════════════════════════════════════════════════════════════════

export type { Product };

interface CommerceCatalogState {
  products: Product[];
  featuredProducts: Product[];
  olcanProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    product_type?: string;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    tags?: string[];
    sort_by?: string;
  };
  
  // Cart State
  cart: import("@/services/commerce").Cart | null;
  isCartLoading: boolean;
  cartError: string | null;
  isCartUpdating: string | null; // Item ID being updated/removed
  
  fetchProducts: (params?: Record<string, unknown>) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchOlcanProducts: (category?: string) => Promise<void>;
  fetchProduct: (slugOrId: string) => Promise<void>;
  setFilters: (filters: Record<string, unknown>) => void;
  clearFilters: () => void;
  clearError: () => void;
  reset: () => void;

  // Cart Actions
  fetchCart: () => Promise<void>;
  addToCart: (data: { product_id: string; quantity?: number; booking_date?: string; booking_notes?: string }) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearLocalCart: () => void;
}

const commerceInitialFilters = {
  product_type: undefined as string | undefined,
  category: undefined as string | undefined,
  search: undefined as string | undefined,
  min_price: undefined as number | undefined,
  max_price: undefined as number | undefined,
  tags: undefined as string[] | undefined,
  sort_by: "newest",
};

export const useCommerceStore = create<CommerceCatalogState>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        featuredProducts: [],
        olcanProducts: [],
        currentProduct: null,
        isLoading: false,
        error: null,
        filters: { ...commerceInitialFilters },
        
        cart: null,
        isCartLoading: false,
        cartError: null,
        isCartUpdating: null,

        fetchProducts: async (params) => {
          set({ isLoading: true, error: null });
          try {
            const filters = { ...get().filters, ...params };
            const response = await commerceService.listProducts(filters);
            set({ products: response.items, isLoading: false });
          } catch (error) {
            set({
              products: [],
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch products",
            });
          }
        },

        fetchFeaturedProducts: async () => {
          set({ isLoading: true, error: null });
          try {
            const products = await commerceService.getFeaturedProducts(10);
            set({ featuredProducts: products, isLoading: false });
          } catch (error) {
            set({
              featuredProducts: [],
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch featured products",
            });
          }
        },

        fetchOlcanProducts: async (category) => {
          set({ isLoading: true, error: null });
          try {
            const products = await commerceService.getOlcanProducts(category);
            set({ olcanProducts: products, isLoading: false });
          } catch (error) {
            set({
              olcanProducts: [],
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch Olcan products",
            });
          }
        },

        fetchProduct: async (slugOrId) => {
          set({ isLoading: true, error: null });
          try {
            const product = await commerceService.getProduct(slugOrId);
            set({ currentProduct: product, isLoading: false });
          } catch (error) {
            set({
              currentProduct: null,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch product",
            });
          }
        },

        setFilters: (newFilters) => {
          set({ filters: { ...get().filters, ...newFilters } });
        },

        clearFilters: () => {
          set({ filters: { ...commerceInitialFilters } });
        },

        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set({
            products: [],
            featuredProducts: [],
            olcanProducts: [],
            currentProduct: null,
            isLoading: false,
            error: null,
            filters: { ...commerceInitialFilters },
            cart: null,
            cartError: null,
          });
        },

        // Cart Actions Implementation
        fetchCart: async () => {
          set({ isCartLoading: true, cartError: null });
          try {
            const cart = await commerceService.getCart();
            set({ cart, isCartLoading: false });
          } catch (error) {
            set({
              isCartLoading: false,
              cartError: error instanceof Error ? error.message : "Failed to fetch cart",
            });
          }
        },
        addToCart: async (data) => {
          set({ isCartUpdating: "adding", cartError: null });
          try {
            const cart = await commerceService.addToCart(data);
            set({ cart, isCartUpdating: null });
          } catch (error) {
            set({
              isCartUpdating: null,
              cartError: error instanceof Error ? error.message : "Failed to add to cart",
            });
          }
        },
        updateCartItemQuantity: async (cartItemId, quantity) => {
          set({ isCartUpdating: cartItemId, cartError: null });
          try {
            if (quantity <= 0) {
              await commerceService.removeFromCart(cartItemId);
              const newCart = await commerceService.getCart();
              set({ cart: newCart, isCartUpdating: null });
            } else {
              const cart = await commerceService.updateCartItem(cartItemId, quantity);
              set({ cart, isCartUpdating: null });
            }
          } catch (error) {
            set({
              isCartUpdating: null,
              cartError: error instanceof Error ? error.message : "Failed to update item",
            });
          }
        },
        removeFromCart: async (cartItemId) => {
          set({ isCartUpdating: cartItemId, cartError: null });
          try {
            await commerceService.removeFromCart(cartItemId);
            const cart = await commerceService.getCart();
            set({ cart, isCartUpdating: null });
          } catch (error) {
            set({
              isCartUpdating: null,
              cartError: error instanceof Error ? error.message : "Failed to remove item",
            });
          }
        },
        clearLocalCart: () => {
           set({ cart: null });
        }
      }),
      {
        name: "commerce-store",
        partialize: (state) => ({
          filters: state.filters,
          cart: state.cart,
        }),
      }
    ),
    { name: "commerce-store" }
  )
);

export const useProducts = () => useCommerceStore((state) => state.products);
export const useFeaturedProducts = () => useCommerceStore((state) => state.featuredProducts);
export const useOlcanProducts = () => useCommerceStore((state) => state.olcanProducts);
export const useCurrentProduct = () => useCommerceStore((state) => state.currentProduct);
export const useCommerceLoading = () => useCommerceStore((state) => state.isLoading);
export const useCommerceError = () => useCommerceStore((state) => state.error);

export const useCart = () => useCommerceStore((state) => state.cart);
export const useCartState = () => useCommerceStore((state) => ({
  cart: state.cart,
  isLoading: state.isCartLoading,
  isUpdating: state.isCartUpdating,
  error: state.cartError,
}));

export const useCommerceActions = () =>
  useCommerceStore((state) => ({
    fetchProducts: state.fetchProducts,
    fetchFeaturedProducts: state.fetchFeaturedProducts,
    fetchOlcanProducts: state.fetchOlcanProducts,
    fetchProduct: state.fetchProduct,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    clearError: state.clearError,
    reset: state.reset,
    fetchCart: state.fetchCart,
    addToCart: state.addToCart,
    updateCartItemQuantity: state.updateCartItemQuantity,
    removeFromCart: state.removeFromCart,
    clearLocalCart: state.clearLocalCart,
  }));

export default useCommerceStore;
