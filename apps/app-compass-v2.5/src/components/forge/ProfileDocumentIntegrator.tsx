"use client";

import { useState, useMemo, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Calendar,
  MapPin,
  FileText,
  ArrowRight,
  Plus,
  Copy,
  Wand2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Building,
  Mail,
  Phone,
  Globe,
  Clock,
} from "lucide-react";
import { useForgeStore, type ForgeDocument, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    highlights?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    language: string;
    level: string;
  }>;
  achievements?: string[];
}

interface ProfileDocumentIntegratorProps {
  documentId: string;
  onApplyProfile?: (field: string, value: string) => void;
  className?: string;
}

export function ProfileDocumentIntegrator({ documentId, onApplyProfile, className = "" }: ProfileDocumentIntegratorProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { getDocById, updateContent } = useForgeStore();
  const { applications } = useApplicationStore();

  const doc = getDocById(documentId);

  const profileData: ProfileData = useMemo(() => {
    return {
      fullName: "Seu Nome Completo",
      email: "seu@email.com",
      location: "Cidade, País",
      summary: "Profissional com experiência em...",
      experience: [
        { title: "Cargo Atual", company: "Empresa Atual", duration: "2023 - Presente", highlights: ["Conquistas e responsabilidades"] },
        { title: "Cargo Anterior", company: "Empresa Anterior", duration: "2020 - 2023", highlights: ["Conquistas"] },
      ],
      education: [
        { degree: "Graduação em Área", institution: "Universidade", year: "2020" },
      ],
      skills: ["Habilidade 1", "Habilidade 2", "Habilidade 3"],
      languages: [{ language: "Português", level: "Nativo" }, { language: "Inglês", level: "Avançado" }],
      achievements: ["Conquista 1", "Conquista 2"],
    };
  }, []);

  const profileFields = useMemo(() => {
    const docType = doc?.type;
    const isCV = docType === "cv" || docType === "resume";
    const isCoverLetter = docType === "cover_letter" || docType === "motivation_letter";
    const isStatement = docType === "statement_of_purpose" || docType === "personal_statement";

    return [
      {
        id: "header",
        label: "Cabeçalho",
        icon: User,
        available: true,
        fields: [
          { key: "fullName", label: "Nome Completo", value: profileData.fullName },
          { key: "email", label: "Email", value: profileData.email },
          { key: "phone", label: "Telefone", value: profileData.phone },
          { key: "location", label: "Localização", value: profileData.location },
        ],
      },
      {
        id: "summary",
        label: "Resumo Profissional",
        icon: Briefcase,
        available: isCV || isCoverLetter || isStatement,
        fields: [
          { key: "summary", label: "Resumo", value: profileData.summary },
        ],
      },
      {
        id: "experience",
        label: "Experiência",
        icon: Briefcase,
        available: isCV || isCoverLetter,
        fields: profileData.experience?.map((exp, idx) => ({
          key: `experience_${idx}`,
          label: `${exp.title} @ ${exp.company}`,
          value: `${exp.title}\n${exp.company}\n${exp.duration}\n${exp.highlights?.join("\n") || ""}`,
        })) || [],
      },
      {
        id: "education",
        label: "Formação",
        icon: GraduationCap,
        available: isCV,
        fields: profileData.education?.map((edu, idx) => ({
          key: `education_${idx}`,
          label: `${edu.degree} - ${edu.institution}`,
          value: `${edu.degree}\n${edu.institution}${edu.year ? ` (${edu.year})` : ""}`,
        })) || [],
      },
      {
        id: "skills",
        label: "Competências",
        icon: Award,
        available: isCV || isCoverLetter,
        fields: [
          { key: "skills", label: "Habilidades", value: profileData.skills?.join(", ") || "" },
        ],
      },
      {
        id: "languages",
        label: "Idiomas",
        icon: Languages,
        available: isCV,
        fields: [
          { key: "languages", label: "Idiomas", value: profileData.languages?.map(l => `${l.language}: ${l.level}`).join(", ") || "" },
        ],
      },
      {
        id: "achievements",
        label: "Conquistas",
        icon: Award,
        available: isCV || isStatement,
        fields: [
          { key: "achievements", label: "Conquistas", value: profileData.achievements?.join("\n") || "" },
        ],
      },
    ].filter((group) => group.available);
  }, [doc?.type, profileData]);

  const handleApplyField = async (fieldKey: string, fieldValue: string | undefined) => {
    if (!doc || !fieldValue) return;
    
    setIsApplying(true);
    setSelectedField(fieldKey);
    
    try {
      let newContent = doc.content;
      
      if (fieldKey === "fullName") {
        newContent = `${fieldValue}\n${profileData.email} | ${profileData.location}`;
      } else if (fieldKey === "skills") {
        const skillsSection = `\n\n## Competências\n${fieldValue}`;
        if (newContent.includes("## Competências")) {
          newContent = newContent.replace(/## Competências[\s\S]*$/, skillsSection.trim());
        } else {
          newContent += skillsSection;
        }
      } else if (fieldKey.startsWith("experience_")) {
        const exp = profileData.experience?.[parseInt(fieldKey.split("_")[1])];
        if (exp) {
          const expSection = `\n\n## Experiência Profissional\n\n${exp.title}\n${exp.company} | ${exp.duration}\n${exp.highlights?.join("\n") || ""}`;
          if (newContent.includes("## Experiência")) {
            newContent = newContent.replace(/## Experiência[\s\S]*$/, expSection.trim());
          } else {
            newContent += expSection;
          }
        }
      } else if (fieldKey.startsWith("education_")) {
        const edu = profileData.education?.[parseInt(fieldKey.split("_")[1])];
        if (edu) {
          const eduSection = `\n\n## Formação\n\n${edu.degree}\n${edu.institution}${edu.year ? ` (${edu.year})` : ""}`;
          if (newContent.includes("## Formação")) {
            newContent = newContent.replace(/## Formaç��o[\s\S]*$/, eduSection.trim());
          } else {
            newContent += eduSection;
          }
        }
      } else {
        const valueKey = fieldKey as keyof ProfileData;
        const baseValue = profileData[valueKey];
        if (typeof baseValue === "string" && baseValue) {
          const sectionHeader = profileFields.find(g => g.fields.some(f => f.key === fieldKey))?.label || fieldKey;
          const section = `\n\n## ${sectionHeader}\n\n${baseValue}`;
          if (newContent.includes(`## ${sectionHeader}`)) {
            newContent = newContent.replace(new RegExp(`## ${sectionHeader}[\\s\\S]*`), section.trim());
          } else {
            newContent += section;
          }
        }
      }
      
      await updateContent(documentId, newContent);
      onApplyProfile?.(fieldKey, fieldValue);
    } finally {
      setIsApplying(false);
      setSelectedField(null);
    }
  };

  if (!doc) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-heading text-h4 text-[#001338]">Integração de Perfil</h3>
              <p className="text-caption text-[#001338]/50">Preencha automaticamente do seu perfil</p>
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
            <p className="text-sm text-[#001338]/60">
              Clique em um campo para inseriri-lo no documento:
            </p>

            <div className="space-y-3">
              {profileFields.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <group.icon className="h-4 w-4 text-[#001338]/50" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#001338]/50">
                      {group.label}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() => handleApplyField(field.key, field.value)}
                        disabled={isApplying || !field.value}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border border-cream-200 bg-cream-50/50 p-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/30",
                          selectedField === field.key && isApplying && "border-brand-500 bg-brand-50"
                        )}
                      >
                        {selectedField === field.key && isApplying ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-brand-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[#001338]">{field.label}</p>
                          {field.value && (
                            <p className="truncate text-caption text-[#001338]/40">{field.value}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}