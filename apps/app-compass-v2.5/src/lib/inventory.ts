/**
 * Inventory System
 * Items, consumables, and companion equipment
 */

export type ItemType = 'consumable' | 'evolution' | 'cosmetic' | 'boost' | 'special'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  icon: string
  stackable: boolean
  maxStack?: number
  effect?: {
    type: 'xp_boost' | 'energy_restore' | 'health_restore' | 'evolution_aid' | 'stat_boost'
    value: number
    duration?: number
  }
  price?: {
    currency: number
    premium?: boolean
  }
}

export interface InventoryItem extends Item {
  quantity: number
  acquiredAt: string
}

export interface UserInventory {
  userId: string
  items: InventoryItem[]
  currency: number
  premiumCurrency: number
  capacity: number
}

// Item Definitions
export const ITEMS: Record<string, Item> = {
  // Consumables
  energy_potion: {
    id: 'energy_potion',
    name: 'Energy Potion',
    description: 'Restores 20 energy to your companion',
    type: 'consumable',
    rarity: 'common',
    icon: '⚡',
    stackable: true,
    maxStack: 99,
    effect: {
      type: 'energy_restore',
      value: 20
    },
    price: {
      currency: 50
    }
  },
  
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 30 health to your companion',
    type: 'consumable',
    rarity: 'common',
    icon: '❤️',
    stackable: true,
    maxStack: 99,
    effect: {
      type: 'health_restore',
      value: 30
    },
    price: {
      currency: 50
    }
  },

  xp_boost_small: {
    id: 'xp_boost_small',
    name: 'XP Boost (Small)',
    description: 'Gain 50% more XP for 1 hour',
    type: 'boost',
    rarity: 'rare',
    icon: '⭐',
    stackable: true,
    maxStack: 10,
    effect: {
      type: 'xp_boost',
      value: 50,
      duration: 3600
    },
    price: {
      currency: 200
    }
  },

  xp_boost_large: {
    id: 'xp_boost_large',
    name: 'XP Boost (Large)',
    description: 'Gain 100% more XP for 2 hours',
    type: 'boost',
    rarity: 'epic',
    icon: '🌟',
    stackable: true,
    maxStack: 5,
    effect: {
      type: 'xp_boost',
      value: 100,
      duration: 7200
    },
    price: {
      currency: 500,
      premium: true
    }
  },

  // Evolution Items
  evolution_stone: {
    id: 'evolution_stone',
    name: 'Evolution Stone',
    description: 'Helps your companion evolve faster',
    type: 'evolution',
    rarity: 'rare',
    icon: '💎',
    stackable: true,
    maxStack: 20,
    effect: {
      type: 'evolution_aid',
      value: 500
    },
    price: {
      currency: 1000
    }
  },

  rare_evolution_stone: {
    id: 'rare_evolution_stone',
    name: 'Rare Evolution Stone',
    description: 'Significantly speeds up evolution progress',
    type: 'evolution',
    rarity: 'epic',
    icon: '💠',
    stackable: true,
    maxStack: 10,
    effect: {
      type: 'evolution_aid',
      value: 2000
    },
    price: {
      currency: 3000,
      premium: true
    }
  },

  // Special Items
  starter_pack: {
    id: 'starter_pack',
    name: 'Starter Pack',
    description: 'Contains useful items for new companions',
    type: 'special',
    rarity: 'common',
    icon: '🎁',
    stackable: false
  },

  skill_book: {
    id: 'skill_book',
    name: 'Skill Book',
    description: 'Teaches your companion a new ability',
    type: 'special',
    rarity: 'epic',
    icon: '📚',
    stackable: true,
    maxStack: 5,
    price: {
      currency: 2500
    }
  },

  confidence_boost: {
    id: 'confidence_boost',
    name: 'Confidence Boost',
    description: 'Increases charisma stat by 5 for 24 hours',
    type: 'boost',
    rarity: 'rare',
    icon: '✨',
    stackable: true,
    maxStack: 10,
    effect: {
      type: 'stat_boost',
      value: 5,
      duration: 86400
    },
    price: {
      currency: 300
    }
  },

  evolution_certificate: {
    id: 'evolution_certificate',
    name: 'Evolution Certificate',
    description: 'Commemorates your companion\'s first evolution',
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🏅',
    stackable: false
  }
}

// Helper Functions
export function getItem(itemId: string): Item | undefined {
  return ITEMS[itemId]
}

export function getItemsByType(type: ItemType): Item[] {
  return Object.values(ITEMS).filter(item => item.type === type)
}

export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return Object.values(ITEMS).filter(item => item.rarity === rarity)
}

export function canStackItem(item: Item, currentQuantity: number): boolean {
  if (!item.stackable) return false
  if (!item.maxStack) return true
  return currentQuantity < item.maxStack
}

export function useItem(item: Item, companionId: string): {
  success: boolean
  message: string
  effect?: any
} {
  if (!item.effect) {
    return {
      success: false,
      message: 'This item has no effect'
    }
  }

  // Item usage logic would be implemented here
  return {
    success: true,
    message: `Used ${item.name}`,
    effect: item.effect
  }
}

export function getRarityColor(rarity: ItemRarity): string {
  const colors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-yellow-500 to-orange-500'
  }
  return colors[rarity]
}

export function getItemValue(item: Item): number {
  return item.price?.currency || 0
}

export function canAffordItem(item: Item, userCurrency: number, userPremiumCurrency: number): boolean {
  if (!item.price) return false
  
  if (item.price.premium) {
    return userPremiumCurrency >= item.price.currency
  }
  
  return userCurrency >= item.price.currency
}

export function calculateInventoryValue(inventory: InventoryItem[]): number {
  return inventory.reduce((total, item) => {
    return total + (getItemValue(item) * item.quantity)
  }, 0)
}
