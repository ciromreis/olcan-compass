"use client";

import { useEffect, useState } from "react";
import { Mic, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

interface InterviewFeedback {
  has_feedback: boolean;
  sessions_count: number;
  average_scores?: {
    overall: number;
    clarity: number;
    confidence: number;
  };
  suggestions: Array<{
    type: string;
    priority: string;
    suggestion: string;
  }>;
  latest_session_id?: string;
}

interface InterviewFeedbackPanelProps {
  documentId: string;
  className?: string;
}

export function InterviewFeedbackPanel({ documentId, className = "" }: InterviewFeedbackPanelProps) {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [documentId]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forge-interview/document/${documentId}/feedback`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Erro ao buscar feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("card-surface p-6", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-cream-200 rounded w-3/4"></div>
          <div className="h-4 bg-cream-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!feedback || !feedback.has_feedback) {
    return (
      <div className={cn("card-surface border border-brand-200 bg-brand-50/40 p-6", className)}>
        <div className="flex items-start gap-3">
          <Mic className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading text-body-sm font-semibold text-text-primary mb-2">
              Circuito Documento ↔ Entrevista
            </h3>
            <p className="text-caption text-text-secondary mb-3">
              Ainda não há treinos de entrevista vinculados a este documento. 
              Pratique entrevistas baseadas neste conteúdo para receber feedback personalizado.
            </p>
            <Button variant="secondary" size="sm">
              <Mic className="w-4 h-4" />
              Iniciar Treino Contextual
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { average_scores, suggestions, sessions_count, latest_session_id } = feedback;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="card-surface border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h3 className="font-heading text-h4 text-text-primary">
              Feedback de Entrevistas
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-caption font-bold">
            {sessions_count} {sessions_count === 1 ? "treino" : "treinos"}
          </span>
        </div>

        {average_scores && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className={cn(
                "text-h3 font-heading font-bold mb-1",
                average_scores.overall >= 70 ? "text-emerald-600" : "text-amber-600"
              )}>
                {average_scores.overall}
              </div>
              <p className="text-caption text-text-muted">Geral</p>
              <Progress 
                value={average_scores.overall} 
                variant={average_scores.overall >= 70 ? "moss" : "gradient"}
                size="sm"
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className={cn(
                "text-h3 font-heading font-bold mb-1",
                average_scores.clarity >= 70 ? "text-emerald-600" : "text-amber-600"
              )}>
                {average_scores.clarity}
              </div>
              <p className="text-caption text-text-muted">Clareza</p>
              <Progress 
                value={average_scores.clarity} 
                variant={average_scores.clarity >= 70 ? "moss" : "gradient"}
                size="sm"
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className={cn(
                "text-h3 font-heading font-bold mb-1",
                average_scores.confidence >= 70 ? "text-emerald-600" : "text-amber-600"
              )}>
                {average_scores.confidence}
              </div>
              <p className="text-caption text-text-muted">Confiança</p>
              <Progress 
                value={average_scores.confidence} 
                variant={average_scores.confidence >= 70 ? "moss" : "gradient"}
                size="sm"
                className="mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <h4 className="font-heading text-body-sm font-semibold text-text-primary">
              Sugestões para Melhorar o Documento
            </h4>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => {
              const Icon = suggestion.priority === "high" ? AlertCircle : CheckCircle2;
              const iconColor = suggestion.priority === "high" ? "text-clay-500" : "text-brand-500";
              
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-lg border",
                    suggestion.priority === "high" 
                      ? "border-clay-200 bg-clay-50/30" 
                      : "border-brand-200 bg-brand-50/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", iconColor)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-caption font-bold uppercase text-text-muted">
                          {suggestion.type}
                        </span>
                        {suggestion.priority === "high" && (
                          <span className="px-2 py-0.5 rounded-full bg-clay-100 text-clay-700 text-caption font-bold uppercase">
                            Prioritário
                          </span>
                        )}
                      </div>
                      <p className="text-caption text-text-secondary">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {latest_session_id && (
          <Button variant="secondary" size="sm" className="flex-1">
            Ver Último Feedback
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        <Button variant="primary" size="sm" className="flex-1">
          <Mic className="w-4 h-4" />
          Novo Treino
        </Button>
      </div>
    </div>
  );
}
