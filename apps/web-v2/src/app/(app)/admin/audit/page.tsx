"use client";

import { useMemo, useState } from "react";
import { ScrollText, Download, Search, Trash2 } from "lucide-react";
import { useHydration } from "@/hooks";
import { ConfirmationModal, EmptyState, PageHeader, Skeleton, useToast } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/file-export";

const MODULE_LABELS: Record<string, string> = {
  users: "Usuários",
  providers: "Provedores",
  moderation: "Moderação",
  settings: "Configurações",
  ai: "IA",
  finance: "Financeiro",
  content: "Conteúdo",
};

export default function AdminAuditPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { auditLogs, clearAuditLogs } = useAdminStore();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [clearOpen, setClearOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...auditLogs].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    if (moduleFilter !== "all") {
      list = list.filter((entry) => entry.module === moduleFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((entry) =>
        entry.summary.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        entry.actor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [auditLogs, moduleFilter, query]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        backHref="/admin"
        title="Auditoria Operacional"
        subtitle={`${auditLogs.length} evento(s) registrado(s)`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (filtered.length === 0) return;
                const rows = [
                  ["Data", "Módulo", "Ação", "Alvo", "Ator", "Resumo"],
                  ...filtered.map((entry) => [
                    entry.at,
                    entry.module,
                    entry.action,
                    entry.target,
                    entry.actor,
                    entry.summary,
                  ]),
                ];
                downloadCsv(rows, "admin-audit-log.csv");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button
              onClick={() => setClearOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Limpar
            </button>
          </div>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por resumo, ação, alvo ou ator..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(event) => setModuleFilter(event.target.value)}
          className="px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-secondary text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="all">Todos os módulos</option>
          {Object.entries(MODULE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="Nenhum evento de auditoria" description="Ações administrativas registradas aparecerão aqui." />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Data</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Módulo</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Ação</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Alvo</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Ator</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Resumo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                  <td className="py-3 px-4 text-text-muted">{formatDate(entry.at)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-cream-200 px-2 py-0.5 text-caption text-text-muted">
                      {MODULE_LABELS[entry.module] || entry.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-caption text-text-primary">{entry.action}</td>
                  <td className="py-3 px-4 font-mono text-caption text-text-muted">{entry.target}</td>
                  <td className="py-3 px-4 text-text-secondary">{entry.actor}</td>
                  <td className="py-3 px-4 text-text-primary">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearAuditLogs();
          toast({
            title: "Logs limpos",
            description: "A trilha de auditoria local foi reiniciada.",
            variant: "warning",
          });
        }}
        title="Limpar trilha de auditoria?"
        description="Essa ação remove todos os eventos locais de auditoria desta sessão persistida."
        confirmLabel="Limpar logs"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
