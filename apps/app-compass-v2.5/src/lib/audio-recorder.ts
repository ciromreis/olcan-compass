/**
 * Audio Recorder Utility
 * Inspirado em: Antriview e FoloUp
 * 
 * Grava áudio no navegador usando Web Audio API
 * para entrevistas por voz com análise de IA
 */

import { useState, useEffect } from 'react';

export interface AudioRecorderConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  onDataAvailable?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export interface RecordingMetadata {
  duration: number;
  size: number;
  mimeType: string;
  timestamp: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private config: AudioRecorderConfig;

  constructor(config: AudioRecorderConfig = {}) {
    this.config = {
      mimeType: config.mimeType || 'audio/webm',
      audioBitsPerSecond: config.audioBitsPerSecond || 128000,
      onDataAvailable: config.onDataAvailable,
      onError: config.onError,
    };
  }

  /**
   * Solicita permissão e inicia gravação
   */
  async startRecording(): Promise<void> {
    try {
      // Solicitar permissão de microfone
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Verificar suporte ao mimeType
      const mimeType = this.getSupportedMimeType();
      
      // Criar MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      });

      // Reset chunks
      this.audioChunks = [];
      this.startTime = Date.now();

      // Event listeners
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.config.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        this.config.onError?.(error);
      };

      // Iniciar gravação
      this.mediaRecorder.start(1000); // Chunks de 1 segundo
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.config.onError?.(err);
      throw err;
    }
  }

  /**
   * Para a gravação e retorna o áudio
   */
  async stopRecording(): Promise<{ blob: Blob; metadata: RecordingMetadata }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        
        const metadata: RecordingMetadata = {
          duration: Date.now() - this.startTime,
          size: blob.size,
          mimeType: blob.type,
          timestamp: this.startTime,
        };

        // Limpar recursos
        this.cleanup();

        resolve({ blob, metadata });
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pausa a gravação
   */
  pauseRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume a gravação
   */
  resumeRecording(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Cancela a gravação sem salvar
   */
  cancelRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.audioChunks = [];
      this.cleanup();
    }
  }

  /**
   * Verifica se está gravando
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Verifica se está pausado
   */
  isPaused(): boolean {
    return this.mediaRecorder?.state === 'paused';
  }

  /**
   * Obtém duração atual da gravação
   */
  getCurrentDuration(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Limpa recursos
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }

  /**
   * Obtém mimeType suportado pelo navegador
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Verifica se o navegador suporta gravação
   */
  static isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  /**
   * Converte Blob para Base64
   */
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:audio/webm;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Converte Blob para ArrayBuffer
   */
  static async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return await blob.arrayBuffer();
  }

  /**
   * Cria URL temporária para playback
   */
  static createAudioURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Revoga URL temporária
   */
  static revokeAudioURL(url: string): void {
    URL.revokeObjectURL(url);
  }
}

/**
 * Hook React para usar AudioRecorder
 */
export function useAudioRecorder(config: AudioRecorderConfig = {}) {
  const [recorder] = useState(() => new AudioRecorder(config));
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(recorder.getCurrentDuration());
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, recorder]);

  const startRecording = async () => {
    await recorder.startRecording();
    setIsRecording(true);
    setIsPaused(false);
  };

  const stopRecording = async () => {
    const result = await recorder.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    return result;
  };

  const pauseRecording = () => {
    recorder.pauseRecording();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    recorder.resumeRecording();
    setIsPaused(false);
  };

  const cancelRecording = () => {
    recorder.cancelRecording();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  };

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    isRecording,
    isPaused,
    duration,
    isSupported: AudioRecorder.isSupported(),
  };
}
