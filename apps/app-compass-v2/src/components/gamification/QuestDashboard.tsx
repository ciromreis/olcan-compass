/**
 * Quest Dashboard Component
 * 
 * Displays active quests with progress tracking and completion.
 * Uses the event-driven gamification store.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Clock, 
  Gift, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Zap,
  Coins
} from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import { 
  useAvailableQuests,
  useGamificationStore,
  type Quest,
  type QuestType 
} from '@/stores/eventDrivenGamificationStore'

const QUEST_TYPE_CONFIG: Record<QuestType, { label: string; color: string; icon: typeof Target }> = {
  daily: { label: 'Daily', color: 'text-blue-400', icon: Calendar },
  weekly: { label: 'Weekly', color: 'text-purple-400', icon: Clock },
  special: { label: 'Special', color: 'text-amber-400', icon: Gift },
  event: { label: 'Event', color: 'text-pink-400', icon: Zap },
}

export function QuestDashboard() {
  const [filter, setFilter] = useState<QuestType | 'all'>('all')
  
  const quests = useAvailableQuests()
  const { completeQuest, claimQuestReward } = useGamificationStore()
  
  const filteredQuests = filter === 'all' 
    ? quests 
    : quests.filter(q => q.type === filter)
  
  const dailyQuests = quests.filter(q => q.type === 'daily')
  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  const specialQuests = quests.filter(q => q.type === 'special')
  
  const completedCount = quests.filter(q => q.status === 'completed' || q.status === 'claimed').length
  const claimableCount = quests.filter(q => q.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quests</h2>
              <p className="text-sm text-foreground/60">
                {completedCount} of {quests.length} completed
                {claimableCount > 0 && (
                  <span className="text-amber-400 ml-2">
                    ({claimableCount} ready to claim!)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Quest Type Summary */}
        <div className="flex gap-4 mt-4">
          <QuestTypeBadge 
            type="daily" 
            count={dailyQuests.length} 
            completed={dailyQuests.filter(q => q.status === 'claimed').length}
          />
          <QuestTypeBadge 
            type="weekly" 
            count={weeklyQuests.length}
            completed={weeklyQuests.filter(q => q.status === 'claimed').length}
          />
          <QuestTypeBadge 
            type="special" 
            count={specialQuests.length}
            completed={specialQuests.filter(q => q.status === 'claimed').length}
          />
        </div>
      </GlassCard>

      {/* Filters */}
      <div className="flex gap-2">
        <GlassButton
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-foreground/20' : ''}
        >
          All Quests
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => setFilter('daily')}
          className={filter === 'daily' ? 'bg-blue-500/20' : ''}
        >
          Daily
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => setFilter('weekly')}
          className={filter === 'weekly' ? 'bg-purple-500/20' : ''}
        >
          Weekly
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => setFilter('special')}
          className={filter === 'special' ? 'bg-amber-500/20' : ''}
        >
          Special
        </GlassButton>
      </div>

      {/* Quest List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredQuests.map((quest) => (
            <QuestCard 
              key={quest.id} 
              quest={quest}
              onClaim={() => claimQuestReward(quest.id)}
            />
          ))}
        </AnimatePresence>
        
        {filteredQuests.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Target className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/60">No active quests</p>
            <p className="text-sm text-foreground/40 mt-1">
              Check back later for new quests!
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

function QuestTypeBadge({ 
  type, 
  count, 
  completed 
}: { 
  type: QuestType
  count: number
  completed: number 
}) {
  const config = QUEST_TYPE_CONFIG[type]
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5">
      <config.icon className={`w-4 h-4 ${config.color}`} />
      <span className="text-sm text-foreground/60">
        {completed}/{count} {config.label}
      </span>
    </div>
  )
}

function QuestCard({ 
  quest, 
  onClaim 
}: { 
  quest: Quest
  onClaim: () => void 
}) {
  const [isClaiming, setIsClaiming] = useState(false)
  
  const config = QUEST_TYPE_CONFIG[quest.type]
  const progress = (quest.progress / quest.requirementTarget) * 100
  const isCompleted = quest.status === 'completed'
  const isClaimed = quest.status === 'claimed'
  const isActive = quest.status === 'active'
  
  const handleClaim = async () => {
    setIsClaiming(true)
    try {
      onClaim()
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <GlassCard className={`p-4 transition-all ${
        isClaimed ? 'opacity-50' : ''
      }`}>
        <div className="flex items-start gap-4">
          {/* Type Icon */}
          <div className={`p-2 rounded-lg bg-foreground/5`}>
            <config.icon className={`w-5 h-5 ${config.color}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{quest.name}</h3>
                <p className="text-sm text-foreground/60 mt-0.5">
                  {quest.description}
                </p>
              </div>
              
              {/* Status Badge */}
              {isClaimed && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Claimed
                </span>
              )}
              {isCompleted && !isClaimed && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Gift className="w-4 h-4" />
                  Ready!
                </span>
              )}
            </div>
            
            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground/60">
                  Progress: {quest.progress}/{quest.requirementTarget}
                </span>
                <span className={progress >= 100 ? 'text-green-400' : 'text-foreground/60'}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className={`h-full rounded-full ${
                    isCompleted || isClaimed
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Rewards & Actions */}
            <div className="flex items-center justify-between mt-3">
              {/* Rewards */}
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-foreground/60">
                  <Zap className="w-4 h-4 text-purple-400" />
                  {quest.xpReward} XP
                </span>
                {quest.coinReward && (
                  <span className="flex items-center gap-1 text-foreground/60">
                    <Coins className="w-4 h-4 text-amber-400" />
                    {quest.coinReward} coins
                  </span>
                )}
              </div>
              
              {/* Claim Button */}
              {isCompleted && !isClaimed && (
                <GlassButton
                  size="sm"
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isClaiming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-1" />
                      Claim
                    </>
                  )}
                </GlassButton>
              )}
            </div>
            
            {/* Expiration (for time-limited quests) */}
            {quest.expiresAt && isActive && (
              <p className="text-xs text-foreground/40 mt-2">
                Expires {new Date(quest.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
