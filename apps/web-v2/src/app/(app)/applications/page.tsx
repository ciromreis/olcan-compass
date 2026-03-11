"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, FileCheck, Clock, AlertTriangle, Search, Filter, ArrowRight, CheckCircle, Circle, Eye, Send } from "lucide-react";
import { useApplicationStore, type AppStatus } from "@/stores/applications";
import { useCommunityStore } from "@/stores/community";
import { useHydration } from "@/hooks/use-hydration";
import { CommunityContextSection, EmptyState, Input, Skeleton } from "@/components/ui";
import { daysUntil } from "@/lib/format";

const STATUS_MAP: Record<AppStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Rascunho", color: "text-text-muted", icon: Circle },
  in_progress: { label: "Em andamento", color: "text-moss-500", icon: Clock },
  submitted: { label: "Enviada", color: "text-sage-500", icon: Send },
  accepted: { label: "Aceita", color: "text-moss-600", icon: CheckCircle },
  rejected: { label: "Rejeitada", color: "text-clay-500", icon: AlertTriangle },
  waitlisted: { label: "Lista de espera", color: "text-amber-500", icon: Clock },
};

type StatusFilter = "all" | AppStatus;

export default function ApplicationsListPage() {
  const ready = useHydration();
  const { applications, getStats } = useApplicationStore();
  const { items } = useCommunityStore();
  const stats = getStats();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || app.program.toLowerCase().includes(term) || app.country.toLowerCase().includes(term) || app.type.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  const contextualItems = useMemo(() => {
    const urgentExists = applications.some((app) => {
      const dl = daysUntil(app.deadline);
      return dl <= 14 && app.status !== "submitted" && app.status !== "accepted" && app.status !== "rejected";
    });
    const topics = urgentExists ? ["narrative", "readiness", "community"] : ["narrative", "scholarship", "career"];
    return items
      .filter((item) => topics.includes(item.topic))
      .sort((a, b) => (b.savedCount + b.replyCount) - (a.savedCount + a.replyCount))
      .slice(0, 2);
  }, [applications, items]);

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">Candidaturas</h1>
          <p className="text-body text-text-secondary mt-1">Gerencie suas aplicações para programas, bolsas e vagas</p>
        </div>
        <Link href="/applications/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors">
          <Plus className="w-4 h-4" /> Nova Candidatura
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-text-primary">{stats.total}</p>
          <p className="text-caption text-text-muted">Total</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-sage-500">{stats.submitted}</p>
          <p className="text-caption text-text-muted">Enviadas</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className={`font-heading text-h2 ${stats.urgentCount > 0 ? "text-clay-500" : "text-text-primary"}`}>{stats.urgentCount}</p>
          <p className="text-caption text-text-muted">Deadline em 14 dias</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar candidaturas..." icon={<Search className="w-4 h-4" />} className="flex-1" />
        <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Filter className="w-4 h-4" /> Limpar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${statusFilter === "all" ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>Todos</button>
        {(Object.entries(STATUS_MAP) as [AppStatus, (typeof STATUS_MAP)[AppStatus]][]).map(([status, config]) => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${statusFilter === status ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{config.label}</button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState icon={Search} title="Nenhuma candidatura encontrada" description="Tente ajustar sua busca ou filtro de status." />
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => {
            const st = STATUS_MAP[app.status];
            const readyDocs = app.documents.filter((d) => d.status === "ready").length;
            const dl = daysUntil(app.deadline);
            const isUrgent = dl <= 14 && app.status !== "submitted" && app.status !== "accepted" && app.status !== "rejected";
            return (
              <Link key={app.id} href={`/applications/${app.id}`} className={`card-surface p-6 group hover:-translate-y-0.5 transition-transform ${isUrgent ? "border-l-4 border-clay-400" : ""}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isUrgent ? "bg-clay-50" : "bg-moss-50"}`}>
                    <FileCheck className={`w-6 h-6 ${isUrgent ? "text-clay-500" : "text-moss-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-h4 text-text-primary truncate">{app.program}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-body-sm text-text-secondary">
                      <span className="px-2 py-0.5 rounded-full bg-cream-200 text-caption">{app.type}</span>
                      <span className={`flex items-center gap-1 ${st.color}`}><st.icon className="w-3.5 h-3.5" />{st.label}</span>
                      <span className={`flex items-center gap-1 ${isUrgent ? "text-clay-500 font-medium" : "text-text-muted"}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {dl > 0 ? `${dl} dias` : "Vencido"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-body-sm font-bold text-text-primary">{readyDocs}/{app.documents.length} docs</p>
                      <p className="text-caption text-text-muted">Match: {app.match}%</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-moss-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/applications/watchlist" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <Eye className="w-6 h-6 text-sage-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Watchlist</h3><p className="text-body-sm text-text-secondary">Oportunidades que você está acompanhando</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
        <Link href="/applications/calendar" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <Clock className="w-6 h-6 text-clay-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Calendário de Deadlines</h3><p className="text-body-sm text-text-secondary">Visualização por mês de todos os prazos</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
      </div>

      {contextualItems.length > 0 && (
        <CommunityContextSection
          title="Apoio contextual para candidaturas"
          description="Referências e discussões da comunidade para melhorar submissão, narrativa e timing."
          items={contextualItems}
          columns={2}
        />
      )}
    </div>
  );
}
