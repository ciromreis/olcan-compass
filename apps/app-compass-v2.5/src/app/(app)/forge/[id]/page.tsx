"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookmarkPlus, Save, Sparkles, Upload,
  CheckCircle, Loader2, Mic, X, Check, MoreVertical, Download,
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Quote,
  Undo2, Redo2,
} from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { buildForgeArtifactDraft } from "@/lib/community-artifacts";
import { deriveForgeInterviewInsights } from "@/lib/forge-interview-loop";
import { useCommunityArtifactSave } from "@/hooks";
import { Button, Input, Modal, SaveToCommunityButton, useToast } from "@/components/ui";
import { CreditBalance } from "@/components/forge/CreditBalance";
import { ForgeMetadataSidebar } from "@/components/forge/ForgeMetadataSidebar";
import { DocumentManagementPanel } from "@/components/forge/DocumentManagementPanel";
import { DetailPageShell, forgeDetailTabs } from "@/components/layout/DetailPageShell";
import { apiClient } from "@/lib/api-client";
import { FocusMode } from "@/components/forge/FocusMode";
import { DocxImporter } from "@/components/forge/DocxImporter";
import { eventBus } from "@/lib/event-bus";

type SaveStatus = "idle" | "saving" | "saved";

function suggestInterviewType(type: DocType): string {
  switch (type) {
    case "cv":
      return "job";
    case "recommendation":
      return "panel";
    case "motivation_letter":
    case "research_proposal":
    case "personal_statement":
    default:
      return "academic";
  }
}

