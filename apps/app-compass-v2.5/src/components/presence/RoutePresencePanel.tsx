"use client";

import type { RoutePresenceSignal } from "@/lib/presence-phenotype";

interface RoutePresencePanelProps {
  signals: RoutePresenceSignal[];
  activeRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  title?: string;
  compact?: boolean;
}

function readinessTone(score: number): string {
  if (score >= 75) return "text-sage-600";
  if (score >= 50) return "text-brand-600";
  return "text-clay-600";
}

function readinessLabel(score: number): string {
  if (score >= 75) return "densa";
  if (score >= 50) return "em tração";
  return "em formação";
}

export function RoutePresencePanel({
  signals,
  activeRouteId,
  onSelectRoute,
  title = "Leituras por rota",
  compact = false,
}: RoutePresencePanelProps) {
  if (signals.length === 0) {
    return (
      <div className="card-surface p-5">
        <h3 className="font-heading text-h4 text-text-primary">{title}</h3>
        <p className="mt-2 text-body-sm text-text-muted">
          Quando suas rotas entrarem em operação, a presença passa a recombinar forma e prioridade por contexto.
        </p>
      </div>
    );
  }

  const active = signals.find((signal) => signal.routeId === activeRouteId) || signals[0];

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">{title}</h3>
          <p className="mt-1 text-body-sm text-text-muted">
            A forma muda conforme documento, entrevista, logística e urgência.
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 text-body-sm font-semibold uppercase tracking-wide ${readinessTone(active.adaptationLevel)}`}>
          {readinessLabel(active.adaptationLevel)}
        </div>
      </div>

      <div className={`mt-4 ${compact ? "space-y-2" : "space-y-3"}`}>
        {signals.map((signal) => {
          const isActive = signal.routeId === active.routeId;

          return (
            <button
              key={signal.routeId}
              type="button"
              onClick={() => onSelectRoute?.(signal.routeId)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-brand-200 bg-brand-50/70 shadow-sm"
                  : "border-cream-300/70 bg-white/60 hover:border-brand-100 hover:bg-brand-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">{signal.routeLabel}</p>
                  <p className="mt-1 text-caption text-text-muted">{signal.routeType}</p>
                </div>
                <div className={`text-body-sm font-semibold ${readinessTone(signal.adaptationLevel)}`}>
                  {signal.adaptationLevel}%
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-caption text-text-muted sm:grid-cols-4">
                <div>
                  <span className="block uppercase tracking-wide">Documento</span>
                  <span className="font-medium text-text-primary">{signal.documentReadiness}%</span>
                </div>
                <div>
                  <span className="block uppercase tracking-wide">Entrevista</span>
                  <span className="font-medium text-text-primary">{signal.interviewReadiness}%</span>
                </div>
                <div>
                  <span className="block uppercase tracking-wide">Logística</span>
                  <span className="font-medium text-text-primary">{signal.logisticsReadiness}%</span>
                </div>
                <div>
                  <span className="block uppercase tracking-wide">Urgência</span>
                  <span className="font-medium text-text-primary">{Math.round(signal.urgencyLevel * 100)}%</span>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
                <div
                  className={`h-full rounded-full ${
                    signal.adaptationLevel >= 75
                      ? "bg-gradient-to-r from-sage-500 to-sage-700"
                      : signal.adaptationLevel >= 50
                      ? "bg-gradient-to-r from-brand-500 to-navy-700"
                      : "bg-gradient-to-r from-clay-400 to-clay-600"
                  }`}
                  style={{ width: `${signal.adaptationLevel}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
