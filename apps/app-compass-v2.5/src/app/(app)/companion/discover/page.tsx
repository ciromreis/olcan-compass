/**
 * Companion Discovery/Onboarding - Olcan Compass v2.5
 * First-time companion creation flow
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuraStore } from '@/stores/auraStore'
import { useRouter } from 'next/navigation'
import { getAllArchetypes, type ArchetypeId } from '@/lib/archetypes'

const ARCHETYPES = getAllArchetypes().map((a) => ({
  id: a.id,
  label: a.name,
  description: a.context,
  gradient: a.colors.gradient,
}))

export default function CompanionDiscoverPage() {
  const router = useRouter()
  const { createAura, isLoading } = useAuraStore()
  
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [selectedArchetype, setSelectedArchetype] = useState<typeof ARCHETYPES[number] | null>(null)

  const handleCreate = async () => {
    if (!name || !selectedArchetype) return

    try {
      await createAura(name, selectedArchetype.id as ArchetypeId)
      router.push('/companion')
    } catch (error) {
      console.error('Erro ao criar companion:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20">
                  <Heart className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-brand-600">Bem-vindo ao Olcan Compass</span>
                </div>
                <h1 className="font-heading text-5xl md:text-6xl text-text-primary">
                  Conheça seu Companion
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Seu companion é um parceiro de jornada que evolui com você, celebra suas conquistas e te apoia nos desafios da mobilidade internacional.
                </p>
              </div>

              <GlassCard className="card-surface p-8 md:p-12 rounded-3xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Como você quer chamar seu companion?
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite um nome..."
                      className="w-full px-6 py-4 rounded-2xl border border-cream-300 bg-white text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      maxLength={20}
                    />
                  </div>

                  <div className="flex justify-end">
                    <GlassButton
                      onClick={() => setStep(2)}
                      disabled={!name.trim()}
                      className="px-8 py-4 rounded-2xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Próximo
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
                  Escolha seu Arquétipo
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Cada arquétipo representa uma motivação diferente para sua jornada internacional. Escolha aquele que mais ressoa com você.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ARCHETYPES.map((archetype) => (
                  <button
                    key={archetype.id}
                    onClick={() => setSelectedArchetype(archetype)}
                    className={cn(
                      'group relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-500',
                      selectedArchetype?.id === archetype.id 
                        ? 'border-2 border-brand-500 bg-brand-50' 
                        : 'border border-cream-300 bg-white'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br
                        ${archetype.gradient}
                      `}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-1">{archetype.label}</h3>
                        <p className="text-sm text-text-secondary line-clamp-2">{archetype.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <GlassButton
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-2xl border border-cream-300 bg-white hover:bg-cream-50 transition-all"
                >
                  Voltar
                </GlassButton>
                <GlassButton
                  onClick={handleCreate}
                  disabled={!selectedArchetype || isLoading}
                  className="px-8 py-4 rounded-2xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar Companion
                      <Heart className="w-5 h-5 ml-2" />
                    </>
                  )}
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
