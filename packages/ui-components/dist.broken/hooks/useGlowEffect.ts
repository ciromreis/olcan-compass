import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface UseGlowEffectProps {
  isActive: boolean
  color?: string
  intensity?: 'low' | 'medium' | 'high'
}

export const useGlowEffect = ({ 
  isActive, 
  color = '#60A5FA', 
  intensity = 'medium' 
}: UseGlowEffectProps) => {
  const [isGlowing, setIsGlowing] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(intensity)

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => {
          const next = prev + 0.1
          return next > 1 ? intensity : next
        })
      }, duration * 100)

      return () => clearInterval(interval)
    }
  }, [pulse, duration, intensity])

  const triggerGlow = () => {
    setIsGlowing(true)
    setGlowIntensity(1)
    
    setTimeout(() => {
      setIsGlowing(false)
      setGlowIntensity(intensity)
    }, duration * 1000)
  }

  const glowStyle = {
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    opacity: glowIntensity
  }

  const glowAnimation = pulse ? {
    opacity: [intensity, 1, intensity],
    scale: [1, 1.1, 1],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {
    opacity: glowIntensity,
    scale: 1
  }

  return {
    isGlowing,
    glowIntensity,
    triggerGlow,
    glowStyle,
    glowAnimation
  }
}
