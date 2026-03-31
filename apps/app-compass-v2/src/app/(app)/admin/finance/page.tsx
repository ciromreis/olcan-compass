"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Download, Shield } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/file-export";
import { summarizePayoutRequests } from "@/lib/finance-metrics";

export default function AdminFinancePage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { bookings, payoutRequests, updatePayoutRequestStatus } = useMarketplaceStore();
  const { logAdminAction } = useAdminStore();

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + b.price, 0), [bookings]);
  const escrowHeld = useMemo(() => bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.price, 0), [bookings]);
  const disputeCount = useMemo(() => bookings.filter((b) => b.status === "cancelled").length, [bookings]);
  const payoutSummary = useMemo(() => summarizePayoutRequests(payoutRequests), [payoutRequests]);

  const transactions = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map((b) => ({
        user: `${b.providerName} — ${b.serviceTitle}`,
        amount: b.price,
        date: b.date,
        status: b.status === "cancelled" ? "disputed" : b.status === "confirmed" ? "held" : b.status === "completed" ? "paid" : "paid",
      }));
  }, [bookings]);

  const handlePayoutStatusUpdate = (
    request: (typeof payoutRequests)[number],
    status: "approved" | "rejected" | "paid",
    note: string,
    successTitle: string,
    successDescription: string
  ) => {
    const didUpdate = updatePayoutRequestStatus(request.id, status, note);
    if (!didUpdate) {
      logAdminAction({
        actor: actorEmail,
        module: "finance",
        action: "payout_invalid_transition",
        target: request.id,
        summary: `Tentativa inválida de atualizar saque ${request.id} (${request.providerName}) para ${status}.`,
      });
      toast({
        title: "Transição inválida",
        description: `Não foi possível atualizar ${request.providerName}: fluxo de status inválido.`,
        variant: "warning",
      });
      return;
    }

    toast({
      title: successTitle,
      description: successDescription,
      variant: "success",
    });
    logAdminAction({
      actor: actorEmail,
      module: "finance",
      action: `payout_${status}`,
      target: request.id,
      summary: `Solicitação de saque ${request.id} (${request.providerName}) atualizada para ${status}.`,
    });
  };

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Financeiro" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <DollarSign className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Receita Total</p>
          <p className="font-heading text-h2 text-brand-500">R$ {totalRevenue.toLocaleString("pt-BR")}</p>
          <p className="text-caption text-brand-500 mt-1"><TrendingUp className="w-3 h-3 inline" /> {bookings.length} contratações</p>
        </div>
        <div className="card-surface p-5">
          <Shield className="w-5 h-5 text-clay-400 mb-2" />
          <p className="text-caption text-text-muted">Em Escrow</p>
          <p className="font-heading text-h2 text-text-primary">R$ {escrowHeld.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5">
          <CreditCard className="w-5 h-5 text-sage-500 mb-2" />
          <p className="text-caption text-text-muted">Payouts</p>
          <p className="font-heading text-h2 text-text-primary">R$ {payoutSummary.paidAmount.toLocaleString("pt-BR")}</p>
          <p className="text-caption text-text-muted mt-1">{payoutSummary.pendingCount} solicitação(ões) pendente(s)</p>
        </div>
        <div className="card-surface p-5">
          <AlertTriangle className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Disputas abertas</p>
          <p className="font-heading text-h2 text-clay-500">{disputeCount}</p>
        </div>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Transações Recentes</h3>
          <button
            onClick={() => {
              if (transactions.length === 0) return;
              const rows = [
                ["Data", "Descrição", "Valor", "Status"],
                ...transactions.map((transaction) => [
                  transaction.date,
                  transaction.user,
                  transaction.amount,
                  transaction.status,
                ]),
              ];
              downloadCsv(rows, "admin-finance-transactions.csv");
            }}
            className="inline-flex items-center gap-1 text-body-sm text-brand-500 font-medium hover:underline"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map((tx, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-cream-50">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.status === "disputed" ? "bg-clay-500" : tx.status === "held" ? "bg-clay-300" : "bg-brand-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-text-primary">{tx.user}</p>
                <p className="text-caption text-text-muted">{formatDate(tx.date)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-heading font-bold text-text-primary">R$ {tx.amount}</p>
                <p className={`text-caption font-medium ${tx.status === "disputed" ? "text-clay-500" : tx.status === "held" ? "text-clay-400" : "text-brand-500"}`}>
                  {tx.status === "paid" ? "Pago" : tx.status === "held" ? "Retido" : "Disputa"}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-body-sm text-text-muted text-center py-4">Nenhuma transação registrada.</p>
          )}
        </div>
      </div>

      <div className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-h4 text-text-primary">Solicitações de Saque</h3>
          <span className="text-caption text-text-muted">R$ {payoutSummary.pendingAmount.toLocaleString("pt-BR")} pendente</span>
        </div>
        {payoutRequests.length === 0 ? (
          <p className="text-body-sm text-text-muted">Nenhuma solicitação de saque registrada.</p>
        ) : (
          <div className="space-y-3">
            {[...payoutRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map((request) => (
              <div key={request.id} className="rounded-lg bg-cream-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{request.providerName}</p>
                    <p className="text-caption text-text-muted">
                      Solicitado em {formatDate(request.requestedAt)}
                      {request.processedAt ? ` · Processado em ${formatDate(request.processedAt)}` : ""}
                    </p>
                    {request.note && <p className="text-caption text-text-muted mt-1">{request.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm font-bold text-text-primary">R$ {request.amount.toLocaleString("pt-BR")}</p>
                    <p className={`text-caption font-medium ${request.status === "approved" || request.status === "paid" ? "text-brand-500" : request.status === "rejected" ? "text-clay-500" : "text-text-muted"}`}>
                      {request.status === "pending" ? "Pendente" : request.status === "approved" ? "Aprovado" : request.status === "paid" ? "Pago" : "Rejeitado"}
                    </p>
                  </div>
                </div>
                {(request.status === "pending" || request.status === "approved") && (
                  <div className="flex flex-wrap gap-2">
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handlePayoutStatusUpdate(
                              request,
                              "approved",
                              "Aprovado pelo painel financeiro.",
                              "Saque aprovado",
                              `Solicitação de ${request.providerName} aprovada.`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-caption font-medium hover:bg-brand-600 transition-colors"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() =>
                            handlePayoutStatusUpdate(
                              request,
                              "rejected",
                              "Rejeitado por inconsistência de saldo.",
                              "Saque rejeitado",
                              `Solicitação de ${request.providerName} rejeitada.`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg border border-clay-300 text-clay-500 text-caption font-medium hover:bg-clay-50 transition-colors"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <button
                        onClick={() =>
                          handlePayoutStatusUpdate(
                            request,
                            "paid",
                            "Pagamento executado.",
                            "Saque pago",
                            `Pagamento de ${request.providerName} marcado como concluído.`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-brand-300 text-brand-600 text-caption font-medium hover:bg-brand-50 transition-colors"
                      >
                        Marcar como pago
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
