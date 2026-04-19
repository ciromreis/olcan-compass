"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import {
  useProfileIntakeStore,
  type EducationEntry,
  type WorkExperience,
  type LanguageEntry,
  type LanguageLevel,
} from "@/stores/profileIntake";
import { PageHeader, useToast } from "@/components/ui";
import {
  User, Briefcase, GraduationCap, Globe, Target, Zap,
  Plus, Trash2, CheckCircle, AlertCircle, ChevronDown, ChevronRight,
  BookOpen, Award, Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Generic input helpers ────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200 transition";
const labelCls = "mb-1 block text-xs font-semibold text-text-secondary uppercase tracking-wide";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title, icon: Icon, color = "text-brand-600", children, defaultOpen = true,
}: {
  title: string;
  icon: typeof User;
  color?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-cream-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 font-heading text-sm font-semibold text-text-primary">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
      </button>
      {open && <div className="border-t border-cream-100 px-5 pb-5 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Completion ring ──────────────────────────────────────────────────────────

function CompletionRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const {
    intake, updateIntake,
    addEducation, updateEducation, removeEducation,
    addWorkExperience, updateWorkExperience, removeWorkExperience,
  } = useProfileIntakeStore();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Perfil salvo", description: "Seus dados foram guardados para uso no Forge.", variant: "success" });
    setTimeout(() => setSaved(false), 3000);
  };

  // Seed basic fields from auth user on first load
  const seedFromAuth = () => {
    if (user && !intake.fullName) {
      updateIntake({ fullName: user.full_name || "", email: user.email || "" });
    }
  };
  if (user && !intake.fullName && !intake.email) seedFromAuth();

  const score = intake.completionScore;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader backHref="/settings" title="Perfil de Carreira" />

      {/* Completion card */}
      <div className="flex items-center gap-5 rounded-2xl border border-cream-200 bg-gradient-to-br from-white to-cream-50 p-5">
        <CompletionRing score={score} />
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            {score >= 70 ? "Perfil robusto" : score >= 40 ? "Perfil em construção" : "Perfil incompleto"}
          </h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            {score >= 70
              ? "O Forge pode preencher documentos automaticamente com seus dados."
              : "Complete seu perfil para ativar o preenchimento automático de documentos no Forge."}
          </p>
          {score < 70 && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠ Seções como Experiência, Educação e Motivação precisam de dados.
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            saved
              ? "bg-emerald-100 text-emerald-700"
              : "bg-brand-500 text-white hover:bg-brand-600"
          )}
        >
          {saved ? <><CheckCircle className="h-4 w-4" /> Salvo</> : "Salvar perfil"}
        </button>
      </div>

      {/* Identity */}
      <Section title="Identidade e Contato" icon={User} color="text-brand-600">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo">
            <input className={inputCls} value={intake.fullName}
              onChange={(e) => updateIntake({ fullName: e.target.value })}
              placeholder="Seu nome completo" />
          </Field>
          <Field label="Email profissional">
            <input className={inputCls} type="email" value={intake.email}
              onChange={(e) => updateIntake({ email: e.target.value })}
              placeholder="seu@email.com" />
          </Field>
          <Field label="Telefone / WhatsApp">
            <input className={inputCls} value={intake.phone || ""}
              onChange={(e) => updateIntake({ phone: e.target.value })}
              placeholder="+55 11 99999-0000" />
          </Field>
          <Field label="Nacionalidade">
            <input className={inputCls} value={intake.nationality}
              onChange={(e) => updateIntake({ nationality: e.target.value })}
              placeholder="Brasileira" />
          </Field>
          <Field label="Cidade atual">
            <input className={inputCls} value={intake.currentCity}
              onChange={(e) => updateIntake({ currentCity: e.target.value })}
              placeholder="São Paulo" />
          </Field>
          <Field label="País atual">
            <input className={inputCls} value={intake.currentCountry}
              onChange={(e) => updateIntake({ currentCountry: e.target.value })}
              placeholder="Brasil" />
          </Field>
          <Field label="LinkedIn">
            <input className={inputCls} value={intake.linkedin || ""}
              onChange={(e) => updateIntake({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/seuperfil" />
          </Field>
          <Field label="Portfólio / Site">
            <input className={inputCls} value={intake.portfolio || ""}
              onChange={(e) => updateIntake({ portfolio: e.target.value })}
              placeholder="seuprojeto.com" />
          </Field>
        </div>
      </Section>

      {/* Professional summary */}
      <Section title="Resumo Profissional" icon={Briefcase} color="text-violet-600">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cargo atual">
            <input className={inputCls} value={intake.currentRole}
              onChange={(e) => updateIntake({ currentRole: e.target.value })}
              placeholder="Product Manager" />
          </Field>
          <Field label="Organização atual">
            <input className={inputCls} value={intake.currentOrganization}
              onChange={(e) => updateIntake({ currentOrganization: e.target.value })}
              placeholder="Empresa X" />
          </Field>
          <Field label="Anos de experiência">
            <input className={inputCls} value={intake.yearsOfExperience}
              onChange={(e) => updateIntake({ yearsOfExperience: e.target.value })}
              placeholder="5" />
          </Field>
          <Field label="Área de atuação">
            <input className={inputCls} value={intake.targetField}
              onChange={(e) => updateIntake({ targetField: e.target.value })}
              placeholder="Tecnologia, Políticas Públicas..." />
          </Field>
        </div>
        <Field label="Resumo profissional (2–4 frases para CV e perfis)">
          <textarea className={cn(inputCls, "h-24 resize-none")}
            value={intake.professionalSummary}
            onChange={(e) => updateIntake({ professionalSummary: e.target.value })}
            placeholder="Profissional de tecnologia com 5 anos de experiência em..." />
        </Field>
      </Section>

      {/* Education */}
      <Section title="Formação Acadêmica" icon={GraduationCap} color="text-emerald-600">
        <div className="space-y-4">
          {intake.education.map((edu) => (
            <EducationCard key={edu.id} entry={edu}
              onUpdate={(p) => updateEducation(edu.id, p)}
              onRemove={() => removeEducation(edu.id)} />
          ))}
          <button
            onClick={() => addEducation({
              degree: "", field: "", institution: "", country: "",
              graduationYear: "", gpa: "", isCurrent: false,
            })}
            className="flex items-center gap-2 rounded-lg border border-dashed border-cream-300 px-4 py-2.5 text-sm font-medium text-text-muted hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar formação
          </button>
        </div>
      </Section>

      {/* Work experience */}
      <Section title="Experiência Profissional" icon={Briefcase} color="text-amber-600">
        <div className="space-y-4">
          {intake.workExperience.map((exp) => (
            <WorkExpCard key={exp.id} entry={exp}
              onUpdate={(p) => updateWorkExperience(exp.id, p)}
              onRemove={() => removeWorkExperience(exp.id)} />
          ))}
          <button
            onClick={() => addWorkExperience({
              role: "", organization: "", location: "",
              startDate: "", isCurrent: true, achievements: [],
            })}
            className="flex items-center gap-2 rounded-lg border border-dashed border-cream-300 px-4 py-2.5 text-sm font-medium text-text-muted hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar experiência
          </button>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Competências e Idiomas" icon={Zap} color="text-sky-600">
        <Field label="Competências técnicas (separadas por vírgula)">
          <input className={inputCls}
            value={intake.technicalSkills.join(", ")}
            onChange={(e) =>
              updateIntake({ technicalSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="Python, React, SQL, Análise de Dados..." />
        </Field>
        <Field label="Soft skills (separadas por vírgula)">
          <input className={inputCls}
            value={intake.softSkills.join(", ")}
            onChange={(e) =>
              updateIntake({ softSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="Liderança, Comunicação, Pensamento crítico..." />
        </Field>
        <div className="space-y-3">
          <label className={labelCls}>Idiomas</label>
          {intake.languages.map((lang, i) => (
            <LanguageRow key={i} entry={lang}
              onChange={(updated) => {
                const langs = [...intake.languages];
                langs[i] = updated;
                updateIntake({ languages: langs });
              }}
              onRemove={() => {
                updateIntake({ languages: intake.languages.filter((_, j) => j !== i) });
              }}
            />
          ))}
          <button
            onClick={() => updateIntake({ languages: [...intake.languages, { language: "", level: "intermediate" }] })}
            className="flex items-center gap-2 rounded-lg border border-dashed border-cream-300 px-4 py-2.5 text-sm font-medium text-text-muted hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar idioma
          </button>
        </div>
      </Section>

      {/* Narrative */}
      <Section title="Narrativa e Motivação" icon={Target} color="text-clay-600" defaultOpen={false}>
        <p className="text-xs text-text-muted mb-2">
          Estes campos alimentam diretamente Cartas de Motivação, Personal Statements e ensaios de bolsas.
        </p>
        <Field label="Objetivo de carreira (longo prazo)">
          <textarea className={cn(inputCls, "h-24 resize-none")}
            value={intake.careerGoal}
            onChange={(e) => updateIntake({ careerGoal: e.target.value })}
            placeholder="Tornar-me líder em política de tecnologia na América Latina..." />
        </Field>
        <Field label="Por que estudar/trabalhar no exterior?">
          <textarea className={cn(inputCls, "h-24 resize-none")}
            value={intake.whyInternational}
            onChange={(e) => updateIntake({ whyInternational: e.target.value })}
            placeholder="Busco ampliar minha perspectiva global e contribuir..." />
        </Field>
        <Field label="Pontos fortes únicos (um por linha ou vírgula)">
          <textarea className={cn(inputCls, "h-20 resize-none")}
            value={intake.uniqueStrengths.join("\n")}
            onChange={(e) =>
              updateIntake({ uniqueStrengths: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="Experiência em 3 países&#10;Fluente em 4 idiomas&#10;Projetos open source reconhecidos" />
        </Field>
        <Field label="Conquistas principais (uma por linha)">
          <textarea className={cn(inputCls, "h-24 resize-none")}
            value={intake.keyAchievements.join("\n")}
            onChange={(e) =>
              updateIntake({ keyAchievements: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="Aumentei receita em 40% com novo produto&#10;Publiquei artigo no jornal X&#10;Liderei equipe de 12 pessoas" />
        </Field>
        <Field label="Interesses de pesquisa (para candidaturas acadêmicas)">
          <textarea className={cn(inputCls, "h-20 resize-none")}
            value={intake.researchInterests || ""}
            onChange={(e) => updateIntake({ researchInterests: e.target.value })}
            placeholder="IA aplicada a políticas públicas, impacto social de algoritmos..." />
        </Field>
        <Field label="Liderança e impacto comunitário">
          <textarea className={cn(inputCls, "h-20 resize-none")}
            value={intake.communityImpact || ""}
            onChange={(e) => updateIntake({ communityImpact: e.target.value })}
            placeholder="Co-fundador de ONG de educação digital, voluntário em..." />
        </Field>
      </Section>

      {/* Targeting */}
      <Section title="Alvos e Destinos" icon={Globe} color="text-teal-600" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Países de destino (vírgula)">
            <input className={inputCls}
              value={intake.targetCountries.join(", ")}
              onChange={(e) =>
                updateIntake({ targetCountries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
              placeholder="Reino Unido, Alemanha, Canadá" />
          </Field>
          <Field label="Cargos/programas desejados (vírgula)">
            <input className={inputCls}
              value={intake.targetRoles.join(", ")}
              onChange={(e) =>
                updateIntake({ targetRoles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
              placeholder="Product Manager, Pesquisador, Bolsista Chevening" />
          </Field>
        </div>
      </Section>

      {/* Save footer */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-[#001338] text-white hover:bg-[#001338]/90"
          )}
        >
          {saved ? <><CheckCircle className="h-4 w-4" /> Salvo!</> : "Salvar perfil"}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EducationCard({
  entry, onUpdate, onRemove,
}: {
  entry: EducationEntry;
  onUpdate: (p: Partial<EducationEntry>) => void;
  onRemove: () => void;
}) {
  const inputCls2 = "w-full rounded-md border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-300 focus:outline-none";
  return (
    <div className="rounded-lg border border-cream-200 bg-cream-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary">Formação</span>
        <button onClick={onRemove} className="rounded p-1 text-text-muted hover:text-clay-600 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls2} value={entry.degree} onChange={(e) => onUpdate({ degree: e.target.value })} placeholder="Grau (Bacharelado, Mestrado...)" />
        <input className={inputCls2} value={entry.field} onChange={(e) => onUpdate({ field: e.target.value })} placeholder="Área (Ciência da Computação...)" />
        <input className={inputCls2} value={entry.institution} onChange={(e) => onUpdate({ institution: e.target.value })} placeholder="Instituição" />
        <input className={inputCls2} value={entry.country} onChange={(e) => onUpdate({ country: e.target.value })} placeholder="País" />
        <input className={inputCls2} value={entry.graduationYear || ""} onChange={(e) => onUpdate({ graduationYear: e.target.value })} placeholder="Ano de conclusão" />
        <input className={inputCls2} value={entry.gpa || ""} onChange={(e) => onUpdate({ gpa: e.target.value })} placeholder="GPA / Nota (opcional)" />
      </div>
      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" checked={entry.isCurrent} onChange={(e) => onUpdate({ isCurrent: e.target.checked })} />
        Em andamento
      </label>
    </div>
  );
}

function WorkExpCard({
  entry, onUpdate, onRemove,
}: {
  entry: WorkExperience;
  onUpdate: (p: Partial<WorkExperience>) => void;
  onRemove: () => void;
}) {
  const inputCls2 = "w-full rounded-md border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-sm placeholder:text-text-muted focus:border-brand-300 focus:outline-none";
  return (
    <div className="rounded-lg border border-cream-200 bg-cream-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary">Experiência</span>
        <button onClick={onRemove} className="rounded p-1 text-text-muted hover:text-clay-600 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls2} value={entry.role} onChange={(e) => onUpdate({ role: e.target.value })} placeholder="Cargo" />
        <input className={inputCls2} value={entry.organization} onChange={(e) => onUpdate({ organization: e.target.value })} placeholder="Organização" />
        <input className={inputCls2} value={entry.location || ""} onChange={(e) => onUpdate({ location: e.target.value })} placeholder="Local (cidade, país)" />
        <input className={inputCls2} value={entry.startDate} onChange={(e) => onUpdate({ startDate: e.target.value })} placeholder="Início (AAAA-MM)" />
        {!entry.isCurrent && (
          <input className={inputCls2} value={entry.endDate || ""} onChange={(e) => onUpdate({ endDate: e.target.value })} placeholder="Fim (AAAA-MM)" />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" checked={entry.isCurrent} onChange={(e) => onUpdate({ isCurrent: e.target.checked })} />
        Cargo atual
      </label>
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-secondary">Conquistas (uma por linha, use números)</label>
        <textarea
          className={cn(inputCls2, "h-20 resize-none")}
          value={entry.achievements.join("\n")}
          onChange={(e) =>
            onUpdate({ achievements: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
          }
          placeholder="Aumentei vendas em 30%&#10;Liderei migração de sistema legado&#10;Reduzi tempo de deploy em 50%"
        />
      </div>
    </div>
  );
}

function LanguageRow({
  entry, onChange, onRemove,
}: {
  entry: LanguageEntry;
  onChange: (updated: LanguageEntry) => void;
  onRemove: () => void;
}) {
  const levels: LanguageLevel[] = ["native", "fluent", "advanced", "intermediate", "basic"];
  const levelLabels: Record<LanguageLevel, string> = {
    native: "Nativo", fluent: "Fluente", advanced: "Avançado", intermediate: "Intermediário", basic: "Básico",
  };
  return (
    <div className="flex items-center gap-2">
      <input
        className="flex-1 rounded-md border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-sm placeholder:text-text-muted focus:outline-none"
        value={entry.language} onChange={(e) => onChange({ ...entry, language: e.target.value })}
        placeholder="Idioma (ex: Inglês)" />
      <select
        className="rounded-md border border-cream-200 bg-cream-50 px-2 py-1.5 text-sm focus:outline-none"
        value={entry.level} onChange={(e) => onChange({ ...entry, level: e.target.value as LanguageLevel })}>
        {levels.map((l) => <option key={l} value={l}>{levelLabels[l]}</option>)}
      </select>
      <input
        className="w-36 rounded-md border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-sm placeholder:text-text-muted focus:outline-none"
        value={entry.certification || ""} onChange={(e) => onChange({ ...entry, certification: e.target.value })}
        placeholder="IELTS 7.5" />
      <button onClick={onRemove} className="rounded p-1 text-text-muted hover:text-clay-600 transition-colors">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
