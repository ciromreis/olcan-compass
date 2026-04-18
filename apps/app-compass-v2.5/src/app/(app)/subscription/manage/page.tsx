"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Clock, AlertTriangle, Download, CheckCircle2, PencilLine, RotateCcw } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore } from "@/stores/profile";
import { useHydration } from "@/hooks";
import { Button, ConfirmationModal, Input, PageHeader, Skeleton, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { downloadFile } from "@/lib/file-export";

function formatMoney(amount: number) {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ManageSubscriptionPage() {
  const hydrated = useHydration();
  const { user } = useAuthStore();
  const {
    plan,
    subscriptionStatus,
    cancellationEffectiveDate,
    paymentMethod,
    invoices,
    updatePaymentMethod,
    scheduleCancellation,
    reactivateSubscription,
  } = useProfileStore();
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [holderName, setHolderName] = useState(paymentMethod.holderName);
  const [expiryMonth, setExpiryMonth] = useState(String(paymentMethod.expMonth).padStart(2, "0"));
  const [expiryYear, setExpiryYear] = useState(String(paymentMethod.expYear));

  useEffect(() => {
    setHolderName(paymentMethod.holderName);
    setExpiryMonth(String(paymentMethod.expMonth).padStart(2, "0"));
    setExpiryYear(String(paymentMethod.expYear));
  }, [paymentMethod]);

  const handleInvoiceDownload = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;

    const content = [
      "Olcan Compass",
      `Fatura: ${invoice.id}`,
      `Plano: ${invoice.plan}`,
      `Valor: ${formatMoney(invoice.amount)}`,
      `Data: ${formatDate(invoice.date)}`,
      `Status: ${invoice.status}`,
      `Descrição: ${invoice.description}`,
    ].join("\n");

    downloadFile(content, `${invoice.id}.txt`, "text/plain;charset=utf-8");

    toast({
      title: "Fatura exportada",
      description: `Arquivo ${invoice.id}.txt preparado para download.`,
      variant: "success",
    });
  };

  const handlePaymentSave = () => {
    const month = Number(expiryMonth);
    const year = Number(expiryYear);
    if (!holderName.trim() || month < 1 || month > 12 || year < new Date().getFullYear()) {
      toast({
        title: "Método inválido",
        description: "Revise o nome e a validade do cartão antes de salvar.",
        variant: "warning",
      });
      return;
    }

    updatePaymentMethod({
      holderName: holderName.trim(),
      expMonth: month,
      expYear: year,
    });
    setEditingPayment(false);
    toast({
      title: "Método atualizado",
      description: "Os dados locais de cobrança foram atualizados com sucesso.",
      variant: "success",
    });
  };

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-32" /><Skeleton className="h-48" /><Skeleton className="h-32" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref="/subscription"
        title="Gerenciar Assinatura"
        subtitle={user?.full_name ? `Conta de ${user.full_name}` : undefined}
        actions={
          <Link href="/subscription/usage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            Ver uso
          </Link>
        }
      />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Método de Pagamento</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-cream-50">
            <CreditCard className="w-6 h-6 text-text-muted" />
            <div className="flex-1">
              <p className="text-body-sm font-medium text-text-primary">
                {paymentMethod.brand} terminando em {paymentMethod.last4}
              </p>
              <p className="text-caption text-text-muted">
                Expira {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear} · {paymentMethod.holderName}
              </p>
            </div>
            <button
              onClick={() => setEditingPayment((current) => !current)}
              className="inline-flex items-center gap-1 text-body-sm text-brand-500 font-medium hover:underline"
            >
              <PencilLine className="w-4 h-4" /> {editingPayment ? "Fechar" : "Alterar"}
            </button>
          </div>

          {editingPayment && (
            <div className="grid md:grid-cols-[1.5fr_0.7fr_0.8fr_auto] gap-3 items-end">
              <Input label="Nome no cartão" value={holderName} onChange={(event) => setHolderName(event.target.value)} />
              <Input label="Mês" value={expiryMonth} onChange={(event) => setExpiryMonth(event.target.value.replace(/\D/g, "").slice(0, 2))} />
              <Input label="Ano" value={expiryYear} onChange={(event) => setExpiryYear(event.target.value.replace(/\D/g, "").slice(0, 4))} />
              <Button onClick={handlePaymentSave} className="h-11">
                <CheckCircle2 className="w-4 h-4" /> Salvar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Histórico de Faturas</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-cream-50">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-text-muted" />
                <div>
                  <span className="block text-body-sm text-text-primary">{formatDate(inv.date)}</span>
                  <span className="block text-caption text-text-muted">{inv.description}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-body-sm font-medium text-text-primary">{formatMoney(inv.amount)}</span>
                <span className={`text-caption font-medium ${inv.status === "paid" ? "text-brand-500" : inv.status === "pending" ? "text-slate-500" : "text-text-muted"}`}>
                  {inv.status === "paid" ? "Pago" : inv.status === "pending" ? "Pendente" : "Sem cobrança"}
                </span>
                <button
                  onClick={() => handleInvoiceDownload(inv.id)}
                  className="p-1 hover:bg-cream-200 rounded"
                >
                  <Download className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-6 border border-clay-200">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Cancelar Assinatura</h3>
        <p className="text-body-sm text-text-secondary mb-4">
          {subscriptionStatus === "cancel_at_period_end" && cancellationEffectiveDate
            ? `Seu cancelamento já está agendado para ${formatDate(cancellationEffectiveDate)}. Você ainda pode reativar antes dessa data.`
            : "Ao cancelar, você manterá acesso até o fim do período atual. Após isso, será rebaixado ao plano Explorador."}
        </p>
        {plan === "free" ? (
          <p className="text-body-sm text-text-muted">Sua conta já está no plano gratuito.</p>
        ) : subscriptionStatus === "cancel_at_period_end" ? (
          <button
            onClick={() => {
              reactivateSubscription();
              toast({
                title: "Assinatura reativada",
                description: "O cancelamento agendado foi removido.",
                variant: "success",
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-300 text-brand-500 text-body-sm font-medium hover:bg-brand-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reativar assinatura
          </button>
        ) : (
          <button onClick={() => setCancelOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors">
            <AlertTriangle className="w-4 h-4" /> Cancelar Assinatura
          </button>
        )}
      </div>

      <ConfirmationModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          scheduleCancellation();
          toast({ title: "Assinatura marcada para cancelamento", description: "Seu acesso continuará até o fim do período atual.", variant: "warning" });
        }}
        title="Cancelar assinatura?"
        description="Você ainda poderá usar o plano atual até o fim do ciclo vigente. Depois disso, sua conta volta para Explorador."
        confirmLabel="Confirmar cancelamento"
        cancelLabel="Manter plano"
        variant="destructive"
      />
    </div>
  );
}
