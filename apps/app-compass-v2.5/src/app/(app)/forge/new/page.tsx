"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, FileEdit, BookOpen, Briefcase, GraduationCap, Loader2, Sparkles, Upload, X } from "lucide-react";
import { useForgeStore, type DocType } from "@/stores/forge";
import { useEffectivePlan } from "@/hooks/use-effective-plan";
import { canCreateForgeDocument, maxForgeDocuments } from "@/lib/entitlements";
import { FileUpload } from "@/components/forge/FileUpload";

const DOC_TYPES: { id: DocType; icon: typeof FileText; label: string; description: string; category: string }[] = [
  { id: "cv", icon: Briefcase, label: "Currículo / Resume", description: "CV ou Resume formatado para padrões internacionais", category: "employment" },
  { id: "motivation_letter", icon: FileEdit, label: "Carta de Motivação", description: "Carta de motivação para programas acadêmicos", category: "education" },
  { id: "cover_letter", icon: FileEdit, label: "Carta de Apresentação", description: "Cover letter para vagas corporativas", category: "employment" },
  { id: "statement_of_purpose", icon: GraduationCap, label: "Statement of Purpose", description: "Essay formal para universidades US/UK", category: "education" },
  { id: "personal_statement", icon: GraduationCap, label: "Personal Statement", description: "Essay pessoal para bolsas UK", category: "education" },
  { id: "research_proposal", icon: BookOpen, label: "Proposta de Pesquisa", description: "Research proposal para PhD", category: "education" },
  { id: "scholarship_essay", icon: GraduationCap, label: "Essay de Bolsa", description: "Essay para competições de bolsas", category: "education" },
  { id: "recommendation", icon: FileText, label: "Carta de Recomendação", description: "Draft para orientadores assinarem", category: "support" },
  { id: "transcript", icon: FileText, label: "Transcrição Escolar", description: "Transcrição acadêmica", category: "support" },
  { id: "language_cert", icon: FileText, label: "Certificação de Idiomas", description: "Certificados de proficiência linguística", category: "support" },
  { id: "portfolio", icon: Briefcase, label: "Portfólio", description: "Portfólio de trabalhos", category: "employment" },
  { id: "writing_sample", icon: FileEdit, label: "Amostra de Escrita", description: "Amostra de texto acadêmico", category: "education" },
  { id: "other", icon: FileText, label: "Outro", description: "Documento genérico", category: "other" },
];

const LANG_MAP: Record<string, string> = { "Inglês": "en", "Alemão": "de", "Francês": "fr", "Espanhol": "es", "Português": "pt" };

