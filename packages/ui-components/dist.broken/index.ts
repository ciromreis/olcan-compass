// Companion Components
export { CompanionCard } from './components/companion/CompanionCard'
export { CompanionAvatar } from './components/companion/CompanionAvatar'
export { EvolutionViewer } from './components/companion/EvolutionViewer'
export { AbilityBadge } from './components/companion/AbilityBadge'
export { CompanionStats } from './components/companion/CompanionStats'

// Gamification Components
export { XPBar } from './components/gamification/XPBar'
export { LevelBadge } from './components/gamification/LevelBadge'
export { AchievementCard } from './components/gamification/AchievementCard'
export { ProgressBar } from './components/gamification/ProgressBar'

// Liquid Glass Components
export { GlassCard } from './components/liquid-glass/GlassCard'
export { GlassButton } from './components/liquid-glass/GlassButton'
export { GlassModal } from './components/liquid-glass/GlassModal'
export { GlassInput } from './components/liquid-glass/GlassInput'

// Animation Hooks
export { useCompanionAnimation } from './hooks/useCompanionAnimation'
export { useEvolutionAnimation } from './hooks/useEvolutionAnimation'
export { useGlowEffect } from './hooks/useGlowEffect'

// Utility Functions
export { cn } from './utils/cn'
export { getCompanionColor } from './utils/companionColors'
export { getEvolutionStage } from './utils/evolutionStages'

// Types
export type { Companion, CompanionType, EvolutionStage, CompanionRoute, FearCluster } from './types/companion'
export type { Ability, CompanionStats as StatsType } from './types/companion'
