"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Clock, Star, Search, Filter, ArrowRight, Pencil, Hash } from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useCommunityStore } from "@/stores/community";
import { useHydration } from "@/hooks/use-hydration";
import { CommunityContextSection, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";

const TYPE_OPTIONS: Array<{ value: "all" | DocType; label: string }> = [
  { value: "all", label: "Todos os tipos" },
  { value: "motivation_letter", label: DOC_TYPE_LABELS.motivation_letter },
  { value: "cv", label: DOC_TYPE_LABELS.cv },
  { value: "research_proposal", label: DOC_TYPE_LABELS.research_proposal },
  { value: "personal_statement", label: DOC_TYPE_LABELS.personal_statement },
  { value: "recommendation", label: DOC_TYPE_LABELS.recommendation },
  { value: "other", label: DOC_TYPE_LABELS.other },
];

export default function ForgeListPage() {
  const ready = useHydration();
  const { documents, getStats } = useForgeStore();
  const { items } = useCommunityStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
  const stats = getStats();

  const sorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...documents]
      .filter((doc) => {
        const matchesQuery =
          query.length === 0 ||
          doc.title.toLowerCase().includes(query) ||
          DOC_TYPE_LABELS[doc.type].toLowerCase().includes(query) ||
          doc.targetProgram?.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query);
        const matchesType = typeFilter === "all" || doc.type === typeFilter;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [documents, search, typeFilter]);

  const contextualItems = useMemo(() => {
    const topics = ["narrative", "career", "community"];
    return items
      .filter((item) => topics.includes(item.topic))
      .sort((a, b) => (b.savedCount + b.replyCount + b.likeCount) - (a.savedCount + a.replyCount + a.likeCount))
      .slice(0, 3);
  }, [items]);

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">The Forge</h1>
          <p className="text-body text-text-secondary mt-1">Crie, refine e analise seus documentos</p>
        </div>
        <Link href="/forge/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          <Plus className="w-4 h-4" /> Novo Documento
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center">
          <FileText className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="font-heading text-h3 text-text-primary">{stats.total}</p>
          <p className="text-caption text-text-muted">Documentos</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Star className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className={`font-heading text-h3 ${stats.avgScore >= 70 ? "text-brand-500" : "text-amber-500"}`}>{stats.avgScore || "—"}</p>
          <p className="text-caption text-text-muted">Score médio</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Hash className="w-5 h-5 text-text-muted mx-auto mb-1" />
          <p className="font-heading text-h3 text-text-primary">{stats.totalWords.toLocaleString("pt-BR")}</p>
          <p className="text-caption text-text-muted">Palavras</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Pencil className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="font-heading text-h3 text-sage-500">{stats.recentlyEdited}</p>
          <p className="text-caption text-text-muted">Editados esta semana</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar documentos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium bg-white">
          <Filter className="w-4 h-4" /> Filtrar
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | DocType)} className="bg-transparent focus:outline-none">
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {sorted.map((doc) => (
          <Link key={doc.id} href={`/forge/${doc.id}`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-h4 text-text-primary truncate group-hover:text-brand-500 transition-colors">{doc.title}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-body-sm text-text-secondary">
                  <span className="px-2 py-0.5 rounded-full bg-cream-200 text-caption">{DOC_TYPE_LABELS[doc.type]}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(doc.updatedAt)}</span>
                  <span className="text-caption text-text-muted">{doc.versions.length} versões</span>
                  {doc.targetProgram && <span className="text-caption text-text-muted">{doc.targetProgram}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {doc.competitivenessScore !== null && (
                  <div className="text-right">
                    <div className="flex items-center gap-1"><Star className={`w-4 h-4 ${doc.competitivenessScore >= 70 ? "text-brand-500" : "text-amber-500"}`} /><span className="font-heading font-bold text-text-primary">{doc.competitivenessScore}</span></div>
                    <p className="text-caption text-text-muted">Competitividade</p>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
        {sorted.length === 0 && (
          <div className="card-surface p-6 text-center">
            <p className="font-heading text-h4 text-text-primary">Nenhum documento encontrado</p>
            <p className="text-body-sm text-text-secondary mt-1">Ajuste sua busca ou crie um novo documento no Forge.</p>
          </div>
        )}
      </div>

      {contextualItems.length > 0 && (
        <CommunityContextSection
          title="Referências para elevar seus documentos"
          description="Use conteúdo salvo e perguntas da comunidade como insumo para melhorar narrativa, posicionamento e clareza."
          items={contextualItems}
          columns={3}
        />
      )}
    </div>
  );
}
