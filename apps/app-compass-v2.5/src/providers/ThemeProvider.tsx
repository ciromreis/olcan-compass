"use client"

import React, { useEffect, ReactNode } from 'react'
import { useThemeStore, applyThemeColors, useThemeUpdater } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentColors, isDarkMode, mode } = useThemeStore()
  
  // Initialize theme updates
  useThemeUpdater()

  // Apply theme colors to CSS variables
  useEffect(() => {
    applyThemeColors(currentColors)
    
    // Apply dark mode class
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Apply theme mode class
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${mode}`)
    
  }, [currentColors, isDarkMode, mode])

  return <>{children}</>
}

// Theme toggle component
export const ThemeToggle: React.FC = () => {
  const { mode, setThemeMode, toggleDarkMode, timeOfDay, weather } = useThemeStore()

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
      <button
        onClick={() => setThemeMode('light')}
        className={`p-2 rounded ${mode === 'light' ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
        title="Light mode"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        onClick={() => setThemeMode('dark')}
        className={`p-2 rounded ${mode === 'dark' ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
        title="Dark mode"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
      
      <button
        onClick={() => setThemeMode('auto')}
        className={`p-2 rounded ${mode === 'auto' ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
        title="Auto mode (follows time)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="w-px h-4 bg-white/20" />
      
      <div className="text-xs text-white/70">
        {timeOfDay} • {weather}
      </div>
    </div>
  )
}

// Weather control component
export const WeatherControl: React.FC = () => {
  const { weather, setWeather, autoWeather, toggleAutoWeather } = useThemeStore()

  const weatherTypes = [
    { type: 'sunny' as const, icon: '☀️', label: 'Sunny' },
    { type: 'cloudy' as const, icon: '☁️', label: 'Cloudy' },
    { type: 'rainy' as const, icon: '🌧️', label: 'Rainy' },
    { type: 'stormy' as const, icon: '⛈️', label: 'Stormy' },
    { type: 'snowy' as const, icon: '❄️', label: 'Snowy' },
    { type: 'foggy' as const, icon: '🌫️', label: 'Foggy' },
    { type: 'windy' as const, icon: '💨', label: 'Windy' }
  ]

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
      <button
        onClick={toggleAutoWeather}
        className={`px-2 py-1 rounded text-xs ${autoWeather ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
      >
        Auto: {autoWeather ? 'ON' : 'OFF'}
      </button>
      
      {!autoWeather && (
        <div className="flex gap-1">
          {weatherTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setWeather(type)}
              className={`p-1 rounded ${weather === type ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Animation control component
export const AnimationControl: React.FC = () => {
  const { animations, toggleAnimations } = useThemeStore()

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
      <span className="text-xs text-white/70">Animations:</span>
      {Object.entries(animations).map(([key, enabled]) => (
        <button
          key={key}
          onClick={() => toggleAnimations(key as keyof typeof animations)}
          className={`px-2 py-1 rounded text-xs ${enabled ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
        >
          {key}: {enabled ? 'ON' : 'OFF'}
        </button>
      ))}
    </div>
  )
}
