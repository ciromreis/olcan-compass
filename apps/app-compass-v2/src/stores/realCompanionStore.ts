/**
 * @deprecated Legacy companion store.
 * Use `@/stores/canonicalCompanionStore` (re-exports `useAuraStore` from `auraStore.ts`) instead.
 *
 * Real Working Companion Store
 * Actually connects to backend API and manages real data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface Companion {
  id: number
  name: string
  archetype: string
  evolutionStage: string
  level: number
  experiencePoints: number
  health: number
  happiness: number
  energy: number
  createdAt: string
  lastCaredAt: string
  stats?: CompanionStats
  abilities?: CompanionAbility[]
}

interface CompanionStats {
  id: number
  power: number
  wisdom: number
  charisma: number
  agility: number
  battlesWon: number
  battlesLost: number
}

interface CompanionAbility {
  id: number
  name: string
  description: string
  abilityType: string
  powerLevel: number
  cooldown?: number
  unlockedAt: string
}

interface CompanionActivity {
  id: number
  activityType: string
  xpGained: number
  happinessChange: number
  energyChange: number
  healthChange: number
  performedAt: string
}

interface CompanionState {
  // State
  companion: Companion | null
  isLoading: boolean
  error: string | null
  
  // Actions
  createCompanion: (name: string, archetype: string) => Promise<void>
  fetchCompanion: () => Promise<void>
  performCareActivity: (activityType: string) => Promise<void>
  updateCompanion: (updates: Partial<Companion>) => void
  clearError: () => void
  
  // Computed
  canPerformActivity: (activityType: string) => boolean
  getEvolutionProgress: () => number
  getNextEvolutionStage: () => string | null
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class CompanionAPI {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/v1${endpoint}`
    
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
  
  static async createCompanion(name: string, archetype: string) {
    return this.request('/companions', {
      method: 'POST',
      body: JSON.stringify({ name, archetype }),
    })
  }
  
  static async getCompanion() {
    const companions = await this.request('/companions')
    return companions[0] || null
  }
  
  static async performCareActivity(companionId: number, activityType: string) {
    return this.request(`/companions/${companionId}/care`, {
      method: 'POST',
      body: JSON.stringify({ activity_type: activityType }),
    })
  }
  
  static async getCompanionStats(companionId: number) {
    return this.request(`/companions/${companionId}/stats`)
  }
  
  static async getCompanionAbilities(companionId: number) {
    return this.request(`/companions/${companionId}/abilities`)
  }
}

// Store implementation
export const useCompanionStore = create<CompanionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        companion: null,
        isLoading: false,
        error: null,
        
        // Actions
        createCompanion: async (name: string, archetype: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await CompanionAPI.createCompanion(name, archetype)
            
            // Fetch full companion data after creation
            await get().fetchCompanion()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to create companion' 
            })
          }
        },
        
        fetchCompanion: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const companion = await CompanionAPI.getCompanion()
            
            if (companion) {
              // Fetch additional data
              const [stats, abilities] = await Promise.all([
                CompanionAPI.getCompanionStats(companion.id),
                CompanionAPI.getCompanionAbilities(companion.id)
              ])
              
              set({ 
                companion: {
                  ...companion,
                  stats,
                  abilities,
                },
                isLoading: false 
              })
            } else {
              set({ companion: null, isLoading: false })
            }
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch companion' 
            })
          }
        },
        
        performCareActivity: async (activityType: string) => {
          const { companion } = get()
          if (!companion) return
          
          set({ isLoading: true, error: null })
          
          try {
            const activity = await CompanionAPI.performCareActivity(companion.id, activityType)
            
            // Update companion stats based on activity
            set(state => ({
              companion: state.companion ? {
                ...state.companion,
                experiencePoints: state.companion.experiencePoints + activity.xpGained,
                happiness: Math.max(0, Math.min(100, state.companion.happiness + activity.happinessChange)),
                energy: Math.max(0, Math.min(100, state.companion.energy + activity.energyChange)),
                health: Math.max(0, Math.min(100, state.companion.health + activity.healthChange)),
                lastCaredAt: new Date().toISOString(),
              } : null,
              isLoading: false
            }))
            
            // Check for level up
            const newLevel = Math.floor(companion.experiencePoints / 100) + 1
            if (newLevel > companion.level) {
              set(state => ({
                companion: state.companion ? {
                  ...state.companion,
                  level: newLevel,
                } : null
              }))
            }
            
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to perform activity' 
            })
          }
        },
        
        updateCompanion: (updates: Partial<Companion>) => {
          set(state => ({
            companion: state.companion ? { ...state.companion, ...updates } : null
          }))
        },
        
        clearError: () => {
          set({ error: null })
        },
        
        // Computed
        canPerformActivity: (activityType: string) => {
          const { companion } = get()
          if (!companion) return false
          
          const energyCosts = {
            feed: 10,
            train: 15,
            play: 10,
            rest: 0
          }
          
          return companion.energy >= (energyCosts[activityType as keyof typeof energyCosts] || 0)
        },
        
        getEvolutionProgress: () => {
          const { companion } = get()
          if (!companion) return 0
          
          const stages = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
          const currentIndex = stages.indexOf(companion.evolutionStage)
          const totalStages = stages.length
          
          return ((currentIndex + 1) / totalStages) * 100
        },
        
        getNextEvolutionStage: () => {
          const { companion } = get()
          if (!companion) return null
          
          const stages = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
          const currentIndex = stages.indexOf(companion.evolutionStage)
          
          if (currentIndex < stages.length - 1) {
            return stages[currentIndex + 1]
          }
          
          return null
        },
      }),
      {
        name: 'companion-store',
        partialize: (state) => ({
          companion: state.companion,
        }),
      }
    ),
    {
      name: 'companion-store',
    }
  )
)

// Hooks for easier usage
export const useCompanion = () => useCompanionStore()
export const useCompanionActions = () => useCompanionStore(state => state)

// Utility functions
export const getArchetypeInfo = (archetype: string) => {
  const archetypes = {
    strategist: {
      name: 'Strategist',
      description: 'Master of planning and tactics',
      color: '#8b5cf6',
      icon: '🧠'
    },
    innovator: {
      name: 'Innovator',
      description: 'Creative problem solver',
      color: '#06b6d4',
      icon: '💡'
    },
    creator: {
      name: 'Creator',
      description: 'Artistic and imaginative',
      color: '#10b981',
      icon: '🎨'
    },
    diplomat: {
      name: 'Diplomat',
      description: 'Skilled communicator',
      color: '#3b82f6',
      icon: '🤝'
    },
    pioneer: {
      name: 'Pioneer',
      description: 'Bold explorer',
      color: '#f97316',
      icon: '🚀'
    },
    scholar: {
      name: 'Scholar',
      description: 'Knowledge seeker',
      color: '#6366f1',
      icon: '📚'
    }
  }
  
  return archetypes[archetype as keyof typeof archetypes] || archetypes.strategist
}

export const getEvolutionStageInfo = (stage: string) => {
  const stages = {
    egg: {
      name: 'Egg',
      description: 'Just beginning your journey',
      color: '#fbbf24',
      icon: '🥚'
    },
    sprout: {
      name: 'Sprout',
      description: 'Growing stronger',
      color: '#84cc16',
      icon: '🌱'
    },
    young: {
      name: 'Young',
      description: 'Developing skills',
      color: '#10b981',
      icon: '🌿'
    },
    mature: {
      name: 'Mature',
      description: 'Experienced and wise',
      color: '#06b6d4',
      icon: '🌳'
    },
    master: {
      name: 'Master',
      description: 'Expert in your field',
      color: '#8b5cf6',
      icon: '⭐'
    },
    legendary: {
      name: 'Legendary',
      description: 'Truly exceptional',
      color: '#f59e0b',
      icon: '🌟'
    }
  }
  
  return stages[stage as keyof typeof stages] || stages.egg
}

export const getActivityInfo = (activityType: string) => {
  const activities = {
    feed: {
      name: 'Feed',
      description: 'Give your companion food',
      icon: '🍖',
      energyCost: 10,
      xpGain: 10,
      happinessGain: 5
    },
    train: {
      name: 'Train',
      description: 'Practice skills together',
      icon: '💪',
      energyCost: 15,
      xpGain: 20,
      happinessGain: -5
    },
    play: {
      name: 'Play',
      description: 'Have fun together',
      icon: '🎮',
      energyCost: 10,
      xpGain: 5,
      happinessGain: 15
    },
    rest: {
      name: 'Rest',
      description: 'Take a break together',
      icon: '😴',
      energyCost: 0,
      xpGain: 0,
      happinessGain: 0
    }
  }
  
  return activities[activityType as keyof typeof activities] || activities.feed
}
