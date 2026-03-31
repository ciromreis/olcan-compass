import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { CheckCircle, Award, TrendingUp, RotateCcw, ArrowRight, ChevronLeft } from 'lucide-react'
import { useInterviews } from '@/hooks/useInterviews'
import { InterviewCard } from '@/components/domain/InterviewCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import type { InterviewQuestion } from '@/components/domain/InterviewCard'

type SessionData = {
  id: string
  status?: string
  current_question_index?: number
  total_questions?: number
  questions?: InterviewQuestion[]
  score?: number
  feedback?: string
  answers?: Array<{
    question_text?: string
    transcript?: string
    score?: number
    feedback?: string
  }>
}

export function InterviewSession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSession, submitAnswerAsync, completeSessionAsync } = useInterviews()
  const [answerText, setAnswerText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [completedSessionData, setCompletedSessionData] = useState<SessionData | null>(null)

  const sessionQuery = getSession(id ?? '')
  const session = sessionQuery?.data as SessionData | undefined

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

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
  const totalQuestions = session?.total_questions || 1

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
    setAnsweredCount((prev) => prev + 1)
    const refreshed = await sessionQuery?.refetch()

    if (!refreshed?.data?.questions?.[0] || refreshed.data?.status === 'completed') {
      if (timerRef.current) clearInterval(timerRef.current)
      const result = await completeSessionAsync(session.id)
      setCompletedSessionData(result as SessionData || session)
      setIsComplete(true)
    }
  }

  if (isComplete) {
    const finalData = completedSessionData || session
    const durationMinutes = Math.round(elapsedSeconds / 60)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Results Header */}
        <Card className="liquid-glass" noPadding>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-heading text-h2 text-white mb-2">Sessão Completa</h1>
            <p className="text-body text-slate">
              Você respondeu {answeredCount || totalQuestions} perguntas em {durationMinutes || '< 1'} minuto{durationMinutes !== 1 ? 's' : ''}.
            </p>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="liquid-glass" noPadding>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan" />
              <h2 className="font-heading text-h3 text-white">Resumo de Performance</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-panel">
                <p className="text-caption text-slate">Perguntas</p>
                <p className="text-body font-semibold text-white font-mono mt-1">
                  {answeredCount || totalQuestions}
                </p>
              </div>
              <div className="stat-panel">
                <p className="text-caption text-slate">Tempo</p>
                <p className="text-body font-semibold text-white font-mono mt-1">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
              <div className="stat-panel">
                <p className="text-caption text-slate">Média/pergunta</p>
                <p className="text-body font-semibold text-white font-mono mt-1">
                  {answeredCount > 0
                    ? formatTime(Math.round(elapsedSeconds / answeredCount))
                    : '—'}
                </p>
              </div>
            </div>

            {finalData?.score !== undefined && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-slate">Score geral</span>
                  <span className="text-body-sm text-white font-mono">{Math.round(finalData.score)}/100</span>
                </div>
                <Progress value={finalData.score} />
              </div>
            )}

            {finalData?.feedback && (
              <div className="rounded-xl border border-white/10 bg-void-primary/30 p-4">
                <p className="text-body-sm text-silver">{finalData.feedback}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="liquid-glass" noPadding>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan" />
              <h2 className="font-heading text-h3 text-white">Próximos Passos</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-body-sm text-slate">
                <span className="text-cyan mt-0.5">•</span>
                <span>Revise suas respostas e identifique pontos a melhorar</span>
              </div>
              <div className="flex items-start gap-2 text-body-sm text-slate">
                <span className="text-cyan mt-0.5">•</span>
                <span>Pratique mais com perguntas de dificuldade progressiva</span>
              </div>
              <div className="flex items-start gap-2 text-body-sm text-slate">
                <span className="text-cyan mt-0.5">•</span>
                <span>Foque em estruturar respostas com: Situação → Ação → Resultado</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/interviews')}
            icon={<RotateCcw className="w-4 h-4" />}
            iconPosition="left"
            fullWidth
          >
            Nova Sessão
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            fullWidth
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/interviews')}
            className="flex items-center gap-1 text-body-sm text-slate hover:text-cyan transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="font-heading text-h2 text-white">Sessão de Entrevista</h1>
          <p className="text-body-sm text-slate mt-1">
            Pergunta {answeredCount + 1} de {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="font-mono">{formatTime(elapsedSeconds)}</Badge>
        </div>
      </div>

      {/* Progress */}
      <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} />

      <InterviewCard
        questions={currentQuestion ? [currentQuestion] : []}
        currentIndex={0}
        onResponseSubmit={(_questionId, response) => handleAnswer(response)}
      />

      <div className="flex items-center justify-end">
        <Button onClick={handleNext} disabled={!answerText.trim()}>
          {answeredCount + 1 >= totalQuestions ? 'Finalizar' : 'Próxima'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
