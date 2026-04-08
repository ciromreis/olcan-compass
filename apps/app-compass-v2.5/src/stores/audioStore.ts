/**
 * Audio Store - Sound Effects and Music Management
 * Provides audio feedback for all user interactions
 */

import { useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface Sound {
  id: string
  name: string
  url: string
  category: 'ui' | 'aura' | 'guild' | 'marketplace' | 'achievement' | 'ambient'
  volume: number
  loop: boolean
  preload: boolean
}

interface AudioSettings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  ambientVolume: number
  muteAll: boolean
  muteMusic: boolean
  muteSFX: boolean
  muteAmbient: boolean
}

interface AudioState {
  // Settings
  settings: AudioSettings
  
  // Audio context and elements
  audioContext: AudioContext | null
  sounds: Map<string, HTMLAudioElement>
  currentMusic: HTMLAudioElement | null
  currentAmbient: HTMLAudioElement | null
  
  // Loading state
  isLoading: boolean
  loadedSounds: Set<string>
  
  // Actions
  initializeAudio: () => void
  loadSound: (sound: Sound) => Promise<void>
  playSound: (soundId: string, options?: { volume?: number; loop?: boolean }) => void
  stopSound: (soundId: string) => void
  playMusic: (musicId: string, options?: { volume?: number; loop?: boolean }) => void
  stopMusic: () => void
  playAmbient: (ambientId: string, options?: { volume?: number; loop?: boolean }) => void
  stopAmbient: () => void
  
  // Settings management
  updateSettings: (settings: Partial<AudioSettings>) => void
  setMasterVolume: (volume: number) => void
  setMusicVolume: (volume: number) => void
  setSFXVolume: (volume: number) => void
  setAmbientVolume: (volume: number) => void
  toggleMuteAll: () => void
  toggleMuteMusic: () => void
  toggleMuteSFX: () => void
  toggleMuteAmbient: () => void
  
  // Utility
  isLoaded: (soundId: string) => boolean
  getVolumeForCategory: (category: string) => number
}

