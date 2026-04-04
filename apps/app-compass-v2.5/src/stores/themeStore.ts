/**
 * Theme Store - Day/Night Cycle and Weather System
 * Dynamic theming with time-based changes and weather effects
 */

import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
type ThemeMode = 'light' | 'dark' | 'auto'
type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight'
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy'
type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface ThemeState {
  // Theme settings
  mode: ThemeMode
  isDarkMode: boolean
  
  // Time-based theming
  timeOfDay: TimeOfDay
  currentTime: Date
  autoTimeTheme: boolean
  
  // Weather system
  weather: WeatherType
  temperature: number
  humidity: number
  windSpeed: number
  autoWeather: boolean
  
  // Seasonal theming
  season: Season
  autoSeason: boolean
  
  // Dynamic colors
  currentColors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    accent: string
  }
  
  // Effects
  animations: {
    particles: boolean
    weatherEffects: boolean
    transitions: boolean
  }
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void
  toggleDarkMode: () => void
  updateTime: () => void
  updateColors: () => void
  setWeather: (weather: WeatherType, temperature?: number, humidity?: number, windSpeed?: number) => void
  setSeason: (season: Season) => void
  toggleAutoTimeTheme: () => void
  toggleAutoWeather: () => void
  toggleAutoSeason: () => void
  toggleAnimations: (type: 'particles' | 'weatherEffects' | 'transitions') => void
  
  // Getters
  getTimeOfDay: () => TimeOfDay
  getSeasonFromDate: (date: Date) => Season
  getWeatherForLocation: () => WeatherType
  getThemeColors: () => ThemeState['currentColors']
}

// Helper functions
const getTimeOfDay = (date: Date): TimeOfDay => {
  const hour = date.getHours()
  
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 13) return 'noon'
  if (hour >= 13 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 19) return 'dusk'
  if (hour >= 19 && hour < 23) return 'night'
  return 'midnight'
}

const getSeasonFromDate = (date: Date): Season => {
  const month = date.getMonth()
  
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

const getWeatherForLocation = (): WeatherType => {
  // Simulate weather based on random factors
  const random = Math.random()
  
  if (random < 0.4) return 'sunny'
  if (random < 0.6) return 'cloudy'
  if (random < 0.75) return 'rainy'
  if (random < 0.85) return 'windy'
  if (random < 0.92) return 'foggy'
  if (random < 0.97) return 'stormy'
  return 'snowy'
}

const getThemeColors = (timeOfDay: TimeOfDay, weather: WeatherType, season: Season, isDarkMode: boolean) => {
  // Base colors for different times of day
  const timeColors = {
    dawn: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: isDarkMode ? '#1e1b1b' : '#fef3c7',
      surface: isDarkMode ? '#292524' : '#fed7aa',
      text: isDarkMode ? '#faf5ff' : '#1c1917',
      accent: '#fbbf24'
    },
    morning: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      background: isDarkMode ? '#083344' : '#f0fdfa',
      surface: isDarkMode ? '#164e63' : '#ccfbf1',
      text: isDarkMode ? '#f0fdfa' : '#134e4a',
      accent: '#0ea5e9'
    },
    noon: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      background: isDarkMode ? '#075985' : '#f0f9ff',
      surface: isDarkMode ? '#0c4a6e' : '#e0f2fe',
      text: isDarkMode ? '#f0f9ff' : '#0c4a6e',
      accent: '#0ea5e9'
    },
    afternoon: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      background: isDarkMode ? '#164e63' : '#ecfeff',
      surface: isDarkMode ? '#155e75' : '#cffafe',
      text: isDarkMode ? '#ecfeff' : '#164e63',
      accent: '#0ea5e9'
    },
    dusk: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: isDarkMode ? '#431407' : '#fff7ed',
      surface: isDarkMode ? '#7c2d12' : '#fed7aa',
      text: isDarkMode ? '#fff7ed' : '#431407',
      accent: '#0ea5e9'
    },
    night: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      background: isDarkMode ? '#1e1b4b' : '#faf5ff',
      surface: isDarkMode ? '#312e81' : '#ede9fe',
      text: isDarkMode ? '#faf5ff' : '#1e1b4b',
      accent: '#0ea5e9'
    },
    midnight: {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: isDarkMode ? '#1e1b4b' : '#faf5ff',
      surface: isDarkMode ? '#312e81' : '#ede9fe',
      text: isDarkMode ? '#faf5ff' : '#1e1b4b',
      accent: '#0ea5e9'
    }
  }
  
  // Weather modifications
  const weatherModifiers = {
    sunny: { brightness: 1.1, saturation: 1.2 },
    cloudy: { brightness: 0.9, saturation: 0.8 },
    rainy: { brightness: 0.8, saturation: 0.9 },
    stormy: { brightness: 0.7, saturation: 1.1 },
    snowy: { brightness: 1.2, saturation: 0.7 },
    foggy: { brightness: 0.95, saturation: 0.6 },
    windy: { brightness: 1.0, saturation: 1.0 }
  }
  
  // Season modifications
  const seasonModifiers = {
    spring: { brightness: 1.05, saturation: 1.1 },
    summer: { brightness: 1.1, saturation: 1.2 },
    autumn: { brightness: 0.95, saturation: 1.05 },
    winter: { brightness: 0.9, saturation: 0.8 }
  }
  
  const baseColors = timeColors[timeOfDay]
  // Apply modifications (simplified color adjustment)
  return {
    ...baseColors,
    primary: adjustColor(baseColors.primary, weather, season),
    secondary: adjustColor(baseColors.secondary, weather, season),
    background: adjustColor(baseColors.background, weather, season),
    surface: adjustColor(baseColors.surface, weather, season),
    text: adjustColor(baseColors.text, weather, season),
    accent: adjustColor(baseColors.accent, weather, season)
  }
}

