import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Clock, CheckCircle } from 'lucide-react'
import { useInterviews } from '@/hooks/useInterviews'
import { InterviewCard } from '@/components/domain/InterviewCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import type { InterviewQuestion } from '@/components/domain/InterviewCard'

type SessionData = {
  id: string
  status?: string
  current_question_index?: number
  total_questions?: number
  questions?: InterviewQuestion[]
}

export function InterviewSession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSession, submitAnswerAsync, completeSessionAsync } = useInterviews()
  const [answerText, setAnswerText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const sessionQuery = getSession(id ?? '')
  const session = sessionQuery?.data as SessionData | undefined

  if (sessionQuery?.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (sessionQuery?.error || !session) {
    return <Alert variant="error">Erro ao carregar sessão. Tente novamente.</Alert>
  }

  const currentQuestion = session?.questions?.[0]

  const handleAnswer = (answer: string) => {
    if (currentQuestion) {
      setAnswerText(answer)
    }
  }

  const handleNext = async () => {
    if (!session?.id || !currentQuestion || !answerText.trim()) {
      return
    }

    await submitAnswerAsync({
      sessionId: session.id,
      questionId: currentQuestion.id,
      answer: answerText,
    })

    setAnswerText('')
    const refreshed = await sessionQuery?.refetch()

    if (!refreshed?.data?.questions?.[0] || refreshed.data?.status === 'completed') {
      await completeSessionAsync(session.id)
      setIsComplete(true)
      setTimeout(() => navigate('/interviews'), 2000)
    }
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-heading text-h2 text-white mb-3">Sessão Completa</h1>
            <p className="text-body text-neutral-300">Suas respostas foram enviadas para análise.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">Sessão de Entrevista</h1>
          <p className="text-body text-neutral-300 mt-1">
            Pergunta {(session.current_question_index || 0) + 1} de {session.total_questions || 1}
          </p>
        </div>
        <div className="flex items-center gap-2 text-body text-neutral-300">
          <Clock className="w-5 h-5" />
          <span>15:00</span>
        </div>
      </div>

      <InterviewCard 
        questions={currentQuestion ? [currentQuestion] : []}
          currentIndex={0}
          onResponseSubmit={(_questionId, response) => handleAnswer(response)}
        />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/interviews')}
        >
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!answerText.trim()}>
          {session?.status === 'completed' ? 'Finalizar' : 'Próxima'}
        </Button>
      </div>
    </div>
  )
}
