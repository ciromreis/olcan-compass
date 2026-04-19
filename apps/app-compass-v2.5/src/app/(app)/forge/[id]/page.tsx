"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookmarkPlus, Save, Sparkles, Upload,
  CheckCircle, Loader2, Mic, X, Check, MoreVertical, Download,
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Quote,
  Undo2, Redo2, Layers, ChevronDown, ChevronRight, Plus, Trash2,
  UserCircle, Eye, EyeOff, ArrowUp, ArrowDown, Zap, Target,
  AlertTriangle, BookOpen,
} from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type DocType, type ForgeSection } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useProfileIntakeStore, fillSectionFromProfile } from "@/stores/profileIntake";
import { buildForgeArtifactDraft } from "@/lib/community-artifacts";
import { deriveForgeInterviewInsights } from "@/lib/forge-interview-loop";
import { useCommunityArtifactSave } from "@/hooks";
import { Button, Input, Modal, SaveToCommunityButton, useToast } from "@/components/ui";
import { CreditBalance } from "@/components/forge/CreditBalance";
import { ForgeMetadataSidebar } from "@/components/forge/ForgeMetadataSidebar";
import { DocumentManagementPanel } from "@/components/forge/DocumentManagementPanel";
import { DocumentGuidancePanel } from "@/components/forge/DocumentGuidancePanel";
import { EnhancedDocumentPanel } from "@/components/forge/EnhancedDocumentPanel";
import { DetailPageShell, forgeDetailTabs } from "@/components/layout/DetailPageShell";
import { apiClient } from "@/lib/api-client";
import { FocusMode } from "@/components/forge/FocusMode";
import { DocxImporter } from "@/components/forge/DocxImporter";
import { eventBus } from "@/lib/event-bus";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved";

// ─── Section word count helpers ───────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sectionWordCountStatus(
  content: string,
  target?: { min: number; max: number }
): { count: number; color: string; label: string } {
  const count = countWords(content);
  if (!target) return { count, color: "text-text-muted", label: `${count} palavras` };
  if (count < target.min) return { count, color: "text-amber-600", label: `${count}/${target.min}–${target.max}` };
  if (count > target.max) return { count, color: "text-clay-600", label: `${count}/${target.min}–${target.max} ⚠` };
  return { count, color: "text-emerald-600", label: `${count}/${target.min}–${target.max} ✓` };
}

// ─── Individual section editor ────────────────────────────────────────────────

interface SectionEditorProps {
  section: ForgeSection;
  index: number;
  total: number;
  onContentChange: (id: string, content: string) => void;
  onToggleCollapse: (id: string) => void;
  onFillFromProfile: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  profileFillAvailable: boolean;
}

