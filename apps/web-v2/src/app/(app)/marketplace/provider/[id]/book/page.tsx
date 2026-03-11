"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Shield, CreditCard, Briefcase } from "lucide-react";
import { CATEGORY_LABELS, useMarketplaceStore } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, Input, PageHeader, Skeleton, useToast } from "@/components/ui";

const SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { getProviderById, createBooking } = useMarketplaceStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const provider = hydrated ? getProviderById(id) : undefined;
  const services = provider?.services.filter((service) => service.isActive) ?? [];
  const service = services.find((s) => s.id === selectedService);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon={Briefcase}
          title="Profissional não encontrado"
          description="Não foi possível carregar este profissional para agendamento."
        />
      </div>
    );
  }

  const handleConfirm = () => {
    if (!service || !selectedDate || (service.duration > 0 && !selectedSlot)) return;
    const booking = createBooking({
      providerId: provider.id,
      providerName: provider.name,
      serviceId: service.id,
      serviceTitle: service.title,
      date: selectedDate,
      time: service.duration > 0 ? selectedSlot : null,
      status: "pending",
      price: service.price,
      currency: service.currency,
      escrow: "pending",
      notes,
      rating: null,
    });
    toast({
      title: "Contratação criada",
      description: `Seu pedido com ${provider.name} foi enviado para confirmação.`,
      variant: "success",
    });
    router.push(`/marketplace/bookings/${booking.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/marketplace/provider/${provider.id}`} title={`Agendar com ${provider.name.split(" ")[0]}`} subtitle={provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ")} />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-3">1. Escolha o serviço</h3>
        <div className="space-y-2">
          {services.map((svc) => (
            <button key={svc.id} onClick={() => setSelectedService(svc.id)} className={`w-full p-4 rounded-lg flex items-center justify-between text-left transition-all ${selectedService === svc.id ? "ring-2 ring-moss-500 bg-moss-50/50" : "bg-cream-50 hover:bg-cream-100"}`}>
              <div>
                <p className="text-body-sm font-medium text-text-primary">{svc.title}</p>
                <p className="text-caption text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration > 0 ? `${svc.duration} min` : "Pacote"}</p>
              </div>
              <span className="font-heading font-bold text-text-primary">R$ {svc.price.toLocaleString("pt-BR")}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedService && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-3">2. Data e horário</h3>
          <div className="mb-4">
            <Input label="Data" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          {selectedDate && service?.duration !== 0 && (
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-1.5">Horário disponível</label>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((slot) => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2.5 rounded-lg text-body-sm font-medium transition-all ${selectedSlot === slot ? "bg-moss-500 text-white" : "bg-cream-100 text-text-secondary hover:bg-cream-200"}`}>{slot}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <Input label="Observações para o profissional" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexto, objetivo da sessão, links úteis..." />
          </div>
        </div>
      )}

      {selectedService && selectedDate && (service?.duration === 0 || selectedSlot) && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-3">3. Resumo e pagamento</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-body-sm"><span className="text-text-secondary">Serviço</span><span className="text-text-primary font-medium">{service?.title}</span></div>
            <div className="flex justify-between text-body-sm"><span className="text-text-secondary">Data</span><span className="text-text-primary font-medium">{new Date(selectedDate).toLocaleDateString("pt-BR")}{selectedSlot ? ` às ${selectedSlot}` : ""}</span></div>
            <div className="flex justify-between text-body-sm border-t border-cream-300 pt-2"><span className="text-text-primary font-bold">Total</span><span className="font-heading font-bold text-moss-500">R$ {service?.price.toLocaleString("pt-BR")}</span></div>
          </div>
          <div className="p-3 rounded-lg bg-cream-100 flex items-start gap-2 mb-4">
            <Shield className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" />
            <p className="text-caption text-text-secondary">Pagamento via escrow — o valor só é liberado ao profissional após a entrega do serviço ou aprovação sua.</p>
          </div>
          <button onClick={handleConfirm} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
            <CreditCard className="w-4 h-4" /> Confirmar e Pagar
          </button>
        </div>
      )}
    </div>
  );
}
