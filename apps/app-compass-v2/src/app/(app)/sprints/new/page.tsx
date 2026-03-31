"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, DollarSign, FileText, Languages, Heart, Truck, CheckCircle2 } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton } from "@/components/ui";
import { buildSprintPlan, DURATION_OPTIONS, type SprintTemplateId } from "@/lib/sprint-planner";

const SPRINT_TEMPLATES = [
  { id: "financial" as SprintTemplateId, icon: DollarSign, label: "Sprint Financeiro", description: "Economizar, abrir conta internacional, contratar seguro", hint: "3 meses" },
  { id: "documental" as SprintTemplateId, icon: FileText, label: "Sprint Documental", description: "Preparar todos os documentos para candidatura", hint: "4–6 semanas" },
  { id: "linguistic" as SprintTemplateId, icon: Languages, label: "Sprint Linguístico", description: "Preparação intensiva para IELTS/TOEFL/TestDaF", hint: "2–3 meses" },
  { id: "psychological" as SprintTemplateId, icon: Heart, label: "Sprint Psicológico", description: "Gestão de ansiedade e preparação emocional", hint: "Contínuo" },
  { id: "relocation" as SprintTemplateId, icon: Truck, label: "Sprint de Relocation", description: "Moradia, logística, eSIM, conta local", hint: "4 semanas" },
];

export default function NewSprintPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { addSprint } = useSprintStore();
  const { routes } = useRouteStore();

  const [selected, setSelected] = useState<SprintTemplateId | null>(null);
  const [name, setName] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [routeId, setRouteId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tmpl = params.get("template") as SprintTemplateId | null;
    if (tmpl && SPRINT_TEMPLATES.some((t) => t.id === tmpl)) {
      setSelected(tmpl);
      const found = SPRINT_TEMPLATES.find((t) => t.id === tmpl);
      if (found) setName(found.label);
    }
  }, []);

  const handleSelectTemplate = (tmpl: typeof SPRINT_TEMPLATES[number]) => {
    setSelected(tmpl.id);
    setName(tmpl.label);
    setError(null);
  };

  const handleCreate = async () => {
    if (!selected) { setError("Escolha um template para continuar."); return; }
    if (!name.trim()) { setError("Dê um nome ao seu sprint."); return; }

    const sprint = buildSprintPlan({ templateId: selected, name: name.trim(), durationWeeks });
    const created = await addSprint({ ...sprint, routeId: routeId || undefined });
    if (!created) {
      setError("Não foi possível criar o sprint agora.");
      return;
    }
    router.push(`/sprints/${created.id}`);
  };

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref="/sprints" title="Novo Sprint" subtitle="Escolha um template — tarefas são geradas automaticamente" />

      <div className="space-y-3">
        {SPRINT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => handleSelectTemplate(tmpl)}
            className={`w-full card-surface p-4 flex items-center gap-4 text-left transition-all ${selected === tmpl.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === tmpl.id ? "bg-brand-100" : "bg-cream-200"}`}>
              {selected === tmpl.id
                ? <CheckCircle2 className="w-5 h-5 text-brand-500" />
                : <tmpl.icon className="w-5 h-5 text-text-muted" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-text-primary">{tmpl.label}</p>
              <p className="text-caption text-text-muted">{tmpl.description}</p>
            </div>
            <span className="text-caption text-text-muted flex-shrink-0">{tmpl.hint}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="card-surface p-6 space-y-4">
          <h2 className="font-heading text-h4 text-text-primary">Configurar Sprint</h2>

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Nome do sprint</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Duração</label>
            <select
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Rota vinculada <span className="text-text-muted font-normal">(opcional)</span></label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">Nenhuma rota vinculada</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-body-sm text-clay-500">{error}</p>}

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Criar Sprint <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
