/**
 * Aura Leaderboard Page
 *
 * Displays global rankings powered by the /gamification/leaderboard API.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import type { EvolutionStage } from '@/stores/auraStore'

type LeaderboardType = 'global' | 'guild' | 'archetype'
type TimePeriod = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  level: number
  xp: number
  companionStage: EvolutionStage
  companionName: string
  streak: number
  achievements: number
  isCurrentUser?: boolean
}

interface RawEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  level: number
  xp: number
  companionStage: number
  companionName: string
  streak: number
  achievements: number
  isCurrentUser?: boolean
}

function stageToEvolution(stage: number): EvolutionStage {
  const map: Record<number, EvolutionStage> = {
    1: 'egg',
    2: 'sprout',
    3: 'young',
    4: 'mature',
    5: 'master',
  }
  return map[stage] ?? 'egg'
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('global')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('alltime')

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = (await apiClient.getLeaderboard(20)) as RawEntry[]
      const mapped: LeaderboardEntry[] = (data || []).map((e) => ({
        ...e,
        companionStage: stageToEvolution(e.companionStage),
      }))
      setEntries(mapped)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch leaderboard:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchLeaderboard()
  }, [fetchLeaderboard])

  const currentUserRank = entries.find((e) => e.isCurrentUser)?.rank

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 flex items-center justify-center">
        <div className="animate-pulse text-foreground/40">Loading rankings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Leaderboard
          entries={entries}
          type={leaderboardType}
          period={timePeriod}
          currentUserRank={currentUserRank}
          onTypeChange={setLeaderboardType}
          onPeriodChange={setTimePeriod}
        />
      </div>
    </div>
  )
}
