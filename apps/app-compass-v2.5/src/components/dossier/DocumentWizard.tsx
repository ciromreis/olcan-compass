"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Eye,
} from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DocumentType, WizardStep } from "@/types/dossier-system";

interface DocumentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  dossierId: string;
  documentType: DocumentType;
  onComplete: (documentData: any) => void;
}

export function DocumentWizard({
  isOpen,
  onClose,
  dossierId,
  documentType,
  onComplete,
}: DocumentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Define wizard steps based on document type
  const steps = getWizardSteps(documentType);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setWizardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    setIsGenerating(true);
    
    // TODO: Generate document content from wizard data
    // This would call AI service to generate professional content
    
    setTimeout(() => {
      onComplete(wizardData);
      setIsGenerating(false);
      onClose();
    }, 2000);
  }, [wizardData, onComplete, onClose]);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="flex h-[80vh] flex-col">
        {/* Header */}
        <div className="border-b border-cream-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              {getDocumentTypeLabel(documentType)}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted hover:bg-cream-100"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <span className="font-medium text-brand-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-all",
                  index === currentStep
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : index < currentStep
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-cream-200 bg-white text-text-muted"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="flex h-3 w-3 items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h3 className="font-heading text-lg font-semibold text-text-primary">
                {currentStepData.title}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{currentStepData.description}</p>
            </div>

            {/* Step Content */}
            <div className="space-y-6">
              {renderStepContent(currentStepData, wizardData, handleFieldChange)}
            </div>

            {/* AI Suggestions */}
            {currentStepData.aiSuggestions && (
              <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-brand-900">Sugestões da IA</h4>
                    <p className="mt-1 text-sm text-brand-700">
                      A IA pode ajudar a gerar conteúdo profissional baseado nas suas informações.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      disabled={isGenerating}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isGenerating ? "Gerando..." : "Gerar com IA"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ATS Optimization */}
            {currentStepData.atsOptimization && (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-emerald-900">Otimização ATS</h4>
                    <p className="mt-1 text-sm text-emerald-700">
                      Este conteúdo será otimizado para sistemas de rastreamento de candidatos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-cream-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose}>
                Salvar e Sair
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Finalizar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// WIZARD STEP DEFINITIONS
// ============================================================================

function getWizardSteps(documentType: DocumentType): WizardStep[] {
  switch (documentType) {
    case "cv":
    case "resume":
      return CV_WIZARD_STEPS;
    case "motivation_letter":
    case "cover_letter":
      return MOTIVATION_LETTER_STEPS;
    case "research_proposal":
      return RESEARCH_PROPOSAL_STEPS;
    default:
      return GENERIC_DOCUMENT_STEPS;
  }
}

const CV_WIZARD_STEPS: WizardStep[] = [
  {
    id: "opportunity_context",
    title: "Contexto da Vaga",
    description: "Cole a descrição da vaga para otimização ATS automática",
    type: "form",
    required: true,
    dependsOn: [],
    atsOptimization: true,
  },
  {
    id: "personal_info",
    title: "Informações Pessoais",
    description: "Dados de contato e identificação",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "professional_summary",
    title: "Resumo Profissional",
    description: "Pitch de 2-3 linhas alinhado com a vaga",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
    atsOptimization: true,
  },
  {
    id: "experience",
    title: "Experiência",
    description: "Histórico profissional com foco em resultados",
    type: "form",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "education",
    title: "Formação",
    description: "Histórico acadêmico",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "skills",
    title: "Competências",
    description: "Skills técnicas e soft skills",
    type: "form",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "ats_review",
    title: "Revisão ATS",
    description: "Análise de compatibilidade com a vaga",
    type: "review",
    required: false,
    dependsOn: [],
    atsOptimization: true,
  },
  {
    id: "final_review",
    title: "Revisão Final",
    description: "Visualize e finalize seu currículo",
    type: "review",
    required: true,
    dependsOn: [],
  },
];

const MOTIVATION_LETTER_STEPS: WizardStep[] = [
  {
    id: "opportunity_context",
    title: "Sobre a Oportunidade",
    description: "Informações sobre o programa e instituição",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "motivation",
    title: "Motivação",
    description: "Por que você quer esta oportunidade?",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "qualifications",
    title: "Qualificações",
    description: "Por que você é adequado?",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "goals",
    title: "Objetivos",
    description: "O que você pretende alcançar?",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "final_review",
    title: "Revisão Final",
    description: "Revise e finalize sua carta",
    type: "review",
    required: true,
    dependsOn: [],
  },
];

const RESEARCH_PROPOSAL_STEPS: WizardStep[] = [
  {
    id: "title",
    title: "Título",
    description: "Título da pesquisa",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "abstract",
    title: "Resumo",
    description: "Resumo executivo da proposta",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "introduction",
    title: "Introdução",
    description: "Contexto e justificativa",
    type: "editor",
    required: true,
    dependsOn: [],
  },
  {
    id: "literature_review",
    title: "Revisão de Literatura",
    description: "Estado da arte",
    type: "editor",
    required: true,
    dependsOn: [],
  },
  {
    id: "methodology",
    title: "Metodologia",
    description: "Como você vai conduzir a pesquisa",
    type: "editor",
    required: true,
    dependsOn: [],
  },
  {
    id: "timeline",
    title: "Cronograma",
    description: "Planejamento temporal",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "budget",
    title: "Orçamento",
    description: "Recursos necessários",
    type: "form",
    required: false,
    dependsOn: [],
  },
  {
    id: "references",
    title: "Referências",
    description: "Bibliografia",
    type: "editor",
    required: true,
    dependsOn: [],
  },
  {
    id: "final_review",
    title: "Revisão Final",
    description: "Revise sua proposta completa",
    type: "review",
    required: true,
    dependsOn: [],
  },
];

const GENERIC_DOCUMENT_STEPS: WizardStep[] = [
  {
    id: "basic_info",
    title: "Informações Básicas",
    description: "Título e tipo do documento",
    type: "form",
    required: true,
    dependsOn: [],
  },
  {
    id: "content",
    title: "Conteúdo",
    description: "Escreva o conteúdo do documento",
    type: "editor",
    required: true,
    dependsOn: [],
    aiSuggestions: true,
  },
  {
    id: "review",
    title: "Revisão",
    description: "Revise e finalize",
    type: "review",
    required: true,
    dependsOn: [],
  },
];

// ============================================================================
// STEP CONTENT RENDERING
// ============================================================================

function renderStepContent(
  step: WizardStep,
  data: Record<string, any>,
  onChange: (field: string, value: any) => void
) {
  switch (step.id) {
    // ========================================================================
    // OPPORTUNITY CONTEXT (for CV/Resume)
    // ========================================================================
    case "opportunity_context":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Descrição da Vaga
            </label>
            <textarea
              value={data.jobDescription || ""}
              onChange={(e) => onChange("jobDescription", e.target.value)}
              placeholder="Cole aqui a descrição completa da vaga..."
              className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              rows={10}
            />
            <p className="mt-2 text-xs text-text-muted">
              A IA extrairá palavras-chave e requisitos automaticamente
            </p>
          </div>
        </div>
      );

    case "personal_info":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={data.fullName || ""}
                onChange={(e) => onChange("fullName", e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email *
              </label>
              <input
                type="email"
                value={data.email || ""}
                onChange={(e) => onChange("email", e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => onChange("phone", e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Localização
              </label>
              <input
                type="text"
                value={data.location || ""}
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="Cidade, País"
                className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={data.linkedin || ""}
              onChange={(e) => onChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      );

    case "professional_summary":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Resumo Profissional
            </label>
            <textarea
              value={data.professionalSummary || ""}
              onChange={(e) => onChange("professionalSummary", e.target.value)}
              placeholder="Escreva um resumo de 2-3 linhas destacando sua experiência e valor..."
              className="w-full rounded-lg border border-cream-300 bg-white p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              rows={4}
            />
            <p className="mt-2 text-xs text-text-muted">
              Foque em resultados quantificáveis e palavras-chave da vaga
            </p>
          </div>
        </div>
      );

    case "final_review":
      return (
        <div className="space-y-6">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-6">
            <h4 className="font-medium text-text-primary mb-4">Prévia do Documento</h4>
            <div className="rounded-lg border border-cream-300 bg-white p-6 min-h-[300px]">
              <p className="text-sm text-text-muted text-center py-12">
                Prévia do documento será gerada aqui...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            <span>Todas as seções obrigatórias foram preenchidas</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-dashed border-cream-300 bg-cream-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-cream-400" />
          <p className="mt-3 text-sm text-text-muted">
            Conteúdo do passo "{step.title}" em desenvolvimento
          </p>
        </div>
      );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    cv: "Criar Currículo",
    resume: "Criar Resume",
    motivation_letter: "Criar Carta de Motivação",
    cover_letter: "Criar Cover Letter",
    research_proposal: "Criar Proposta de Pesquisa",
    personal_statement: "Criar Personal Statement",
    statement_of_purpose: "Criar Statement of Purpose",
    recommendation_letter: "Carta de Recomendação",
    transcript: "Histórico Escolar",
    portfolio: "Portfólio",
    writing_sample: "Amostra de Escrita",
    other: "Criar Documento",
  };
  return labels[type] || "Criar Documento";
}
