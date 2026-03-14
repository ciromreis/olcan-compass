"use client";

import { useMemo } from "react";
import { Settings, DollarSign, FileText, CheckCircle } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState, Button } from "@/components/ui";
import { CATEGORY_LABELS, useMarketplaceStore } from "@/stores/marketplace";

export default function ProviderServicesPage() {
  const hydrated = useHydration();
  const { bookings, getActiveProvider } = useMarketplaceStore();

  const provider = getActiveProvider();
  const services = useMemo(() => {
    if (!provider) return [];

    return provider.services.map((service) => ({
      ...service,
      bookings: bookings.filter((booking) => booking.serviceId === service.id).length,
    }));
  }, [bookings, provider]);

  if (!hydrated || !provider) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/provider" title="Meus Serviços" subtitle={`${services.length} serviços cadastrados no Marketplace`} actions={
        <Button disabled className="flex items-center gap-1 bg-brand-500 text-white disabled:opacity-60">Cadastro manual por enquanto</Button>
      }/>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length > 0 ? services.map((s) => (
          <div key={s.id} className="card-surface p-5 flex flex-col group hover:-translate-y-1 transition-transform border border-cream-300">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-caption px-3 py-1 rounded-full font-medium ${s.isActive ? 'bg-brand-50 text-brand-600' : 'bg-clay-50 text-clay-600'}`}>
                {s.isActive ? 'Ativo' : 'Pausado'}
              </span>
              <button className="text-text-muted hover:text-brand-500 transition-colors p-1"><Settings className="w-5 h-5" /></button>
            </div>
            
            <h3 className="font-heading text-h4 text-text-primary mb-1">{s.title}</h3>
            <p className="text-body-sm text-text-secondary mb-4">{CATEGORY_LABELS[s.category]}</p>
            
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-body-sm text-text-primary">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-text-muted" /> Preço Base</span>
                <span className="font-medium text-brand-600">{s.currency} {s.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-text-primary">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-text-muted" /> Vendas Realizadas</span>
                <span>{s.bookings} contratos</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <EmptyState icon={FileText} title="Nenhum serviço ofertado." description="Seu catálogo ainda não possui serviços publicados. O cadastro direto pelo portal do profissional ainda está em implantação." />
          </div>
        )}
      </div>
    </div>
  );
}
