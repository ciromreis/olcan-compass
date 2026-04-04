"use client";

import { useMemo } from "react";
import { Shield, DollarSign, Clock, CheckCircle, CreditCard } from "lucide-react";
import { useMarketplaceStore, type EscrowStatus } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

const ESCROW_LABELS: Record<EscrowStatus, { label: string; color: string }> = {
  pending: { label: "Aguardando pagamento", color: "text-text-muted" },
  held: { label: "Retido em escrow", color: "text-brand-500" },
  released: { label: "Liberado", color: "text-sage-500" },
  refunded: { label: "Reembolsado", color: "text-clay-400" },
};

export default function EscrowDashboardPage() {
  const hydrated = useHydration();
  const { bookings } = useMarketplaceStore();

  const { transactions, totalHeld, totalReleased } = useMemo(() => {
    if (!hydrated) return { transactions: [], totalHeld: 0, totalReleased: 0 };
    const txs = bookings.filter((b) => b.escrow !== "pending" || b.status !== "cancelled");
    const held = txs.filter((t) => t.escrow === "held").reduce((s, t) => s + t.price, 0);
    const released = txs.filter((t) => t.escrow === "released").reduce((s, t) => s + t.price, 0);
    return { transactions: txs, totalHeld: held, totalReleased: released };
  }, [hydrated, bookings]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-24" /><div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/marketplace" title="Escrow" subtitle="Gerencie seus pagamentos com segurança" />

      <div className="card-surface p-6 bg-gradient-to-r from-brand-50 to-cream-100">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-brand-500" />
          <p className="text-body text-text-secondary">Todos os pagamentos são protegidos por escrow. O valor só é liberado ao profissional após sua aprovação.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <DollarSign className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Retido em Escrow</p>
          <p className="font-heading text-h2 text-brand-500">R$ {totalHeld.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <CheckCircle className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Já Liberado</p>
          <p className="font-heading text-h2 text-text-primary">R$ {totalReleased.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Clock className="w-5 h-5 text-text-muted mx-auto mb-1" />
          <p className="text-caption text-text-muted">Transações</p>
          <p className="font-heading text-h2 text-text-primary">{transactions.length}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={CreditCard} title="Nenhuma transação" description="Suas transações de escrow aparecerão aqui após agendar serviços." />
      ) : (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Histórico de Transações</h3>
          <div className="space-y-3">
            {transactions.map((tx) => {
              const st = ESCROW_LABELS[tx.escrow] ?? ESCROW_LABELS.pending;
              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 rounded-lg bg-cream-50">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500 font-heading font-bold text-caption">
                    {tx.providerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-text-primary">{tx.serviceTitle}</p>
                    <p className="text-caption text-text-muted">{tx.providerName} · {new Date(tx.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading font-bold text-text-primary">{tx.currency} {tx.price.toLocaleString("pt-BR")}</p>
                    <p className={`text-caption font-medium ${st.color}`}>{st.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
