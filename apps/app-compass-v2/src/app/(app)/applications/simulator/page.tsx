"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingUp } from "lucide-react";
import { useScenarios } from "@/hooks/economics/use-scenarios";
import { useOpportunityCost } from "@/hooks/economics/use-opportunity-cost";

export default function ScenarioOptimizerPage() {
  const { scenarios, isSimulating, runSimulation } = useScenarios();
  const { opportunityCost, isCalculating, calculateCost } = useOpportunityCost();
  
  const [salary, setSalary] = useState("5000");

  const handleSimulate = async () => {
    await Promise.all([
      runSimulation({ baseSalary: salary }),
      calculateCost({ currentSalary: salary })
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="font-heading text-h2 text-text-primary">Otimizador de Cenários</h1>
        <p className="text-body text-text-secondary">
          Simule o impacto financeiro e o custo de oportunidade de longo prazo nas rotas da Aura.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <section className="card-surface p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-brand-500" />
            <h2 className="font-heading text-h4">Parâmetros Atuais</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="salary" className="block text-body-sm font-medium text-text-secondary mb-1">
                Salário Atual (BRL/mês)
              </label>
              <input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-body"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating || isCalculating}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSimulating ? "Simulando..." : "Gerar Projeções"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Results Panel */}
        <section className="space-y-6">
          {/* Opportunity Cost */}
          {opportunityCost !== null && (
            <div className="card-surface p-6 bg-cream-50/50">
              <p className="text-body-sm text-text-muted mb-1 font-medium">Custo de Oportunidade (5 anos)</p>
              <p className="font-heading text-h2 text-red-600">R$ {opportunityCost.toLocaleString('pt-BR')}</p>
            </div>
          )}

          {/* Scenarios */}
          {scenarios.length > 0 && (
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h2 className="font-heading text-h4">Cenários de Crescimento</h2>
              </div>
              
              <div className="space-y-3">
                {scenarios.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-cream-200 bg-white">
                    <span className="text-body-sm font-medium text-text-primary">{s.name}</span>
                    <span className="font-heading text-brand-600 text-body font-semibold">
                      Projeção: R$ {s.projectedValue.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
