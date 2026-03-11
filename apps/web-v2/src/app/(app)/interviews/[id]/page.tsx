"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Star, BarChart3, MessageSquare, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { useInterviewStore } from "@/stores/interviews";
import { Progress } from "@/components/ui";

export default function InterviewResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { getSessionById, sessions } = useInterviewStore();
  const session = getSessionById(sessionId);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Sessão não encontrada.</p>
        <Link href="/interviews" className="text-moss-500 font-medium hover:underline">← Voltar</Link>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/interviews" className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><ArrowLeft className="w-5 h-5 text-text-muted" /></Link>
        <div>
          <h1 className="font-heading text-h2 text-text-primary">{session.typeLabel}</h1>
          <p className="text-body-sm text-text-secondary">
            {session.target} · {new Date(session.startedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card-surface p-5 text-center">
          <Star className="w-5 h-5 text-moss-500 mx-auto mb-1" />
          <p className={`font-heading text-h2 ${(session.overallScore || 0) >= 70 ? "text-moss-500" : "text-clay-500"}`}>
            {session.overallScore ?? "—"}
          </p>
          <p className="text-caption text-text-muted">Score Geral</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Clock className="w-5 h-5 text-text-muted mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{duration} min</p>
          <p className="text-caption text-text-muted">Duração</p>
        </div>
        <div className="card-surface p-5 text-center">
          <MessageSquare className="w-5 h-5 text-text-muted mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{session.answers.length}</p>
          <p className="text-caption text-text-muted">Perguntas</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${scoreDelta && scoreDelta > 0 ? "text-moss-500" : "text-text-muted"}`} />
          <p className={`font-heading text-h2 ${scoreDelta && scoreDelta > 0 ? "text-moss-500" : scoreDelta && scoreDelta < 0 ? "text-clay-500" : "text-text-muted"}`}>
            {scoreDelta !== null ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta}` : "—"}
          </p>
          <p className="text-caption text-text-muted">vs. sessão anterior</p>
        </div>
      </div>

      {/* Performance summary bar */}
      <div className="card-surface p-5 flex items-center gap-6">
        <div className="flex-1">
          <p className="text-body-sm font-medium text-text-primary mb-2">Distribuição de Performance</p>
          <Progress value={session.overallScore || 0} variant={(session.overallScore || 0) >= 70 ? "moss" : "clay"} size="md" />
        </div>
        <div className="flex gap-6 text-center flex-shrink-0">
          <div>
            <p className="font-heading text-h3 text-moss-500">{strongAnswers}</p>
            <p className="text-caption text-text-muted">Fortes</p>
          </div>
          <div>
            <p className="font-heading text-h3 text-clay-500">{weakAnswers}</p>
            <p className="text-caption text-text-muted">A melhorar</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href={`/interviews/${sessionId}/feedback`} className="card-surface p-4 flex items-center gap-3 hover:bg-cream-100 transition-colors">
          <BarChart3 className="w-5 h-5 text-moss-500" /><span className="text-body-sm font-medium text-text-primary">Feedback Detalhado</span><ArrowRight className="w-4 h-4 text-text-muted ml-auto" />
        </Link>
        <Link href={`/interviews/${sessionId}/session`} className="card-surface p-4 flex items-center gap-3 hover:bg-cream-100 transition-colors">
          <MessageSquare className="w-5 h-5 text-clay-500" /><span className="text-body-sm font-medium text-text-primary">Repetir Simulação</span><ArrowRight className="w-4 h-4 text-text-muted ml-auto" />
        </Link>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Respostas por Pergunta</h3>
        <div className="space-y-4">
          {session.answers.map((a, i) => (
            <div key={i} className="p-4 rounded-lg bg-cream-50">
              <div className="flex items-start justify-between mb-2">
                <p className="text-body-sm font-medium text-text-primary flex-1 pr-4">Q{i + 1}: {a.question}</p>
                <span className={`font-heading font-bold ${a.score >= 70 ? "text-moss-500" : "text-clay-500"}`}>{a.score}</span>
              </div>
              <p className="text-body-sm text-text-secondary flex items-start gap-2">
                {a.score >= 70 ? <Star className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-clay-400 mt-0.5 flex-shrink-0" />}
                {a.feedback}
              </p>
              {a.answer && (
                <details className="mt-2">
                  <summary className="text-caption text-moss-500 cursor-pointer hover:underline">Ver sua resposta ({a.timeSpent}s)</summary>
                  <p className="text-body-sm text-text-muted mt-1 p-2 bg-cream-100 rounded">{a.answer}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/interviews/new" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
          Nova Sessão
        </Link>
        <Link href={`/interviews/${sessionId}/session`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Repetir Sessão <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
