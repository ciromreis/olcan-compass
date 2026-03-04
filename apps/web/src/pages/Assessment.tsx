import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '../store/onboarding'
import { api } from '../lib/api'
import { IntroScreen } from '../components/assessment/IntroScreen'
import { QuestionScreen } from '../components/assessment/QuestionScreen'
import { TransitionScreen } from '../components/assessment/TransitionScreen'
import { ResultsScreen } from '../components/assessment/ResultsScreen'

/**
 * Assessment page — orchestrates the full psychological onboarding flow.
 *
 * Flow: IntroScreen → QuestionScreen (loop) → TransitionScreen → ResultsScreen
 *
 * Each answer is submitted to the backend immediately (auto-save).
 * Back navigation re-fetches the previous question.
 * On completion, shows a 2.5s transition before fetching and displaying results.
 */
export function Assessment() {
  const navigate = useNavigate()
  const {
    phase,
    sessionId,
    currentIndex,
    totalQuestions,
    currentQuestion,
    answers,
    isSubmitting,
    error,
    profile,
    startSession,
    setCurrentQuestion,
    setAnswer,
    advance,
    goBack,
    setPhase,
    setSubmitting,
    setError,
    setProfile,
  } = useOnboardingStore()

  // ── Begin assessment: create session + fetch first question ──
  const handleBegin = useCallback(async () => {
    setSubmitting(true)
    try {
      const session = await api.startAssessment('onboarding')
      startSession(session.session_id, session.total_questions)
      const question = await api.getNextQuestion(session.session_id)
      setCurrentQuestion(question)
    } catch (err) {
      setError('Erro ao iniciar avaliação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }, [startSession, setCurrentQuestion, setSubmitting, setError])

  // ── Fetch question whenever currentIndex changes during questions phase ──
  useEffect(() => {
    if (phase !== 'questions' || !sessionId) return
    // Don't re-fetch if we already have the right question for this index
    // (e.g. on initial load after startSession already fetched it)
    if (currentQuestion && currentIndex === 0 && currentQuestion.display_order === 1) return

    let cancelled = false

    async function fetchQuestion() {
      try {
        const question = await api.getNextQuestion(sessionId!)
        if (!cancelled) {
          setCurrentQuestion(question)
        }
      } catch {
        // 404 means no more questions — shouldn't happen in normal flow
      }
    }

    // Only fetch if we navigated (back or after answer submission advanced the index on backend)
    // For back navigation the backend index doesn't change, so we refetch via the API
    fetchQuestion()

    return () => { cancelled = true }
  }, [currentIndex, phase, sessionId])

  // ── Submit answer ──
  const handleAnswer = useCallback(async (value: string) => {
    if (!sessionId || !currentQuestion) return

    setAnswer(currentQuestion.id, value)
    setSubmitting(true)

    try {
      const result = await api.submitAnswer({
        session_id: sessionId,
        question_id: currentQuestion.id,
        answer_value: value,
      })

      if (result.is_complete) {
        // Assessment complete — show transition then results
        setPhase('transition')

        // Wait 2.5s for the transition animation, then fetch profile
        setTimeout(async () => {
          try {
            const fetchedProfile = await api.getPsychProfile()
            setProfile(fetchedProfile)
          } catch {
            setError('Erro ao carregar perfil. Tente novamente.')
            setPhase('questions')
          }
        }, 2500)
      } else {
        // Move to next question
        advance()
      }
    } catch {
      setError('Erro ao enviar resposta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }, [sessionId, currentQuestion, setAnswer, setSubmitting, advance, setPhase, setProfile, setError])

  // ── Back navigation ──
  // Note: The backend doesn't support going back (current_question_index only advances).
  // We handle "back" as a UX feature: show the previous question from local state,
  // but re-submit the answer when the user selects again.
  // For back to work with the API's sequential model, we just decrement our local index
  // and let the question re-render with the stored answer. The next forward submission
  // will re-submit to the backend.
  const handleBack = useCallback(() => {
    goBack()
  }, [goBack])

  // ── Continue to dashboard after results ──
  const handleContinue = useCallback(() => {
    navigate('/routes/templates')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4 md:p-8">
      {/* Background glow effect */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl mx-auto py-8">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <IntroScreen
              key="intro"
              onBegin={handleBegin}
              isLoading={isSubmitting}
              error={error}
            />
          )}

          {phase === 'questions' && currentQuestion && (
            <QuestionScreen
              key={`question-${currentIndex}`}
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              existingAnswer={answers[currentQuestion.id]}
              isFirst={currentIndex === 0}
              isSubmitting={isSubmitting}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}

          {phase === 'transition' && (
            <TransitionScreen key="transition" />
          )}

          {phase === 'results' && profile && (
            <ResultsScreen
              key="results"
              profile={profile}
              onContinue={handleContinue}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
