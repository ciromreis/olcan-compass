"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, BarChart3, MessageSquare, ArrowRight, AlertTriangle } from "lucide-react";
import { useInterviewStore } from "@/stores/interviews";
import { DetailPageShell, interviewDetailTabs } from "@/components/layout/DetailPageShell";
import { InterviewMetadataSidebar } from "@/components/interviews/InterviewMetadataSidebar";

export default function InterviewResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { getSessionById, sessions } = useInterviewStore();
  const session = getSessionById(sessionId);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Sessão não encontrada.</p>
        <Link href="/interviews" className="text-brand-500 font-medium hover:underline">← Voltar</Link>
      </div>
    );
  }

  const duration = session.startedAt && session.completedAt
    ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    : 0;

  // Find previous session of same type for comparison
  const previousSessions = sessions
    .filter((s) => s.id !== sessionId && s.status === "completed" && s.type === session.type)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  const prevScore = previousSessions[0]?.overallScore;
  const scoreDelta = prevScore && session.overallScore ? session.overallScore - prevScore : null;

  // Per-answer analysis
  const strongAnswers = session.answers.filter((a) => a.score >= 75).length;
  const weakAnswers = session.answers.filter((a) => a.score < 60).length;

  // Subtitle with session metadata
  const subtitle = (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-text-secondary">
        {session.target} · {new Date(session.startedAt).toLocaleDateString("pt-BR")}
      </p>
      {session.sourceDocumentTitle && (
        <p className="text-xs text-text-muted">
          Contextualizada a partir de {session.sourceDocumentTitle}
        </p>
      )}
    </div>
  );

  // Action buttons
  const actions = (
    <>
      <Link
        href="/interviews/new"
        className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-cream-200"
      >
        Nova Sessão
      </Link>
      <Link
        href={`/interviews/${sessionId}/session`}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Repetir Sessão <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );

  return (
    <DetailPageShell
      backHref="/interviews"
      backLabel="Entrevistas"
      title={session.typeLabel}
      subtitle={subtitle}
      tabs={interviewDetailTabs(sessionId)}
      sidebar={
        <InterviewMetadataSidebar
          session={session}
          duration={duration}
          scoreDelta={scoreDelta}
          strongAnswers={strongAnswers}
          weakAnswers={weakAnswers}
        />
      }
      actions={actions}
    >
      {/* Quick navigation cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={`/interviews/${sessionId}/feedback`}
          className="card-surface flex items-center gap-3 p-4 transition-colors hover:bg-cream-100"
        >
          <BarChart3 className="h-5 w-5 text-brand-500" />
          <span className="text-sm font-medium text-text-primary">Feedback Detalhado</span>
          <ArrowRight className="ml-auto h-4 w-4 text-text-muted" />
        </Link>
        <Link
          href={`/interviews/${sessionId}/session`}
          className="card-surface flex items-center gap-3 p-4 transition-colors hover:bg-cream-100"
        >
          <MessageSquare className="h-5 w-5 text-clay-500" />
          <span className="text-sm font-medium text-text-primary">Repetir Simulação</span>
          <ArrowRight className="ml-auto h-4 w-4 text-text-muted" />
        </Link>
      </div>

      {/* Answers by question */}
      <div className="card-surface p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Respostas por Pergunta
        </h3>
        <div className="space-y-4">
          {session.answers.map((a, i) => (
            <div key={i} className="rounded-lg bg-cream-50 p-4">
              <div className="mb-2 flex items-start justify-between">
                <p className="flex-1 pr-4 text-sm font-medium text-text-primary">
                  Q{i + 1}: {a.question}
                </p>
                <span
                  className={`font-heading font-bold ${
                    a.score >= 70 ? "text-brand-500" : "text-clay-500"
                  }`}
                >
                  {a.score}
                </span>
              </div>
              <p className="flex items-start gap-2 text-sm text-text-secondary">
                {a.score >= 70 ? (
                  <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay-400" />
                )}
                {a.feedback}
              </p>
              {a.answer && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-brand-500 hover:underline">
                    Ver sua resposta ({a.timeSpent}s)
                  </summary>
                  <p className="mt-1 rounded bg-cream-100 p-2 text-sm text-text-muted">{a.answer}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </DetailPageShell>
  );
}
