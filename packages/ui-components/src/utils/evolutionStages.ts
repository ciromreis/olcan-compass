import { EvolutionStage, EvolutionRequirement } from '../types/companion'

export const evolutionStages: EvolutionStage[] = [
  'egg',
  'sprout',
  'young',
  'mature',
  'master',
  'legendary'
]

export const getEvolutionStage = (_xp: number, level: number): EvolutionStage => {
  if (level >= 50) return 'legendary'
  if (level >= 30) return 'master'
  if (level >= 20) return 'mature'
  if (level >= 10) return 'young'
  if (level >= 5) return 'sprout'
  return 'egg'
}

export const getEvolutionRequirements = (stage: EvolutionStage): EvolutionRequirement => {
  const requirements: Record<EvolutionStage, EvolutionRequirement> = {
    egg: {
      stage: 'egg',
      level: 1,
      xpRequired: 0,
      abilitiesRequired: [],
      specialConditions: []
    },
    sprout: {
      stage: 'sprout',
      level: 5,
      xpRequired: 500,
      abilitiesRequired: ['basic-care'],
      specialConditions: ['complete-daily-care-3-days']
    },
    young: {
      stage: 'young',
      level: 10,
      xpRequired: 2000,
      abilitiesRequired: ['basic-care', 'social-interaction'],
      specialConditions: ['join-guild']
    },
    mature: {
      stage: 'mature',
      level: 20,
      xpRequired: 8000,
      abilitiesRequired: ['basic-care', 'social-interaction', 'advanced-abilities'],
      specialConditions: ['win-5-battles', 'reach-top-10-guild']
    },
    master: {
      stage: 'master',
      level: 30,
      xpRequired: 25000,
      abilitiesRequired: ['basic-care', 'social-interaction', 'advanced-abilities', 'ultimate-abilities'],
      specialConditions: ['lead-guild', 'complete-legendary-quest']
    },
    legendary: {
      stage: 'legendary',
      level: 50,
      xpRequired: 100000,
      abilitiesRequired: ['all-abilities'],
      specialConditions: ['achieve-world-renown', 'complete-master-quest-line']
    }
  }

  return requirements[stage]
}