// Sound definitions
const SOUND_DEFINITIONS: Sound[] = [
  // UI Sounds
  {
    id: 'ui_click',
    name: 'UI Click',
    url: '/sounds/ui/click.mp3',
    category: 'ui',
    volume: 0.3,
    loop: false,
    preload: true
  },
  {
    id: 'ui_hover',
    name: 'UI Hover',
    url: '/sounds/ui/hover.mp3',
    category: 'ui',
    volume: 0.2,
    loop: false,
    preload: true
  },
  {
    id: 'ui_success',
    name: 'UI Success',
    url: '/sounds/ui/success.mp3',
    category: 'ui',
    volume: 0.4,
    loop: false,
    preload: true
  },
  {
    id: 'ui_error',
    name: 'UI Error',
    url: '/sounds/ui/error.mp3',
    category: 'ui',
    volume: 0.3,
    loop: false,
    preload: true
  },
  {
    id: 'ui_notification',
    name: 'UI Notification',
    url: '/sounds/ui/notification.mp3',
    category: 'ui',
    volume: 0.4,
    loop: false,
    preload: true
  },
  
  // Aura Sounds
  {
    id: 'aura_happy',
    name: 'Aura Happy',
    url: '/sounds/aura/happy.mp3',
    category: 'aura',
    volume: 0.5,
    loop: false,
    preload: true
  },
  {
    id: 'aura_feed',
    name: 'Aura Feed',
    url: '/sounds/aura/feed.mp3',
    category: 'aura',
    volume: 0.4,
    loop: false,
    preload: true
  },
  {
    id: 'aura_play',
    name: 'Aura Play',
    url: '/sounds/aura/play.mp3',
    category: 'aura',
    volume: 0.5,
    loop: false,
    preload: true
  },
  {
    id: 'aura_train',
    name: 'Aura Train',
    url: '/sounds/aura/train.mp3',
    category: 'aura',
    volume: 0.4,
    loop: false,
    preload: true
  },
  {
    id: 'aura_evolve',
    name: 'Aura Evolve',
    url: '/sounds/aura/evolve.mp3',
    category: 'aura',
    volume: 0.6,
    loop: false,
    preload: true
  },
  {
    id: 'aura_level_up',
    name: 'Aura Level Up',
    url: '/sounds/aura/level_up.mp3',
    category: 'aura',
    volume: 0.5,
    loop: false,
    preload: true
  },
  
  // Guild Sounds
  {
    id: 'guild_join',
    name: 'Guild Join',
    url: '/sounds/guild/join.mp3',
    category: 'guild',
    volume: 0.4,
    loop: false,
    preload: true
  },
  {
    id: 'guild_message',
    name: 'Guild Message',
    url: '/sounds/guild/message.mp3',
    category: 'guild',
    volume: 0.3,
    loop: false,
    preload: true
  },
  {
    id: 'guild_battle_start',
    name: 'Guild Battle Start',
    url: '/sounds/guild/battle_start.mp3',
    category: 'guild',
    volume: 0.5,
    loop: false,
    preload: true
  },
  {
    id: 'guild_battle_win',
    name: 'Guild Battle Win',
    url: '/sounds/guild/battle_win.mp3',
    category: 'guild',
    volume: 0.6,
    loop: false,
    preload: true
  },
  {
    id: 'guild_battle_lose',
    name: 'Guild Battle Lose',
    url: '/sounds/guild/battle_lose.mp3',
    category: 'guild',
    volume: 0.4,
    loop: false,
    preload: true
  },
  
  // Marketplace Sounds
  {
    id: 'marketplace_purchase',
    name: 'Marketplace Purchase',
    url: '/sounds/marketplace/purchase.mp3',
    category: 'marketplace',
    volume: 0.4,
    loop: false,
    preload: true
  },
  {
    id: 'marketplace_sell',
    name: 'Marketplace Sell',
    url: '/sounds/marketplace/sell.mp3',
    category: 'marketplace',
    volume: 0.3,
    loop: false,
    preload: true
  },
  {
    id: 'coins_earned',
    name: 'Coins Earned',
    url: '/sounds/marketplace/coins_earned.mp3',
    category: 'marketplace',
    volume: 0.5,
    loop: false,
    preload: true
  },
  
  // Achievement Sounds
  {
    id: 'achievement_unlock',
    name: 'Achievement Unlock',
    url: '/sounds/achievement/unlock.mp3',
    category: 'achievement',
    volume: 0.6,
    loop: false,
    preload: true
  },
  {
    id: 'achievement_legendary',
    name: 'Achievement Legendary',
    url: '/sounds/achievement/legendary.mp3',
    category: 'achievement',
    volume: 0.7,
    loop: false,
    preload: true
  },
  
  // Ambient Sounds
  {
    id: 'ambient_peaceful',
    name: 'Peaceful Ambient',
    url: '/sounds/ambient/peaceful.mp3',
    category: 'ambient',
    volume: 0.3,
    loop: true,
    preload: false
  },
  {
    id: 'ambient_adventurous',
    name: 'Adventurous Ambient',
    url: '/sounds/ambient/adventurous.mp3',
    category: 'ambient',
    volume: 0.3,
    loop: true,
    preload: false
  },
  {
    id: 'ambient_mystical',
    name: 'Mystical Ambient',
    url: '/sounds/ambient/mystical.mp3',
    category: 'ambient',
    volume: 0.3,
    loop: true,
    preload: false
  }
]

