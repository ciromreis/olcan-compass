/**
 * Aura Store - v2.5
 * 
 * This is the SINGLE SOURCE OF TRUTH for Aura state management.
 * 
 * Architecture:
 * - Domain state (aura data) synced with backend
 * - UI state (selection, loading) local only
 * - Gamification events emitted to separate gamification store
 * - Real-time updates via WebSocket or polling
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type ArchetypeId } from '@/lib/archetypes'
import { auraApi } from '@/lib/api'
import { RecombinationProfile } from '@/lib/recombination'

// ============================================================================
// TYPES - Aligned with Backend API Contract
// ============================================================================

// ArchetypeType is an alias for ArchetypeId (canonical system in archetypes.ts)
export type ArchetypeType = ArchetypeId

export interface Aura {
  id: string
  userId: string
  name: string
  archetype: ArchetypeType
  evolutionStage: EvolutionStage
  level: number
  experiencePoints: number
  xpToNextLevel: number
  health: number
  maxHealth: number
  happiness: number
  energy: number
  maxEnergy: number
  stats: AuraStats
  abilities: AuraAbility[]
  createdAt: string
  updatedAt: string
  lastCaredAt: string | null
  ritualAffinity?: Record<string, number>
  recombination?: RecombinationProfile
}

export type EvolutionStage = 'egg' | 'sprout' | 'young' | 'mature' | 'master' | 'legendary'

export interface AuraStats {
  power: number
  wisdom: number
  charisma: number
  agility: number
  battlesWon: number
  battlesLost: number
}

export interface AuraAbility {
  id: string
  name: string
  description: string
  abilityType: 'active' | 'passive' | 'special'
  powerLevel: number
  cooldown: number | null
  unlockedAt: string | null
  isUnlocked: boolean
}

export interface CareActivity {
  id: string
  type: CareActivityType
  xpReward: number
  energyCost: number
  healthChange: number
  happinessChange: number
  description: string
  icon: string
  performedAt: string
}

export type CareActivityType = 'feed' | 'train' | 'play' | 'rest' | 'groom' | 'socialize'

export interface EvolutionRequirement {
  minLevel: number
  minCareStreak: number
  requiredAchievements: string[]
  minDaysAtStage: number
}

// ============================================================================
// EVENT TYPES - For Cross-Store Communication
// ============================================================================

export interface AuraEvent {
  type: AuraEventType
  auraId: string
  userId: string
  timestamp: string
  payload: Record<string, unknown>
}

export type AuraEventType =
  | 'aura.created'
  | 'aura.cared'
  | 'aura.leveled'
  | 'aura.evolved'
  | 'aura.ability_unlocked'
  | 'aura.streak_updated'

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface AuraStoreState {
  // Domain State - Synced with backend
  aura: Aura | null
  careHistory: CareActivity[]
  evolutionRequirements: Record<EvolutionStage, EvolutionRequirement>
  
  // UI State - Local only, not persisted
  selectedAuraId: string | null
  isLoading: boolean
  error: string | null
  lastSyncAt: string | null
  
  // Ritual State
  isRitualInProgress: boolean
  ritualAffinity: Record<string, number> | null
  
  // Computed Getters
  canPerformCare: (activityType: CareActivityType) => boolean
  getEvolutionProgress: () => number
  getNextEvolutionStage: () => EvolutionStage | null
  getDaysSinceLastCare: () => number | null
  getCareStreak: () => number
}

interface AuraStoreActions {
  // Core CRUD
  fetchAura: () => Promise<void>
  createAura: (name: string, archetype: ArchetypeType) => Promise<void>
  updateAura: (updates: Partial<Aura>) => Promise<void>
  
  // Care Activities
  performCareActivity: (activityType: CareActivityType) => Promise<void>
  fetchCareHistory: (limit?: number) => Promise<void>
  
  // Evolution
  checkEvolutionEligibility: () => Promise<boolean>
  prepareRitual: () => void
  triggerEvolution: (payload?: Record<string, unknown>) => Promise<void>
  
  // Marketplace XP Integration
  addExperience: (amount: number) => void
  
  // UI Actions
  selectAura: (id: string | null) => void
  clearError: () => void
  resetStore: () => void
  
  // Event Subscription (for gamification integration)
  onAuraEvent: (callback: (event: AuraEvent) => void) => () => void
}

// ============================================================================
// DEMO MODE
// ============================================================================

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

function makeDemoAura(name: string, archetype: ArchetypeType): Aura {
  return {
    id: 'demo-aura-1',
    userId: 'demo-user-1',
    name,
    archetype,
    evolutionStage: 'sprout',
    level: 1,
    experiencePoints: 0,
    xpToNextLevel: 100,
    health: 80,
    maxHealth: 100,
    happiness: 75,
    energy: 60,
    maxEnergy: 100,
    stats: { power: 10, wisdom: 10, charisma: 10, agility: 10, battlesWon: 0, battlesLost: 0 },
    abilities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCaredAt: null,
    recombination: {
      weights: [
        { id: archetype, weight: 100, label: archetype.replace(/_/g, ' ') }
      ],
      dominantId: archetype,
      secondaryId: archetype,
      tertiaryId: archetype,
      manifestationSeed: 123
    }
  }
}

// ============================================================================
// API ADAPTER
// ============================================================================
const ACTIVITY_PRESENTATION: Record<CareActivityType, Pick<CareActivity, 'icon' | 'description' | 'healthChange' | 'happinessChange'>> = {
  feed: { icon: 'heart', description: 'Calibrou a Aura', healthChange: 5, happinessChange: 5 },
  train: { icon: 'zap', description: 'Potencializou a Aura', healthChange: 0, happinessChange: -5 },
  play: { icon: 'sparkles', description: 'Manifestou a Aura', healthChange: 0, happinessChange: 15 },
  rest: { icon: 'shield', description: 'Preservou a Aura', healthChange: 10, happinessChange: 3 },
  groom: { icon: 'droplets', description: 'Harmonizou a Aura', healthChange: 5, happinessChange: 10 },
  socialize: { icon: 'users', description: 'Conectou a Aura', healthChange: 0, happinessChange: 20 },
}

interface CareActivityResponse {
  id?: string
  type?: CareActivityType
  xpReward?: number
  energyCost?: number
  description?: string
  performedAt?: string
}

interface AuraCareResponse extends Aura {
  activityResult?: {
    type?: CareActivityType
    xpGained?: number
    energyChange?: number
    happinessChange?: number
    healthChange?: number
    leveledUp?: boolean
    newLevel?: number
  }
}

class AuraApiClient {
  static async getAura(): Promise<Aura | null> {
    const { data } = await auraApi.getAll()
    return (Array.isArray(data) ? data[0] : null) as Aura | null
  }

  static async createAura(name: string, archetype: ArchetypeType): Promise<Aura> {
    const { data } = await auraApi.create({ name, archetype })
    return data as Aura
  }

  static async performCareActivity(
    auraId: string,
    activityType: CareActivityType
  ): Promise<{ aura: Aura; activity: CareActivity }> {
    const { data } = await auraApi.care(auraId, activityType)
    const response = data as AuraCareResponse
    const activityMeta = ACTIVITY_PRESENTATION[activityType]
    const activityResult = response.activityResult || {}

    return {
      aura: response as Aura,
      activity: {
        id: `${auraId}-${activityType}-${response.updatedAt || Date.now()}`,
        type: activityType,
        xpReward: activityResult.xpGained ?? 0,
        energyCost: Math.abs(activityResult.energyChange ?? 0),
        healthChange: activityResult.healthChange ?? activityMeta.healthChange,
        happinessChange: activityResult.happinessChange ?? activityMeta.happinessChange,
        description: activityMeta.description,
        icon: activityMeta.icon,
        performedAt: response.lastCaredAt || new Date().toISOString(),
      },
    }
  }

  static async getCareHistory(auraId: string, limit: number = 50): Promise<CareActivity[]> {
    const { data } = await auraApi.getActivities(auraId, limit)
    return ((Array.isArray(data) ? data : []) as CareActivityResponse[]).map((item) => {
      const type = item.type || 'feed'
      const meta = ACTIVITY_PRESENTATION[type]
      return {
        id: item.id || `${auraId}-${type}-${item.performedAt || Date.now()}`,
        type,
        xpReward: item.xpReward || 0,
        energyCost: item.energyCost || 0,
        healthChange: meta.healthChange,
        happinessChange: meta.happinessChange,
        description: item.description || meta.description,
        icon: meta.icon,
        performedAt: item.performedAt || new Date().toISOString(),
      }
    })
  }

  static async checkEvolutionEligibility(
    auraId: string
  ): Promise<{ eligible: boolean; requirements: EvolutionRequirement }> {
    const { data } = await auraApi.checkEvolution(auraId)
    const response = data as {
      eligible?: boolean
      requirements?: {
        minLevel?: number
      }
    }

    return {
      eligible: Boolean(response.eligible),
      requirements: {
        minLevel: response.requirements?.minLevel || 0,
        minCareStreak: 0,
        requiredAchievements: [],
        minDaysAtStage: 0,
      },
    }
  }

  static async updateAura(_auraId: string, _updates: Partial<Aura>): Promise<Aura> {
    throw new Error('Atualização parcial da Aura ainda não está exposta pela API v2.5.')
  }

  static async triggerEvolution(auraId: string, payload?: Record<string, unknown>): Promise<Aura> {
    const { data } = await auraApi.evolve(auraId, payload)
    return data as Aura
  }
}

// ============================================================================
// EVENT EMITTER (for cross-store communication)
// ============================================================================

class AuraEventEmitter {
  private listeners: Set<(event: AuraEvent) => void> = new Set()
  
  emit(event: AuraEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in aura event listener:', error)
      }
    })
  }
  
  subscribe(callback: (event: AuraEvent) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
}

const eventEmitter = new AuraEventEmitter()

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const initialState: Omit<
  AuraStoreState & AuraStoreActions,
  keyof AuraStoreActions
> = {
  aura: null,
  careHistory: [],
  evolutionRequirements: {
    egg: { minLevel: 1, minCareStreak: 0, requiredAchievements: [], minDaysAtStage: 0 },
    sprout: { minLevel: 5, minCareStreak: 3, requiredAchievements: ['first_care'], minDaysAtStage: 2 },
    young: { minLevel: 10, minCareStreak: 7, requiredAchievements: ['care_streak_7'], minDaysAtStage: 5 },
    mature: { minLevel: 20, minCareStreak: 14, requiredAchievements: ['care_streak_14', 'first_evolution'], minDaysAtStage: 10 },
    master: { minLevel: 35, minCareStreak: 30, requiredAchievements: ['care_streak_30', 'max_level_reached'], minDaysAtStage: 20 },
    legendary: { minLevel: 50, minCareStreak: 60, requiredAchievements: ['care_streak_60', 'all_abilities'], minDaysAtStage: 30 },
  },
  selectedAuraId: null,
  isLoading: false,
  error: null,
  lastSyncAt: null,
  isRitualInProgress: false,
  ritualAffinity: null,
  
  canPerformCare: () => false,
  getEvolutionProgress: () => 0,
  getNextEvolutionStage: () => null,
  getDaysSinceLastCare: () => null,
  getCareStreak: () => 0,
}

export const useAuraStore = create<
  AuraStoreState & AuraStoreActions
>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        canPerformCare: (activityType: CareActivityType) => {
          const { aura } = get()
          if (!aura) return false
          
          const activityCosts: Record<CareActivityType, number> = {
            feed: 5,
            train: 15,
            play: 8,
            rest: 0,
            groom: 3,
            socialize: 10,
          }
          
          return aura.energy >= activityCosts[activityType]
        },
        
        getEvolutionProgress: () => {
          const { aura, evolutionRequirements } = get()
          if (!aura) return 0
          
          const nextStage = get().getNextEvolutionStage()
          if (!nextStage) return 100
          
          const requirements = evolutionRequirements[nextStage]
          if (!requirements) return 0
          
          const levelProgress = Math.min(
            aura.experiencePoints / (aura.xpToNextLevel * requirements.minLevel),
            1
          )
          
          return Math.round(levelProgress * 100)
        },
        
        getNextEvolutionStage: () => {
          const { aura } = get()
          if (!aura) return null
          
          const stages: EvolutionStage[] = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
          const currentIndex = stages.indexOf(aura.evolutionStage)
          
          return stages[currentIndex + 1] || null
        },
        
        getDaysSinceLastCare: () => {
          const { aura } = get()
          if (!aura?.lastCaredAt) return null
          
          const lastCare = new Date(aura.lastCaredAt)
          const now = new Date()
          const diffMs = now.getTime() - lastCare.getTime()
          
          return Math.floor(diffMs / (1000 * 60 * 60 * 24))
        },
        
        getCareStreak: () => {
          const { careHistory } = get()
          if (careHistory.length === 0) return 0
          
          const sorted = [...careHistory].sort(
            (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
          )
          
          let streak = 0
          let currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)
          
          for (const activity of sorted) {
            const activityDate = new Date(activity.performedAt)
            activityDate.setHours(0, 0, 0, 0)
            
            const diffDays = Math.floor(
              (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            if (diffDays === streak) {
              streak++
              currentDate = activityDate
            } else if (diffDays > streak) {
              break
            }
          }
          
          return streak
        },
        
        fetchAura: async () => {
          set({ isLoading: true, error: null })

          if (DEMO_MODE) {
            set({ isLoading: false })
            return
          }

          try {
            const aura = await AuraApiClient.getAura()
            
            if (aura) {
              const history = await AuraApiClient.getCareHistory(aura.id, 30)
              
              set({
                aura,
                careHistory: history,
                lastSyncAt: new Date().toISOString(),
                isLoading: false,
              })
            } else {
              set({
                aura: null,
                careHistory: [],
                isLoading: false,
              })
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch aura',
              isLoading: false,
            })
          }
        },
        
        createAura: async (name: string, archetype: ArchetypeType) => {
          set({ isLoading: true, error: null })

          if (DEMO_MODE) {
            const aura = makeDemoAura(name, archetype)
            set({ aura, isLoading: false })
            eventEmitter.emit({
              type: 'aura.created',
              auraId: aura.id,
              userId: aura.userId,
              timestamp: new Date().toISOString(),
              payload: { archetype, name },
            })
            return
          }

          try {
            const aura = await AuraApiClient.createAura(name, archetype)
            
            set({
              aura,
              isLoading: false,
            })
            
            eventEmitter.emit({
              type: 'aura.created',
              auraId: aura.id,
              userId: aura.userId,
              timestamp: new Date().toISOString(),
              payload: { archetype, name },
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create aura',
              isLoading: false,
            })
            throw error
          }
        },
        
        updateAura: async (updates: Partial<Aura>) => {
          const { aura } = get()
          if (!aura) return
          
          set({ isLoading: true, error: null })
          
          try {
            const updatedAura = await AuraApiClient.updateAura(aura.id, updates)
            set({ aura: updatedAura, isLoading: false })
          } catch (error) {
            // Optimistic update fallback
            set({ 
              aura: { ...aura, ...updates },
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update aura in backend'
            })
          }
        },
        
        performCareActivity: async (activityType: CareActivityType) => {
          const { aura, canPerformCare } = get()
          
          if (!aura) {
            throw new Error('No aura found')
          }
          
          if (!canPerformCare(activityType)) {
            throw new Error(`Not enough energy to ${activityType}`)
          }
          
          set({ isLoading: true, error: null })
          
          try {
            const { aura: updatedAura, activity } = await AuraApiClient.performCareActivity(
              aura.id,
              activityType
            )
            
            set({
              aura: updatedAura,
              careHistory: [activity, ...get().careHistory].slice(0, 100),
              isLoading: false,
            })
            
            eventEmitter.emit({
              type: 'aura.cared',
              auraId: aura.id,
              userId: aura.userId,
              timestamp: new Date().toISOString(),
              payload: {
                activityType,
                xpGained: activity.xpReward,
                levelUp: updatedAura.level > aura.level,
              },
            })
            
            if (updatedAura.level > aura.level) {
              eventEmitter.emit({
                type: 'aura.leveled',
                auraId: aura.id,
                userId: aura.userId,
                timestamp: new Date().toISOString(),
                payload: {
                  newLevel: updatedAura.level,
                  previousLevel: aura.level,
                },
              })
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to perform care activity',
              isLoading: false,
            })
            throw error
          }
        },
        
        fetchCareHistory: async (limit: number = 50) => {
          const { aura } = get()
          if (!aura) return
          
          try {
            const history = await AuraApiClient.getCareHistory(aura.id, limit)
            set({ careHistory: history })
          } catch (error) {
            console.error('Failed to fetch care history:', error)
          }
        },
        
        checkEvolutionEligibility: async () => {
          const { aura } = get()
          if (!aura) return false
          
          try {
            const result = await AuraApiClient.checkEvolutionEligibility(aura.id)
            return result.eligible
          } catch (error) {
            console.error('Failed to check evolution eligibility:', error)
            return false
          }
        },

        prepareRitual: () => {
          set({ isRitualInProgress: true, ritualAffinity: {} })
        },
        
        triggerEvolution: async (payload?: Record<string, unknown>) => {
          const { aura } = get()
          if (!aura) {
            throw new Error('No aura found')
          }
          
          set({ isLoading: true, error: null })
          
          try {
            const evolvedAura = await AuraApiClient.triggerEvolution(aura.id, payload)
            
            set({
              aura: {
                ...evolvedAura,
                ritualAffinity: payload as Record<string, number> || evolvedAura.ritualAffinity
              },
              isRitualInProgress: false,
              ritualAffinity: null,
              isLoading: false,
            })
            
            eventEmitter.emit({
              type: 'aura.evolved',
              auraId: aura.id,
              userId: aura.userId,
              timestamp: new Date().toISOString(),
              payload: {
                fromStage: aura.evolutionStage,
                toStage: evolvedAura.evolutionStage,
                levelAtEvolution: evolvedAura.level,
                ritualPayload: payload,
              },
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to evolve aura',
              isLoading: false,
            })
            throw error
          }
        },
        
        // Marketplace XP - optimistic local update (no API call)
        addExperience: (amount: number) => {
          const { aura } = get()
          if (!aura || amount <= 0) return

          let newXp = aura.experiencePoints + amount
          let newLevel = aura.level
          let newXpToNext = aura.xpToNextLevel

          // Handle level-ups
          while (newXp >= newXpToNext) {
            newXp -= newXpToNext
            newLevel += 1
            newXpToNext = Math.floor(newXpToNext * 1.15) // 15% scaling per level
          }

          const updatedAura: Aura = {
            ...aura,
            experiencePoints: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNext,
            updatedAt: new Date().toISOString(),
          }

          set({ aura: updatedAura })

          if (newLevel > aura.level) {
            eventEmitter.emit({
              type: "aura.leveled",
              auraId: aura.id,
              userId: aura.userId,
              timestamp: new Date().toISOString(),
              payload: {
                previousLevel: aura.level,
                newLevel,
                xpAdded: amount,
              },
            })
          }
        },
        
        selectAura: (id: string | null) => {
          set({ selectedAuraId: id })
        },
        
        clearError: () => {
          set({ error: null })
        },
        
        resetStore: () => {
          set({
            aura: null,
            careHistory: [],
            selectedAuraId: null,
            isLoading: false,
            error: null,
            lastSyncAt: null,
          })
        },
        
        onAuraEvent: (callback: (event: AuraEvent) => void) => {
          return eventEmitter.subscribe(callback)
        },
      }),
      {
        name: 'aura-store',
        storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as unknown as Storage)),
        partialize: (state) => ({
          aura: state.aura,
          careHistory: state.careHistory.slice(0, 20),
          evolutionRequirements: state.evolutionRequirements,
          lastSyncAt: state.lastSyncAt,
        }),
      }
    ),
    { name: 'AuraStore' }
  )
)

export const useAura = () => useAuraStore((state) => state.aura)
export const useCareStreak = () => useAuraStore((state) => state.getCareStreak())
export const useEvolutionProgress = () => useAuraStore((state) => state.getEvolutionProgress())
export const useCanPerformCare = (activityType: CareActivityType) => useAuraStore((state) => state.canPerformCare(activityType))

