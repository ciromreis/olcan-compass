"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileText,
  FileArchive,
  Printer,
  User,
  Target,
  BookOpen,
  Eye,
  ChevronRight,
  Save,
  Tag,
  X,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useDossierStore } from "@/stores/dossier";
import { useForgeStore, DOC_TYPE_LABELS, type ForgeDocument } from "@/stores/forge";
import { useAuthStore } from "@/stores/auth";
import { downloadDocx } from "@/lib/docx-export";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

// ─── Step definition ──────────────────────────────────────────────────────────

type Step = "profile" | "opportunity" | "documents" | "preview";

const STEPS: { id: Step; label: string; icon: typeof User; description: string }[] = [
  { id: "profile", label: "Perfil", icon: User, description: "Quem é o candidato" },
  { id: "opportunity", label: "Oportunidade", icon: Target, description: "Programa e requisitos" },
  { id: "documents", label: "Documentos", icon: BookOpen, description: "Selecione os ativos" },
  { id: "preview", label: "Prévia & Exportar", icon: Eye, description: "Exportar o dossier" },
];

// ─── Local form state ─────────────────────────────────────────────────────────

interface ProfileForm {
  fullName: string;
  email: string;
  location: string;
  currentRole: string;
  currentOrganization: string;
  highestDegree: string;
  fieldOfStudy: string;
  background: string;
  aspirations: string;
  strengths: string; // comma-separated
}

interface OpportunityForm {
  program: string;
  institution: string;
  country: string;
  location: string;
  type: string;
  jobDescription: string;
  keywords: string[];
  deadline: string;
  url: string;
  competitiveness: string;
}

// ─── Page ───────────────────────────���─────────────────────────────────────────

