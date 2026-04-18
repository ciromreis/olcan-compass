export type AuraType =
  | 'institutional_escapee'
  | 'scholarship_cartographer'
  | 'career_pivot'
  | 'global_nomad'
  | 'technical_bridge_builder'
  | 'insecure_corporate_dev'
  | 'exhausted_solo_mother'
  | 'trapped_public_servant'
  | 'academic_hermit'
  | 'executive_refugee'
  | 'creative_visionary'
  | 'lifestyle_optimizer'

export type EvolutionStage =
  | 'egg'
  | 'sprout'
  | 'young'
  | 'mature'
  | 'master'
  | 'legendary'

export type FearCluster = 'competence' | 'rejection' | 'loss' | 'irreversibility'

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

export interface AuraStats {
  power: number
  wisdom: number
  charisma: number
  agility: number
}

export type AuraRoute = 'academic' | 'corporate' | 'sponsored' | 'creative' | 'chevening' | 'daad' | 'fulbright';

export interface Aura {
  id: string
  userId: string
  archetypeId: string
  type: AuraType
  name: string
  level: number
  xp: number
  xpToNext: number
  evolutionStage: EvolutionStage
  abilities: Ability[]
  stats: AuraStats
  currentHealth: number
  maxHealth: number
  energy: number
  maxEnergy: number
  createdAt: string
  lastCaredAt: string
  currentRoute?: AuraRoute
  activeSkin?: string
  customizations?: AuraCustomization
}

export interface AuraCustomization {
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

export interface AuraInteraction {
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

// Backward compatibility aliases (temporary - remove after migration)
export type CompanionType = AuraType
export type CompanionStats = AuraStats
export type CompanionRoute = AuraRoute
export type Companion = Aura
export type CompanionCustomization = AuraCustomization
export type CompanionInteraction = AuraInteraction
