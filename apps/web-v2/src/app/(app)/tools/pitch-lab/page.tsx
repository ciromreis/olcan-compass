"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square, Mic, Video, Download, BarChart3, MessageCircle, Target } from "lucide-react";
import { Button, Card, Progress, LoadingSpinner } from "@/components/ui";

interface PitchMetrics {
  duration: number;
  wordCount: number;
  hesitationCount: number;
  confidenceScore: number;
  clarityScore: number;
  engagementScore: number;
  feedback: {
    type: "strength" | "improvement";
    message: string;
    timestamp: number;
  }[];
}

interface PitchSession {
  id: string;
  type: "text" | "audio" | "video";
  status: "idle" | "recording" | "processing" | "completed";
  startTime?: number;
  endTime?: number;
  transcript?: string;
  metrics?: PitchMetrics;
  audioBlob?: Blob;
  videoBlob?: Blob;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionResult {
  length: number;
  [index: number]: {
    transcript: string;
    isFinal: boolean;
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    Sentry?: {
      captureException: (error: unknown, options?: { tags?: Record<string, string> }) => void;
    };
  }
}

const PROMPT_SCENARIOS = [
  {
    id: "elevator_pitch",
    title: "Elevator Pitch",
    prompt: "Apresente-se em 60 segundos: quem você é, o que faz, e seu objetivo principal.",
    context: "Networking • Profissional • Conciso"
  },
  {
    id: "visa_interview",
    title: "Entrevista de Visto",
    prompt: "Explique por que você merece este visto e como contribuirá para o país. Foque em qualificações e planos.",
    context: "Imigração • Sério • Contribuição"
  },
  {
    id: "job_interview",
    title: "Entrevista de Emprego",
    prompt: "Por que devemos contratá-lo? Destaque suas habilidades e experiência relevantes.",
    context: "Carreira • Profissional • Confiante"
  },
  {
    id: "scholarship",
    title: "Bolsa de Estudos",
    prompt: "Por que você merece esta bolsa? Explique seus objetivos acadêmicos e impacto futuro.",
    context: "Educação • Acadêmico • Inspirador"
  }
];

export default function MockPitchLabPage() {
  const [selectedScenario, setSelectedScenario] = useState(PROMPT_SCENARIOS[0]);
  const [session, setSession] = useState<PitchSession>({
    id: `session_${Date.now()}`,
    type: "text",
    status: "idle"
  });
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Timer effect
  useEffect(() => {
    if (isRecording && session.status === "recording") {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, session.status]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition as typeof window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result[0].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processRecording = useCallback(async () => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock metrics calculation
    const duration = session.endTime! - session.startTime!;
    const words = transcript.split(/\s+/).length;
    const hesitationCount = (transcript.match(/\b(um|é|tipo|assim|né)\b/gi) || []).length;
    const confidenceScore = Math.max(0, Math.min(100, 100 - (hesitationCount * 5) - (words > 150 ? 10 : 0)));
    const clarityScore = Math.max(0, Math.min(100, 100 - (words / 2) + (duration / 1000)));
    const engagementScore = Math.max(0, Math.min(100, (words / duration) * 10000));

    const metrics: PitchMetrics = {
      duration,
      wordCount: words,
      hesitationCount,
      confidenceScore,
      clarityScore,
      engagementScore,
      feedback: [
        {
          type: confidenceScore > 70 ? "strength" : "improvement",
          message: confidenceScore > 70
            ? "Sua transmissão de confiança é excelente!"
            : "Não deixe a busca pela bolsa &quot;perfeita&quot; te impedir de aplicar para as &quot;boas&quot;. Ação cria oportunidade.",
          timestamp: 0
        },
        {
          type: clarityScore > 70 ? "strength" : "improvement",
          message: clarityScore > 70
            ? "Muita clareza na sua comunicação!"
            : "Fale um pouco mais devagar para melhorar a clareza.",
          timestamp: 1
        },
        {
          type: words > 80 && words < 120 ? "strength" : "improvement",
          message: words > 80 && words < 120
            ? "Duração perfeita para um pitch de 60 segundos!"
            : words < 80
              ? "Tente incluir mais detalhes para atingir 60 segundos."
              : "Seu pitch está muito longo. Foque nos pontos essenciais.",
          timestamp: 2
        }
      ]
    };

    setSession(prev => ({
      ...prev,
      status: "completed",
      metrics,
      transcript
    }));
  }, [session.endTime, session.startTime, transcript]);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;

      if (session.type === "video") {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      } else if (session.type === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true 
        });
      } else {
        // Text mode - just start timer
        setSession(prev => ({ ...prev, status: "recording", startTime: Date.now() }));
        setIsRecording(true);
        setElapsedTime(0);
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedBlob = new Blob(chunksRef.current, { 
          type: session.type === "video" ? 'video/webm' : 'audio/webm' 
        });

        setSession(prev => ({
          ...prev,
          status: "processing",
          endTime: Date.now(),
          [session.type === "video" ? "videoBlob" : "audioBlob"]: recordedBlob
        }));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Process the recording
        processRecording();
      };

