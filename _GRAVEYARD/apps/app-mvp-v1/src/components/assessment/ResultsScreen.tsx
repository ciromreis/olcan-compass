import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Shield, Target } from 'lucide-react'
import { CircularProgress } from '../ui/Progress'
import { Button } from '../ui/Button'
import type { PsychProfile } from '../../store/onboarding'

/**
 * Positive-framing labels for psychological states.
 * PRD: "Avoid labels like 'Low Confidence'. Frame as growth."
 */
const STATE_LABELS: Record<string, { label: string; description: string; icon: typeof Sparkles }> = {
  uncertain: {
    label: 'Explorador',
    description: 'Você está aberto a possibilidades — o Compass vai ajudar a transformar curiosidade em direção.',
    icon: Sparkles,
  },
  structuring: {
    label: 'Estruturador',
    description: 'Você busca clareza antes de agir — vamos construir uma base sólida juntos.',
    icon: Target,
  },
  building_confidence: {
    label: 'Em Ascensão',
    description: 'Sua confiança está crescendo — cada passo consolida sua preparação.',
    icon: TrendingUp,
  },
  executing: {
    label: 'Executor',
    description: 'Você tem disciplina e foco — hora de transformar planos em ação.',
    icon: Shield,
  },
  resilient: {
    label: 'Resiliente',
    description: 'Você tem maturidade emocional para lidar com os desafios da mobilidade internacional.',
    icon: Shield,
  },
}

/**
 * Positive labels for score dimensions.
 * Never show "low" — instead frame the growth direction.
 */
function getScoreInsight(label: string, value: number): string {
  if (value >= 70) return `Forte em ${label}`
  if (value >= 45) return `${label} em desenvolvimento`
  return `Espaço para crescer em ${label}`
}

interface ResultsScreenProps {
  profile: PsychProfile
  onContinue: () => void
}

/**
 * Results screen after assessment completion.
 * PRD: "Affirm strengths, normalize weaknesses, avoid labeling negatively."
 * Uses circular gauges, positive state badge, and growth-oriented insight.
 */
export function ResultsScreen({ profile, onContinue }: ResultsScreenProps) {
  const stateInfo = STATE_LABELS[profile.psychological_state] ?? STATE_LABELS.uncertain
  const StateIcon = stateInfo.icon

  // Score dimensions to display (using lumina/success/mirror colors — never red)
  const dimensions = [
    { label: 'Confiança', value: profile.confidence_index, color: 'lumina' as const },
    { label: 'Disciplina', value: profile.discipline_score, color: 'success' as const },
    { label: 'Clareza Narrativa', value: profile.narrative_maturity_score, color: 'mirror' as const },
    { label: 'Resiliência Financeira', value: profile.financial_resilience_score, color: 'warning' as const },
  ]

  // Find top strength (highest score) for personalized insight
  const topDimension = [...dimensions].sort((a, b) => b.value - a.value)[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-heading text-h2 text-white mb-2"
        >
          Seu Perfil Compass
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-body text-neutral-300"
        >
          Aqui está como suas respostas se conectam à sua jornada.
        </motion.p>
      </div>

      {/* Psychological State Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-neutral-700/50 backdrop-blur-md border border-neutral-600/40 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-lumina/10 flex items-center justify-center flex-shrink-0">
            <StateIcon className="w-6 h-6 text-lumina" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-caption text-lumina uppercase tracking-wider font-semibold">
                Seu perfil
              </span>
            </div>
            <h3 className="font-heading text-h3 text-white mb-1">
              {stateInfo.label}
            </h3>
            <p className="text-body text-neutral-300">
              {stateInfo.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Score Gauges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="bg-neutral-700/50 backdrop-blur-md border border-neutral-600/40 rounded-2xl p-6 mb-6"
      >
        <h3 className="font-heading text-body font-semibold text-white mb-5">
          Suas Dimensões
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {dimensions.map((dim, i) => (
            <motion.div
              key={dim.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <CircularProgress
                value={dim.value}
                size={80}
                color={dim.color}
                label={dim.label}
              />
              <p className="text-caption text-neutral-400 mt-2 text-center">
                {getScoreInsight(dim.label, dim.value)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Personalized Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="bg-neutral-700/50 backdrop-blur-md border border-lumina/20 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-lumina mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-heading text-body font-semibold text-white mb-2">
              Insight Personalizado
            </h3>
            <p className="text-body text-neutral-200 leading-relaxed">
              Seu ponto mais forte é <strong className="text-white">{topDimension.label.toLowerCase()}</strong>.
              {' '}O Compass vai usar isso como base para construir seu plano.
              {profile.anxiety_score > 60 && (
                <> É natural sentir incerteza — cada etapa será apresentada de forma gradual, no seu ritmo.</>
              )}
              {profile.discipline_score >= 60 && (
                <> Sua consistência é um diferencial competitivo real no mercado internacional.</>
              )}
              {profile.confidence_index < 50 && (
                <> A confiança se constrói com preparação estruturada — e é exatamente isso que vamos fazer juntos.</>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <Button size="lg" onClick={onContinue}>
          Criar Minha Rota
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-caption text-neutral-500">
          Você pode refazer o diagnóstico a qualquer momento
        </p>
      </motion.div>
    </motion.div>
  )
}
