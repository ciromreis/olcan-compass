"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Crown, 
  Shield, 
  Swords, 
  Plus, 
  Search, 
  MessageCircle, 
  Trophy,
  Star,
  Coins,
  AlertCircle,
  LogOut
} from 'lucide-react'
import { GlassCard, GlassButton, ProgressBar } from '@olcan/ui-components'
import { useGuildStore, getGuildFocusInfo, getGuildRoleInfo, getBattleTypeInfo } from '@/stores/guildStore'
import { useMarketplaceStore, formatPrice, canAfford } from '@/stores/canonicalMarketplaceEconomyStore'

export default function WorkingGuildsPage() {
  const {
    guilds,
    myGuild,
    myGuildRole,
    guildDetails,
    isLoading,
    error,
    fetchGuilds,
    createGuild,
    joinGuild,
    leaveGuild,
    fetchMyGuild,
    fetchGuildDetails,
    sendMessage,
    createBattle,
    clearError
  } = useGuildStore()

  const { economy, fetchEconomy } = useMarketplaceStore()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGuildDetails, setShowGuildDetails] = useState(false)
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFocus, setSelectedFocus] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showBattleForm, setShowBattleForm] = useState(false)

  const [newGuildData, setNewGuildData] = useState({
    name: '',
    description: '',
    emblem: '🏰',
    color: '#8b5cf6',
    focus_area: 'general',
    is_private: false
  })

  useEffect(() => {
    fetchGuilds()
    fetchMyGuild()
    fetchEconomy()
  }, [fetchGuilds, fetchMyGuild, fetchEconomy])

  useEffect(() => {
    if (selectedGuildId) {
      fetchGuildDetails(selectedGuildId)
    }
  }, [selectedGuildId, fetchGuildDetails])

  const handleCreateGuild = async () => {
    if (!newGuildData.name.trim()) return
    
    await createGuild(newGuildData)
    setShowCreateForm(false)
    setNewGuildData({
      name: '',
      description: '',
      emblem: '🏰',
      color: '#8b5cf6',
      focus_area: 'general',
      is_private: false
    })
  }

  const handleJoinGuild = async (guildId: number) => {
    await joinGuild(guildId)
  }

  const handleLeaveGuild = async () => {
    if (myGuild) {
      await leaveGuild(myGuild.id)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !myGuild) return
    
    await sendMessage(myGuild.id, newMessage)
    setNewMessage('')
  }

  const handleCreateBattle = async (battleData: any) => {
    if (!myGuild) return
    
    await createBattle(myGuild.id, battleData)
    setShowBattleForm(false)
  }

  const filteredGuilds = guilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFocus = !selectedFocus || guild.focusArea === selectedFocus
    return matchesSearch && matchesFocus
  })

  if (isLoading && guilds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-companion-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">Loading guilds...</p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Guilds & Community
          </h1>
          <p className="text-foreground/60">
            Join forces with other career adventurers
          </p>
        </motion.div>

        {/* My Guild Section */}
        {myGuild && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{myGuild.emblem}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{myGuild.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground/60">{getGuildFocusInfo(myGuild.focusArea).name}</span>
                      <span className="text-sm text-foreground/60">•</span>
                      <span className="text-sm text-foreground/60">Level {myGuild.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-foreground/60">Your Role</div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{getGuildRoleInfo(myGuildRole || 'member').icon}</span>
                      <span className="font-medium">{getGuildRoleInfo(myGuildRole || 'member').name}</span>
                    </div>
                  </div>
                  <GlassButton
                    onClick={() => setShowGuildDetails(true)}
                    variant="default"
                    size="sm"
                  >
                    View Details
                  </GlassButton>
                  {myGuildRole !== 'leader' && (
                    <GlassButton
                      onClick={handleLeaveGuild}
                      variant="outline"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4" />
                    </GlassButton>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-companion-primary">{myGuild.memberCount}</div>
                  <div className="text-sm text-foreground/60">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-companion-primary">{myGuild.experiencePoints}</div>
                  <div className="text-sm text-foreground/60">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-companion-primary">{myGuild.battlesWon}</div>
                  <div className="text-sm text-foreground/60">Battles Won</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-companion-primary">{myGuild.battlesLost}</div>
                  <div className="text-sm text-foreground/60">Battles Lost</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Guild List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {myGuild ? 'Other Guilds' : 'Available Guilds'}
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search guilds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  />
                </div>
                {!myGuild && (
                  <GlassButton
                    onClick={() => setShowCreateForm(true)}
                    variant="primary"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Guild
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedFocus('')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  !selectedFocus
                    ? 'bg-companion-primary text-white'
                    : 'liquid-glass border border-white/20'
                }`}
              >
                All
              </button>
              {['general', 'technology', 'business', 'creative', 'healthcare', 'education'].map(focus => (
                <button
                  key={focus}
                  onClick={() => setSelectedFocus(focus)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedFocus === focus
                      ? 'bg-companion-primary text-white'
                      : 'liquid-glass border border-white/20'
                  }`}
                >
                  {getGuildFocusInfo(focus).icon} {getGuildFocusInfo(focus).name}
                </button>
              ))}
            </div>

            {/* Guild Cards */}
            <div className="space-y-4">
              {filteredGuilds.map((guild) => (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{guild.emblem}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{guild.name}</h3>
                          <p className="text-sm text-foreground/60 mb-2">{guild.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {guild.memberCount} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              Level {guild.level}
                            </span>
                            <span className="flex items-center gap-1">
                              {getGuildFocusInfo(guild.focusArea).icon}
                              {getGuildFocusInfo(guild.focusArea).name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!myGuild || myGuild.id !== guild.id ? (
                          <GlassButton
                            onClick={() => handleJoinGuild(guild.id)}
                            variant="primary"
                            size="sm"
                          >
                            Join Guild
                          </GlassButton>
                        ) : (
                          <div className="text-sm text-companion-primary font-medium">
                            Your Guild
                          </div>
                        )}
                        <GlassButton
                          onClick={() => {
                            setSelectedGuildId(guild.id)
                            setShowGuildDetails(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Economy Panel */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Economy</h3>
              {economy ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Coins</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-500">{economy.coins}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Gems</span>
                    </div>
                    <span className="text-xl font-bold text-purple-500">{economy.gems}</span>
                  </div>
                  {economy.premiumExpiresAt && (
                    <div className="text-sm text-foreground/60">
                      Premium until {new Date(economy.premiumExpiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-foreground/60">
                  Loading economy...
                </div>
              )}
            </GlassCard>

            {/* Quick Stats */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Guild Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">Total Guilds</span>
                  <span className="font-medium">{guilds.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">Your Status</span>
                  <span className="font-medium">
                    {myGuild ? `Member of ${myGuild.name}` : 'Not in a guild'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">Active Members</span>
                  <span className="font-medium">
                    {guilds.reduce((sum, guild) => sum + guild.memberCount, 0)}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Create Guild Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Create Guild</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Guild Name
                </label>
                <input
                  type="text"
                  value={newGuildData.name}
                  onChange={(e) => setNewGuildData({...newGuildData, name: e.target.value})}
                  placeholder="Enter guild name"
                  className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newGuildData.description}
                  onChange={(e) => setNewGuildData({...newGuildData, description: e.target.value})}
                  placeholder="Describe your guild"
                  className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Focus Area
                </label>
                <select
                  value={newGuildData.focus_area}
                  onChange={(e) => setNewGuildData({...newGuildData, focus_area: e.target.value})}
                  className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="creative">Creative</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
              </div>
              <div className="flex gap-3">
                <GlassButton
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                  variant="outline"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  onClick={handleCreateGuild}
                  className="flex-1"
                  variant="primary"
                  disabled={!newGuildData.name.trim()}
                >
                  Create Guild
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Guild Details Modal */}
      {showGuildDetails && guildDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{guildDetails.guild.emblem}</div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{guildDetails.guild.name}</h3>
                  <p className="text-foreground/60">{guildDetails.guild.description}</p>
                </div>
              </div>
              <GlassButton
                onClick={() => setShowGuildDetails(false)}
                variant="outline"
                size="sm"
              >
                Close
              </GlassButton>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Members */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Members</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {guildDetails.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 liquid-glass rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-companion-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.firstName[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{member.username}</div>
                          <div className="text-sm text-foreground/60">{member.firstName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getGuildRoleInfo(member.role).icon}</span>
                        <span className="text-sm text-foreground/60">{getGuildRoleInfo(member.role).name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Guild Chat</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                  {guildDetails.messages.map((message: any) => (
                    <div key={message.id} className="p-3 liquid-glass rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{message.user.username}</span>
                        <span className="text-xs text-foreground/60">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">{message.content}</p>
                    </div>
                  ))}
                </div>
                {myGuild && myGuild.id === guildDetails.guild.id && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 liquid-glass rounded-lg border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <GlassButton
                      onClick={handleSendMessage}
                      variant="primary"
                      size="sm"
                    >
                      Send
                    </GlassButton>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
