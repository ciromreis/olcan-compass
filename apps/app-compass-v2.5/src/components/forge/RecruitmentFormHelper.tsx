"use client";

import { useState, useMemo } from "react";
import { Copy, CheckCircle, ChevronDown, ChevronUp, Briefcase, GraduationCap, Award, Mail, Phone, MapPin } from "lucide-react";
import type { ForgeDocument } from "@/stores/forge";

interface RecruitmentFormHelperProps {
  doc: ForgeDocument;
  content: string;
}

interface FormField {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "personal" | "education" | "experience" | "skills";
}

/**
 * Recruitment Form Helper
 * 
 * Extracts structured data from CV/document content and provides
 * quick-copy snippets for pasting into recruitment application forms.
 * 
 * This helps users fill out repetitive application forms faster by
 * providing pre-formatted text snippets from their documents.
 */
export function RecruitmentFormHelper({ doc, content }: RecruitmentFormHelperProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["personal", "education"])
  );

  // Extract structured data from document content
  const formFields = useMemo(() => extractFormFields(doc, content), [doc, content]);

  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const grouped: Record<string, FormField[]> = {
      personal: [],
      education: [],
      experience: [],
      skills: [],
    };

    formFields.forEach((field) => {
      grouped[field.category].push(field);
    });

    return grouped;
  }, [formFields]);

  const handleCopy = async (field: FormField) => {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopiedField(field.id);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categories = [
    { id: "personal", label: "Informações Pessoais", icon: Mail },
    { id: "education", label: "Formação Acadêmica", icon: GraduationCap },
    { id: "experience", label: "Experiência Profissional", icon: Briefcase },
    { id: "skills", label: "Habilidades e Competências", icon: Award },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
        <div className="flex items-start gap-3">
          <Copy className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
          <div className="text-xs text-brand-700">
            <p className="font-medium">Assistente de Formulários</p>
            <p className="mt-1 text-brand-600">
              Clique em qualquer campo para copiar o texto e colar diretamente em formulários de
              candidatura.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map((category) => {
          const fields = fieldsByCategory[category.id as keyof typeof fieldsByCategory];
          const isExpanded = expandedCategories.has(category.id);
          const Icon = category.icon;

          if (fields.length === 0) return null;

          return (
            <div
              key={category.id}
              className="overflow-hidden rounded-2xl border border-white/60 bg-white/50 backdrop-blur-sm"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-cream-50"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand-500" />
                  <span className="text-sm font-semibold text-text-primary">{category.label}</span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {fields.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                )}
              </button>

              {/* Category Fields */}
              {isExpanded && (
                <div className="border-t border-cream-200 p-2">
                  <div className="space-y-1">
                    {fields.map((field) => {
                      const FieldIcon = field.icon;
                      const isCopied = copiedField === field.id;

                      return (
                        <button
                          key={field.id}
                          onClick={() => handleCopy(field)}
                          className="group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all hover:bg-cream-100"
                        >
                          <FieldIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted group-hover:text-brand-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-text-muted">{field.label}</p>
                            <p className="mt-1 text-sm text-text-primary">{field.value}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isCopied ? (
                              <CheckCircle className="h-4 w-4 text-brand-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {formFields.length === 0 && (
        <div className="rounded-2xl border border-cream-200 bg-cream-50 p-8 text-center">
          <Copy className="mx-auto h-8 w-8 text-text-muted opacity-50" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            Nenhum campo detectado
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Adicione mais informações ao seu documento para gerar campos copiáveis.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Extracts structured form fields from document content.
 * Uses pattern matching and heuristics to identify common CV sections.
 */
function extractFormFields(doc: ForgeDocument, content: string): FormField[] {
  const fields: FormField[] = [];
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract email
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    fields.push({
      id: "email",
      label: "E-mail",
      value: emailMatch[0],
      icon: Mail,
      category: "personal",
    });
  }

  // Extract phone
  const phoneMatch = content.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/);
  if (phoneMatch) {
    fields.push({
      id: "phone",
      label: "Telefone",
      value: phoneMatch[0],
      icon: Phone,
      category: "personal",
    });
  }

  // Extract location (city, country)
  const locationPatterns = [
    /(?:cidade|city|location|localização):\s*(.+)/i,
    /(?:^|\n)([A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*,\s*[A-Z]{2})/,
  ];
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) {
      fields.push({
        id: "location",
        label: "Localização",
        value: match[1] || match[0],
        icon: MapPin,
        category: "personal",
      });
      break;
    }
  }

  // Extract education sections
  const educationKeywords = ["educação", "formação", "education", "academic", "universidade", "university"];
  const educationSections = extractSections(lines, educationKeywords);
  educationSections.forEach((section, index) => {
    fields.push({
      id: `education-${index}`,
      label: `Formação ${index + 1}`,
      value: section,
      icon: GraduationCap,
      category: "education",
    });
  });

  // Extract experience sections
  const experienceKeywords = ["experiência", "experience", "trabalho", "work", "profissional", "professional"];
  const experienceSections = extractSections(lines, experienceKeywords);
  experienceSections.forEach((section, index) => {
    fields.push({
      id: `experience-${index}`,
      label: `Experiência ${index + 1}`,
      value: section,
      icon: Briefcase,
      category: "experience",
    });
  });

  // Extract skills
  const skillsKeywords = ["habilidades", "skills", "competências", "competencies", "conhecimentos"];
  const skillsSections = extractSections(lines, skillsKeywords);
  skillsSections.forEach((section, index) => {
    fields.push({
      id: `skills-${index}`,
      label: `Habilidades ${index + 1}`,
      value: section,
      icon: Award,
      category: "skills",
    });
  });

  // Add document title as summary if it's a CV
  if (doc.type === "cv" && doc.title) {
    fields.unshift({
      id: "name",
      label: "Nome",
      value: doc.title,
      icon: Mail,
      category: "personal",
    });
  }

  return fields;
}

/**
 * Extracts sections from content based on keywords.
 */
function extractSections(lines: string[], keywords: string[]): string[] {
  const sections: string[] = [];
  let currentSection: string[] = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if this line is a section header
    const isHeader = keywords.some((keyword) => lowerLine.includes(keyword));

    if (isHeader) {
      // Save previous section if exists
      if (currentSection.length > 0) {
        sections.push(currentSection.join("\n"));
      }
      currentSection = [];
      inSection = true;
      continue;
    }

    // Check if we've hit a new major section (all caps or starts with #)
    const isNewMajorSection = line === line.toUpperCase() && line.length > 3 || line.startsWith("#");
    if (isNewMajorSection && inSection && currentSection.length > 0) {
      sections.push(currentSection.join("\n"));
      currentSection = [];
      inSection = false;
      continue;
    }

    // Add line to current section
    if (inSection) {
      currentSection.push(line);
    }
  }

  // Add final section
  if (currentSection.length > 0) {
    sections.push(currentSection.join("\n"));
  }

  return sections.filter((s) => s.trim().length > 20); // Filter out very short sections
}
