"use client";

import Link from "next/link";
import {
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  FileText,
  Calendar,
} from "lucide-react";
import { MetadataSidebar, type MetadataSection } from "@/components/layout/MetadataSidebar";
import { Progress } from "@/components/ui";
import type { InterviewSession } from "@/stores/interviews";

interface InterviewMetadataSidebarProps {
  session: InterviewSession;
  duration: number;
  scoreDelta: number | null;
  strongAnswers: number;
  weakAnswers: number;
}

export function InterviewMetadataSidebar({
  session,
  duration,
  scoreDelta,
  strongAnswers,
  weakAnswers,
}: InterviewMetadataSidebarProps) {
  const sections: MetadataSection[] = [
    {
      title: "Detalhes da Sessão",
      fields: [
        { label: "Tipo", value: session.typeLabel, icon: MessageSquare },
        { label: "Alvo", value: session.target, icon: FileText },
        {
          label: "Data",
          value: new Date(session.startedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          icon: Calendar,
        },
        { label: "Duração", value: `${duration} min`, icon: Clock },
      ],
    },
    {
      title: "Performance",
      fields: [
        { label: "Perguntas", value: session.answers.length },
        { label: "Respostas fortes", value: strongAnswers },
        { label: "A melhorar", value: weakAnswers },
      ],
    },
  ];

  return (
    <MetadataSidebar
      sections={sections}
      extra={
        <>
          {/* Overall Score */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Score Geral
              </span>
            </div>
            <p
              className={`mb-2 text-3xl font-bold ${
                (session.overallScore || 0) >= 70 ? "text-brand-500" : "text-clay-500"
              }`}
            >
              {session.overallScore ?? "—"}
            </p>
            <Progress
              value={session.overallScore || 0}
              variant={(session.overallScore || 0) >= 70 ? "moss" : "clay"}
              size="sm"
            />
            <p className="mt-2 text-xs text-text-muted">
              {(session.overallScore || 0) >= 70
                ? "Excelente performance!"
                : (session.overallScore || 0) >= 60
                ? "Boa performance, com espaço para melhorias."
                : "Continue praticando para melhorar."}
            </p>
          </div>

          {/* Score Delta */}
          {scoreDelta !== null && (
            <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp
                  className={`h-4 w-4 ${scoreDelta > 0 ? "text-brand-500" : "text-text-muted"}`}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Evolução
                </span>
              </div>
              <p
                className={`mb-2 text-3xl font-bold ${
                  scoreDelta > 0
                    ? "text-brand-500"
                    : scoreDelta < 0
                    ? "text-clay-500"
                    : "text-text-muted"
                }`}
              >
                {scoreDelta > 0 ? "+" : ""}
                {scoreDelta}
              </p>
              <p className="text-xs text-text-muted">
                {scoreDelta > 0
                  ? "Você melhorou desde a última sessão!"
                  : scoreDelta < 0
                  ? "Continue praticando para recuperar."
                  : "Manteve o mesmo nível."}
              </p>
            </div>
          )}

          {/* Performance Distribution */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Distribuição
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-brand-500" />
                  <span className="text-xs text-text-muted">Fortes (≥75)</span>
                </div>
                <span className="text-sm font-bold text-brand-500">{strongAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-clay-500" />
                  <span className="text-xs text-text-muted">A melhorar (&lt;60)</span>
                </div>
                <span className="text-sm font-bold text-clay-500">{weakAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted">Médias</span>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {session.answers.length - strongAnswers - weakAnswers}
                </span>
              </div>
            </div>
          </div>

          {/* Source Document Link */}
          {session.sourceDocumentId && session.sourceDocumentTitle && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Documento Origem
                </p>
              </div>
              <p className="mb-3 text-xs text-text-secondary">
                Esta sessão foi contextualizada a partir de:
              </p>
              <p className="mb-3 text-sm font-medium text-text-primary">
                {session.sourceDocumentTitle}
              </p>
              <Link
                href={`/forge/${session.sourceDocumentId}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <FileText className="h-4 w-4" />
                Abrir Documento
              </Link>
            </div>
          )}

          {/* Quick Tips */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Dicas Rápidas
            </h4>
            <div className="space-y-2 text-xs text-text-secondary">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-500">•</span>
                <span>Revise o feedback detalhado para identificar padrões</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-500">•</span>
                <span>Pratique respostas usando o método STAR</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-500">•</span>
                <span>Repita a sessão para consolidar melhorias</span>
              </p>
            </div>
          </div>
        </>
      }
    />
  );
}
