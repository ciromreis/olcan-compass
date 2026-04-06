/**
 * Real Working Marketplace Store
 * Actually connects to backend API and manages real marketplace data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
export type AssetType = 'item' | 'skill' | 'companion' | 'accessory' | 'bundle'
export type CurrencyType = 'aura' | 'credits' | 'gems' | 'brl'
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface MarketplaceAsset {
  id: string
  name: string
  description: string
  shortDescription?: string
  category: string
  assetType: AssetType
  price: number
  currency: CurrencyType
  rarity: RarityType
  icon: string
  thumbnail?: string
  tags?: string[]
  metadata?: Record<string, any>
  isFeatured?: boolean
  isNew?: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryAsset {
  id: string
  assetId: string
  userId: string
  assetType: AssetType
  quantity: number
  unlockedAt: string
  metadata?: Record<string, any>
  asset?: MarketplaceAsset | null
}

export interface UserEconomy {
  auraPoints: number // System level/XP points
  credits: number    // Paid currency (formerly coins)
  gems: number       // Premium currency
  level: number
  nextLevelXp: number
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'purchase' | 'reward' | 'burn' | 'refund'
  amount: number
  currency: CurrencyType
  status: 'pending' | 'completed' | 'failed'
  assetId?: string
  assetName?: string
  createdAt: string
}

interface MarketplaceState {
  // State
  assets: MarketplaceAsset[]
  inventory: InventoryAsset[]
  economy: UserEconomy | null
  categories: string[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAssets: (params?: any) => Promise<void>
  fetchInventory: () => Promise<void>
  fetchEconomy: () => Promise<void>
  purchaseAsset: (assetId: string, quantity?: number) => Promise<void>
  useAsset: (inventoryId: string) => Promise<void>
  earnCredits: (amount: number, source?: string) => Promise<void>
  addAuraPoints: (amount: number, source?: string) => Promise<void>
  fetchCategories: () => Promise<void>
  clearError: () => void
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class MarketplaceAPI {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/v1/marketplace${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Request failed')
    }
    
    return response.json()
  }
  
  static async getAssets(params?: any) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/assets${query ? '?' + query : ''}`)
  }
  
  static async getInventory() {
    return this.request('/inventory')
  }
  
  static async getEconomy() {
    return this.request('/economy')
  }
  
  static async purchaseAsset(assetId: string, quantity: number = 1) {
    return this.request(`/purchase/${assetId}?quantity=${quantity}`, {
      method: 'POST',
    })
  }
  
  static async useAsset(inventoryId: string) {
    return this.request(`/use/${inventoryId}`, {
      method: 'POST',
    })
  }
  
  static async earnCredits(amount: number, source: string = 'daily_bonus') {
    return this.request(`/earn-credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, source }),
    })
  }

  static async addAuraPoints(amount: number, source: string = 'activity_complete') {
    return this.request(`/aura-points`, {
      method: 'POST',
      body: JSON.stringify({ amount, source }),
    })
  }
  
  static async getCategories() {
    return this.request('/categories')
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
        fetchAssets: async (params?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const assets = await MarketplaceAPI.getAssets(params)
            set({ assets, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch assets' 
            })
          }
        },
        
        fetchInventory: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const inventory = await MarketplaceAPI.getInventory()
            set({ inventory, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch inventory' 
            })
          }
        },
        
        fetchEconomy: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const economy = await MarketplaceAPI.getEconomy()
            set({ economy, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch economy' 
            })
          }
        },
        
        purchaseAsset: async (assetId: string, quantity: number = 1) => {
          set({ isLoading: true, error: null })
          
          try {
            const asset = get().assets.find(a => a.id === assetId)
            const response = await MarketplaceAPI.purchaseAsset(assetId, quantity)
            
            // Handle Side Effects
            if (asset) {
              if (asset.assetType === 'companion') {
                const { createAura } = (await import('./auraStore')).useAuraStore.getState()
                await createAura(asset.name, asset.metadata?.archetype || 'strategist')
              } else if (asset.assetType === 'skill') {
                const { updateAura, aura } = (await import('./auraStore')).useAuraStore.getState()
                if (aura) {
                  const newAbility = {
                    id: assetId,
                    name: asset.name,
                    description: asset.description,
                    abilityType: 'active' as const,
                    powerLevel: asset.metadata?.powerLevel || 1,
                    cooldown: asset.metadata?.cooldown || 60,
                    isUnlocked: true,
                    unlockedAt: new Date().toISOString()
                  }
                  await updateAura({ abilities: [...aura.abilities, newAbility] })
                }
              }
            }

            // Refresh economy and inventory
            await Promise.all([
              get().fetchEconomy(),
              get().fetchInventory()
            ])
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to purchase asset' 
            })
          }
        },
        
        useAsset: async (inventoryId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.useAsset(inventoryId)
            
            // Refresh inventory and economy
            await Promise.all([
              get().fetchInventory(),
              get().fetchEconomy()
            ])
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to use asset' 
            })
          }
        },
        
        earnCredits: async (amount: number, source: string = 'daily_bonus') => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.earnCredits(amount, source)
            await get().fetchEconomy()
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to earn credits' 
            })
          }
        },

        addAuraPoints: async (amount: number, source: string = 'activity_complete') => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.addAuraPoints(amount, source)
            await get().fetchEconomy()
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to add aura points' 
            })
          }
        },
        
        fetchCategories: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.getCategories()
            set({ categories: response.categories, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch categories' 
            })
          }
        },
        
        clearError: () => {
          set({ error: null })
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
)

// Hooks for easier usage
export const useMarketplace = () => useMarketplaceStore()
export const useMarketplaceActions = () => useMarketplaceStore(state => state)

// Utility functions
export const getAssetRarityInfo = (rarity: string) => {
  const rarities = {
    common: {
      name: 'Common',
      description: 'Standard asset',
      color: '#6b7280',
      icon: '📦'
    },
    rare: {
      name: 'Rare',
      description: 'Uncommon asset',
      color: '#3b82f6',
      icon: '💎'
    },
    epic: {
      name: 'Epic',
      description: 'Special asset',
      color: '#8b5cf6',
      icon: '⭐'
    },
    legendary: {
      name: 'Legendary',
      description: 'Ultra rare asset',
      color: '#f59e0b',
      icon: '👑'
    },
    mythic: {
      name: 'Mythic',
      description: 'One of a kind',
      color: '#ef4444',
      icon: '🔥'
    }
  }
  
  return rarities[rarity as keyof typeof rarities] || rarities.common
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
  }
  
  return categories[category as keyof typeof categories] || { name: category, description: '', icon: '📦' }
}

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
  }
  
  return effectTypes[effectType as keyof typeof effectTypes] || null
}

export const formatCurrency = (amount: number, currency: CurrencyType = 'brl') => {
  if (currency === 'brl') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }
  
  const symbols = {
    aura: '✨',
    credits: '🪙',
    gems: '💎',
  }
  
  return `${symbols[currency as keyof typeof symbols] || ''} ${amount}`
}

export const canAfford = (asset: MarketplaceAsset, economy: UserEconomy | null) => {
  if (!economy) return false
  
  switch (asset.currency) {
    case 'aura': return economy.auraPoints >= asset.price
    case 'credits': return economy.credits >= asset.price
    case 'gems': return economy.gems >= asset.price
    case 'brl': return true // Usually handled via external checkout
    default: return false
  }
}

export const getDailyBonus = () => {
  const today = new Date().toDateString()
  const lastBonus = localStorage.getItem('lastDailyBonus')
  
  if (lastBonus === today) {
    return { canClaim: false, amount: 0 }
  }
  
  // Calculate bonus based on user level or other factors
  const baseBonus = 100
  const bonusAmount = baseBonus + Math.floor(Math.random() * 50)
  
  return { canClaim: true, amount: bonusAmount }
}

export const claimDailyBonus = async () => {
  const { canClaim, amount } = getDailyBonus()
  
  if (!canClaim) {
    throw new Error('Daily bonus already claimed today')
  }
  
  // Mark as claimed
  localStorage.setItem('lastDailyBonus', new Date().toDateString())
  
  return amount
}
