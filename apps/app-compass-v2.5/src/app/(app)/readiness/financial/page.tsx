"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Target, Save, AlertCircle } from "lucide-react";
import { Progress, useToast } from "@/components/ui";

export default function FinancialReadinessPage() {
  const { toast } = useToast();
  const [budget, setBudget] = useState("30000");
  const [dependents, setDependents] = useState("0");
  const [livingCost, setLivingCost] = useState("15000");

  const runwayMonths = Math.floor(parseInt(budget) / Math.max(1, (parseInt(livingCost) / 12)));
  const gap = parseInt(livingCost) - parseInt(budget);
  const isHealthy = runwayMonths >= 12 && gap <= 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Projeção atualizada", description: "Dados financeiros salvos com sucesso.", variant: "success" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/readiness" className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="font-heading text-h3 text-text-primary">Financeiro e Logística</h1>
          <p className="text-body text-text-secondary">Overview do seu runway e orçamento de alocação</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-moss-500" />
            <h2 className="font-heading text-h4">Parâmetros</h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Orçamento Total / Savings (USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Custo de Vida Anual Estimado (USD)</label>
              <input
                type="number"
                value={livingCost}
                onChange={(e) => setLivingCost(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Dependentes (Esposa/Filhos)</label>
              <select
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="0">0 (Apenas eu)</option>
                <option value="1">1 Dependente</option>
                <option value="2">2 Dependentes</option>
                <option value="3">3 ou mais Dependentes</option>
              </select>
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-moss-500 text-white font-medium py-2 rounded-lg hover:bg-moss-600 transition-colors">
              <Save className="w-4 h-4" /> Atualizar Projeção
            </button>
          </form>
        </div>

        {/* Scoring & Logic */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-500" />
              <h2 className="font-heading text-h4">Análise de Viabilidade</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-body-sm text-text-secondary">Runway de Sobrevivência</span>
                <span className={`font-bold ${isHealthy ? 'text-moss-600' : 'text-clay-600'}`}>{runwayMonths} meses</span>
              </div>
              <Progress value={(runwayMonths / 24) * 100} variant={isHealthy ? "moss" : "clay"} size="md" />
              <p className="text-caption text-text-muted mt-1">O ideal é ter pelo menos 12 meses de reservas na moeda local.</p>
            </div>

            <div className="p-4 rounded-xl border border-cream-200 bg-cream-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-sm font-medium">Situação do Funding</span>
                <span className={`px-2 py-0.5 rounded-full text-caption font-bold ${isHealthy ? 'bg-moss-100 text-moss-700' : 'bg-clay-100 text-clay-700'}`}>
                  {isHealthy ? 'Saudável' : 'Requer Atenção'}
                </span>
              </div>
              
              {!isHealthy && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-caption mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>Você tem um GAP financeiro projetado de <strong>${gap.toLocaleString()}</strong> no primeiro ano. Considere aplicar para Graduate Assistantships (RA/TA) ou empréstimos tipo Prodigy Finance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
