/**
 * Real Working Marketplace Store
 * Actually connects to backend API and manages real marketplace data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface MarketplaceItem {
  id: number
  name: string
  description: string
  category: string
  itemType: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effectType?: string
  effectValue?: number
  icon: string
  createdAt: string
}

interface UserInventory {
  id: number
  itemId: number
  quantity: number
  purchasedAt: string
  item: MarketplaceItem | null
}

interface UserEconomy {
  coins: number
  gems: number
  premiumExpiresAt?: string
  transactions: Transaction[]
}

interface Transaction {
  id: number
  transactionType: 'purchase' | 'sale'
  amount: number
  paymentMethod: string
  createdAt: string
  item?: {
    id: number
    name: string
    icon: string
  }
}

interface MarketplaceState {
  // State
  items: MarketplaceItem[]
  inventory: UserInventory[]
  economy: UserEconomy | null
  categories: string[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchItems: (params?: any) => Promise<void>
  fetchInventory: () => Promise<void>
  fetchEconomy: () => Promise<void>
  purchaseItem: (itemId: number, quantity?: number) => Promise<void>
  useItem: (inventoryId: number) => Promise<void>
  earnCoins: (amount: number, source?: string) => Promise<void>
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
  
  static async getItems(params?: any) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/items${query ? '?' + query : ''}`)
  }
  
  static async getInventory() {
    return this.request('/inventory')
  }
  
  static async getEconomy() {
    return this.request('/economy')
  }
  
  static async purchaseItem(itemId: number, quantity: number = 1) {
    return this.request(`/purchase/${itemId}?quantity=${quantity}`, {
      method: 'POST',
    })
  }
  
  static async useItem(inventoryId: number) {
    return this.request(`/use/${inventoryId}`, {
      method: 'POST',
    })
  }
  
  static async earnCoins(amount: number, source: string = 'daily_bonus') {
    return this.request(`/earn-coins`, {
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
        items: [],
        inventory: [],
        economy: null,
        categories: [],
        isLoading: false,
        error: null,
        
        // Actions
        fetchItems: async (params?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const items = await MarketplaceAPI.getItems(params)
            set({ items, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch items' 
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
        
        purchaseItem: async (itemId: number, quantity: number = 1) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.purchaseItem(itemId, quantity)
            
            // Refresh economy and inventory
            await Promise.all([
              get().fetchEconomy(),
              get().fetchInventory()
            ])
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to purchase item' 
            })
          }
        },
        
        useItem: async (inventoryId: number) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.useItem(inventoryId)
            
            // Refresh inventory
            await get().fetchInventory()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to use item' 
            })
          }
        },
        
        earnCoins: async (amount: number, source: string = 'daily_bonus') => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await MarketplaceAPI.earnCoins(amount, source)
            
            // Refresh economy
            await get().fetchEconomy()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to earn coins' 
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
        name: 'marketplace-store',
        partialize: (state) => ({
          economy: state.economy,
        }),
      }
    ),
    {
      name: 'marketplace-store',
    }
  )
)

// Hooks for easier usage
export const useMarketplace = () => useMarketplaceStore()
export const useMarketplaceActions = () => useMarketplaceStore(state => state)

// Utility functions
export const getItemRarityInfo = (rarity: string) => {
  const rarities = {
    common: {
      name: 'Common',
      description: 'Standard item',
      color: '#6b7280',
      icon: '📦'
    },
    rare: {
      name: 'Rare',
      description: 'Uncommon item',
      color: '#3b82f6',
      icon: '💎'
    },
    epic: {
      name: 'Epic',
      description: 'Special item',
      color: '#8b5cf6',
      icon: '⭐'
    },
    legendary: {
      name: 'Legendary',
      description: 'Ultra rare item',
      color: '#f59e0b',
      icon: '👑'
    }
  }
  
  return rarities[rarity as keyof typeof rarities] || rarities.common
}

export const getItemCategoryInfo = (category: string) => {
  const categories = {
    companion_accessory: {
      name: 'Companion Accessories',
      description: 'Items to customize your companion',
      icon: '🎀'
    },
    consumable: {
      name: 'Consumables',
      description: 'Items that provide temporary effects',
      icon: '🧪'
    },
    special: {
      name: 'Special Items',
      description: 'Unique and powerful items',
      icon: '✨'
    }
  }
  
  return categories[category as keyof typeof categories] || categories.companion_accessory
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

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

export const canAfford = (price: number, userCoins: number) => {
  return userCoins >= price
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
