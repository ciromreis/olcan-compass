import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

/**
 * Transition screen shown while computing the psych profile.
 * PRD: "Animated compass rotation, 1-2 seconds real calculation time."
 * Avoids abrupt scoring shock.
 */
export function TransitionScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12"
    >
      {/* Rotating compass */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-lumina-200 to-lumina-300 flex items-center justify-center shadow-glow mb-10"
      >
        <Compass className="w-12 h-12 text-white" />
      </motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-heading text-h3 text-white mb-3"
      >
        Analisando seu perfil…
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-body text-neutral-300"
      >
        Estamos calibrando sua jornada com base nas suas respostas.
      </motion.p>

      {/* Pulsing dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="w-2.5 h-2.5 rounded-full bg-lumina"
          />
        ))}
      </div>
    </motion.div>
  )
}
