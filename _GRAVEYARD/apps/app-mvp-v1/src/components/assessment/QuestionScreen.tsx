import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import type { PsychQuestion } from '../../store/onboarding'

/**
 * Block-level micro-copy shown above the question to set context.
 * PRD: "Micro-copy reinforcing normalcy"
 */
const BLOCK_MICROCOPY: Record<string, string> = {
  cultural_adaptability: 'Vamos começar entendendo seu momento…',
  confidence: 'Agora sobre sua autoconfiança…',
  risk_tolerance: 'Como você lida com risco…',
  discipline: 'Sobre consistência e disciplina…',
  decision_style: 'Como você toma decisões…',
  interview_anxiety: 'Sobre entrevistas e exposição…',
  narrative_clarity: 'Sobre clareza de objetivos…',
  financial_resilience: 'Por último, sobre finanças…',
  anxiety: 'Quase terminando…',
}

interface QuestionScreenProps {
  question: PsychQuestion
  currentIndex: number
  totalQuestions: number
  existingAnswer?: string
  isFirst: boolean
  isSubmitting: boolean
  onAnswer: (value: string) => void
  onBack: () => void
}

/**
 * Single-question screen with animated transitions.
 * PRD: one question per screen, large tap areas, soft transitions.
 */
export function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  existingAnswer,
  isFirst,
  isSubmitting,
  onAnswer,
  onBack,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | null>(existingAnswer ?? null)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back

  // Reset selection when question changes
  useEffect(() => {
    setSelected(existingAnswer ?? null)
  }, [question.id, existingAnswer])

  const progress = ((currentIndex) / totalQuestions) * 100
  const microcopy = BLOCK_MICROCOPY[question.category] || ''

  function handleSelect(value: string) {
    setSelected(value)
    // Auto-advance after a short delay for better UX feel
    setDirection(1)
    setTimeout(() => {
      onAnswer(value)
    }, 300)
  }

  function handleBack() {
    setDirection(-1)
    onBack()
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  const isScale = question.question_type === 'scale'
  const isMultipleChoice = question.question_type === 'multiple_choice'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full max-w-lg mx-auto"
    >
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption text-neutral-400">
            {currentIndex + 1} de {totalQuestions}
          </span>
          <span className="text-caption text-neutral-400 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} size="sm" color="lumina" />
      </div>

      {/* Question content with slide animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1"
        >
          {/* Block micro-copy */}
          {microcopy && (
            <p className="text-body-sm text-lumina mb-3">
              {microcopy}
            </p>
          )}

          {/* Question text */}
          <h2 className="font-heading text-h3 text-white mb-8 leading-snug">
            {question.text_pt}
          </h2>

          {/* Options */}
          {isScale && (
            <ScaleOptions
              options={question.options}
              selected={selected}
              onSelect={handleSelect}
              disabled={isSubmitting}
            />
          )}

          {isMultipleChoice && (
            <MultipleChoiceOptions
              options={question.options}
              selected={selected}
              onSelect={handleSelect}
              disabled={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        {!isFirst ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        ) : (
          <div />
        )}

        <p className="text-caption text-neutral-500">
          Não existem respostas certas
        </p>
      </div>
    </motion.div>
  )
}


/**
 * Likert 1-5 scale rendered as large tappable segmented buttons.
 */
function ScaleOptions({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: PsychQuestion['options']
  selected: string | null
  onSelect: (value: string) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const isSelected = selected === opt.value
        return (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-4 px-5 py-4 rounded-xl',
              'border transition-all duration-fast',
              'text-left group',
              'focus-visible:ring-2 focus-visible:ring-lumina focus-visible:ring-offset-2 focus-visible:ring-offset-void',
              isSelected
                ? 'bg-lumina/10 border-lumina/50 text-white'
                : 'bg-neutral-700/40 border-neutral-600/40 text-neutral-200 hover:bg-neutral-700/60 hover:border-neutral-500/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Number indicator */}
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-semibold flex-shrink-0 transition-colors',
                isSelected
                  ? 'bg-lumina text-white'
                  : 'bg-neutral-600/60 text-neutral-300 group-hover:bg-neutral-500/60'
              )}
            >
              {isSelected ? <Check className="w-4 h-4" /> : opt.value}
            </span>
            {/* Label text */}
            <span className="text-body font-medium">
              {opt.label_pt}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}


/**
 * Multiple choice rendered as card-style selection.
 */
function MultipleChoiceOptions({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: PsychQuestion['options']
  selected: string | null
  onSelect: (value: string) => void
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((opt, i) => {
        const isSelected = selected === opt.value
        return (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={cn(
              'w-full px-5 py-4 rounded-xl',
              'border transition-all duration-fast',
              'text-left',
              'focus-visible:ring-2 focus-visible:ring-lumina focus-visible:ring-offset-2 focus-visible:ring-offset-void',
              isSelected
                ? 'bg-lumina/10 border-lumina/50 shadow-glow-sm'
                : 'bg-neutral-700/40 border-neutral-600/40 hover:bg-neutral-700/60 hover:border-neutral-500/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'border-lumina bg-lumina'
                    : 'border-neutral-500'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span
                className={cn(
                  'text-body font-medium',
                  isSelected ? 'text-white' : 'text-neutral-200'
                )}
              >
                {opt.label_pt}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