export default function ForgeEditorPage() {
  const params = useParams();
  const docId = params.id as string;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { getDocById, updateContent, updateType, saveVersion } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { saveCommunityArtifact } = useCommunityArtifactSave({
    kind: "forge",
    onSaved: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });
  const doc = getDocById(docId);

  const [localContent, setLocalContent] = useState(doc?.content || "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [saveVersionOpen, setSaveVersionOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);

  // AI Polish state
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishResult, setPolishResult] = useState<{
    polished_content: string;
    changes_summary: string;
    word_count_before: number;
    word_count_after: number;
    methodology_applied: string;
    credits_remaining: number;
  } | null>(null);
  const [polishMethodology, setPolishMethodology] = useState<"STAR" | "CAR" | "free">("STAR");
  const [creditRefreshKey, setCreditRefreshKey] = useState(0);

  // Sync local content from store on mount
  useEffect(() => {
    if (doc) {
      setLocalContent(doc.content);
      historyRef.current = [doc.content];
      historyIndexRef.current = 0;
    }
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save after 2 seconds of inactivity
  const handleContentChange = useCallback((newContent: string, skipHistory = false) => {
    setLocalContent(newContent);
    setHasUnsavedChanges(true);

    if (!skipHistory) {
      const base = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current = [...base, newContent].slice(-100);
      historyIndexRef.current = historyRef.current.length - 1;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      updateContent(docId, newContent);
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 2000);
  }, [docId, updateContent]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      handleContentChange(historyRef.current[historyIndexRef.current], true);
    }
  }, [handleContentChange]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      handleContentChange(historyRef.current[historyIndexRef.current], true);
    }
  }, [handleContentChange]);

  const handleSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("saving");
    updateContent(docId, localContent);
    setHasUnsavedChanges(false);
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }, [docId, localContent, updateContent]);

  const handleSaveVersion = useCallback(() => {
    handleSave();
    if (!localContent.trim()) {
      toast({
        title: "Sem conteúdo para versionar",
        description: "Escreva algo antes de salvar uma versão.",
        variant: "warning",
      });
      return;
    }
    setSaveVersionOpen(true);
  }, [handleSave, localContent, toast]);

  const handleDocTypeChange = useCallback((newType: DocType) => {
    updateType(docId, newType);
    toast({
      title: "Tipo atualizado",
      description: `Documento reclassificado como ${DOC_TYPE_LABELS[newType]}.`,
      variant: "success",
    });
  }, [docId, updateType, toast]);

  const confirmSaveVersion = useCallback(() => {
    saveVersion(docId, versionLabel.trim() || undefined);
    setSaveVersionOpen(false);
    setVersionLabel("");
    toast({
      title: "Versão salva",
      description: "Um novo ponto de restauração foi criado para este documento.",
      variant: "success",
    });
  }, [docId, saveVersion, toast, versionLabel]);

  const handleSaveToCommunity = useCallback(() => {
    if (!doc) return;
    const draft = buildForgeArtifactDraft({
      doc,
      content: localContent,
      typeLabel: DOC_TYPE_LABELS[doc.type],
    });
    saveCommunityArtifact(draft);
  }, [doc, localContent, saveCommunityArtifact]);

  const handlePolish = useCallback(async () => {
    if (!localContent.trim()) {
      toast({ title: "Sem conteúdo", description: "Escreva algo antes de refinar.", variant: "warning" });
      return;
    }
    setPolishLoading(true);
    setPolishResult(null);
    try {
      const currentWordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
      const result = await apiClient.forgePolishDirect({
        content: localContent,
        methodology: polishMethodology,
        target_word_count: currentWordCount || 650,
      });
      setPolishResult(result);
      setCreditRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 402) {
        toast({ title: "Créditos insuficientes", description: "Compre mais créditos para continuar.", variant: "warning" });
      } else if (status === 401) {
        toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "warning" });
      } else {
        toast({ title: "Erro no refinamento", description: "Tente novamente em instantes.", variant: "warning" });
      }
    } finally {
      setPolishLoading(false);
    }
  }, [localContent, polishMethodology, toast]);

  const handleAcceptPolish = useCallback(() => {
    if (!polishResult) return;
    handleContentChange(polishResult.polished_content);
    setPolishResult(null);
    // Emit polish accepted event for gamification
    eventBus.emit("document.polished", { docId, methodology: polishMethodology });
    toast({ title: "Refinamento aceito", description: "O texto foi atualizado com a versão refinada pela IA.", variant: "success" });
  }, [polishResult, handleContentChange, toast, docId, polishMethodology]);

  const handleImportDocx = useCallback((content: string) => {
    handleContentChange(content);
    setImportModalOpen(false);
    toast({
      title: "Documento importado",
      description: "O conteúdo foi importado com sucesso.",
      variant: "success",
    });
  }, [handleContentChange, toast]);

  // useMemo must be called unconditionally before any early return
  const interviewInsightsRaw = useMemo(() => doc ? deriveForgeInterviewInsights(doc, sessions) : null, [doc, sessions]);

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-brand-500 font-medium hover:underline">← Voltar ao Forge</Link>
      </div>
    );
  }

  // doc is guaranteed non-null after the early return guard above
  const interviewInsights = interviewInsightsRaw!;

  const wordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = localContent.length;
  const paragraphCount = localContent.split("\n\n").filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const linkedSessionCount = doc.interviewLoop?.linkedSessionCount ?? interviewInsights.linkedSessions.length;
  const averageInterviewScore = doc.interviewLoop?.averageOverallScore ?? interviewInsights.averageScore;
  const alignmentScore = doc.interviewLoop?.alignmentScore ?? interviewInsights.alignmentScore;
  const latestFeedbackHref = doc.interviewLoop?.latestSessionId
    ? `/interviews/${doc.interviewLoop.latestSessionId}/feedback`
    : interviewInsights.latestSession
    ? `/interviews/${interviewInsights.latestSession.id}/feedback`
    : null;
  const suggestionCards = doc.interviewLoop && doc.interviewLoop.focusAreas.length > 0
    ? doc.interviewLoop.focusAreas.map((text, index) => ({
        id: `focus-${index}`,
        title: "Ajuste prioritário",
        text,
        tone: "clay" as const,
      }))
    : interviewInsights.suggestions;

  // Subtitle with doc type selector and save status
  const subtitle = (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      <select
        value={doc.type}
        onChange={(e) => handleDocTypeChange(e.target.value as DocType)}
        className="rounded border border-cream-300 bg-cream-100 px-1.5 py-0.5 text-xs font-medium outline-none transition-colors hover:border-brand-300 focus:ring-1 focus:ring-brand-400"
      >
        {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <span>·</span>
      {saveStatus === "saving" && (
        <span className="flex items-center gap-1 text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
        </span>
      )}
      {saveStatus === "saved" && (
        <span className="flex items-center gap-1 text-brand-500">
          <CheckCircle className="h-3 w-3" /> Salvo
        </span>
      )}
      {saveStatus === "idle" && hasUnsavedChanges && (
        <span className="text-slate-500">Alterações não salvas</span>
      )}
      {saveStatus === "idle" && !hasUnsavedChanges && (
        <span>Salvo · {doc.versions.length} versões</span>
      )}
    </div>
  );

  // Action buttons for header - simplified
  const actions = (
    <div className="flex items-center gap-2">
      {/* Word count - compact */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted bg-cream-50 rounded-lg border border-cream-200">
        <span className="font-semibold">{wordCount.toLocaleString()}</span>
        <span>palavras</span>
      </div>
      
      {/* Primary action: AI Polish */}
      <div className="flex items-center rounded-lg border border-brand-200 bg-white overflow-hidden">
        <select
          value={polishMethodology}
          onChange={(e) => setPolishMethodology(e.target.value as "STAR" | "CAR" | "free")}
          className="border-none bg-transparent py-1.5 pl-2 pr-1 text-xs font-medium text-brand-700 outline-none"
        >
          <option value="STAR">STAR</option>
          <option value="CAR">CAR</option>
          <option value="free">Livre</option>
        </select>
        <button
          onClick={handlePolish}
          disabled={polishLoading}
          className="inline-flex items-center gap-1.5 bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {polishLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{polishLoading ? "Refinando..." : "Refinar"}</span>
        </button>
      </div>

      {/* Secondary actions dropdown */}
      <div className="relative">
        <button
          onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-cream-50"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="hidden sm:inline">Ações</span>
        </button>
        {actionsMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setActionsMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-cream-200 bg-white shadow-xl">
              <div className="p-1">
                <button
                  onClick={() => {
                    setImportModalOpen(true);
                    setActionsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                >
                  <Upload className="h-4 w-4" />
                  Importar .docx
                </button>
                <a
                  href={`/interviews/new?documentId=${encodeURIComponent(doc.id)}&documentTitle=${encodeURIComponent(
                    doc.title
                  )}&target=${encodeURIComponent(doc.targetProgram || doc.title)}&language=${encodeURIComponent(
                    doc.language || "en"
                  )}&type=${encodeURIComponent(suggestInterviewType(doc.type))}`}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                  onClick={() => setActionsMenuOpen(false)}
                >
                  <Mic className="h-4 w-4" />
                  Treinar entrevista
                </a>
                <button
                  onClick={() => {
                    handleSaveVersion();
                    setActionsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Salvar versão
                </button>
                <button
                  onClick={() => {
                    handleSaveToCommunity();
                    setActionsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                >
                  <Download className="h-4 w-4" />
                  Salvar na comunidade
                </button>
              </div>
              <div className="border-t border-cream-200 p-2">
                <CreditBalance refreshKey={creditRefreshKey} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
      >
        <Save className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Salvar</span>
      </button>
    </div>
  );

  const handleToolbar = (action: string) => {
    setActiveToolbar(action);
    setTimeout(() => setActiveToolbar(null), 200);

    if (!editorRef.current) return;
    const el = editorRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = localContent.substring(start, end);

    let wrapped = selected;
    switch (action) {
      case "bold": wrapped = `**${selected}**`; break;
      case "italic": wrapped = `*${selected}*`; break;
      case "underline": wrapped = `__${selected}__`; break;
      case "h1": wrapped = `# ${selected}`; break;
      case "h2": wrapped = `## ${selected}`; break;
      case "ul": wrapped = `- ${selected}`; break;
      case "ol": wrapped = `1. ${selected}`; break;
      case "quote": wrapped = `> ${selected}`; break;
      default: return;
    }

    const newContent = localContent.substring(0, start) + wrapped + localContent.substring(end);
    handleContentChange(newContent);
  };

  return (
    <DetailPageShell
      backHref="/forge"
      backLabel="Documentos"
      title={doc.title}
      subtitle={subtitle}
      tabs={forgeDetailTabs(docId)}
      sidebar={
        <div className="space-y-6">
          <DocumentManagementPanel document={doc} />
          <ForgeMetadataSidebar
            doc={doc}
            wordCount={wordCount}
            charCount={charCount}
            paragraphCount={paragraphCount}
            readingTime={readingTime}
            linkedSessionCount={linkedSessionCount}
            averageInterviewScore={averageInterviewScore}
            alignmentScore={alignmentScore}
            latestFeedbackHref={latestFeedbackHref}
            suggestionCards={suggestionCards}
          />
        </div>
      }
      actions={actions}
    >

      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importar documento .docx"
        description="Selecione um arquivo .docx para importar. O conteúdo atual será substituído."
        size="md"
      >
        <DocxImporter
          onImport={handleImportDocx}
          onClose={() => setImportModalOpen(false)}
        />
      </Modal>

      <Modal
        open={saveVersionOpen}
        onClose={() => {
          setSaveVersionOpen(false);
          setVersionLabel("");
        }}
        title="Salvar nova versão"
        description="Registre um nome opcional para identificar este checkpoint do documento."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome da versão"
            value={versionLabel}
            onChange={(event) => setVersionLabel(event.target.value)}
            placeholder="Ex: versão antes da revisão final"
            hint="Se deixar em branco, o Forge salva a versão com rótulo automático."
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSaveVersionOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSaveVersion}>
              <BookmarkPlus className="h-4 w-4" /> Salvar versão
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Polish Result Panel */}
      {polishResult && (
        <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h4 className="text-sm font-semibold text-violet-800">
                Refinamento pronto — {polishResult.methodology_applied}
              </h4>
              <span className="text-xs text-violet-500">
                {polishResult.word_count_before} → {polishResult.word_count_after} palavras
              </span>
            </div>
            <button
              onClick={() => setPolishResult(null)}
              className="rounded p-1 text-violet-400 transition-colors hover:bg-violet-100 hover:text-violet-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="rounded-lg bg-white/60 px-3 py-2 text-xs text-violet-700">
            {polishResult.changes_summary}
          </p>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-violet-200 bg-white/70 p-3 text-sm leading-relaxed text-text-primary">
            {polishResult.polished_content}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAcceptPolish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              <Check className="h-4 w-4" /> Aceitar refinamento
            </button>
            <button
              onClick={() => setPolishResult(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-700 transition-colors hover:bg-violet-100"
            >
              Manter original
            </button>
            <span className="ml-auto text-xs text-violet-500">
              {polishResult.credits_remaining} crédito{polishResult.credits_remaining !== 1 ? "s" : ""}{" "}
              restante{polishResult.credits_remaining !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Editor + Sidebar wrapper for FocusMode */}
      <FocusMode isFocused={isFocusMode} onToggle={() => setIsFocusMode(!isFocusMode)}>
        <div className="flex h-full w-full flex-col">
          <div className="card-surface flex min-h-[600px] flex-1 flex-col border border-cream-200 p-0 shadow-sm transition-all">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-cream-300 px-4 py-2 text-text-muted">
              {[
                { action: "bold", icon: Bold, title: "Negrito" },
                { action: "italic", icon: Italic, title: "Itálico" },
                { action: "underline", icon: Underline, title: "Sublinhado" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${
                    activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""
                  }`}
                >
                  <btn.icon className="h-4 w-4" />
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-cream-400" />
              {[
                { action: "h1", icon: Heading1, title: "Título 1" },
                { action: "h2", icon: Heading2, title: "Título 2" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${
                    activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""
                  }`}
                >
                  <btn.icon className="h-4 w-4" />
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-cream-400" />
              {[
                { action: "ul", icon: List, title: "Lista" },
                { action: "ol", icon: ListOrdered, title: "Lista numerada" },
                { action: "quote", icon: Quote, title: "Citação" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${
                    activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""
                  }`}
                >
                  <btn.icon className="h-4 w-4" />
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-cream-400" />
              <button
                onClick={handleUndo}
                title="Desfazer (Ctrl+Z)"
                className="rounded p-1.5 transition-colors hover:bg-cream-200 disabled:opacity-40"
                disabled={historyIndexRef.current <= 0}
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                title="Refazer (Ctrl+Y)"
                className="rounded p-1.5 transition-colors hover:bg-cream-200 disabled:opacity-40"
                disabled={historyIndexRef.current >= historyRef.current.length - 1}
              >
                <Redo2 className="h-4 w-4" />
              </button>

              <div className="ml-auto hidden text-xs text-text-muted md:block">
                {wordCount} palavras · {paragraphCount} parágrafos
              </div>
            </div>

            {/* Text area */}
            <textarea
              ref={editorRef}
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="h-[550px] w-full resize-none p-6 font-body text-base leading-relaxed text-text-primary focus:outline-none"
              placeholder="Comece a escrever seu documento..."
              spellCheck
            />
          </div>
        </div>
      </FocusMode>
    </DetailPageShell>
  );
}
