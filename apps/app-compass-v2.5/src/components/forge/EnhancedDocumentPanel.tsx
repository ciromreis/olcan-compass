"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Copy,
  Trash2,
  Download,
  Send,
  ArrowRight,
  MoreVertical,
  GitBranch,
  History,
  MessageSquare,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Building,
  Plus,
  Wand2,
  Layers,
  FileEdit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useForgeStore, type ForgeDocument, type DocType, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { useDossierStore } from "@/stores/dossier";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

interface EnhancedDocumentPanelProps {
  document: ForgeDocument;
  className?: string;
}

const READINESS_OPTIONS = [
  { id: "draft", label: "Rascunho", icon: Clock, color: "text-slate-500" },
  { id: "review", label: "Em Revisão", icon: AlertCircle, color: "text-amber-500" },
  { id: "export_ready", label: "Pronto", icon: CheckCircle, color: "text-emerald-500" },
  { id: "submitted", label: "Enviado", icon: Send, color: "text-brand-500" },
] as const;

export function EnhancedDocumentPanel({ document: doc, className = "" }: EnhancedDocumentPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { deleteDocument, updateReadinessLevel, bindToOpportunity, unbindFromOpportunity, getDocsByOpportunity } = useForgeStore();
  const { applications } = useApplicationStore();
  const { dossiers, getDossierById } = useDossierStore();

  const boundOpportunities = useMemo(() => {
    if (!doc.opportunityIds?.length) return [];
    return applications.filter(app => 
      doc.opportunityIds?.includes(app.id || app.opportunityId || '')
    );
  }, [applications, doc.opportunityIds]);

  const relatedDocuments = useMemo(() => {
    if (!doc.opportunityIds?.length) return [];
    const related: ForgeDocument[] = [];
    doc.opportunityIds.forEach(oppId => {
      const docs = getDocsByOpportunity(oppId);
      related.push(...docs.filter(d => d.id !== doc.id));
    });
    return related;
  }, [doc.opportunityIds, getDocsByOpportunity]);

  const variationsCount = relatedDocuments.length;

  const handleDelete = async () => {
    if (confirm(`Excluir "${doc.title}"? Esta ação não pode ser desfeita.`)) {
      await deleteDocument(doc.id);
    }
  };

  const handleDuplicate = async () => {
    const newTitle = `${doc.title} (cópia)`;
    const { createDocument, updateContent } = useForgeStore.getState();
    const newId = await createDocument({
      title: newTitle,
      type: doc.type,
      targetProgram: doc.targetProgram,
      language: doc.language,
      scope: doc.scope,
      primaryOpportunityId: doc.primaryOpportunityId || undefined,
      opportunityIds: doc.opportunityIds,
    });
    if (newId) {
      await updateContent(newId, doc.content);
    }
    setMenuOpen(false);
  };

  const handleCreateVariation = async () => {
    const { createDocument, updateContent } = useForgeStore.getState();
    const baseTitle = doc.title.split(" — ")[0] || doc.title;
    const variantTitle = `${baseTitle} — Nova Variação`;
    const newId = await createDocument({
      title: variantTitle,
      type: doc.type,
      targetProgram: doc.targetProgram,
      language: doc.language,
    });
    if (newId) {
      await updateContent(newId, doc.content);
    }
    setMenuOpen(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#001338]/5">
            <FileText className="h-6 w-6 text-[#001338]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-h4 text-[#001338] truncate">{doc.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#001338]/5 px-2.5 py-0.5 text-caption font-bold uppercase tracking-wider text-[#001338]/60">
                    {DOC_TYPE_LABELS[doc.type]}
                  </span>
                  {doc.targetProgram && (
                    <span className="flex items-center gap-1 text-caption text-[#001338]/40">
                      <Target className="h-3 w-3" />
                      {doc.targetProgram}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-cream-200 bg-white py-1 shadow-lg">
                        <Link
                          href={`/forge/${doc.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-cream-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          <FileEdit className="h-4 w-4" />
                          Editar Documento
                        </Link>
                        <button
                          onClick={handleDuplicate}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-cream-50"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicar
                        </button>
                        <button
                          onClick={handleCreateVariation}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-cream-50"
                        >
                          <GitBranch className="h-4 w-4" />
                          Criar Variação
                        </button>
                        <Link
                          href={`/forge/${doc.id}/versions`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-cream-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          <History className="h-4 w-4" />
                          Ver Versões
                        </Link>
                        <Link
                          href={`/forge/${doc.id}/coach`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-cream-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Coach IA
                        </Link>
                        <hr className="my-1 border-cream-200" />
                        <button
                          onClick={handleDelete}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-clay-600 hover:bg-clay-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {doc.competitivenessScore !== null && (
                <div className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1",
                  doc.competitivenessScore >= 70 ? "bg-emerald-50" : "bg-slate-50"
                )}>
                  <Target className={cn("h-3.5 w-3.5", doc.competitivenessScore >= 70 ? "text-emerald-600" : "text-slate-500")} />
                  <span className={cn("text-sm font-semibold", doc.competitivenessScore >= 70 ? "text-emerald-700" : "text-slate-600")}>
                    {doc.competitivenessScore}%
                  </span>
                </div>
              )}
              {variationsCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1">
                  <Layers className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-sm font-semibold text-brand-700">{variationsCount} variações</span>
                </div>
              )}
              {boundOpportunities.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1">
                  <Building className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">{boundOpportunities.length} processos</span>
                </div>
              )}
            </div>

            {expanded && (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status de Prontidão
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {READINESS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateReadinessLevel(doc.id, opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors",
                          doc.readinessLevel === opt.id
                            ? "border-[#001338] bg-[#001338] text-white"
                            : "border-cream-300 text-text-muted hover:border-brand-300 hover:bg-cream-50"
                        )}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/forge/${doc.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#001338] px-4 py-2 text-sm font-semibold text-white hover:bg-[#001338]/90"
                  >
                    <FileEdit className="h-4 w-4" />
                    Editar
                  </Link>
                  <Link
                    href={`/forge/${doc.id}/export`}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-500 bg-white px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Link>
                  <Link
                    href={`/forge/${doc.id}/coach`}
                    className="inline-flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-cream-50"
                  >
                    <Wand2 className="h-4 w-4" />
                    IA Coach
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

interface DocumentCardsGridProps {
  documents: ForgeDocument[];
  className?: string;
}

export function DocumentCardsGrid({ documents, className = "" }: DocumentCardsGridProps) {
  if (documents.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <FileText className="mx-auto h-12 w-12 text-[#001338]/10" />
        <p className="mt-4 font-heading text-h4 text-[#001338]">Nenhum documento ainda</p>
        <p className="mt-2 text-body-sm text-[#001338]/40">
          Crie seu primeiro documento no Forge para começar.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {documents.map((doc) => (
        <EnhancedDocumentPanel key={doc.id} document={doc} />
      ))}
    </div>
  );
}