      mediaRecorder.start();
      setSession(prev => ({ ...prev, status: "recording", startTime: Date.now() }));
      setIsRecording(true);
      setElapsedTime(0);

      // Start speech recognition if audio is enabled
      if (recognitionRef.current && (session.type === "audio" || session.type === "video")) {
        recognitionRef.current.start();
      }

    } catch (error) {
      // Log error for debugging (production monitoring)
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { component: 'PitchLab', action: 'media_access' }
        });
      }
      
      alert("Não foi possível acessar sua câmera/microfone. Verifique as permissões.");
    }
  }, [processRecording, session.type]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const resetSession = useCallback(() => {
    setSession({
      id: `session_${Date.now()}`,
      type: session.type,
      status: "idle"
    });
    setElapsedTime(0);
    setTranscript("");
  }, [session.type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "moss";
    if (score >= 60) return "amber";
    return "clay";
  };

  const downloadRecording = () => {
    if (session.audioBlob) {
      const url = URL.createObjectURL(session.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pitch-audio-${session.id}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (session.videoBlob) {
      const url = URL.createObjectURL(session.videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pitch-video-${session.id}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="space-y-4">
        <h1 className="font-heading text-h1 text-text-primary flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-brand-500" />
          Mock Pitch Lab
        </h1>
        <p className="text-body text-text-secondary">
          Pratique e aperfeiçoe seu pitch com feedback em tempo real e análise de performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Recording Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario Selection */}
          <Card className="p-6">
            <h2 className="font-heading text-h4 text-text-primary mb-4">Cenário do Pitch</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {PROMPT_SCENARIOS.map(scenario => (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedScenario.id === scenario.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-cream-300 hover:border-cream-400"
                  }`}
                >
                  <h3 className="font-heading text-h5 text-text-primary mb-2">
                    {scenario.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary mb-2">
                    {scenario.prompt}
                  </p>
                  <div className="text-caption text-text-muted">
                    {scenario.context}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recording Interface */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-h4 text-text-primary">Modo de Gravação</h3>
                <div className="flex gap-2">
                  {["text", "audio", "video"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => !isRecording && setSession(prev => ({ ...prev, type: mode as "text" | "audio" | "video" }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        session.type === mode
                          ? "bg-brand-500 text-white"
                          : "bg-cream-200 text-text-secondary hover:bg-cream-300"
                      }`}
                      disabled={isRecording}
                    >
                      {mode === "text" && "Texto"}
                      {mode === "audio" && <Mic className="w-4 h-4" />}
                      {mode === "video" && <Video className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Prompt */}
              <div className="bg-cream-50 rounded-lg p-4">
                <h4 className="font-heading text-h5 text-text-primary mb-2">
                  {selectedScenario.title}
                </h4>
                <p className="text-body text-text-secondary">
                  {selectedScenario.prompt}
                </p>
              </div>

              {/* Recording Area */}
              {session.type === "video" && session.status === "recording" && (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={(video) => {
                      if (video && mediaRecorderRef.current) {
                        const stream = mediaRecorderRef.current?.stream;
                        video.srcObject = stream;
                      }
                    }}
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      GRAVANDO
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input Mode */}
              {session.type === "text" && session.status === "recording" && (
                <div className="space-y-4">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Digite seu pitch aqui..."
                    className="w-full h-32 px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  />
                  <div className="text-center text-caption text-text-muted">
                    Tempo: {formatTime(elapsedTime)}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {session.status === "idle" && (
                  <Button onClick={startRecording} size="lg" className="px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Começar Gravação
                  </Button>
                )}

                {(session.status === "recording" || session.status === "processing") && (
                  <>
                    <Button 
                      onClick={stopRecording} 
                      variant="danger" 
                      size="lg"
                      disabled={session.status === "processing"}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      {session.status === "processing" ? "Processando..." : "Parar"}
                    </Button>
                    {session.status === "processing" && <LoadingSpinner />}
                  </>
                )}

                {session.status === "completed" && (
                  <>
                    <Button onClick={resetSession} variant="secondary">
                      <Play className="w-5 h-5 mr-2" />
                      Novo Pitch
                    </Button>
                    {(session.audioBlob || session.videoBlob) && (
                      <Button onClick={downloadRecording} variant="secondary">
                        <Download className="w-5 h-5 mr-2" />
                        Baixar
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Timer Display */}
              {session.status === "recording" && (
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-brand-600">
                    {formatTime(elapsedTime)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Results */}
          {session.status === "completed" && session.metrics && (
            <Card className="p-6">
              <h3 className="font-heading text-h4 text-text-primary mb-6">Resultados da Análise</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confiança</span>
                      <span className={getScoreColor(session.metrics.confidenceScore)}>
                        {session.metrics.confidenceScore}%
                      </span>
                    </div>
                    <Progress 
                      value={session.metrics.confidenceScore} 
                      variant={getScoreVariant(session.metrics.confidenceScore) as "moss" | "clay" | "gradient"}
                      size="sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clareza</span>
                      <span className={getScoreColor(session.metrics.clarityScore)}>
                        {session.metrics.clarityScore}%
                      </span>
                    </div>
                    <Progress 
                      value={session.metrics.clarityScore} 
                      variant={getScoreVariant(session.metrics.clarityScore) as "moss" | "clay" | "gradient"}
                      size="sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engajamento</span>
                      <span className={getScoreColor(session.metrics.engagementScore)}>
                        {session.metrics.engagementScore}%
                      </span>
                    </div>
                    <Progress 
                      value={session.metrics.engagementScore} 
                      variant={getScoreVariant(session.metrics.engagementScore) as "moss" | "clay" | "gradient"}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-text-secondary">Duração</span>
                    <span className="font-medium text-text-primary">
                      {formatTime(session.metrics.duration / 1000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-text-secondary">Palavras</span>
                    <span className="font-medium text-text-primary">{session.metrics.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-text-secondary">Hesitações</span>
                    <span className="font-medium text-text-primary">{session.metrics.hesitationCount}</span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-3">
                <h4 className="font-heading text-h5 text-text-primary">Feedback</h4>
                {session.metrics.feedback.map((feedback, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      feedback.type === "strength" 
                        ? "border-green-200 bg-green-50" 
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Target className={`w-4 h-4 mt-0.5 ${
                        feedback.type === "strength" ? "text-green-600" : "text-yellow-600"
                      }`} />
                      <p className="text-body-sm text-text-secondary">{feedback.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transcript */}
              {session.transcript && (
                <div className="space-y-3">
                  <h4 className="font-heading text-h5 text-text-primary">Transcrição</h4>
                  <div className="bg-cream-50 rounded-lg p-4">
                    <p className="text-body text-text-secondary whitespace-pre-wrap">
                      {session.transcript}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card className="p-6">
            <h3 className="font-heading text-h4 text-text-primary mb-4">Dicas de Ouro</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-brand-500 mt-0.5" />
                <div>
                  <div className="font-medium text-text-primary text-sm">Seja Claro e Direto</div>
                  <div className="text-body-sm text-text-secondary">
                    Evite jargões e vá direto ao ponto.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-brand-500 mt-0.5" />
                <div>
                  <div className="font-medium text-text-primary text-sm">Controle o Tempo</div>
                  <div className="text-body-sm text-text-secondary">
                    Mantenha-se entre 45-75 segundos.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-brand-500 mt-0.5" />
                <div>
                  <div className="font-medium text-text-primary text-sm">Evite Preenchimentos</div>
                  <div className="text-body-sm text-text-secondary">
                    Reduza &quot;um&quot;, &quot;tipo&quot;, &quot;assim&quot;.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="font-heading text-h4 text-text-primary mb-4">Estatísticas</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">85%</div>
                <div className="text-body-sm text-text-secondary">Taxa de Melhoria</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-moss-600">12</div>
                <div className="text-body-sm text-text-secondary">Pitches Praticados</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-clay-600">4.5</div>
                <div className="text-body-sm text-text-secondary">Score Médio</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
