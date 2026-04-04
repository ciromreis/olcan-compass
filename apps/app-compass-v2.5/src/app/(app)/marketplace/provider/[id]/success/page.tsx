"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton, EmptyState } from "@/components/ui";

export default function CheckoutSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();
  
  const hydrated = useHydration();
  const { getProviderById, loadProviderDetail, ensureConversation } = useMarketplaceStore();

  const provider = hydrated ? getProviderById(id) : undefined;

  useEffect(() => {
    if (!hydrated) return;
    loadProviderDetail(id).catch(console.error);
  }, [hydrated, id, loadProviderDetail]);

  if (!hydrated || !provider) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-10">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <EmptyState 
          icon={CheckCircle2} 
          title="Sessão Inválida" 
          description="A sessão de pagamento não foi encontrada." 
          action={
            <button
              type="button"
              onClick={() => router.push(`/marketplace/provider/${id}`)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Voltar
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-16">
      <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-nanobanana-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="p-10 relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 ring-4 ring-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="font-heading text-h2 text-white mb-4">Pagamento Confirmado!</h1>
          <p className="text-body text-slate-400 mb-8 max-w-sm">
            Seu pagamento foi confirmado. A sessão com <strong>{provider.name}</strong> está desbloqueada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={() => router.push(`/marketplace/bookings`)}
              className="flex-1 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-heading font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Minha Agenda
            </button>
            <button 
              onClick={() => {
                const conv = ensureConversation(provider.id);
                if (conv) router.push(`/marketplace/messages/${conv.id}`);
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-nanobanana-500 text-slate-900 font-heading font-bold hover:bg-nanobanana-400 transition-all shadow-[0_0_20px_rgba(255,235,59,0.2)] flex items-center justify-center gap-2"
            >
              Mensagem <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push(`/interviews`)}
              className="w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-heading font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Voltar para o simulador de entrevistas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
