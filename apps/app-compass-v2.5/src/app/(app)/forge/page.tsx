"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import { DOC_TYPE_LABELS, type DocType, useForgeStore } from "@/stores/forge";
import { useCommunityStore } from "@/stores/community";
import { useHydration } from "@/hooks/use-hydration";
import { CommunityContextSection, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

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
  const { documents, getStats } = useForgeStore();
  const { items } = useCommunityStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
  const stats = getStats();

  const statCards = [
    { icon: FileText, value: stats.total, label: "Documentos", color: "text-[#001338]" },
    { icon: Star, value: stats.avgScore ?? "-", label: "Score medio", color: (stats.avgScore ?? 0) >= 70 ? "text-emerald-700" : "text-amber-700" },
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
    <div className="mx-auto max-w-5xl space-y-8 p-4 font-sans text-[#001338]">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-h2 text-[#001338]">The Forge</h1>
          <p className="text-body font-medium italic text-[#001338]/60">
            Transformando sua trajetoria em uma narrativa de ouro.
          </p>
        </div>
        <Link
          href="/forge/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#001338] px-6 py-3.5 text-body-sm font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#001338]/20"
        >
          <Plus className="h-5 w-5" />
          Novo Documento
        </Link>
      </header>

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
                              : "fill-amber-500 text-amber-500"
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
            <p className="font-heading text-h4 text-[#001338]">Nenhum documento encontrado</p>
            <p className="mt-2 text-body-sm font-medium italic text-[#001338]/40">
              Ajuste os filtros ou inicie uma nova criacao no Forge.
            </p>
          </GlassCard>
        )}
      </section>

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
