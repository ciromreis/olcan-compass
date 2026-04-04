"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn, getCompanionColor } from '../../utils'
import { Companion, CompanionType, EvolutionStage } from '../../types/companion'

interface CompanionAvatarProps {
  companion: Companion
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  showEvolution?: boolean
  className?: string
}

// SVG Companion Components for each archetype
const StrategistCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -8, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Fox Body */}
      <path d="M60 260 L60 120 L140 120 L140 260 Z" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" opacity="0.8" />
      <path d="M60 120 Q100 100 140 120" fill="none" stroke="#6d28d9" strokeWidth="2" />
      {/* Fox Head */}
      <circle cx="100" cy="80" r="30" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="3" fill="#1f2937" />
      <circle cx="110" cy="75" r="3" fill="#1f2937" />
      {/* Strategic Elements */}
      <rect x="70" y="140" width="60" height="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" transform="rotate(-5 100 160)" />
      <path d="M75 150 L125 170 M75 170 L125 150" stroke="#f59e0b" strokeWidth="0.5" transform="rotate(-5 100 160)" />
      {/* Evolution Glow */}
      {stage === 'mature' && (
        <circle cx="100" cy="150" r="80" fill="url(#strategistGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="strategistGlow">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const InnovatorCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Dragon Body */}
      <ellipse cx="100" cy="180" rx="40" ry="80" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" opacity="0.8" />
      {/* Dragon Head */}
      <ellipse cx="100" cy="80" rx="35" ry="40" fill="#22d3ee" stroke="#0891b2" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="4" fill="#1f2937" />
      <circle cx="110" cy="75" r="4" fill="#1f2937" />
      {/* Innovation Elements */}
      <circle cx="100" cy="140" r="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <path d="M100 125 L100 155 M85 140 L115 140" stroke="#f59e0b" strokeWidth="2" />
      {/* Evolution Glow */}
      {stage === 'young' && (
        <circle cx="100" cy="150" r="70" fill="url(#innovatorGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="innovatorGlow">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const CreatorCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -10, 0] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Lion Body */}
      <ellipse cx="100" cy="200" rx="45" ry="60" fill="#10b981" stroke="#059669" strokeWidth="2" opacity="0.8" />
      {/* Lion Head */}
      <circle cx="100" cy="80" r="35" fill="#34d399" stroke="#059669" strokeWidth="2" />
      {/* Mane */}
      <circle cx="100" cy="80" r="45" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="5,5" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="3" fill="#1f2937" />
      <circle cx="110" cy="75" r="3" fill="#1f2937" />
      {/* Creation Elements */}
      <path d="M70 160 Q100 140 130 160" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <circle cx="100" cy="150" r="8" fill="#fbbf24" />
      {/* Evolution Glow */}
      {stage === 'sprout' && (
        <circle cx="100" cy="150" r="60" fill="url(#creatorGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="creatorGlow">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const DiplomatCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Water Spirit Body */}
      <ellipse cx="100" cy="180" rx="50" ry="70" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" opacity="0.7" />
      {/* Head */}
      <circle cx="100" cy="80" r="30" fill="#67e8f9" stroke="#0891b2" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="3" fill="#1f2937" />
      <circle cx="110" cy="75" r="3" fill="#1f2937" />
      {/* Diplomatic Elements */}
      <path d="M70 150 Q100 130 130 150" stroke="#3b82f6" strokeWidth="2" fill="none" />
      <circle cx="100" cy="140" r="10" fill="#3b82f6" opacity="0.6" />
      {/* Evolution Glow */}
      {stage === 'mature' && (
        <circle cx="100" cy="150" r="75" fill="url(#diplomatGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="diplomatGlow">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const PioneerCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -7, 0] } : undefined}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Pioneer Body */}
      <rect x="70" y="120" width="60" height="140" rx="10" fill="#f97316" stroke="#ea580c" strokeWidth="2" opacity="0.8" />
      {/* Head */}
      <circle cx="100" cy="80" r="30" fill="#fb923c" stroke="#ea580c" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="3" fill="#1f2937" />
      <circle cx="110" cy="75" r="3" fill="#1f2937" />
      {/* Pioneer Elements */}
      <path d="M70 150 Q100 130 130 150" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <rect x="85" y="140" width="30" height="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Evolution Glow */}
      {stage === 'young' && (
        <circle cx="100" cy="150" r="65" fill="url(#pioneerGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="pioneerGlow">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

const ScholarCompanion: React.FC<{ stage: EvolutionStage; size: string; animated?: boolean }> = ({ stage, size, animated }) => (
  <svg viewBox="0 0 200 300" className={size}>
    <motion.g
      animate={animated ? { y: [0, -5, 0] } : undefined}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Scholar Body */}
      <ellipse cx="100" cy="180" rx="40" ry="70" fill="#6366f1" stroke="#4f46e5" strokeWidth="2" opacity="0.8" />
      {/* Head */}
      <circle cx="100" cy="80" r="30" fill="#818cf8" stroke="#4f46e5" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="90" cy="75" r="3" fill="#1f2937" />
      <circle cx="110" cy="75" r="3" fill="#1f2937" />
      {/* Scholar Elements */}
      <rect x="70" y="140" width="60" height="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M75 150 L125 170 M75 170 L125 150" stroke="#f59e0b" strokeWidth="1" />
      {/* Evolution Glow */}
      {stage === 'sprout' && (
        <circle cx="100" cy="150" r="55" fill="url(#scholarGlow)" opacity="0.3" />
      )}
    </motion.g>
    <defs>
      <radialGradient id="scholarGlow">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
)

// Companion component mapping
const companionComponents: Record<CompanionType, React.FC<{ stage: EvolutionStage; size: string }>> = {
  strategist: StrategistCompanion,
  innovator: InnovatorCompanion,
  creator: CreatorCompanion,
  diplomat: DiplomatCompanion,
  pioneer: PioneerCompanion,
  scholar: ScholarCompanion,
  guardian: CreatorCompanion, // Reuse creator for now
  visionary: InnovatorCompanion, // Reuse innovator for now
  academic: ScholarCompanion, // Reuse scholar for now
  communicator: DiplomatCompanion, // Reuse diplomat for now
  analyst: ScholarCompanion, // Reuse scholar for now
  luminary: InnovatorCompanion // Reuse innovator for now
}

const sizeClasses = {
  sm: 'w-16 h-20',
  md: 'w-24 h-32',
  lg: 'w-32 h-40',
  xl: 'w-48 h-60'
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companion,
  size = 'medium',
  showEvolution = false,
  animated = true,
  className
}) => {
  const isAnimated = animated;
  const archetypeColors = getCompanionColor(companion.type)
  const CompanionComponent = companionComponents[companion.type]

  return (
    <div className={cn('relative', sizeClasses[size as keyof typeof sizeClasses], className)}>
      {/* Evolution Glow Effect */}
      {showEvolution && companion.evolutionStage !== 'egg' && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full"
          animate={animated ? {
            background: `radial-gradient(circle, ${archetypeColors.glow} 0%, transparent 70%)`,
            scale: [1, 1.2, 1]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Companion SVG */}
      <div className="relative z-10 w-full h-full">
        <CompanionComponent 
          stage={companion.evolutionStage} 
          size={sizeClasses[size as keyof typeof sizeClasses]} 
        />
      </div>

      {/* Level Badge */}
      <div className="absolute -top-2 -right-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-companion-accent to-yellow-500 border-2 border-white shadow-level flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {companion.level}
          </span>
        </div>
      </div>

      {/* Evolution Sparkles */}
      {showEvolution && animated && companion.evolutionStage !== 'egg' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
