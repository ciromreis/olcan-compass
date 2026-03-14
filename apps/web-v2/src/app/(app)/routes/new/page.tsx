"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, GraduationCap, Briefcase, FlaskConical, Rocket, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { Input, PageHeader } from "@/components/ui";
import { useRouteStore } from "@/stores/routes";
import { buildRoutePlan, COUNTRY_OPTIONS, getRouteTypeLabel, previewRouteMilestones, TIMELINE_OPTIONS, type RouteIntentType } from "@/lib/route-planner";

const ROUTE_TYPES = [
  { id: "scholarship", icon: GraduationCap, label: "Bolsa de Estudos", description: "Mestrado, doutorado ou graduação com financiamento" },
  { id: "employment", icon: Briefcase, label: "Relocação por Emprego", description: "Visto de trabalho patrocinado por empresa" },
  { id: "research", icon: FlaskConical, label: "Pesquisa / PhD", description: "Posição acadêmica com bolsa de pesquisa" },
  { id: "startup", icon: Rocket, label: "Startup Visa", description: "Empreender no exterior com visto de investidor" },
  { id: "exchange", icon: Globe, label: "Intercâmbio", description: "Experiência de curta/média duração" },
] as const;

export default function NewRoutePage() {
  const router = useRouter();
  const { addRoute } = useRouteStore();
  const [selected, setSelected] = useState<RouteIntentType | null>(null);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ country: "", budget: "", timeline: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as RouteIntentType | null;
    const nextCountry = params.get("country") || "";

    if (type) setSelected(type);
    if (nextCountry) {
      setConfig((current) => ({ ...current, country: nextCountry }));
    }
  }, []);

  const previewMilestones = useMemo(() => {
    if (!selected) return [];
    return previewRouteMilestones(selected);
  }, [selected]);

  const canCreate = selected && config.country && config.budget.trim() && config.timeline;

  const handleCreate = async () => {
    if (!selected || !config.country || !config.budget.trim() || !config.timeline) {
      setError("Preencha país, orçamento e prazo para gerar sua rota.");
      return;
    }

    const route = buildRoutePlan({
      type: selected,
      country: config.country,
      budget: config.budget,
      timeline: config.timeline,
    });

    const created = await addRoute(route);
    if (!created) {
      setError("Não foi possível criar a rota na API.");
      return;
    }
    router.push(`/routes/${created.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Criar Nova Rota"
        subtitle="Transforme sua intenção de mobilidade em um plano executável com milestones iniciais"
      />

      <div className="flex gap-2 mb-4">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-brand-500" : "bg-cream-300"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-heading text-h3 text-text-primary">Tipo de Rota</h2>
          <div className="grid gap-3">
            {ROUTE_TYPES.map((type) => (
              <button key={type.id} onClick={() => setSelected(type.id)} className={`card-surface p-5 flex items-center gap-4 text-left transition-all ${selected === type.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${selected === type.id ? "bg-brand-100" : "bg-cream-200"}`}>
                  <type.icon className={`w-5 h-5 ${selected === type.id ? "text-brand-500" : "text-text-muted"}`} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-text-primary">{type.label}</p>
                  <p className="text-body-sm text-text-secondary">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} disabled={!selected} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6 items-start">
          <div className="space-y-5">
            <h2 className="font-heading text-h3 text-text-primary">Configuração</h2>
            <div className="card-surface p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">País de destino</label>
                <select value={config.country} onChange={(e) => { setConfig({ ...config, country: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent">
                  <option value="">Selecione o país</option>
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">Orçamento disponível (BRL)</label>
                <Input value={config.budget} onChange={(e) => { setConfig({ ...config, budget: e.target.value }); setError(null); }} placeholder="R$ 20.000" />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">Prazo desejado</label>
                <select value={config.timeline} onChange={(e) => { setConfig({ ...config, timeline: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent">
                  <option value="">Selecione</option>
                  {TIMELINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-body-sm text-clay-500">{error}</p>}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button onClick={() => void handleCreate()} disabled={!canCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 disabled:opacity-50 transition-colors">
                Criar Rota <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="card-surface p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-brand-500">
                <Sparkles className="w-4 h-4" />
                <p className="text-caption font-heading font-semibold uppercase tracking-wider">Prévia do plano</p>
              </div>
              <h3 className="font-heading text-h4 text-text-primary">
                {selected ? getRouteTypeLabel(selected) : "Escolha uma intenção"}
              </h3>
              <p className="text-body-sm text-text-secondary mt-2">
                Sua rota será criada com milestones iniciais para orientar preparação, documentação e execução.
              </p>
            </div>
            <div className="space-y-3">
              {previewMilestones.map((milestone, index) => (
                <div key={`${milestone.group}-${milestone.name}`} className="flex items-start gap-3 rounded-lg bg-cream-50 px-4 py-3">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${index === 0 ? "text-brand-500" : "text-cream-500"}`} />
                  <div>
                    <p className="text-caption text-text-muted">{milestone.group}</p>
                    <p className="text-body-sm text-text-primary">{milestone.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
