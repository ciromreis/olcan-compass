"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingUp, Zap, Clock, MapPin } from "lucide-react";
import { useScenarios } from "@/hooks/economics/use-scenarios";
import { useOpportunityCost } from "@/hooks/economics/use-opportunity-cost";

export default function ScenarioOptimizerPage() {
  const { scenarios, isSimulating, runSimulation } = useScenarios();
  const { opportunityCost, dailyCost, annualGap, isCalculating, calculateCost } = useOpportunityCost();

  const [salary, setSalary] = useState("5000");
  const hasResults = opportunityCost !== null || scenarios.length > 0;

  const handleSimulate = async () => {
    await Promise.all([
      runSimulation({ baseSalary: salary }),
      calculateCost({ currentSalary: salary }),
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="font-heading text-h2 text-text-primary">Otimizador de Cenários</h1>
        <p className="text-body text-text-secondary">
          Calcule o custo real de cada dia de inação e compare trajetórias de crescimento internacional.
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
                min={500}
                step={500}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-body"
              />
            </div>
            <p className="text-caption text-text-muted">
              O simulador projeta seu salário alvo com base em dados empíricos de profissionais
              brasileiros em destinos internacionais (Canadá, Portugal, Alemanha).
            </p>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating || isCalculating}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSimulating || isCalculating ? "Calculando..." : "Gerar Projeções"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Results Panel */}
        <section className="space-y-4">
          {!hasResults && (
            <div className="card-surface p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
              <Zap className="w-8 h-8 text-text-muted" />
              <p className="text-body-sm text-text-muted">
                Insira seu salário e clique em "Gerar Projeções" para ver o impacto real.
              </p>
            </div>
          )}

          {/* Opportunity Cost */}
          {opportunityCost !== null && (
            <div className="card-surface p-5 border-l-4 border-red-400 bg-red-50/30">
              <p className="text-caption text-text-muted mb-1 font-semibold uppercase tracking-wide">
                Custo de Oportunidade — 5 anos
              </p>
              <p className="font-heading text-h2 text-red-600 mb-2">
                R$ {opportunityCost.toLocaleString("pt-BR")}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-red-100">
                <div>
                  <p className="text-caption text-text-muted">Por dia de atraso</p>
                  <p className="text-body font-bold text-red-500">
                    R$ {(dailyCost ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-muted">Perda anual</p>
                  <p className="text-body font-bold text-red-500">
                    R$ {(annualGap ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Pareto Scenario Comparison */}
      {scenarios.length > 0 && (
        <section className="card-surface p-6 space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            <h2 className="font-heading text-h4">Fronteira Pareto — Trajetórias de Crescimento</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 space-y-3 transition-all ${
                  s.id === "base"
                    ? "border-brand-300 bg-brand-50/50 shadow-sm"
                    : "border-cream-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-caption font-bold uppercase tracking-wide ${
                    s.id === "base" ? "text-brand-600" : "text-text-muted"
                  }`}>
                    {s.name}
                  </span>
                  {s.id === "base" && (
                    <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-caption text-text-muted">Salário mensal alvo</p>
                  <p className="font-heading text-h3 text-text-primary">
                    R$ {s.projectedValue.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-100">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-text-muted shrink-0" />
                    <div>
                      <p className="text-[10px] text-text-muted">Ganho anual</p>
                      <p className="text-caption font-semibold text-brand-600">
                        +R$ {s.annualValue.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-text-muted shrink-0" />
                    <div>
                      <p className="text-[10px] text-text-muted">Horizonte</p>
                      <p className="text-caption font-semibold text-text-primary">{s.yearsToTarget} anos</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-caption text-text-muted">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{s.market}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-caption text-text-muted mt-2">
            Projeções baseadas em dados empíricos de profissionais brasileiros relocados. Valores em BRL equivalente ao câmbio atual.
          </p>
        </section>
      )}
    </div>
  );
}
