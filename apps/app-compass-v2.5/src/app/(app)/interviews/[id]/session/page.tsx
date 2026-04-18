"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SkipForward, StopCircle, Clock, MessageSquare, Send, CheckCircle,
  Star, AlertTriangle, ArrowRight, Sparkles, Mic, Square
} from "lucide-react";
import {
  useInterviewStore,
  contextualizeQuestions,
  getQuestionsForType,
  type InterviewAnswer,
} from "@/stores/interviews";
import { useAuthStore } from "@/stores/auth";
import { useForgeStore } from "@/stores/forge";
import { usePsychStore } from "@/stores/psych";
import { formatOiosArchetypeLabel } from "@/lib/oios-archetype-display";
import { useToast } from "@/components/ui";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.id as string;
  const { getSessionById, submitAnswer, completeSession } = useInterviewStore();
  const { user } = useAuthStore();
  const { getDocById } = useForgeStore();
  const oiosArchetypeKey = usePsychStore((s) => s.oiosSnapshot?.dominant_archetype);
  const session = getSessionById(sessionId);
  const sourceDoc = session?.sourceDocumentId ? getDocById(session.sourceDocumentId) : undefined;

  const profile = user as
    | { dominant_archetype?: string; psychProfile?: { dominant_archetype?: string } }
    | null
    | undefined;
  const archetype =
    profile?.dominant_archetype ||
    profile?.psychProfile?.dominant_archetype ||
    (oiosArchetypeKey ? formatOiosArchetypeLabel(oiosArchetypeKey) : null) ||
    "The Pioneer";

  const questions = useMemo(() => {
    const baseQuestions = session?.questions?.length
      ? session.questions
      : session
        ? getQuestionsForType(session.type, 5, archetype)
        : getQuestionsForType("academic", 5, archetype);

    return contextualizeQuestions(baseQuestions, session?.type || "academic", {
      archetype,
      target: session?.target,
      sourceDocumentTitle: session?.sourceDocumentTitle,
      sourceDocumentType: sourceDoc?.type,
      sourceProgram: sourceDoc?.targetProgram,
      sourceSnippet: sourceDoc?.content?.slice(0, 240),
    });
  }, [archetype, session, sourceDoc]);

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

  // Web Audio API States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        void audioBlob; // reserved for future server-side upload / analysis
      };

      mediaRecorder.start();
      setIsRecording(true);
      drawVisualizer(stream);

      // Start browser speech recognition when available
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognitionImpl) {
          const recognition = new SpeechRecognitionImpl();
          recognitionRef.current = recognition;
          recognition.lang =
            session?.language === "pt"
              ? "pt-BR"
              : session?.language === "es"
              ? "es-ES"
              : session?.language === "de"
              ? "de-DE"
              : session?.language === "fr"
              ? "fr-FR"
              : "en-US";
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsTranscribing(true);
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            const transcriptParts: string[] = [];
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                transcriptParts.push(result[0].transcript);
              }
            }
            if (transcriptParts.length > 0) {
              const text = transcriptParts.join(" ").trim();
              if (text) {
                setAnswer((prev) =>
                  prev && prev.trim().length > 0 ? `${prev.trim()}\n${text}` : text
                );
              }
            }
          };

          recognition.onerror = () => {
            setIsTranscribing(false);
          };

          recognition.onend = () => {
            setIsTranscribing(false);
          };

          recognition.start();
        }
      }
    } catch (err) {
      console.error("Error accessing mic:", err);
      toast({ title: "Microfone bloqueado", description: "Para a simulação realista da Aura, permita o acesso ao microfone.", variant: "warning" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // noop – some browsers throw if already stopped
      } finally {
        recognitionRef.current = null;
        setIsTranscribing(false);
      }
    }
  };

  // Canvas visualizer simulation
  const drawVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#0F0F0E"; // slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        // Monochromatic White
        /* eslint-disable no-mixed-operators */
        ctx.fillStyle = `rgba(255, 255, 255, ${barHeight / 128})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  useEffect(() => {
    // Timer stops automatically when the session is finished, preventing memory leak
    if (isFinished) return;
    const iv = setInterval(() => {
      setTimer((t) => t + 1);
      setTotalTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [isFinished]);

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
    void completeSession(sessionId);
    setIsFinished(true);
  }, [completeSession, questions.length, session, sessionId]);

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim() || !session) return;

    const answerObj: InterviewAnswer = {
      questionIndex: currentQ,
      question: questions[currentQ],
      answer: answer.trim(),
      score: 0,
      feedback: "",
      timeSpent: timer,
    };

    void (async () => {
      const analyzedAnswer = await submitAnswer(sessionId, answerObj);
      if (!analyzedAnswer) return;
      setAllAnswers((prev) => [...prev, analyzedAnswer]);
      setLastFeedback(analyzedAnswer);
      setSubmitted(true);
    })();
  }, [answer, timer, currentQ, questions, session, sessionId, submitAnswer]);

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setAnswer("");
      setTimer(0);
      setSubmitted(false);
      setLastFeedback(null);
    } else {
      await completeSession(sessionId);
      setIsFinished(true);
    }
  };

  const handleEndEarly = async () => {
    await completeSession(sessionId);
    router.push(`/interviews/${sessionId}`);
  };

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-heading text-h3 text-text-primary mb-2">Sessão não encontrada</h2>
        <Link href="/interviews" className="text-brand-500 font-medium hover:underline">Voltar ao simulador</Link>
      </div>
    );
  }

  if (isFinished) {
    const avgScore = allAnswers.length > 0
      ? Math.round(allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length)
      : 0;
    const interviewCoachHref = `/marketplace/search?cat=career_coaching&q=${encodeURIComponent(
      `coaching de entrevista ${session.typeLabel}`
    )}`;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${avgScore >= 70 ? "bg-brand-50" : "bg-clay-50"}`}>
            {avgScore >= 70 ? <Star className="w-10 h-10 text-brand-500" /> : <AlertTriangle className="w-10 h-10 text-clay-500" />}
          </div>
          <h1 className="font-heading text-h2 text-text-primary mb-2">Sessão Concluída!</h1>
          <p className="text-body text-text-secondary">{session.typeLabel} — {session.target}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card-surface p-5 text-center">
            <p className={`font-heading text-display ${avgScore >= 70 ? "text-brand-500" : "text-clay-500"}`}>{avgScore}</p>
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

        <div className="card-surface p-6 border border-brand-200/70 bg-brand-50/20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-5 h-5 text-brand-500" />
                <h3 className="font-heading text-h4 text-text-primary">Quer feedback humano?</h3>
              </div>
              <p className="text-body-sm text-text-secondary">
                Use sua simulação como referência e encontre um coach para revisar sua postura, clareza e estratégia.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={interviewCoachHref}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors flex-1"
            >
              Encontrar coaches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Respostas</h3>
          <div className="space-y-4">
            {allAnswers.map((a, i) => (
              <div key={i} className="p-4 rounded-lg bg-cream-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-body-sm font-medium text-text-primary flex-1 pr-4">Q{i + 1}: {a.question}</p>
                  <span className={`font-heading font-bold text-h4 ${a.score >= 70 ? "text-brand-500" : a.score >= 50 ? "text-slate-500" : "text-clay-500"}`}>{a.score}</span>
                </div>
                <p className="text-body-sm text-text-secondary mb-2 line-clamp-2">&ldquo;{a.answer}&rdquo;</p>
                <p className="text-body-sm text-text-secondary flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
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
          <Link href={`/interviews/${sessionId}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors">
            Ver Resultado Completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
      {(sourceDoc || session.sourceDocumentTitle) && (
        <div className="card-surface mb-4 border border-brand-100 bg-brand-50/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-caption font-semibold uppercase tracking-wider text-brand-600">Contexto ativo</p>
              <p className="mt-1 text-body-sm text-text-primary">
                Esta sessão está priorizando sinais do documento <strong>{sourceDoc?.title || session.sourceDocumentTitle}</strong>.
              </p>
              <p className="mt-1 text-caption text-text-muted">
                O objetivo é verificar se sua narrativa escrita também se sustenta na fala.
              </p>
            </div>
            {session.sourceDocumentId && (
              <Link href={`/forge/${session.sourceDocumentId}`} className="inline-flex items-center gap-1 text-caption font-semibold text-brand-600 hover:text-brand-700">
                Abrir documento
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

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
            i < currentQ ? "bg-brand-500" : i === currentQ ? (submitted ? "bg-brand-400" : "bg-brand-300 animate-pulse") : "bg-cream-300"
          }`} />
        ))}
      </div>

      {/* Question */}
      <div className="card-surface p-8 mb-6">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          <span className="text-caption text-text-muted">Pergunta {currentQ + 1} de {questions.length}</span>
          <span className="text-caption text-text-muted">·</span>
          <span className="text-caption text-text-muted font-mono">{formatTime(timer)}</span>
        </div>
        <h2 className="font-heading text-h3 text-text-primary leading-relaxed text-center">{questions[currentQ]}</h2>
      </div>

      {/* Answer area */}
      {!submitted ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative flex-1 card-surface p-1 border-white/20 overflow-hidden group">
            <div className={`absolute inset-0 bg-white/5 transition-opacity duration-500 ${isRecording ? "opacity-100" : "opacity-0"}`} />
            
            {/* Audio Visualizer Canvas */}
            <canvas 
               ref={canvasRef} 
               width={600} 
               height={100} 
               className={`w-full h-32 mb-2 rounded-t-xl transition-all duration-300 ${isRecording ? "opacity-100" : "opacity-0 h-0"}`}
            />

            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey && answer.trim()) handleSubmitAnswer();
              }}
              placeholder={
                isRecording || isTranscribing
                  ? "Ouvindo... transcrevendo sua resposta em tempo real"
                  : "Comece a falar usando o microfone ou digite sua resposta... (⌘+Enter para enviar)"
              }
              disabled={isRecording}
              className={`w-full h-full min-h-[160px] p-4 rounded-xl border border-cream-500/20 bg-transparent text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-body resize-none relative z-10 ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-4 z-20">
              <span className="text-caption text-text-muted font-mono">{answer.length} caracteres</span>
              
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-white/10 border border-white/10 hover:border-white flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  title="Record audio via Web Audio API"
                >
                  <Mic className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="w-12 h-12 rounded-full bg-flame hover:bg-flame-2 flex items-center justify-center transition-all animate-pulse"
                  title="Stop recording"
                >
                  <Square className="w-4 h-4 text-white fill-white" />
                </button>
              )}
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
                  ? "bg-brand-500 text-white hover:bg-brand-600"
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
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <span className="font-heading font-semibold text-text-primary">Feedback</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  lastFeedback.score >= 70 ? "bg-brand-50 text-brand-600" : lastFeedback.score >= 50 ? "bg-slate-50 text-slate-600" : "bg-clay-50 text-clay-600"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors"
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
