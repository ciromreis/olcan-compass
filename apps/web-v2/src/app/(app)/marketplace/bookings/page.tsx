"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, Circle, AlertTriangle, ArrowRight, Shield } from "lucide-react";
import { useMarketplaceStore, type BookingStatus, type EscrowStatus } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Aguardando confirmação", color: "text-text-muted", icon: Circle },
  confirmed: { label: "Confirmada", color: "text-moss-500", icon: CheckCircle },
  completed: { label: "Concluída", color: "text-sage-500", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "text-clay-500", icon: AlertTriangle },
};

const ESCROW_LABELS: Record<EscrowStatus, string> = {
  pending: "Pendente",
  held: "Retido",
  released: "Liberado",
  refunded: "Reembolsado",
};

type FilterTab = "all" | "active" | "completed";

export default function BookingsListPage() {
  const hydrated = useHydration();
  const { bookings } = useMarketplaceStore();
  const [tab, setTab] = useState<FilterTab>("all");

  const summary = useMemo(() => {
    const active = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
    const completed = bookings.filter((b) => b.status === "completed");
    const protectedValue = active.reduce((sum, booking) => sum + booking.price, 0);
    return {
      active: active.length,
      completed: completed.length,
      protectedValue,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    if (tab === "active") return bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
    if (tab === "completed") return bookings.filter((b) => b.status === "completed");
    return bookings;
  }, [bookings, tab]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Minhas Contratações" subtitle={`${bookings.length} contratações`} backHref="/marketplace" />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">{summary.active}</p>
          <p className="text-caption text-text-muted">Ativas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-sage-500">{summary.completed}</p>
          <p className="text-caption text-text-muted">Concluídas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-moss-500">R$ {summary.protectedValue}</p>
          <p className="text-caption text-text-muted">Em escrow</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "active", "completed"] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${tab === t ? "bg-moss-500 text-white" : "bg-cream-100 text-text-secondary hover:bg-cream-200"}`}
          >
            {t === "all" ? "Todas" : t === "active" ? "Ativas" : "Concluídas"}
          </button>
        ))}
      </div>

      <p className="text-body-sm text-text-muted">
        {filtered.length} contratação{filtered.length !== 1 ? "ões" : ""}
        {tab === "active" ? " exigindo acompanhamento" : tab === "completed" ? " concluída" : " no total"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Nenhuma contratação" description="Explore o marketplace para encontrar profissionais." />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const st = STATUS_MAP[booking.status];
            return (
              <Link key={booking.id} href={`/marketplace/bookings/${booking.id}`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform block">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-moss-50 flex items-center justify-center flex-shrink-0 text-moss-500 font-heading font-bold">
                    {booking.providerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-h4 text-text-primary">{booking.serviceTitle}</h3>
                    <p className="text-body-sm text-text-secondary">{booking.providerName}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-caption text-text-muted">
                      <span className={`flex items-center gap-1 ${st.color}`}><st.icon className="w-3.5 h-3.5" />{st.label}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.date)}</span>
                      {booking.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</span>}
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-moss-500" />Escrow: {ESCROW_LABELS[booking.escrow]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-heading font-bold text-text-primary">R$ {booking.price}</p>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-moss-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