export default function DossierExportPage() {
  const params = useParams();
  const router = useRouter();
  const dossierId = params.id as string;
  const { toast } = useToast();

  const { getDossierById, updateDossier, syncFromApi, syncDossier } = useDossierStore();
  const { documents: forgeDocs, syncFromApi: syncForgeDocs } = useForgeStore();
  const { user } = useAuthStore();

  const dossier = getDossierById(dossierId);

  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Profile form state
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: "",
    email: "",
    location: "",
    currentRole: "",
    currentOrganization: "",
    highestDegree: "",
    fieldOfStudy: "",
    background: "",
    aspirations: "",
    strengths: "",
  });

  // Opportunity form state
  const [opp, setOpp] = useState<OpportunityForm>({
    program: "",
    institution: "",
    country: "",
    location: "",
    type: "education",
    jobDescription: "",
    keywords: [],
    deadline: "",
    url: "",
    competitiveness: "medium",
  });

  const [keywordInput, setKeywordInput] = useState("");

  // ─── Bootstrap from existing dossier + user ────────────────────────────────

  useEffect(() => {
    syncFromApi();
    syncForgeDocs();
  }, [syncFromApi, syncForgeDocs]);

  useEffect(() => {
    if (dossierId && !dossierId.startsWith("local-")) {
      syncDossier(dossierId);
    }
  }, [dossierId, syncDossier]);

  useEffect(() => {
    if (!dossier) return;

    const snap = dossier.profileSnapshot as unknown as Record<string, unknown>;
    const ctx = dossier.opportunity as unknown as Record<string, unknown>;

    setProfile({
      fullName: (snap?.fullName as string) || user?.full_name || "",
      email: (snap?.email as string) || user?.email || "",
      location: (snap?.location as string) || "",
      currentRole: (snap?.currentRole as string) || "",
      currentOrganization: (snap?.currentOrganization as string) || "",
      highestDegree: (snap?.highestDegree as string) || "",
      fieldOfStudy: (snap?.fieldOfStudy as string) || "",
      background: (snap?.background as string) || "",
      aspirations: (snap?.aspirations as string) || "",
      strengths: ((snap?.strengths as string[]) || []).join(", "),
    });

    const rawDeadline = dossier.deadline
      ? new Date(dossier.deadline).toISOString().split("T")[0]
      : "";
    setOpp({
      program: (ctx?.program as string) || "",
      institution: (ctx?.institution as string) || "",
      country: (ctx?.country as string) || "",
      location: (ctx?.location as string) || "",
      type: (ctx?.type as string) || "education",
      jobDescription: (ctx?.jobDescription as string) || "",
      keywords: (ctx?.keywords as string[]) || [],
      deadline: rawDeadline,
      url: (ctx?.url as string) || "",
      competitiveness: (ctx?.competitiveness as string) || "medium",
    });
  }, [dossier, user]);

  // Pre-select documents linked to this dossier's opportunity
  useEffect(() => {
    if (!dossier) return;
    const oppId = dossier.opportunityId;
    const linked = forgeDocs.filter(
      (d) =>
        d.primaryOpportunityId === oppId ||
        d.opportunityIds?.includes(oppId ?? "") ||
        d.readinessLevel === "export_ready" ||
        d.readinessLevel === "submitted"
    );
    if (linked.length > 0) {
      setSelectedDocIds(new Set(linked.map((d) => d.id)));
    } else {
      // Fallback: select all forge docs
      setSelectedDocIds(new Set(forgeDocs.map((d) => d.id)));
    }
  }, [dossier, forgeDocs]);

  // ─── Computed values ───────────────────────────────────────────────────────

  const selectedDocuments = useMemo(
    () => forgeDocs.filter((d) => selectedDocIds.has(d.id)),
    [forgeDocs, selectedDocIds]
  );

  const readinessScore = useMemo(() => {
    if (selectedDocuments.length === 0) return 0;
    const readyCount = selectedDocuments.filter(
      (d) => d.readinessLevel === "export_ready" || d.readinessLevel === "submitted"
    ).length;
    const profileComplete =
      profile.fullName.trim().length > 0 && profile.background.trim().length > 0
        ? 1
        : 0;
    const oppComplete =
      opp.program.trim().length > 0 && opp.institution.trim().length > 0 ? 1 : 0;
    const docScore = (readyCount / selectedDocuments.length) * 60;
    const contextScore = (profileComplete + oppComplete) * 20;
    return Math.round(docScore + contextScore);
  }, [selectedDocuments, profile, opp]);

  // ─── Save handlers ─────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!dossier) return;
    setSaving(true);
    try {
      await updateDossier(dossierId, {
        profileSnapshot: {
          fullName: profile.fullName,
          email: profile.email,
          location: profile.location,
          currentRole: profile.currentRole,
          currentOrganization: profile.currentOrganization,
          highestDegree: profile.highestDegree,
          fieldOfStudy: profile.fieldOfStudy,
          background: profile.background,
          aspirations: profile.aspirations,
          strengths: profile.strengths.split(",").map((s) => s.trim()).filter(Boolean),
          readinessScores: { logistic: 0, narrative: 0, performance: 0, psychological: 0 },
        } as never,
        opportunity: {
          program: opp.program,
          institution: opp.institution,
          location: opp.location,
          country: opp.country,
          type: opp.type as never,
          jobDescription: opp.jobDescription,
          keywords: opp.keywords,
          applicationDeadline: opp.deadline ? new Date(opp.deadline) : new Date(),
          url: opp.url,
          requirements: [],
          criteria: { competitiveness: opp.competitiveness },
        } as never,
        ...(opp.deadline ? { deadline: new Date(opp.deadline) } : {}),
      });
      toast({ title: "Salvo", description: "Dossier atualizado.", variant: "success" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "warning" });
    } finally {
      setSaving(false);
    }
  }, [dossierId, dossier, profile, opp, updateDossier, toast]);

  // ─── Export handlers ──────────────────────────────���────────────────────────

  const handleExportPDF = () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "Selecione ao menos um documento", variant: "warning" });
      return;
    }
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast({ title: "Permita pop-ups para exportar PDF", variant: "warning" });
      return;
    }
    printWin.document.write(buildPrintHTML(selectedDocuments, profile, opp, readinessScore));
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 400);
    toast({
      title: "Diálogo de impressão aberto",
      description: 'Escolha "Salvar como PDF" no diálogo.',
      variant: "success",
    });
  };

  const handleExportDocx = async () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "Selecione ao menos um documento", variant: "warning" });
      return;
    }
    const title = opp.program ? `Dossier — ${opp.program}` : dossier?.title || "Dossier";
    const combined = [
      `# ${title}\n`,
      profile.fullName ? `**Candidato:** ${profile.fullName}` : "",
      opp.program ? `**Programa:** ${opp.program} — ${opp.institution}` : "",
      opp.deadline ? `**Prazo:** ${new Date(opp.deadline).toLocaleDateString("pt-BR")}` : "",
      "\n---\n",
      ...selectedDocuments.map((d) => `# ${d.title}\n\n${d.content}`),
    ]
      .filter(Boolean)
      .join("\n");
    await downloadDocx(title, combined);
    toast({ title: "DOCX exportado", variant: "success" });
  };

  const handleExportZip = async () => {
    if (selectedDocuments.length === 0) {
      toast({ title: "Selecione ao menos um documento", variant: "warning" });
      return;
    }
    for (const doc of selectedDocuments) {
      const blob = new Blob([doc.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "").trim()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast({ title: `${selectedDocuments.length} arquivos baixados`, variant: "success" });
  };

  // ─── Guard ─────────────────────────���───────────────────────────────────────

  if (!dossier) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-text-muted">Dossier não encontrado.</p>
          <Link href="/dossiers" className="text-brand-600 text-sm font-medium hover:underline">
            Voltar para Dossiers
          </Link>
        </div>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // ─── Render ────────────────────────────��──────────────────────────────���────

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cream-50">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b border-cream-200 bg-white px-4 py-3 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href={`/dossiers/${dossierId}`}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:bg-cream-100 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <span className="text-cream-300">·</span>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-cream-200" />
            <span className="font-heading text-sm font-semibold text-[#001338]">
              {dossier.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Readiness pill */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              readinessScore >= 70
                ? "bg-emerald-100 text-emerald-700"
                : readinessScore >= 40
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            <span>Prontidão</span>
            <span className="font-bold">{readinessScore}%</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#001338] px-4 py-2 text-sm font-semibold text-white hover:bg-[#001338]/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + main + right panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left step nav */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-cream-200 bg-white md:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = i < stepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                    isActive
                      ? "bg-[#001338] text-white"
                      : "text-text-secondary hover:bg-cream-50 hover:text-text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-white/20"
                        : isDone
                        ? "bg-emerald-100"
                        : "bg-cream-100"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-white" : "text-text-muted"
                        )}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        isActive ? "text-white" : "text-text-primary"
                      )}
                    >
                      {s.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs truncate",
                        isActive ? "text-white/70" : "text-text-muted"
                      )}
                    >
                      {s.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Readiness gauge */}
          <div className="border-t border-cream-200 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
              Prontidão
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="font-heading text-3xl font-bold text-[#001338]">
                {readinessScore}
              </span>
              <span className="text-sm text-text-muted mb-1">%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  readinessScore >= 70
                    ? "bg-emerald-500"
                    : readinessScore >= 40
                    ? "bg-amber-400"
                    : "bg-brand-400"
                )}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {selectedDocuments.length} documento{selectedDocuments.length !== 1 ? "s" : ""} selecionado
              {selectedDocuments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-8">
            {step === "profile" && (
              <ProfileStep
                profile={profile}
                onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))}
              />
            )}
            {step === "opportunity" && (
              <OpportunityStep
                opp={opp}
                keywordInput={keywordInput}
                onKeywordInputChange={setKeywordInput}
                onChange={(k, v) => setOpp((o) => ({ ...o, [k]: v }))}
                onAddKeyword={(kw) => {
                  if (kw.trim() && !opp.keywords.includes(kw.trim())) {
                    setOpp((o) => ({ ...o, keywords: [...o.keywords, kw.trim()] }));
                  }
                  setKeywordInput("");
                }}
                onRemoveKeyword={(kw) =>
                  setOpp((o) => ({ ...o, keywords: o.keywords.filter((k) => k !== kw) }))
                }
              />
            )}
            {step === "documents" && (
              <DocumentsStep
                allDocuments={forgeDocs}
                selectedDocIds={selectedDocIds}
                opportunityId={dossier.opportunityId}
                onToggle={(id) =>
                  setSelectedDocIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onToggleAll={(docs) =>
                  setSelectedDocIds((prev) =>
                    prev.size === docs.length
                      ? new Set()
                      : new Set(docs.map((d) => d.id))
                  )
                }
              />
            )}
            {step === "preview" && (
              <PreviewStep
                documents={selectedDocuments}
                profile={profile}
                opp={opp}
                readinessScore={readinessScore}
                dossierTitle={dossier.title}
                onExportPDF={handleExportPDF}
                onExportDocx={handleExportDocx}
                onExportZip={handleExportZip}
              />
            )}
          </div>
        </main>

        {/* Right panel — always visible on xl, shows cover + export */}
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-cream-200 bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Capa do Dossier
            </p>

            {/* Mini cover card */}
            <div className="rounded-xl overflow-hidden border border-cream-200 shadow-sm">
              <div className="bg-[#001338] p-4 pb-6">
                <p className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">
                  OLCAN
                </p>
                <h3 className="font-heading text-base font-bold text-white leading-tight">
                  {opp.program || dossier.title}
                </h3>
                {opp.institution && (
                  <p className="text-xs text-white/70 mt-1">{opp.institution}</p>
                )}
                {profile.fullName && (
                  <p className="text-xs text-white/60 mt-3">{profile.fullName}</p>
                )}
              </div>
              <div className="bg-white p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Prontidão</span>
                  <span
                    className={cn(
                      "font-bold",
                      readinessScore >= 70 ? "text-emerald-600" : readinessScore >= 40 ? "text-amber-600" : "text-slate-600"
                    )}
                  >
                    {readinessScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      readinessScore >= 70 ? "bg-emerald-500" : readinessScore >= 40 ? "bg-amber-400" : "bg-brand-400"
                    )}
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{selectedDocuments.length} docs</span>
                  {opp.deadline && (
                    <span>
                      {new Date(opp.deadline).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Document list preview */}
            {selectedDocuments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Conteúdo ({selectedDocuments.length})
                </p>
                {selectedDocuments.map((doc, i) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 rounded-lg p-2 text-xs"
                  >
                    <span className="font-bold text-brand-500 w-4 shrink-0">
                      {i + 1}.
                    </span>
                    <span className="flex-1 truncate text-text-primary font-medium">
                      {doc.title}
                    </span>
                    <ReadinessChip level={doc.readinessLevel} mini />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export actions pinned to bottom */}
          <div className="border-t border-cream-200 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
              Exportar
            </p>
            <button
              onClick={handleExportPDF}
              className="flex w-full items-center gap-3 rounded-xl bg-[#001338] px-4 py-3 text-sm font-semibold text-white hover:bg-[#001338]/90 transition-colors"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Exportar PDF</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button
              onClick={handleExportDocx}
              className="flex w-full items-center gap-3 rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-cream-50 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-500" />
              <span className="flex-1 text-left">Microsoft Word (.docx)</span>
            </button>
            <button
              onClick={handleExportZip}
              className="flex w-full items-center gap-3 rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-cream-50 transition-colors"
            >
              <FileArchive className="h-4 w-4 shrink-0 text-text-muted" />
              <span className="flex-1 text-left">Markdown (.zip)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile nav — bottom bar */}
      <nav className="flex border-t border-cream-200 bg-white md:hidden shrink-0">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-[#001338]" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {s.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Step: Profile ────────────────────────────────────────────────────────────

function ProfileStep({
  profile,
  onChange,
}: {
  profile: ProfileForm;
  onChange: (k: keyof ProfileForm, v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#001338]">Perfil do Candidato</h2>
        <p className="mt-1 text-sm text-text-muted">
          Essas informações aparecerão na capa e contextualizarão seus documentos para os avaliadores.
        </p>
      </div>

      <Section title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" required>
            <input
              value={profile.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="João da Silva"
              className={inputCls}
            />
          </Field>
          <Field label="E-mail">
            <input
              value={profile.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="joao@exemplo.com"
              type="email"
              className={inputCls}
            />
          </Field>
          <Field label="Localização" hint="Cidade, País">
            <input
              value={profile.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="São Paulo, Brasil"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section title="Formação e Carreira">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cargo / Posição atual">
            <input
              value={profile.currentRole}
              onChange={(e) => onChange("currentRole", e.target.value)}
              placeholder="Engenheiro de Software"
              className={inputCls}
            />
          </Field>
          <Field label="Empresa / Instituição atual">
            <input
              value={profile.currentOrganization}
              onChange={(e) => onChange("currentOrganization", e.target.value)}
              placeholder="Empresa XYZ"
              className={inputCls}
            />
          </Field>
          <Field label="Maior grau de formação">
            <input
              value={profile.highestDegree}
              onChange={(e) => onChange("highestDegree", e.target.value)}
              placeholder="Mestrado em Engenharia"
              className={inputCls}
            />
          </Field>
          <Field label="Área de estudo">
            <input
              value={profile.fieldOfStudy}
              onChange={(e) => onChange("fieldOfStudy", e.target.value)}
              placeholder="Ciência da Computação"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section title="Narrativa Pessoal">
        <div className="space-y-4">
          <Field
            label="Trajetória e background"
            hint="Resumo da sua jornada acadêmica e profissional"
            required
          >
            <textarea
              value={profile.background}
              onChange={(e) => onChange("background", e.target.value)}
              placeholder="Descreva brevemente sua trajetória, experiências mais relevantes e motivações..."
              rows={4}
              className={cn(inputCls, "resize-none")}
            />
          </Field>
          <Field label="Aspirações" hint="O que você busca conquistar com essa candidatura">
            <textarea
              value={profile.aspirations}
              onChange={(e) => onChange("aspirations", e.target.value)}
              placeholder="Após completar o programa, pretendo..."
              rows={3}
              className={cn(inputCls, "resize-none")}
            />
          </Field>
          <Field
            label="Pontos fortes"
            hint="Separe por vírgulas: liderança, pesquisa, comunicação"
          >
            <input
              value={profile.strengths}
              onChange={(e) => onChange("strengths", e.target.value)}
              placeholder="Liderança, Pesquisa, Comunicação, Python"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

// ─── Step: Opportunity ────────────────────────────────────────────────────────

function OpportunityStep({
  opp,
  keywordInput,
  onKeywordInputChange,
  onChange,
  onAddKeyword,
  onRemoveKeyword,
}: {
  opp: OpportunityForm;
  keywordInput: string;
  onKeywordInputChange: (v: string) => void;
  onChange: (k: keyof OpportunityForm, v: string) => void;
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#001338]">Oportunidade Alvo</h2>
        <p className="mt-1 text-sm text-text-muted">
          Contextualize o programa ou vaga para que o sistema possa avaliar alinhamento e otimizar seus documentos.
        </p>
      </div>

      <Section title="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do programa / vaga" required>
            <input
              value={opp.program}
              onChange={(e) => onChange("program", e.target.value)}
              placeholder="Mestrado em Inteligência Artificial"
              className={inputCls}
            />
          </Field>
          <Field label="Instituição" required>
            <input
              value={opp.institution}
              onChange={(e) => onChange("institution", e.target.value)}
              placeholder="MIT, Stanford, USP..."
              className={inputCls}
            />
          </Field>
          <Field label="País">
            <input
              value={opp.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="Brasil, EUA, Alemanha..."
              className={inputCls}
            />
          </Field>
          <Field label="Cidade">
            <input
              value={opp.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="Cambridge, São Paulo..."
              className={inputCls}
            />
          </Field>
          <Field label="Tipo de oportunidade">
            <select
              value={opp.type}
              onChange={(e) => onChange("type", e.target.value)}
              className={inputCls}
            >
              <option value="education">Educação / Pós-graduação</option>
              <option value="employment">Emprego / Estágio</option>
              <option value="entrepreneurship">Empreendedorismo</option>
              <option value="other">Outro</option>
            </select>
          </Field>
          <Field label="Prazo de inscrição">
            <input
              type="date"
              value={opp.deadline}
              onChange={(e) => onChange("deadline", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="URL do processo seletivo">
          <div className="relative">
            <input
              value={opp.url}
              onChange={(e) => onChange("url", e.target.value)}
              placeholder="https://..."
              className={cn(inputCls, "pr-10")}
            />
            {opp.url && (
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </Field>
      </Section>

      <Section title="Requisitos e Critérios">
        <div className="space-y-4">
          <Field
            label="Descrição da vaga / requisitos do programa"
            hint="Cole aqui o texto oficial com os requisitos — o sistema usará para avaliar alinhamento"
          >
            <textarea
              value={opp.jobDescription}
              onChange={(e) => onChange("jobDescription", e.target.value)}
              placeholder="Buscamos candidatos com sólida formação em... Requisitos: ..."
              rows={5}
              className={cn(inputCls, "resize-none")}
            />
          </Field>

          <Field
            label="Palavras-chave ATS"
            hint="Termos estratégicos para otimização dos documentos"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={(e) => onKeywordInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      onAddKeyword(keywordInput);
                    }
                  }}
                  placeholder="Digite e pressione Enter..."
                  className={cn(inputCls, "flex-1")}
                />
                <button
                  onClick={() => onAddKeyword(keywordInput)}
                  disabled={!keywordInput.trim()}
                  className="flex items-center gap-1 rounded-xl border border-cream-300 px-3 py-2 text-sm font-medium text-text-secondary hover:bg-cream-50 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
              {opp.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {opp.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      <Tag className="h-3 w-3" />
                      {kw}
                      <button
                        onClick={() => onRemoveKeyword(kw)}
                        className="ml-0.5 text-brand-500 hover:text-brand-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="Nível de competitividade estimado">
            <select
              value={opp.competitiveness}
              onChange={(e) => onChange("competitiveness", e.target.value)}
              className={inputCls}
            >
              <option value="low">Baixo — ampla aceitação</option>
              <option value="medium">Médio — processo seletivo padrão</option>
              <option value="high">Alto — muito concorrido</option>
              <option value="very_high">Muito alto — elite global</option>
            </select>
          </Field>
        </div>
      </Section>
    </div>
  );
}

// ─── Step: Documents ────────────────────────────��─────────────────────────────

function DocumentsStep({
  allDocuments,
  selectedDocIds,
  opportunityId,
  onToggle,
  onToggleAll,
}: {
  allDocuments: ForgeDocument[];
  selectedDocIds: Set<string>;
  opportunityId?: string;
  onToggle: (id: string) => void;
  onToggleAll: (docs: ForgeDocument[]) => void;
}) {
  const linked = allDocuments.filter(
    (d) =>
      d.primaryOpportunityId === opportunityId ||
      d.opportunityIds?.includes(opportunityId ?? "")
  );
  const universal = allDocuments.filter(
    (d) =>
      !d.primaryOpportunityId &&
      (!d.opportunityIds || d.opportunityIds.length === 0)
  );
  const other = allDocuments.filter(
    (d) => !linked.includes(d) && !universal.includes(d)
  );

  const groups = [
    { label: "Vinculados a esta candidatura", docs: linked },
    { label: "Documentos universais", docs: universal },
    { label: "Outras candidaturas", docs: other },
  ].filter((g) => g.docs.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#001338]">Documentos do Dossier</h2>
          <p className="mt-1 text-sm text-text-muted">
            Selecione os ativos que compõem este dossier de candidatura.{" "}
            <span className="font-semibold text-text-primary">
              {selectedDocIds.size}
            </span>{" "}
            selecionado{selectedDocIds.size !== 1 ? "s" : ""}.
          </p>
        </div>
        <button
          onClick={() => onToggleAll(allDocuments)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0"
        >
          {selectedDocIds.size === allDocuments.length ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>

      {allDocuments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-cream-300 mb-3" />
          <p className="text-sm text-text-muted mb-3">Nenhum documento criado ainda.</p>
          <Link
            href="/forge/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Criar documento no Forge
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.docs.map((doc) => {
                  const isSelected = selectedDocIds.has(doc.id);
                  const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
                  const chars = doc.content.length;
                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                        isSelected
                          ? "border-[#001338] bg-[#001338]/5"
                          : "border-cream-200 bg-white hover:border-cream-300"
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggle(doc.id)}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                          isSelected
                            ? "border-[#001338] bg-[#001338]"
                            : "border-cream-400 bg-white hover:border-[#001338]"
                        )}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">{doc.title}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
                          <span>{DOC_TYPE_LABELS[doc.type]}</span>
                          <span className="text-cream-300">·</span>
                          <span>{words.toLocaleString("pt-BR")} palavras</span>
                          <span className="text-cream-300">·</span>
                          <span>{chars.toLocaleString("pt-BR")} chars</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ReadinessChip level={doc.readinessLevel} />
                        <Link
                          href={`/forge/${doc.id}`}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-cream-100 hover:text-text-primary"
                          title="Editar no Forge"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step: Preview & Export ─────────────────────────────���─────────────────────

function PreviewStep({
  documents,
  profile,
  opp,
  readinessScore,
  dossierTitle,
  onExportPDF,
  onExportDocx,
  onExportZip,
}: {
  documents: ForgeDocument[];
  profile: ProfileForm;
  opp: OpportunityForm;
  readinessScore: number;
  dossierTitle: string;
  onExportPDF: () => void;
  onExportDocx: () => void;
  onExportZip: () => void;
}) {
  const title = opp.program ? `Dossier — ${opp.program}` : dossierTitle;
  const generatedDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#001338]">Prévia e Exportação</h2>
        <p className="mt-1 text-sm text-text-muted">
          Confira a apresentação final do seu dossier antes de exportar.
        </p>
      </div>

      {/* Export actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onExportPDF}
          className="flex flex-col items-center gap-2 rounded-2xl bg-[#001338] p-4 text-white transition-all hover:bg-[#001338]/90 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Printer className="h-6 w-6" />
          <span className="text-sm font-semibold">PDF</span>
          <span className="text-xs text-white/60">Pronto para envio</span>
        </button>
        <button
          onClick={onExportDocx}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-cream-300 bg-white p-4 text-text-primary transition-all hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <FileText className="h-6 w-6 text-brand-500" />
          <span className="text-sm font-semibold">DOCX</span>
          <span className="text-xs text-text-muted">Word / Google Docs</span>
        </button>
        <button
          onClick={onExportZip}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-cream-300 bg-white p-4 text-text-primary transition-all hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <FileArchive className="h-6 w-6 text-text-muted" />
          <span className="text-sm font-semibold">ZIP</span>
          <span className="text-xs text-text-muted">Markdown individual</span>
        </button>
      </div>

      {/* Branded preview */}
      <div className="overflow-hidden rounded-2xl border border-cream-200 shadow-xl">
        {/* Cover */}
        <div className="relative bg-[#001338] px-10 py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 11px)",
            }}
          />
          <div className="relative z-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xl font-black tracking-widest text-white">OLCAN</p>
                <p className="text-xs text-white/40 tracking-wider">
                  Professional Mobility Platform
                </p>
              </div>
              <div
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold",
                  readinessScore >= 70
                    ? "bg-emerald-500/20 text-emerald-300"
                    : readinessScore >= 40
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-white/10 text-white/60"
                )}
              >
                {readinessScore}% pronto
              </div>
            </div>

            <div className="border-l-2 border-white/30 pl-6">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                Dossier de Candidatura
              </p>
              <h1 className="font-heading text-3xl font-bold text-white leading-tight">
                {title}
              </h1>
              {opp.institution && (
                <p className="mt-2 text-lg text-white/70">{opp.institution}</p>
              )}
              {opp.country && (
                <p className="text-sm text-white/50">{opp.country}</p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              {profile.fullName && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Candidato</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{profile.fullName}</p>
                  {profile.currentRole && (
                    <p className="text-xs text-white/60">{profile.currentRole}</p>
                  )}
                </div>
              )}
              {opp.deadline && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Prazo</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {new Date(opp.deadline).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Gerado em</p>
                <p className="text-sm font-semibold text-white mt-0.5">{generatedDate}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Documentos</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {documents.length} ativo{documents.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table of contents */}
        {documents.length > 0 && (
          <div className="border-b border-cream-200 bg-cream-50 px-10 py-6">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
              Sumário
            </p>
            <ol className="space-y-2">
              {documents.map((doc, i) => {
                const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
                const chars = doc.content.length;
                return (
                  <li key={doc.id} className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-right font-bold text-brand-500 text-sm">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-text-primary text-sm">{doc.title}</span>
                      <span className="text-xs text-text-muted ml-2">
                        {DOC_TYPE_LABELS[doc.type]}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted shrink-0">
                      {words.toLocaleString("pt-BR")} pal. · {chars.toLocaleString("pt-BR")} ch.
                    </span>
                    <ReadinessChip level={doc.readinessLevel} mini />
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Document previews */}
        {documents.map((doc, i) => {
          const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
          const preview = doc.content.slice(0, 400).trim();
          return (
            <div
              key={doc.id}
              className={cn(
                "px-10 py-8",
                i % 2 === 0 ? "bg-white" : "bg-cream-50/50",
                i < documents.length - 1 && "border-b border-cream-200"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#001338] text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                      {DOC_TYPE_LABELS[doc.type]}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#001338]">{doc.title}</h3>
                  </div>
                </div>
                <ReadinessChip level={doc.readinessLevel} />
              </div>

              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {preview}
                {doc.content.length > 400 && (
                  <span className="text-text-muted italic">
                    {" "}
                    … ({words.toLocaleString("pt-BR")} palavras no total)
                  </span>
                )}
              </p>
            </div>
          );
        })}

        {/* Footer */}
        <div className="bg-[#001338] px-10 py-4 flex items-center justify-between">
          <p className="text-xs text-white/60">Gerado pelo Olcan Compass</p>
          <p className="text-xs text-white/40">olcan.com.br</p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared UI primitives ────────────────────────────��────────────────────────

const inputCls =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-[#001338] focus:outline-none focus:ring-2 focus:ring-[#001338]/10 transition-colors";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#001338]/50 border-b border-cream-200 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="ml-1 text-brand-500">*</span>}
      </label>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function ReadinessChip({
  level,
  mini = false,
}: {
  level?: ForgeDocument["readinessLevel"];
  mini?: boolean;
}) {
  if (!level) return null;
  const configs = {
    export_ready: { label: "Pronto", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
    submitted: { label: "Enviado", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
    review: { label: "Revisão", icon: Clock, cls: "bg-amber-100 text-amber-700" },
    draft: { label: "Rascunho", icon: AlertCircle, cls: "bg-slate-100 text-slate-600" },
  } as const;
  const cfg = configs[level] ?? configs.draft;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold shrink-0",
        cfg.cls,
        mini ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className={mini ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {!mini && cfg.label}
    </span>
  );
}

// ─── PDF Print Template ─────────────────────────��─────────────────────────────���

function buildPrintHTML(
  documents: ForgeDocument[],
  profile: ProfileForm,
  opp: OpportunityForm,
  readinessScore: number
): string {
  const title = opp.program ? `Dossier — ${opp.program}` : "Dossier de Candidatura";
  const generatedDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deadline = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const tocRows = documents
    .map((doc, i) => {
      const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
      return `<tr>
      <td style="padding:8px 0;font-weight:700;color:#001338;width:30px">${i + 1}.</td>
      <td style="padding:8px 0;font-weight:600;color:#111">${doc.title}</td>
      <td style="padding:8px 0;color:#888;text-align:right;font-size:10pt">${words.toLocaleString("pt-BR")} pal.</td>
    </tr>`;
    })
    .join("");

  const docSections = documents
    .map(
      (doc, i) => `
    <div style="page-break-before:always;padding:2.5cm 3cm">
      <div style="border-left:4px solid #001338;padding-left:16px;margin-bottom:24px">
        <div style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#001338;margin-bottom:4px">Documento ${i + 1}</div>
        <h2 style="margin:0;font-size:20pt;font-weight:700;color:#111">${doc.title}</h2>
      </div>
      <div style="font-size:11pt;line-height:1.8;color:#222;white-space:pre-wrap;word-break:break-word">${doc.content}</div>
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:9pt;color:#aaa">
        <span>${DOC_TYPE_LABELS[doc.type]}</span>
        <span>${doc.content.trim().split(/\s+/).filter(Boolean).length.toLocaleString("pt-BR")} palavras · ${doc.content.length.toLocaleString("pt-BR")} caracteres</span>
      </div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff}
    @page{size:A4;margin:0}
    .cover{background:#001338;min-height:100vh;padding:3cm;position:relative;overflow:hidden;page-break-after:always}
    .cover-pattern{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,.03) 20px,rgba(255,255,255,.03) 21px)}
    .cover-logo{font-size:22pt;font-weight:900;letter-spacing:.12em;color:#fff;margin-bottom:4px}
    .cover-tagline{font-size:9pt;color:rgba(255,255,255,.35);letter-spacing:.08em;text-transform:uppercase;margin-bottom:3cm}
    .cover-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:10px}
    .cover-title{font-size:28pt;font-weight:700;color:#fff;line-height:1.2;margin-bottom:8px}
    .cover-institution{font-size:14pt;color:rgba(255,255,255,.7);margin-bottom:4px}
    .cover-country{font-size:11pt;color:rgba(255,255,255,.45)}
    .cover-divider{border:none;border-top:1px solid rgba(255,255,255,.1);margin:2.5cm 0 1.5cm}
    .cover-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
    .cover-meta-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:4px}
    .cover-meta-value{font-size:11pt;font-weight:600;color:#fff}
    .cover-meta-sub{font-size:9pt;color:rgba(255,255,255,.5)}
    .readiness-badge{display:inline-block;padding:6px 16px;border-radius:999px;font-size:10pt;font-weight:700;background:rgba(255,255,255,.12);color:rgba(255,255,255,.8);position:absolute;top:3cm;right:3cm}
    .toc{padding:2.5cm 3cm;page-break-after:always;background:#fafaf8}
    .toc-title{font-size:14pt;font-weight:700;color:#001338;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #001338}
    .toc table{width:100%;border-collapse:collapse}
    .footer{background:#001338;padding:16px 3cm;display:flex;justify-content:space-between;align-items:center}
    .footer-left{font-size:9pt;font-weight:600;color:rgba(255,255,255,.6)}
    .footer-right{font-size:9pt;color:rgba(255,255,255,.35)}
  </style>
</head>
<body>

<div class="cover">
  <div class="cover-pattern"></div>
  <div class="readiness-badge">${readinessScore}% pronto</div>

  <div class="cover-logo">OLCAN</div>
  <div class="cover-tagline">Professional Mobility Platform</div>

  <div class="cover-label">Dossier de Candidatura</div>
  <div class="cover-title">${title}</div>
  ${opp.institution ? `<div class="cover-institution">${opp.institution}</div>` : ""}
  ${opp.country ? `<div class="cover-country">${opp.country}</div>` : ""}

  <hr class="cover-divider"/>

  <div class="cover-meta-grid">
    ${
      profile.fullName
        ? `<div>
      <div class="cover-meta-label">Candidato</div>
      <div class="cover-meta-value">${profile.fullName}</div>
      ${profile.currentRole ? `<div class="cover-meta-sub">${profile.currentRole}</div>` : ""}
    </div>`
        : ""
    }
    ${
      deadline
        ? `<div>
      <div class="cover-meta-label">Prazo de inscrição</div>
      <div class="cover-meta-value">${deadline}</div>
    </div>`
        : ""
    }
    <div>
      <div class="cover-meta-label">Gerado em</div>
      <div class="cover-meta-value">${generatedDate}</div>
    </div>
    <div>
      <div class="cover-meta-label">Documentos</div>
      <div class="cover-meta-value">${documents.length} ativo${documents.length !== 1 ? "s" : ""}</div>
    </div>
  </div>
</div>

<div class="toc">
  <div class="toc-title">Sumário</div>
  <table><tbody>${tocRows}</tbody></table>
</div>

${docSections}

<div class="footer">
  <span class="footer-left">Gerado pelo Olcan Compass</span>
  <span class="footer-right">olcan.com.br · ${generatedDate}</span>
</div>

</body>
</html>`;
}
