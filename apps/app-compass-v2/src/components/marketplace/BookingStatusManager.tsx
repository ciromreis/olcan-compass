"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Check } from "lucide-react";
import { useMarketplaceStore, Booking } from "@/stores/canonicalMarketplaceProviderStore";
import { Button, useToast } from "@/components/ui";

interface BookingStatusManagerProps {
  booking: Booking;
}

export function BookingStatusManager({ booking }: BookingStatusManagerProps) {
  const { updateBookingStatus } = useMarketplaceStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    setLoading(true);
    try {
      await updateBookingStatus(booking.id, status);
      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${status}.`,
        variant: "success",
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating booking:", err);
      }
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível mudar o status do agendamento.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (booking.status === "completed" || booking.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-50 text-text-muted text-caption font-medium border border-cream-200">
        {booking.status === "completed" ? (
          <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-clay-400" />
        )}
        {booking.status === "completed" ? "Concluído" : "Cancelado"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {booking.status === "pending" && (
        <>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-clay-500 hover:text-clay-600 hover:bg-clay-50"
            onClick={() => handleUpdate("cancelled")}
            disabled={loading}
          >
            Recusar
          </Button>
          <Button 
            size="sm" 
            variant="primary" 
            onClick={() => handleUpdate("confirmed")}
            loading={loading}
            className="gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Aceitar
          </Button>
        </>
      )}

      {booking.status === "confirmed" && (
        <>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-clay-500 hover:text-clay-600 hover:bg-clay-50"
            onClick={() => handleUpdate("cancelled")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            size="sm" 
            variant="accent" 
            onClick={() => handleUpdate("completed")}
            loading={loading}
            className="gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Concluir
          </Button>
        </>
      )}
    </div>
  );
}
