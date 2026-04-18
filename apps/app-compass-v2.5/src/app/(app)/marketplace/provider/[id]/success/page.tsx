"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Calendar, ArrowRight, MessageSquare } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton, EmptyState } from "@/components/ui";

export default function CheckoutSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
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
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <EmptyState
          icon={CheckCircle2}
          title="Sessão inválida"
          description="Esta página precisa de um código de reserva válido."
          action={
            <button
              type="button"
              onClick={() => router.push(`/marketplace/provider/${id}`)}
              className="rounded-xl border border-cream-500 bg-white px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-cream-100"
            >
              Voltar ao perfil
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-16 space-y-6">
      <div className="card-surface p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto ring-4 ring-brand-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="font-heading text-h2 text-text-primary">Solicitação Registrada!</h1>
          <p className="text-body text-text-secondary mt-2 max-w-sm mx-auto">
            Sua solicitação foi enviada para{" "}
            <strong className="text-text-primary">{provider.name}</strong>. Você receberá a confirmação do horário em breve.
          </p>
        </div>

        <div className="rounded-xl bg-cream-50 border border-cream-300 p-4 text-left space-y-2">
          <p className="text-body-sm font-semibold text-text-primary">Próximos passos</p>
          <ol className="space-y-1.5 text-body-sm text-text-secondary list-decimal list-inside">
            <li>O especialista confirmará a data e horário.</li>
            <li>Você receberá o link da sessão por mensagem.</li>
            <li>O pagamento será processado após a confirmação.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push("/marketplace/bookings")}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-cream-500 bg-white text-text-primary font-heading font-medium hover:bg-cream-100 transition-colors"
          >
            <Calendar className="w-4 h-4" /> Minhas Reservas
          </button>
          <button
            onClick={() => {
              const conv = ensureConversation(provider.id);
              if (conv) router.push(`/marketplace/messages/${conv.id}`);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Enviar Mensagem <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