export default function NewDocumentPage() {
  const router = useRouter();
  const { createDocument, documents } = useForgeStore();
  const plan = useEffectivePlan();
  const allowed = canCreateForgeDocument(plan, documents.length);
  const cap = maxForgeDocuments(plan);

  const [selected, setSelected] = useState<DocType | null>(null);
  const [title, setTitle] = useState("");
  const [targetProgram, setTargetProgram] = useState("");
  const [language, setLanguage] = useState("Inglês");
  const [creating, setCreating] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedContent, setImportedContent] = useState<string>("");
  const [importedFilename, setImportedFilename] = useState<string>("");
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [opportunityTitle, setOpportunityTitle] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as DocType | null;
    const nextTitle = params.get("title") || "";
    const nextTargetProgram = params.get("targetProgram") || "";
    const oppId = params.get("opportunityId");
    const oppTitle = params.get("opportunityTitle");

    if (type) setSelected(type);
    if (nextTitle) setTitle(nextTitle);
    if (nextTargetProgram) setTargetProgram(nextTargetProgram);
    if (oppId) setOpportunityId(oppId);
    if (oppTitle) setOpportunityTitle(oppTitle);
  }, []);

  const handleCreate = async () => {
    if (!selected || !title.trim()) return;
    setCreating(true);
    const docId = await createDocument({
      title: title.trim(),
      type: selected,
      targetProgram: targetProgram.trim() || undefined,
      language: LANG_MAP[language] || "en",
      primaryOpportunityId: opportunityId || undefined,
      opportunityIds: opportunityId ? [opportunityId] : undefined,
    });
    if (!docId) {
      setCreating(false);
      return;
    }
    
    // If we have imported content, update the document with it
    if (importedContent) {
      const { updateContent } = useForgeStore.getState();
      await updateContent(docId, importedContent);
    }
    
    router.push(`/forge/${docId}`);
  };

  const handleContentExtracted = (content: string, filename: string) => {
    setImportedContent(content);
    setImportedFilename(filename);
    setShowImportModal(false);
    
    // Auto-fill title if empty
    if (!title.trim()) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-heading text-h2 text-text-primary">Limite do Forge no plano gratuito</h1>
        <p className="text-body text-text-secondary">
          Você pode manter até {Number.isFinite(cap) ? cap : "vários"} documentos. Faça upgrade para o Navegador ou
          Comandante para continuar criando sem limite.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-body-sm font-semibold text-white hover:bg-brand-600"
          >
            Ver planos
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/forge" className="inline-flex items-center gap-2 rounded-xl border border-cream-500 px-6 py-3 text-body-sm text-text-secondary hover:bg-cream-100">
            Voltar ao Forge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {opportunityTitle && (
        <div className="card-surface border border-brand-300 bg-brand-50/50 p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-medium text-brand-900">Criando ativo para:</p>
              <p className="text-lg font-semibold text-brand-700">{opportunityTitle}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="card-surface border border-brand-200/70 bg-gradient-to-br from-white via-brand-50/50 to-slate-50/90 p-6">
        <div className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1 text-caption font-medium text-brand-600 shadow-sm">
          Forge
        </div>
        <h1 className="mt-4 font-heading text-h2 text-text-primary">
          {opportunityTitle ? "Crie um ativo para esta oportunidade" : "Crie um documento que já nasça pronto para avançar"}
        </h1>
        <p className="mt-2 max-w-2xl text-body text-text-secondary">
          Escolha a peça certa, defina o alvo e entre no editor com uma base orientada para candidaturas internacionais.
        </p>
        <p className="mt-3 max-w-2xl text-body-sm text-text-muted">
          Cada documento refinado melhora a leitura do seu contexto dentro do app e ajuda a sua Aura a sugerir próximos passos mais úteis.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-h4 text-text-primary">Qual peça você precisa agora?</h2>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500 text-brand-500 font-medium text-body-sm hover:bg-brand-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar de Arquivo
          </button>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === null
                ? "bg-brand-500 text-white"
                : "bg-cream-100 text-text-secondary hover:bg-cream-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter("employment")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === "employment"
                ? "bg-brand-500 text-white"
                : "bg-cream-100 text-text-secondary hover:bg-cream-200"
            }`}
          >
            Emprego
          </button>
          <button
            onClick={() => setCategoryFilter("education")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === "education"
                ? "bg-brand-500 text-white"
                : "bg-cream-100 text-text-secondary hover:bg-cream-200"
            }`}
          >
            Acadêmico
          </button>
          <button
            onClick={() => setCategoryFilter("support")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === "support"
                ? "bg-brand-500 text-white"
                : "bg-cream-100 text-text-secondary hover:bg-cream-200"
            }`}
          >
            Suporte
          </button>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {DOC_TYPES.filter(t => !categoryFilter || t.category === categoryFilter).map((type) => (
            <button key={type.id} onClick={() => setSelected(type.id)} className={`card-surface p-5 flex items-start gap-3 text-left transition-all ${selected === type.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === type.id ? "bg-brand-100" : "bg-cream-200"}`}>
                <type.icon className={`w-5 h-5 ${selected === type.id ? "text-brand-500" : "text-text-muted"}`} />
              </div>
              <div>
                <p className="font-heading font-semibold text-text-primary">{type.label}</p>
                <p className="text-caption text-text-secondary mt-0.5">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Nome interno do documento</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Carta de Motivação — TU Berlin MSc Computer Science" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Programa ou vaga alvo</label>
            <input type="text" value={targetProgram} onChange={(e) => setTargetProgram(e.target.value)} placeholder="Ex: MSc Computer Science, TU Berlin" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Idioma</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option>Inglês</option><option>Alemão</option><option>Francês</option><option>Espanhol</option><option>Português</option>
            </select>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-body-sm text-text-secondary">
            O Forge prioriza clareza, aderência ao alvo e reaproveitamento inteligente entre documentos. Você entra no editor com menos fricção e mais contexto.
          </div>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparando editor...</> : <>Criar e abrir no editor <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-h3 text-text-primary">Importar Documento</h2>
                <p className="text-body-sm text-text-secondary mt-1">
                  Carregue um arquivo PDF, DOCX ou TXT para começar
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-6">
              <FileUpload
                onContentExtracted={handleContentExtracted}
                onClose={() => setShowImportModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Imported Content Indicator */}
      {importedContent && selected && (
        <div className="card-surface p-4 border-l-4 border-brand-500 bg-brand-50/30">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-text-primary">Conteúdo importado de: {importedFilename}</p>
              <p className="text-body-sm text-text-secondary mt-1">
                {importedContent.split(/\s+/).filter(Boolean).length} palavras • 
                O conteúdo será adicionado ao editor quando você criar o documento
              </p>
            </div>
            <button
              onClick={() => {
                setImportedContent("");
                setImportedFilename("");
              }}
              className="p-1 hover:bg-cream-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
