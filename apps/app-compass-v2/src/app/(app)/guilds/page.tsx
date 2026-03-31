/**
 * Guilds List Page
 * 
 * Browse and discover guilds to join.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Star,
  Lock,
  Globe,
  ChevronRight,
  Trophy,
  Zap
} from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import Link from 'next/link'

interface Guild {
  id: string
  name: string
  description: string
  icon?: string
  banner?: string
  is_public: boolean
  level: number
  xp: number
  total_members: number
  max_members: number
  total_battles_won: number
  total_quests_completed: number
  tags: string[]
  created_at: string
}

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'members' | 'level' | 'created_at'>('members')
  const [showPublicOnly, setShowPublicOnly] = useState(true)

  useEffect(() => {
    // TODO: Fetch guilds from API
    // Placeholder data
    setGuilds([
      {
        id: '1',
        name: 'Tech Career Accelerators',
        description: 'Supporting tech professionals in their career journey',
        is_public: true,
        level: 15,
        xp: 12500,
        total_members: 45,
        max_members: 50,
        total_battles_won: 23,
        total_quests_completed: 156,
        tags: ['tech', 'career', 'networking'],
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Product Managers United',
        description: 'Community for product managers to share insights and grow',
        is_public: true,
        level: 12,
        xp: 9800,
        total_members: 38,
        max_members: 50,
        total_battles_won: 18,
        total_quests_completed: 124,
        tags: ['product', 'management', 'strategy'],
        created_at: new Date().toISOString()
      }
    ])
    setIsLoading(false)
  }, [])

  const filteredGuilds = guilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guild.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVisibility = !showPublicOnly || guild.is_public
    return matchesSearch && matchesVisibility
  })

  const sortedGuilds = [...filteredGuilds].sort((a, b) => {
    if (sortBy === 'members') return b.total_members - a.total_members
    if (sortBy === 'level') return b.level - a.level
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 flex items-center justify-center">
        <div className="animate-pulse text-foreground/40">Loading guilds...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Users className="w-10 h-10" />
                Guilds
              </h1>
              <p className="text-foreground/60 mt-2">
                Join communities, collaborate on quests, and grow together
              </p>
            </div>
            <Link href="/guilds/create">
              <GlassButton className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Guild
              </GlassButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{guilds.length}</div>
              <div className="text-sm text-foreground/60">Active Guilds</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {guilds.reduce((sum, g) => sum + g.total_members, 0)}
              </div>
              <div className="text-sm text-foreground/60">Total Members</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">
                {guilds.reduce((sum, g) => sum + g.total_battles_won, 0)}
              </div>
              <div className="text-sm text-foreground/60">Battles Won</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {guilds.reduce((sum, g) => sum + g.total_quests_completed, 0)}
              </div>
              <div className="text-sm text-foreground/60">Quests Completed</div>
            </GlassCard>
          </div>

          {/* Search and Filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search guilds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="members">Mais Membros</option>
                <option value="level">Maior Nível</option>
                <option value="created_at">Mais Recentes</option>
              </select>

              {/* Visibility Filter */}
              <button
                onClick={() => setShowPublicOnly(!showPublicOnly)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showPublicOnly
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : 'bg-foreground/5 border-foreground/10 text-foreground/60'
                }`}
              >
                <Globe className="w-5 h-5 inline mr-2" />
                Apenas Públicas
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Guilds Grid */}
        {sortedGuilds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold text-foreground/60 mb-2">
              No guilds found
            </h3>
            <p className="text-foreground/40 mb-6">
              Try adjusting your search or create a new guild
            </p>
            <Link href="/guilds/create">
              <GlassButton className="flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Create Guild
              </GlassButton>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {sortedGuilds.map((guild, index) => (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <GuildCard guild={guild} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function GuildCard({ guild }: { guild: Guild }) {
  const memberPercentage = (guild.total_members / guild.max_members) * 100

  return (
    <Link href={`/guilds/${guild.id}`}>
      <GlassCard className="p-6 hover:bg-foreground/5 transition-all cursor-pointer group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              {guild.icon || guild.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">
                {guild.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                {guild.is_public ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Nível {guild.level}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/70 mb-4 flex-1">
          {guild.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div>
            <div className="text-lg font-bold text-purple-400">{guild.total_members}</div>
            <div className="text-xs text-foreground/60">Members</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">{guild.total_battles_won}</div>
            <div className="text-xs text-foreground/60">Battles</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{guild.total_quests_completed}</div>
            <div className="text-xs text-foreground/60">Quests</div>
          </div>
        </div>

        {/* Members Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span>Members</span>
            <span>{guild.total_members}/{guild.max_members}</span>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${memberPercentage}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {guild.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-foreground/10 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {guild.tags.length > 3 && (
            <span className="px-2 py-1 rounded-full bg-foreground/10 text-xs font-medium">
              +{guild.tags.length - 3}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  )
}
