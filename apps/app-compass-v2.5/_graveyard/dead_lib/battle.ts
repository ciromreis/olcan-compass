/**
 * Base do Sistema de Batalha Olcan
 * Batalhas de Auras PvP e PvE
 */

export type BattleType = 'pvp' | 'pve' | 'guild_war' | 'tournament'
export type BattleStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type BattleAction = 'attack' | 'defend' | 'special' | 'item'

export interface BattleAura {
  id: string
  name: string
  archetype: string
  level: number
  currentHealth: number
  maxHealth: number
  energy: number
  maxEnergy: number
  stats: {
    power: number
    wisdom: number
    charisma: number
    agility: number
  }
  abilities: string[]
  buffs: BattleBuff[]
  debuffs: BattleDebuff[]
}

export interface BattleBuff {
  id: string
  name: string
  type: 'attack' | 'defense' | 'speed' | 'healing'
  value: number
  duration: number
  remainingTurns: number
}

export interface BattleDebuff {
  id: string
  name: string
  type: 'poison' | 'stun' | 'weaken' | 'slow'
  value: number
  duration: number
  remainingTurns: number
}

export interface BattleTurn {
  turnNumber: number
  attackerId: string
  defenderId: string
  action: BattleAction
  abilityUsed?: string
  itemUsed?: string
  damage: number
  healing: number
  critical: boolean
  buffApplied?: BattleBuff
  debuffApplied?: BattleDebuff
  message: string
  timestamp: string
}

export interface Battle {
  id: string
  type: BattleType
  status: BattleStatus
  player1: {
    userId: string
    username: string
    aura: BattleAura
  }
  player2: {
    userId: string
    username: string
    aura: BattleAura
  }
  turns: BattleTurn[]
  currentTurn: number
  winnerId?: string
  reward?: {
    xp: number
    currency: number
    items?: string[]
  }
  startedAt: string
  completedAt?: string
}

// Cálculos de Batalha
export function calculateDamage(
  attacker: BattleAura,
  defender: BattleAura,
  abilityPower: number = 1
): number {
  const baseDamage = attacker.stats.power * abilityPower
  const defense = defender.stats.wisdom * 0.5
  const damage = Math.max(baseDamage - defense, 1)
  
  // Aplicar buffs/debuffs
  let finalDamage = damage
  
  attacker.buffs.forEach(buff => {
    if (buff.type === 'attack') {
      finalDamage *= (1 + buff.value / 100)
    }
  })
  
  defender.buffs.forEach(buff => {
    if (buff.type === 'defense') {
      finalDamage *= (1 - buff.value / 100)
    }
  })
  
  return Math.round(finalDamage)
}

export function calculateCriticalChance(attacker: BattleAura): boolean {
  const baseChance = 10 // 10% de chance base
  const agilityBonus = attacker.stats.agility * 0.5
  const totalChance = baseChance + agilityBonus
  
  return Math.random() * 100 < totalChance
}

export function calculateTurnOrder(aura1: BattleAura, aura2: BattleAura): string[] {
  // Maior agilidade ataca primeiro
  if (aura1.stats.agility > aura2.stats.agility) {
    return [aura1.id, aura2.id]
  } else if (aura2.stats.agility > aura1.stats.agility) {
    return [aura2.id, aura1.id]
  } else {
    // Agilidade igual - aleatório
    return Math.random() > 0.5 ? [aura1.id, aura2.id] : [aura2.id, aura1.id]
  }
}

export function applyDamage(aura: BattleAura, damage: number): BattleAura {
  return {
    ...aura,
    currentHealth: Math.max(aura.currentHealth - damage, 0)
  }
}

export function applyHealing(aura: BattleAura, healing: number): BattleAura {
  return {
    ...aura,
    currentHealth: Math.min(aura.currentHealth + healing, aura.maxHealth)
  }
}

export function isBattleOver(battle: Battle): boolean {
  return (
    battle.player1.aura.currentHealth <= 0 ||
    battle.player2.aura.currentHealth <= 0
  )
}

