import { motion } from 'framer-motion'
import { Compass, Clock, Shield, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'

interface IntroScreenProps {
  onBegin: () => void
  isLoading: boolean
  error?: string | null
}

/**
 * Assessment intro screen — sets the tone before the first question.
 * PRD: "Set tone + reduce fear."
 * Must convey safety, no wrong answers, and personalization value.
 */
export function IntroScreen({ onBegin, isLoading, error }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center max-w-lg mx-auto"
    >
      {/* Animated compass icon */}
      <motion.div
        initial={{ scale: 0.8, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-lumina-200 to-lumina-300 flex items-center justify-center shadow-glow mb-8"
      >
        <Compass className="w-10 h-10 text-white" />
      </motion.div>

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-heading text-h2 text-white mb-3"
      >
        Antes de construirmos seu caminho…
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="text-body-lg text-neutral-200 mb-2"
      >
        Vamos entender como você lida com incerteza, preparação e crescimento.
      </motion.p>

      {/* Reassurance */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-body text-neutral-300 mb-8"
      >
        Usamos isso para personalizar sua jornada. Não existem respostas certas.
      </motion.p>

      {/* Info pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700/50 border border-neutral-600/40">
          <Clock className="w-4 h-4 text-lumina" />
          <span className="text-body-sm text-neutral-200">4–6 minutos</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700/50 border border-neutral-600/40">
          <Shield className="w-4 h-4 text-lumina" />
          <span className="text-body-sm text-neutral-200">100% confidencial</span>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-body-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
      >
        <Button size="lg" onClick={onBegin} isLoading={isLoading}>
          Começar
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
