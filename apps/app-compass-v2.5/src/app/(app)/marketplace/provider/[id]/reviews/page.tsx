"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function ProviderReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { providers } = useMarketplaceStore();

  const provider = useMemo(() => {
    if (!hydrated) return null;
    return providers.find((p) => p.id === id) ?? null;
  }, [hydrated, providers, id]);

  const reviews = provider?.reviews ?? [];
  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-32" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref={`/marketplace/provider/${id}`} title="Avaliações" subtitle={provider ? `${provider.name} · ${reviews.length} avaliações` : "Profissional não encontrado"} />

      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Nenhuma avaliação" description="Este profissional ainda não possui avaliações." />
      ) : (
        <>
          <div className="card-surface p-6 flex items-center gap-6">
            <div className="text-center">
              <p className="font-heading text-display text-text-primary">{avg}</p>
              <div className="flex gap-0.5 justify-center my-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avg)) ? "text-clay-500 fill-current" : "text-cream-400"}`} />)}</div>
              <p className="text-caption text-text-muted">{reviews.length} avaliações</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-caption text-text-muted w-4">{star}</span>
                    <Star className="w-3 h-3 text-clay-500 fill-current" />
                    <div className="flex-1 h-2 bg-cream-300 rounded-full"><div className="h-full bg-clay-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-caption text-text-muted w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card-surface p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-body-sm text-text-primary">{r.userName}</span>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 text-clay-500 fill-current" />)}</div>
                  </div>
                  <span className="text-caption text-text-muted">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="text-body-sm text-text-secondary mb-3">{r.comment}</p>
                <button className="flex items-center gap-1 text-caption text-text-muted hover:text-brand-500 transition-colors">
                  <ThumbsUp className="w-3 h-3" /> Útil
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
