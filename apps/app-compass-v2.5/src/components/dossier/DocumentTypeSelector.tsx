"use client";

import { useState } from "react";
import {
  FileText,
  Mail,
  BookOpen,
  Award,
  Briefcase,
  GraduationCap,
  FileCheck,
  Image,
  PenTool,
} from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/dossier-system";

interface DocumentTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: DocumentType) => void;
}

export function DocumentTypeSelector({
  isOpen,
  onClose,
  onSelect,
}: DocumentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">
          Escolha o Tipo de Documento
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Selecione o tipo de documento que você deseja criar. Cada tipo tem um assistente
          personalizado para guiá-lo.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                "group relative rounded-xl border-2 p-4 text-left transition-all",
                selectedType === type.value
                  ? "border-brand-500 bg-brand-50"
                  : "border-cream-200 bg-white hover:border-brand-300 hover:bg-cream-50"
              )}
            >
              <div
                className={cn(
                  "mb-3 inline-flex rounded-lg p-2 transition-colors",
                  selectedType === type.value
                    ? "bg-brand-500 text-white"
                    : "bg-cream-100 text-text-muted group-hover:bg-brand-100 group-hover:text-brand-600"
                )}
              >
                {type.icon}
              </div>
              <h3 className="font-heading text-sm font-semibold text-text-primary mb-1">
                {type.label}
              </h3>
              <p className="text-xs text-text-muted">{type.description}</p>

              {selectedType === type.value && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                  <FileCheck className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSelect} disabled={!selectedType}>
            Continuar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const DOCUMENT_TYPES = [
  {
    value: "cv" as DocumentType,
    label: "Currículo (CV)",
    description: "Currículo completo com experiência e formação",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    value: "resume" as DocumentType,
    label: "Resume",
    description: "Resume conciso para vagas internacionais",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    value: "motivation_letter" as DocumentType,
    label: "Carta de Motivação",
    description: "Carta explicando sua motivação e fit",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    value: "cover_letter" as DocumentType,
    label: "Cover Letter",
    description: "Carta de apresentação para vagas",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    value: "research_proposal" as DocumentType,
    label: "Proposta de Pesquisa",
    description: "Proposta acadêmica detalhada",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    value: "personal_statement" as DocumentType,
    label: "Personal Statement",
    description: "Declaração pessoal para programas acadêmicos",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    value: "statement_of_purpose" as DocumentType,
    label: "Statement of Purpose",
    description: "Declaração de objetivos acadêmicos",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    value: "recommendation_letter" as DocumentType,
    label: "Carta de Recomendação",
    description: "Template para solicitar recomendações",
    icon: <Award className="h-5 w-5" />,
  },
  {
    value: "portfolio" as DocumentType,
    label: "Portfólio",
    description: "Portfólio de trabalhos e projetos",
    icon: <Image className="h-5 w-5" />,
  },
];
