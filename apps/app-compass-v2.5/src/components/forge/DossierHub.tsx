"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Building,
  Target,
  Download,
  MoreVertical,
  ArrowRight,
  GitBranch,
  ListChecks,
  BarChart3,
  Layers,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useForgeStore, type ForgeDocument, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { useDossierStore } from "@/stores/dossier";
import type { Dossier } from "@/types/dossier-system";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { GlassCard } from "@/components/ui";

interface DossierHubProps {
  className?: string;
}

interface ProcessGroup {
  id: string;
  name: string;
  type: "scholarship" | "university" | "job" | "other";
  applications: UserApplication[];
  documents: ForgeDocument[];
  status: "active" | "completed" | "expired";
  deadline: Date | null;
}

export function DossierHub({ className = "" }: DossierHubProps) {
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const { documents } = useForgeStore();
  const { applications } = useApplicationStore();
  const { dossiers, getDossierById } = useDossierStore();

  const processGroups = useMemo((): ProcessGroup[] => {
    const groups: Map<string, ProcessGroup> = new Map();
    const now = new Date();

    applications.forEach((app) => {
      const key = app.id || app.opportunityId || `app-${app.program}`;
      const deadline = app.deadline ? new Date(app.deadline) : null;
      const daysUntil = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      const isExpired = deadline && deadline < now;
      const isCompleted = app.status === "submitted" || app.status === "accepted";
      
      const appDocs = documents.filter(
        (doc) => doc.opportunityIds?.includes(app.id || app.opportunityId || '')
      );

      const existing = groups.get(key);
      if (existing) {
        existing.applications.push(app);
        existing.documents.push(...appDocs);
      } else {
        groups.set(key, {
          id: key,
          name: app.program,
          type: app.type as ProcessGroup["type"],
          applications: [app],
          documents: appDocs,
          status: isCompleted ? "completed" : isExpired ? "expired" : "active",
          deadline: deadline,
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      if (!a.deadline && b.deadline) return 1;
      if (!b.deadline && a.deadline) return -1;
      return (a.deadline?.getTime() || 0) - (b.deadline?.getTime() || 0);
    });
  }, [applications, documents]);

  const stats = useMemo(() => {
    const totalApps = applications.length;
    const activeApps = applications.filter((a) => a.status !== "submitted" && a.status !== "accepted").length;
    const completedApps = applications.filter((a) => a.status === "submitted" || a.status === "accepted").length;
    const totalDocs = documents.length;
    const readyDocs = documents.filter((d) => d.readinessLevel === "export_ready" || d.readinessLevel === "submitted").length;
    const docsNeedingWork = totalDocs - readyDocs;
    
    return {
      totalApps,
      activeApps,
      completedApps,
      totalDocs,
      readyDocs,
      docsNeedingWork,
    };
  }, [applications, documents]);

  const getStatusColor = (status: ProcessGroup["status"]) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "completed": return "bg-brand-500";
      case "expired": return "bg-clay-500";
    }
  };

  const getStatusLabel = (status: ProcessGroup["status"]) => {
    switch (status) {
      case "active": return "Em Andamento";
      case "completed": return "Concluído";
      case "expired": return "Expirado";
    }
  };

  const getDaysUntil = (deadline: Date | null) => {
    if (!deadline) return null;
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-h2 text-[#001338]">Hub de Candidaturas</h2>
          <p className="mt-1 text-body-sm text-[#001338]/60">
            Gerencie todos os seus processos em paralelo
          </p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#001338] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Novo Processo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlassCard variant="olcan" padding="md" className="border-[#001338]/5 bg-white/60">
          <Target className="mb-2 h-5 w-5 text-brand-600" />
          <p className="font-heading text-h3 text-[#001338]">{stats.totalApps}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Processos</p>
        </GlassCard>
        <GlassCard variant="olcan" padding="md" className="border-[#001338]/5 bg-white/60">
          <Zap className="mb-2 h-5 w-5 text-emerald-600" />
          <p className="font-heading text-h3 text-[#001338]">{stats.activeApps}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Ativos</p>
        </GlassCard>
        <GlassCard variant="olcan" padding="md" className="border-[#001338]/5 bg-white/60">
          <CheckCircle className="mb-2 h-5 w-5 text-brand-600" />
          <p className="font-heading text-h3 text-[#001338]">{stats.completedApps}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Concluídos</p>
        </GlassCard>
        <GlassCard variant="olcan" padding="md" className="border-[#001338]/5 bg-white/60">
          <FileText className="mb-2 h-5 w-5 text-amber-600" />
          <p className="font-heading text-h3 text-[#001338]">{stats.docsNeedingWork}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Docs Pendentes</p>
        </GlassCard>
      </div>

      {processGroups.length === 0 ? (
        <GlassCard variant="olcan" padding="xl" className="border-[#001338]/10 border-dashed bg-transparent">
          <FolderOpen className="mx-auto mb-4 h-10 w-10 text-[#001338]/10" />
          <p className="font-heading text-h4 text-[#001338]">Nenhum processo ainda</p>
          <p className="mt-2 text-body-sm text-[#001338]/50">
            Adicione oportunidades para gerenciar seus processos em paralelo.
          </p>
          <Link
            href="/discovery"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <Users className="h-4 w-4" />
            Explorar Oportunidades
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {processGroups.map((group) => {
            const daysUntil = getDaysUntil(group.deadline);
            const isUrgent = daysUntil !== null && daysUntil <= 14 && daysUntil > 0;
            const isExpanded = expandedProcess === group.id;
            
            const processTypeIcon = {
              scholarship: Building,
              university: Users,
              job: Target,
              other: FolderOpen,
            }[group.type] || FolderOpen;
            const TypeIcon = processTypeIcon;

            return (
              <GlassCard
                key={group.id}
                variant="olcan"
                padding="none"
                className={cn(
                  "overflow-hidden border-[#001338]/5 transition-all",
                  isExpanded && "ring-2 ring-brand-500/20"
                )}
              >
                <button
                  onClick={() => setExpandedProcess(isExpanded ? null : group.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", getStatusColor(group.status))}>
                    <TypeIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-h4 text-[#001338] truncate">{group.name}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-caption font-bold uppercase tracking-wider text-white", getStatusColor(group.status))}>
                        {getStatusLabel(group.status)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-caption text-[#001338]/50">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {group.applications.length} aplicação{group.applications.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {group.documents.length} documento{group.documents.length !== 1 ? 's' : ''}
                      </span>
                      {daysUntil !== null && (
                        <span className={cn("flex items-center gap-1 font-semibold", isUrgent ? "text-amber-600" : "text-[#001338]/40")}>
                          <Clock className="h-3 w-3" />
                          {isUrgent ? `${daysUntil} dias` : formatRelativeTime(group.deadline!)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isUrgent && (
                      <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">Urgente</span>
                      </div>
                    )}
                    <ChevronRight className={cn("h-5 w-5 text-[#001338]/20 transition-transform", isExpanded && "rotate-90")} />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-cream-200 bg-cream-50/50 p-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.applications.map((app) => (
                        <Link
                          key={app.id}
                          href={`/applications/${app.id}`}
                          className="flex items-center gap-3 rounded-lg border border-cream-200 bg-white p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                        >
                          <ArrowRight className="h-4 w-4 text-brand-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#001338] truncate">{app.program}</p>
                            <p className="text-caption text-[#001338]/40">{app.country}</p>
                          </div>
                          <span className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                            app.status === "submitted" ? "bg-emerald-100 text-emerald-700" :
                            app.status === "accepted" ? "bg-brand-100 text-brand-700" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {app.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                    
                    {group.documents.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#001338]/40">
                          Documentos Vinculados
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {group.documents.map((doc) => (
                            <Link
                              key={doc.id}
                              href={`/forge/${doc.id}`}
                              className="flex items-center gap-2 rounded-lg border border-cream-200 bg-white p-2.5 transition-colors hover:border-brand-300"
                            >
                              <FileText className="h-4 w-4 text-[#001338]" />
                              <span className="flex-1 truncate text-sm font-medium text-[#001338]">{doc.title}</span>
                              {doc.readinessLevel === "export_ready" && (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/applications/${group.applications[0]?.id}/documents`}
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                      >
                        <FileText className="h-4 w-4" />
                        Gerenciar Docs
                      </Link>
                      <Link
                        href={`/applications/${group.applications[0]?.id}/export`}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#001338] px-3 py-2 text-sm font-semibold text-white hover:bg-[#001338]/90"
                      >
                        <Download className="h-4 w-4" />
                        Exportar Tudo
                      </Link>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}