"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, Shield, Star, MessageSquare, CheckCircle, Download, XCircle, Briefcase, FileText } from "lucide-react";
import { useMarketplaceStore, type EscrowStatus } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { ConfirmationModal, EmptyState, PageHeader, Skeleton, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { downloadFile } from "@/lib/file-export";

const ESCROW_LABELS: Record<EscrowStatus, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-text-muted" },
  held: { label: "Retido", color: "text-brand-500" },
  released: { label: "Liberado", color: "text-sage-500" },
  refunded: { label: "Reembolsado", color: "text-clay-500" },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { getBookingById, updateBookingStatus, rateBooking, ensureConversation, getConversation } = useMarketplaceStore();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const booking = hydrated ? getBookingById(id) : undefined;

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState icon={Briefcase} title="Contratação não encontrada" action={<button onClick={() => router.push("/marketplace/bookings")} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors">Voltar às Contratações</button>} />
      </div>
    );
  }

  const escrow = ESCROW_LABELS[booking.escrow];
  const isActive = booking.status === "pending" || booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const canRate = isCompleted && booking.rating === null;
  const conversation = getConversation(booking.providerId);
  const sharedDeliverables = (conversation?.messages || [])
    .flatMap((message) =>
      (message.attachments || []).map((attachment) => ({
        ...attachment,
        sharedAt: message.timestamp,
        senderName: message.senderName,
      }))
    );

  const steps = [
    { step: "Contratação criada", done: true, date: formatDate(booking.createdAt) },
    { step: "Pagamento via escrow", done: booking.escrow !== "pending", date: booking.escrow !== "pending" ? formatDate(booking.createdAt) : "Pendente" },
    { step: "Confirmada pelo profissional", done: booking.status !== "pending", date: booking.status !== "pending" ? formatDate(booking.createdAt) : "Aguardando" },
    { step: "Serviço realizado", done: isCompleted, date: isCompleted ? formatDate(booking.date) : formatDate(booking.date) },
    { step: "Avaliação e liberação do escrow", done: booking.rating !== null, date: booking.rating !== null ? "Concluído" : "Após serviço" },
  ];

  const handleComplete = () => {
    updateBookingStatus(booking.id, "completed");
    toast({
      title: "Escrow liberado",
      description: "A contratação foi concluída e o pagamento foi marcado para liberação.",
      variant: "success",
    });
  };

  const handleCancel = () => {
    updateBookingStatus(booking.id, "cancelled");
    toast({
      title: "Contratação cancelada",
      description: "O status foi atualizado e o fluxo de reembolso foi sinalizado.",
      variant: "warning",
    });
  };

  const handleRate = () => {
    if (selectedRating > 0) {
      rateBooking(booking.id, selectedRating);
      toast({
        title: "Avaliação enviada",
        description: `Você avaliou ${booking.providerName} com ${selectedRating} estrela${selectedRating > 1 ? "s" : ""}.`,
        variant: "success",
      });
    }
  };

  const handleMessage = () => {
    const conversation = ensureConversation(booking.providerId);
    if (!conversation) return;
    router.push(`/marketplace/messages/${conversation.id}`);
  };

  const handleDeliverableDownload = (deliverableId: string) => {
    const deliverable = sharedDeliverables.find((item) => item.id === deliverableId);
    if (!deliverable) return;

    const manifest = [
      "Olcan Compass",
      `Entrega compartilhada: ${deliverable.name}`,
      `Profissional: ${booking.providerName}`,
      `Serviço: ${booking.serviceTitle}`,
      `Compartilhado por: ${deliverable.senderName}`,
      `Data: ${formatDate(deliverable.sharedAt)}`,
      `Tamanho registrado: ${deliverable.size} bytes`,
      `Tipo: ${deliverable.type || "não informado"}`,
      "",
      "Observação: este arquivo representa um registro local da entrega compartilhada na conversa.",
    ].join("\n");

    downloadFile(manifest, `${deliverable.name}.txt`, "text/plain;charset=utf-8");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={booking.serviceTitle} subtitle={`com ${booking.providerName}`} backHref="/marketplace/bookings" />

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center">
          <Calendar className="w-4 h-4 text-text-muted mx-auto mb-1" />
          <p className="text-caption text-text-muted">Data</p>
          <p className="font-heading font-bold text-text-primary">{formatDate(booking.date)}</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Clock className="w-4 h-4 text-text-muted mx-auto mb-1" />
          <p className="text-caption text-text-muted">Horário</p>
          <p className="font-heading font-bold text-text-primary">{booking.time || "—"}</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Shield className={`w-4 h-4 mx-auto mb-1 ${escrow.color}`} />
          <p className="text-caption text-text-muted">Escrow</p>
          <p className={`font-heading font-bold ${escrow.color}`}>{escrow.label}</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted">Valor</p>
          <p className="font-heading font-bold text-h3 text-text-primary">R$ {booking.price}</p>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Status da Contratação</h3>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-cream-400" />
          {steps.map((s) => (
            <div key={s.step} className="relative pb-5 last:pb-0">
              <div className={`absolute left-[-21px] w-3 h-3 rounded-full ${s.done ? "bg-brand-500" : "bg-cream-400"}`} />
              <div className="flex items-center justify-between">
                <p className={`text-body-sm ${s.done ? "text-text-primary" : "text-text-muted"}`}>{s.step}</p>
                <span className="text-caption text-text-muted">{s.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Entregas</h3>
        {sharedDeliverables.length > 0 ? (
          <div className="space-y-3">
            {sharedDeliverables.map((deliverable) => (
              <div key={deliverable.id} className="flex items-center justify-between rounded-lg bg-cream-50 p-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-text-primary truncate">{deliverable.name}</p>
                    <p className="text-caption text-text-muted">
                      Compartilhado por {deliverable.senderName} em {formatDate(deliverable.sharedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeliverableDownload(deliverable.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-cream-400 px-3 py-2 text-body-sm text-text-secondary hover:bg-cream-200 transition-colors"
                >
                  <Download className="w-4 h-4" /> Exportar registro
                </button>
              </div>
            ))}
            <p className="text-caption text-text-muted">
              As entregas são derivadas dos anexos compartilhados na conversa desta contratação.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-cream-50 flex items-center gap-3">
            <Download className="w-5 h-5 text-text-muted" />
            <p className="text-body-sm text-text-muted italic">
              Nenhuma entrega compartilhada ainda. Use a conversa com o profissional para anexar materiais desta contratação.
            </p>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex gap-3">
          <button onClick={handleMessage} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
            <MessageSquare className="w-4 h-4" /> Enviar Mensagem
          </button>
          <button onClick={() => setCompleteOpen(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors">
            <CheckCircle className="w-4 h-4" /> Aprovar e Liberar Escrow
          </button>
          <button onClick={() => setCancelOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-clay-300 text-clay-500 font-medium hover:bg-clay-50 transition-colors">
            <XCircle className="w-4 h-4" /> Cancelar
          </button>
        </div>
      )}

      {canRate && (
        <div className="card-surface p-6 bg-cream-100">
          <h3 className="font-heading text-h4 text-text-primary mb-3">Avaliar Profissional</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className="p-1"
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setSelectedRating(s)}
              >
                <Star className={`w-6 h-6 transition-colors ${s <= (hoveredStar || selectedRating) ? "text-clay-500 fill-current" : "text-cream-400"}`} />
              </button>
            ))}
          </div>
          <button onClick={handleRate} disabled={selectedRating === 0} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Enviar Avaliação
          </button>
        </div>
      )}

      {booking.rating !== null && (
        <div className="card-surface p-6 bg-cream-100">
          <h3 className="font-heading text-h4 text-text-primary mb-2">Sua Avaliação</h3>
          <div className="flex gap-1">
            {Array.from({ length: booking.rating }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-clay-500 fill-current" />
            ))}
          </div>
        </div>
      )}

      <ConfirmationModal
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Liberar escrow e concluir contratação?"
        description="Use esta ação apenas quando o serviço tiver sido entregue conforme combinado."
        confirmLabel="Concluir contratação"
        cancelLabel="Voltar"
        variant="success"
      />

      <ConfirmationModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar contratação?"
        description="Esta ação marca a contratação como cancelada e sinaliza o processo de reembolso no escrow."
        confirmLabel="Confirmar cancelamento"
        cancelLabel="Manter contratação"
        variant="destructive"
      />
    </div>
  );
}