export function getWinner(battle: Battle): string | null {
  if (battle.player1.aura.currentHealth <= 0) {
    return battle.player2.userId
  }
  if (battle.player2.aura.currentHealth <= 0) {
    return battle.player1.userId
  }
  return null
}

export function calculateBattleReward(
  winner: BattleAura,
  loser: BattleAura,
  battleType: BattleType
): { xp: number; currency: number; items?: string[] } {
  const levelDiff = winner.level - loser.level
  const baseXP = 100
  const baseCurrency = 50
  
  // Ajustar recompensas baseado na diferença de nível
  const xpMultiplier = Math.max(1 - (levelDiff * 0.1), 0.5)
  const currencyMultiplier = Math.max(1 - (levelDiff * 0.1), 0.5)
  
  // Multiplicadores por tipo de batalha
  const typeMultipliers = {
    pvp: 1.5,
    pve: 1.0,
    guild_war: 2.0,
    tournament: 3.0
  }
  
  const multiplier = typeMultipliers[battleType]
  
  return {
    xp: Math.round(baseXP * xpMultiplier * multiplier),
    currency: Math.round(baseCurrency * currencyMultiplier * multiplier),
    items: battleType === 'tournament' ? ['trofeu_torneio'] : undefined
  }
}

// Habilidades de Batalha
export interface BattleAbility {
  id: string
  name: string
  description: string
  energyCost: number
  power: number
  effect?: {
    type: 'damage' | 'heal' | 'buff' | 'debuff'
    value: number
    target: 'self' | 'enemy'
  }
  cooldown: number
}

export const BATTLE_ABILITIES: Record<string, BattleAbility> = {
  basic_attack: {
    id: 'basic_attack',
    name: 'Ataque Básico',
    description: 'Um ataque simples',
    energyCost: 10,
    power: 1.0,
    cooldown: 0
  },
  
  power_strike: {
    id: 'power_strike',
    name: 'Golpe de Poder',
    description: 'Um ataque poderoso causando 150% de dano',
    energyCost: 20,
    power: 1.5,
    cooldown: 2
  },
  
  defensive_stance: {
    id: 'defensive_stance',
    name: 'Postura Defensiva',
    description: 'Reduz o dano recebido em 30% por 2 rodadas',
    energyCost: 15,
    power: 0,
    effect: {
      type: 'buff',
      value: 30,
      target: 'self'
    },
    cooldown: 3
  },
  
  healing_aura: {
    id: 'healing_aura',
    name: 'Aura Curativa',
    description: 'Restaura 30% da vida máxima',
    energyCost: 25,
    power: 0,
    effect: {
      type: 'heal',
      value: 30,
      target: 'self'
    },
    cooldown: 4
  },
  
  critical_strike: {
    id: 'critical_strike',
    name: 'Golpe Crítico',
    description: 'Alta chance de causar dano crítico',
    energyCost: 30,
    power: 2.0,
    cooldown: 3
  }
}

export function getAbility(abilityId: string): BattleAbility | undefined {
  return BATTLE_ABILITIES[abilityId]
}

export function canUseAbility(
  aura: BattleAura,
  ability: BattleAbility
): boolean {
  return aura.energy >= ability.energyCost
}

// Matchmaking de Batalha
export function calculateMatchmakingScore(aura: BattleAura): number {
  return (
    aura.level * 10 +
    aura.stats.power +
    aura.stats.wisdom +
    aura.stats.charisma +
    aura.stats.agility
  )
}

export function findMatchingOpponent(
  playerAura: BattleAura,
  availableOpponents: BattleAura[]
): BattleAura | null {
  const playerScore = calculateMatchmakingScore(playerAura)
  const scoreRange = 50 // Permite diferença de ±50 no score
  
  const suitableOpponents = availableOpponents.filter(opponent => {
    const opponentScore = calculateMatchmakingScore(opponent)
    return Math.abs(playerScore - opponentScore) <= scoreRange
  })
  
  if (suitableOpponents.length === 0) return null
  
  // Retorna um oponente aleatório adequado
  return suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)]
}
