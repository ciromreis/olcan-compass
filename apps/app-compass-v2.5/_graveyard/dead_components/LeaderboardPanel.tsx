/**
 * Leaderboard Panel
 * Display rankings and competitive features
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { 
  LeaderboardType, 
  LeaderboardPeriod, 
  LeaderboardEntry,
  LEADERBOARD_CONFIGS,
  getRankBadge,
  getRankColor
} from '@/lib/leaderboard'

interface LeaderboardPanelProps {
  type: LeaderboardType
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  currentUserId?: string
  onTypeChange?: (type: LeaderboardType) => void
  onPeriodChange?: (period: LeaderboardPeriod) => void
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  type,
  period,
  entries,
  currentUserId,
  onTypeChange,
  onPeriodChange
}) => {
  const config = LEADERBOARD_CONFIGS[type]
  const userEntry = entries.find(e => e.userId === currentUserId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">{config.icon}</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{config.title}</h2>
        <p className="text-foreground/60">{config.description}</p>
      </div>

      {/* Type Selector */}
      {onTypeChange && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(LEADERBOARD_CONFIGS) as LeaderboardType[]).map((t) => (
            <GlassButton
              key={t}
              onClick={() => onTypeChange(t)}
              className={`flex-shrink-0 ${type === t ? 'ring-2 ring-purple-500' : ''}`}
              size="sm"
            >
              <span className="mr-2">{LEADERBOARD_CONFIGS[t].icon}</span>
              {LEADERBOARD_CONFIGS[t].title}
            </GlassButton>
          ))}
        </div>
      )}

      {/* Period Selector */}
      {onPeriodChange && (
        <div className="flex gap-2 justify-center">
          {(['daily', 'weekly', 'monthly', 'all_time'] as LeaderboardPeriod[]).map((p) => (
            <GlassButton
              key={p}
              onClick={() => onPeriodChange(p)}
              className={period === p ? 'ring-2 ring-purple-500' : ''}
              size="sm"
            >
              {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </GlassButton>
          ))}
        </div>
      )}

      {/* User's Rank (if not in top 10) */}
      {userEntry && userEntry.rank > 10 && (
        <GlassCard className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getRankBadge(userEntry.rank)}</div>
              <div>
                <div className="font-bold text-foreground">Your Rank</div>
                <div className="text-sm text-foreground/60">{userEntry.companionName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">#{userEntry.rank}</div>
              <div className="text-sm text-foreground/60">{userEntry.value} {config.valueLabel}</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {entries.slice(0, 100).map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId
          const rankColor = getRankColor(entry.rank)

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard 
                className={`p-4 ${isCurrentUser ? 'ring-2 ring-purple-500 bg-purple-500/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 text-center">
                    {entry.rank <= 3 ? (
                      <div className="text-4xl">{getRankBadge(entry.rank)}</div>
                    ) : (
                      <div className={`text-2xl font-bold bg-gradient-to-r ${rankColor} bg-clip-text text-transparent`}>
                        #{entry.rank}
                      </div>
                    )}
                  </div>

                  {/* Avatar/Icon */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {entry.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground truncate">{entry.username}</h4>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 text-xs font-semibold">
                          You
                        </span>
                      )}
                      {entry.badge && (
                        <span className="text-sm">{entry.badge}</span>
                      )}
                    </div>
                    <div className="text-sm text-foreground/60 truncate">
                      {entry.companionName} • {entry.archetype}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-foreground">{entry.value}</div>
                    <div className="text-xs text-foreground/60">{config.valueLabel}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Rankings Yet</h3>
          <p className="text-foreground/60">Be the first to climb the leaderboard!</p>
        </div>
      )}
    </div>
  )
}
