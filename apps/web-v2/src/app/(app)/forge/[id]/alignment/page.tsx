"use client";

import Link from "next/link";
import { Target, CheckCircle, AlertTriangle } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, ScoreBadge, EmptyState } from "@/components/ui";
import { checkAlignment } from "@/lib/analysis";

export default function AlignmentPage() {
  const { docId, doc } = useDocument();

  if (!doc) {
    return <EmptyState icon={Target} title="Documento não encontrado" action={<Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  const criteria = checkAlignment(doc.content, doc.targetProgram);
  const metCount = criteria.filter((c) => c.met).length;
  const score = criteria.length > 0 ? Math.round((metCount / criteria.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Alinhamento com Programa" subtitle={doc.title} backHref={`/forge/${docId}`} />

      <div className="card-surface p-6 text-center">
        <Target className="w-6 h-6 text-moss-500 mx-auto mb-2" />
        <p className="text-caption text-text-muted mb-1">Score de Alinhamento</p>
        <ScoreBadge score={score} size="display" />
        <p className="text-body-sm text-text-secondary mt-1">{metCount} de {criteria.length} critérios atendidos</p>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Critérios de Alinhamento</h3>
        <div className="space-y-3">
          {criteria.map((c) => (
            <div key={c.label} className={`p-4 rounded-lg ${c.met ? "bg-moss-50/50" : "bg-cream-50"}`}>
              <div className="flex items-start gap-3">
                {c.met ? <CheckCircle className="w-5 h-5 text-moss-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-clay-400 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-body-sm font-medium ${c.met ? "text-text-primary" : "text-text-secondary"}`}>{c.label}</p>
                  <p className="text-caption text-text-muted mt-0.5">{c.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
