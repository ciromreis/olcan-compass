"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, Circle, Brain, Shield, TrendingUp, Target, Lightbulb, DollarSign, Clock, Heart } from "lucide-react";
import { usePsychStore, type Dimension } from "@/stores/psych";
import { Progress, ProgressRing } from "@/components/ui";

const DIMENSIONS: Array<{ key: Dimension; icon: typeof Shield; label: string }> = [
  { key: "confidence", icon: Shield, label: "Confiança" },
  { key: "risk", icon: TrendingUp, label: "Tolerância a Risco" },
  { key: "discipline", icon: Target, label: "Disciplina" },
  { key: "decisions", icon: Lightbulb, label: "Padrões de Decisão" },
  { key: "anxiety", icon: Heart, label: "Ansiedade" },
  { key: "goals", icon: Clock, label: "Clareza de Objetivos" },
  { key: "financial", icon: DollarSign, label: "Estresse Financeiro" },
];

export default function SummaryPage() {
  const { completedDimensions } = usePsychStore();
  const completedCount = DIMENSIONS.filter((d) => completedDimensions.includes(d.key)).length;
  const allComplete = completedCount === DIMENSIONS.length;
  const completionRate = Math.round((completedCount / DIMENSIONS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="card-surface p-8">
        <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-6 items-center">
          <div className="text-center">
            <ProgressRing value={completionRate} size={136} strokeWidth={10} variant="auto" className="mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 text-body-sm font-medium text-text-primary">
              <Brain className="w-4 h-4 text-moss-500" />
              <span>Diagnóstico psicológico</span>
            </div>
          </div>
          <div>
            <h2 className="font-heading text-h2 text-text-primary mb-2">
              {allComplete ? "Diagnóstico Completo!" : `${completedCount} de ${DIMENSIONS.length} dimensões`}
            </h2>
            <p className="text-body text-text-secondary mb-4">
              {allComplete
                ? "Todas as dimensões foram avaliadas. Clique em \"Ver Resultados\" para receber sua análise personalizada."
                : "Complete todas as dimensões para gerar seu diagnóstico completo."}
            </p>
            <Progress value={completionRate} size="sm" showLabel label="Avanço do diagnóstico" variant={allComplete ? "moss" : "clay"} />
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Dimensões Avaliadas</h3>
        <div className="space-y-3">
          {DIMENSIONS.map((d) => {
            const done = completedDimensions.includes(d.key);
            return (
              <div key={d.key} className={`flex items-center gap-3 p-3 rounded-lg ${done ? "bg-cream-100" : "bg-cream-50 opacity-60"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-moss-50" : "bg-cream-200"}`}>
                  <d.icon className={`w-4 h-4 ${done ? "text-moss-500" : "text-text-muted"}`} />
                </div>
                <span className="flex-1 text-body-sm font-medium text-text-primary">{d.label}</span>
                {done ? (
                  <span className="flex items-center gap-1 text-caption text-moss-500 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Completado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-caption text-text-muted">
                    <Circle className="w-3.5 h-3.5" /> Pendente
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Link href="/profile/psych/financial" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link href="/profile/psych/results" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-heading font-semibold text-body-sm transition-colors ${allComplete ? "bg-moss-500 text-white hover:bg-moss-600" : "bg-cream-300 text-text-muted cursor-not-allowed"}`}>
          Ver Resultados <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
