/**
 * Create Guild Page
 * 
 * Form to create a new guild.
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Globe, Lock, Plus, X } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateGuildPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    max_members: 50,
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim().toLowerCase()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // TODO: Call API to create guild
      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const guild = await response.json()
        router.push(`/guilds/${guild.id}`)
      }
    } catch (error) {
      console.error('Failed to create guild:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 p-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/guilds">
            <button className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Guilds
            </button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">Create a Guild</h1>
          <p className="text-foreground/60">
            Build a community around shared goals and interests
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            <GlassCard className="p-8 space-y-6">
              
              {/* Guild Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Guild Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tech Career Accelerators"
                  required
                  minLength={3}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="text-xs text-foreground/40 mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your guild's purpose and what members can expect..."
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
                <p className="text-xs text-foreground/40 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_public: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.is_public
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-foreground/10 bg-foreground/5 hover:border-purple-300'
                    }`}
                  >
                    <Globe className={`w-6 h-6 mb-2 mx-auto ${
                      formData.is_public ? 'text-purple-500' : 'text-foreground/40'
                    }`} />
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-foreground/60 mt-1">
                      Anyone can join
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_public: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !formData.is_public
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-foreground/10 bg-foreground/5 hover:border-purple-300'
                    }`}
                  >
                    <Lock className={`w-6 h-6 mb-2 mx-auto ${
                      !formData.is_public ? 'text-purple-500' : 'text-foreground/40'
                    }`} />
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-foreground/60 mt-1">
                      Invite only
                    </div>
                  </button>
                </div>
              </div>

              {/* Max Members */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Members
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="w-16 text-center font-bold text-lg">
                    {formData.max_members}
                  </div>
                </div>
                <p className="text-xs text-foreground/40 mt-1">
                  You can adjust this later as your guild grows
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add tags (e.g., tech, career, networking)"
                    className="flex-1 px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-foreground/40 mt-2">
                  Tags help others discover your guild
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-400 mb-1">
                      Guild Leadership
                    </h4>
                    <p className="text-sm text-foreground/70">
                      As the founder, you'll be the guild leader with full permissions to manage members, 
                      create events, and customize settings. You can promote trusted members to officers later.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Link href="/guilds" className="flex-1">
                  <button
                    type="button"
                    className="w-full px-6 py-3 rounded-lg border border-foreground/20 text-foreground/60 hover:bg-foreground/5 transition-colors"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isCreating || !formData.name || !formData.description}
                  className="flex-1 px-6 py-3 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Guild'
                  )}
                </button>
              </div>
            </GlassCard>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
