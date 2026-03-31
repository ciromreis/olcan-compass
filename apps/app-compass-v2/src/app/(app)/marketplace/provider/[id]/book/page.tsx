"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, CreditCard, ShieldCheck, Zap, Lock, Loader2 } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton, EmptyState } from "@/components/ui";
import Link from "next/link";

export default function BookingCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");
  const router = useRouter();
  
  const hydrated = useHydration();
  const { getProviderById, loadProviderDetail } = useMarketplaceStore();
  
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const provider = hydrated ? getProviderById(id) : undefined;
  const service = provider?.services.find(s => s.id === serviceId);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    setIsLoadingProvider(true);
    void loadProviderDetail(id).finally(() => {
      if (active) setIsLoadingProvider(false);
    });
    return () => {
      active = false;
    };
  }, [hydrated, id, loadProviderDetail]);

  if (!hydrated || isLoadingProvider) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!provider || !service) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState 
          icon={ArrowLeft} 
          title="Serviço não encontrado" 
          description="O serviço selecionado não está mais disponível ou a URL é inválida." 
          action={
            <button
              type="button"
              onClick={() => router.push(`/marketplace/provider/${id}`)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Voltar ao perfil
            </button>
          }
        />
      </div>
    );
  }

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      // API call to mock Stripe Checkout Edge Function
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId: service.id,
          amount: service.price,
        }),
      });

      if (!res.ok) throw new Error("Erro na comunicação com gateway");
      
      const { url } = await res.json();
      
      // Redirect to the Stripe Checkout session or success page mock
      router.push(url);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      // Fallback local state if API fails
      router.push(`/marketplace/provider/${id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <Link href={`/marketplace/provider/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-nanobanana-400 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nanobanana-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="p-8 sm:p-10 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3 text-nanobanana-400 mb-6 font-bold uppercase tracking-widest text-[10px]">
            <Zap className="w-4 h-4" /> Gateway Seguro
          </div>
          
          <h1 className="font-heading text-h2 text-white mb-2">Checkout</h1>
          <p className="text-body-sm text-slate-400">
            Você está prestes a contratar a <strong className="text-white">Sessão Alpha</strong> com {provider.name}.
          </p>
        </div>

        <div className="p-8 sm:p-10 bg-slate-950/50 relative z-10">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <h3 className="font-heading text-xl text-white font-bold mb-1">{service.title}</h3>
            <p className="text-body-sm text-slate-400 mb-4">{service.description}</p>
            
            <div className="flex justify-between items-end pt-4 border-t border-white/5">
              {service.duration > 0 ? (
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Clock className="w-4 h-4" /> {service.duration} mins
                </div>
              ) : <div/>}
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Due</p>
                <p className="font-heading text-3xl font-black text-nanobanana-400">R$ {service.price.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Escrow Ativo:</strong> O valor ficará retido pela Olcan Compass até a conclusão comprovada do serviço. Se não houver comparecimento, 100% será reembolsado.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Transação 256-bit SSL via Stripe Connect.
              </p>
            </div>
          </div>

          <button 
            onClick={handleStripeCheckout}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-nanobanana-500 text-slate-900 font-heading font-black text-lg hover:bg-nanobanana-400 hover:shadow-[0_0_20px_rgba(255,235,59,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processando Gateway...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pay with Stripe</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