function SectionEditor({
  section, index, total,
  onContentChange, onToggleCollapse, onFillFromProfile,
  onRemove, onMoveUp, onMoveDown,
  canRemove, canMoveUp, canMoveDown, profileFillAvailable,
}: SectionEditorProps) {
  const wc = sectionWordCountStatus(section.content, section.wordCountTarget);
  const isEmpty = !section.content.trim();
  const [showTips, setShowTips] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isEmpty
          ? "border-dashed border-cream-300 bg-cream-50/50"
          : "border-cream-200 bg-white shadow-sm",
        section.collapsed && "opacity-75"
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => onToggleCollapse(section.id)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {section.collapsed ? (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-text-muted" />
          )}
          <span className="font-heading text-sm font-semibold text-text-primary">
            {section.title}
          </span>
          {section.required && (
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-700">
              obrigatório
            </span>
          )}
        </button>

        {/* Word count chip */}
        <span className={cn("text-xs font-medium tabular-nums", wc.color)}>
          {wc.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {section.tips && section.tips.length > 0 && (
            <button
              onClick={() => setShowTips(!showTips)}
              title="Dicas de escrita"
              className={cn(
                "rounded p-1 transition-colors hover:bg-cream-100",
                showTips ? "text-brand-500" : "text-text-muted"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
            </button>
          )}
          {profileFillAvailable && (
            <button
              onClick={() => onFillFromProfile(section.id)}
              title="Preencher com dados do perfil"
              className="rounded p-1 text-violet-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              <UserCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {canMoveUp && (
            <button onClick={() => onMoveUp(index)} title="Mover para cima"
              className="rounded p-1 text-text-muted transition-colors hover:bg-cream-100 hover:text-text-secondary">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
          {canMoveDown && (
            <button onClick={() => onMoveDown(index)} title="Mover para baixo"
              className="rounded p-1 text-text-muted transition-colors hover:bg-cream-100 hover:text-text-secondary">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          )}
          {canRemove && (
            <button onClick={() => onRemove(section.id)} title="Remover seção"
              className="rounded p-1 text-text-muted transition-colors hover:bg-clay-50 hover:text-clay-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tips banner */}
      {showTips && section.tips && (
        <div className="mx-4 mb-2 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
          <p className="mb-1 text-xs font-semibold text-brand-800">Dicas para esta seção:</p>
          <ul className="space-y-0.5">
            {section.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-brand-700">
                <Zap className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Textarea */}
      {!section.collapsed && (
        <div className="px-4 pb-4">
          <textarea
            value={section.content}
            onChange={(e) => onContentChange(section.id, e.target.value)}
            placeholder={section.placeholder || `Escreva aqui sobre "${section.title}"...`}
            rows={isEmpty ? 4 : Math.max(4, Math.ceil(countWords(section.content) / 12))}
            className="w-full resize-none rounded-lg border border-cream-200 bg-cream-50/40 p-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-200 transition-all"
          />
        </div>
      )}
    </div>
  );
}

// ─── Profile completion nudge ─────────────────────────────────────────────────

function ProfileNudge({ score }: { score: number }) {
  if (score >= 70) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-violet-800">
          Perfil {score}% completo — seções do seu documento ficam em branco
        </p>
        <p className="mt-0.5 text-xs text-violet-600">
          Complete seu perfil de carreira para preencher automaticamente as seções do documento.
        </p>
      </div>
      <Link
        href="/settings/profile"
        className="flex-shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
      >
        Completar →
      </Link>
    </div>
  );
}

// ─── Document assembly preview ────────────────────────────────────────────────

function AssemblyPreview({ sections }: { sections: ForgeSection[] }) {
  return (
    <div className="max-h-[600px] overflow-y-auto rounded-xl border border-cream-200 bg-white p-6 text-sm leading-relaxed text-text-primary">
      {sections.filter((s) => s.content.trim()).map((s) => (
        <div key={s.id} className="mb-6">
          <h3 className="mb-2 font-heading text-base font-bold text-[#001338]">{s.title}</h3>
          <p className="whitespace-pre-wrap text-text-secondary">{s.content}</p>
        </div>
      ))}
      {sections.every((s) => !s.content.trim()) && (
        <p className="text-center text-text-muted italic">Nenhuma seção preenchida ainda.</p>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function suggestInterviewType(type: DocType): string {
  switch (type) {
    case "cv": return "job";
    case "recommendation": return "panel";
    case "motivation_letter":
    case "research_proposal":
    case "personal_statement":
    default: return "academic";
  }
}

export default function ForgeEditorPage() {
  const params = useParams();
  const docId = params.id as string;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const {
    getDocById, updateContent, updateType, saveVersion,
    initializeSections, updateSection, toggleSectionCollapsed,
    toggleSectionMode, addCustomSection, removeSection, reorderSections,
  } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { intake } = useProfileIntakeStore();
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
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

  // Auto-save after 2 seconds of inactivity (plain mode only)
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

  // Section change — auto-save via store (store assembles content)
  const handleSectionChange = useCallback((sectionId: string, content: string) => {
    updateSection(docId, sectionId, content);
    setHasUnsavedChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1500);
  }, [docId, updateSection]);

  const handleFillFromProfile = useCallback((sectionId: string) => {
    const filled = fillSectionFromProfile(sectionId, intake);
    if (!filled.trim()) {
      toast({ title: "Perfil incompleto", description: "Complete seu perfil para usar esta função.", variant: "warning" });
      return;
    }
    updateSection(docId, sectionId, filled);
    toast({ title: "Seção preenchida", description: "Dados do perfil inseridos com sucesso.", variant: "success" });
  }, [intake, docId, updateSection, toast]);

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
      toast({ title: "Sem conteúdo para versionar", variant: "warning" });
      return;
    }
    setSaveVersionOpen(true);
  }, [handleSave, localContent, toast]);

  const handleDocTypeChange = useCallback((newType: DocType) => {
    updateType(docId, newType);
    toast({ title: "Tipo atualizado", description: `Documento reclassificado como ${DOC_TYPE_LABELS[newType]}.`, variant: "success" });
  }, [docId, updateType, toast]);

  const confirmSaveVersion = useCallback(() => {
    saveVersion(docId, versionLabel.trim() || undefined);
    setSaveVersionOpen(false);
    setVersionLabel("");
    toast({ title: "Versão salva", description: "Ponto de restauração criado.", variant: "success" });
  }, [docId, saveVersion, toast, versionLabel]);

  const handleSaveToCommunity = useCallback(() => {
    if (!doc) return;
    const draft = buildForgeArtifactDraft({ doc, content: localContent, typeLabel: DOC_TYPE_LABELS[doc.type] });
    saveCommunityArtifact(draft);
  }, [doc, localContent, saveCommunityArtifact]);

  const handlePolish = useCallback(async () => {
    if (!localContent.trim() && !doc?.sections?.some((s) => s.content.trim())) {
      toast({ title: "Sem conteúdo", description: "Escreva algo antes de refinar.", variant: "warning" });
      return;
    }
    setPolishLoading(true);
    setPolishResult(null);
    try {
      const contentToPolish = doc?.sectionMode
        ? (doc.sections || []).map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n")
        : localContent;
      const wc = contentToPolish.trim().split(/\s+/).filter(Boolean).length;
      const result = await apiClient.forgePolishDirect({
        content: contentToPolish,
        methodology: polishMethodology,
        target_word_count: wc || 650,
      });
      setPolishResult(result);
      setCreditRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 402) toast({ title: "Créditos insuficientes", description: "Compre mais créditos.", variant: "warning" });
      else if (status === 401) toast({ title: "Sessão expirada", variant: "warning" });
      else toast({ title: "Erro no refinamento", description: "Tente novamente.", variant: "warning" });
    } finally {
      setPolishLoading(false);
    }
  }, [doc, localContent, polishMethodology, toast]);

  const handleAcceptPolish = useCallback(() => {
    if (!polishResult) return;
    handleContentChange(polishResult.polished_content);
    setPolishResult(null);
    eventBus.emit("document.polished", { docId, methodology: polishMethodology });
    toast({ title: "Refinamento aceito", variant: "success" });
  }, [polishResult, handleContentChange, toast, docId, polishMethodology]);

  const handleImportDocx = useCallback((content: string) => {
    handleContentChange(content);
    setImportModalOpen(false);
    toast({ title: "Documento importado", variant: "success" });
  }, [handleContentChange, toast]);

  const handleActivateSections = useCallback(() => {
    initializeSections(docId);
    toast({ title: "Estrutura ativada", description: "Edite seção por seção com guidance contextual.", variant: "success" });
  }, [docId, initializeSections, toast]);

  const handleAddCustomSection = useCallback(() => {
    if (!newSectionTitle.trim()) return;
    addCustomSection(docId, newSectionTitle.trim());
    setNewSectionTitle("");
    setAddSectionOpen(false);
    toast({ title: "Seção adicionada", variant: "success" });
  }, [docId, newSectionTitle, addCustomSection, toast]);

  const interviewInsightsRaw = useMemo(
    () => (doc ? deriveForgeInterviewInsights(doc, sessions) : null),
    [doc, sessions]
  );

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-brand-500 font-medium hover:underline">← Voltar ao Forge</Link>
      </div>
    );
  }

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
    : interviewInsights.latestSession ? `/interviews/${interviewInsights.latestSession.id}/feedback` : null;
  const suggestionCards = doc.interviewLoop && doc.interviewLoop.focusAreas.length > 0
    ? doc.interviewLoop.focusAreas.map((text, i) => ({ id: `focus-${i}`, title: "Ajuste prioritário", text, tone: "clay" as const }))
    : interviewInsights.suggestions;

  const inSectionMode = doc.sectionMode && doc.sections && doc.sections.length > 0;
  const sectionTotalWords = doc.sections
    ? doc.sections.reduce((sum, s) => sum + countWords(s.content), 0)
    : 0;
  const profileScore = intake.completionScore;

  // ─── Subtitle ───────────────────────────────────────────────────────────────
  const subtitle = (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      <select
        value={doc.type}
        onChange={(e) => handleDocTypeChange(e.target.value as DocType)}
        className="rounded border border-cream-300 bg-cream-100 px-1.5 py-0.5 text-xs font-medium outline-none transition-colors hover:border-brand-300 focus:ring-1 focus:ring-brand-400"
      >
        {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <span>·</span>
      {saveStatus === "saving" && (
        <span className="flex items-center gap-1 text-slate-500"><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</span>
      )}
      {saveStatus === "saved" && (
        <span className="flex items-center gap-1 text-brand-500"><CheckCircle className="h-3 w-3" /> Salvo</span>
      )}
      {saveStatus === "idle" && hasUnsavedChanges && <span className="text-slate-500">Alterações não salvas</span>}
      {saveStatus === "idle" && !hasUnsavedChanges && <span>Salvo · {doc.versions.length} versões</span>}
      {inSectionMode && (
        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-700">
          {doc.sections!.length} seções · {sectionTotalWords} palavras
        </span>
      )}
    </div>
  );

  // ─── Header actions ──────────────────────────────────────────────────────────
  const actions = (
    <div className="flex items-center gap-2">
      {/* Structure mode toggle */}
      <button
        onClick={inSectionMode ? () => toggleSectionMode(docId) : handleActivateSections}
        title={inSectionMode ? "Voltar para modo texto livre" : "Ativar editor por seções"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
          inSectionMode
            ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
            : "border-cream-300 bg-white text-text-secondary hover:bg-cream-50"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{inSectionMode ? "Seções ON" : "Estruturar"}</span>
      </button>

      {/* Preview (section mode only) */}
      {inSectionMode && (
        <button
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-cream-50 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      )}

      {/* Word count */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted bg-cream-50 rounded-lg border border-cream-200">
        <span className="font-semibold">{inSectionMode ? sectionTotalWords : wordCount}</span>
        <span>palavras</span>
      </div>

      {/* AI Polish */}
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

      {/* Secondary actions */}
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
            <div className="fixed inset-0 z-10" onClick={() => setActionsMenuOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-cream-200 bg-white shadow-xl">
              <div className="p-1">
                <button onClick={() => { setImportModalOpen(true); setActionsMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50">
                  <Upload className="h-4 w-4" /> Importar .docx
                </button>
                <a href={`/interviews/new?documentId=${encodeURIComponent(doc.id)}&documentTitle=${encodeURIComponent(doc.title)}&type=${encodeURIComponent(suggestInterviewType(doc.type))}`}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                  onClick={() => setActionsMenuOpen(false)}>
                  <Mic className="h-4 w-4" /> Treinar entrevista
                </a>
                <button onClick={() => { handleSaveVersion(); setActionsMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50">
                  <BookmarkPlus className="h-4 w-4" /> Salvar versão
                </button>
                <Link href={`/forge/${docId}/export`}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                  onClick={() => setActionsMenuOpen(false)}>
                  <Download className="h-4 w-4" /> Exportar documento
                </Link>
                <Link href={`/forge/${docId}/ats-optimizer`}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50"
                  onClick={() => setActionsMenuOpen(false)}>
                  <Target className="h-4 w-4" /> Analisar ATS
                </Link>
                <button onClick={() => { handleSaveToCommunity(); setActionsMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-cream-50">
                  <Sparkles className="h-4 w-4" /> Compartilhar na comunidade
                </button>
              </div>
              <div className="border-t border-cream-200 p-2">
                <CreditBalance refreshKey={creditRefreshKey} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save */}
      <button onClick={handleSave}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
        <Save className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Salvar</span>
      </button>
    </div>
  );

  // ─── Toolbar (plain mode only) ───────────────────────────────────────────────
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
          <DocumentGuidancePanel documentId={docId} />
          {/* Profile completion nudge */}
          <ProfileNudge score={profileScore} />
          <ForgeMetadataSidebar
            doc={doc}
            wordCount={inSectionMode ? sectionTotalWords : wordCount}
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
      {/* Modals */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)}
        title="Importar documento .docx" size="md">
        <DocxImporter onImport={handleImportDocx} onClose={() => setImportModalOpen(false)} />
      </Modal>

      <Modal open={saveVersionOpen} onClose={() => { setSaveVersionOpen(false); setVersionLabel(""); }}
        title="Salvar nova versão" size="sm">
        <div className="space-y-4">
          <Input label="Nome da versão" value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)}
            placeholder="Ex: versão antes da revisão final" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSaveVersionOpen(false)}>Cancelar</Button>
            <Button onClick={confirmSaveVersion}><BookmarkPlus className="h-4 w-4" /> Salvar versão</Button>
          </div>
        </div>
      </Modal>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview do documento" size="lg">
        <AssemblyPreview sections={doc.sections || []} />
      </Modal>

      <Modal open={addSectionOpen} onClose={() => setAddSectionOpen(false)} title="Nova seção personalizada" size="sm">
        <div className="space-y-4">
          <Input label="Nome da seção" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Ex: Declaração de Diversidade" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAddSectionOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCustomSection}><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* AI Polish result */}
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
            <button onClick={() => setPolishResult(null)} className="rounded p-1 text-violet-400 hover:bg-violet-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="rounded-lg bg-white/60 px-3 py-2 text-xs text-violet-700">{polishResult.changes_summary}</p>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-violet-200 bg-white/70 p-3 text-sm leading-relaxed text-text-primary">
            {polishResult.polished_content}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAcceptPolish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
              <Check className="h-4 w-4" /> Aceitar
            </button>
            <button onClick={() => setPolishResult(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-700 hover:bg-violet-100">
              Manter original
            </button>
            <span className="ml-auto text-xs text-violet-500">
              {polishResult.credits_remaining} crédito{polishResult.credits_remaining !== 1 ? "s" : ""} restante{polishResult.credits_remaining !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION MODE ──────────────────────────────────────────────────────── */}
      {inSectionMode ? (
        <FocusMode isFocused={isFocusMode} onToggle={() => setIsFocusMode(!isFocusMode)}>
          <div className="space-y-3">
            {/* Activation banner when sections are all empty */}
            {doc.sections!.every((s) => !s.content.trim()) && (
              <div className="rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <Layers className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      Estrutura ativada para {DOC_TYPE_LABELS[doc.type]}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-700">
                      Cada seção tem guidance contextual e limite de palavras. Use{" "}
                      <UserCircle className="inline h-3 w-3 text-violet-600" /> para preencher com dados do seu perfil.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section list */}
            {doc.sections!.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                total={doc.sections!.length}
                onContentChange={handleSectionChange}
                onToggleCollapse={(id) => toggleSectionCollapsed(docId, id)}
                onFillFromProfile={handleFillFromProfile}
                onRemove={(id) => removeSection(docId, id)}
                onMoveUp={(i) => reorderSections(docId, i, i - 1)}
                onMoveDown={(i) => reorderSections(docId, i, i + 1)}
                canRemove={!section.required}
                canMoveUp={index > 0}
                canMoveDown={index < doc.sections!.length - 1}
                profileFillAvailable={
                  !!fillSectionFromProfile(section.id, intake).trim()
                }
              />
            ))}

            {/* Add custom section */}
            <button
              onClick={() => setAddSectionOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cream-300 py-3 text-sm font-medium text-text-muted hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar seção personalizada
            </button>
          </div>
        </FocusMode>
      ) : (
        /* ── PLAIN MODE ──────────────────────────────────────────────────────── */
        <FocusMode isFocused={isFocusMode} onToggle={() => setIsFocusMode(!isFocusMode)}>
          <div className="flex h-full w-full flex-col">
            {/* Activate structure prompt (only shown when doc is empty) */}
            {!localContent.trim() && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                <Layers className="h-4 w-4 flex-shrink-0 text-brand-500" />
                <p className="flex-1 text-xs text-brand-700">
                  Este é um documento em branco. Use{" "}
                  <strong>Estruturar</strong> para ativar seções guiadas para{" "}
                  <strong>{DOC_TYPE_LABELS[doc.type]}</strong>.
                </p>
                <button onClick={handleActivateSections}
                  className="flex-shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">
                  Ativar estrutura
                </button>
              </div>
            )}

            <div className="card-surface flex min-h-[600px] flex-1 flex-col border border-cream-200 p-0 shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-cream-300 px-4 py-2 text-text-muted">
                {[
                  { action: "bold", icon: Bold, title: "Negrito" },
                  { action: "italic", icon: Italic, title: "Itálico" },
                  { action: "underline", icon: Underline, title: "Sublinhado" },
                ].map((btn) => (
                  <button key={btn.action} onClick={() => handleToolbar(btn.action)} title={btn.title}
                    className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}>
                    <btn.icon className="h-4 w-4" />
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-cream-400" />
                {[
                  { action: "h1", icon: Heading1, title: "Título 1" },
                  { action: "h2", icon: Heading2, title: "Título 2" },
                ].map((btn) => (
                  <button key={btn.action} onClick={() => handleToolbar(btn.action)} title={btn.title}
                    className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}>
                    <btn.icon className="h-4 w-4" />
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-cream-400" />
                {[
                  { action: "ul", icon: List, title: "Lista" },
                  { action: "ol", icon: ListOrdered, title: "Lista numerada" },
                  { action: "quote", icon: Quote, title: "Citação" },
                ].map((btn) => (
                  <button key={btn.action} onClick={() => handleToolbar(btn.action)} title={btn.title}
                    className={`rounded p-1.5 transition-colors hover:bg-cream-200 ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}>
                    <btn.icon className="h-4 w-4" />
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-cream-400" />
                <button onClick={handleUndo} title="Desfazer" disabled={historyIndexRef.current <= 0}
                  className="rounded p-1.5 transition-colors hover:bg-cream-200 disabled:opacity-40">
                  <Undo2 className="h-4 w-4" />
                </button>
                <button onClick={handleRedo} title="Refazer" disabled={historyIndexRef.current >= historyRef.current.length - 1}
                  className="rounded p-1.5 transition-colors hover:bg-cream-200 disabled:opacity-40">
                  <Redo2 className="h-4 w-4" />
                </button>
                <div className="ml-auto hidden text-xs text-text-muted md:block">
                  {wordCount} palavras · {paragraphCount} parágrafos
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={editorRef}
                value={localContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="h-[550px] w-full resize-none p-6 font-body text-base leading-relaxed text-text-primary focus:outline-none"
                placeholder="Comece a escrever..."
                spellCheck
              />
            </div>
          </div>
        </FocusMode>
      )}
    </DetailPageShell>
  );
}
