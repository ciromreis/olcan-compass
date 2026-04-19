"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Filter,
  Hash,
  Pencil,
  Plus,
  Search,
  Star,
  Download,
} from "lucide-react";
import { DOC_TYPE_LABELS, type DocType, useForgeStore } from "@/stores/forge";
import { useCommunityStore } from "@/stores/community";
import { useAuthStore } from "@/stores/auth";
import { useDossierStore } from "@/stores/dossier";
import { useEffectivePlan } from "@/hooks/use-effective-plan";
import { canCreateForgeDocument, maxForgeDocuments } from "@/lib/entitlements";
import { useHydration } from "@/hooks/use-hydration";
import { CommunityContextSection, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";
import { OpportunityDossierView } from "@/components/forge/OpportunityDossierView";
import { DossierHub } from "@/components/forge/DossierHub";
import { VariationsManager } from "@/components/forge/VariationsManager";
import { EnhancedDocumentPanel } from "@/components/forge/EnhancedDocumentPanel";
import { DossierTimeline } from "@/components/forge/DossierTimeline";

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "motivation_letter", label: "Carta de Motivacao" },
  { value: "cv", label: "Curriculo (CV)" },
  { value: "research_proposal", label: "Proposta de Pesquisa" },
  { value: "personal_statement", label: "Personal Statement" },
  { value: "recommendation", label: "Carta de Recomendacao" },
  { value: "other", label: "Outro" },
] as const;

