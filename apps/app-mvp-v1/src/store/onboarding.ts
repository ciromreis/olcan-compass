import { create } from 'zustand'

/**
 * Question shape as returned by the psych API.
 */
export interface PsychQuestion {
  id: string
  text_en: string
  text_pt: string
  text_es: string
  question_type: 'scale' | 'multiple_choice' | 'text' | 'binary'
  category: string
  options: Array<{
    value: string
    label_en: string
    label_pt: string
    label_es?: string
    score: number
  }>
  weight: number
  reverse_scored: boolean
  display_order: number
}

/**
 * Psych profile shape from GET /psych/profile.
 */
export interface PsychProfile {
  id: string
  user_id: string
  confidence_index: number
  anxiety_score: number
  discipline_score: number
  narrative_maturity_score: number
  interview_anxiety_score: number
  cultural_adaptability_score: number
  financial_resilience_score: number
  risk_profile: string
  decision_style: string
  mobility_state: string
  psychological_state: string
  fear_clusters: string[]
  strengths: string[]
  growth_areas: string[]
}

/**
 * Flow phase the user is currently in.
 */
export type AssessmentPhase = 'intro' | 'questions' | 'transition' | 'results'

interface OnboardingState {
  // Session
  sessionId: string | null
  totalQuestions: number
  currentIndex: number

  // Current question being displayed
  currentQuestion: PsychQuestion | null

  // Answers stored locally (questionId -> value) for back navigation
  answers: Record<string, string>

  // Flow state
  phase: AssessmentPhase
  isSubmitting: boolean
  error: string | null

  // Profile (populated after completion)
  profile: PsychProfile | null

  // Onboarding completion
  isOnboardingComplete: boolean

  // Actions
  startSession: (sessionId: string, totalQuestions: number) => void
  setCurrentQuestion: (question: PsychQuestion) => void
  setAnswer: (questionId: string, value: string) => void
  advance: () => void
  goBack: () => void
  setPhase: (phase: AssessmentPhase) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (error: string | null) => void
  setProfile: (profile: PsychProfile) => void
  completeOnboarding: () => void
  reset: () => void
}

const initialState = {
  sessionId: null,
  totalQuestions: 0,
  currentIndex: 0,
  currentQuestion: null,
  answers: {},
  phase: 'intro' as AssessmentPhase,
  isSubmitting: false,
  error: null,
  profile: null,
  isOnboardingComplete: false,
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...initialState,

  startSession: (sessionId, totalQuestions) =>
    set({ sessionId, totalQuestions, currentIndex: 0, phase: 'questions', error: null }),

  setCurrentQuestion: (question) =>
    set({ currentQuestion: question }),

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),

  advance: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    })),

  setPhase: (phase) => set({ phase }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  setProfile: (profile) => set({ profile, phase: 'results' }),
  completeOnboarding: () => set({ isOnboardingComplete: true }),
  reset: () => set(initialState),
}))
