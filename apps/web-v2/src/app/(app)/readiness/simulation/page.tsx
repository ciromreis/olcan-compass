"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Wallet } from "lucide-react";
import { Input, PageHeader, Progress, ProgressRing } from "@/components/ui";

export default function SimulationPage() {
  const [saving, setSaving] = useState("4000");
  const [months, setMonths] = useState("6");
  const [extraIncome, setExtraIncome] = useState("0");

  const projected = Number(saving) * Number(months) + Number(extraIncome);
  const target = 36000;
  const coverage = Math.min(100, Math.round((projected / target) * 100));
  const gap = Math.max(0, target - projected);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title="Simulação de Cenários" subtitle="Ajuste variáveis e veja o impacto na prontidão" />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-brand-500" /> Variáveis</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-1.5">Economia mensal (BRL)</label>
              <input type="range" min="500" max="10000" step="500" value={saving} onChange={(e) => setSaving(e.target.value)} className="w-full accent-brand-500" />
              <div className="flex justify-between text-caption text-text-muted mt-1"><span>R$ 500</span><span className="font-bold text-text-primary">R$ {Number(saving).toLocaleString("pt-BR")}</span><span>R$ 10.000</span></div>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-1.5">Meses até embarque</label>
              <input type="range" min="1" max="24" step="1" value={months} onChange={(e) => setMonths(e.target.value)} className="w-full accent-brand-500" />
              <div className="flex justify-between text-caption text-text-muted mt-1"><span>1</span><span className="font-bold text-text-primary">{months} meses</span><span>24</span></div>
            </div>
            <div>
              <Input label="Renda extra (BRL — freelance, venda de bens, etc.)" type="number" value={extraIncome} onChange={(e) => setExtraIncome(e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Projeção</h3>
          <div className="flex justify-center mb-6">
            <ProgressRing value={coverage} size={140} strokeWidth={10} variant="auto" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4">
              <p className="text-caption text-text-muted mb-1">Acumulado Projetado</p>
              <p className="font-heading text-h2 text-brand-500">R$ {projected.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4">
              <p className="text-caption text-text-muted mb-1">Meta (6 meses no destino)</p>
              <p className="font-heading text-h2 text-text-primary">R$ {target.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4">
              <p className="text-caption text-text-muted mb-1">Cobertura</p>
              <p className={`font-heading text-h2 ${coverage >= 100 ? "text-brand-500" : "text-clay-500"}`}>{coverage}%</p>
            </div>
          </div>
          <Progress value={coverage} size="md" showLabel label="Cobertura da meta" variant={coverage >= 100 ? "moss" : "clay"} />
          <p className="text-body-sm text-text-secondary mt-3">
            {coverage >= 100 ? "Excelente! Sua projeção cobre a meta de reserva financeira." : `Faltam R$ ${gap.toLocaleString("pt-BR")} para atingir a meta. Considere aumentar a economia mensal ou estender o prazo.`}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4">
              <div className="flex items-center gap-2 mb-1"><Wallet className="w-4 h-4 text-brand-500" /><span className="text-caption text-text-muted">Meta alvo</span></div>
              <p className="font-heading text-h4 text-text-primary">R$ {target.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-brand-500" /><span className="text-caption text-text-muted">Folga / déficit</span></div>
              <p className={`font-heading text-h4 ${projected >= target ? "text-brand-500" : "text-clay-500"}`}>R$ {Math.abs(projected - target).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
