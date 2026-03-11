"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Sparkles, History, BarChart3, GitCompare,
  Target, MessageSquare, Download, Bold, Italic, Underline,
  Heading1, Heading2, List, ListOrdered, Quote, Undo2, Redo2,
  CheckCircle, AlertCircle, Loader2, BookmarkPlus,
} from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS } from "@/stores/forge";
import { buildForgeArtifactDraft } from "@/lib/community-artifacts";
import { useCommunityArtifactSave } from "@/hooks";
import { Button, Input, Modal, Progress, SaveToCommunityButton, useToast } from "@/components/ui";

type SaveStatus = "idle" | "saving" | "saved";

const AI_SUGGESTIONS = [
  { text: "Adicione exemplos concretos de projetos para demonstrar experiência prática.", priority: "high" },
  { text: "Mencione um professor ou grupo de pesquisa específico da instituição.", priority: "medium" },
  { text: "Quantifique suas realizações (ex: 'liderei equipe de 5 pessoas').", priority: "high" },
  { text: "Conecte seu objetivo de pesquisa com os grupos ativos da universidade.", priority: "medium" },
];

export default function ForgeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { getDocById, updateContent, saveVersion } = useForgeStore();
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
        description: "Escreva algo no documento antes de salvar uma versão.",
        variant: "warning",
      });
      return;
    }
    setSaveVersionOpen(true);
  }, [handleSave, localContent, toast]);

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
        <Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar ao Forge</Link>
      </div>
    );
  }

  const wordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = localContent.length;
  const paragraphCount = localContent.split("\n\n").filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
            <div className="flex items-center gap-2 text-caption text-text-muted">
              <span className="px-1.5 py-0.5 rounded bg-cream-200">{DOC_TYPE_LABELS[doc.type]}</span>
              <span>·</span>
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-amber-500"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-moss-500"><CheckCircle className="w-3 h-3" /> Salvo</span>
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
          <SaveToCommunityButton onClick={handleSaveToCommunity} size="sm" />
          <button
            onClick={handleSaveVersion}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 text-moss-500" /> Salvar Versão
          </button>
          <button
            onClick={() => router.push(`/forge/${docId}/analysis`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-moss-500" /> Analisar com IA
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors"
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

      {/* Editor + Sidebar */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="card-surface p-0 min-h-[600px]">
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
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-moss-500" : ""}`}
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
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-moss-500" : ""}`}
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
                  className={`p-1.5 rounded hover:bg-cream-200 transition-colors ${activeToolbar === btn.action ? "bg-cream-200 text-moss-500" : ""}`}
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
              <span className={`font-heading text-h2 ${(doc.competitivenessScore || 0) >= 65 ? "text-moss-500" : (doc.competitivenessScore || 0) >= 40 ? "text-amber-500" : "text-clay-500"}`}>
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

          {/* AI Suggestions */}
          <div className="card-surface p-4">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5 text-moss-500 inline mr-1" />
              Sugestões de IA
            </h4>
            <div className="space-y-2">
              {AI_SUGGESTIONS.map((suggestion, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-caption text-text-secondary flex items-start gap-2"
                >
                  <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${suggestion.priority === "high" ? "text-amber-500" : "text-moss-400"}`} />
                  <span>{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
