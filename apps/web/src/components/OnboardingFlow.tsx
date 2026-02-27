import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Progress } from './ui/Progress'
import { useOnboardingStore } from '@/store/onboarding'

interface OnboardingStep {
  title: string
  description: string
  content: React.ReactNode
}

/**
 * Onboarding flow component
 * Guides new users through initial setup
 */
export function OnboardingFlow() {
  const navigate = useNavigate()
  const { isOnboardingComplete, completeOnboarding } = useOnboardingStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(!isOnboardingComplete)

  const steps: OnboardingStep[] = [
    {
      title: 'Bem-vindo ao Compass',
      description: 'Sua plataforma de inteligência para mobilidade internacional',
      content: (
        <div className="space-y-4">
          <p className="text-body text-neutral-300">
            O Compass combina perfil psicológico, planejamento de rotas, construção de narrativas,
            preparação para entrevistas e gestão de candidaturas em uma única plataforma.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-neutral-700/30 rounded-lg">
              <h4 className="font-semibold text-white mb-1">Personalizado</h4>
              <p className="text-body-sm text-neutral-400">
                Interface adaptada ao seu perfil psicológico
              </p>
            </div>
            <div className="p-4 bg-neutral-700/30 rounded-lg">
              <h4 className="font-semibold text-white mb-1">Completo</h4>
              <p className="text-body-sm text-neutral-400">
                Todas as ferramentas em um só lugar
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Diagnóstico Psicológico',
      description: 'Comece com uma avaliação para personalizar sua experiência',
      content: (
        <div className="space-y-4">
          <p className="text-body text-neutral-300">
            Complete uma breve avaliação psicológica baseada no modelo Big Five. Isso nos ajuda a:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-body-sm text-neutral-300">
                Adaptar a interface ao seu estilo cognitivo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-body-sm text-neutral-300">
                Recomendar estratégias personalizadas
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-body-sm text-neutral-300">
                Identificar pontos fortes e áreas de desenvolvimento
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Escolha sua Rota',
      description: 'Selecione um template de mobilidade para começar',
      content: (
        <div className="space-y-4">
          <p className="text-body text-neutral-300">
            Rotas são planos estruturados com marcos e tarefas para guiar sua jornada de mobilidade.
          </p>
          <p className="text-body-sm text-neutral-400">
            Você poderá explorar e selecionar rotas após completar o diagnóstico psicológico.
          </p>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    setIsOpen(false)
  }

  const handleComplete = () => {
    completeOnboarding()
    setIsOpen(false)
    navigate('/psychology/assessment')
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Modal
      open={isOpen}
      onClose={handleSkip}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-neutral-400">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-caption text-neutral-400 hover:text-white transition-colors"
            >
              Pular tutorial
            </button>
          </div>
          <Progress value={progress} size="sm" />
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          <h2 className="text-h2 font-heading text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-body text-neutral-300 mb-6">
            {steps[currentStep].description}
          </p>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left"
          >
            Voltar
          </Button>

          <Button
            onClick={handleNext}
            icon={
              currentStep === steps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            } iconPosition="right"
          >
            {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
