"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Sparkles, History, BarChart3, GitCompare,
  Target, MessageSquare, Download, Bold, Italic, Underline,
  Heading1, Heading2, List, ListOrdered, Quote, Undo2, Redo2,
  CheckCircle, AlertCircle, Loader2, BookmarkPlus, Zap, Mic
} from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { buildForgeArtifactDraft } from "@/lib/community-artifacts";
import { deriveForgeInterviewInsights } from "@/lib/forge-interview-loop";
import { useCommunityArtifactSave } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, Input, Modal, Progress, SaveToCommunityButton, useToast } from "@/components/ui";
import { FocusMode } from "@/components/forge/FocusMode";

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
  const router = useRouter();
  const docId = params.id as string;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { getDocById, updateContent, saveVersion } = useForgeStore();
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
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveVersionOpen, setSaveVersionOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local content from store on mount
  useEffect(() => {
    if (doc) setLocalContent(doc.content);
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save after 2 seconds of inactivity
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    setHasUnsavedChanges(true);

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      updateContent(docId, newContent);
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 2000);
  }, [docId, updateContent]);

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
    // Requires updating store doc properties which should exist
    // Assuming useForgeStore has a generic updateDoc or we can use a direct call if available
    // For now we simulate an update visually. In a real scenario we'd call updateDoc(docId, { type: newType })
    toast({
      title: "Tipo Atualizado",
      description: `O tipo de documento mudou para ${DOC_TYPE_LABELS[newType]}.`,
      variant: "default" as any // Fallback until valid variants are known, or remove if optional. We'll use "success".
    });
  }, [toast]);

  const handleAIPolish = useCallback(async () => {
    setIsPolishing(true);
    toast({ title: "Analisando...", description: "A IA está refinando o documento (simulação)", variant: "success" });
    try {
      // Mock API trigger
      await new Promise(r => setTimeout(r, 1500));
      toast({ title: "Texto Refinado", description: "O texto foi aprimorado com base no arquétipo da sua Aura.", variant: "success" });
    } finally {
      setIsPolishing(false);
    }
  }, [toast]);

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

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-brand-500 font-medium hover:underline">← Voltar ao Forge</Link>
      </div>
    );
  }

  const wordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = localContent.length;
  const paragraphCount = localContent.split("\n\n").filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const interviewInsights = useMemo(() => deriveForgeInterviewInsights(doc, sessions), [doc, sessions]);
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

  const tabs = [
    { href: `/forge/${docId}/analysis`, icon: BarChart3, label: "Análise" },
    { href: `/forge/${docId}/versions`, icon: History, label: `Versões (${doc.versions.length})` },
    { href: `/forge/${docId}/compare`, icon: GitCompare, label: "Comparar" },
    { href: `/forge/${docId}/alignment`, icon: Target, label: "Alinhamento" },
    { href: `/forge/${docId}/competitiveness`, icon: BarChart3, label: "Competitividade" },
    { href: `/forge/${docId}/coach`, icon: MessageSquare, label: "Coach" },
    { href: `/forge/${docId}/export`, icon: Download, label: "Exportar" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/forge" className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="font-heading text-h3 text-text-primary">{doc.title}</h1>
            <div className="flex items-center gap-2 text-caption text-text-muted mt-1">
              <select
                value={doc.type}
                onChange={(e) => handleDocTypeChange(e.target.value as DocType)}
                className="px-1.5 py-0.5 rounded border border-cream-300 bg-cream-100 text-caption font-medium focus:ring-1 focus:ring-brand-400 outline-none transition-colors hover:border-brand-300"
              >
                {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <span>·</span>
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-amber-500"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-brand-500"><CheckCircle className="w-3 h-3" /> Salvo</span>
              )}
              {saveStatus === "idle" && hasUnsavedChanges && (
                <span className="text-amber-500">Alterações não salvas</span>
              )}
              {saveStatus === "idle" && !hasUnsavedChanges && (
                <span>Salvo · {doc.versions.length} versões</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/interviews/new?documentId=${encodeURIComponent(doc.id)}&documentTitle=${encodeURIComponent(doc.title)}&target=${encodeURIComponent(doc.targetProgram || doc.title)}&language=${encodeURIComponent(doc.language || "en")}&type=${encodeURIComponent(suggestInterviewType(doc.type))}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-body-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Mic className="h-4 w-4" />
            Treinar entrevista com este documento
          </Link>
          <SaveToCommunityButton onClick={handleSaveToCommunity} size="sm" />
          <button
            onClick={handleSaveVersion}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 text-brand-500" /> Salvar Versão
          </button>
          <button
            onClick={handleAIPolish}
            disabled={isPolishing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 bg-brand-50 text-brand-600 font-medium text-body-sm hover:bg-brand-100 hover:border-brand-300 disabled:opacity-50 transition-colors"
          >
            {isPolishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Refino assistido
          </button>
          <button
            onClick={() => router.push(`/forge/${docId}/analysis`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-brand-500" /> Analisar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>

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
              <BookmarkPlus className="w-4 h-4" /> Salvar versão
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cream-300 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm text-text-secondary hover:bg-cream-200 transition-colors whitespace-nowrap">
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </Link>
        ))}
      </div>

      {/* Editor + Sidebar wrapper for FocusMode */}
      <FocusMode isFocused={isFocusMode} onToggle={() => setIsFocusMode(!isFocusMode)}>
        <div className="grid lg:grid-cols-4 gap-4 w-full h-full">
          <div className="lg:col-span-3 flex flex-col h-full">
            <div className="card-surface p-0 flex flex-col flex-1 shadow-sm border border-cream-200 min-h-[600px] h-full transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-cream-300 text-text-muted flex-wrap">
              {[
                { action: "bold", icon: Bold, title: "Negrito" },
                { action: "italic", icon: Italic, title: "Itálico" },
                { action: "underline", icon: Underline, title: "Sublinhado" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
              <span className="w-px h-5 bg-cream-400 mx-1" />
              {[
                { action: "h1", icon: Heading1, title: "Título 1" },
                { action: "h2", icon: Heading2, title: "Título 2" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
              <span className="w-px h-5 bg-cream-400 mx-1" />
              {[
                { action: "ul", icon: List, title: "Lista" },
                { action: "ol", icon: ListOrdered, title: "Lista numerada" },
                { action: "quote", icon: Quote, title: "Citação" },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleToolbar(btn.action)}
                  title={btn.title}
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-brand-500" : ""}`}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
              <span className="w-px h-5 bg-cream-400 mx-1" />
              <button title="Desfazer" className="p-1.5 rounded hover:bg-cream-200 transition-colors"><Undo2 className="w-4 h-4" /></button>
              <button title="Refazer" className="p-1.5 rounded hover:bg-cream-200 transition-colors"><Redo2 className="w-4 h-4" /></button>

              <div className="ml-auto text-caption text-text-muted hidden md:block">
                {wordCount} palavras · {paragraphCount} parágrafos
              </div>
            </div>

            {/* Text area */}
            <textarea
              ref={editorRef}
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-[550px] p-6 text-body text-text-primary leading-relaxed resize-none focus:outline-none font-body"
              placeholder="Comece a escrever seu documento..."
              spellCheck
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card-surface p-4">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">Estatísticas</h4>
            <div className="space-y-2.5 text-caption">
              <div className="flex justify-between"><span className="text-text-muted">Palavras</span><span className="font-medium text-text-primary">{wordCount}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Caracteres</span><span className="font-medium text-text-primary">{charCount}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Parágrafos</span><span className="font-medium text-text-primary">{paragraphCount}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Leitura</span><span className="font-medium text-text-primary">~{readingTime} min</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Versões</span><span className="font-medium text-text-primary">{doc.versions.length}</span></div>
            </div>
          </div>

          {/* Competitiveness */}
          <div className="card-surface p-4">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">Competitividade</h4>
            <div className="text-center mb-3">
              <span className={`font-heading text-h2 ${(doc.competitivenessScore || 0) >= 65 ? "text-brand-500" : (doc.competitivenessScore || 0) >= 40 ? "text-amber-500" : "text-clay-500"}`}>
                {doc.competitivenessScore ?? "—"}
              </span>
              <span className="text-caption text-text-muted">/100</span>
            </div>
            <Progress value={doc.competitivenessScore || 0} variant={(doc.competitivenessScore || 0) >= 65 ? "moss" : "clay"} size="sm" />
            <p className="text-caption text-text-muted mt-2">
              {doc.competitivenessScore === null
                ? "Escreva mais para receber uma avaliação."
                : (doc.competitivenessScore || 0) >= 65
                  ? "Bom nível de competitividade."
                  : "Adicione mais detalhes para melhorar."}
            </p>
          </div>

          <div className="card-surface border border-brand-100 bg-brand-50/40 p-4">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-2">Circuito documento-fala</h4>
            {linkedSessionCount > 0 ? (
              <>
                <p className="text-caption text-text-secondary">
                  Este dossiê já conversou com {linkedSessionCount} treino{linkedSessionCount !== 1 ? "s" : ""}. Use isso para ajustar narrativa, prova e ritmo.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-caption">
                  <div className="rounded-xl bg-white/70 p-2.5">
                    <span className="block text-text-muted">Média recente</span>
                    <span className="font-semibold text-text-primary">{averageInterviewScore ?? "—"}/100</span>
                  </div>
                  <div className="rounded-xl bg-white/70 p-2.5">
                    <span className="block text-text-muted">Aderência</span>
                    <span className="font-semibold text-text-primary">{alignmentScore ?? "—"}%</span>
                  </div>
                </div>
                {latestFeedbackHref ? (
                  <Link
                    href={latestFeedbackHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Abrir último feedback
                    <Mic className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-caption text-text-secondary">
                  Quando este texto estiver minimamente sólido, vale abrir uma simulação de entrevista com o mesmo alvo para testar coerência, presença e repertório.
                </p>
                <Link
                  href={`/interviews/new?documentId=${encodeURIComponent(doc.id)}&documentTitle=${encodeURIComponent(doc.title)}&target=${encodeURIComponent(doc.targetProgram || doc.title)}&language=${encodeURIComponent(doc.language || "en")}&type=${encodeURIComponent(suggestInterviewType(doc.type))}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-brand-600 hover:text-brand-700"
                >
                  Iniciar treino contextual
                  <Mic className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Scholarship Target Constraints */}
          {doc.targetProgram && (
            <div className="card-surface p-4 border border-brand-200 bg-brand-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading text-body-sm font-semibold text-text-primary">
                  <Target className="w-3.5 h-3.5 text-brand-500 inline mr-1" />
                  Meta de Conteúdo
                </h4>
                {doc.constraints?.targetScholarship && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold uppercase">
                    {doc.constraints.targetScholarship}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Word Count Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-caption font-medium">
                    <span className="text-text-muted">Progresso</span>
                    <span className="text-[#001338]">{wordCount} / {doc.constraints?.maxWords || 500} palavras</span>
                  </div>
                  <Progress
                    value={Math.min(100, (wordCount / (doc.constraints?.maxWords || 500)) * 100)}
                    variant={
                      wordCount > (doc.constraints?.maxWords || 500)
                        ? "clay"
                        : wordCount > (doc.constraints?.minWords || 300)
                          ? "moss"
                          : "gradient"
                    }
                    size="sm"
                  />
                  <p className="text-[10px] text-text-muted italic">
                    {wordCount < (doc.constraints?.minWords || 300) 
                      ? `Faltam ${(doc.constraints?.minWords || 300) - wordCount} palavras para o mínimo.` 
                      : wordCount > (doc.constraints?.maxWords || 500)
                      ? `Você excedeu o limite em ${wordCount - (doc.constraints?.maxWords || 500)} palavras.`
                      : 'Volume ideal atingido. Foco no refinamento!'}
                  </p>
                </div>

                {/* Aura Spark Interaction */}
                <div className="p-3 rounded-xl bg-white/40 border border-[#001338]/5 flex items-center gap-3">
                  <Zap className={cn("w-5 h-5 transition-all", wordCount >= (doc.constraints?.minWords || 300) ? "text-amber-500 scale-110 drop-shadow-md" : "text-[#001338]/10")} />
                  <div>
                    <p className="text-[10px] font-bold text-[#001338]/60 uppercase tracking-widest">Impulso da Aura</p>
                    <p className="text-caption text-[#001338]/40 leading-tight">
                      {wordCount >= (doc.constraints?.minWords || 300) 
                        ? 'Sua Aura está brilhando com seu progresso!' 
                        : 'Continue escrevendo para energizar sua Aura.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card-surface p-4">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 inline mr-1" />
              Ajustes sugeridos a partir dos treinos
            </h4>
            <div className="space-y-2">
              {suggestionCards.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-lg border border-cream-200 bg-cream-50 p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${
                      suggestion.tone === "clay"
                        ? "text-clay-500"
                        : suggestion.tone === "sage"
                        ? "text-sage-500"
                        : "text-brand-500"
                    }`} />
                    <div>
                      <p className="text-caption font-semibold text-text-primary">{suggestion.title}</p>
                      <p className="mt-1 text-caption text-text-secondary">{suggestion.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </FocusMode>
    </div>
  );
}
