"use client";

import { useState, useMemo, useId } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  FileText,
  FileArchive,
  Printer,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { type ForgeDocument, DOC_TYPE_LABELS } from "@/stores/forge";
import { type UserApplication } from "@/stores/applications";
import { Modal } from "@/components/ui";
import { downloadDocx } from "@/lib/docx-export";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = "scope" | "documents" | "customize" | "preview";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "scope", label: "Escopo" },
  { id: "documents", label: "Documentos" },
  { id: "customize", label: "Personalizar" },
  { id: "preview", label: "Prévia" },
];

export interface DossierExportPreviewProps {
  allDocuments: ForgeDocument[];
  applications: UserApplication[];
  initialOpportunityId?: string | null;
  onClose: () => void;
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function DossierExportPreview({
  allDocuments,
  applications,
  initialOpportunityId,
  onClose,
}: DossierExportPreviewProps) {
  const { toast } = useToast();
  const previewContentId = useId();

  const [step, setStep] = useState<WizardStep>("scope");
  const [selectedOppId, setSelectedOppId] = useState<string | null>(
    initialOpportunityId ?? null
  );
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(
    () => new Set()
  );
  const [dossierTitle, setDossierTitle] = useState("Dossier de Candidatura");
  const [authorName, setAuthorName] = useState("");
  const [previewMode, setPreviewMode] = useState<"screen" | "print">("screen");

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // Derive application from selected opportunity
  const selectedApp = useMemo(
    () =>
      selectedOppId
        ? applications.find((a) => a.opportunityId === selectedOppId)
        : undefined,
    [selectedOppId, applications]
  );

  // Documents relevant to the current scope
  const scopedDocuments = useMemo(() => {
    if (!selectedOppId) return allDocuments;
    return allDocuments.filter(
      (d) =>
        d.primaryOpportunityId === selectedOppId ||
        d.opportunityIds?.includes(selectedOppId)
    );
  }, [allDocuments, selectedOppId]);

  // Documents chosen for export
  const selectedDocuments = useMemo(
    () => allDocuments.filter((d) => selectedDocIds.has(d.id)),
    [allDocuments, selectedDocIds]
  );

  // ─── Scope selection ────────────────────────────────────────────────────────

  function applyScope(oppId: string | null) {
    setSelectedOppId(oppId);
    const docs = oppId
      ? allDocuments.filter(
          (d) =>
            d.primaryOpportunityId === oppId ||
            d.opportunityIds?.includes(oppId)
        )
      : allDocuments;
    setSelectedDocIds(new Set(docs.map((d) => d.id)));
    const app = oppId
      ? applications.find((a) => a.opportunityId === oppId)
      : undefined;
    setDossierTitle(app ? `Dossier — ${app.program}` : "Dossier de Candidatura");
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  function goNext() {
    const idx = stepIndex + 1;
    if (idx < STEPS.length) setStep(STEPS[idx].id);
  }

  function goPrev() {
    const idx = stepIndex - 1;
    if (idx >= 0) setStep(STEPS[idx].id);
  }

  // ─── Document selection ──────────────────────────────────────────────────────

  function toggleDoc(docId: string) {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  }

  function toggleAll() {
    if (selectedDocIds.size === scopedDocuments.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(scopedDocuments.map((d) => d.id)));
    }
  }

  // ─── Export handlers ─────────────────────────────────────────────────────────

  const handleExportPDF = () => {
    const el = document.getElementById(previewContentId);
    if (!el) {
      window.print();
      return;
    }
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast({
        title: "Bloqueado",
        description: "Permita pop-ups para exportar PDF.",
        variant: "warning",
      });
      return;
    }
    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${dossierTitle}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Times New Roman',serif;font-size:11pt;color:#111;padding:0}
    .cover{padding:4cm 3cm;border-bottom:4px solid #001338;page-break-after:always}
    .cover-brand{font-size:28pt;font-weight:900;color:#001338;letter-spacing:.05em}
    .cover-sub{font-size:10pt;color:#666;margin-top:4px}
    .cover-title{font-size:22pt;font-weight:700;color:#001338;margin-top:2cm}
    .cover-meta{margin-top:1cm;font-size:11pt;color:#333;line-height:1.8}
    .cover-meta strong{color:#001338}
    .cover-footer{margin-top:2cm;padding-top:1cm;border-top:1px solid #ddd;font-size:9pt;color:#888}
    .toc{padding:2cm 3cm;page-break-after:always}
    .toc h2{font-size:16pt;font-weight:700;color:#001338;margin-bottom:1cm}
    .toc-item{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;font-size:10pt}
    .toc-num{font-weight:700;color:#001338;min-width:20px}
    .toc-title{flex:1;color:#111}
    .toc-words{color:#888;font-size:9pt}
    .doc-section{padding:2cm 3cm;page-break-before:always}
    .doc-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#001338}
    .doc-title{font-size:18pt;font-weight:700;color:#111;margin-top:4px;padding-bottom:8px;border-bottom:2px solid #001338;margin-bottom:1cm}
    .doc-body{font-size:11pt;line-height:1.8;color:#222;white-space:pre-wrap;word-break:break-word}
    .doc-footer{margin-top:1cm;padding-top:8px;border-top:1px solid #eee;font-size:8pt;color:#999;display:flex;justify-content:space-between}
    .footer-bar{background:#001338;color:#fff;text-align:center;padding:12px;font-size:8pt;page-break-inside:avoid}
    @page{margin:0;size:A4}
  </style>
</head>
<body>
${el.innerHTML}
</body>
</html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 300);
    toast({
      title: "Impressão iniciada",
      description: 'Escolha "Salvar como PDF" no diálogo de impressão.',
      variant: "success",
    });
  };

  const handleExportDocx = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Sem documentos",
        description: "Selecione ao menos um documento.",
        variant: "warning",
      });
      return;
    }
    try {
      const title = dossierTitle || "Dossier";
      const combined = selectedDocuments
        .map((doc) => `# ${doc.title}\n\n${doc.content}`)
        .join("\n\n---\n\n");
      await downloadDocx(title, combined);
      toast({ title: "Exportado", description: "Arquivo .docx baixado.", variant: "success" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível exportar.", variant: "warning" });
    }
  };

  const handleExportZip = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Sem documentos",
        description: "Selecione ao menos um documento.",
        variant: "warning",
      });
      return;
    }
    try {
      for (const doc of selectedDocuments) {
        const blob = new Blob([doc.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "").trim()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast({
        title: "Exportados",
        description: `${selectedDocuments.length} arquivo(s) Markdown baixados.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Erro", description: "Não foi possível exportar.", variant: "warning" });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal open onClose={onClose} size="lg">
      <div className="flex h-[90vh] flex-col">
        {/* Header / Step indicator */}
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <div>
            <h2 className="font-heading text-h3 text-text-primary">
              Exportar Dossier
            </h2>
            <div className="mt-2 flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (i < stepIndex) setStep(s.id);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      s.id === step
                        ? "bg-brand-500 text-white"
                        : i < stepIndex
                        ? "cursor-pointer bg-brand-100 text-brand-700 hover:bg-brand-200"
                        : "cursor-default bg-cream-100 text-text-muted"
                    )}
                  >
                    <span className="opacity-60">{i + 1}.</span>
                    <span>{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-text-muted" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-cream-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step body */}
        <div className="flex-1 overflow-auto">
          {step === "scope" && (
            <ScopeStep
              applications={applications}
              allDocuments={allDocuments}
              selectedOppId={selectedOppId}
              onSelect={applyScope}
            />
          )}
          {step === "documents" && (
            <DocumentsStep
              documents={scopedDocuments}
              selectedDocIds={selectedDocIds}
              onToggle={toggleDoc}
              onToggleAll={toggleAll}
            />
          )}
          {step === "customize" && (
            <CustomizeStep
              title={dossierTitle}
              onTitleChange={setDossierTitle}
              authorName={authorName}
              onAuthorChange={setAuthorName}
              selectedApp={selectedApp}
              documentCount={selectedDocIds.size}
            />
          )}
          {step === "preview" && (
            <PreviewStep
              documents={selectedDocuments}
              application={selectedApp}
              title={dossierTitle}
              authorName={authorName}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              contentId={previewContentId}
            />
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-cream-200 px-6 py-4">
          <button
            onClick={goPrev}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-cream-300 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-cream-50 transition-colors",
              stepIndex === 0 && "invisible"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>

          {step !== "preview" ? (
            <button
              onClick={goNext}
              disabled={step === "documents" && selectedDocIds.size === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                <Printer className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={handleExportDocx}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                DOCX
              </button>
              <button
                onClick={handleExportZip}
                className="inline-flex items-center gap-2 rounded-xl border border-cream-400 px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-cream-100 transition-colors"
              >
                <FileArchive className="h-4 w-4" />
                ZIP
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Step 1: Scope ────────────────────────────────────────────────────────────

function ScopeStep({
  applications,
  allDocuments,
  selectedOppId,
  onSelect,
}: {
  applications: UserApplication[];
  allDocuments: ForgeDocument[];
  selectedOppId: string | null;
  onSelect: (oppId: string | null) => void;
}) {
  const universalCount = allDocuments.filter(
    (d) =>
      !d.primaryOpportunityId &&
      (!d.opportunityIds || d.opportunityIds.length === 0)
  ).length;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="font-heading text-h4 text-text-primary">
          Para qual candidatura é este dossier?
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Selecione uma candidatura para pré-filtrar os documentos vinculados, ou
          escolha exportar todos os documentos.
        </p>
      </div>

      <div className="grid gap-3">
        {/* All documents option */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all",
            selectedOppId === null
              ? "border-brand-500 bg-brand-50"
              : "border-cream-200 bg-white hover:border-brand-200"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Todos os documentos</p>
            <p className="mt-0.5 text-sm text-text-muted">
              {allDocuments.length} documento{allDocuments.length !== 1 ? "s" : ""} no
              total
              {universalCount > 0 && ` · ${universalCount} universais`}
            </p>
          </div>
          {selectedOppId === null && (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-500" />
          )}
        </button>

        {/* Per-application options */}
        {applications.map((app) => {
          const docCount = allDocuments.filter(
            (d) =>
              d.primaryOpportunityId === app.opportunityId ||
              d.opportunityIds?.includes(app.opportunityId ?? "")
          ).length;
          const isSelected = selectedOppId === app.opportunityId;
          const isDeadlineSoon =
            app.deadline &&
            new Date(app.deadline).getTime() - Date.now() <
              7 * 24 * 60 * 60 * 1000;

          return (
            <button
              key={app.id}
              onClick={() => onSelect(app.opportunityId ?? null)}
              className={cn(
                "flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50"
                  : "border-cream-200 bg-white hover:border-brand-200"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Target className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{app.program}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                  <span>{app.country}</span>
                  {app.deadline && (
                    <>
                      <span>·</span>
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          isDeadlineSoon && "text-amber-600 font-medium"
                        )}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(app.deadline).toLocaleDateString("pt-BR")}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    {docCount} doc{docCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-500" />
              )}
            </button>
          );
        })}

        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-cream-300 p-6 text-center text-sm text-text-muted">
            Nenhuma candidatura cadastrada ainda. O dossier incluirá todos os
            documentos.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Documents ────────────────────────────────────────────────────────

function DocumentsStep({
  documents,
  selectedDocIds,
  onToggle,
  onToggleAll,
}: {
  documents: ForgeDocument[];
  selectedDocIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected = selectedDocIds.size === documents.length && documents.length > 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">
            Selecione os documentos
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {selectedDocIds.size} de {documents.length} selecionado
            {selectedDocIds.size !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onToggleAll}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {allSelected ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-cream-300 mb-3" />
          <p className="text-sm text-text-muted">
            Nenhum documento encontrado para o escopo selecionado.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.has(doc.id);
            const wordCount = doc.content.trim().split(/\s+/).filter(Boolean).length;

            return (
              <button
                key={doc.id}
                onClick={() => onToggle(doc.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : "border-cream-200 bg-white hover:border-brand-200"
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-cream-400 bg-white"
                  )}
                >
                  {isSelected && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Doc info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{doc.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span>{DOC_TYPE_LABELS[doc.type]}</span>
                    <span>·</span>
                    <span>{wordCount} palavras</span>
                    <span>·</span>
                    <span>{doc.content.length.toLocaleString("pt-BR")} chars</span>
                  </div>
                </div>

                {/* Readiness badge */}
                <ReadinessChip level={doc.readinessLevel} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Customize ────────────────────────────────────────────────────────

function CustomizeStep({
  title,
  onTitleChange,
  authorName,
  onAuthorChange,
  selectedApp,
  documentCount,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  authorName: string;
  onAuthorChange: (v: string) => void;
  selectedApp?: UserApplication;
  documentCount: number;
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="font-heading text-h4 text-text-primary">
          Personalize a capa
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Estes detalhes aparecerão na página de capa do dossier exportado.
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Título do dossier
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Dossier de Candidatura"
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Nome do candidato
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Preview of cover summary */}
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Resumo da capa
        </p>
        <p className="font-heading text-lg font-bold text-text-primary">
          {title || "Dossier de Candidatura"}
        </p>
        {selectedApp && (
          <p className="text-sm text-text-secondary">{selectedApp.program}</p>
        )}
        {authorName && (
          <p className="text-sm text-text-secondary">{authorName}</p>
        )}
        <p className="text-sm text-text-muted">
          {documentCount} documento{documentCount !== 1 ? "s" : ""} · Gerado em{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Preview ──────────────────────────────────────────────────────────

function PreviewStep({
  documents,
  application,
  title,
  authorName,
  previewMode,
  onPreviewModeChange,
  contentId,
}: {
  documents: ForgeDocument[];
  application?: UserApplication;
  title: string;
  authorName: string;
  previewMode: "screen" | "print";
  onPreviewModeChange: (m: "screen" | "print") => void;
  contentId: string;
}) {
  const generatedDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center gap-2 border-b border-cream-200 bg-cream-50 px-6 py-3">
        <Eye className="h-4 w-4 text-text-muted" />
        <span className="text-sm font-medium text-text-muted">
          Pré-visualização
        </span>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-cream-300 bg-white p-1">
          <button
            onClick={() => onPreviewModeChange("screen")}
            className={cn(
              "rounded px-3 py-1 text-xs font-semibold transition-colors",
              previewMode === "screen"
                ? "bg-brand-500 text-white"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Tela
          </button>
          <button
            onClick={() => onPreviewModeChange("print")}
            className={cn(
              "rounded px-3 py-1 text-xs font-semibold transition-colors",
              previewMode === "print"
                ? "bg-brand-500 text-white"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Impressão (A4)
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-auto bg-cream-100 p-6">
        <div
          className={cn(
            "mx-auto bg-white shadow-xl",
            previewMode === "print" ? "w-[210mm]" : "max-w-3xl"
          )}
        >
          {/* Hidden print-ready version */}
          <div id={contentId} className="hidden">
            <PrintContent
              documents={documents}
              application={application}
              title={title}
              authorName={authorName}
              generatedDate={generatedDate}
            />
          </div>

          {/* Screen preview */}
          <ScreenPreview
            documents={documents}
            application={application}
            title={title}
            authorName={authorName}
            generatedDate={generatedDate}
            isPrint={previewMode === "print"}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Screen preview (styled) ──────────────────────────────────────────────────

function ScreenPreview({
  documents,
  application,
  title,
  authorName,
  generatedDate,
  isPrint,
}: {
  documents: ForgeDocument[];
  application?: UserApplication;
  title: string;
  authorName: string;
  generatedDate: string;
  isPrint: boolean;
}) {
  return (
    <>
      {/* Cover */}
      <div
        className={cn(
          "border-b-4 border-brand-500 p-12",
          isPrint && "min-h-[297mm]"
        )}
      >
        <div className="mb-10">
          <p className="text-2xl font-black tracking-widest text-[#001338]">
            OLCAN
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Professional Mobility Platform
          </p>
        </div>
        <h1 className="font-heading text-4xl font-bold text-text-primary leading-tight">
          {title || "Dossier de Candidatura"}
        </h1>
        {application && (
          <div className="mt-6 space-y-1 text-lg">
            <p className="font-semibold text-text-primary">{application.program}</p>
            <p className="text-text-secondary">{application.country}</p>
            {application.deadline && (
              <p className="text-text-muted text-base">
                Prazo:{" "}
                {new Date(application.deadline).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
        {authorName && (
          <p className="mt-4 text-base font-semibold text-text-secondary">
            {authorName}
          </p>
        )}
        <div className="mt-10 border-t border-cream-200 pt-4">
          <p className="text-sm text-text-muted">Gerado em {generatedDate}</p>
          <p className="text-sm text-text-muted">
            {documents.length} documento{documents.length !== 1 ? "s" : ""}{" "}
            incluído{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table of contents */}
      {documents.length > 0 && (
        <div className="border-b border-cream-200 p-12">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">
            Sumário
          </h2>
          <ol className="space-y-3">
            {documents.map((doc, i) => {
              const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
              return (
                <li key={doc.id} className="flex items-baseline gap-3">
                  <span className="font-bold text-brand-600 text-sm min-w-[24px]">
                    {i + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">{doc.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {DOC_TYPE_LABELS[doc.type]} · {words} palavras
                    </p>
                  </div>
                  <ReadinessChip level={doc.readinessLevel} />
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Documents */}
      {documents.map((doc, i) => {
        const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
        return (
          <div
            key={doc.id}
            className={cn(
              "p-12",
              i < documents.length - 1 && "border-b border-cream-200",
              isPrint && "min-h-[297mm]"
            )}
          >
            <div className="mb-6 border-b-2 border-brand-500 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Documento {i + 1}
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-text-primary">
                {doc.title}
              </h2>
              {doc.targetProgram && (
                <p className="mt-1 text-sm text-text-muted">
                  Destinado a: {doc.targetProgram}
                </p>
              )}
            </div>

            <div className="prose prose-slate max-w-none text-base leading-relaxed text-text-primary">
              {renderContent(doc.content)}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-cream-200 pt-3 text-xs text-text-muted">
              <span>
                Atualizado em{" "}
                {new Date(doc.updatedAt).toLocaleDateString("pt-BR")}
              </span>
              <span>{words} palavras</span>
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="border-t-4 border-brand-500 bg-[#001338] p-6 text-center">
        <p className="text-sm font-semibold text-white">
          Gerado pelo Olcan Compass
        </p>
        <p className="mt-1 text-xs text-white/60">
          Professional Mobility Platform · olcan.com
        </p>
      </div>
    </>
  );
}

// ─── Hidden print-ready version (plain HTML for the print window) ──────────────

function PrintContent({
  documents,
  application,
  title,
  authorName,
  generatedDate,
}: {
  documents: ForgeDocument[];
  application?: UserApplication;
  title: string;
  authorName: string;
  generatedDate: string;
}) {
  return (
    <>
      <div className="cover">
        <div className="cover-brand">OLCAN</div>
        <div className="cover-sub">Professional Mobility Platform</div>
        <div className="cover-title">{title || "Dossier de Candidatura"}</div>
        <div className="cover-meta">
          {application && (
            <>
              <div>
                <strong>{application.program}</strong>
              </div>
              <div>{application.country}</div>
              {application.deadline && (
                <div>
                  Prazo:{" "}
                  {new Date(application.deadline).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </>
          )}
          {authorName && <div>{authorName}</div>}
        </div>
        <div className="cover-footer">
          <div>Gerado em {generatedDate}</div>
          <div>
            {documents.length} documento
            {documents.length !== 1 ? "s" : ""} incluído
            {documents.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="toc">
        <h2>Sumário</h2>
        {documents.map((doc, i) => {
          const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
          return (
            <div key={doc.id} className="toc-item">
              <span className="toc-num">{i + 1}.</span>
              <span className="toc-title">{doc.title}</span>
              <span className="toc-words">{words} palavras</span>
            </div>
          );
        })}
      </div>

      {documents.map((doc, i) => {
        const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
        return (
          <div key={doc.id} className="doc-section">
            <div className="doc-label">Documento {i + 1}</div>
            <div className="doc-title">{doc.title}</div>
            <div className="doc-body">{doc.content}</div>
            <div className="doc-footer">
              <span>
                Atualizado em{" "}
                {new Date(doc.updatedAt).toLocaleDateString("pt-BR")}
              </span>
              <span>{words} palavras</span>
            </div>
          </div>
        );
      })}

      <div className="footer-bar">
        Gerado pelo Olcan Compass · Professional Mobility Platform · olcan.com
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ReadinessChip({ level }: { level?: ForgeDocument["readinessLevel"] }) {
  if (!level) return null;

  const configs = {
    export_ready: {
      label: "Pronto",
      icon: CheckCircle2,
      className: "bg-emerald-100 text-emerald-700",
    },
    submitted: {
      label: "Enviado",
      icon: CheckCircle2,
      className: "bg-emerald-100 text-emerald-700",
    },
    review: {
      label: "Em revisão",
      icon: Clock,
      className: "bg-amber-100 text-amber-700",
    },
    draft: {
      label: "Rascunho",
      icon: AlertCircle,
      className: "bg-slate-100 text-slate-600",
    },
  } as const;

  const config = configs[level] ?? configs.draft;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let paragraphLines: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    const text = paragraphLines.join(" ").trim();
    if (text) {
      elements.push(
        <p key={key++} className="mb-4">
          {text}
        </p>
      );
    }
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const h1 = trimmed.match(/^#\s+(.+)/);
    const h2 = trimmed.match(/^##\s+(.+)/);
    const h3 = trimmed.match(/^###\s+(.+)/);

    if (h1 || h2 || h3) {
      flushParagraph();
      const text = (h1 ?? h2 ?? h3)![1];
      if (h1) {
        elements.push(
          <h1 key={key++} className="mt-6 mb-3 text-2xl font-bold text-text-primary">
            {text}
          </h1>
        );
      } else if (h2) {
        elements.push(
          <h2 key={key++} className="mt-5 mb-2 text-xl font-bold text-text-primary">
            {text}
          </h2>
        );
      } else {
        elements.push(
          <h3 key={key++} className="mt-4 mb-2 text-lg font-semibold text-text-primary">
            {text}
          </h3>
        );
      }
    } else {
      paragraphLines.push(trimmed);
    }
  }

  flushParagraph();
  return <>{elements}</>;
}
