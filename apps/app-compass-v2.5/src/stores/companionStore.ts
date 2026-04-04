/**
 * @deprecated Legacy companion store.
 * Use `@/stores/canonicalCompanionStore` (re-exports `useAuraStore` from `auraStore.ts`) instead.
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Companion, CompanionType, EvolutionStage, Ability, CompanionRoute, FearCluster } from '@/types'
import { apiClient } from '@/lib/api-client'
import { ArchetypeId, getArchetype } from '@/lib/archetypes'
import { Achievement as AchievementType, checkAchievementProgress, ACHIEVEMENTS } from '@/lib/achievements'
import { QuizResult } from '@/lib/quiz-questions'

interface CompanionState {
  // State
  companion: Companion | null
  companions: Companion[]
  selectedCompanionId: string | null
  activeRouteId: string | null
  quizResults: QuizResult | null
  dailyCareCompleted: string[]
  careStreak: number
  longestStreak: number
  achievements: AchievementType[]
  userStats: Record<string, number>
  isLoading: boolean
  error: string | null
  
  // Actions
  setCompanion: (companion: Companion) => void
  updateCompanion: (updates: Partial<Companion>) => void
  selectCompanion: (id: string) => void
  setActiveRouteId: (routeId: string | null) => void
  createCompanion: (archetypeId: ArchetypeId, name: string) => Promise<void>
  fetchCompanions: () => Promise<void>
  performCareActivity: (activity: CareActivity) => Promise<void>
  addXP: (amount: number) => void
  evolveCompanion: () => void
  unlockAbility: (abilityId: string) => void
  completeDailyCare: () => void
  checkAchievements: () => void
  unlockAchievement: (achievementId: string) => void
  setQuizResults: (results: QuizResult) => void
  setRoute: (route: CompanionRoute) => void
  incrementStat: (stat: string, amount?: number) => void
  clearError: () => void
}

interface CareActivity {
  type: 'feed' | 'train' | 'play' | 'rest'
  xpReward: number
  energyCost: number
  description: string
}

export const useCompanionStore = create<CompanionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        companion: null,
        companions: [],
        selectedCompanionId: null,
        activeRouteId: null,
        quizResults: null,
        dailyCareCompleted: [],
        careStreak: 0,
        longestStreak: 0,
        achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
        userStats: {
          create_companion: 0,
          evolve_companion: 0,
          care_activity: 0,
          total_care_activities: 0,
          care_streak: 0,
          reach_level: 0,
          create_application: 0,
          total_applications: 0,
          complete_interview: 0,
          profile_completion: 0,
          days_active: 0
        },
        isLoading: false,
        error: null,

        // Actions
        setCompanion: (companion) => set({ companion }),
        
        updateCompanion: (updates) => set((state) => ({
          companion: state.companion ? { ...state.companion, ...updates } : null
        })),

        selectCompanion: (id) => set({ selectedCompanionId: id }),
        setActiveRouteId: (routeId) => set({ activeRouteId: routeId }),

        setRoute: (route) => set((state) => ({
          companion: state.companion ? { ...state.companion, currentRoute: route } : null
        })),

        fetchCompanions: async () => {
          set({ isLoading: true, error: null })
          try {
            const backendCompanions = await apiClient.getAuras()
            const companions = backendCompanions.map((c: any) => ({
              id: c.id.toString(),
              userId: 'current_user',
              archetypeId: c.type as CompanionType,
              type: c.type as CompanionType,
              name: c.name,
              level: c.level,
              xp: c.xp,
              xpToNext: c.xp_to_next,
              evolutionStage: c.evolution_stage as EvolutionStage,
              abilities: c.abilities || [],
              stats: c.stats,
              currentHealth: c.current_health,
              maxHealth: c.max_health,
              energy: c.energy,
              maxEnergy: c.max_energy,
              createdAt: c.created_at,
              lastCaredAt: c.created_at,
              currentRoute: 'academic' as CompanionRoute,
            }))
            set({ companions, isLoading: false })
          } catch (err) {
            set({ error: (err as Error).message, isLoading: false })
          }
        },

        createCompanion: async (archetypeId, name) => {
          const archetype = getArchetype(archetypeId)
          const companionType = archetype.creature as CompanionType
          set({ isLoading: true, error: null })
          try {
            const backendCompanion = await apiClient.createAura({
              name,
              aura_type: companionType
            })
            
            const newCompanion: Companion = {
              id: backendCompanion.id.toString(),
              userId: 'current_user',
              archetypeId: companionType,
              type: companionType,
              name: backendCompanion.name,
              level: backendCompanion.level,
              xp: backendCompanion.xp,
              xpToNext: backendCompanion.xp_to_next,
              evolutionStage: backendCompanion.evolution_stage as EvolutionStage,
              abilities: backendCompanion.abilities || getInitialAbilities(companionType),
              stats: backendCompanion.stats,
              currentHealth: backendCompanion.current_health,
              maxHealth: backendCompanion.max_health,
              energy: backendCompanion.energy,
              maxEnergy: backendCompanion.max_energy,
              createdAt: backendCompanion.created_at,
              lastCaredAt: backendCompanion.created_at
            }

            set((state) => ({
              companion: newCompanion,
              companions: [...state.companions, newCompanion],
              selectedCompanionId: newCompanion.id,
              isLoading: false,
              userStats: {
                ...state.userStats,
                create_companion: 1
              }
            }))
            
            // Check achievements
            get().checkAchievements()
          } catch (err) {
            set({ error: (err as Error).message, isLoading: false })
            throw err
          }
        },

        performCareActivity: async (activity) => {
          const state = get()
          if (!state.companion) return

          const energyCost = activity.energyCost
          if (state.companion.energy < energyCost) return

          set({ isLoading: true, error: null })
          try {
            const companionId = parseInt(state.companion.id)
            let result
            
            if (activity.type === 'feed') {
              result = await apiClient.feedAura(companionId)
            } else if (activity.type === 'train') {
              result = await apiClient.trainAura(companionId)
            } else if (activity.type === 'play') {
              result = await apiClient.playWithAura(companionId)
            } else if (activity.type === 'rest') {
              result = await apiClient.restAura(companionId)
            } else {
              // Fallback for unknown activity types
              const updatedCompanion = {
                ...state.companion,
                xp: state.companion.xp + activity.xpReward,
                energy: Math.max(0, state.companion.energy - energyCost),
                lastCaredAt: new Date().toISOString()
              }
              set({ companion: updatedCompanion, isLoading: false })
              return
            }

            // Update companion with backend response
            const updatedCompanion = {
              ...state.companion,
              xp: result.xp || state.companion.xp,
              energy: result.energy,
              level: result.level || state.companion.level,
              lastCaredAt: new Date().toISOString()
            }

            set({ companion: updatedCompanion, isLoading: false })
          } catch (err) {
            set({ error: (err as Error).message, isLoading: false })
            throw err
          }
        },

        addXP: (amount) => {
          const state = get()
          if (!state.companion) return

          const updatedCompanion = {
            ...state.companion,
            xp: state.companion.xp + amount
          }

          if (updatedCompanion.xp >= updatedCompanion.xpToNext) {
            updatedCompanion.level += 1
            updatedCompanion.xpToNext = calculateNextLevelXP(updatedCompanion.level)
            updatedCompanion.stats = levelUpStats(updatedCompanion.stats)
          }

          set({ companion: updatedCompanion })
        },

        evolveCompanion: () => {
          const state = get()
          if (!state.companion) return

          const nextStage = getNextEvolutionStage(state.companion.evolutionStage)
          const updatedCompanion = {
            ...state.companion,
            evolutionStage: nextStage,
            stats: evolveStats(state.companion.stats),
            maxHealth: state.companion.maxHealth + 20,
            currentHealth: state.companion.currentHealth + 20
          }

          set({ companion: updatedCompanion })
        },

        unlockAbility: (abilityId) => {
          const state = get()
          if (!state.companion) return

          const newAbility: Ability = {
            id: abilityId,
            name: getAbilityName(abilityId),
            description: getAbilityDescription(abilityId),
            type: 'active',
            unlockLevel: state.companion.level,
            evolutionStage: state.companion.evolutionStage,
            icon: getAbilityIcon(abilityId)
          }

          const updatedCompanion = {
            ...state.companion,
            abilities: [...state.companion.abilities, newAbility]
          }

          set({ companion: updatedCompanion })
        },

        completeDailyCare: () => {
          const today = new Date().toISOString().split('T')[0]
          const state = get()
          
          // Check if already completed today
          if (state.dailyCareCompleted.includes(today)) return
          
          // Calculate streak
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          
          const newStreak = state.dailyCareCompleted.includes(yesterdayStr)
            ? state.careStreak + 1
            : 1
          
          const newLongestStreak = Math.max(newStreak, state.longestStreak)
          
          set((state) => ({
            dailyCareCompleted: [...state.dailyCareCompleted, today],
            careStreak: newStreak,
            longestStreak: newLongestStreak,
            userStats: {
              ...state.userStats,
              care_activity: state.userStats.care_activity + 1,
              total_care_activities: state.userStats.total_care_activities + 1,
              care_streak: newStreak
            }
          }))
          
          // Check for achievements
          get().checkAchievements()
        },

        checkAchievements: () => {
          const state = get()
          const updatedAchievements = state.achievements.map(achievement => 
            checkAchievementProgress(achievement, state.userStats)
          )
          
          // Find newly unlocked achievements
          const newlyUnlocked = updatedAchievements.filter((a, i) => 
            a.unlocked && !state.achievements[i].unlocked
          )
          
          // Award XP for newly unlocked achievements
          newlyUnlocked.forEach(achievement => {
            if (achievement.reward.xp && state.companion) {
              get().addXP(achievement.reward.xp)
            }
          })
          
          set({ achievements: updatedAchievements })
        },

        unlockAchievement: (achievementId) => {
          set((state) => ({
            achievements: state.achievements.map(a => 
              a.id === achievementId 
                ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
                : a
            )
          }))
        },

        incrementStat: (stat, amount = 1) => {
          set((state) => ({
            userStats: {
              ...state.userStats,
              [stat]: (state.userStats[stat] || 0) + amount
            }
          }))
          
          // Check achievements after stat update
          get().checkAchievements()
        },

        setQuizResults: (results) => set({ quizResults: results }),

        clearError: () => set({ error: null })
      }),
      {
        name: 'companion-store',
        partialize: (state) => ({
          companion: state.companion,
          companions: state.companions,
          selectedCompanionId: state.selectedCompanionId,
          activeRouteId: state.activeRouteId,
          quizResults: state.quizResults,
          dailyCareCompleted: state.dailyCareCompleted,
          careStreak: state.careStreak,
          longestStreak: state.longestStreak,
          achievements: state.achievements,
          userStats: state.userStats
        })
      }
    )
  )
)

// Helper functions
function getInitialAbilities(archetype: CompanionType): Ability[] {
  return [
    {
      id: `${archetype}_basic`,
      name: 'Cuidado Básico',
      description: 'Habilidade fundamental de cuidado do companion.',
      type: 'passive',
      unlockLevel: 1,
      evolutionStage: 'egg',
      icon: '🌟'
    }
  ]
}

function getInitialStats(archetype: CompanionType) {
  const statProfiles: Record<string, { power: number; wisdom: number; charisma: number; agility: number }> = {
    institutional_escapee: { power: 85, wisdom: 70, charisma: 65, agility: 90 },
    scholarship_cartographer: { power: 60, wisdom: 95, charisma: 75, agility: 70 },
    career_pivot: { power: 75, wisdom: 85, charisma: 80, agility: 80 },
    global_nomad: { power: 70, wisdom: 80, charisma: 90, agility: 85 },
    technical_bridge_builder: { power: 80, wisdom: 90, charisma: 75, agility: 75 },
    insecure_corporate_dev: { power: 90, wisdom: 75, charisma: 65, agility: 70 },
    exhausted_solo_mother: { power: 95, wisdom: 85, charisma: 70, agility: 60 },
    trapped_public_servant: { power: 70, wisdom: 80, charisma: 75, agility: 85 },
    academic_hermit: { power: 55, wisdom: 98, charisma: 60, agility: 65 },
    executive_refugee: { power: 80, wisdom: 90, charisma: 85, agility: 70 },
    creative_visionary: { power: 65, wisdom: 85, charisma: 95, agility: 80 },
    lifestyle_optimizer: { power: 70, wisdom: 80, charisma: 80, agility: 95 }
  }

  return statProfiles[archetype] || statProfiles.strategist
}

function getNextEvolutionStage(current: EvolutionStage): EvolutionStage {
  const stages: EvolutionStage[] = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
  const currentIndex = stages.indexOf(current)
  return stages[Math.min(currentIndex + 1, stages.length - 1)]
}

function calculateNextLevelXP(level: number): number {
  return Math.floor(500 * Math.pow(1.2, level - 1))
}

function levelUpStats(stats: any): any {
  return {
    power: Math.min(100, stats.power + 5),
    wisdom: Math.min(100, stats.wisdom + 5),
    charisma: Math.min(100, stats.charisma + 5),
    agility: Math.min(100, stats.agility + 5)
  }
}

function evolveStats(stats: any): any {
  return {
    power: Math.min(100, stats.power + 10),
    wisdom: Math.min(100, stats.wisdom + 10),
    charisma: Math.min(100, stats.charisma + 10),
    agility: Math.min(100, stats.agility + 10)
  }
}

function getAbilityName(id: string): string {
  const names: Record<string, string> = {
    'strategic_planning': 'Planejamento Estratégico',
    'innovation_boost': 'Impulso de Inovação',
    'creative_spark': 'Faísca Criativa',
    'diplomatic_charm': 'Charme Diplomático',
    'pioneer_spirit': 'Espírito Pioneiro',
    'wisdom_gather': 'Coleta de Sabedoria'
  }
  return names[id] || 'Habilidade Desconhecida'
}

function getAbilityDescription(id: string): string {
  const descriptions: Record<string, string> = {
    'strategic_planning': 'Melhora o pensamento estratégico e habilidades de planejamento.',
    'innovation_boost': 'Aumenta a inovação e resolução criativa de problemas.',
    'creative_spark': 'Acende a criatividade e expressão artística.',
    'diplomatic_charm': 'Melhora habilidades diplomáticas e comunicação.',
    'pioneer_spirit': 'Melhora habilidades pioneiras e de liderança.',
    'wisdom_gather': 'Aumenta a aquisição de sabedoria e conhecimento.'
  }
  return descriptions[id] || 'Uma habilidade misteriosa.'
}

function getAbilityIcon(id: string): string {
  const icons: Record<string, string> = {
    'strategic_planning': '🧠',
    'innovation_boost': '💡',
    'creative_spark': '✨',
    'diplomatic_charm': '🤝',
    'pioneer_spirit': '🚀',
    'wisdom_gather': '📚'
  }
  return icons[id] || '🌟'
}

export function getArchetypeInfo(archetype: CompanionType) {
  const info: Record<string, { name: string; description: string; color: string }> = {
    institutional_escapee: { name: 'Escapee', description: 'Seeking freedom from rigid structures.', color: 'red' },
    scholarship_cartographer: { name: 'Cartographer', description: 'Navigating the complex world of funding.', color: 'blue' },
    career_pivot: { name: 'Pivot', description: 'Master of professional transformation.', color: 'purple' },
    global_nomad: { name: 'Nomad', description: 'Thriving in borderless environments.', color: 'cyan' },
    technical_bridge_builder: { name: 'Bridge Builder', description: 'Connecting technology and human needs.', color: 'emerald' },
    insecure_corporate_dev: { name: 'Safe Keeper', description: 'Building security in uncertain times.', color: 'slate' },
    exhausted_solo_mother: { name: 'Resilient Parent', description: 'Unyielding strength and multitasking mastery.', color: 'pink' },
    trapped_public_servant: { name: 'Freedom Seeker', description: 'Planning the exit to autonomy.', color: 'orange' },
    academic_hermit: { name: 'Deep Thinker', description: 'Isolation converted into intellectual power.', color: 'indigo' },
    executive_refugee: { name: 'Visionary Leader', description: 'Escaping the burnout to build anew.', color: 'amber' },
    creative_visionary: { name: 'Artist', description: 'Painting the future with bold ideas.', color: 'fuchsia' },
    lifestyle_optimizer: { name: 'Efficiency Expert', description: 'Maximizing life quality and work output.', color: 'lime' }
  }
  return info[archetype] || info.strategist
}

export function getEvolutionStageInfo(stage: EvolutionStage) {
  const stages = {
    egg: { name: 'Ovo', description: 'Início da jornada.', color: 'white' },
    sprout: { name: 'Broto', description: 'Crescendo e aprendendo.', color: 'green' },
    young: { name: 'Jovem', description: 'Desenvolvendo habilidades.', color: 'blue' },
    mature: { name: 'Maduro', description: 'Cheio de potencial.', color: 'purple' },
    master: { name: 'Mestre', description: 'Companion experiente.', color: 'gold' },
    legendary: { name: 'Lendário', description: 'Forma suprema.', color: 'rainbow' }
  }
  return (stages as any)[stage] || stages.egg
}

export function getActivityInfo(type: string) {
  const activities: Record<string, { name: string; description: string; icon: string; color: string }> = {
    feed: { name: 'Alimentar', description: 'Fornecer nutrição.', icon: '🍎', color: 'red' },
    train: { name: 'Treinar', description: 'Construir habilidades.', icon: '💪', color: 'blue' },
    play: { name: 'Brincar', description: 'Divirtam-se juntos.', icon: '🎮', color: 'green' },
    rest: { name: 'Descansar', description: 'Recuperar energia.', icon: '😴', color: 'purple' }
  }
  return activities[type] || activities.feed
}
