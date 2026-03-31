"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Clock, Star, Eye, GraduationCap, Briefcase, Award, ArrowRight, CheckCircle } from "lucide-react";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { applicationsApi } from "@/lib/api";
import { EmptyState, Input, PageHeader } from "@/components/ui";
import { formatDate, daysUntil } from "@/lib/format";

type OppType = "Todos" | "Mestrado" | "Doutorado" | "Bolsa" | "Emprego";

type OpportunityCard = {
  id: string;
  title: string;
  type: OppType;
  country: string;
  deadline: string;
  match: number;
  icon: typeof GraduationCap;
  opportunityId: string;
};

const TYPE_ICON_MAP: Record<Exclude<OppType, "Todos">, typeof GraduationCap> = {
  Mestrado: GraduationCap,
  Doutorado: GraduationCap,
  Bolsa: Award,
  Emprego: Briefcase,
};

const TYPE_LABEL_MAP: Record<string, Exclude<OppType, "Todos">> = {
  scholarship: "Bolsa",
  job: "Emprego",
  research_position: "Doutorado",
  exchange_program: "Mestrado",
  grant: "Bolsa",
  fellowship: "Bolsa",
  internship: "Emprego",
  conference: "Bolsa",
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const { addApplication, applications } = useApplicationStore();
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OppType>("Todos");
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const { data } = await applicationsApi.getOpportunities();
        const items = (data?.items || []).map((opp: Record<string, unknown>) => {
          const type = TYPE_LABEL_MAP[String(opp.opportunity_type || "")] || "Bolsa";
          return {
            id: String(opp.id),
            opportunityId: String(opp.id),
            title: String(opp.title || "Oportunidade Compass"),
            type,
            country: String(opp.location_country || opp.organization_country || "—"),
            deadline: String(opp.application_deadline || "").slice(0, 10),
            match: Number(opp.competitiveness_score || 0),
            icon: TYPE_ICON_MAP[type],
          } satisfies OpportunityCard;
        });
        setOpportunities(items);
      } catch {
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    }

    void loadOpportunities();
  }, []);

  const existingPrograms = useMemo(
    () => new Set(applications.map((a) => a.program)),
    [applications]
  );

  const filtered = useMemo(() => {
    let list = opportunities;
    if (filter !== "Todos") list = list.filter((o) => o.type === filter);
    if (search.trim()) {
      const lc = search.toLowerCase();
      list = list.filter((o) => o.title.toLowerCase().includes(lc) || o.country.toLowerCase().includes(lc));
    }
    return list;
  }, [filter, opportunities, search]);

  const buildApp = (opp: OpportunityCard, notes: string): UserApplication => {
    const id = `a${Date.now()}`;
    const now = new Date().toISOString().slice(0, 10);
    return {
      id,
      program: opp.title,
      type: opp.type,
      country: opp.country,
      deadline: opp.deadline,
      status: "draft",
      match: opp.match,
      documents: [],
      timeline: [
        { id: `te${Date.now()}_1`, event: "Candidatura criada", date: now, done: true },
        { id: `te${Date.now()}_2`, event: "Deadline de submissão", date: opp.deadline, done: false },
      ],
      notes,
      createdAt: now,
      opportunityId: opp.opportunityId,
    };
  };

  const handleAddToWatchlist = async (opp: OpportunityCard) => {
    const created = await addApplication(buildApp(opp, "Adicionado via Explorar Oportunidades"));
    if (!created) return;
    setAddedIds((prev) => new Set(prev).add(opp.id));
  };

  const handleApply = async (opp: OpportunityCard) => {
    if (existingPrograms.has(opp.title)) {
      const existing = applications.find((a) => a.program === opp.title);
      if (existing) router.push(`/applications/${existing.id}`);
      return;
    }
    const created = await addApplication(buildApp(opp, ""));
    if (!created) return;
    router.push(`/applications/${created.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Explorar Oportunidades" subtitle="Programas, bolsas e vagas compatíveis com seu perfil" backHref="/applications" />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h3 text-text-primary">{loading ? "…" : filtered.length}</p>
          <p className="text-caption text-text-muted">Resultados</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h3 text-brand-500">{applications.length}</p>
          <p className="text-caption text-text-muted">Já na sua lista</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h3 text-text-primary">{filter}</p>
          <p className="text-caption text-text-muted">Filtro ativo</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar oportunidades..."
          icon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <button onClick={() => setFilter("Todos")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Filter className="w-4 h-4" /> Limpar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["Todos", "Mestrado", "Doutorado", "Bolsa", "Emprego"] as OppType[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${filter === f ? "bg-brand-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{f}</button>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nenhuma oportunidade encontrada" description="Tente ajustar sua busca ou filtros." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((opp) => {
            const alreadyAdded = addedIds.has(opp.id) || existingPrograms.has(opp.title);
            const dl = daysUntil(opp.deadline);
            return (
              <div key={opp.id} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <opp.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-h4 text-text-primary truncate">{opp.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-caption text-text-muted">
                      <span className="px-2 py-0.5 rounded-full bg-cream-200">{opp.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.country}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(opp.deadline)}</span>
                      {dl > 0 && dl <= 30 && <span className="text-clay-500 font-medium">{dl}d</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-300">
                  <span className="flex items-center gap-1 text-body-sm font-bold text-brand-500"><Star className="w-4 h-4" />Match: {opp.match}%</span>
                  <div className="flex gap-2">
                    {alreadyAdded ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-caption font-medium text-brand-500"><CheckCircle className="w-3 h-3" /> Adicionado</span>
                    ) : (
                      <button onClick={() => handleAddToWatchlist(opp)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cream-500 text-text-secondary text-caption font-medium hover:bg-cream-200 transition-colors"><Eye className="w-3 h-3" /> Watchlist</button>
                    )}
                    <button onClick={() => handleApply(opp)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-caption font-medium hover:bg-brand-600 transition-colors">
                      {existingPrograms.has(opp.title) ? "Ver" : "Aplicar"} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
