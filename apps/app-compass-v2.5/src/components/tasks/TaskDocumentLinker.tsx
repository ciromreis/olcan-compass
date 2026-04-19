/**
 * Task Document Linker
 * 
 * Allows linking tasks to documents for better workflow management.
 * Shows document readiness and allows quick navigation.
 */

import { useState } from "react";
import { FileText, Link2, Check, X, ChevronRight, AlertCircle } from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { cn } from "@/lib/utils";

interface TaskDocumentLinkerProps {
  selectedDocId?: string | null;
  onSelect?: (docId: string) => void;
  onClear?: () => void;
}

export function TaskDocumentLinker({
  selectedDocId,
  onSelect,
  onClear,
}: TaskDocumentLinkerProps) {
  const { documents } = useForgeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filteredDocs = search
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          DOC_TYPE_LABELS[d.type].toLowerCase().includes(search.toLowerCase())
      )
    : documents;
  
  const selectedDoc = selectedDocId
    ? documents.find((d) => d.id === selectedDocId)
    : null;
  
  // Sort docs: not ready first, then by updated
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    const aReady = a.readinessLevel === "export_ready" || a.readinessLevel === "submitted";
    const bReady = b.readinessLevel === "export_ready" || b.readinessLevel === "submitted";
    if (!aReady && bReady) return -1;
    if (aReady && !bReady) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  const getReadinessColor = (score: number | null) => {
    if (score === null) return "bg-slate-200";
    if (score >= 70) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-clay-500";
  };
  
  const getReadinessLabel = (score: number | null) => {
    if (score === null) return "Sem análise";
    if (score >= 70) return "Pronto";
    if (score >= 50) return "Em progresso";
    return "Precisa trabalho";
  };
  
  if (selectedDoc && !isOpen) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-sm font-medium text-text-primary">{selectedDoc.title}</p>
              <p className="text-xs text-text-muted">
                {DOC_TYPE_LABELS[selectedDoc.type]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedDoc.competitivenessScore !== null && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  selectedDoc.competitivenessScore >= 70
                    ? "bg-emerald-100 text-emerald-700"
                    : selectedDoc.competitivenessScore >= 50
                    ? "bg-amber-100 text-amber-700"
                    : "bg-clay-100 text-clay-700"
                )}
              >
                {selectedDoc.competitivenessScore}%
              </span>
            )}
            <button
              onClick={() => {
                onClear?.();
                setIsOpen(true);
              }}
              className="rounded p-1 hover:bg-brand-100"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        </div>
        <a
          href={`/forge/${selectedDoc.id}`}
          className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Abrir documento <ChevronRight className="h-3 w-3" />
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
          isOpen
            ? "border-brand-500 bg-brand-50"
            : "border-slate-200 hover:border-brand-300"
        )}
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-medium text-text-primary">
            Vincular documento (opcional)
          </span>
        </div>
        <ChevronRight
          className={cn("h-4 w-4 text-text-muted transition-transform", isOpen && "rotate-90")}
        />
      </button>
      
      {isOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            autoFocus
          />
          
          {sortedDocs.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              {documents.length === 0
                ? "Nenhum documento criado ainda"
                : "Nenhum documento encontrado"}
            </p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {sortedDocs.slice(0, 10).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelect?.(doc.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {DOC_TYPE_LABELS[doc.type]} · {doc.content.split(/\s+/).length} palavras
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.competitivenessScore !== null && (
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          getReadinessColor(doc.competitivenessScore)
                        )}
                        title={getReadinessLabel(doc.competitivenessScore)}
                      />
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {documents.length > 10 && (
            <p className="text-xs text-text-muted text-center">
              +{documents.length - 10} mais documentos
            </p>
          )}
          
          <a
            href="/forge/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            <FileText className="h-4 w-4" />
            Criar novo documento
          </a>
        </div>
      )}
    </div>
  );
}