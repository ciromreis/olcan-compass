"use client";

import { useMemo } from "react";
import { DollarSign, CreditCard, Download, Clock, Wallet } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/file-export";
import { calculateAvailableToWithdraw } from "@/lib/finance-metrics";

export default function ProviderEarningsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { bookings, getActiveProvider, createPayoutRequest, getPayoutRequestsByProvider } = useMarketplaceStore();
  const provider = getActiveProvider();

  const { totalEarned, pending, transactions, availableToWithdraw, payoutRequests } = useMemo(() => {
    if (!hydrated || !provider) return { totalEarned: 0, pending: 0, transactions: [] as typeof bookings, availableToWithdraw: 0, payoutRequests: [] as ReturnType<typeof getPayoutRequestsByProvider> };
    const mine = bookings.filter((booking) => booking.providerId === provider.id);
    const completed = mine.filter((booking) => booking.status === "completed" || booking.escrow === "released");
    const held = mine.filter((booking) => booking.escrow === "held");
    const requests = getPayoutRequestsByProvider(provider.id).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    const completedRevenue = completed.reduce((sum, tx) => sum + tx.price, 0);
    return {
      totalEarned: completedRevenue,
      pending: held.reduce((sum, tx) => sum + tx.price, 0),
      transactions: [...mine].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      availableToWithdraw: calculateAvailableToWithdraw(completedRevenue, requests),
      payoutRequests: requests,
    };
  }, [hydrated, bookings, provider, getPayoutRequestsByProvider]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/provider" title="Financeiro" subtitle={provider ? `Perfil: ${provider.name}` : undefined} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <DollarSign className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Recebido</p>
          <p className="font-heading text-h2 text-brand-500">R$ {totalEarned.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5">
          <Clock className="w-5 h-5 text-clay-400 mb-2" />
          <p className="text-caption text-text-muted">Em Escrow</p>
          <p className="font-heading text-h2 text-clay-500">R$ {pending.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-surface p-5">
          <CreditCard className="w-5 h-5 text-text-muted mb-2" />
          <p className="text-caption text-text-muted">Disponível para Saque</p>
          <p className="font-heading text-h2 text-text-primary">R$ {availableToWithdraw.toLocaleString("pt-BR")}</p>
          <button
            onClick={() => {
              if (!provider) return;
              if (availableToWithdraw <= 0) {
                toast({
                  title: "Sem saldo disponível",
                  description: "Não há saldo elegível para novo saque neste momento.",
                  variant: "warning",
                });
                return;
              }
              const payoutId = createPayoutRequest(provider.id, availableToWithdraw, "Solicitação criada pelo portal do profissional");
              if (!payoutId) {
                toast({
                  title: "Falha na solicitação",
                  description: "Não foi possível registrar o saque.",
                  variant: "warning",
                });
                return;
              }
              toast({
                title: "Solicitação registrada",
                description: "Seu saque foi enviado para aprovação administrativa.",
                variant: "success",
              });
            }}
            className="mt-2 text-body-sm text-brand-500 font-medium hover:underline"
          >
            Sacar
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhuma transação" description="Suas transações aparecerão aqui conforme você receber agendamentos." />
      ) : (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-h4 text-text-primary">Transações</h3>
            <button
              onClick={() => {
                if (transactions.length === 0) return;
                const rows = [
                  ["Data", "Servico", "Valor", "Status Escrow"],
                  ...transactions.map((tx) => [tx.date, tx.serviceTitle, tx.price, tx.escrow]),
                ];
                downloadCsv(rows, "provider-transacoes.csv");
              }}
              className="inline-flex items-center gap-1 text-body-sm text-brand-500 font-medium hover:underline"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-lg bg-cream-50">
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary">{tx.serviceTitle}</p>
                  <p className="text-caption text-text-muted">{tx.providerName} · {new Date(tx.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-bold text-text-primary">{tx.currency} {tx.price.toLocaleString("pt-BR")}</p>
                  <p className={`text-caption font-medium ${tx.escrow === "released" ? "text-brand-500" : tx.escrow === "held" ? "text-clay-400" : "text-text-muted"}`}>
                    {tx.escrow === "released" ? "Liberado" : tx.escrow === "held" ? "Em escrow" : "Pendente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Solicitações de Saque</h3>
        {payoutRequests.length === 0 ? (
          <p className="text-body-sm text-text-muted">Nenhuma solicitação registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {payoutRequests.map((request) => (
              <div key={request.id} className="rounded-lg bg-cream-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-body-sm font-semibold text-text-primary">R$ {request.amount.toLocaleString("pt-BR")}</p>
                  <span className={`text-caption font-medium ${request.status === "approved" || request.status === "paid" ? "text-brand-500" : request.status === "rejected" ? "text-clay-500" : "text-text-muted"}`}>
                    {request.status === "pending" ? "Pendente" : request.status === "approved" ? "Aprovado" : request.status === "paid" ? "Pago" : "Rejeitado"}
                  </span>
                </div>
                <p className="text-caption text-text-muted">
                  Solicitado em {formatDate(request.requestedAt)} {request.processedAt ? `· Processado em ${formatDate(request.processedAt)}` : ""}
                </p>
                {request.note && <p className="text-caption text-text-muted mt-1">{request.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
