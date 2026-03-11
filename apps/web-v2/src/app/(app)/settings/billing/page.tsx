"use client";

import { useState } from "react";
import { CreditCard, DollarSign, Download, Settings } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, Button } from "@/components/ui";

export default function SettingsBillingPage() {
  const hydrated = useHydration();

  const [invoices] = useState([
    { id: "inv-001", date: "2024-03-01", amount: 49.99, status: "paid", pdf: "#" },
    { id: "inv-002", date: "2024-02-01", amount: 49.99, status: "paid", pdf: "#" },
    { id: "inv-003", date: "2024-01-01", amount: 49.99, status: "paid", pdf: "#" }
  ]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/settings" title="Assinatura e Pagamentos" />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Cur Plan */}
        <div className="card-surface p-6 border border-moss-200 bg-gradient-to-br from-white to-moss-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-h3 text-text-primary flex items-center gap-2"><Settings className="w-6 h-6 text-moss-500" /> Plano Pro</h3>
            <span className="text-caption px-2 py-1 bg-moss-200 text-moss-800 rounded font-medium">Ativo</span>
          </div>
          <p className="text-h1 font-heading text-text-primary mb-2">R$ 49,99 <span className="text-body text-text-muted font-normal">/mês</span></p>
          <p className="text-body-sm text-text-secondary mb-6">Próxima cobrança em 01 de Abril de 2024 no cartão final 4242.</p>
          <div className="flex gap-2">
            <Button className="bg-white text-text-primary border border-cream-300 hover:bg-cream-100 flex-1">Alterar Plano</Button>
            <Button variant="secondary" className="flex-1 text-clay-600 hover:bg-clay-50 border-clay-300">Cancelar</Button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-text-muted" /> Método de Pagamento</h3>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-cream-50 border border-cream-200 mb-4">
            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
            <div className="flex-1">
              <p className="text-body font-medium text-text-primary">•••• •••• •••• 4242</p>
              <p className="text-caption text-text-muted">Expira em 12/2026</p>
            </div>
            <span className="text-caption px-2 py-1 bg-cream-200 text-text-secondary rounded">Padrão</span>
          </div>
          <Button variant="secondary" className="w-full justify-center">Adicionar novo cartão</Button>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-moss-500" /> Histórico de Faturas</h3>
        <table className="w-full text-left text-body-sm">
          <thead>
            <tr className="border-b border-cream-300">
              <th className="py-3 font-medium text-text-muted">Data</th>
              <th className="py-3 font-medium text-text-muted">Descrição</th>
              <th className="py-3 font-medium text-text-muted">Valor</th>
              <th className="py-3 font-medium text-text-muted">Status</th>
              <th className="py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                <td className="py-3 text-text-primary">{inv.date}</td>
                <td className="py-3 text-text-secondary">Assinatura Mensal - Pro</td>
                <td className="py-3 text-text-primary font-medium">R$ {inv.amount.toFixed(2)}</td>
                <td className="py-3">
                  <span className={`text-caption px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-moss-50 text-moss-600' : 'bg-clay-50 text-clay-600'}`}>
                    {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <a href={inv.pdf} className="inline-flex items-center text-moss-500 hover:text-moss-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
