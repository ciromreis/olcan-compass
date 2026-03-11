"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, CheckCircle, Circle, AlertTriangle, User, CalendarDays, Upload } from "lucide-react";
import { useMarketplaceStore, type BookingStatus } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { Input, Modal, PageHeader, Skeleton, EmptyState, useToast } from "@/components/ui";

const STATUS_META: Record<BookingStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Aguardando", color: "text-text-muted", icon: Circle },
  confirmed: { label: "Confirmado", color: "text-moss-500", icon: CheckCircle },
  completed: { label: "Concluído", color: "text-sage-500", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-clay-500", icon: AlertTriangle },
};

type FilterKey = "all" | BookingStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "confirmed", label: "Confirmados" },
  { key: "completed", label: "Concluídos" },
];

export default function ProviderBookingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { bookings, updateBookingStatus, shareDeliverable, getActiveProvider } = useMarketplaceStore();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [deliverableOpen, setDeliverableOpen] = useState(false);
  const [deliverableBookingId, setDeliverableBookingId] = useState<string | null>(null);
  const [deliverableName, setDeliverableName] = useState("");
  const [deliverableType, setDeliverableType] = useState("application/pdf");
  const [deliverableSizeKb, setDeliverableSizeKb] = useState("180");
  const [deliverableNote, setDeliverableNote] = useState("");
  const provider = getActiveProvider();

  const filtered = useMemo(() => {
    if (!hydrated) return [];
    const mine = provider ? bookings.filter((booking) => booking.providerId === provider.id) : [];
    if (filter === "all") return mine;
    return mine.filter((booking) => booking.status === filter);
  }, [hydrated, bookings, filter, provider]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-10" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  const selectedBooking = deliverableBookingId
    ? filtered.find((booking) => booking.id === deliverableBookingId) || bookings.find((booking) => booking.id === deliverableBookingId)
    : null;

  const handleOpenDeliverable = (bookingId: string) => {
    setDeliverableBookingId(bookingId);
    setDeliverableName("entrega-documento.pdf");
    setDeliverableType("application/pdf");
    setDeliverableSizeKb("180");
    setDeliverableNote("");
    setDeliverableOpen(true);
  };

  const handleShareDeliverable = () => {
    if (!deliverableBookingId || !deliverableName.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Informe o nome do arquivo para compartilhar a entrega.",
        variant: "warning",
      });
      return;
    }

    const sizeBytes = Math.max(1, Math.round((Number(deliverableSizeKb) || 1) * 1024));
    const ok = shareDeliverable(deliverableBookingId, {
      name: deliverableName.trim(),
      type: deliverableType.trim(),
      size: sizeBytes,
      note: deliverableNote.trim() || undefined,
    });

    if (!ok) {
      toast({
        title: "Falha ao compartilhar",
        description: "Não foi possível registrar a entrega na conversa da contratação.",
        variant: "warning",
      });
      return;
    }

    setDeliverableOpen(false);
    toast({
      title: "Entrega compartilhada",
      description: "O anexo foi enviado para a conversa da contratação.",
      variant: "success",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/provider" title="Agendamentos" subtitle={provider ? `Perfil: ${provider.name}` : undefined} />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${f.key === filter ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhum agendamento" description={filter === "all" ? "Você ainda não possui agendamentos." : "Nenhum agendamento com este status."} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const st = STATUS_META[b.status];
            return (
              <div key={b.id} className="card-surface p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-text-primary">{b.serviceTitle}</p>
                  <p className="text-body-sm text-text-secondary">{b.notes || "Sem observações registradas"}</p>
                  <div className="flex gap-3 mt-1 text-caption text-text-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(b.date).toLocaleDateString("pt-BR")}</span>
                    {b.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>}
                    <span className={`flex items-center gap-1 ${st.color}`}><st.icon className="w-3 h-3" />{st.label}</span>
                  </div>
                </div>
                {b.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => {
                      updateBookingStatus(b.id, "confirmed");
                      toast({ title: "Agendamento confirmado", description: "O cliente já pode prosseguir com o atendimento.", variant: "success" });
                    }} className="px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors">Confirmar</button>
                    <button onClick={() => {
                      updateBookingStatus(b.id, "cancelled");
                      toast({ title: "Agendamento recusado", description: "O status foi marcado como cancelado.", variant: "warning" });
                    }} className="px-3 py-1.5 rounded-lg border border-clay-300 text-clay-500 text-caption font-medium hover:bg-clay-50 transition-colors">Recusar</button>
                  </div>
                )}
                {(b.status === "confirmed" || b.status === "completed") && (
                  <button
                    onClick={() => handleOpenDeliverable(b.id)}
                    className="px-3 py-1.5 rounded-lg border border-cream-500 text-text-secondary text-caption font-medium hover:bg-cream-200 transition-colors inline-flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Registrar entrega
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={deliverableOpen}
        onClose={() => setDeliverableOpen(false)}
        title="Registrar entrega"
        description={selectedBooking ? `Anexo da contratação: ${selectedBooking.serviceTitle}` : "Anexe um arquivo para a contratação"}
        size="sm"
      >
        <div className="space-y-4">
          <Input label="Nome do arquivo" value={deliverableName} onChange={(event) => setDeliverableName(event.target.value)} />
          <Input label="Tipo MIME" value={deliverableType} onChange={(event) => setDeliverableType(event.target.value)} />
          <Input label="Tamanho (KB)" type="number" value={deliverableSizeKb} onChange={(event) => setDeliverableSizeKb(event.target.value)} />
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Observação</label>
            <textarea
              value={deliverableNote}
              onChange={(event) => setDeliverableNote(event.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400"
              placeholder="Ex.: versão final assinada."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeliverableOpen(false)} className="px-4 py-2 rounded-lg border border-cream-500 text-text-secondary hover:bg-cream-200 transition-colors">Cancelar</button>
            <button onClick={handleShareDeliverable} className="px-4 py-2 rounded-lg bg-moss-500 text-white hover:bg-moss-600 transition-colors inline-flex items-center gap-2"><Upload className="w-4 h-4" /> Compartilhar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
