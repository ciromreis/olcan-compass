"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Circle, ArrowRight, DollarSign, FileText, Languages, Brain, Truck, Zap } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import {
  hasOiosArchetypeEstablished,
  psychologicalReadinessScore,
  usePsychStore,
} from "@/stores/psych";
import { useHydration } from "@/hooks";
import { EmptyState, PageHeader, Progress, ProgressRing, Skeleton } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";

const DIMENSION_META: Record<string, { label: string; icon: typeof DollarSign; weight: number; sprintMatch: string; sprintTemplate: string | null }> = {
  financial: { label: "Financeira", icon: DollarSign, weight: 30, sprintMatch: "financ", sprintTemplate: "financial" },
  documental: { label: "Documental", icon: FileText, weight: 25, sprintMatch: "document", sprintTemplate: "documental" },
  linguistic: { label: "Linguística", icon: Languages, weight: 20, sprintMatch: "linguist", sprintTemplate: "linguistic" },
  psychological: { label: "Psicológica", icon: Brain, weight: 15, sprintMatch: "", sprintTemplate: "psychological" },
  logistical: { label: "Logística", icon: Truck, weight: 10, sprintMatch: "", sprintTemplate: "relocation" },
};

const RECOMMENDATIONS: Record<string, string[]> = {
  financial: [
    "Abrir conta Wise ou N26 para receber em moeda estrangeira e economizar em câmbio.",
    "Iniciar sprint de economia para atingir a reserva mínima de 6 meses.",
    "Consultar especialista financeiro sobre comprovação para visto (Marketplace).",
  ],
  documental: [
    "Usar o Forge para redigir e revisar cartas de motivação e CVs.",
    "Verificar deadlines de candidatura no calendário de aplicações.",
    "Solicitar tradução juramentada no Marketplace com antecedência.",
  ],
  linguistic: [
    "Praticar entrevistas no simulador para melhorar fluência.",
    "Agendar teste de proficiência (IELTS, TOEFL, TestDaF) o quanto antes.",
    "Buscar um coach de idiomas no Marketplace para preparação intensiva.",
  ],
  psychological: [
    "Fazer o diagnóstico de mobilidade e o mapeamento Likert de 8 blocos para calibrar prontidão e recomendações.",
    "Praticar entrevistas no simulador para reduzir ansiedade.",
    "Considerar apoio profissional de um psicólogo especializado em expatriação.",
  ],
  logistical: [
    "Mapear milestones da rota e definir prazos claros para cada etapa.",
    "Pesquisar moradia no destino com antecedência mínima de 3 meses.",
    "Contratar seguro viagem e garantir documentos de saúde em dia.",
  ],
};

