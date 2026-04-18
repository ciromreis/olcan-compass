"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Copy, 
  Trash2, 
  Archive, 
  Download, 
  Eye, 
  MoreVertical,
  FileText,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { type ForgeDocument } from "@/stores/forge";
import { useForgeStore } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { cn } from "@/lib/utils";

interface DocumentManagementPanelProps {
  document: ForgeDocument;
  compact?: boolean;
}

export function DocumentManagementPanel({ document: doc, compact = false }: DocumentManagementPanelProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { deleteDocument, updateReadinessLevel } = useForgeStore();
  const { applications } = useApplicationStore();

  const boundApps = applications.filter(app => 
    doc.opportunityIds?.includes(app.opportunityId || '')
  );

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir "${doc.title}"?`)) {
      await deleteDocument(doc.id);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate
    alert("Duplicate coming soon!");
  };

  const handleExport = () => {
    // Create a simple text export
    const content = `${doc.title}\n\n${doc.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readinessIcon = {
    draft: <Clock className="h-4 w-4 text-slate-500" />,
    review: <AlertCircle className="h-4 w-4 text-amber-500" />,
    export_ready: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    submitted: <CheckCircle className="h-4 w-4 text-brand-500" />,
  };

  const readinessLabel = {
    draft: "Rascunho",
    review: "Em Revisão",
    export_ready: "Pronto para Exportar",
    submitted: "Enviado",
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/forge/${doc.id}`}
          className="rounded-lg p-2 text-text-muted hover:bg-cream-100 hover:text-brand-600"
          title="Editar"
        >
          <FileText className="h-4 w-4" />
        </Link>
        <button
          onClick={handleExport}
          className="rounded-lg p-2 text-text-muted hover:bg-cream-100 hover:text-brand-600"
          title="Exportar"
        >
          <Download className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-text-muted hover:bg-cream-100 hover:text-text-primary"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-cream-200 bg-white shadow-lg">
                <button
                  onClick={handleDuplicate}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-secondary hover:bg-cream-50"
                >
                  <Copy className="h-4 w-4" />
                  Duplicar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-600 hover:bg-clay-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-cream-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-muted">
          Gerenciar
        </h3>
      </div>

      {/* Readiness Status */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-text-muted">
          Status de Prontidão
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["draft", "review", "export_ready", "submitted"] as const).map((level) => (
            <button
              key={level}
              onClick={() => updateReadinessLevel(doc.id, level)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                doc.readinessLevel === level
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-cream-300 bg-white text-text-muted hover:border-brand-300 hover:bg-cream-50"
              )}
            >
              {readinessIcon[level]}
              <span className="truncate">{readinessLabel[level]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bound Opportunities - Compact */}
      {boundApps.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">
            <Briefcase className="mr-1 inline h-3 w-3" />
            {boundApps.length} candidatura{boundApps.length !== 1 ? 's' : ''}
          </label>
          <div className="space-y-1">
            {boundApps.slice(0, 2).map(app => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="block rounded-lg border border-cream-200 bg-cream-50 p-2 text-xs transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <p className="font-semibold text-text-primary truncate">{app.program}</p>
                {app.deadline && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(app.deadline).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </Link>
            ))}
            {boundApps.length > 2 && (
              <p className="text-xs text-text-muted text-center py-1">+{boundApps.length - 2} mais</p>
            )}
          </div>
        </div>
      )}

      {/* Actions - Compact */}
      <div className="space-y-1.5 border-t border-cream-200 pt-3">
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-2 rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </button>
        <button
          onClick={handleDuplicate}
          className="flex w-full items-center gap-2 rounded-lg border border-cream-300 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-cream-50"
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicar
        </button>
        <button
          onClick={handleDelete}
          className="flex w-full items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-xs font-medium text-clay-600 hover:bg-clay-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </button>
      </div>
    </div>
  );
}
