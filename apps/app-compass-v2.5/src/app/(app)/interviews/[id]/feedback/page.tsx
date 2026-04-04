"use client";

import Link from "next/link";
import { TrendingUp, Lightbulb, Star, AlertTriangle, MessageSquare } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { PageHeader, ScoreBadge, EmptyState } from "@/components/ui";
import { scoreBarColor } from "@/lib/format";
import type { InterviewSession } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";

function extractRelevantTerms(...values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .join(" ")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/\s+/)
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 5)
    )
  ).slice(0, 5);
}

function computeDimensions(session: InterviewSession, sourceContext?: { title?: string; target?: string; content?: string }) {
  const answers = session.answers;
  if (answers.length === 0) return [];

  const avgTime = answers.reduce((s, a) => s + a.timeSpent, 0) / answers.length;
  const avgScore = answers.reduce((s, a) => s + a.score, 0) / answers.length;
  const terms = extractRelevantTerms(sourceContext?.title, sourceContext?.target, sourceContext?.content?.slice(0, 180));
  const mentionHits = terms.length === 0
    ? 0
    : answers.filter((answer) => terms.some((term) => answer.answer.toLowerCase().includes(term))).length;
  const alignmentScore = terms.length === 0 ? null : Math.round((mentionHits / answers.length) * 100);

  const dimensions = [
    {
      label: "Qualidade das respostas",
      score: Math.round(avgScore),
      tip: avgScore >= 75
        ? "Suas respostas demonstram boa qualidade. Continue focando em exemplos concretos."
        : "Foque em estruturar melhor suas respostas. Use a técnica STAR: Situação, Tarefa, Ação, Resultado.",
    },
    {
      label: "Consistência",
      score: Math.round(100 - (answers.reduce((s, a) => s + Math.abs(a.score - avgScore), 0) / answers.length)),
      tip: "Mantenha um nível consistente entre todas as respostas. Variações grandes indicam pontos fracos específicos.",
    },
    {
      label: "Gestão do tempo",
      score: Math.round(Math.min(100, avgTime <= 90 ? 85 : avgTime <= 120 ? 75 : avgTime <= 180 ? 60 : 40)),
      tip: avgTime <= 120
        ? `Bom ritmo! Tempo médio de ${Math.round(avgTime)}s por resposta.`
        : `Tempo médio de ${Math.round(avgTime)}s por resposta. O ideal é 60–120 segundos.`,
    },
    {
      label: "Cobertura de conteúdo",
      score: Math.round(Math.min(100, (answers.filter((a) => a.answer.length > 100).length / answers.length) * 100)),
      tip: "Respostas mais desenvolvidas (>100 caracteres) demonstram maior profundidade de pensamento.",
    },
    {
      label: "Pontos fortes identificados",
      score: Math.round((answers.filter((a) => a.score >= 75).length / answers.length) * 100),
      tip: `${answers.filter((a) => a.score >= 75).length} de ${answers.length} respostas foram fortes. Replique o padrão dessas respostas nas demais.`,
    },
  ];

  if (alignmentScore !== null) {
    dimensions.push({
      label: "Aderência ao dossiê",
      score: alignmentScore,
      tip: alignmentScore >= 70
        ? "Sua fala retomou bem os sinais centrais do documento. Isso ajuda a transmitir coerência."
        : "Sua fala ainda não recupera com consistência os sinais centrais do documento. Vale revisar como transformar narrativa escrita em resposta oral.",
    });
  }

  return dimensions;
}

export default function FeedbackPage() {
  const { sessionId, session } = useSession();
  const { getDocById } = useForgeStore();

  if (!session) {
    return <EmptyState icon={MessageSquare} title="Sessão não encontrada" action={<Link href="/interviews" className="text-brand-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  const sourceDoc = session.sourceDocumentId ? getDocById(session.sourceDocumentId) : undefined;
  const dimensions = computeDimensions(session, {
    title: sourceDoc?.title || session.sourceDocumentTitle,
    target: sourceDoc?.targetProgram || session.target,
    content: sourceDoc?.content,
  });
  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 2);
  const strongest = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Feedback Detalhado" subtitle={`${session.typeLabel} — ${session.target}`} backHref={`/interviews/${sessionId}`} />

      {(sourceDoc || session.sourceDocumentTitle) && (
        <div className="card-surface border border-brand-100 bg-brand-50/40 p-5">
          <h3 className="font-heading text-h4 text-text-primary">Leitura cruzada com o documento</h3>
          <p className="mt-2 text-body-sm text-text-secondary">
            Este feedback considera a coerência entre sua resposta oral e o material preparado em <strong>{sourceDoc?.title || session.sourceDocumentTitle}</strong>.
          </p>
          {session.sourceDocumentId && (
            <Link href={`/forge/${session.sourceDocumentId}`} className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-brand-600 hover:text-brand-700">
              Voltar ao documento
            </Link>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <h4 className="text-body-sm font-heading font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-brand-500" /> Pontos fortes
          </h4>
          {strongest.map((d) => (
            <div key={d.label} className="flex items-center justify-between py-1.5">
              <span className="text-body-sm text-text-secondary">{d.label}</span>
              <span className="font-heading font-bold text-brand-500">{d.score}</span>
            </div>
          ))}
        </div>
        <div className="card-surface p-5">
          <h4 className="text-body-sm font-heading font-semibold text-text-primary mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-clay-500" /> A melhorar
          </h4>
          {weakest.map((d) => (
            <div key={d.label} className="flex items-center justify-between py-1.5">
              <span className="text-body-sm text-text-secondary">{d.label}</span>
              <span className="font-heading font-bold text-clay-500">{d.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {dimensions.map((d) => (
          <div key={d.label} className="card-surface p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-h4 text-text-primary">{d.label}</h3>
              <ScoreBadge score={d.score} size="lg" />
            </div>
            <div className="h-2 bg-cream-300 rounded-full mb-3">
              <div className={`h-full rounded-full ${scoreBarColor(d.score)}`} style={{ width: `${d.score}%` }} />
            </div>
            <div className="p-3 rounded-lg bg-cream-100 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="text-body-sm text-text-secondary">{d.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface p-6 bg-gradient-to-r from-brand-50 to-cream-100">
        <h3 className="font-heading text-h4 text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" /> Plano de Melhoria
        </h3>
        <ol className="space-y-2 text-body-sm text-text-secondary list-decimal list-inside">
          {weakest.map((w) => (
            <li key={w.label}>Foco em <strong>{w.label.toLowerCase()}</strong> (score atual: {w.score}) — {w.tip.split(".")[0]}.</li>
          ))}
          {session.sourceDocumentTitle && <li>Revise o documento-base e destaque 3 evidências que precisam aparecer de forma natural na sua fala.</li>}
          <li>Pratique opening statements para as 3 perguntas mais comuns</li>
          <li>Limite respostas a 2 minutos — use timer durante a prática</li>
        </ol>
      </div>

      <div className="flex gap-3">
        <Link href="/interviews/new" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
          Nova Sessão
        </Link>
        <Link href={`/interviews/${sessionId}/session`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors">
          Repetir Sessão
        </Link>
      </div>
    </div>
  );
}
