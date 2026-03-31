// Companion Components
export { CompanionCard } from './components/companion/CompanionCard'
export { CompanionAvatar } from './components/companion/CompanionAvatar'
export { EvolutionViewer } from './components/companion/EvolutionViewer'
export { AbilityBadge } from './components/companion/AbilityBadge'
export { CompanionStats } from './components/companion/CompanionStats'
export { EnhancedCompanionCard } from './components/companion/EnhancedCompanionCard'
export { EvolutionPath } from './components/companion/EvolutionPath'

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

// Effects Components
export { WeatherEffects, LightningEffect, WindEffect, CelestialBody } from './components/effects/WeatherEffects'
export { NanoBananaImage } from './components/effects/NanoBananaImage'

// Utility Functions
export { cn } from './utils/cn'
export { getCompanionColor } from './utils/companionColors'
export { getEvolutionStage } from './utils/evolutionStages'

// Types
export type { Companion, CompanionType, EvolutionStage, CompanionRoute, FearCluster } from './types/companion'
export type { Ability, CompanionStats as StatsType } from './types/companion'
