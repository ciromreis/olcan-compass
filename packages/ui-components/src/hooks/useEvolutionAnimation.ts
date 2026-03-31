import { useState, useEffect } from 'react'

interface UseEvolutionAnimationProps {
  companionType: string
  evolutionStage: string
  isEvolving?: boolean
}

export const useEvolutionAnimation = ({ 
  isEvolving = false 
}: { isEvolving?: boolean }) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'evolving' | 'complete'>('idle')

  useEffect(() => {
    if (isEvolving) {
      setAnimationPhase('evolving')
      const timer = setTimeout(() => {
        setAnimationPhase('complete')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isEvolving])

  const getEvolutionAnimation = () => {
    const animations = {
      idle: {
        scale: [1, 1, 1],
        rotate: [0, 0, 0],
        opacity: [1, 1, 1],
        duration: 1,
        ease: "easeInOut"
      },
      evolving: {
        scale: [1.1, 1.5, 1.2, 1.3],
        rotate: [1080, 1440, 1800, 2160],
        opacity: [0.4, 0.2, 0.6, 1],
        duration: 2,
        ease: "easeInOut"
      },
      complete: {
        scale: [1.3, 1.1, 1],
        rotate: [2160, 2340, 2520],
        opacity: [1, 1, 1],
        duration: 1,
        ease: "easeOut"
      }
    }
    
    const phaseAnimations = animations as Record<typeof animationPhase, typeof animations.idle>
    return phaseAnimations[animationPhase] || animations.idle
  }

  const getParticleAnimation = () => {
    return {
      initial: { opacity: 0, scale: 0, y: 0 },
      animate: { 
        opacity: [0, 1, 0], 
        scale: [0, 1, 0], 
        y: [0, -100, -200] 
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }
    }
  }

  const getLightBeamAnimation = () => {
    return {
      initial: { opacity: 0, scaleY: 0 },
      animate: { 
        opacity: [0, 0.8, 0], 
        scaleY: [0, 1, 0] 
      },
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const getGlowAnimation = () => {
    const glowIntensity = {
      idle: 0.3,
      evolving: 1,
      complete: 0.3
    }
  
    const intensityValues = glowIntensity as Record<typeof animationPhase, number>
  
    return {
      animate: {
        opacity: [0.3, intensityValues[animationPhase], 0.3],
        scale: [1, 1.2, 1]
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return {
    animationPhase,
    evolutionProgress: animationPhase === 'evolving' ? 50 : animationPhase === 'complete' ? 100 : 0,
    evolutionAnimation: getEvolutionAnimation(),
    particleAnimation: getParticleAnimation(),
    lightBeamAnimation: getLightBeamAnimation(),
    glowAnimation: getGlowAnimation(),
    isAnimating: animationPhase !== 'idle'
  }
}
