"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  List,
  Zap,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { type DocType, DOC_TYPE_LABELS, useForgeStore } from "@/stores/forge";
import { fetchDocumentGuidance, type CMSDocumentGuidance } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

interface DocumentGuidancePanelProps {
  documentId: string;
  className?: string;
}

const DEFAULT_GUIDANCE: Record<string, CMSDocumentGuidance> = {
  cv: {
    id: "default-cv",
    document_type: "cv",
    title: "Currículo (CV)",
    description: "Documento resumido showcaseando experiência, formação e competências. Otimizado para ATS.",
    structure: [
      "Cabeçalho com informações de contato",
      "Resumo profissional (2-3 linhas)",
      "Experiência profissional (inverso cronológico)",
      "Formação acadêmica",
      "Competências técnicas e interpessoais",
      "Idiomas e certificações",
    ],
    tips: [
      "Use verbos de ação no início de cada bullet: 'Desenvolvi', 'Liderei', 'Implementei'",
      "Quantifique conquistas quando possível (ex: 'Aumentou em 30%')",
      "Mantenha entre 1-2 páginas",
      "Use palavras-chave da área para passar no ATS",
    ],
    word_count_range: { min: 200, max: 800 },
    common_mistakes: [
      "Usar pronome 'eu' em todas as frases",
      "Incluir experiências irrelevantes",
      "Deixar formatação inconsistente",
      "Esquecer de atualizar",
    ],
  },
  motivation_letter: {
    id: "default-motivation",
    document_type: "motivation_letter",
    title: "Carta de Motivação",
    description: "Carta explicando por que você é o candidato ideal para o programa.",
    structure: [
      "Introdução: interesse no programa",
      "Corpo: motivação e qualificações",
      "Conclusão: fit e chamada para ação",
    ],
    tips: [
      "Seja específico: mencione o programa/instituição pelo nome",
      "Conecte suas experiências aos requisitos",
      "Evite repetir o CV",
      "Mantenha tom profissional mas pessoal",
    ],
    word_count_range: { min: 250, max: 500 },
    common_mistakes: [
      "Carta genérica para múltiplos programas",
      "Repetir informações do CV",
      "Erros gramaticais",
      "Tom muito formal ou muito informal",
    ],
  },
  personal_statement: {
    id: "default-personal",
    document_type: "personal_statement",
    title: "Personal Statement",
    description: "Narrativa pessoal sobre motivações, experiências e objetivos.",
    structure: [
      "Narrativa de origem/motivação",
      "Desenvolvimento pessoal",
      "Desafios e superações",
      "Objetivos futuros",
    ],
    tips: [
      "Conte uma história autêntica",
      "Mostre evolução, não apenas conquistas",
      "Seja específico com exemplos",
      "Conecte passado, presente e futuro",
    ],
    word_count_range: { min: 500, max: 1000 },
    common_mistakes: [
      "Ser genérico ou previsível",
      "Usar clichês extremos",
      "Focar apenas em conquistas",
      "Esquecer do 'por quê'",
    ],
  },
  statement_of_purpose: {
    id: "default-sop",
    document_type: "statement_of_purpose",
    title: "Statement of Purpose",
    description: "Documento acadêmico explicando área de pesquisa e objetivos.",
    structure: [
      "Introdução: área de interesse",
      "Background acadêmico",
      "Experiência de pesquisa",
      "Objetivos de pesquisa",
      "Por que este programa",
    ],
    tips: [
      "Seja específico sobre área de pesquisa",
      "Mencione potenciais orientadores",
      "Mostre conhecimento do programa",
      "Demonstre fit",
    ],
    word_count_range: { min: 500, max: 1500 },
    common_mistakes: [
      "Ser genérico",
      "Não mencionar pesquisa específica",
      "Não mostrar conhecimento do programa",
      "Tom muito informal",
    ],
  },
  research_proposal: {
    id: "default-research",
    document_type: "research_proposal",
    title: "Proposta de Pesquisa",
    description: "Plano detalhado de pesquisa acadêmica.",
    structure: [
      "Título e resumo",
      "Introdução e contextualização",
      "Objetivos",
      "Metodologia",
      "Cronograma",
      "Referências",
    ],
    tips: [
      "Seja específico e realizável",
      "Mostre viabilidade",
      "Demonstre expertise",
      "Use metodologia adequada",
    ],
    word_count_range: { min: 1500, max: 3000 },
    common_mistakes: [
      "Proposta muito ampla",
      "Não mostrar expertise",
      "Cronograma irrealista",
      "Falta de originalidade",
    ],
  },
  recommendation: {
    id: "default-rec",
    document_type: "recommendation",
    title: "Carta de Recomendação",
    description: "Carta de recomendação de professor/empregador.",
    structure: [
      "Relacionamento com o candidato",
      "Qualidades observadas",
      "Exemplos específicos",
      "Comparação com pares",
      "Recomendação final",
    ],
    tips: [
      "Forneça exemplos concretos",
      "Seja específico com métricas",
      "Evite frases genéricas",
      "Destaque pontos únicos",
    ],
    word_count_range: { min: 300, max: 600 },
    common_mistakes: [
      "Carta genérica",
      "Sem exemplos",
      "Comparação vaga",
      "Tom inadequado",
    ],
  },
  resume: {
    id: "default-resume",
    document_type: "resume",
    title: "Resume",
    description: "Versão condensada do CV para mercados internacionais.",
    structure: [
      "Header",
      "Summary",
      "Experience",
      "Education",
      "Skills",
    ],
    tips: [
      "Use formato clean",
      "Foque em resultados",
      "Use ação verbos",
      "Keep it 1 page",
    ],
    word_count_range: { min: 300, max: 600 },
  },
  cover_letter: {
    id: "default-cover",
    document_type: "cover_letter",
    title: "Carta de Apresentação",
    description: "Carta para vagas de trabalho.",
    structure: [
      "Header + Address",
      "Opening paragraph",
      "Body",
      "Closing",
    ],
    tips: [
      "Customize para cada vaga",
      "Match requirements",
      "Show Enthusiasm",
      "Call to action",
    ],
    word_count_range: { min: 200, max: 400 },
  },
  scholarship_essay: {
    id: "default-scholarship",
    document_type: "scholarship_essay",
    title: "Essay de Bolsa",
    description: "Essay para aplicações de bolsa de estudos.",
    structure: [
      "Oportunidade/Alcance",
      "Background",
      "Goals",
      "Need/Impact",
    ],
    tips: [
      "Show need + merit",
      "Be specific",
      "Narrative voice",
      "Future impact",
    ],
    word_count_range: { min: 500, max: 1000 },
  },
  transcript: {
    id: "default-transcript",
    document_type: "transcript",
    title: "Transcrição Escolar",
    description: "Histórico acadêmico formal.",
    structure: [
      "Instituição",
      "Courses/Grades",
      "GPA context",
    ],
    tips: [
      "Official only",
      "Include scale",
      "Add context if needed",
    ],
  },
  language_cert: {
    id: "default-lang",
    document_type: "language_cert",
    title: "Certificação de Idiomas",
    description: "Certificado de proficiência linguística.",
    structure: [
      "Test name",
      "Score",
      "Date",
    ],
    tips: [
      "Official document",
      "Valid dates check",
    ],
  },
  portfolio: {
    id: "default-portfolio",
    document_type: "portfolio",
    title: "Portfólio",
    description: "Coleção de trabalhos e projetos.",
    structure: [
      "Intro",
      "Projects",
      "Skills demonstrated",
    ],
    tips: [
      "Quality over quantity",
      "Link to targets",
    ],
  },
  writing_sample: {
    id: "default-writing",
    document_type: "writing_sample",
    title: "Amostra de Escrita",
    description: "Amostra de escrita acadêmica ou profissional.",
    structure: [
      "Context",
      "Thesis",
      "Argumentation",
    ],
    tips: [
      "Recent work",
      "Show range",
    ],
  },
  other: {
    id: "default-other",
    document_type: "other",
    title: "Outro Documento",
    description: "Documento genérico.",
    structure: [
      "Content",
    ],
    tips: [],
  },
};