// Store implementation
export const useAudioStore = create<AudioState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        settings: {
          masterVolume: 0.8,
          musicVolume: 0.6,
          sfxVolume: 0.8,
          ambientVolume: 0.4,
          muteAll: false,
          muteMusic: false,
          muteSFX: false,
          muteAmbient: false
        },
        audioContext: null,
        sounds: new Map(),
        currentMusic: null,
        currentAmbient: null,
        isLoading: false,
        loadedSounds: new Set(),
        
        // Actions
        initializeAudio: () => {
          const state = get()
          
          if (typeof window === 'undefined' || state.audioContext) return
          
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            
            set({ audioContext })
            
            // Preload essential sounds
            const essentialSounds = SOUND_DEFINITIONS.filter(sound => sound.preload)
            essentialSounds.forEach(sound => {
              get().loadSound(sound)
            })
            
          } catch (error) {
            console.error('Failed to initialize audio context:', error)
          }
        },
        
        loadSound: async (sound: Sound) => {
          const state = get()
          
          if (state.loadedSounds.has(sound.id) || state.sounds.has(sound.id)) return
          
          try {
            const audio = new Audio(sound.url)
            audio.volume = sound.volume
            audio.loop = sound.loop
            audio.preload = 'auto'
            
            // Wait for audio to load
            await new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', resolve)
              audio.addEventListener('error', reject)
              setTimeout(() => reject(new Error('Audio load timeout')), 10000)
            })
            
            const newSounds = new Map(state.sounds)
            newSounds.set(sound.id, audio)
            
            const newLoadedSounds = new Set(state.loadedSounds)
            newLoadedSounds.add(sound.id)
            
            set({
              sounds: newSounds,
              loadedSounds: newLoadedSounds
            })
            
          } catch (error) {
            console.error(`Failed to load sound ${sound.id}:`, error)
          }
        },
        
        playSound: (soundId: string, options = {}) => {
          const state = get()
          
          if (state.settings.muteAll || state.settings.muteSFX) return
          
          const sound = state.sounds.get(soundId)
          const soundDef = SOUND_DEFINITIONS.find(s => s.id === soundId)
          if (!sound) {
            // Try to load the sound if not loaded
            if (soundDef) {
              get().loadSound(soundDef).then(() => {
                get().playSound(soundId, options)
              })
            }
            return
          }

          // Set volume based on category and settings
          const categoryVolume = get().getVolumeForCategory(soundDef?.category || 'ui')
          const volume = options.volume !== undefined ? options.volume : categoryVolume
          
          sound.volume = volume * state.settings.masterVolume
          
          if (options.loop !== undefined) {
            sound.loop = options.loop
          }
          
          sound.currentTime = 0
          sound.play().catch(error => {
            console.error(`Failed to play sound ${soundId}:`, error)
          })
        },
        
        stopSound: (soundId: string) => {
          const state = get()
          const sound = state.sounds.get(soundId)
          
          if (sound) {
            sound.pause()
            sound.currentTime = 0
          }
        },
        
        playMusic: (musicId: string, options = {}) => {
          const state = get()
          
          if (state.settings.muteAll || state.settings.muteMusic) return
          
          // Stop current music
          if (state.currentMusic) {
            state.currentMusic.pause()
            state.currentMusic.currentTime = 0
          }
          
          const sound = state.sounds.get(musicId)
          const soundDef = SOUND_DEFINITIONS.find(s => s.id === musicId)
          if (!sound) {
            if (soundDef) {
              get().loadSound(soundDef).then(() => {
                get().playMusic(musicId, options)
              })
            }
            return
          }

          const categoryVolume = get().getVolumeForCategory(soundDef?.category || 'ambient')
          const volume = options.volume !== undefined ? options.volume : categoryVolume
          
          sound.volume = volume * state.settings.masterVolume * state.settings.musicVolume
          sound.loop = options.loop !== undefined ? options.loop : true
          
          sound.currentTime = 0
          sound.play().catch(error => {
            console.error(`Failed to play music ${musicId}:`, error)
          })
          
          set({ currentMusic: sound })
        },
        
        stopMusic: () => {
          const state = get()
          
          if (state.currentMusic) {
            state.currentMusic.pause()
            state.currentMusic.currentTime = 0
            set({ currentMusic: null })
          }
        },
        
        playAmbient: (ambientId: string, options = {}) => {
          const state = get()
          
          if (state.settings.muteAll || state.settings.muteAmbient) return
          
          // Stop current ambient
          if (state.currentAmbient) {
            state.currentAmbient.pause()
            state.currentAmbient.currentTime = 0
          }
          
          const sound = state.sounds.get(ambientId)
          const soundDef = SOUND_DEFINITIONS.find(s => s.id === ambientId)
          if (!sound) {
            if (soundDef) {
              get().loadSound(soundDef).then(() => {
                get().playAmbient(ambientId, options)
              })
            }
            return
          }

          const categoryVolume = get().getVolumeForCategory(soundDef?.category || 'ambient')
          const volume = options.volume !== undefined ? options.volume : categoryVolume
          
          sound.volume = volume * state.settings.masterVolume * state.settings.ambientVolume
          sound.loop = options.loop !== undefined ? options.loop : true
          
          sound.currentTime = 0
          sound.play().catch(error => {
            console.error(`Failed to play ambient ${ambientId}:`, error)
          })
          
          set({ currentAmbient: sound })
        },
        
        stopAmbient: () => {
          const state = get()
          
          if (state.currentAmbient) {
            state.currentAmbient.pause()
            state.currentAmbient.currentTime = 0
            set({ currentAmbient: null })
          }
        },
        
        // Settings management
        updateSettings: (newSettings: Partial<AudioSettings>) => {
          const state = get()
          const updatedSettings = { ...state.settings, ...newSettings }
          
          set({ settings: updatedSettings })
          
          // Apply volume changes to currently playing sounds
          if (state.currentMusic) {
            const musicDef = SOUND_DEFINITIONS.find(s => s.id === 'current_music')
            const categoryVolume = get().getVolumeForCategory(musicDef?.category || 'ambient')
            state.currentMusic.volume = categoryVolume * updatedSettings.masterVolume * updatedSettings.musicVolume
          }
          
          if (state.currentAmbient) {
            const ambientDef = SOUND_DEFINITIONS.find(s => s.id === 'current_ambient')
            const categoryVolume = get().getVolumeForCategory(ambientDef?.category || 'ambient')
            state.currentAmbient.volume = categoryVolume * updatedSettings.masterVolume * updatedSettings.ambientVolume
          }
        },
        
        setMasterVolume: (volume: number) => {
          get().updateSettings({ masterVolume: Math.max(0, Math.min(1, volume)) })
        },
        
        setMusicVolume: (volume: number) => {
          get().updateSettings({ musicVolume: Math.max(0, Math.min(1, volume)) })
        },
        
        setSFXVolume: (volume: number) => {
          get().updateSettings({ sfxVolume: Math.max(0, Math.min(1, volume)) })
        },
        
        setAmbientVolume: (volume: number) => {
          get().updateSettings({ ambientVolume: Math.max(0, Math.min(1, volume)) })
        },
        
        toggleMuteAll: () => {
          const state = get()
          get().updateSettings({ muteAll: !state.settings.muteAll })
        },
        
        toggleMuteMusic: () => {
          const state = get()
          get().updateSettings({ muteMusic: !state.settings.muteMusic })
        },
        
        toggleMuteSFX: () => {
          const state = get()
          get().updateSettings({ muteSFX: !state.settings.muteSFX })
        },
        
        toggleMuteAmbient: () => {
          const state = get()
          get().updateSettings({ muteAmbient: !state.settings.muteAmbient })
        },
        
        // Utility
        isLoaded: (soundId: string) => {
          return get().loadedSounds.has(soundId)
        },
        
        getVolumeForCategory: (category: string) => {
          const state = get()
          
          switch (category) {
            case 'ui':
            case 'aura':
            case 'guild':
            case 'marketplace':
            case 'achievement':
              return state.settings.sfxVolume
            case 'ambient':
              return state.settings.ambientVolume
            default:
              return 1.0
          }
        }
      }),
      {
        name: 'audio-store',
        partialize: (state) => ({
          settings: state.settings
        })
      }
    ),
    {
      name: 'audio-store'
    }
  )
)

