/**
 * Achievement Showcase Component
 * 
 * Displays unlocked achievements and progress toward locked ones.
 * Uses the event-driven gamification store.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Lock, Star, Sparkles, Award, TrendingUp } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { 
  useAchievements, 
  useUnlockedAchievements,
  type Achievement,
  type AchievementRarity 
} from '@/stores/eventDrivenGamificationStore'

const RARITY_CONFIG: Record<AchievementRarity, { color: string; icon: typeof Star }> = {
  common: { color: 'text-slate-400', icon: Star },
  rare: { color: 'text-blue-400', icon: Award },
  epic: { color: 'text-purple-400', icon: Sparkles },
  legendary: { color: 'text-amber-400', icon: Trophy },
}

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  progression: TrendingUp,
  companion: Star,
  execution: Award,
  marketplace: Trophy,
  social: Sparkles,
  engagement: TrendingUp,
}

export function AchievementShowcase() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const allAchievements = useAchievements()
  const unlockedAchievements = useUnlockedAchievements()
  
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
  
  const filteredAchievements = allAchievements.filter(achievement => {
    // Filter by lock status
    if (filter === 'unlocked' && !unlockedIds.has(achievement.id)) return false
    if (filter === 'locked' && unlockedIds.has(achievement.id)) return false
    
    // Filter by category
    if (selectedCategory && achievement.category !== selectedCategory) return false
    
    return true
  })
  
  const categories = Array.from(new Set(allAchievements.map(a => a.category)))
  
  const stats = {
    total: allAchievements.length,
    unlocked: unlockedAchievements.length,
    percentage: Math.round((unlockedAchievements.length / allAchievements.length) * 100),
    byRarity: {
      common: allAchievements.filter(a => a.rarity === 'common' && unlockedIds.has(a.id)).length,
      rare: allAchievements.filter(a => a.rarity === 'rare' && unlockedIds.has(a.id)).length,
      epic: allAchievements.filter(a => a.rarity === 'epic' && unlockedIds.has(a.id)).length,
      legendary: allAchievements.filter(a => a.rarity === 'legendary' && unlockedIds.has(a.id)).length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Achievements</h2>
              <p className="text-sm text-foreground/60">
                {stats.unlocked} of {stats.total} unlocked ({stats.percentage}%)
              </p>
            </div>
          </div>
          
          {/* Rarity Summary */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-slate-400" />
              <span>{stats.byRarity.common}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-400" />
              <span>{stats.byRarity.rare}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{stats.byRarity.epic}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{stats.byRarity.legendary}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            className="h-full bg-gradient-to-r from-amber-400 via-purple-400 to-blue-400"
          />
        </div>
      </GlassCard>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <GlassButton
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-foreground/20' : ''}
        >
          All
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => setFilter('unlocked')}
          className={filter === 'unlocked' ? 'bg-green-500/20' : ''}
        >
          Unlocked
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => setFilter('locked')}
          className={filter === 'locked' ? 'bg-foreground/20' : ''}
        >
          Locked
        </GlassButton>
        
        <div className="w-px h-8 bg-foreground/20 mx-2" />
        
        {categories.map(category => (
          <GlassButton
            key={category}
            size="sm"
            onClick={() => setSelectedCategory(
              selectedCategory === category ? null : category
            )}
            className={selectedCategory === category ? 'bg-purple-500/20' : ''}
          >
            <span className="capitalize">{category}</span>
          </GlassButton>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlockedIds.has(achievement.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AchievementCard({ 
  achievement, 
  isUnlocked 
}: { 
  achievement: Achievement
  isUnlocked: boolean 
}) {
  const rarity = RARITY_CONFIG[achievement.rarity]
  const CategoryIcon = CATEGORY_ICONS[achievement.category] || Trophy
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <GlassCard 
        className={`p-4 transition-all duration-300 ${
          isUnlocked ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${
            isUnlocked 
              ? `bg-gradient-to-br from-${achievement.rarity === 'legendary' ? 'amber' : achievement.rarity === 'epic' ? 'purple' : 'blue'}-500/20`
              : 'bg-foreground/10'
          }`}>
            {isUnlocked ? (
              <span className="text-2xl">{achievement.icon}</span>
            ) : (
              <Lock className="w-6 h-6 text-foreground/40" />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{achievement.name}</h3>
              {isUnlocked && (
                <rarity.icon className={`w-4 h-4 ${rarity.color}`} />
              )}
            </div>
            
            <p className="text-sm text-foreground/60 mt-1">
              {achievement.description}
            </p>
            
            {/* Category & Reward */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-foreground/40">
                <CategoryIcon className="w-3 h-3" />
                <span className="capitalize">{achievement.category}</span>
              </span>
              
              {isUnlocked ? (
                <span className="text-amber-400">
                  +{achievement.xpReward} XP
                </span>
              ) : (
                <span className="text-foreground/40">
                  {achievement.progress}/{achievement.requirementTarget} progress
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar (if locked) */}
        {!isUnlocked && achievement.requirementTarget > 1 && (
          <div className="mt-3">
            <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/40 rounded-full"
                style={{ 
                  width: `${Math.min(
                    (achievement.progress / achievement.requirementTarget) * 100,
                    100
                  )}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {/* Unlocked Date (if unlocked) */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-green-400">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
