"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, ScoreBadge, EmptyState } from "@/components/ui";
import { analyzeContent } from "@/lib/analysis";
import { scoreBarColor } from "@/lib/format";

export default function AnalysisPage() {
  const { docId, doc, stats } = useDocument();

  if (!doc || !stats) {
    return <EmptyState icon={Sparkles} title="Documento não encontrado" action={<Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  if (!stats.hasContent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Análise do Documento" subtitle={doc.title} backHref={`/forge/${docId}`} />
        <EmptyState icon={Sparkles} title="Conteúdo insuficiente" description="Escreva pelo menos 30 caracteres para receber uma análise." />
      </div>
    );
  }

  const analysis = analyzeContent(doc.content);
  const avgScore = Math.round(analysis.reduce((s, a) => s + a.score, 0) / analysis.length);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Análise do Documento" subtitle={doc.title} backHref={`/forge/${docId}`} />

      <div className="card-surface p-6 text-center">
        <Sparkles className="w-6 h-6 text-moss-500 mx-auto mb-2" />
        <p className="text-caption text-text-muted mb-1">Score Geral</p>
        <ScoreBadge score={avgScore} size="display" />
        <p className="text-body-sm text-text-secondary mt-1">Score de competitividade: {doc.competitivenessScore ?? "—"}</p>
      </div>

      <div className="space-y-4">
        {analysis.map((item) => (
          <div key={item.category} className="card-surface p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-h4 text-text-primary">{item.category}</h3>
              <ScoreBadge score={item.score} size="md" highThreshold={75} midThreshold={60} className="after:content-['/100']" />
            </div>
            <div className="h-2 bg-cream-300 rounded-full mb-3">
              <div className={`h-full rounded-full ${scoreBarColor(item.score)}`} style={{ width: `${item.score}%` }} />
            </div>
            <p className="text-body-sm text-text-secondary flex items-start gap-2">
              {item.score >= 75 ? <CheckCircle className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-clay-400 mt-0.5 flex-shrink-0" />}
              {item.feedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