export default function DimensionDetailPage() {
  const { dimension } = useParams<{ dimension: string }>();
  const hydrated = useHydration();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const {
    getOverallScore,
    isComplete,
    oiosAssessmentComplete,
    oiosSnapshot,
  } = usePsychStore();
  const hasOiosArchetype = hasOiosArchetypeEstablished({
    oiosAssessmentComplete,
    oiosSnapshot,
  });

  const meta = dimension ? DIMENSION_META[dimension] : null;

  const { score, tasks } = useMemo(() => {
    if (!hydrated || !meta) return { score: 0, tasks: [] as Array<{ name: string; done: boolean; sprint: string }> };

    if (dimension === "psychological") {
      const s = psychologicalReadinessScore(isComplete(), getOverallScore(), {
        oiosAssessmentComplete,
        oiosSnapshot,
      });
      return { score: s, tasks: [] };
    }
    if (dimension === "logistical") {
      const rp = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length) : 0;
      const milestones = routes.flatMap((r) => r.milestones.map((m) => ({ name: m.name, done: m.status === "completed", sprint: r.name })));
      return { score: Math.min(rp, 100), tasks: milestones };
    }

    const normalizedMatch = normalizeForComparison(meta.sprintMatch);
    const matching = sprints.filter((s) =>
      normalizeForComparison(s.dimension).includes(normalizedMatch)
    );
    if (matching.length === 0) return { score: 0, tasks: [] };
    const allTasks = matching.flatMap((s) => s.tasks.map((t) => ({ name: t.name, done: t.done, sprint: s.name })));
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.done).length;
    return { score: total > 0 ? Math.round((done / total) * 100) : 0, tasks: allTasks };
  }, [
    hydrated,
    meta,
    dimension,
    sprints,
    routes,
    getRouteProgress,
    getOverallScore,
    isComplete,
    oiosAssessmentComplete,
    oiosSnapshot,
  ]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div></div>;
  }

  if (!meta) {
    return <div className="max-w-4xl mx-auto py-12"><EmptyState icon={DollarSign} title="Dimensão não encontrada" action={<Link href="/readiness" className="px-4 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors">Voltar à Prontidão</Link>} /></div>;
  }

  const Icon = meta.icon;
  const doneTasks = tasks.filter((t) => t.done).length;
  const pendingTasks = tasks.filter((t) => !t.done).length;
  const recs = RECOMMENDATIONS[dimension!] ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title={meta.label} subtitle="Dimensão de Prontidão" />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <ProgressRing value={score} size={112} strokeWidth={8} variant="auto" className="mx-auto mb-3" />
          <div className="flex items-center justify-center gap-1.5 mb-2 text-body-sm font-medium text-text-primary">
            <Icon className="w-4 h-4 text-text-muted" />
            <span>Score</span>
          </div>
          <Progress value={score} size="sm" showLabel label={meta.label} variant={score >= 60 ? "moss" : "clay"} />
        </div>
        <div className="card-surface p-5 text-center">
          <p className="text-caption text-text-muted mb-1">Peso na Nota</p>
          <p className="font-heading text-h1 text-text-primary">{meta.weight}%</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="text-caption text-text-muted mb-1">Tarefas</p>
          <p className="font-heading text-h3 text-text-primary">{doneTasks}/{tasks.length}</p>
          <p className="text-caption text-text-muted mt-1">{pendingTasks} pendente{pendingTasks !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Tarefas / Indicadores</h3>
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={i} className="p-4 rounded-lg bg-cream-50 flex items-center gap-3">
                {t.done ? <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-cream-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-body-sm font-medium ${t.done ? "text-text-primary line-through opacity-60" : "text-text-primary"}`}>{t.name}</p>
                  <p className="text-caption text-text-muted">{t.sprint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && dimension !== "psychological" && meta.sprintTemplate && (
        <div className="card-surface p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-text-primary text-body-sm">Nenhum sprint ativo para esta dimensão</p>
            <p className="text-caption text-text-muted mt-0.5">Inicie um sprint para começar a registrar progresso aqui.</p>
          </div>
          <Link
            href={`/sprints/new?template=${meta.sprintTemplate}`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Iniciar Sprint <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {tasks.length === 0 && dimension === "psychological" && (
        <div className="space-y-4">
          {!hasOiosArchetype && (
            <div className="card-surface border border-brand-200 bg-brand-50/50 p-6">
              <p className="font-heading text-body-sm font-semibold text-text-primary">
                Diagnóstico de mobilidade pendente
              </p>
              <p className="mt-2 text-body-sm text-text-secondary">
                O diagnóstico alinha presença, simulador de entrevistas e mensagens ao seu perfil. Leva poucos minutos.
              </p>
              <Link
                href="/onboarding/quiz"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Fazer diagnóstico <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
          <div className="card-surface p-6 text-center">
            <Brain className="w-8 h-8 text-brand-500 mx-auto mb-3" />
            <p className="text-body text-text-secondary mb-3">
              {isComplete()
                ? `Seu score psicológico é ${score}. Refaça o diagnóstico para atualizar.`
                : hasOiosArchetype
                  ? "Diagnóstico inicial concluído. Complete o mapeamento Likert (8 blocos) em /profile/psych para o Score de Certeza completo."
                  : "Faça o diagnóstico de mobilidade e o mapeamento Likert para preencher esta dimensão."}
            </p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              {!hasOiosArchetype ? (
                <Link
                  href="/onboarding/quiz"
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-body-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Diagnóstico <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : null}
              <Link
                href="/profile/psych"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {isComplete() ? "Refazer diagnóstico Likert" : "Diagnóstico Likert (8 blocos)"}{" "}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {recs.length > 0 && (
        <div className="card-surface p-6 bg-cream-100">
          <h3 className="font-heading text-h4 text-text-primary mb-2">Recomendações</h3>
          <ul className="space-y-2 text-body-sm text-text-secondary">
            {recs.map((r, i) => (
              <li key={i} className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
