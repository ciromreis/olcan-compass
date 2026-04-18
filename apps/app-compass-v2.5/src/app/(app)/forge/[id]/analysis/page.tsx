"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, ScoreBadge, EmptyState, PlanGate } from "@/components/ui";
import { useEntitlement } from "@/hooks";
import { forgeApi } from "@/lib/api";
import { scoreBarColor } from "@/lib/format";

interface AnalysisResult {
  clarity_score: number;
  coherence_score: number;
  authenticity_score: number;
  narrative_arc: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  suggested_edits: unknown[];
  overall_feedback: string;
  confidence: number;
}

export default function AnalysisPage() {
  const { docId, doc, stats } = useDocument();
  const { allowed } = useEntitlement("forge_ai_polish");
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc || !stats?.hasContent || !allowed) return;

    let isMounted = true;
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await forgeApi.analyzeDocument(docId);
        if (isMounted) setAnalysis(res.data);
      } catch (err: unknown) {
        console.error(err);
        if (isMounted) setError("Houve um problema ao focar no conteúdo. Tente novamente mais tarde.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalysis();

    return () => { isMounted = false; };
  }, [doc, docId, stats?.hasContent, allowed]);

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <PlanGate feature="forge_ai_polish" />
      </div>
    );
  }

  if (!doc || !stats) {
    return <EmptyState icon={Sparkles} title="Documento não encontrado" action={<Link href="/forge" className="text-brand-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  if (!stats.hasContent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Análise do Documento" subtitle={doc.title} backHref={`/forge/${docId}`} />
        <EmptyState icon={Sparkles} title="Conteúdo insuficiente" description="Escreva pelo menos 30 caracteres para receber uma análise." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Análise da Narrativa (IA)" subtitle={doc.title} backHref={`/forge/${docId}`} />

      {isLoading && (
        <div className="card-surface p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-text-primary font-medium">Analisando arquitetura da narrativa...</p>
          <p className="text-text-muted text-body-sm">Avaliando clareza, coerência e autenticidade.</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="card-surface p-6 border-clay-400">
          <h3 className="text-h5 text-clay-500 font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Falha na Análise
          </h3>
          <p className="text-text-secondary mt-2 text-center">{error}</p>
        </div>
      )}

      {analysis && !isLoading && (
        <>
          <div className="card-surface p-6 text-center">
            <Sparkles className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <p className="text-caption text-text-muted mb-1">Score Geral de Narrativa</p>
            <ScoreBadge 
              score={Math.round((analysis.clarity_score + analysis.coherence_score + analysis.authenticity_score) / 3)} 
              size="display" 
            />
            <p className="text-body-sm text-text-secondary mt-3 max-w-xl mx-auto">
              "{analysis.overall_feedback}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Clareza" score={analysis.clarity_score} />
            <MetricCard title="Coerência" score={analysis.coherence_score} />
            <MetricCard title="Autenticidade" score={analysis.authenticity_score} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-surface p-6">
              <h3 className="font-heading text-h5 text-text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Pontos Fortes
              </h3>
              <ul className="space-y-2">
                {analysis.key_strengths.map((str, i) => (
                  <li key={i} className="text-body-sm text-text-secondary flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span> {str}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card-surface p-6">
              <h3 className="font-heading text-h5 text-text-primary mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-clay-400" /> Áreas de Melhoria
              </h3>
              <ul className="space-y-2">
                {analysis.areas_for_improvement.map((str, i) => (
                  <li key={i} className="text-body-sm text-text-secondary flex items-start gap-2">
                    <span className="text-clay-500 font-bold">•</span> {str}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-text-primary">{title}</h4>
        <ScoreBadge score={score} size="md" highThreshold={75} midThreshold={60} />
      </div>
      <div className="h-2 bg-cream-300 rounded-full">
        <div className={`h-full rounded-full ${scoreBarColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
