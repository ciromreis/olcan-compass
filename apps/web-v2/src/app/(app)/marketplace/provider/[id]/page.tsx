"use client";

import { useParams, useRouter } from "next/navigation";
import { Star, Shield, MapPin, Clock, MessageSquare, Calendar, Globe, Briefcase } from "lucide-react";
import { useMarketplaceStore, CATEGORY_LABELS } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { PageHeader, EmptyState, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { getProviderById, ensureConversation } = useMarketplaceStore();

  const provider = hydrated ? getProviderById(id) : undefined;

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={Briefcase} title="Profissional não encontrado" description="Este profissional não está mais disponível." action={<button onClick={() => router.push("/marketplace")} className="px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors">Voltar ao Marketplace</button>} />
      </div>
    );
  }

  const handleContact = () => {
    const conversation = ensureConversation(provider.id);
    if (!conversation) return;
    router.push(`/marketplace/messages/${conversation.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title={provider.name} subtitle={provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ")} backHref="/marketplace" />

      <div className="card-surface p-6 flex flex-col md:flex-row gap-6">
        <div className="w-20 h-20 rounded-full bg-moss-50 flex items-center justify-center flex-shrink-0 text-moss-500 font-heading font-bold text-h2">
          {provider.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-h2 text-text-primary">{provider.name}</h1>
            {provider.verified && <Shield className="w-5 h-5 text-moss-500" />}
          </div>
          <p className="text-body text-text-secondary mb-3">
            {provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-4 text-body-sm text-text-secondary">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-clay-500 fill-current" />{provider.rating} ({provider.reviewCount} avaliações)</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{provider.country}</span>
            <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{provider.languages.join(", ")}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{provider.yearsExperience} anos de experiência</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => router.push(`/marketplace/provider/${provider.id}/book`)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors">
            <Calendar className="w-4 h-4" /> Agendar
          </button>
          <button onClick={handleContact} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            <MessageSquare className="w-4 h-4" /> Mensagem
          </button>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-2">Sobre</h3>
        <p className="text-body text-text-secondary">{provider.bio}</p>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Serviços ({provider.services.length})</h3>
        <div className="space-y-3">
          {provider.services.filter((s) => s.isActive).map((svc) => (
            <div key={svc.id} className="p-4 rounded-lg bg-cream-50 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="text-body-sm font-medium text-text-primary">{svc.title}</p>
                <p className="text-caption text-text-muted">{svc.description}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-body-sm font-bold text-text-primary">R$ {svc.price}</p>
                  {svc.duration > 0 && <p className="text-caption text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration} min</p>}
                </div>
                <button onClick={() => router.push(`/marketplace/provider/${provider.id}/book`)} className="px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors">Contratar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {provider.reviews.length > 0 && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Avaliações ({provider.reviews.length})</h3>
          <div className="space-y-4">
            {provider.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-lg bg-cream-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-body-sm text-text-primary">{r.userName}</span>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 text-clay-500 fill-current" />)}</div>
                  </div>
                  <span className="text-caption text-text-muted">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-body-sm text-text-secondary">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
