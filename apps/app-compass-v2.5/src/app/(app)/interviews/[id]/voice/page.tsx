"use client";

import { useMemo } from "react";
import { Volume2, AlertTriangle, Mic } from "lucide-react";
import { useSession } from "@/hooks";
import { useHydration } from "@/hooks";
import { ComingSoonBanner } from "@/components/product/ComingSoonPanel";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

interface VoiceMetric { label: string; value: string; target: string; status: "ok" | "warn"; note: string }

export default function VoiceAnalysisPage() {
  const hydrated = useHydration();
  const { session, stats, sessionId } = useSession();

  const metrics = useMemo<VoiceMetric[]>(() => {
    if (!session || !stats) return [];
    const avgTimeSec = stats.avgTime;
    const avgTimeMin = (avgTimeSec / 60).toFixed(1);
    const wpm = Math.round(120 + (session.overallScore ?? 50) * 0.4);
    const fillers = Math.max(0, 15 - Math.round((session.overallScore ?? 50) / 8));
    const pauses = Math.max(0, 5 - Math.round((session.overallScore ?? 50) / 20));
    const volume = Math.min(100, 70 + Math.round((session.overallScore ?? 50) * 0.3));
    const confidence = Math.round((session.overallScore ?? 50) * 0.9);

    return [
      { label: "Ritmo de fala (WPM)", value: String(wpm), target: "120–160", status: wpm >= 120 && wpm <= 160 ? "ok" : "warn", note: wpm >= 120 && wpm <= 160 ? "Dentro do intervalo ideal para entrevistas." : "Fora do intervalo ideal. Pratique manter um ritmo constante." },
      { label: "Pausas longas (>3s)", value: String(pauses), target: "<2", status: pauses <= 2 ? "ok" : "warn", note: pauses <= 2 ? "Poucas pausas longas. Bom fluxo de fala." : "Pausas longas indicam incerteza. Prepare talking points antes." },
      { label: "Fillers (uh, um, like)", value: String(fillers), target: "<5", status: fillers <= 5 ? "ok" : "warn", note: fillers <= 5 ? "Uso controlado de fillers. Boa fluência." : "Alta frequência de fillers. Pratique pausas silenciosas." },
      { label: "Volume consistência", value: `${volume}%`, target: ">80%", status: volume >= 80 ? "ok" : "warn", note: volume >= 80 ? "Volume estável durante a sessão." : "Volume inconsistente. Mantenha uma projeção vocal constante." },
      { label: "Tom de confiança", value: `${confidence}/100`, target: ">70", status: confidence >= 70 ? "ok" : "warn", note: confidence >= 70 ? "Tom projetando confiança adequada." : "Tom descendente ao final de frases projeta insegurança." },
      { label: "Tempo médio de resposta", value: `${avgTimeMin} min`, target: "1.5–2 min", status: avgTimeSec >= 90 && avgTimeSec <= 120 ? "ok" : "warn", note: avgTimeSec > 120 ? "Respostas longas. Pratique versões condensadas." : avgTimeSec < 90 ? "Respostas curtas. Desenvolva mais suas ideias." : "Tempo de resposta ideal." },
    ];
  }, [session, stats]);

  const durationLabel = useMemo(() => {
    if (!stats) return "0:00";
    const m = stats.durationMin;
    return `${m}:00`;
  }, [stats]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-32" />{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (!session) {
    return <div className="max-w-4xl mx-auto"><EmptyState icon={Mic} title="Sessão não encontrada" description="Verifique o ID da sessão." /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref={`/interviews/${sessionId}`} title="Análise de Voz" subtitle={`Métricas vocais da sessão de ${formatDate(session.startedAt)}`} />

      <ComingSoonBanner
        title="Indicadores ilustrativos"
        description="Não há gravação de áudio nesta versão: as métricas abaixo são derivadas da pontuação geral da sessão para orientar prática. Análise vocal real virá em uma próxima entrega."
      />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-2">Waveform da Sessão</h3>
        <div className="h-24 bg-cream-100 rounded-lg flex items-center justify-center">
          <div className="flex items-end gap-0.5 h-16">
            {Array.from({ length: 60 }).map((_, i) => {
              const seed = ((i + 1) * 7 + (session.overallScore ?? 50)) % 100;
              return <div key={i} className="w-1 bg-brand-400 rounded-full" style={{ height: `${seed}%`, opacity: 0.5 + seed / 200 }} />;
            })}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-caption text-text-muted">
          <span>0:00</span><span>{durationLabel}</span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {m.status === "ok" ? <Volume2 className="w-4 h-4 text-brand-500" /> : <AlertTriangle className="w-4 h-4 text-clay-400" />}
                <h4 className="font-heading font-semibold text-text-primary">{m.label}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-heading font-bold ${m.status === "ok" ? "text-brand-500" : "text-clay-500"}`}>{m.value}</span>
                <span className="text-caption text-text-muted">meta: {m.target}</span>
              </div>
            </div>
            <p className="text-body-sm text-text-secondary">{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
