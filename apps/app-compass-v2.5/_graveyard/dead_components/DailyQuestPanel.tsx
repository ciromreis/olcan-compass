/**
 * Daily Quest Panel
 * Shows daily challenges and rewards
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Target, Trophy, Star, Check, Clock } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'

export interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special'
  progress: number
  target: number
  reward: {
    xp: number
    items?: string[]
  }
  expiresAt?: string
  completed: boolean
}

export interface DailyQuestPanelProps {
  quests: Quest[]
  onClaimReward?: (questId: string) => void
}

const QUEST_TYPE_COLORS = {
  daily: 'from-blue-500 to-cyan-500',
  weekly: 'from-purple-500 to-pink-500',
  special: 'from-slate-500 to-slate-500'
}

const QUEST_TYPE_LABELS = {
  daily: 'Daily Quest',
  weekly: 'Weekly Quest',
  special: 'Special Event'
}

export const DailyQuestPanel: React.FC<DailyQuestPanelProps> = ({
  quests,
  onClaimReward
}) => {
  const activeQuests = quests.filter(q => !q.completed)
  const completedQuests = quests.filter(q => q.completed)
  const totalXPAvailable = activeQuests.reduce((sum, q) => sum + q.reward.xp, 0)

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Daily Quests</h2>
        <p className="text-foreground/60">
          Complete quests to earn rewards and XP
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{activeQuests.length}</div>
          <div className="text-xs text-foreground/60">Active</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{completedQuests.length}</div>
          <div className="text-xs text-foreground/60">Completed</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-600 mb-1">{totalXPAvailable}</div>
          <div className="text-xs text-foreground/60">XP Available</div>
        </GlassCard>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Active Quests
          </h3>
          <div className="space-y-4">
            {activeQuests.map((quest, index) => {
              const progressPercent = (quest.progress / quest.target) * 100
              const isComplete = quest.progress >= quest.target
              const timeRemaining = getTimeRemaining(quest.expiresAt)

              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${QUEST_TYPE_COLORS[quest.type]} opacity-5`} />
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-foreground">{quest.title}</h4>
                            {isComplete && (
                              <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
                                Ready to Claim
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-foreground/60">{quest.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${QUEST_TYPE_COLORS[quest.type]} bg-opacity-20 text-xs font-semibold`}>
                            {QUEST_TYPE_LABELS[quest.type]}
                          </span>
                          {timeRemaining && (
                            <div className="flex items-center gap-1 text-xs text-foreground/60">
                              <Clock className="w-3 h-3" />
                              {timeRemaining}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-foreground/60">Progress</span>
                          <span className="font-semibold text-foreground">
                            {quest.progress} / {quest.target}
                          </span>
                        </div>
                        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${QUEST_TYPE_COLORS[quest.type]}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-semibold text-foreground">
                              +{quest.reward.xp} XP
                            </span>
                          </div>
                          {quest.reward.items && quest.reward.items.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-foreground/60">
                                +{quest.reward.items.length} items
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {isComplete && onClaimReward && (
                          <GlassButton
                            onClick={() => onClaimReward(quest.id)}
                            size="sm"
                          >
                            <Trophy className="w-4 h-4" />
                            Claim Reward
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Completed Today
          </h3>
          <div className="space-y-3">
            {completedQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{quest.title}</h4>
                        <p className="text-xs text-foreground/60">Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-foreground">+{quest.reward.xp} XP</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 && completedQuests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Target className="w-10 h-10 text-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Quests Available</h3>
          <p className="text-foreground/60">Check back tomorrow for new daily quests!</p>
        </div>
      )}
    </div>
  )
}
