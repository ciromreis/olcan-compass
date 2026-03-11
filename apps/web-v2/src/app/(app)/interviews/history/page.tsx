"use client";

import Link from "next/link";
import { TrendingUp, Calendar, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { useInterviewStore } from "@/stores/interviews";
import { PageHeader, ScoreBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default function InterviewHistoryPage() {
  const { sessions } = useInterviewStore();

  const completed = [...sessions]
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // Compute score trend
  const chronological = [...completed].reverse();
  const trendDelta = chronological.length >= 2
    ? (chronological[chronological.length - 1].overallScore || 0) - (chronological[0].overallScore || 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Histórico" subtitle="Evolução do seu desempenho ao longo das sessões" backHref="/interviews" />

      {chronological.length > 0 && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-h4 text-text-primary">Tendência de Score</h3>
            {trendDelta !== 0 && (
              <span className={`flex items-center gap-1 text-body-sm font-bold ${trendDelta > 0 ? "text-brand-500" : "text-clay-500"}`}>
                <TrendingUp className="w-4 h-4" /> {trendDelta > 0 ? "+" : ""}{trendDelta} pts em {chronological.length} sessões
              </span>
            )}
          </div>
          <div className="h-40 flex items-end gap-4 justify-center overflow-x-auto">
            {chronological.map((s) => (
              <Link key={s.id} href={`/interviews/${s.id}`} className="flex flex-col items-center gap-1 min-w-[3.5rem] hover:opacity-80 transition-opacity">
                <span className="text-caption font-bold text-text-primary">{s.overallScore ?? "—"}</span>
                <div
                  className={`w-14 rounded-t-lg ${(s.overallScore || 0) >= 70 ? "bg-brand-500" : "bg-clay-400"}`}
                  style={{ height: `${((s.overallScore || 0) / 100) * 120}px` }}
                />
                <span className="text-[10px] text-text-muted whitespace-nowrap">
                  {formatDate(s.startedAt, "short")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">
          {completed.length > 0 ? `Todas as Sessões (${completed.length})` : "Nenhuma sessão completada ainda"}
        </h3>
        {completed.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Nenhuma sessão completada" description="Complete sua primeira simulação de entrevista para ver o histórico." action={<Link href="/interviews/new" className="text-brand-500 font-medium hover:underline">Iniciar sessão →</Link>} />
        ) : (
          <div className="space-y-3">
            {completed.map((s, idx) => {
              const duration = s.completedAt
                ? Math.round((new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
                : 0;
              const prevScore = completed[idx + 1]?.overallScore;
              const delta = prevScore && s.overallScore ? s.overallScore - prevScore : null;

              return (
                <Link key={s.id} href={`/interviews/${s.id}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-cream-100 transition-colors group">
                  <div className="text-center w-12">
                    <ScoreBadge score={s.overallScore ?? null} size="lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-text-primary">{s.typeLabel}</p>
                    <div className="flex gap-3 text-caption text-text-muted">
                      <span>{s.target}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(s.startedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration} min</span>
                      <span>{s.answers.length} perguntas</span>
                    </div>
                  </div>
                  {delta !== null && (
                    <span className={`text-body-sm font-bold ${delta > 0 ? "text-brand-500" : delta < 0 ? "text-clay-500" : "text-text-muted"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
