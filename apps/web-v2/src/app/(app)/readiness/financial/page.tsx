"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, TrendingDown, Calculator, ArrowRight, CheckCircle, Circle, Zap } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useHydration } from "@/hooks";
import { PageHeader, Progress, ProgressRing, Skeleton } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";

const COST_BREAKDOWN = [
  { item: "Passagem aérea (ida)", value: 4000 },
  { item: "Visto e taxas consulares", value: 1500 },
  { item: "Seguro saúde (12 meses)", value: 6000 },
  { item: "Moradia inicial (3 meses depósito + aluguel)", value: 9000 },
  { item: "Custo de vida (3 meses reserva)", value: 12000 },
  { item: "Tradução juramentada de documentos", value: 1500 },
  { item: "Contingência (10%)", value: 2000 },
];

const TOTAL_COST = COST_BREAKDOWN.reduce((s, c) => s + c.value, 0);

export default function FinancialViabilityPage() {
  const hydrated = useHydration();
  const { sprints } = useSprintStore();

  const { score, tasks, doneTasks } = useMemo(() => {
    if (!hydrated) return { score: 0, tasks: [] as Array<{ name: string; done: boolean }>, doneTasks: 0 };
    const matching = sprints.filter((s) =>
      normalizeForComparison(s.dimension).includes(normalizeForComparison("financ"))
    );
    const allTasks = matching.flatMap((s) => s.tasks.map((t) => ({ name: t.name, done: t.done })));
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.done).length;
    return { score: total > 0 ? Math.round((done / total) * 100) : 0, tasks: allTasks, doneTasks: done };
  }, [hydrated, sprints]);

  const reserveEstimate = Math.round(TOTAL_COST * (score / 100));
  const gap = Math.max(0, TOTAL_COST - reserveEstimate);
  const monthlyRate = score > 0 ? Math.round(gap / Math.max(1, 6 - Math.floor(score / 20))) : 0;
  const coiPerDay = Math.max(15, Math.round(350 * (1 - score / 100)));

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title="Viabilidade Financeira" subtitle="Análise completa da sua situação financeira para a mudança" />

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card-surface p-5 text-center md:col-span-2">
          <ProgressRing value={score} size={112} strokeWidth={8} variant="auto" className="mx-auto mb-3" />
          <div className="flex items-center justify-center gap-1.5 mb-2 text-body-sm font-medium text-text-primary">
            <DollarSign className="w-4 h-4 text-text-muted" />
            <span>Score Financeiro</span>
          </div>
          <Progress value={score} size="sm" showLabel label="Prontidão financeira" variant={score >= 60 ? "moss" : "clay"} />
          <p className="text-caption text-text-muted mt-3">{doneTasks} de {tasks.length} tarefas concluídas</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingUp className="w-5 h-5 text-moss-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Reserva Estimada</p>
          <p className="font-heading text-h3 text-moss-500">R$ {reserveEstimate.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingDown className="w-5 h-5 text-clay-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Custo Total</p>
          <p className="font-heading text-h3 text-clay-500">R$ {TOTAL_COST.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Calculator className="w-5 h-5 text-clay-400 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Gap</p>
          <p className={`font-heading text-h3 ${gap === 0 ? "text-moss-500" : "text-clay-500"}`}>R$ {gap.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="card-surface p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-moss-50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-moss-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-text-primary text-body-sm">Nenhum sprint financeiro ativo</p>
            <p className="text-caption text-text-muted mt-0.5">Inicie um sprint para registrar progresso e calcular reservas reais.</p>
          </div>
          <Link
            href="/sprints/new?template=financial"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Iniciar Sprint <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-1">Tarefas Financeiras</h3>
          <p className="text-caption text-text-muted mb-4">{doneTasks} de {tasks.length} concluídas</p>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50">
                {t.done ? <CheckCircle className="w-4 h-4 text-moss-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-cream-500 flex-shrink-0" />}
                <span className={`text-body-sm ${t.done ? "text-text-muted line-through" : "text-text-primary"}`}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Decomposição de Custos</h3>
        <div className="space-y-3">
          {COST_BREAKDOWN.map((cost) => (
            <div key={cost.item} className="flex items-center justify-between p-3 rounded-lg bg-cream-50">
              <span className="text-body-sm text-text-primary">{cost.item}</span>
              <span className="text-body-sm font-bold text-text-primary">R$ {cost.value.toLocaleString("pt-BR")}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-lg bg-moss-50 border border-moss-200">
            <span className="text-body-sm font-bold text-text-primary">Total Estimado</span>
            <span className="text-body-sm font-bold text-moss-500">R$ {TOTAL_COST.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Custo de Inação (COI)</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-heading text-display text-clay-500">R$ {coiPerDay}</p>
            <p className="text-caption text-text-muted">por dia</p>
          </div>
          <div className="flex-1">
            <p className="text-body-sm text-text-secondary">Baseado na diferença salarial entre sua posição atual e a média para profissionais com qualificação internacional no mercado de destino.{monthlyRate > 0 && ` Para fechar o gap de R$ ${gap.toLocaleString("pt-BR")}, economize R$ ${monthlyRate.toLocaleString("pt-BR")}/mês.`}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/sprints/new?template=financial" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-moss-300 text-moss-600 font-medium hover:bg-moss-50 transition-colors">
          <Zap className="w-4 h-4" /> Novo Sprint
        </Link>
        <Link href="/readiness/gaps" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
          <Calculator className="w-4 h-4" /> Ver Gaps
        </Link>
        <Link href="/marketplace" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Consultar Especialista <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
