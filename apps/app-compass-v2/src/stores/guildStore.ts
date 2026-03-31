/**
 * Real Working Guild Store
 * Actually connects to backend API and manages real guild data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface Guild {
  id: number
  name: string
  description: string
  emblem: string
  color: string
  focusArea: string
  memberCount: number
  level: number
  experiencePoints: number
  battlesWon: number
  battlesLost: number
  isPrivate: boolean
  createdAt: string
}

interface GuildMember {
  id: number
  userId: number
  username: string
  firstName: string
  role: 'leader' | 'officer' | 'member'
  joinedAt: string
  contributionPoints: number
}

interface GuildMessage {
  id: number
  content: string
  messageType: 'text' | 'system' | 'battle_result'
  createdAt: string
  user: {
    id: number
    username: string
    firstName: string
  }
}

interface GuildBattle {
  id: number
  battleType: 'practice' | 'ranked' | 'tournament'
  status: 'pending' | 'active' | 'completed'
  guildScore: number
  opponentScore: number
  winnerGuildId?: number
  battleDate: string
  completedAt?: string
}

interface GuildState {
  // State
  guilds: Guild[]
  myGuild: Guild | null
  myGuildRole: string | null
  guildDetails: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchGuilds: () => Promise<void>
  createGuild: (guildData: any) => Promise<void>
  joinGuild: (guildId: number) => Promise<void>
  leaveGuild: (guildId: number) => Promise<void>
  fetchMyGuild: () => Promise<void>
  fetchGuildDetails: (guildId: number) => Promise<void>
  sendMessage: (guildId: number, content: string) => Promise<void>
  createBattle: (guildId: number, battleData: any) => Promise<void>
  clearError: () => void
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class GuildAPI {
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
  
  static async getGuilds(params?: any) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/guilds${query ? '?' + query : ''}`)
  }
  
  static async createGuild(guildData: any) {
    return this.request('/guilds', {
      method: 'POST',
      body: JSON.stringify(guildData),
    })
  }
  
  static async joinGuild(guildId: number) {
    return this.request(`/guilds/${guildId}/join`, {
      method: 'POST',
    })
  }
  
  static async leaveGuild(guildId: number) {
    return this.request(`/guilds/${guildId}/leave`, {
      method: 'POST',
    })
  }
  
  static async getMyGuild() {
    return this.request('/guilds/my-guild')
  }
  
  static async getGuildDetails(guildId: number) {
    return this.request(`/guilds/${guildId}`)
  }
  
  static async sendMessage(guildId: number, content: string) {
    return this.request(`/guilds/${guildId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }
  
  static async createBattle(guildId: number, battleData: any) {
    return this.request(`/guilds/${guildId}/battles`, {
      method: 'POST',
      body: JSON.stringify(battleData),
    })
  }
}

// Store implementation
export const useGuildStore = create<GuildState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        guilds: [],
        myGuild: null,
        myGuildRole: null,
        guildDetails: null,
        isLoading: false,
        error: null,
        
        // Actions
        fetchGuilds: async (params?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const guilds = await GuildAPI.getGuilds(params)
            set({ guilds, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch guilds' 
            })
          }
        },
        
        createGuild: async (guildData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await GuildAPI.createGuild(guildData)
            
            // Refresh guilds list
            await get().fetchGuilds()
            
            // Fetch user's guild
            await get().fetchMyGuild()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to create guild' 
            })
          }
        },
        
        joinGuild: async (guildId: number) => {
          set({ isLoading: true, error: null })
          
          try {
            await GuildAPI.joinGuild(guildId)
            
            // Fetch user's guild
            await get().fetchMyGuild()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to join guild' 
            })
          }
        },
        
        leaveGuild: async (guildId: number) => {
          set({ isLoading: true, error: null })
          
          try {
            await GuildAPI.leaveGuild(guildId)
            
            // Clear user's guild
            set({ myGuild: null, myGuildRole: null })
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to leave guild' 
            })
          }
        },
        
        fetchMyGuild: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await GuildAPI.getMyGuild()
            
            set({ 
              myGuild: response.guild,
              myGuildRole: response.role,
              isLoading: false 
            })
          } catch (error) {
            // User might not be in a guild
            set({ 
              myGuild: null, 
              myGuildRole: null,
              isLoading: false 
            })
          }
        },
        
        fetchGuildDetails: async (guildId: number) => {
          set({ isLoading: true, error: null })
          
          try {
            const details = await GuildAPI.getGuildDetails(guildId)
            set({ guildDetails: details, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch guild details' 
            })
          }
        },
        
        sendMessage: async (guildId: number, content: string) => {
          try {
            await GuildAPI.sendMessage(guildId, content)
            
            // Refresh guild details to get new message
            await get().fetchGuildDetails(guildId)
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to send message' 
            })
          }
        },
        
        createBattle: async (guildId: number, battleData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await GuildAPI.createBattle(guildId, battleData)
            
            // Refresh guild details
            await get().fetchGuildDetails(guildId)
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to create battle' 
            })
          }
        },
        
        clearError: () => {
          set({ error: null })
        },
      }),
      {
        name: 'guild-store',
        partialize: (state) => ({
          myGuild: state.myGuild,
          myGuildRole: state.myGuildRole,
        }),
      }
    ),
    {
      name: 'guild-store',
    }
  )
)

// Hooks for easier usage
export const useGuild = () => useGuildStore()
export const useGuildActions = () => useGuildStore(state => state)

// Utility functions
export const getGuildFocusInfo = (focusArea: string) => {
  const focusAreas = {
    general: {
      name: 'General',
      description: 'Open to all career paths',
      icon: '🌟'
    },
    technology: {
      name: 'Technology',
      description: 'For tech professionals and developers',
      icon: '💻'
    },
    business: {
      name: 'Business',
      description: 'For entrepreneurs and business professionals',
      icon: '💼'
    },
    creative: {
      name: 'Creative',
      description: 'For artists, designers, and creators',
      icon: '🎨'
    },
    healthcare: {
      name: 'Healthcare',
      description: 'For medical and healthcare professionals',
      icon: '🏥'
    },
    education: {
      name: 'Education',
      description: 'For teachers and education professionals',
      icon: '📚'
    }
  }
  
  return focusAreas[focusArea as keyof typeof focusAreas] || focusAreas.general
}

export const getGuildRoleInfo = (role: string) => {
  const roles = {
    leader: {
      name: 'Guild Leader',
      description: 'Manages the guild and can create battles',
      icon: '👑',
      color: '#f59e0b'
    },
    officer: {
      name: 'Guild Officer',
      description: 'Helps manage guild activities',
      icon: '⭐',
      color: '#3b82f6'
    },
    member: {
      name: 'Guild Member',
      description: 'Regular guild member',
      icon: '👥',
      color: '#6b7280'
    }
  }
  
  return roles[role as keyof typeof roles] || roles.member
}

export const getBattleTypeInfo = (battleType: string) => {
  const battleTypes = {
    practice: {
      name: 'Practice Battle',
      description: 'Friendly practice match',
      icon: '🎯',
      color: '#10b981'
    },
    ranked: {
      name: 'Ranked Battle',
      description: 'Competitive ranked match',
      icon: '⚔️',
      color: '#ef4444'
    },
    tournament: {
      name: 'Tournament Battle',
      description: 'Official tournament match',
      icon: '🏆',
      color: '#f59e0b'
    }
  }
  
  return battleTypes[battleType as keyof typeof battleTypes] || battleTypes.practice
}
