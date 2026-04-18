/**
 * Aura Discovery / Onboarding - Olcan Compass v2.5
 * Personality quiz flow that determines the companion archetype.
 * No internal names are shown to the user.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuraStore, type Aura } from '@/stores/auraStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ArchetypeId } from '@/lib/archetypes'
import { ProceduralAuraFigure } from '@/components/aura/ProceduralAuraFigure'
import { generatePresenceFigure } from '@/lib/aura-presence'
import { EvolutionRitualOverlay } from '@/components/aura/EvolutionRitualOverlay'

interface PersonalityQuestion {
  id: string
  question: string
  options: { label: string; value: string; scores: Partial<Record<ArchetypeId, number>> }[]
}

const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  // Onboarding Questions
  {
    id: 'motivation',
    question: 'O que mais motiva você a buscar a mobilidade internacional?',
    options: [
      { label: 'Liberdade e independência — quero viver nos meus termos', value: 'freedom', scores: { institutional_escapee: 3, global_nomad: 2 } },
      { label: 'Crescimento profissional — quero evoluir na carreira', value: 'growth', scores: { career_pivot: 3, technical_bridge_builder: 2 } },
      { label: 'Segurança e qualidade de vida para minha família', value: 'security', scores: { exhausted_solo_mother: 3, trapped_public_servant: 2 } },
      { label: 'Oportunidades acadêmicas e intelectuais', value: 'knowledge', scores: { scholarship_cartographer: 3, academic_hermit: 2 } },
    ],
  },
  {
    id: 'fear',
    question: 'Qual é o maior medo que você sente em relação a essa mudança?',
    options: [
      { label: 'Não ser bom o suficiente ou falhar no processo', value: 'competence', scores: { insecure_corporate_dev: 3, career_pivot: 1 } },
      { label: 'Perder o que já conquistei (estabilidade, patrimônio)', value: 'loss', scores: { trapped_public_servant: 2, executive_refugee: 2 } },
      { label: 'Não conseguir se adaptar à nova cultura', value: 'rejection', scores: { technical_bridge_builder: 2, academic_hermit: 1 } },
      { label: 'Tomar uma decisão irreversível e me arrepender', value: 'irreversibility', scores: { global_nomad: 2, exhausted_solo_mother: 1 } },
    ],
  },
  {
    id: 'style',
    question: 'Como você descreveria seu estilo de trabalho e vida?',
    options: [
      { label: 'Estratégico e independente — prefiro planejar sozinho', value: 'strategic', scores: { institutional_escapee: 2, executive_refugee: 2 } },
      { label: 'Técnico e focado — me aprofundo em habilidades específicas', value: 'technical', scores: { technical_bridge_builder: 3, insecure_corporate_dev: 1 } },
      { label: 'Criativo e adaptável — gosto de explorar possibilidades', value: 'creative', scores: { creative_visionary: 3, global_nomad: 1 } },
      { label: 'Organizado e protetor — cuido do que importa', value: 'protective', scores: { exhausted_solo_mother: 2, trapped_public_servant: 1 } },
    ],
  },
  {
    id: 'situation',
    question: 'Qual frase melhor descreve sua situação atual?',
    options: [
      { label: 'Tenho carreira estável, mas sinto que posso mais', value: 'stable', scores: { executive_refugee: 2, trapped_public_servant: 2 } },
      { label: 'Estou em transição de carreira ou área', value: 'transition', scores: { career_pivot: 3, lifestyle_optimizer: 1 } },
      { label: 'Trabalho com tecnologia e quero oportunidades globais', value: 'tech', scores: { technical_bridge_builder: 2, insecure_corporate_dev: 2 } },
      { label: 'Busco bolsas, pesquisa ou oportunidades acadêmicas', value: 'academic', scores: { scholarship_cartographer: 3, academic_hermit: 2 } },
    ],
  },
  {
    id: 'companion',
    question: 'Que tipo de companhia você gostaria de ter nessa jornada?',
    options: [
      { label: 'Um estrategista — me ajude a planejar cada passo', value: 'strategist', scores: { institutional_escapee: 1, executive_refugee: 1, scholarship_cartographer: 1 } },
      { label: 'Um mentor técnico — me ajude a desenvolver habilidades', value: 'mentor', scores: { technical_bridge_builder: 1, insecure_corporate_dev: 1, career_pivot: 1 } },
      { label: 'Um guardião — me dê segurança e confiança', value: 'guardian', scores: { exhausted_solo_mother: 1, trapped_public_servant: 1 } },
      { label: 'Um explorador — me inspire a descobrir o novo', value: 'explorer', scores: { global_nomad: 1, creative_visionary: 1, lifestyle_optimizer: 1 } },
    ],
  },
]

const RITUAL_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'ritual_path',
    question: 'Onde você sente maior tração na sua jornada ultimamente?',
    options: [
      { label: 'Densidade documental e provas de valor', value: 'technical', scores: {} },
      { label: 'Conexões estratégicas e rede de apoio', value: 'social', scores: {} },
      { label: 'Planejamento e visão de longo prazo', value: 'strategic', scores: {} },
      { label: 'Adaptação cultural e fluência de vida', value: 'lifestyle', scores: {} },
    ],
  },
  {
    id: 'ritual_focus',
    question: 'Para expandir sua Presença, o que você escolhe priorizar?',
    options: [
      { label: 'Excelência técnica e domínio de área', value: 'power', scores: {} },
      { label: 'Segurança familiar e estabilidade', value: 'protection', scores: {} },
      { label: 'Flexibilidade e liberdade de movimento', value: 'freedom', scores: {} },
      { label: 'Impacto intelectual e legado', value: 'wisdom', scores: {} },
    ],
  },
  {
    id: 'ritual_essence',
    question: 'Qual destas essências ressoa com seu estágio atual?',
    options: [
      { label: 'Denso — foco em organização e rigor', value: 'earth', scores: {} },
      { label: 'Fluido — foco em abertura e descoberta', value: 'water', scores: {} },
      { label: 'Vibrante — foco em ação e visibilidade', value: 'fire', scores: {} },
      { label: 'Sereno — foco em harmonia e direção', value: 'air', scores: {} },
    ],
  },
]

function computeArchetype(answers: Record<string, string>): ArchetypeId {
  const scores: Partial<Record<ArchetypeId, number>> = {}

  for (const q of PERSONALITY_QUESTIONS) {
    const chosen = q.options.find((o) => o.value === answers[q.id])
    if (!chosen) continue
    for (const [arch, pts] of Object.entries(chosen.scores)) {
      scores[arch as ArchetypeId] = (scores[arch as ArchetypeId] || 0) + (pts as number)
    }
  }

  let best: ArchetypeId = 'career_pivot'
  let bestScore = 0
  for (const [arch, pts] of Object.entries(scores)) {
    if ((pts as number) > bestScore) {
      bestScore = pts as number
      best = arch as ArchetypeId
    }
  }
  return best
}

const ARCHETYPE_FRIENDLY_NAMES: Record<ArchetypeId, { name: string; creature: string; description: string }> = {
  institutional_escapee: { name: 'Raposa Estratégica', creature: '🦊', description: 'Mestre do planejamento e independência. Você navega o sistema com inteligência.' },
  scholarship_cartographer: { name: 'Dragão Acadêmico', creature: '🐉', description: 'Pioneiro da excelência. Você transforma conhecimento em oportunidades.' },
  career_pivot: { name: 'Leão Transformador', creature: '🦁', description: 'Artista da reinvenção. Você domina transições com coragem.' },
  global_nomad: { name: 'Fênix Global', creature: '🔥', description: 'Especialista em adaptação. O mundo é sua casa e seu escritório.' },
  technical_bridge_builder: { name: 'Lobo Técnico', creature: '🐺', description: 'Construtor de pontes. Sua expertise conecta mundos.' },
  insecure_corporate_dev: { name: 'Coruja Sábia', creature: '🦉', description: 'Buscador de confiança. Seu talento é maior do que imagina.' },
  exhausted_solo_mother: { name: 'Ursa Protetora', creature: '🐻', description: 'Guardiã do futuro. Sua força protege quem você ama.' },
  trapped_public_servant: { name: 'Águia Visionária', creature: '🦅', description: 'Agente de mudança. Você busca impacto real no mundo.' },
  academic_hermit: { name: 'Cervo Intelectual', creature: '🦌', description: 'Buscador de sabedoria. Você mergulha fundo no conhecimento.' },
  executive_refugee: { name: 'Tigre Consciente', creature: '🐅', description: 'Mestre do equilíbrio. Você busca qualidade com propósito.' },
  creative_visionary: { name: 'Borboleta Criativa', creature: '🦋', description: 'Visionário criativo. Você transforma ideias em realidade.' },
  lifestyle_optimizer: { name: 'Golfinho Otimizador', creature: '🐬', description: 'Especialista em bem-estar. Você busca a melhor versão da vida.' },
}

export default function AuraDiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'onboarding'
  const isEvolution = mode === 'evolution'

  const { aura, createAura, triggerEvolution, isLoading } = useAuraStore()

  const [step, setStep] = useState(isEvolution ? 1 : 0) // Skip name for evolution
  const [name, setName] = useState(aura?.name || '')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [resultArchetype, setResultArchetype] = useState<ArchetypeId | null>(aura?.archetype || null)
  const [showEvolutionOverlay, setShowEvolutionOverlay] = useState(false)
  const [newEvolvedAura, setNewEvolvedAura] = useState<Aura | null>(null)

  const activeQuestions = isEvolution ? RITUAL_QUESTIONS : PERSONALITY_QUESTIONS
  const totalSteps = activeQuestions.length + (isEvolution ? 1 : 2) // result step
  const currentQuestion = step >= 1 && step <= activeQuestions.length ? activeQuestions[step - 1] : null

  const handleAnswer = (questionId: string, value: string) => {
    const updated = { ...answers, [questionId]: value }
    setAnswers(updated)

    if (step < activeQuestions.length) {
      setStep(step + 1)
    } else {
      if (!isEvolution) {
        const archetype = computeArchetype(updated)
        setResultArchetype(archetype)
      }
      setStep(activeQuestions.length + 1)
    }
  }

  const handleAction = async () => {
    if (isEvolution) {
      if (!aura) return
      try {
        // Trigger evolution with ritual answers as affinity payload
        await triggerEvolution(answers)
        setNewEvolvedAura(useAuraStore.getState().aura)
        setShowEvolutionOverlay(true)
      } catch (error) {
        console.error('Erro no ritual de manifestação:', error)
      }
    } else {
      if (!name || !resultArchetype) return
      try {
        await createAura(name, resultArchetype)
        router.push('/aura')
      } catch (error) {
        console.error('Erro ao criar a presença:', error)
      }
    }
  }

  const friendlyResult = resultArchetype ? ARCHETYPE_FRIENDLY_NAMES[resultArchetype] : null

  const previewSpec = (resultArchetype && name) ? generatePresenceFigure({
    id: 'preview',
    name: name,
    archetype: resultArchetype,
    level: 1,
    experiencePoints: 0,
    xpToNextLevel: 100,
    evolutionStage: 'seed',
    happiness: 0.8,
    energy: 100,
    maxEnergy: 100,
    createdAt: new Date().toISOString(),
    lastInteractionAt: new Date().toISOString(),
    stats: { power: 10, agility: 10, wisdom: 10, charisma: 10 }
  } as unknown as Aura) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <EvolutionRitualOverlay
        isVisible={showEvolutionOverlay}
        auraName={name}
        oldStage={aura?.evolutionStage || ''}
        newStage={newEvolvedAura?.evolutionStage || ''}
        oldSpec={aura ? generatePresenceFigure(aura) : null}
        newSpec={newEvolvedAura ? generatePresenceFigure(newEvolvedAura) : null}
        onComplete={() => router.push('/aura')}
      />

      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {step === 0 ? 'Início' : step <= activeQuestions.length ? `Passo ${step} de ${activeQuestions.length}` : 'Resultado'}
            </span>
            <span className="text-xs font-semibold text-slate-400">{Math.round((step / (totalSteps - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Name */}
          {step === 0 && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20">
                  <Heart className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-semibold text-brand-600">Criar sua Presença</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Dê um nome ao seu companheiro
                </h1>
                <p className="text-base text-slate-500 max-w-lg mx-auto">
                  Sua presença acompanha a jornada, reage ao seu contexto e te ajuda a tomar melhores decisões.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome do companheiro
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Luna, Atlas, Kai..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
                  maxLength={20}
                  autoFocus
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  disabled={!name.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Steps 1-5: Questions */}
          {currentQuestion && (
            <motion.div
              key={`step-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                     {isEvolution ? 'Ritual de Manifestação' : 'Mapeamento de Essência'}
                   </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  {currentQuestion.question}
                </h2>
                <p className="text-sm text-slate-400">Sua escolha recombinará os vetores da Aura</p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className={cn(
                      'w-full text-left p-5 rounded-2xl border transition-all duration-200',
                      answers[currentQuestion.id] === option.value
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <p className="text-base font-medium text-slate-800">{option.label}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={isEvolution && step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              </div>
            </motion.div>
          )}

          {/* Final step: Result */}
          {step === PERSONALITY_QUESTIONS.length + 1 && friendlyResult && (
            <motion.div
              key="step-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center flex flex-col items-center"
            >
              {previewSpec ? (
                <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.14),_rgba(255,255,255,0.78))] border border-white/50 shadow-glass-sm mt-4">
                  <ProceduralAuraFigure spec={previewSpec} size={150} active />
                </div>
              ) : (
                <div className="text-7xl">{friendlyResult.creature}</div>
              )}
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-6">
                {friendlyResult.name}
              </h2>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                {friendlyResult.description}
              </p>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm inline-block">
                <p className="text-sm text-slate-500">Presença identificada:</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{name}</p>
                <p className="text-sm text-brand-600 font-semibold mt-1">
                  {isEvolution ? `Pronta para ${aura?.evolutionStage} → ?` : friendlyResult.name}
                </p>
              </div>

              <div className="text-sm text-slate-400 max-w-sm mt-2 italic px-8">
                {isEvolution 
                  ? "O ritual está pronto. Ao ativar, as novas partes se recombinarão para refletir seu amadurecimento na jornada." 
                  : "Este será o seu núcleo imutável. As variações futuras dependerão das suas rotas e conquistas."}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => { setStep(1); setAnswers({}); setResultArchetype(null); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Refazer teste
                </button>
                <button
                  onClick={handleAction}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Manifestando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isEvolution ? 'Consolidar Ritual' : 'Ativar presença'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
