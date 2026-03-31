"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Download, Gauge, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useHydration } from "@/hooks";
import { ConfirmationModal, PageHeader, Skeleton, useToast } from "@/components/ui";
import { downloadCsv } from "@/lib/file-export";
import { summarizeFrontendHealth, type VitalRating } from "@/lib/observability";
import { deriveObservabilityIncidents } from "@/lib/observability-incidents";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { useObservabilityStore } from "@/stores/observability";

type RowType = "error" | "vital";
type FilterType = "all" | RowType;

function getRatingColor(rating?: VitalRating): string {
  if (rating === "good") return "text-brand-500";
  if (rating === "needs-improvement") return "text-sage-500";
  if (rating === "poor") return "text-clay-500";
  return "text-text-muted";
}

function getIncidentSeverityColor(severity: "low" | "medium" | "high"): string {
  if (severity === "high") return "text-clay-500";
  if (severity === "medium") return "text-sage-500";
  return "text-text-muted";
}

function getIncidentStatusColor(status: "open" | "acknowledged" | "resolved"): string {
  if (status === "open") return "text-clay-500";
  if (status === "acknowledged") return "text-sage-500";
  return "text-brand-500";
}

export default function AdminObservabilityPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const actor = useAuthStore((state) => state.user?.email || "admin@olcan.com");
  const frontendErrors = useObservabilityStore((state) => state.frontendErrors);
  const webVitals = useObservabilityStore((state) => state.webVitals);
  const incidentStates = useObservabilityStore((state) => state.incidentStates);
  const setIncidentStatus = useObservabilityStore((state) => state.setIncidentStatus);
  const clearFrontendErrors = useObservabilityStore((state) => state.clearFrontendErrors);
  const clearWebVitals = useObservabilityStore((state) => state.clearWebVitals);
  const clearIncidentStates = useObservabilityStore((state) => state.clearIncidentStates);
  const logAdminAction = useAdminStore((state) => state.logAdminAction);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | VitalRating>("all");
  const [clearTarget, setClearTarget] = useState<"errors" | "vitals" | "incidents" | "all" | null>(null);

  const health = useMemo(
    () => summarizeFrontendHealth(frontendErrors, webVitals),
    [frontendErrors, webVitals]
  );
  const incidents = useMemo(
    () => deriveObservabilityIncidents(frontendErrors, webVitals, incidentStates),
    [frontendErrors, webVitals, incidentStates]
  );

  const rows = useMemo(() => {
    const errorRows = frontendErrors.map((event) => ({
      id: `err_${event.id}`,
      type: "error" as const,
      createdAt: event.createdAt,
      route: event.route || "rota desconhecida",
      rating: undefined,
      message: `${event.name}: ${event.message}`,
      exportName: event.name,
      exportValue: event.message,
      exportDelta: "",
    }));
    const vitalRows = webVitals.map((event) => ({
      id: `vital_${event.id}`,
      type: "vital" as const,
      createdAt: event.createdAt,
      route: event.route || "rota desconhecida",
      rating: event.rating,
      message: `${event.name}: ${event.value.toFixed(2)} (Δ ${event.delta.toFixed(2)})`,
      exportName: event.name,
      exportValue: event.value.toFixed(2),
      exportDelta: event.delta.toFixed(2),
    }));

    return [...errorRows, ...vitalRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [frontendErrors, webVitals]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (ratingFilter !== "all" && row.rating !== ratingFilter) return false;
      if (!normalizedSearch) return true;
      return [row.message, row.route, row.type].some((field) =>
        field.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [ratingFilter, rows, search, typeFilter]);

  const handleExport = (target: "errors" | "vitals" | "all") => {
    const selected =
      target === "errors"
        ? rows.filter((row) => row.type === "error")
        : target === "vitals"
          ? rows.filter((row) => row.type === "vital")
          : rows;

    if (selected.length === 0) {
      toast({
        title: "Nada para exportar",
        description: "Não há registros nesse recorte.",
        variant: "warning",
      });
      return;
    }

    downloadCsv(
      [
        ["tipo", "data", "rota", "nome", "valor", "delta", "rating"],
        ...selected.map((row) => [
          row.type,
          row.createdAt,
          row.route,
          row.exportName,
          row.exportValue,
          row.exportDelta,
          row.rating || "",
        ]),
      ],
      `observability-${target}-${new Date().toISOString().split("T")[0]}.csv`
    );

    logAdminAction({
      actor,
      module: "observability",
      action: "export_observability_report",
      target,
      summary: `Exportação de observabilidade (${target}) realizada.`,
    });
  };

  const handleExportIncidents = () => {
    if (incidents.length === 0) {
      toast({
        title: "Nada para exportar",
        description: "Não há incidentes ativos no momento.",
        variant: "warning",
      });
      return;
    }
    downloadCsv(
      [
        ["id", "tipo", "status", "severidade", "rota", "evidencias", "aberto_em", "ultimo_evento"],
        ...incidents.map((incident) => [
          incident.id,
          incident.type,
          incident.status,
          incident.severity,
          incident.route,
          incident.evidenceCount,
          incident.openedAt,
          incident.lastSeenAt,
        ]),
      ],
      `observability-incidents-${new Date().toISOString().split("T")[0]}.csv`
    );

    logAdminAction({
      actor,
      module: "observability",
      action: "export_incidents_report",
      target: "incidents",
      summary: `Exportação de incidentes (${incidents.length}) realizada.`,
    });
  };

  const handleIncidentStatus = (incidentId: string, status: "open" | "acknowledged" | "resolved") => {
    setIncidentStatus(incidentId, status, actor);
    logAdminAction({
      actor,
      module: "observability",
      action: "set_incident_status",
      target: incidentId,
      summary: `Incidente ${incidentId} atualizado para ${status}.`,
    });
    toast({
      title: "Status atualizado",
      description: `Incidente marcado como ${status}.`,
      variant: status === "resolved" ? "success" : "warning",
    });
  };

  const handleClear = () => {
    if (!clearTarget) return;
    if (clearTarget === "errors") clearFrontendErrors();
    if (clearTarget === "vitals") clearWebVitals();
    if (clearTarget === "incidents") clearIncidentStates();
    if (clearTarget === "all") {
      clearFrontendErrors();
      clearWebVitals();
      clearIncidentStates();
    }

    logAdminAction({
      actor,
      module: "observability",
      action: "clear_observability_logs",
      target: clearTarget,
      summary: `Limpeza de registros de observabilidade (${clearTarget}).`,
    });

    toast({
      title: "Registros removidos",
      description: "A limpeza foi concluída com sucesso.",
      variant: "warning",
    });
    setClearTarget(null);
  };

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        backHref="/admin"
        title="Observabilidade"
        subtitle="Triagem de erros frontend e qualidade de Web Vitals"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <AlertTriangle className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Erros totais</p>
          <p className="font-heading text-h2 text-text-primary">{health.totalErrors}</p>
        </div>
        <div className="card-surface p-5">
          <Activity className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Erros (24h)</p>
          <p className="font-heading text-h2 text-text-primary">{health.errorsLast24h}</p>
        </div>
        <div className="card-surface p-5">
          <Gauge className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Web Vitals (24h)</p>
          <p className="font-heading text-h2 text-text-primary">{health.vitalsLast24h}</p>
        </div>
        <div className="card-surface p-5">
          <Gauge className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Vitals críticos</p>
          <p className="font-heading text-h2 text-text-primary">{health.poorVitalsCount}</p>
        </div>
      </div>

      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-clay-500" />
            Incidentes Derivados
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportIncidents}
              className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-cream-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Exportar incidentes
            </button>
            <button
              onClick={() => setClearTarget("incidents")}
              className="inline-flex items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-caption font-medium text-clay-500 hover:bg-clay-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar estado de incidentes
            </button>
          </div>
        </div>

        {incidents.length === 0 ? (
          <p className="text-body-sm text-text-muted">Nenhum incidente ativo derivado dos dados das últimas 24h.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((incident) => (
              <div key={incident.id} className="rounded-lg border border-cream-300 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-body-sm font-medium text-text-primary">{incident.title}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-caption font-medium ${getIncidentSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`text-caption font-medium ${getIncidentStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-caption text-text-muted">{incident.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {incident.status !== "acknowledged" && (
                    <button
                      onClick={() => handleIncidentStatus(incident.id, "acknowledged")}
                      className="inline-flex items-center gap-1 rounded-md border border-cream-500 px-2 py-1 text-caption text-text-secondary hover:bg-cream-200 transition-colors"
                    >
                      <Activity className="w-3 h-3" /> Acknowledge
                    </button>
                  )}
                  {incident.status !== "resolved" && (
                    <button
                      onClick={() => handleIncidentStatus(incident.id, "resolved")}
                      className="inline-flex items-center gap-1 rounded-md border border-cream-500 px-2 py-1 text-caption text-text-secondary hover:bg-cream-200 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Resolver
                    </button>
                  )}
                  {incident.status !== "open" && (
                    <button
                      onClick={() => handleIncidentStatus(incident.id, "open")}
                      className="inline-flex items-center gap-1 rounded-md border border-cream-500 px-2 py-1 text-caption text-text-secondary hover:bg-cream-200 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3" /> Reabrir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-surface p-6 space-y-4">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por mensagem, rota ou tipo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as FilterType)}
            className="rounded-lg border border-cream-500 bg-white px-3 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="all">Todos os tipos</option>
            <option value="error">Erros</option>
            <option value="vital">Web Vitals</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value as "all" | VitalRating)}
            className="rounded-lg border border-cream-500 bg-white px-3 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="all">Todos os ratings</option>
            <option value="good">good</option>
            <option value="needs-improvement">needs-improvement</option>
            <option value="poor">poor</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport("all")}
            className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-cream-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Exportar tudo
          </button>
          <button
            onClick={() => handleExport("errors")}
            className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-cream-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Exportar erros
          </button>
          <button
            onClick={() => handleExport("vitals")}
            className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-cream-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Exportar vitals
          </button>
          <button
            onClick={() => setClearTarget("errors")}
            className="inline-flex items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-caption font-medium text-clay-500 hover:bg-clay-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar erros
          </button>
          <button
            onClick={() => setClearTarget("vitals")}
            className="inline-flex items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-caption font-medium text-clay-500 hover:bg-clay-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar vitals
          </button>
          <button
            onClick={() => setClearTarget("all")}
            className="inline-flex items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-caption font-medium text-clay-500 hover:bg-clay-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-2 text-text-muted font-medium">Data</th>
                <th className="text-left py-2 text-text-muted font-medium">Tipo</th>
                <th className="text-left py-2 text-text-muted font-medium">Evento</th>
                <th className="text-left py-2 text-text-muted font-medium">Rota</th>
                <th className="text-left py-2 text-text-muted font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-cream-200">
                    <td className="py-2.5 text-text-primary">
                      {new Date(row.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2.5 text-text-secondary">
                      {row.type === "error" ? "Erro" : "Web Vital"}
                    </td>
                    <td className="py-2.5 text-text-primary">{row.message}</td>
                    <td className="py-2.5 text-text-secondary">{row.route}</td>
                    <td className={`py-2.5 font-medium ${getRatingColor(row.rating)}`}>
                      {row.rating || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        open={Boolean(clearTarget)}
        onClose={() => setClearTarget(null)}
        onConfirm={handleClear}
        title="Limpar registros de observabilidade?"
        description="Essa ação remove os logs locais de erro e performance deste navegador."
        confirmLabel="Limpar registros"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
