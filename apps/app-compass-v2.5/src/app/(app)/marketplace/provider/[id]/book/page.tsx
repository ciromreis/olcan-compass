"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, Lock, Loader2, CalendarDays, MessageSquare } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton, EmptyState, PlanGate } from "@/components/ui";
import { useEntitlement } from "@/hooks";
import Link from "next/link";

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookingCheckoutPage() {
  const { allowed } = useEntitlement("marketplace_book");
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");
  const router = useRouter();

  const hydrated = useHydration();
  const { getProviderById, loadProviderDetail, createBooking } = useMarketplaceStore();

  const [isLoadingProvider, setIsLoadingProvider] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [proposedDate, setProposedDate] = useState(todayPlusDays(3));
  const [notes, setNotes] = useState("");

  const provider = hydrated ? getProviderById(id) : undefined;
  const service = provider?.services.find((s) => s.id === serviceId);

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

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <PlanGate feature="marketplace_book" />
      </div>
    );
  }

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
          description="O serviço selecionado não está mais disponível ou o endereço é inválido."
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

  const handleConfirmar = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const booking = await createBooking({
        providerId: provider.id,
        providerName: provider.name,
        serviceId: service.id,
        serviceTitle: service.title,
        date: proposedDate,
        time: null,
        status: "pending",
        price: service.price,
        currency: service.currency,
        escrow: "pending",
        notes,
        rating: null,
      });
      router.push(`/marketplace/provider/${id}/success?booking_id=${booking.id}`);
    } catch {
      setErrorMsg("Não foi possível registrar a reserva. Tente novamente em instantes.");
      setIsProcessing(false);
    }
  };

  const minDate = todayPlusDays(1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <Link
        href={`/marketplace/provider/${id}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-500 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao perfil
      </Link>

      <div className="card-surface p-6 space-y-6">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">Solicitar Reserva</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Revise os detalhes e escolha uma data preferencial. O especialista confirmará o horário exato.
          </p>
        </div>

        {/* Service summary */}
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 space-y-3">
          <div>
            <p className="text-caption text-text-muted uppercase tracking-wider font-semibold">Serviço selecionado</p>
            <h2 className="font-heading text-h3 text-text-primary mt-1">{service.title}</h2>
            {service.description && (
              <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">{service.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-brand-100">
            {service.duration > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                <Clock className="w-4 h-4" /> {service.duration} min
              </span>
            ) : (
              <span className="text-body-sm text-text-secondary">Entrega assíncrona</span>
            )}
            <span className="font-heading text-h3 text-brand-500">
              R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Date picker */}
        <div className="space-y-2">
          <label className="text-body-sm font-semibold text-text-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-500" />
            Data preferencial
          </label>
          <input
            type="date"
            value={proposedDate}
            min={minDate}
            onChange={(e) => setProposedDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <p className="text-caption text-text-muted">
            O especialista confirmará o horário definitivo após receber sua solicitação.
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-body-sm font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            Mensagem para o especialista <span className="text-text-muted font-normal">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descreva brevemente seu objetivo, situação atual ou o que gostaria de abordar na sessão..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Guarantees */}
        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-body-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Escrow ativo:</span> o valor ficará retido pela Olcan até a confirmação de entrega. Se o serviço não for realizado, você recebe reembolso integral.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
            <p className="text-body-sm text-text-secondary">
              Pagamento processado com segurança via Stripe. A Olcan nunca armazena dados de cartão.
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-body-sm text-clay-600 bg-clay-50 border border-clay-200 rounded-lg px-4 py-3">
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleConfirmar}
          disabled={isProcessing || !proposedDate}
          className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body hover:bg-brand-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Registrando solicitação...</>
          ) : (
            <>Confirmar Solicitação de Reserva — R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</>
          )}
        </button>
      </div>
    </div>
  );
}