export function DocumentGuidancePanel({ documentId, className = "" }: DocumentGuidancePanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"structure" | "tips" | "mistakes">("structure");
  const [guidance, setGuidance] = useState<CMSDocumentGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { getDocById } = useForgeStore();
  const doc = getDocById(documentId);
  const docType = doc?.type || "other";

  useEffect(() => {
    if (!docType) return;
    
    async function loadGuidance() {
      setLoading(true);
      try {
        const cmsGuidance = await fetchDocumentGuidance(docType);
        if (cmsGuidance) {
          setGuidance(cmsGuidance);
        } else {
          const fallback = DEFAULT_GUIDANCE[docType];
          setGuidance(fallback || null);
        }
      } catch {
        const fallback = DEFAULT_GUIDANCE[docType];
        setGuidance(fallback || null);
      } finally {
        setLoading(false);
      }
    }
    
    loadGuidance();
  }, [docType]);

  if (!doc) return null;

  const currentGuidance = guidance || DEFAULT_GUIDANCE[doc.type];
  if (!currentGuidance) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <BookOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-heading text-h4 text-[#001338]">Guia: {DOC_TYPE_LABELS[doc.type]}</h3>
              <p className="text-caption text-[#001338]/50">
                {currentGuidance.word_count_range 
                  ? `${currentGuidance.word_count_range.min}-${currentGuidance.word_count_range.max} palavras`
                  : "指南"}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-[#001338]/30" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#001338]/30" />
          )}
        </button>

        {expanded && (
          <div className="mt-5 space-y-4">
            <div className="flex gap-1 rounded-lg bg-cream-100 p-1">
              {(["structure", "tips", "mistakes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
                    activeTab === tab
                      ? "bg-white text-[#001338] shadow-sm"
                      : "text-[#001338]/50 hover:text-[#001338]"
                  )}
                >
                  {tab === "structure" && "Estrutura"}
                  {tab === "tips" && "Dicas"}
                  {tab === "mistakes" && "Erros"}
                </button>
              ))}
            </div>

            {activeTab === "structure" && currentGuidance.structure && (
              <div className="space-y-2">
                {currentGuidance.structure.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-[#001338]">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tips" && currentGuidance.tips && (
              <div className="space-y-2">
                {currentGuidance.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg bg-emerald-50/50 p-2">
                    <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <p className="text-sm text-[#001338]">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "mistakes" && currentGuidance && (
              <div className="space-y-2">
                {(currentGuidance.common_mistakes || []).map((mistake, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg bg-rose-50/50 p-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                    <p className="text-sm text-[#001338]">{mistake}</p>
                  </div>
                ))}
              </div>
            )}

            {currentGuidance.keywords && currentGuidance.keywords.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#001338]/40">
                  Palavras-chave
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentGuidance.keywords.slice(0, 10).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-[#001338]/5 px-2 py-0.5 text-xs font-medium text-[#001338]/70"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}