"use client";

import { useState, useMemo } from "react";
import { Flag, CheckCircle, X } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: "Aberto", color: "text-clay-500" },
  investigating: { label: "Investigando", color: "text-clay-400" },
  resolved: { label: "Resolvido", color: "text-moss-500" },
  dismissed: { label: "Descartado", color: "text-text-muted" },
};

const TABS = [
  { key: "all", label: "Todos" },
  { key: "open", label: "Abertos" },
  { key: "investigating", label: "Investigando" },
  { key: "resolved", label: "Resolvidos" },
];

export default function AdminModerationPage() {
  const hydrated = useHydration();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { moderationCases, setModerationStatus } = useAdminStore();
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    if (tab === "all") return moderationCases;
    return moderationCases.filter((entry) => entry.status === tab);
  }, [moderationCases, tab]);

  const openCount = moderationCases.filter((entry) => entry.status !== "resolved" && entry.status !== "dismissed").length;

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-10" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Moderação" subtitle={`${openCount} casos abertos`} />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${tab === t.key ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Flag} title="Nenhum caso encontrado" description="Nenhum caso nesta categoria." />
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const st = STATUS_MAP[report.status] || STATUS_MAP.open;
            return (
              <div key={report.id} className={`card-surface p-6 border-l-4 ${report.severity === "high" ? "border-clay-500" : report.severity === "medium" ? "border-clay-300" : "border-cream-400"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-caption px-2 py-0.5 rounded-full bg-cream-200 text-text-muted font-medium">{report.type}</span>
                      <span className={`text-caption font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <h3 className="font-heading text-h4 text-text-primary">{report.subject}</h3>
                  </div>
                  <span className="text-caption text-text-muted">{formatDate(report.date)}</span>
                </div>
                <div className="flex gap-4 text-caption text-text-muted mb-3">
                  <span>Reportado por: {report.reporter}</span>
                  <span>Sobre: {report.reported}</span>
                </div>
                {report.status !== "resolved" && report.status !== "dismissed" && (
                  <div className="flex gap-2">
                    <button onClick={() => setModerationStatus(report.id, "resolved", actorEmail)} className="px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolver</button>
                    <button onClick={() => setModerationStatus(report.id, "investigating", actorEmail)} className="px-3 py-1.5 rounded-lg border border-cream-500 text-text-secondary text-caption font-medium hover:bg-cream-200 transition-colors flex items-center gap-1"><Flag className="w-3 h-3" /> Investigar</button>
                    <button onClick={() => setModerationStatus(report.id, "dismissed", actorEmail)} className="px-3 py-1.5 rounded-lg border border-cream-500 text-text-muted text-caption font-medium hover:bg-cream-200 transition-colors flex items-center gap-1"><X className="w-3 h-3" /> Descartar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
