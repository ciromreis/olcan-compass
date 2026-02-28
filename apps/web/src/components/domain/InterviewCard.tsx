import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface InterviewQuestion {
  id: string;
  question: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface InterviewCardProps {
  questions: InterviewQuestion[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  onResponseSubmit?: (questionId: string, response: string) => void;
  showTimer?: boolean;
  timerDuration?: number; // seconds
  className?: string;
}

export const InterviewCard: React.FC<InterviewCardProps> = ({
  questions,
  currentIndex = 0,
  onIndexChange,
  onResponseSubmit,
  showTimer = true,
  timerDuration = 120, // 2 minutes default
  className,
}) => {
  const [response, setResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(
    new Set()
  );

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const isCurrentSubmitted = currentQuestion
    ? submittedQuestions.has(currentQuestion.id)
    : false;

  // Timer logic
  useEffect(() => {
    if (!showTimer || !isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, isTimerRunning]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(timerDuration);
    setIsTimerRunning(false);
  }, [currentIndex, timerDuration]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      onIndexChange?.(currentIndex - 1);
      setResponse('');
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      onIndexChange?.(currentIndex + 1);
      setResponse('');
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || !response.trim()) return;

    onResponseSubmit?.(currentQuestion.id, response);
    setSubmittedQuestions((prev) => new Set(prev).add(currentQuestion.id));
    setIsTimerRunning(false);

    // Move to next question if not last
    if (!isLastQuestion) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!currentQuestion) {
    return (
      <Card className={cn('liquid-glass', className)} noPadding>
        <div className="p-6">
          <p className="text-center text-neutral-300">
          Nenhuma pergunta disponível
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('liquid-glass', className)} noPadding>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="lumina" size="sm">
                Pergunta {currentIndex + 1} de {questions.length}
              </Badge>
              {currentQuestion.category && (
                <Badge variant="default" size="sm">
                  {currentQuestion.category}
                </Badge>
              )}
              {currentQuestion.difficulty && (
                <Badge
                  variant={getDifficultyColor(currentQuestion.difficulty)}
                  size="sm"
                >
                  {currentQuestion.difficulty === 'easy'
                    ? 'Fácil'
                    : currentQuestion.difficulty === 'medium'
                    ? 'Médio'
                    : 'Difícil'}
                </Badge>
              )}
              {isCurrentSubmitted && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Respondida
                </Badge>
              )}
            </div>
          </div>

          {/* Timer */}
          {showTimer && (
            <div className="flex flex-col items-end gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border',
                  timeRemaining <= 30 && isTimerRunning
                    ? 'bg-error/10 text-error border-error/20'
                    : 'bg-white/5 text-neutral-200 border-white/10'
                )}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {!isTimerRunning && timeRemaining > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartTimer}
                >
                  Iniciar Timer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Question */}
        <div className="bg-lumina/10 border border-lumina/20 rounded-xl p-6">
          <p className="text-lg text-neutral-100 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Response Area */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-200">
            Sua Resposta
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            disabled={isCurrentSubmitted}
            className={cn(
              'w-full min-h-[200px] p-4 rounded-xl border border-white/10',
              'bg-neutral-900/30 text-neutral-100 placeholder:text-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-lumina-300 focus:border-lumina-300/40',
              'resize-y font-body text-base leading-relaxed',
              isCurrentSubmitted && 'opacity-50 cursor-not-allowed'
            )}
          />
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <span>{response.length} caracteres</span>
            <span>
              {response.trim().split(/\s+/).filter(Boolean).length} palavras
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {!isCurrentSubmitted && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={!response.trim()}
              >
                {isLastQuestion ? 'Finalizar' : 'Enviar e Próxima'}
              </Button>
            )}
            {!isLastQuestion && (
              <Button variant="secondary" size="sm" onClick={handleNext}>
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Progresso</span>
            <span>
              {submittedQuestions.size} / {questions.length} respondidas
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-lumina/70 to-lumina h-2 rounded-full transition-all"
              style={{
                width: `${(submittedQuestions.size / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
