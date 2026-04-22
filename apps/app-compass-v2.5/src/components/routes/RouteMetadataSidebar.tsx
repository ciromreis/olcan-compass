"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle,
  FileText,
} from "lucide-react";
import { MetadataSidebar, type MetadataSection } from "@/components/layout/MetadataSidebar";
import { Progress } from "@/components/ui";
import type { UserRoute, Milestone } from "@/stores/routes";

interface RouteMetadataSidebarProps {
  route: UserRoute;
  progress: number;
  completedMilestones: number;
  inProgressCount: number;
  pendingCount: number;
  probabilityScore: number;
  riskCount: number;
  blockedCount: number;
  nextMilestone: Milestone | null;
  onToggleMilestone: (milestoneId: string) => void;
}

export function RouteMetadataSidebar({
  route,
  progress,
  completedMilestones,
  inProgressCount,
  pendingCount,
  probabilityScore,
  riskCount,
  blockedCount,
  nextMilestone,
  onToggleMilestone,
}: RouteMetadataSidebarProps) {
  const sections: MetadataSection[] = [
    {
      title: "Detalhes da Rota",
      fields: [
        { label: "País", value: route.country, icon: MapPin },
        { label: "Timeline", value: route.timeline, icon: Clock },
        { label: "Orçamento", value: route.budget, icon: DollarSign },
        { label: "Tipo", value: route.type, icon: Target },
      ],
    },
    {
      title: "Status",
      fields: [
        { label: "Milestones", value: `${completedMilestones}/${route.milestones.length}` },
        { label: "Em andamento", value: inProgressCount },
        { label: "Pendentes", value: pendingCount },
        { label: "Dependências", value: blockedCount },
      ],
    },
  ];

  return (
    <MetadataSidebar
      sections={sections}
      extra={
        <>
          {/* Progress */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Progresso
              </span>
            </div>
            <p className="mb-2 text-3xl font-bold text-text-primary">{progress}%</p>
            <Progress value={progress} variant="moss" size="sm" />
            <p className="mt-2 text-xs text-text-muted">
              {completedMilestones}/{route.milestones.length} milestones concluídos
            </p>
          </div>

          {/* Probability */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Probabilidade
              </span>
            </div>
            <p
              className={`mb-2 text-3xl font-bold ${
                probabilityScore >= 60 ? "text-brand-500" : "text-slate-500"
              }`}
            >
              {probabilityScore}%
            </p>
            <p className="text-xs text-text-muted">Baseada no seu perfil e progresso</p>
          </div>

          {/* Risks */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${riskCount > 0 ? "text-clay-500" : "text-sage-500"}`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Riscos
              </span>
            </div>
            <p
              className={`mb-2 text-3xl font-bold ${
                riskCount > 0 ? "text-clay-500" : "text-sage-500"
              }`}
            >
              {riskCount}
            </p>
            <p className="text-xs text-text-muted">
              {riskCount > 0 ? "Deadlines próximos" : "Sem riscos imediatos"}
            </p>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-brand-500">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wider">Foco atual</p>
              </div>
              <h4 className="mb-2 text-sm font-semibold text-text-primary">{nextMilestone.name}</h4>
              <p className="mb-3 text-xs text-text-secondary">
                Próxima alavanca da sua rota em <strong>{route.country}</strong>.
              </p>
              <div className="mb-3 space-y-1 text-xs text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Etapa:</span>
                  <span className="font-medium text-text-primary">{nextMilestone.group}</span>
                </div>
                {nextMilestone.dueDate && (
                  <div className="flex items-center justify-between">
                    <span>Prazo:</span>
                    <span className="font-medium text-text-primary">
                      {new Date(nextMilestone.dueDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onToggleMilestone(nextMilestone.id)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Avançar milestone
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sprint CTA */}
          {progress < 60 && (
            <div className="rounded-2xl border border-brand-200 bg-white/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Acelere a execução
                </p>
              </div>
              <p className="mb-3 text-xs text-text-secondary">
                Crie um sprint de relocation para converter milestones em tarefas acionáveis.
              </p>
              <Link
                href="/sprints/new?template=relocation"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <Zap className="h-4 w-4" /> Criar Sprint
              </Link>
            </div>
          )}

          {/* Master Dossier Export CTA */}
          <div className="rounded-2xl border border-navy-900 bg-navy-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
                Plano Estratégico
              </p>
            </div>
            <p className="mb-3 text-xs text-slate-300">
              Exporte seu dossier completo com perfil, rota e documentos em PDF.
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/dossier-export`,
                    { credentials: 'include' }
                  );
                  if (!response.ok) throw new Error('Export failed');
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `olcan_dossier_${route.country.toLowerCase()}_${new Date().toISOString().split('T')[0]}.html`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (err) {
                  console.error('Dossier export failed:', err);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-400 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-accent-500"
            >
              <FileText className="h-4 w-4" /> Exportar Dossier
            </button>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Resumo Rápido
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total de etapas</span>
                <span className="font-medium text-text-primary">{route.milestones.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Concluídas</span>
                <span className="flex items-center gap-1 font-medium text-sage-500">
                  <CheckCircle className="h-3 w-3" />
                  {completedMilestones}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Em andamento</span>
                <span className="font-medium text-brand-500">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Pendentes</span>
                <span className="font-medium text-text-primary">{pendingCount}</span>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}
