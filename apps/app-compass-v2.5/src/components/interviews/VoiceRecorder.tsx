"use client";

import { useState } from "react";
import { Mic, Square, Pause, Play, Trash2, Check, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/lib/audio-recorder";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // em milissegundos
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 180000, // 3 minutos padrão
  className = "",
}: VoiceRecorderProps) {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    isRecording,
    isPaused,
    duration,
    isSupported,
  } = useAudioRecorder();

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  const handleStop = async () => {
    try {
      const { blob, metadata: _metadata } = await stopRecording();
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Erro ao parar gravação:", error);
    }
  };

  const handleConfirm = () => {
    if (audioBlob) {
      setIsProcessing(true);
      onRecordingComplete(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    cancelRecording();
    onCancel?.();
  };

  const handleRetry = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = maxDuration ? (duration / maxDuration) * 100 : 0;
  const isMaxDurationReached = duration >= maxDuration;

  if (!isSupported) {
    return (
      <div className={cn("card-surface border border-clay-200 bg-clay-50/30 p-6 text-center", className)}>
        <p className="text-body-sm text-clay-700 mb-2">
          Gravação de áudio não suportada neste navegador
        </p>
        <p className="text-caption text-clay-600">
          Use Chrome, Firefox ou Edge para gravar suas respostas
        </p>
      </div>
    );
  }

  // Estado: Gravação concluída
  if (audioBlob && audioURL) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="card-surface border border-brand-200 bg-brand-50/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-body font-semibold text-text-primary">
              Gravação Concluída
            </h3>
            <span className="text-body-sm font-mono text-text-muted">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Audio Player */}
          <audio
            src={audioURL}
            controls
            className="w-full mb-4"
            style={{ height: "40px" }}
          />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRetry}
              variant="secondary"
              size="md"
              className="flex-1"
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4" />
              Gravar Novamente
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar Resposta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Gravando
  if (isRecording) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="card-surface border-2 border-clay-400 bg-gradient-to-br from-clay-50 to-white p-6">
          {/* Recording Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-clay-500 flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-white" />
              </div>
              {!isPaused && (
                <div className="absolute inset-0 rounded-full border-4 border-clay-500 animate-ping opacity-75" />
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="text-center mb-4">
            <div className="text-h2 font-heading font-bold text-text-primary mb-1">
              {formatDuration(duration)}
            </div>
            <p className="text-caption text-text-muted">
              {isPaused ? "Pausado" : "Gravando..."}
            </p>
          </div>

          {/* Progress Bar */}
          {maxDuration && (
            <div className="mb-6">
              <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isMaxDurationReached ? "bg-clay-500" : "bg-brand-500"
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-caption text-text-muted text-center mt-2">
                Máximo: {formatDuration(maxDuration)}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="md"
            >
              <Trash2 className="w-4 h-4" />
              Cancelar
            </Button>

            {isPaused ? (
              <Button
                onClick={resumeRecording}
                variant="primary"
                size="md"
              >
                <Play className="w-4 h-4" />
                Retomar
              </Button>
            ) : (
              <Button
                onClick={pauseRecording}
                variant="secondary"
                size="md"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}

            <Button
              onClick={handleStop}
              variant="primary"
              size="md"
              disabled={duration < 1000} // Mínimo 1 segundo
            >
              <Square className="w-4 h-4" />
              Finalizar
            </Button>
          </div>

          {isMaxDurationReached && (
            <div className="mt-4 p-3 rounded-lg bg-clay-100 border border-clay-300">
              <p className="text-caption text-clay-700 text-center">
                Tempo máximo atingido. Finalize a gravação.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado: Pronto para gravar
  return (
    <div className={cn("space-y-4", className)}>
      <div className="card-surface border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
          <Mic className="w-12 h-12 text-brand-500" />
        </div>

        <h3 className="font-heading text-h3 text-text-primary mb-2">
          Pronto para Gravar
        </h3>
        <p className="text-body-sm text-text-secondary mb-6 max-w-md mx-auto">
          Clique no botão abaixo para começar a gravar sua resposta. 
          Fale de forma clara e natural.
        </p>

        <Button
          onClick={handleStart}
          variant="primary"
          size="lg"
          className="mx-auto"
        >
          <Mic className="w-5 h-5" />
          Iniciar Gravação
        </Button>

        <div className="mt-6 pt-6 border-t border-cream-300">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-caption text-text-muted mb-1">Tempo Máximo</p>
              <p className="text-body-sm font-semibold text-text-primary">
                {formatDuration(maxDuration)}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-muted mb-1">Formato</p>
              <p className="text-body-sm font-semibold text-text-primary">
                Áudio
              </p>
            </div>
            <div>
              <p className="text-caption text-text-muted mb-1">Qualidade</p>
              <p className="text-body-sm font-semibold text-text-primary">
                Alta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card-surface border border-brand-100 bg-brand-50/30 p-4">
        <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-2">
          Dicas para uma boa gravação
        </h4>
        <ul className="space-y-1.5 text-caption text-text-secondary">
          <li>• Encontre um ambiente silencioso</li>
          <li>• Fale de forma clara e pausada</li>
          <li>• Mantenha o microfone próximo</li>
          <li>• Respire fundo antes de começar</li>
        </ul>
      </div>
    </div>
  );
}
