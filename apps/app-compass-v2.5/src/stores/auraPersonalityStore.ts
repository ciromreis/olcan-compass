/**
 * Aura Personality and Behaviors Store
 * Manages aura personality traits, moods, and behavioral patterns
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface PersonalityTrait {
  id: string
  name: string
  description: string
  icon: string
  category: 'positive' | 'neutral' | 'negative'
  value: number // -100 to 100
  effects: {
    mood: number
    energy: number
    social: number
    learning: number
  }
}

interface Mood {
  id: string
  name: string
  description: string
  icon: string
  color: string
  triggers: string[]
  effects: {
    happiness: number
    energy: number
    health: number
    social: number
  }
  duration: number // in minutes
}

interface Behavior {
  id: string
  name: string
  description: string
  type: 'action' | 'reaction' | 'idle'
  conditions: {
    mood?: string
    energy?: number
    happiness?: number
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
    location?: string
  }
  actions: {
    type: 'animation' | 'sound' | 'message' | 'effect'
    content: string
    probability: number
  }[]
  cooldown: number // in minutes
}

interface AuraPersonality {
  auraId: number
  traits: PersonalityTrait[]
  currentMood: Mood
  moodHistory: {
    mood: Mood
    timestamp: string
    reason: string
  }[]
  behaviors: Behavior[]
  personalityProfile: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  preferences: {
    activities: string[]
    foods: string[]
    toys: string[]
    environments: string[]
  }
  memories: {
    id: string
    type: 'positive' | 'negative' | 'neutral'
    content: string
    timestamp: string
    impact: number
  }[]
}

interface PersonalityState {
  // Aura personalities
  personalities: Map<number, AuraPersonality>
  
  // Behavior tracking
  activeBehaviors: Map<number, Behavior[]>
  behaviorHistory: Map<number, {
    behavior: Behavior
    timestamp: string
    context: string
  }[]>
  
  // Mood tracking
  moodPatterns: Map<number, {
    mood: Mood
    frequency: number
    lastOccurrence: string
  }[]>
  
  // Actions
  initializePersonality: (auraId: number, archetype: string) => void
  updateMood: (auraId: number, moodId: string, reason: string) => void
  triggerBehavior: (auraId: number, context: any) => Behavior | null
  addMemory: (auraId: number, memory: Omit<AuraPersonality['memories'][0], 'id'>) => void
  updateTrait: (auraId: number, traitId: string, value: number) => void
  getPersonalityProfile: (auraId: number) => AuraPersonality | null
  getCurrentMood: (auraId: number) => Mood | null
  getActiveBehaviors: (auraId: number) => Behavior[]
  getMoodHistory: (auraId: number) => AuraPersonality['moodHistory']
  
  // Computed
  getPersonalitySummary: (auraId: number) => {
    dominantTraits: PersonalityTrait[]
    moodTendencies: { mood: Mood; percentage: number }[]
    behaviorPatterns: { behavior: Behavior; frequency: number }[]
  }
  getCompatibilityScore: (Iuranumber, auraInurar) => number
  getMoodPrediction: (Iuraumber) => Mood | null
}

// Personality traits definitions
const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    id: 'playful',
    name: 'Playful',
    description: 'Loves to play and have fun',
    icon: '🎮',
    category: 'positive',
    value: 75,
    effects: { mood: 20, energy: 15, social: 25, learning: 10 }
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Always exploring and learning',
    icon: '🔍',
    category: 'positive',
    value: 80,
    effects: { mood: 15, energy: 10, social: 5, learning: 30 }
  },
  {
    id: 'loyal',
    name: 'Loyal',
    description: 'Very devoted to their owner',
    icon: '💝',
    category: 'positive',
    value: 90,
    effects: { mood: 25, energy: 5, social: 15, learning: 5 }
  },
  {
    id: 'lazy',
    name: 'Lazy',
    description: 'Prefers to rest and relax',
    icon: '😴',
    category: 'neutral',
    value: 30,
    effects: { mood: -10, energy: -20, social: -15, learning: -5 }
  },
  {
    id: 'shy',
    name: 'Shy',
    description: 'Timid around new people',
    icon: '😳',
    category: 'negative',
    value: -40,
    effects: { mood: -15, energy: -5, social: -30, learning: -10 }
  },
  {
    id: 'energetic',
    name: 'Energetic',
    description: 'Always full of energy',
    icon: '⚡',
    category: 'positive',
    value: 85,
    effects: { mood: 10, energy: 35, social: 20, learning: 5 }
  },
  {
    id: 'stubborn',
    name: 'Stubborn',
    description: 'Very determined and persistent',
    icon: '🗿',
    category: 'negative',
    value: -30,
    effects: { mood: -10, energy: 5, social: -20, learning: 10 }
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Very careful and delicate',
    icon: '🌸',
    category: 'positive',
    value: 70,
    effects: { mood: 20, energy: -5, social: 15, learning: 10 }
  }
]

// Mood definitions
const MOODS: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    description: 'Feeling joyful and content',
    icon: '😊',
    color: '#FFD700',
    triggers: ['play', 'feed', 'praise', 'success'],
    effects: { happiness: 25, energy: 15, health: 10, social: 20 },
    duration: 60
  },
  {
    id: 'excited',
    name: 'Excited',
    description: 'Full of energy and enthusiasm',
    icon: '🤗',
    color: '#FF6B6B',
    triggers: ['new_toy', 'adventure', 'achievement'],
    effects: { happiness: 35, energy: 40, health: 5, social: 30 },
    duration: 45
  },
  {
    id: 'calm',
    name: 'Calm',
    description: 'Peaceful and relaxed',
    icon: '😌',
    color: '#87CEEB',
    triggers: ['rest', 'meditation', 'quiet_time'],
    effects: { happiness: 10, energy: -10, health: 20, social: -5 },
    duration: 90
  },
  {
    id: 'sad',
    name: 'Sad',
    description: 'Feeling down and unhappy',
    icon: '😢',
    color: '#6495ED',
    triggers: ['failure', 'loneliness', 'loss'],
    effects: { happiness: -30, energy: -20, health: -10, social: -25 },
    duration: 30
  },
  {
    id: 'angry',
    name: 'Angry',
    description: 'Feeling frustrated and upset',
    icon: '😠',
    color: '#FF4500',
    triggers: ['injustice', 'frustration', 'betrayal'],
    effects: { happiness: -35, energy: 25, health: -5, social: -30 },
    duration: 20
  },
  {
    id: 'sleepy',
    name: 'Sleepy',
    description: 'Feeling tired and ready to rest',
    icon: '😴',
    color: '#9370DB',
    triggers: ['long_activity', 'night_time', 'full_meal'],
    effects: { happiness: 5, energy: -30, health: 15, social: -20 },
    duration: 120
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Interested and inquisitive',
    icon: '🤔',
    color: '#32CD32',
    triggers: ['new_object', 'mystery', 'learning'],
    effects: { happiness: 15, energy: 10, health: 5, social: 10 },
    duration: 40
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Wanting to play and have fun',
    icon: '🎪',
    color: '#FF69B4',
    triggers: ['toy', 'friend', 'game'],
    effects: { happiness: 30, energy: 20, health: 10, social: 25 },
    duration: 50
  }
]

// Behavior definitions
const BEHAVIORS: Behavior[] = [
  {
    id: 'jump_around',
    name: 'Jump Around',
    description: 'Excited jumping behavior',
    type: 'action',
    conditions: { mood: 'excited', energy: 50 },
    actions: [
      { type: 'animation', content: 'jump', probability: 0.8 },
      { type: 'sound', content: 'happy_bark', probability: 0.6 },
      { type: 'message', content: 'Wheee! This is fun!', probability: 0.4 }
    ],
    cooldown: 5
  },
  {
    id: 'hide',
    name: 'Hide',
    description: 'Shy hiding behavior',
    type: 'reaction',
    conditions: { mood: 'sad', happiness: 30 },
    actions: [
      { type: 'animation', content: 'hide', probability: 0.9 },
      { type: 'sound', content: 'whimper', probability: 0.7 },
      { type: 'message', content: 'I need some space...', probability: 0.5 }
    ],
    cooldown: 10
  },
  {
    id: 'explore',
    name: 'Explore',
    description: 'Curious exploration behavior',
    type: 'action',
    conditions: { mood: 'curious', energy: 40 },
    actions: [
      { type: 'animation', content: 'sniff_around', probability: 0.8 },
      { type: 'sound', content: 'curious_sounds', probability: 0.6 },
      { type: 'message', content: 'What\'s this? Let me check!', probability: 0.4 }
    ],
    cooldown: 15
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Tired sleeping behavior',
    type: 'idle',
    conditions: { mood: 'sleepy', energy: 20 },
    actions: [
      { type: 'animation', content: 'sleep', probability: 0.9 },
      { type: 'sound', content: 'sleep_sounds', probability: 0.8 },
      { type: 'message', content: 'Zzz...', probability: 0.3 }
    ],
    cooldown: 30
  },
  {
    id: 'follow_owner',
    name: 'Follow Owner',
    description: 'Loyal following behavior',
    type: 'action',
    conditions: { mood: 'happy', happiness: 50 },
    actions: [
      { type: 'animation', content: 'follow', probability: 0.7 },
      { type: 'sound', content: 'happy_sounds', probability: 0.5 },
      { type: 'message', content: 'I\'m right here with you!', probability: 0.3 }
    ],
    cooldown: 8
  },
  {
    id: 'play_with_toy',
    name: 'Play with Toy',
    description: 'Playful toy interaction',
    type: 'action',
    conditions: { mood: 'playful', energy: 30 },
    actions: [
      { type: 'animation', content: 'play', probability: 0.8 },
      { type: 'sound', content: 'playful_sounds', probability: 0.7 },
      { type: 'message', content: 'This is so much fun!', probability: 0.5 }
    ],
    cooldown: 12
  },
  {
    id: 'demand_attention',
    name: 'Demand Attention',
    description: 'Needy attention-seeking behavior',
    type: 'action',
    conditions: { mood: 'sad', happiness: 30 },
    actions: [
      { type: 'animation', content: 'nudge', probability: 0.8 },
      { type: 'sound', content: 'attention_sounds', probability: 0.9 },
      { type: 'message', content: 'Pay attention to me!', probability: 0.6 }
    ],
    cooldown: 6
  },
  {
    id: 'guard',
    name: 'Guard',
    description: 'Protective guarding behavior',
    type: 'action',
    conditions: { mood: 'calm', energy: 40 },
    actions: [
      { type: 'animation', content: 'alert', probability: 0.7 },
      { type: 'sound', content: 'alert_sounds', probability: 0.6 },
      { type: 'message', content: 'I\'m watching over you!', probability: 0.3 }
    ],
    cooldown: 20
  }
]

// Store implementation
export const useCompanionPersonalityStore = create<PersonalityState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        personalities: new Map(),
        activeBehaviors: new Map(),
        behaviorHistory: new Map(),
        moodPatterns: new Map(),
        
        // Actions
        initializePersonality: (auraId: number, archetype: string) => {
          const personality: AuraPersonality = {
            auraId,
            traits: getArchetypeTraits(archetype),
            currentMood: MOODS[0], // Default to happy
            moodHistory: [],
            behaviors: BEHAVIORS,
            personalityProfile: generatePersonalityProfile(archetype),
            preferences: getArchetypePreferences(archetype),
            memories: []
          }
          
          set(state => {
            const newPersonalities = new Map(state.personalities)
            newPersonalities.set(auraId, personality)
            return { personalities: newPersonalities }
          })
        },
        
        updateMood: (auraId: number, moodId: string, reason: string) => {
          const state = get()
          const personality = state.personalities.get(auraId)
          
          if (!personality) return
          
          const mood = MOODS.find(m => m.id === moodId)
          if (!mood) return
          
          // Update mood and history
          const updatedPersonality = {
            ...personality,
            currentMood: mood,
            moodHistory: [
              ...personality.moodHistory,
              { mood, timestamp: new Date().toISOString(), reason }
            ].slice(-20) // Keep last 20 mood changes
          }
          
          // Update mood patterns
          const newMoodPatterns = new Map(state.moodPatterns)
          const existingPattern = newMoodPatterns.get(auraId) || []
          
          const patternIndex = existingPattern.findIndex(p => p.mood.id === moodId)
          if (patternIndex >= 0) {
            existingPattern[patternIndex] = {
              mood,
              frequency: existingPattern[patternIndex].frequency + 1,
              lastOccurrence: new Date().toISOString()
            }
          } else {
            existingPattern.push({
              mood,
              frequency: 1,
              lastOccurrence: new Date().toISOString()
            })
          }
          
          newMoodPatterns.set(auraId, existingPattern)
          
          set({
            personalities: new Map(state.personalities.set(auraId, updatedPersonality)),
            moodPatterns: newMoodPatterns
          })
          
          // Trigger behaviors based on new mood
          get().triggerBehavior(auraId, { moodChange: true })
        },
        
        triggerBehavior: (auraId: number, context: any) => {
          const state = get()
          const personality = state.personalities.get(auraId)
          
          if (!personality) return null
          
          // Find behaviors that match current conditions
          const currentMood = personality.currentMood
          const matchingBehaviors = personality.behaviors.filter(behavior => {
            const conditions = behavior.conditions
            
            // Check mood condition
            if (conditions.mood && conditions.mood !== currentMood.id) return false
            
            // Check other conditions (simplified)
            if (conditions.energy && Math.random() * 100 > conditions.energy) return false
            if (conditions.happiness && Math.random() * 100 > conditions.happiness) return false
            
            // Check cooldown
            const behaviorHistory = state.behaviorHistory.get(auraId) || []
            const lastExecution = behaviorHistory
              .filter(h => h.behavior.id === behavior.id)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
            
            if (lastExecution) {
              const timeSinceLastExecution = Date.now() - new Date(lastExecution.timestamp).getTime()
              const cooldownMs = behavior.cooldown * 60 * 1000
              if (timeSinceLastExecution < cooldownMs) return false
            }
            
            return true
          })
          
          // Select behavior based on probability
          if (matchingBehaviors.length === 0) return null
          
          const selectedBehavior = matchingBehaviors.reduce((best, current) => {
            const bestScore = best.actions.reduce((sum, action) => sum + action.probability, 0)
            const currentScore = current.actions.reduce((sum, action) => sum + action.probability, 0)
            return currentScore > bestScore ? current : best
          })
          
          // Execute behavior actions
          const executedActions = selectedBehavior.actions.filter(action => {
            return Math.random() * 100 < action.probability
          })
          
          // Add to behavior history
          const newBehaviorHistory = new Map(state.behaviorHistory)
          const history = newBehaviorHistory.get(auraId) || []
          history.push({
            behavior: selectedBehavior,
            timestamp: new Date().toISOString(),
            context: JSON.stringify(context)
          })
          newBehaviorHistory.set(auraId, history.slice(-50)) // Keep last 50 behaviors
          
          // Add to active behaviors
          const newActiveBehaviors = new Map(state.activeBehaviors)
          const active = newActiveBehaviors.get(auraId) || []
          active.push(selectedBehavior)
          newActiveBehaviors.set(auraId, active.slice(-10)) // Keep last 10 active behaviors
          
          set({
            behaviorHistory: newBehaviorHistory,
            activeBehaviors: newActiveBehaviors
          })
          
          return selectedBehavior
        },
        
        addMemory: (auraId: number, memory: Omit<AuraPersonality['memories'][0], 'id'>) => {
          const state = get()
          const personality = state.personalities.get(auraId)
          
          if (!personality) return
          
          const newMemory = {
            ...memory,
            id: `memory_${Date.now()}_${Math.random()}`
          }
          
          const updatedPersonality = {
            ...personality,
            memories: [...personality.memories, newMemory].slice(-100) // Keep last 100 memories
          }
          
          set(state => ({
            personalities: new Map(state.personalities.set(auraId, updatedPersonality))
          }))
        },
        
        updateTrait: (auraId: number, traitId: string, value: number) => {
          const state = get()
          const personality = state.personalities.get(auraId)
          
          if (!personality) return
          
          const updatedTraits = personality.traits.map(trait =>
            trait.id === traitId ? { ...trait, value: Math.max(-100, Math.min(100, value)) } : trait
          )
          
          const updatedPersonality = {
            ...personality,
            traits: updatedTraits
          }
          
          set(state => ({
            personalities: new Map(state.personalities.set(auraId, updatedPersonality))
          }))
        },
        
        getPersonalityProfile: (auraId: number) => {
          return get().personalities.get(auraId) || null
        },
        
        getCurrentMood: (auraId: number) => {
          const personality = get().personalities.get(auraId)
          return personality?.currentMood || null
        },
        
        getActiveBehaviors: (auraId: number) => {
          return get().activeBehaviors.get(auraId) || []
        },
        
        getMoodHistory: (auraId: number) => {
          const personality = get().personalities.get(auraId)
          return personality?.moodHistory || []
        },
        
        // Computed
        getPersonalitySummary: (auraId: number) => {
          const personality = get().personalities.get(auraId)
          if (!personality) return { dominantTraits: [], moodTendencies: [], behaviorPatterns: [] }
          
          // Get dominant traits
          const dominantTraits = personality.traits
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(3)
          
          // Get mood tendencies
          const moodPatterns = get().moodPatterns.get(auraId) || []
          const totalMoodOccurrences = moodPatterns.reduce((sum, p) => sum + p.frequency, 0)
          
          const moodTendencies = moodPatterns.map(pattern => ({
            mood: pattern.mood,
            percentage: totalMoodOccurrences > 0 ? (pattern.frequency / totalMoodOccurrences) * 100 : 0
          }))
          
          // Get behavior patterns
          const behaviorHistory = get().behaviorHistory.get(auraId) || []
          const behaviorCounts = behaviorHistory.reduce((counts, h) => {
            const count = counts.get(h.behavior.id) || 0
            counts.set(h.behavior.id, count + 1)
            return counts
          }, new Map<string, number>())
          
          const behaviorPatterns = Array.from(behaviorCounts.entries())
            .map(([behaviorId, frequency]) => ({
              behavior: personality.behaviors.find(b => b.id === behaviorId)!,
              frequency
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(5)
          
          return { dominantTraits, moodTendencies, behaviorPatterns }
        },
        
        getCompatibilityScore: (auraId1: number, auraId2: number) => {
          const personality1 = get().personalities.get(auraId1)
          const personality2 = get().personalities.get(auraId2)
          
          if (!personality1 || !personality2) return 0
          
          // Calculate trait compatibility
          let traitScore = 0
          personality1.traits.forEach(trait1 => {
            const trait2 = personality2.traits.find(t => t.id === trait1.id)
            if (trait2) {
              const difference = Math.abs(trait1.value - trait2.value)
              traitScore += (100 - difference) / 100
            }
          })
          
          traitScore = traitScore / personality1.traits.length
          
          // Calculate mood compatibility
          const moodHistory1 = personality1.moodHistory
          const moodHistory2 = personality2.moodHistory
          
          let moodScore = 0
          const sharedMoods = moodHistory1.filter(m1 => 
            moodHistory2.some(m2 => m2.mood.id === m1.mood.id)
          )
          
          if (moodHistory1.length > 0 && moodHistory2.length > 0) {
            moodScore = (sharedMoods.length / Math.max(moodHistory1.length, moodHistory2.length)) * 100
          }
          
          // Calculate overall compatibility
          const overallScore = (traitScore * 0.6) + (moodScore * 0.4)
          
          return Math.round(overallScore)
        },
        
        getMoodPrediction: (auraId: number) => {
          const personality = get().personalities.get(auraId)
          if (!personality) return null
          
          const moodPatterns = get().moodPatterns.get(auraId) || []
          const timeOfDay = new Date().getHours()
          
          // Predict mood based on time of day and patterns
          let predictedMood = personality.currentMood
          
          if (timeOfDay >= 6 && timeOfDay < 12) {
            // Morning - more likely to be energetic or happy
            predictedMood = MOODS.find(m => m.id === 'happy') || MOODS[0]
          } else if (timeOfDay >= 12 && timeOfDay < 18) {
            // Afternoon - playful or curious
            predictedMood = MOODS.find(m => m.id === 'playful') || MOODS[0]
          } else if (timeOfDay >= 18 && timeOfDay < 22) {
            // Evening - calm or excited
            predictedMood = MOODS.find(m => m.id === 'calm') || MOODS[0]
          } else {
            // Night - sleepy
            predictedMood = MOODS.find(m => m.id === 'sleepy') || MOODS[0]
          }
          
          return predictedMood
        }
      }),
      {
        name: 'companion-personality-store',
        partialize: (state) => ({
          personalities: Array.from(state.personalities.entries()),
          moodPatterns: Array.from(state.moodPatterns.entries())
        })
      }
    ),
    {
      name: 'companion-personality-store'
    }
  )
)

// Helper functions
function getArchetypeTraits(archetype: string): PersonalityTrait[] {
  const archetypeTraitMappings: Record<string, string[]> = {
    strategist: ['curious', 'loyal', 'gentle'],
    innovator: ['curious', 'energetic', 'playful'],
    creator: ['playful', 'gentle', 'curious'],
    diplomat: ['loyal', 'gentle', 'curious'],
    pioneer: ['energetic', 'curious', 'loyal'],
    scholar: ['curious', 'gentle', 'loyal']
  }
  
  const traitIds = archetypeTraitMappings[archetype] || ['curious', 'loyal', 'playful']
  
  return traitIds.map(id => 
    PERSONALITY_TRAITS.find(trait => trait.id === id) || PERSONALITY_TRAITS[0]
  )
}

function generatePersonalityProfile(archetype: string) {
  const profiles: Record<string, any> = {
    strategist: { openness: 80, conscientiousness: 70, extraversion: 60, agreeableness: 75, neuroticism: 30 },
    innovator: { openness: 90, conscientiousness: 60, extraversion: 80, agreeableness: 65, neuroticism: 40 },
    creator: { openness: 85, conscientiousness: 50, extraversion: 70, agreeableness: 70, neuroticism: 45 },
    diplomat: { openness: 70, conscientiousness: 80, extraversion: 75, agreeableness: 90, neuroticism: 25 },
    pioneer: { openness: 95, conscientiousness: 65, extraversion: 85, agreeableness: 60, neuroticism: 35 },
    scholar: { openness: 75, conscientiousness: 90, extraversion: 55, agreeableness: 80, neuroticism: 20 }
  }
  
  return profiles[archetype] || profiles.strategist
}

function getArchetypePreferences(archetype: string) {
  const preferences: Record<string, any> = {
    strategist: {
      activities: ['training', 'planning', 'strategy_games'],
      foods: ['brain_food', 'energy_drinks', 'healthy_snacks'],
      toys: ['puzzles', 'strategy_games', 'books'],
      environments: ['library', 'study', 'quiet_room']
    },
    innovator: {
      activities: ['experimenting', 'creating', 'exploring'],
      foods: ['creative_snacks', 'energy_food', 'new_flavors'],
      toys: ['building_blocks', 'creative_tools', 'invention_kits'],
      environments: ['workshop', 'lab', 'creative_space']
    },
    creator: {
      activities: ['drawing', 'music', 'storytelling'],
      foods: ['inspiring_food', 'colorful_snacks', 'artistic_treats'],
      toys: ['art_supplies', 'musical_instruments', 'story_books'],
      environments: ['studio', 'gallery', 'nature']
    },
    diplomat: {
      activities: ['socializing', 'helping', 'mediating'],
      foods: ['comfort_food', 'sharing_snacks', 'community_meals'],
      toys: ['social_games', 'team_activities', 'communication_tools'],
      environments: ['community_center', 'meeting_room', 'garden']
    },
    pioneer: {
      activities: ['exploring', 'adventuring', 'discovering'],
      foods: ['energy_food', 'adventure_snacks', 'survival_food'],
      toys: ['exploration_tools', 'adventure_gear', 'maps'],
      environments: ['outdoors', 'new_places', 'unknown_territories']
    },
    scholar: {
      activities: ['reading', 'studying', 'researching'],
      foods: ['brain_food', 'study_snacks', 'knowledge_treats'],
      toys: ['books', 'educational_games', 'research_tools'],
      environments: ['library', 'study', 'classroom']
    }
  }
  
  return preferences[archetype] || preferences.strategist
}

// Hooks for easier usage
export const useCompanionPersonality = () => useCompanionPersonalityStore()
export const useCompanionPersonalityActions = () => useCompanionPersonalityStore(state => state)

// Utility functions
export const getMoodColor = (moodId: string) => {
  const mood = MOODS.find(m => m.id === moodId)
  return mood?.color || '#808080'
}

export const getTraitIcon = (traitId: string) => {
  const trait = PERSONALITY_TRAITS.find(t => t.id === traitId)
  return trait?.icon || '❓'
}

export const getBehaviorDescription = (behaviorId: string) => {
  const behavior = BEHAVIORS.find(b => b.id === behaviorId)
  return behavior?.description || 'Unknown behavior'
}

export const formatPersonalityProfile = (profile: any) => {
  return {
    openness: `${profile.openness}% Open`,
    conscientiousness: `${profile.conscientiousness}% Conscientious`,
    extraversion: `${profile.extraversion}% Extraverted`,
    agreeableness: `${profile.agreeableness}% Agreeable`,
    neuroticism: `${profile.neuroticism}% Neurotic`
  }
}
