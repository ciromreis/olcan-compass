"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SkipForward, StopCircle, Clock, MessageSquare, Send, CheckCircle,
  Star, AlertTriangle, ArrowRight, Sparkles,
} from "lucide-react";
import {
  useInterviewStore,
  getQuestionsForType,
  generateScore,
  generateFeedback,
  type InterviewAnswer,
} from "@/stores/interviews";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { getSessionById, submitAnswer, completeSession } = useInterviewStore();
  const session = getSessionById(sessionId);

  const questions = session?.questions?.length
    ? session.questions
    : session
      ? getQuestionsForType(session.type, 5)
      : getQuestionsForType("academic", 5);

  const [currentQ, setCurrentQ] = useState(() => {
    if (!session) return 0;
    return Math.min(session.answers.length, Math.max(questions.length - 1, 0));
  });
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(() => session?.answers.reduce((sum, item) => sum + item.timeSpent, 0) ?? 0);
  const [submitted, setSubmitted] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<InterviewAnswer | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [allAnswers, setAllAnswers] = useState<InterviewAnswer[]>(() => session?.answers || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setTimer((t) => t + 1);
      setTotalTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!submitted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQ, submitted]);

  useEffect(() => {
    if (!session || session.status !== "completed") return;
    setIsFinished(true);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "in_progress") return;
    if (session.answers.length < questions.length || questions.length === 0) return;
    completeSession(sessionId);
    setIsFinished(true);
  }, [completeSession, questions.length, session, sessionId]);

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim() || !session) return;

    const score = generateScore(answer.length, timer);
    const feedback = generateFeedback(score);

    const answerObj: InterviewAnswer = {
      questionIndex: currentQ,
      question: questions[currentQ],
      answer: answer.trim(),
      score,
      feedback,
      timeSpent: timer,
    };

    submitAnswer(sessionId, answerObj);
    setAllAnswers((prev) => [...prev, answerObj]);
    setLastFeedback(answerObj);
    setSubmitted(true);
  }, [answer, timer, currentQ, questions, session, sessionId, submitAnswer]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setAnswer("");
      setTimer(0);
      setSubmitted(false);
      setLastFeedback(null);
    } else {
      completeSession(sessionId);
      setIsFinished(true);
    }
  };

  const handleEndEarly = () => {
    completeSession(sessionId);
    router.push(`/interviews/${sessionId}`);
  };

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-heading text-h3 text-text-primary mb-2">Sessão não encontrada</h2>
        <Link href="/interviews" className="text-moss-500 font-medium hover:underline">Voltar ao simulador</Link>
      </div>
    );
  }

  if (isFinished) {
    const avgScore = allAnswers.length > 0
      ? Math.round(allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length)
      : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${avgScore >= 70 ? "bg-moss-50" : "bg-clay-50"}`}>
            {avgScore >= 70 ? <Star className="w-10 h-10 text-moss-500" /> : <AlertTriangle className="w-10 h-10 text-clay-500" />}
          </div>
          <h1 className="font-heading text-h2 text-text-primary mb-2">Sessão Concluída!</h1>
          <p className="text-body text-text-secondary">{session.typeLabel} — {session.target}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card-surface p-5 text-center">
            <p className={`font-heading text-display ${avgScore >= 70 ? "text-moss-500" : "text-clay-500"}`}>{avgScore}</p>
            <p className="text-caption text-text-muted">Score Geral</p>
          </div>
          <div className="card-surface p-5 text-center">
            <p className="font-heading text-display text-text-primary">{allAnswers.length}</p>
            <p className="text-caption text-text-muted">Perguntas</p>
          </div>
          <div className="card-surface p-5 text-center">
            <p className="font-heading text-display text-text-primary">{formatTime(totalTimer)}</p>
            <p className="text-caption text-text-muted">Duração</p>
          </div>
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Respostas</h3>
          <div className="space-y-4">
            {allAnswers.map((a, i) => (
              <div key={i} className="p-4 rounded-lg bg-cream-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-body-sm font-medium text-text-primary flex-1 pr-4">Q{i + 1}: {a.question}</p>
                  <span className={`font-heading font-bold text-h4 ${a.score >= 70 ? "text-moss-500" : a.score >= 50 ? "text-amber-500" : "text-clay-500"}`}>{a.score}</span>
                </div>
                <p className="text-body-sm text-text-secondary mb-2 line-clamp-2">&ldquo;{a.answer}&rdquo;</p>
                <p className="text-body-sm text-text-secondary flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" />
                  {a.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/interviews" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
            Voltar ao Simulador
          </Link>
          <Link href={`/interviews/${sessionId}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
            Ver Resultado Completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h3 text-text-primary">Simulação em Andamento</h1>
          <p className="text-caption text-text-secondary">{session.typeLabel} — {session.target}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-body-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(totalTimer)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i < currentQ ? "bg-moss-500" : i === currentQ ? (submitted ? "bg-moss-400" : "bg-moss-300 animate-pulse") : "bg-cream-300"
          }`} />
        ))}
      </div>

      {/* Question */}
      <div className="card-surface p-8 mb-6">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <MessageSquare className="w-5 h-5 text-moss-500" />
          <span className="text-caption text-text-muted">Pergunta {currentQ + 1} de {questions.length}</span>
          <span className="text-caption text-text-muted">·</span>
          <span className="text-caption text-text-muted font-mono">{formatTime(timer)}</span>
        </div>
        <h2 className="font-heading text-h3 text-text-primary leading-relaxed text-center">{questions[currentQ]}</h2>
      </div>

      {/* Answer area */}
      {!submitted ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey && answer.trim()) handleSubmitAnswer();
              }}
              placeholder="Digite sua resposta aqui... (⌘+Enter para enviar)"
              className="w-full h-full min-h-[200px] p-4 rounded-xl border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent text-body resize-none"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-caption text-text-muted">{answer.length} caracteres</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleEndEarly}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors"
            >
              <StopCircle className="w-4 h-4" /> Encerrar
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim()}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-heading font-semibold text-body-sm transition-colors ${
                answer.trim()
                  ? "bg-moss-500 text-white hover:bg-moss-600"
                  : "bg-cream-300 text-text-muted cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" /> Enviar Resposta
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Feedback */}
          {lastFeedback && (
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-moss-500" />
                  <span className="font-heading font-semibold text-text-primary">Feedback</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  lastFeedback.score >= 70 ? "bg-moss-50 text-moss-600" : lastFeedback.score >= 50 ? "bg-amber-50 text-amber-600" : "bg-clay-50 text-clay-600"
                }`}>
                  <Star className="w-3.5 h-3.5" />
                  <span className="font-heading font-bold">{lastFeedback.score}</span>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary">{lastFeedback.feedback}</p>
              <div className="flex items-center gap-4 text-caption text-text-muted">
                <span>Tempo: {formatTime(lastFeedback.timeSpent)}</span>
                <span>{lastFeedback.answer.length} caracteres</span>
              </div>
            </div>
          )}

          {/* Next action */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={handleEndEarly}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors"
            >
              <StopCircle className="w-4 h-4" /> Encerrar
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors"
            >
              {currentQ < questions.length - 1 ? (
                <>Próxima Pergunta <SkipForward className="w-4 h-4" /></>
              ) : (
                <>Finalizar Sessão <CheckCircle className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