export default function ForgeListPage() {
  const ready = useHydration();
  const { documents, getStats, syncFromApi } = useForgeStore();
  const { items } = useCommunityStore();
  const { user } = useAuthStore();
  const plan = useEffectivePlan();

  // Sync documents from backend when authenticated
  useEffect(() => {
    if (user?.id) syncFromApi();
  }, [user?.id, syncFromApi]);
  const forgeAllowed = canCreateForgeDocument(plan, documents.length);
  const forgeCap = maxForgeDocuments(plan);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
  const [viewMode, setViewMode] = useState<"list" | "opportunity" | "timeline" | "hub">("opportunity");
  const { getActiveDossiers } = useDossierStore();
  const activeDossiers = getActiveDossiers();
  const exportHref = activeDossiers.length > 0
    ? `/dossiers/${activeDossiers[0].id}/export`
    : '/dossiers';
  const stats = getStats();

  const statCards = [
    { icon: FileText, value: stats.total, label: "Documentos", color: "text-[#001338]" },
    { icon: Star, value: stats.avgScore ?? "-", label: "Score medio", color: (stats.avgScore ?? 0) >= 70 ? "text-emerald-700" : "text-slate-700" },
    { icon: Hash, value: stats.totalWords.toLocaleString("pt-BR"), label: "Palavras", color: "text-[#001338]/60" },
    { icon: Pencil, value: stats.recentlyEdited, label: "Edicoes recentes", color: "text-[#001338]" },
  ];

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...documents]
      .filter((doc) => {
        const matchesQuery =
          query.length === 0 ||
          doc.title.toLowerCase().includes(query) ||
          DOC_TYPE_LABELS[doc.type].toLowerCase().includes(query) ||
          (doc.targetProgram?.toLowerCase().includes(query) ?? false) ||
          doc.content.toLowerCase().includes(query);

        const matchesType = typeFilter === "all" || doc.type === typeFilter;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [documents, search, typeFilter]);

  const contextualItems = useMemo(() => {
    return items
      .filter((item) => item.topic === "narrative" || item.topic === "career" || item.topic === "community")
      .sort((a, b) => (b.savedCount + b.replyCount + b.likeCount) - (a.savedCount + a.replyCount + a.likeCount))
      .slice(0, 3);
  }, [items]);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value === "all" ? "all" : (value as DocType));
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 font-sans text-[#001338]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-h2 text-[#001338]">The Forge</h1>
          <p className="text-body font-medium italic text-[#001338]/60">
            O centro do dossier: documentos exportaveis, respostas estruturadas e ativos reutilizaveis por rota.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-500 bg-white px-4 py-2.5 text-body-sm font-heading font-semibold text-brand-600 transition-all hover:bg-brand-50"
          >
            <Download className="h-4 w-4" />
            Exportar Dossier
          </Link>
          {forgeAllowed ? (
            <Link
              href="/forge/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#001338] px-4 py-2.5 text-body-sm font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#001338]/20"
            >
              <Plus className="h-4 w-4" />
              Novo Documento
            </Link>
          ) : (
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-500 bg-slate-50 px-4 py-2.5 text-body-sm font-heading font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              Upgrade
            </Link>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#001338]/10 bg-white/40 p-1">
          {([
            { id: "hub", label: "Processos" },
            { id: "opportunity", label: "Por Oportunidade" },
            { id: "list", label: "Lista Completa" },
            { id: "timeline", label: "Timeline" },
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                viewMode === v.id
                  ? "bg-[#001338] text-white shadow-sm"
                  : "text-[#001338]/60 hover:bg-white/60 hover:text-[#001338]"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-[#001338]/60">
          {documents.length} documento{documents.length !== 1 ? 's' : ''} • {stats.totalWords.toLocaleString('pt-BR')} palavras
        </p>
      </section>

      {!forgeAllowed && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-body-sm text-slate-950">
          Plano gratuito: até {Number.isFinite(forgeCap) ? forgeCap : "∞"} documentos no Forge.
          Você atingiu o limite.{" "}
          <Link href="/subscription" className="font-semibold text-brand-700 underline underline-offset-2">
            Ver planos
          </Link>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <GlassCard
              key={card.label}
              variant="olcan"
              padding="md"
              shadow={false}
              className="border-[#001338]/5 bg-white/40 text-center"
            >
              <Icon className={cn("mx-auto mb-2 h-5 w-5 opacity-80", card.color)} />
              <p className={cn("mb-1 font-heading text-h3 leading-none", card.color)}>{card.value}</p>
              <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/30">{card.label}</p>
            </GlassCard>
          );
        })}
      </section>

      <section className="flex flex-col gap-4 md:flex-row">
        <GlassCard
          variant="olcan"
          padding="none"
          shadow={false}
          className="flex flex-1 items-center border-[#001338]/5 bg-white/40 shadow-sm ring-1 ring-[#001338]/5 transition-all group focus-within:bg-white"
        >
          <Search className="ml-4 h-4 w-4 text-[#001338]/30 group-focus-within:text-[#001338]" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por titulo, tipo ou conteudo..."
            aria-label="Buscar documentos"
            className="w-full bg-transparent px-4 py-4 text-body-sm font-medium text-[#001338] placeholder:text-[#001338]/30 focus:outline-none"
          />
        </GlassCard>

        <GlassCard
          variant="olcan"
          padding="none"
          shadow={false}
          className="inline-flex items-center border-[#001338]/5 bg-[#001338]/5 px-4 shadow-sm ring-1 ring-[#001338]/5"
        >
          <Filter className="mr-3 h-4 w-4 text-[#001338]/40" />
          <select
            value={typeFilter}
            onChange={(event) => handleTypeFilterChange(event.target.value)}
            className="min-w-[170px] cursor-pointer bg-transparent py-4 text-body-sm font-bold text-[#001338] focus:outline-none"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </GlassCard>
      </section>

      {viewMode === "hub" ? (
        <DossierHub />
      ) : viewMode === "opportunity" ? (
        <OpportunityDossierView />
      ) : viewMode === "timeline" ? (
        <DossierTimeline />
      ) : (
        <section className="grid gap-4">
          {filteredDocuments.map((doc) => (
          <Link key={doc.id} href={`/forge/${doc.id}`} className="block">
            <GlassCard
              variant="olcan"
              padding="lg"
              hover
              className="group border-[#001338]/5 shadow-sm transition-all hover:border-[#001338]/20"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#001338]/5 transition-colors group-hover:bg-[#001338]/10">
                  <FileText className="h-8 w-8 text-[#001338]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-h3 text-[#001338] transition-transform group-hover:translate-x-1">
                    {doc.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <span className="rounded-full bg-[#001338]/5 px-3 py-1 text-caption font-bold uppercase tracking-widest text-[#001338]/80">
                      {DOC_TYPE_LABELS[doc.type]}
                    </span>
                    <span className="flex items-center gap-1.5 text-caption font-medium text-[#001338]/40">
                      <Clock className="h-4 w-4" />
                      {formatDate(doc.updatedAt)}
                    </span>
                    <span className="text-caption font-bold text-[#001338]/30">
                      {doc.versions.length} VERSOES
                    </span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-8">
                  {doc.competitivenessScore !== null && (
                    <div className="text-right">
                      <div className="mb-1 flex items-center justify-end gap-1.5">
                        <Star
                          className={cn(
                            "h-4 w-4",
                            doc.competitivenessScore >= 70
                              ? "fill-emerald-500 text-emerald-500"
                              : "fill-slate-500 text-slate-500"
                          )}
                        />
                        <span className="font-heading text-h4 font-semibold text-[#001338]">
                          {doc.competitivenessScore}
                        </span>
                      </div>
                      <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/30">
                        Score Olcan
                      </p>
                    </div>
                  )}

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001338]/5 transition-all group-hover:scale-110 group-hover:bg-[#001338] group-hover:text-white">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}

        {filteredDocuments.length === 0 && (
          <GlassCard
            variant="olcan"
            padding="xl"
            className="border-[#001338]/5 border-dashed bg-transparent text-center shadow-none"
          >
            <Search className="mx-auto mb-4 h-10 w-10 text-[#001338]/10" />
            <p className="font-heading text-h4 text-[#001338]">Nenhum ativo de dossier encontrado</p>
            <p className="mt-2 text-body-sm font-medium italic text-[#001338]/40">
              Ajuste os filtros ou inicie um novo documento, resposta estruturada ou material de rota no Forge.
            </p>
          </GlassCard>
        )}
        </section>
      )}

      {contextualItems.length > 0 && (
        <section className="pt-8">
          <CommunityContextSection
            title="Insights da Comunidade para sua Narrativa"
            description="Aproveite o conhecimento compartilhado para elevar a qualidade dos seus documentos."
            items={contextualItems}
            columns={3}
          />
        </section>
      )}

    </div>
  );
}
