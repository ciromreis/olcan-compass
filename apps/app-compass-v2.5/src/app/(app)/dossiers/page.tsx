"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Briefcase,
  Search,
  Filter,
} from "lucide-react";
import { useDossierStore } from "@/stores/dossier";
import { useHydration } from "@/hooks";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DossierStatus } from "@/types/dossier-system";

export default function DossiersPage() {
  const router = useRouter();
  const hydrated = useHydration();
  
  const {
    dossiers,
    getActiveDossiers,
    getUpcomingDeadlines,
    getDossiersByStatus,
    createDossier,
    setCurrentDossier,
    loading,
  } = useDossierStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DossierStatus | "all">("all");

  useEffect(() => {
    // Sync from API when component mounts
    // syncFromApi();
  }, []);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeDossiers = getActiveDossiers();
  const upcomingDeadlines = getUpcomingDeadlines().slice(0, 3);

  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.opportunity.program?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDossier = async () => {
    const newDossier = await createDossier({
      title: "New Application Dossier",
      status: "draft",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    });
    
    setCurrentDossier(newDossier.id);
    router.push(`/dossiers/${newDossier.id}`);
  };

  const getStatusColor = (status: DossierStatus) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "in_progress":
        return "bg-brand-100 text-brand-700 border-brand-200";
      case "review":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "final":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "submitted":
        return "bg-sage-100 text-sage-700 border-sage-200";
      case "archived":
        return "bg-cream-100 text-cream-700 border-cream-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: DossierStatus) => {
    const labels: Record<DossierStatus, string> = {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      review: "Em Revisão",
      final: "Finalizado",
      submitted: "Enviado",
      archived: "Arquivado",
    };
    return labels[status];
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">Dossiers de Candidatura</h1>
          <p className="mt-1 text-body text-text-secondary">
            Gerencie seus pacotes completos de candidatura por oportunidade
          </p>
        </div>
        <Button
          onClick={handleCreateDossier}
          disabled={loading}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Dossier
        </Button>
      </div>

      {/* Stats Cards */}
      {activeDossiers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-cream-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-100 p-2">
                <Briefcase className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{activeDossiers.length}</p>
                <p className="text-xs text-text-muted">Dossiers Ativos</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {getDossiersByStatus("final").length + getDossiersByStatus("submitted").length}
                </p>
                <p className="text-xs text-text-muted">Finalizados</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {upcomingDeadlines.length}
                </p>
                <p className="text-xs text-text-muted">Prazos Próximos</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-100 p-2">
                <TrendingUp className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {Math.round(
                    activeDossiers.reduce((sum, d) => sum + (d.readiness?.overall || 0), 0) /
                      Math.max(activeDossiers.length, 1)
                  )}
                  %
                </p>
                <p className="text-xs text-text-muted">Prontidão Média</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines Alert */}
      {upcomingDeadlines.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-heading text-sm font-semibold text-amber-900">
                Prazos Próximos
              </h3>
              <div className="mt-2 space-y-2">
                {upcomingDeadlines.map(({ dossier, daysUntil }) => (
                  <Link
                    key={dossier.id}
                    href={`/dossiers/${dossier.id}`}
                    className="flex items-center justify-between rounded-lg bg-white p-2 text-sm hover:bg-amber-100"
                  >
                    <span className="font-medium text-text-primary">{dossier.title}</span>
                    <span className="text-xs text-amber-700">
                      {daysUntil === 0
                        ? "Hoje"
                        : daysUntil === 1
                        ? "Amanhã"
                        : `${daysUntil} dias`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DossierStatus | "all")}
          className="rounded-lg border border-cream-300 bg-white px-4 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">Todos os Status</option>
          <option value="draft">Rascunho</option>
          <option value="in_progress">Em Andamento</option>
          <option value="review">Em Revisão</option>
          <option value="final">Finalizado</option>
          <option value="submitted">Enviado</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Dossiers Grid */}
      {filteredDossiers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum dossier encontrado"
          description={
            dossiers.length === 0
              ? "Crie seu primeiro dossier de candidatura para começar"
              : "Nenhum dossier corresponde aos filtros selecionados"
          }
          action={
            dossiers.length === 0 ? (
              <Button onClick={handleCreateDossier} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Dossier
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDossiers.map((dossier) => {
            const daysUntil = getDaysUntilDeadline(dossier.deadline);
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;
            const isOverdue = daysUntil < 0;

            return (
              <Link
                key={dossier.id}
                href={`/dossiers/${dossier.id}`}
                className="group rounded-2xl border border-cream-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-lg"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold text-text-primary group-hover:text-brand-600">
                      {dossier.title}
                    </h3>
                    {dossier.opportunity.program && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {dossier.opportunity.program}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      getStatusColor(dossier.status)
                    )}
                  >
                    {getStatusLabel(dossier.status)}
                  </span>
                </div>

                {/* Stats */}
                <div className="mb-3 flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{dossier.documents.length} docs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{dossier.readiness?.overall || 0}% pronto</span>
                  </div>
                </div>

                {/* Deadline */}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 text-xs",
                    isOverdue
                      ? "border-clay-200 bg-clay-50 text-clay-700"
                      : isUrgent
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-cream-200 bg-cream-50 text-text-muted"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {isOverdue
                      ? `Atrasado ${Math.abs(daysUntil)} dias`
                      : daysUntil === 0
                      ? "Prazo hoje"
                      : daysUntil === 1
                      ? "Prazo amanhã"
                      : `${daysUntil} dias restantes`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
