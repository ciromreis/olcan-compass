/**
 * Guild/Social System
 * Team-based features and social interactions
 */

export interface Guild {
  id: string
  name: string
  description: string
  icon: string
  banner?: string
  level: number
  xp: number
  memberCount: number
  maxMembers: number
  createdAt: string
  ownerId: string
  tags: string[]
  isPublic: boolean
  requirements?: {
    minLevel?: number
    minAchievements?: number
  }
}

export interface GuildMember {
  userId: string
  username: string
  companionName: string
  archetype: string
  level: number
  role: GuildRole
  joinedAt: string
  contributionXP: number
  lastActive: string
}

export type GuildRole = 'owner' | 'admin' | 'member'

export interface GuildActivity {
  id: string
  type: 'member_join' | 'member_leave' | 'level_up' | 'achievement' | 'quest_complete'
  userId: string
  username: string
  description: string
  timestamp: string
}

export interface GuildQuest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special'
  requirement: {
    type: 'collective_xp' | 'member_achievements' | 'care_activities' | 'evolutions'
    target: number
    current: number
  }
  reward: {
    guildXP: number
    memberXP: number
    items?: string[]
  }
  expiresAt: string
  completed: boolean
}

// Guild Perks by Level
export const GUILD_PERKS = [
  { level: 1, perk: 'Guild Chat', description: 'Communicate with guild members' },
  { level: 2, perk: '+5% XP Bonus', description: 'All members gain 5% more XP' },
  { level: 3, perk: 'Guild Quests', description: 'Unlock collaborative quests' },
  { level: 5, perk: '+10% XP Bonus', description: 'XP bonus increased to 10%' },
  { level: 7, perk: 'Guild Bank', description: 'Share resources with members' },
  { level: 10, perk: 'Guild Battles', description: 'Compete against other guilds' },
  { level: 15, perk: '+15% XP Bonus', description: 'XP bonus increased to 15%' },
  { level: 20, perk: 'Guild Hall', description: 'Customizable guild space' }
]

export function getGuildPerks(guildLevel: number) {
  return GUILD_PERKS.filter(perk => perk.level <= guildLevel)
}

export function getNextGuildPerk(guildLevel: number) {
  return GUILD_PERKS.find(perk => perk.level > guildLevel)
}

export function calculateGuildXPToNextLevel(currentLevel: number): number {
  return currentLevel * 1000 + 500
}

export function canManageGuild(role: GuildRole): boolean {
  return role === 'owner' || role === 'admin'
}

export function canInviteMembers(role: GuildRole): boolean {
  return role === 'owner' || role === 'admin'
}

export function canKickMembers(role: GuildRole): boolean {
  return role === 'owner' || role === 'admin'
}

// Guild Tags/Categories
export const GUILD_TAGS = [
  'Casual',
  'Competitive',
  'Social',
  'Career Focus',
  'Achievement Hunters',
  'Daily Active',
  'Beginner Friendly',
  'Veterans Only',
  'International',
  'Language Specific'
]

// Mock guild data for development
export const MOCK_GUILDS: Guild[] = [
  {
    id: 'guild_1',
    name: 'Career Champions',
    description: 'A guild for ambitious professionals climbing the career ladder',
    icon: '🏆',
    level: 12,
    xp: 8500,
    memberCount: 45,
    maxMembers: 50,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: 'user_1',
    tags: ['Competitive', 'Career Focus', 'Daily Active'],
    isPublic: true,
    requirements: {
      minLevel: 5,
      minAchievements: 10
    }
  },
  {
    id: 'guild_2',
    name: 'Companion Collective',
    description: 'Friendly community for companion enthusiasts',
    icon: '🌟',
    level: 8,
    xp: 3200,
    memberCount: 32,
    maxMembers: 50,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: 'user_2',
    tags: ['Casual', 'Social', 'Beginner Friendly'],
    isPublic: true
  },
  {
    id: 'guild_3',
    name: 'Evolution Masters',
    description: 'Elite guild for experienced trainers',
    icon: '💎',
    level: 15,
    xp: 12000,
    memberCount: 48,
    maxMembers: 50,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: 'user_3',
    tags: ['Competitive', 'Veterans Only', 'Achievement Hunters'],
    isPublic: true,
    requirements: {
      minLevel: 15,
      minAchievements: 25
    }
  }
]
