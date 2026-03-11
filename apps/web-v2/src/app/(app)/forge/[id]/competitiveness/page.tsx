"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, ScoreBadge, EmptyState } from "@/components/ui";
import { computeBenchmarks } from "@/lib/analysis";

export default function CompetitivenessPage() {
  const { docId, doc, stats } = useDocument();

  if (!doc || !stats) {
    return <EmptyState icon={Sparkles} title="Documento não encontrado" action={<Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  if (!stats.hasContent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Competitividade" backHref={`/forge/${docId}`} />
        <EmptyState icon={Sparkles} title="Conteúdo insuficiente" description="Escreva mais conteúdo para ver a análise de competitividade." />
      </div>
    );
  }

  const benchmarks = computeBenchmarks(doc.content);
  const avgYours = Math.round(benchmarks.reduce((s, b) => s + b.yours, 0) / benchmarks.length);
  const avgAverage = Math.round(benchmarks.reduce((s, b) => s + b.average, 0) / benchmarks.length);
  const avgTop10 = Math.round(benchmarks.reduce((s, b) => s + b.top10, 0) / benchmarks.length);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Competitividade" subtitle={doc.title} backHref={`/forge/${docId}`} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <p className="text-caption text-text-muted mb-1">Seu Score</p>
          <ScoreBadge score={avgYours} size="display" />
        </div>
        <div className="card-surface p-5 text-center">
          <p className="text-caption text-text-muted mb-1">Média Geral</p>
          <p className="font-heading text-display text-text-muted">{avgAverage}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="text-caption text-text-muted mb-1">Top 10%</p>
          <p className="font-heading text-display text-clay-500">{avgTop10}</p>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Benchmark por Métrica</h3>
        <div className="space-y-5">
          {benchmarks.map((b) => (
            <div key={b.metric}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium text-text-primary">{b.metric}</span>
                <div className="flex items-center gap-3 text-caption">
                  <span className="text-text-muted">Média: {b.average}</span>
                  <span className={`font-bold ${b.yours >= b.average ? "text-moss-500" : "text-clay-500"}`}>
                    {b.yours >= b.average ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    {b.yours}
                  </span>
                  <span className="text-clay-400">Top: {b.top10}</span>
                </div>
              </div>
              <div className="relative h-3 bg-cream-300 rounded-full overflow-hidden">
                <div className="absolute h-full bg-cream-400 rounded-full" style={{ width: `${b.average}%` }} />
                <div className={`absolute h-full rounded-full ${b.yours >= b.average ? "bg-moss-500" : "bg-clay-400"}`} style={{ width: `${b.yours}%` }} />
                <div className="absolute h-full w-0.5 bg-clay-600" style={{ left: `${b.top10}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 text-caption text-text-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-moss-500" /> Seu doc</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cream-400" /> Média</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-clay-600" /> Top 10%</span>
        </div>
      </div>
    </div>
  );
}