// Hooks for easier usage
export const useAudio = () => useAudioStore()
export const useAudioActions = () => useAudioStore(state => state)

// Utility functions
export const playUISound = (soundId: string) => {
  useAudioStore.getState().playSound(soundId)
}

export const playAuraSound = (soundId: string) => {
  useAudioStore.getState().playSound(soundId)
}

export const playGuildSound = (soundId: string) => {
  useAudioStore.getState().playSound(soundId)
}

export const playMarketplaceSound = (soundId: string) => {
  useAudioStore.getState().playSound(soundId)
}

export const playAchievementSound = (soundId: string) => {
  useAudioStore.getState().playSound(soundId)
}

export const playBackgroundMusic = (musicId: string) => {
  useAudioStore.getState().playMusic(musicId)
}

export const playAmbientSound = (ambientId: string) => {
  useAudioStore.getState().playAmbient(ambientId)
}

// React hook for auto-initialization
export const useAudioInitializer = () => {
  const initializeAudio = useAudioStore(state => state.initializeAudio)
  
  useEffect(() => {
    // Initialize audio on first user interaction
    const handleUserInteraction = () => {
      initializeAudio()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
    
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    
    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [initializeAudio])
}

// Sound mapping for easy access
export const SOUNDS = {
  // UI
  CLICK: 'ui_click',
  HOVER: 'ui_hover',
  SUCCESS: 'ui_success',
  ERROR: 'ui_error',
  NOTIFICATION: 'ui_notification',
  
  // Aura
  AURA_HAPPY: 'aura_happy',
  AURA_FEED: 'aura_feed',
  AURA_PLAY: 'aura_play',
  AURA_TRAIN: 'aura_train',
  AURA_EVOLVE: 'aura_evolve',
  AURA_LEVEL_UP: 'aura_level_up',
  
  // Guild
  GUILD_JOIN: 'guild_join',
  GUILD_MESSAGE: 'guild_message',
  GUILD_BATTLE_START: 'guild_battle_start',
  GUILD_BATTLE_WIN: 'guild_battle_win',
  GUILD_BATTLE_LOSE: 'guild_battle_lose',
  
  // Marketplace
  PURCHASE: 'marketplace_purchase',
  SELL: 'marketplace_sell',
  COINS_EARNED: 'coins_earned',
  
  // Achievement
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  ACHIEVEMENT_LEGENDARY: 'achievement_legendary',
  
  // Ambient
  AMBIENT_PEACEFUL: 'ambient_peaceful',
  AMBIENT_ADVENTUROUS: 'ambient_adventurous',
  AMBIENT_MAGICAL: 'ambient_mystical'
} as const
