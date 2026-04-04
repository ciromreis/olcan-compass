export type CompanionType = 
  | 'strategist'
  | 'innovator' 
  | 'creator'
  | 'diplomat'
  | 'pioneer'
  | 'scholar'
  | 'guardian'
  | 'visionary'
  | 'academic'
  | 'communicator'
  | 'analyst'
  | 'luminary'

export type EvolutionStage = 
  | 'egg'
  | 'sprout' 
  | 'young'
  | 'mature'
  | 'master'
  | 'legendary'

export interface Ability {
  id: string
  name: string
  description: string
  type: 'active' | 'passive' | 'ultimate'
  unlockLevel: number
  evolutionStage: EvolutionStage
  cooldown?: number
  damage?: number
  healing?: number
  icon: string
}

export interface CompanionStats {
  power: number
  wisdom: number
  charisma: number
  agility: number
}

export interface Companion {
  id: string
  userId: string
  archetypeId: string
  type: CompanionType
  name: string
  level: number
  xp: number
  xpToNext: number
  evolutionStage: EvolutionStage
  abilities: Ability[]
  stats: CompanionStats
  currentHealth: number
  maxHealth: number
  energy: number
  maxEnergy: number
  createdAt: string
  lastCaredAt: string
  customizations?: CompanionCustomization
}

export interface CompanionCustomization {
  name?: string
  accessories?: string[]
  colorVariant?: string
  specialEffects?: string[]
}

export interface CareActivity {
  type: 'feed' | 'train' | 'play' | 'rest'
  xpReward: number
  energyCost: number
  description: string
  duration: number
  requirements?: {
    minLevel?: number
    abilities?: string[]
    items?: string[]
  }
}

export interface EvolutionRequirement {
  stage: EvolutionStage
  level: number
  xpRequired: number
  abilitiesRequired: string[]
  specialConditions?: string[]
}

export interface CompanionInteraction {
  id: string
  type: 'battle' | 'trade' | 'guild' | 'friend'
  participants: string[]
  result: InteractionResult
  timestamp: string
  rewards?: {
    xp: number
    items: string[]
    abilities: string[]
  }
}

export interface InteractionResult {
  winner?: string
  experience: number
  items: string[]
  achievements: string[]
}
