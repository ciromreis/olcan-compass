import { useState, useEffect } from 'react'

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
  const [glowIntensity, setGlowIntensity] = useState<'low' | 'medium' | 'high'>(intensity)

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => {
          const intensities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
          const currentIndex = intensities.indexOf(prev)
          const next = intensities[(currentIndex + 1) % intensities.length]
          return next
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isActive])

  const triggerGlow = () => {
    setIsGlowing(true)
    setGlowIntensity('high')
    
    setTimeout(() => {
      setIsGlowing(false)
      setGlowIntensity(intensity)
    }, 1000)
  }

  const glowStyle = {
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    opacity: glowIntensity === 'high' ? 1 : glowIntensity === 'medium' ? 0.6 : 0.3
  }

  const glowAnimation = isActive ? {
    opacity: [glowIntensity === 'high' ? 1 : glowIntensity === 'medium' ? 0.6 : 0.3, 1, glowIntensity === 'high' ? 1 : glowIntensity === 'medium' ? 0.6 : 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {
    opacity: glowIntensity === 'high' ? 1 : glowIntensity === 'medium' ? 0.6 : 0.3,
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