const adjustColor = (color: string, weather: WeatherType, season: Season): string => {
  // Simplified color adjustment - in production, use proper color manipulation
  return color
}

// Store implementation
export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        mode: 'auto',
        isDarkMode: false,
        timeOfDay: 'morning',
        currentTime: new Date(),
        autoTimeTheme: true,
        weather: 'sunny',
        temperature: 22,
        humidity: 50,
        windSpeed: 10,
        autoWeather: true,
        season: 'spring',
        autoSeason: true,
        currentColors: {
          primary: '#06b6d4',
          secondary: '#22d3ee',
          background: '#f0f9ff',
          surface: '#e0f2fe',
          text: '#0f172a',
          accent: '#0ea5e9'
        },
        animations: {
          particles: true,
          weatherEffects: true,
          transitions: true
        },
        
        // Actions
        setThemeMode: (mode) => {
          set({ mode })
          
          if (mode === 'dark') {
            set({ isDarkMode: true })
          } else if (mode === 'light') {
            set({ isDarkMode: false })
          } else {
            // Auto mode - determine based on time
            const timeOfDay = get().getTimeOfDay()
            const isDark = timeOfDay === 'night' || timeOfDay === 'midnight'
            set({ isDarkMode: isDark })
          }
          
          get().updateTime()
        },
        
        toggleDarkMode: () => {
          const newDarkMode = !get().isDarkMode
          
          set({ 
            isDarkMode: newDarkMode,
            mode: newDarkMode ? 'dark' : 'light'
          })
          
          get().updateTime()
        },
        
        updateTime: () => {
          const now = new Date()
          const timeOfDay = getTimeOfDay(now)
          
          set({
            currentTime: now,
            timeOfDay
          })
          
          // Update theme if auto time theme is enabled
          if (get().autoTimeTheme && get().mode === 'auto') {
            const isDark = timeOfDay === 'night' || timeOfDay === 'midnight'
            set({ isDarkMode: isDark })
          }
          
          // Update season if auto season is enabled
          if (get().autoSeason) {
            const season = getSeasonFromDate(now)
            set({ season })
          }
          
          // Update colors
          get().updateColors()
        },
        
        setWeather: (weather, temperature, humidity, windSpeed) => {
          set({
            weather,
            temperature: temperature || get().temperature,
            humidity: humidity || get().humidity,
            windSpeed: windSpeed || get().windSpeed
          })
          
          get().updateColors()
        },
        
        setSeason: (season) => {
          set({ season })
          get().updateColors()
        },
        
        toggleAutoTimeTheme: () => {
          set({ autoTimeTheme: !get().autoTimeTheme })
          if (get().autoTimeTheme) {
            get().updateTime()
          }
        },
        
        toggleAutoWeather: () => {
          const newAutoWeather = !get().autoWeather
          set({ autoWeather: newAutoWeather })
          
          if (newAutoWeather) {
            const weather = getWeatherForLocation()
            get().setWeather(weather)
          }
        },
        
        toggleAutoSeason: () => {
          set({ autoSeason: !get().autoSeason })
          if (get().autoSeason) {
            const season = getSeasonFromDate(new Date())
            set({ season })
          }
        },
        
        toggleAnimations: (type) => {
          set(state => ({
            animations: {
              ...state.animations,
              [type]: !state.animations[type]
            }
          }))
        },
        
        // Getters
        getTimeOfDay: () => {
          return getTimeOfDay(get().currentTime)
        },
        
        getSeasonFromDate: (date) => {
          return getSeasonFromDate(date)
        },
        
        getWeatherForLocation: () => {
          return getWeatherForLocation()
        },
        
        getThemeColors: () => {
          const state = get()
          return getThemeColors(
            state.timeOfDay,
            state.weather,
            state.season,
            state.isDarkMode
          )
        },
        
        // Private methods
        updateColors: () => {
          const state = get()
          const colors = getThemeColors(
            state.timeOfDay,
            state.weather,
            state.season,
            state.isDarkMode
          )
          set({ currentColors: colors })
        }
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({
          mode: state.mode,
          isDarkMode: state.isDarkMode,
          autoTimeTheme: state.autoTimeTheme,
          autoWeather: state.autoWeather,
          autoSeason: state.autoSeason,
          animations: state.animations
        })
      }
    ),
    {
      name: 'theme-store'
    }
  )
)

// React hook for automatic theme updates
export const useThemeUpdater = () => {
  const updateTime = useThemeStore(state => state.updateTime)
  const toggleAutoTimeTheme = useThemeStore(state => state.toggleAutoTimeTheme)
  const toggleAutoWeather = useThemeStore(state => state.toggleAutoWeather)
  const toggleAutoSeason = useThemeStore(state => state.toggleAutoSeason)
  
  React.useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      updateTime()
    }, 60000) // 1 minute
    
    // Initial update
    updateTime()
    
    // Enable auto features by default
    toggleAutoTimeTheme()
    toggleAutoWeather()
    toggleAutoSeason()
    
    return () => clearInterval(interval)
  }, [updateTime, toggleAutoTimeTheme, toggleAutoWeather, toggleAutoSeason])
}

// Type for theme colors
type ThemeColors = {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  accent: string
}

// CSS variables helper
export const applyThemeColors = (colors: ThemeColors) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty('--color-background', colors.background)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-accent', colors.accent)
}
