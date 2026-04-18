/**
 * Guild Detail Page
 *
 * Shows guild info, members, events, and join/leave controls.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { motion } from 'framer-motion'
import {
  Users,
  Globe,
  Lock,
  ArrowLeft,
  Calendar,
  Trophy,
  Zap,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Settings,
} from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import Link from 'next/link'

interface Guild {
  id: string
  name: string
  description?: string
  is_public: boolean
  max_members: number
  total_members: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface GuildMember {
  id: string
  user_id: string
  guild_id: string
  role: string
  joined_at: string
  contribution_score: number
}

interface GuildEvent {
  id: string
  guild_id: string
  title: string
  description?: string
  event_type: string
  scheduled_at?: string
  created_at: string
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  leader: Crown,
  officer: Shield,
  member: Users,
}

const ROLE_LABELS: Record<string, string> = {
  leader: 'Líder',
  officer: 'Oficial',
  member: 'Membro',
}

export default function GuildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const guildId = params.id as string

  const [guild, setGuild] = useState<Guild | null>(null)
  const [members, setMembers] = useState<GuildMember[]>([])
  const [events, setEvents] = useState<GuildEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events'>('overview')

  const fetchGuild = useCallback(async () => {
    setIsLoading(true)
    try {
      const [guildData, membersData, eventsData, myGuilds] = await Promise.all([
        apiClient.getGuild(guildId) as Promise<Guild>,
        apiClient.getGuildMembers(guildId) as Promise<GuildMember[]>,
        apiClient.getGuildEvents(guildId) as Promise<GuildEvent[]>,
        apiClient.getMyGuilds() as Promise<Guild[]>,
      ])
      setGuild(guildData)
      setMembers(membersData || [])
      setEvents(eventsData || [])
      setIsMember((myGuilds || []).some((g) => g.id === guildId))
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to fetch guild:', err)
    } finally {
      setIsLoading(false)
    }
  }, [guildId])

  useEffect(() => {
    void fetchGuild()
  }, [fetchGuild])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await apiClient.joinGuild(guildId)
      setIsMember(true)
      await fetchGuild()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to join guild:', err)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    setIsJoining(true)
    try {
      await apiClient.leaveGuild(guildId)
      setIsMember(false)
      router.push('/guilds')
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to leave guild:', err)
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 flex items-center justify-center">
        <div className="animate-pulse text-foreground/40">Carregando guilda...</div>
      </div>
    )
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Guilda não encontrada</h2>
          <Link href="/guilds">
            <GlassButton>Voltar para Guildas</GlassButton>
          </Link>
        </div>
      </div>
    )
  }

  const memberPercentage = Math.min(100, (guild.total_members / guild.max_members) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 p-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/guilds" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Todas as Guildas
        </Link>

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {guild.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{guild.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-foreground/60 mb-3">
                      {guild.is_public ? (
                        <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Pública</span>
                      ) : (
                        <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Privada</span>
                      )}
                      <span>{guild.total_members}/{guild.max_members} membros</span>
                    </div>
                    {guild.description && (
                      <p className="text-foreground/70 text-sm mb-3">{guild.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {guild.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-foreground/10 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Join / Leave */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isMember ? (
                      <GlassButton
                        onClick={handleLeave}
                        disabled={isJoining}
                        className="flex items-center gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        <UserMinus className="w-4 h-4" />
                        {isJoining ? 'Saindo...' : 'Sair da Guilda'}
                      </GlassButton>
                    ) : (
                      <GlassButton
                        onClick={handleJoin}
                        disabled={isJoining || guild.total_members >= guild.max_members}
                        className="flex items-center gap-2 bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
                      >
                        <UserPlus className="w-4 h-4" />
                        {isJoining ? 'Entrando...' : 'Entrar na Guilda'}
                      </GlassButton>
                    )}
                  </div>
                </div>

                {/* Members progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-foreground/60 mb-1">
                    <span>Membros</span>
                    <span>{guild.total_members}/{guild.max_members}</span>
                  </div>
                  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${memberPercentage}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-foreground/5 p-1 rounded-xl w-fit">
          {(['overview', 'members', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white shadow text-foreground'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {tab === 'overview' ? 'Visão Geral' : tab === 'members' ? `Membros (${members.length})` : `Eventos (${events.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-4">
            <GlassCard className="p-5 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-3xl font-bold">{guild.total_members}</div>
              <div className="text-sm text-foreground/60">Membros Ativos</div>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-3xl font-bold">{events.length}</div>
              <div className="text-sm text-foreground/60">Eventos</div>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <div className="text-3xl font-bold">
                {members.reduce((sum, m) => sum + m.contribution_score, 0)}
              </div>
              <div className="text-sm text-foreground/60">Pontos Totais</div>
            </GlassCard>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="divide-y divide-foreground/10">
              {members.length === 0 ? (
                <div className="p-12 text-center text-foreground/40">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum membro ainda</p>
                </div>
              ) : (
                members.map((member, index) => {
                  const RoleIcon = ROLE_ICONS[member.role] ?? Users
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                        {member.role.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.user_id.slice(0, 8)}...</div>
                        <div className="flex items-center gap-1 text-xs text-foreground/60">
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_LABELS[member.role] ?? member.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-semibold text-purple-400">
                          <Zap className="w-3.5 h-3.5" />
                          {member.contribution_score}
                        </div>
                        <div className="text-xs text-foreground/40">pontos</div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {events.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-foreground/20" />
                <h3 className="text-lg font-semibold text-foreground/60 mb-1">Sem eventos agendados</h3>
                <p className="text-foreground/40 text-sm">Eventos da guilda aparecerão aqui</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-foreground/70 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-foreground/50">
                            <span className="px-2 py-0.5 rounded-full bg-foreground/10">{event.event_type}</span>
                            {event.scheduled_at && (
                              <span>{new Date(event.scheduled_at).toLocaleDateString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
