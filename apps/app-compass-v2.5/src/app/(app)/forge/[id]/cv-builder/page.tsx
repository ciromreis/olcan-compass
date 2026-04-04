"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Download, Upload, FileText, Sparkles } from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { PDFImporter } from "@/components/forge/PDFImporter";
import { PDFExporter } from "@/components/forge/PDFExporter";
import { SectionEditor, type CVSection } from "@/components/forge/SectionEditor";
import { CVTemplatesSelector, CV_TEMPLATES } from "@/components/forge/CVTemplates";
import { Button, useToast } from "@/components/ui";

export default function CVBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { toast } = useToast();
  
  const { getDocById, updateContent } = useForgeStore();
  const doc = getDocById(docId);
  
  const [sections, setSections] = useState<CVSection[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize sections from document content or show templates
  useEffect(() => {
    if (!doc || hasInitialized) return;
    
    if (doc.content.trim()) {
      // Try to parse existing content into sections
      const parsedSections = parseContentToSections(doc.content);
      setSections(parsedSections);
    } else {
      // Show templates for new CV
      setShowTemplates(true);
    }
    
    setHasInitialized(true);
  }, [doc, hasInitialized]);

  // Convert sections to markdown content
  const sectionsToContent = useCallback((secs: CVSection[]): string => {
    return secs
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const titlePrefix = s.type === "header" ? "" : "## ";
        return `${titlePrefix}${s.title}\n\n${s.content}`;
      })
      .join("\n\n---\n\n");
  }, []);

  // Save sections to document
  const handleSave = useCallback(() => {
    const content = sectionsToContent(sections);
    updateContent(docId, content);
    
    toast({
      title: "Currículo salvo",
      description: "Suas alterações foram salvas com sucesso.",
      variant: "success",
    });
  }, [docId, sections, sectionsToContent, updateContent, toast]);

  // Auto-save on sections change
  useEffect(() => {
    if (!hasInitialized || sections.length === 0) return;
    
    const timer = setTimeout(() => {
      const content = sectionsToContent(sections);
      updateContent(docId, content);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [sections, docId, sectionsToContent, updateContent, hasInitialized]);

  const handleTemplateSelect = (template: typeof CV_TEMPLATES[0]) => {
    const newSections: CVSection[] = template.sections.map((s, idx) => ({
      ...s,
      id: `section-${Date.now()}-${idx}`,
    }));
    
    setSections(newSections);
    setShowTemplates(false);
    
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" carregado com sucesso.`,
      variant: "success",
    });
  };

  const handleImport = (text: string) => {
    const importedSections = parseContentToSections(text);
    setSections(importedSections);
    setShowImporter(false);
    
    toast({
      title: "PDF importado",
      description: "Conteúdo extraído com sucesso. Revise e ajuste conforme necessário.",
      variant: "success",
    });
  };

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-brand-500 font-medium hover:underline">
          ← Voltar ao Forge
        </Link>
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/forge/${docId}`)}
            className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">
              Construtor de Currículo
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {doc.title}
            </p>
          </div>
        </div>

        <div className="card-surface border border-brand-200/70 bg-gradient-to-br from-white via-brand-50/50 to-slate-50/90 p-6">
          <div className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1 text-caption font-medium text-brand-600 shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            CV Builder
          </div>
          <h2 className="font-heading text-h3 text-text-primary mb-2">
            Comece com um template profissional
          </h2>
          <p className="text-body text-text-secondary max-w-2xl">
            Escolha uma estrutura otimizada para candidaturas internacionais. Você poderá personalizar todas as seções depois.
          </p>
        </div>

        <CVTemplatesSelector onSelectTemplate={handleTemplateSelect} />

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-cream-300" />
          <span className="text-caption text-text-muted font-medium">OU</span>
          <div className="flex-1 border-t border-cream-300" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowImporter(true)}
            className="card-surface p-6 text-left hover:-translate-y-0.5 transition-all border border-cream-300 hover:border-brand-400"
          >
            <Upload className="w-8 h-8 text-brand-500 mb-3" />
            <h3 className="font-heading text-body font-semibold text-text-primary mb-1">
              Importar PDF existente
            </h3>
            <p className="text-caption text-text-secondary">
              Extraia o conteúdo de um currículo em PDF e edite aqui
            </p>
          </button>

          <button
            onClick={() => {
              setSections([
                {
                  id: `section-${Date.now()}`,
                  type: "header",
                  title: "Informações Pessoais",
                  content: "",
                  visible: true,
                  order: 0,
                },
              ]);
              setShowTemplates(false);
            }}
            className="card-surface p-6 text-left hover:-translate-y-0.5 transition-all border border-cream-300 hover:border-brand-400"
          >
            <FileText className="w-8 h-8 text-brand-500 mb-3" />
            <h3 className="font-heading text-body font-semibold text-text-primary mb-1">
              Começar do zero
            </h3>
            <p className="text-caption text-text-secondary">
              Crie seu currículo com total liberdade e controle
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (showImporter) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImporter(false)}
            className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">
              Importar Currículo
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {doc.title}
            </p>
          </div>
        </div>

        <PDFImporter onImport={handleImport} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/forge/${docId}`}
            className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">
              Construtor de Currículo
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {doc.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowImporter(true)}
            variant="secondary"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Importar PDF
          </Button>
          
          <Button onClick={handleSave} variant="primary" size="sm">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <SectionEditor
            sections={sections}
            onSectionsChange={setSections}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Export */}
          <div className="card-surface p-4">
            <h3 className="font-heading text-body-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-500" />
              Exportar
            </h3>
            <PDFExporter
              documentId={docId}
              documentTitle={doc.title}
              content={sectionsToContent(sections)}
            />
          </div>

          {/* Stats */}
          <div className="card-surface p-4">
            <h3 className="font-heading text-body-sm font-semibold text-text-primary mb-3">
              Estatísticas
            </h3>
            <div className="space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-text-muted">Seções</span>
                <span className="font-medium text-text-primary">
                  {sections.filter((s) => s.visible).length} visíveis
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total de seções</span>
                <span className="font-medium text-text-primary">
                  {sections.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Palavras</span>
                <span className="font-medium text-text-primary">
                  {sections.reduce(
                    (sum, s) => sum + s.content.split(/\s+/).filter(Boolean).length,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card-surface border border-brand-100 bg-brand-50/40 p-4">
            <h3 className="font-heading text-body-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Dicas
            </h3>
            <ul className="space-y-2 text-caption text-text-secondary">
              <li>• Use verbos de ação no início de cada conquista</li>
              <li>• Quantifique resultados sempre que possível</li>
              <li>• Adapte o conteúdo para cada vaga específica</li>
              <li>• Mantenha o CV em 1-2 páginas no máximo</li>
            </ul>
          </div>

          {/* Change Template */}
          <Button
            onClick={() => setShowTemplates(true)}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            <FileText className="w-4 h-4" />
            Trocar template
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to parse content into sections
function parseContentToSections(content: string): CVSection[] {
  const sections: CVSection[] = [];
  const parts = content.split(/\n---\n|\n\n---\n\n/);
  
  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    // Try to detect section type and title
    const lines = trimmed.split("\n");
    const firstLine = lines[0];
    
    let title = "Seção";
    let contentStart = 0;
    let type: CVSection["type"] = "custom";
    
    if (firstLine.startsWith("## ")) {
      title = firstLine.replace("## ", "").trim();
      contentStart = 1;
    } else if (firstLine.startsWith("# ")) {
      title = firstLine.replace("# ", "").trim();
      contentStart = 1;
      type = "header";
    } else {
      title = firstLine;
      contentStart = 1;
    }
    
    // Detect type from title
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("experiência") || lowerTitle.includes("experience")) {
      type = "experience";
    } else if (lowerTitle.includes("formação") || lowerTitle.includes("education")) {
      type = "education";
    } else if (lowerTitle.includes("competência") || lowerTitle.includes("skill") || lowerTitle.includes("habilidade")) {
      type = "skills";
    } else if (lowerTitle.includes("idioma") || lowerTitle.includes("language")) {
      type = "languages";
    } else if (lowerTitle.includes("resumo") || lowerTitle.includes("summary") || lowerTitle.includes("perfil")) {
      type = "summary";
    } else if (index === 0 || lowerTitle.includes("cabeçalho") || lowerTitle.includes("contato") || lowerTitle.includes("contact")) {
      type = "header";
    }
    
    const sectionContent = lines.slice(contentStart).join("\n").trim();
    
    sections.push({
      id: `section-${Date.now()}-${index}`,
      type,
      title,
      content: sectionContent,
      visible: true,
      order: index,
    });
  });
  
  // If no sections were created, create a default header
  if (sections.length === 0) {
    sections.push({
      id: `section-${Date.now()}`,
      type: "header",
      title: "Informações Pessoais",
      content: content,
      visible: true,
      order: 0,
    });
  }
  
  return sections;
}
