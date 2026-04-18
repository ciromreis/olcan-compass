"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Brain, CheckCircle, Loader2, Sparkles
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { usePsychStore } from "@/stores/psych";
import {
  OIOS_ARCHETYPE_LABELS,
  OIOS_FEAR_CLUSTER_LABELS,
  OIOS_ARCHETYPE_DESCRIPTIONS,
} from "@/lib/oios-archetype-display";
import { DEMO_QUIZ_QUESTIONS, calculateDemoArchetype } from "@/lib/demo-quiz-questions";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

interface Question {
  id: string;
  text_pt: string;
  question_type: string;
  category: string;
  options: QuestionOption[];
  display_order: number;
}

type Phase = "loading" | "quiz" | "completing" | "reveal" | "error";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OIOSQuizPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    dominant_archetype: string | null;
    primary_fear_cluster: string | null;
    mobility_state: string | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoAnswers, setDemoAnswers] = useState<Record<string, string>>({});

  // Start assessment on mount
  useEffect(() => {
    let mounted = true;

    async function start() {
      // DEMO MODE: Use local questions
      if (DEMO_MODE) {
        if (!mounted) return;
        setSessionId("demo-session");
        setTotalQuestions(DEMO_QUIZ_QUESTIONS.length);
        setQuestion(DEMO_QUIZ_QUESTIONS[0] as Question);
        setPhase("quiz");
        return;
      }

      // PRODUCTION: Use API
      try {
        const data = await apiClient.startPsychAssessment();
        if (!mounted) return;
        setSessionId(data.session_id);
        setTotalQuestions(data.total_questions);
        await loadQuestion(data.session_id, 0);
        if (mounted) setPhase("quiz");
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = (err as { message?: string })?.message;
        if (msg?.includes("Nenhuma questão")) {
          setErrorMessage("O banco de questões ainda não foi configurado. Execute o seed script.");
        } else {
          setErrorMessage("Não foi possível iniciar a avaliação. Tente novamente.");
        }
        setPhase("error");
      }
    }

    void start();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestion = useCallback(async (sid: string, index: number = 0) => {
    if (DEMO_MODE) {
      // Demo mode: load from local questions
      const nextQuestion = DEMO_QUIZ_QUESTIONS[index];
      if (nextQuestion) {
        setQuestion(nextQuestion as Question);
        setSelectedValue(null);
      }
      return;
    }
    
    // Production: load from API
    const q = await apiClient.getPsychQuestion(sid);
    setQuestion(q as Question);
    setSelectedValue(null);
  }, []);

  const handleAnswer = useCallback(async () => {
    if (!sessionId || !question || !selectedValue) return;

    setSubmitting(true);
    
    try {
      // DEMO MODE: Process locally
      if (DEMO_MODE) {
        // Store answer
        const newAnswers = { ...demoAnswers, [question.id]: selectedValue };
        setDemoAnswers(newAnswers);
        
        // Check if complete
        const isComplete = currentIndex + 1 >= totalQuestions;
        
        if (isComplete) {
          setPhase("completing");
          await new Promise(r => setTimeout(r, 800)); // Simulate processing
          
          // Calculate result
          const resultData = calculateDemoArchetype(newAnswers);
          setResult(resultData);
          
          // Save to store
          const psych = usePsychStore.getState();
          psych.setOiosAssessmentComplete(true);
          psych.setOiosSnapshot({
            dominant_archetype: resultData.dominant_archetype,
            primary_fear_cluster: resultData.primary_fear_cluster,
            mobility_state: resultData.mobility_state,
            completedAt: new Date().toISOString(),
          });
          
          setPhase("reveal");
        } else {
          // Load next question
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setQuestion(DEMO_QUIZ_QUESTIONS[nextIndex] as Question);
          setSelectedValue(null);
        }
        
        setSubmitting(false);
        return;
      }
      
      // PRODUCTION: Use API
      const res = await apiClient.submitPsychAnswer({
        session_id: sessionId,
        question_id: question.id,
        answer_value: selectedValue,
      });

      if (res.is_complete) {
        setPhase("completing");
        const resultData = await apiClient.getPsychResult(sessionId);
        setResult(resultData);
        const psych = usePsychStore.getState();
        psych.setOiosAssessmentComplete(true);
        psych.setOiosSnapshot({
          dominant_archetype: resultData.dominant_archetype ?? null,
          primary_fear_cluster: resultData.primary_fear_cluster ?? null,
          mobility_state: resultData.mobility_state ?? null,
          completedAt: new Date().toISOString(),
        });
        setPhase("reveal");
      } else {
        setCurrentIndex(res.next_index);
        await loadQuestion(sessionId, res.next_index);
      }
    } catch {
      setErrorMessage("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, question, selectedValue, loadQuestion, currentIndex, totalQuestions, demoAnswers]);

  const progress =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (phase === "loading" || phase === "completing") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-body text-text-muted">
          {phase === "loading" ? "Preparando sua avaliação..." : "Calculando seu perfil..."}
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <Brain className="w-12 h-12 text-clay-500 mx-auto" />
        <h2 className="font-heading text-h3 text-text-primary">Avaliação indisponível</h2>
        <p className="text-body text-text-muted">{errorMessage}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          Ir para o painel
        </button>
      </div>
    );
  }

  if (phase === "reveal" && result) {
    const archetype = result.dominant_archetype;
    const cluster = result.primary_fear_cluster;
    const archetypeLabel = archetype ? (OIOS_ARCHETYPE_LABELS[archetype] ?? archetype) : "—";
    const clusterLabel = cluster ? (OIOS_FEAR_CLUSTER_LABELS[cluster] ?? cluster) : "—";
    const description = archetype ? (OIOS_ARCHETYPE_DESCRIPTIONS[archetype] ?? "") : "";

    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-caption font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Avaliação concluída
          </div>
          <h1 className="font-heading text-h1 text-text-primary">Seu Perfil de Mobilidade</h1>
        </div>

        <div className="card-surface p-8 space-y-6 shadow-sm border border-brand-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-caption text-text-muted uppercase tracking-wide font-semibold mb-1">Perfil Dominante</p>
              <h2 className="font-heading text-h2 text-text-primary">{archetypeLabel}</h2>
            </div>
          </div>

          <p className="text-body text-text-secondary leading-relaxed">{description}</p>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-cream-100 border border-cream-200">
            <div>
              <p className="text-caption text-text-muted font-semibold uppercase tracking-wide">Cluster de Motivação</p>
              <p className="text-body-sm font-semibold text-text-primary mt-0.5">{clusterLabel}</p>
            </div>
          </div>

          {result.mobility_state && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-sage-50 border border-sage-200">
              <div>
                <p className="text-caption text-text-muted font-semibold uppercase tracking-wide">Estado de Mobilidade</p>
                <p className="text-body-sm font-semibold text-text-primary mt-0.5 capitalize">{result.mobility_state}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-body-sm hover:bg-brand-600 transition-colors"
          >
            Acessar painel
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/profile/psych")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            Ver perfil completo
          </button>
        </div>
      </div>
    );
  }

  // Quiz phase
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-caption text-text-muted mb-1.5">
            <span>Avaliação de Perfil — Questão {currentIndex + 1} de {totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-cream-200">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="card-surface p-8 shadow-sm border border-cream-200 space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand-500" />
          <span className="text-caption text-text-muted uppercase tracking-wide font-semibold">
            {question.category.replace(/_/g, " ")}
          </span>
        </div>
        <h2 className="font-heading text-h3 text-text-primary leading-snug">{question.text_pt}</h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedValue(option.value)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-xl border text-body-sm transition-all",
                selectedValue === option.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold shadow-sm"
                  : "border-cream-300 bg-cream-50 text-text-secondary hover:border-brand-300 hover:bg-cream-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={handleAnswer}
          disabled={!selectedValue || submitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : currentIndex + 1 < totalQuestions ? (
            <>Próxima <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Concluir <CheckCircle className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
