import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface UseEvolutionAnimationProps {
  isEvolving: boolean
  evolutionStage: string
  onAnimationComplete?: () => void
}

export const useEvolutionAnimation = ({ 
  isEvolving, 
  evolutionStage, 
  onAnimationComplete 
}: UseEvolutionAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'preparing' | 'evolving' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isEvolving && animationPhase === 'idle') {
      setAnimationPhase('preparing')
      
      // Preparation phase
      setTimeout(() => {
        setAnimationPhase('evolving')
        setProgress(0)
        
        // Evolution progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              setAnimationPhase('complete')
              onEvolutionComplete?.()
              return 100
            }
            return prev + 10
          })
        }, 200)
      }, 1000)
    }
  }, [isEvolving, animationPhase, onEvolutionComplete])

  const getEvolutionAnimation = () => {
    const animations = {
      preparing: {
        scale: [1, 1.2, 0.8, 1.1],
        rotate: [0, 360, 720, 1080],
        opacity: [1, 0.8, 0.6, 0.4],
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
    
    const phaseAnimations = animations as Record<typeof animationPhase, typeof animations.preparing>
    return phaseAnimations[animationPhase] || animations.preparing
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
      preparing: 0.5,
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
    progress,
    evolutionAnimation: getEvolutionAnimation(),
    particleAnimation: getParticleAnimation(),
    lightBeamAnimation: getLightBeamAnimation(),
    glowAnimation: getGlowAnimation(),
    isAnimating: animationPhase !== 'idle'
  }
}
