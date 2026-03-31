"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Theme interface for types
interface ThemeState {
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight'
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy'
  animations: {
    particles: boolean
    weatherEffects: boolean
    transitions: boolean
  }
}

// Mock theme store for now - will be connected to actual store
const useThemeStore = (): ThemeState => ({
  timeOfDay: 'morning',
  weather: 'sunny',
  animations: {
    particles: true,
    weatherEffects: true,
    transitions: true
  }
})

interface WeatherEffectsProps {
  enabled?: boolean
  intensity?: 'light' | 'medium' | 'heavy'
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  type: 'rain' | 'snow' | 'leaf' | 'petal'
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  enabled = true,
  intensity = 'medium',
  className = ''
}) => {
  const { weather, animations } = useThemeStore()
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Particle configuration based on weather
  const getParticleConfig = () => {
    switch (weather) {
      case 'rainy':
        return {
          type: 'rain' as const,
          count: intensity === 'light' ? 50 : intensity === 'medium' ? 100 : 200,
          speed: intensity === 'light' ? 5 : intensity === 'medium' ? 8 : 12,
          size: intensity === 'light' ? 1 : intensity === 'medium' ? 2 : 3,
          opacity: 0.6
        }
      case 'snowy':
        return {
          type: 'snow' as const,
          count: intensity === 'light' ? 30 : intensity === 'medium' ? 60 : 100,
          speed: intensity === 'light' ? 1 : intensity === 'medium' ? 2 : 3,
          size: intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 4,
          opacity: 0.8
        }
      case 'stormy':
        return {
          type: 'rain' as const,
          count: intensity === 'light' ? 100 : intensity === 'medium' ? 200 : 300,
          speed: intensity === 'light' ? 10 : intensity === 'medium' ? 15 : 20,
          size: intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 4,
          opacity: 0.7
        }
      default:
        return null
    }
  }

  // Initialize particles
  useEffect(() => {
    if (!enabled || !animations.weatherEffects) return

    const config = getParticleConfig()
    if (!config) return

    const newParticles: Particle[] = []
    for (let i = 0; i < config.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * (containerRef.current?.clientWidth || window.innerWidth),
        y: Math.random() * -100,
        size: config.size + Math.random() * 2,
        speed: config.speed + Math.random() * 2,
        opacity: config.opacity * (0.5 + Math.random() * 0.5),
        type: config.type
      })
    }
    setParticles(newParticles)
  }, [weather, intensity, enabled, animations.weatherEffects])

  // Canvas animation
  useEffect(() => {
    if (!enabled || !animations.weatherEffects || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity

        if (particle.type === 'rain') {
          // Draw rain drop
          ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)'
          ctx.lineWidth = particle.size
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle.x, particle.y + 10)
          ctx.stroke()
        } else if (particle.type === 'snow') {
          // Draw snowflake
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        // Update particle position
        particle.y += particle.speed
        particle.x += Math.sin(particle.y * 0.01) * 0.5

        // Reset particle if it goes off screen
        if (particle.y > canvas.height) {
          particle.y = -10
          particle.x = Math.random() * canvas.width
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particles, enabled, animations.weatherEffects])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Weather overlay effects
  const getWeatherOverlay = () => {
    switch (weather) {
      case 'cloudy':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-200/20 to-gray-400/20 pointer-events-none" />
        )
      case 'foggy':
        return (
          <div className="absolute inset-0 bg-gradient-to-t from-gray-100/40 to-transparent pointer-events-none" />
        )
      case 'stormy':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/30 to-gray-900/50 pointer-events-none" />
        )
      default:
        return null
    }
  }

  if (!enabled || !animations.weatherEffects) return null

  return (
    <div ref={containerRef} className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      <AnimatePresence>
        {getWeatherOverlay()}
      </AnimatePresence>
    </div>
  )
}

// Lightning effect for storms
export const LightningEffect: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { weather, animations } = useThemeStore()
  const [isFlashing, setIsFlashing] = useState(false)

  useEffect(() => {
    if (!enabled || weather !== 'stormy' || !animations.weatherEffects) return

    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 200)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [weather, enabled, animations.weatherEffects])

  if (!enabled || weather !== 'stormy' || !animations.weatherEffects) return null

  return (
    <AnimatePresence>
      {isFlashing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white/30 pointer-events-none z-50"
        />
      )}
    </AnimatePresence>
  )
}

// Wind effect
export const WindEffect: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { weather, animations } = useThemeStore()
  const [windLines, setWindLines] = useState<Array<{ id: number; x: number; y: number; width: number }>>([])

  useEffect(() => {
    if (!enabled || weather !== 'windy' || !animations.weatherEffects) return

    const lines = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      width: 50 + Math.random() * 100
    }))
    setWindLines(lines)
  }, [weather, enabled, animations.weatherEffects])

  if (!enabled || weather !== 'windy' || !animations.weatherEffects) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {windLines.map((line) => (
        <motion.div
          key={line.id}
          initial={{ x: -line.width }}
          animate={{ x: window.innerWidth }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2
          }}
          className="absolute h-px bg-white/20"
          style={{
            top: `${line.y}px`,
            width: `${line.width}px`
          }}
        />
      ))}
    </div>
  )
}

// Sun/Moon effect
export const CelestialBody: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { timeOfDay, weather } = useThemeStore()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return

    const hour = new Date().getHours()
    const dayProgress = hour / 24
    
    // Calculate position based on time
    const angle = dayProgress * Math.PI
    const x = Math.cos(angle) * 40 + 50 // Percentage
    const y = -Math.sin(angle) * 30 + 30 // Percentage
    
    setPosition({ x, y })
  }, [timeOfDay, enabled])

  if (!enabled) return null

  const isDaytime = timeOfDay !== 'night' && timeOfDay !== 'midnight'
  const isVisible = (isDaytime && weather !== 'stormy' && weather !== 'rainy') || 
                   (!isDaytime && weather !== 'cloudy' && weather !== 'foggy')

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed w-16 h-16 rounded-full pointer-events-none z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        scale: isDaytime ? [1, 1.1, 1] : [1, 0.9, 1],
        opacity: isDaytime ? 0.8 : 0.6
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {isDaytime ? (
        <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-full shadow-lg" />
      )}
    </motion.div>
  )
}
