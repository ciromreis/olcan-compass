"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Wallet, Activity, Brain, Target, Globe, Sparkles, ShieldCheck, Store, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { apiClient, AdminSuccessMetricsResponse } from "@/lib/api-client";

export default function EconomicsIntelligencePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<AdminSuccessMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminSuccessMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      console.error("Failed to fetch admin metrics:", err);
      setError("Erro ao carregar métricas do centro soberano.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const kpis = metrics ? [
    { 
      title: "Conversão de Credenciais", 
      value: `${(metrics.credential_conversion_rate.current * 100).toFixed(1)}%`, 
      target: `${(metrics.credential_conversion_rate.target * 100).toFixed(1)}%`,
      status: metrics.credential_conversion_rate.target_met ? "Objetivo Atingido" : "Abaixo da Meta",
      icon: ShieldCheck 
    },
    { 
      title: "Redução de Churn Temporal", 
      value: `${(metrics.temporal_churn_reduction.current * 100).toFixed(1)}%`, 
      target: `${(metrics.temporal_churn_reduction.target * 100).toFixed(1)}%`,
      status: metrics.temporal_churn_reduction.target_met ? "Objetivo Atingido" : "Abaixo da Meta",
      icon: Activity 
    },
    { 
      title: "Valor Médio Marketplace", 
      value: `R$ ${metrics.marketplace_booking_value.current.toFixed(2)}`, 
      target: `+${(metrics.marketplace_booking_value.target * 100).toFixed(0)}%`,
      status: metrics.marketplace_booking_value.target_met ? "Objetivo Atingido" : "Abaixo da Meta",
      icon: Store 
    },
    { 
      title: "Redução de Paralisia", 
      value: `${(metrics.decision_paralysis_reduction.current * 100).toFixed(1)}%`, 
      target: `${(metrics.decision_paralysis_reduction.target * 100).toFixed(1)}%`,
      status: metrics.decision_paralysis_reduction.target_met ? "Objetivo Atingido" : "Abaixo da Meta",
      icon: Brain 
    },
  ] : [];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-950 min-h-screen font-body selection:bg-white/20">
      {/* Header Soberano */}
      <div className="flex items-center justify-between space-y-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-display font-medium tracking-tight text-white flex items-center gap-3">
            Inteligência Econômica
            <span className="px-3 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] shadow-glass backdrop-blur-md">
              Sovereign Node v2.5
            </span>
          </h2>
          <p className="text-slate-400 mt-2 font-mono text-sm max-w-xl">
            Monitoramento em tempo real do ecossistema Olcan: Fluxos de capital, Matching Temporal e Custo de Inação Coletivo.
          </p>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchMetrics}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-white text-slate-950 font-medium px-6 py-2 rounded-lg text-sm transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center gap-2 active:scale-95">
            <Sparkles className="w-4 h-4" />
            Gerar Relatório Zenith
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Navigation Tabs (Liquid Glass Style) */}
        <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl w-fit backdrop-blur-md">
          {["overview", "credentials", "temporal", "marketplace", "scenarios"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-mono text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Top KPI Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                  ))
                ) : (
                  kpis.map((metric, i) => (
                    <Card key={i} variant="glass" className="group hover:border-white/30 transition-all duration-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                          {metric.title}
                        </CardTitle>
                        <metric.icon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      </CardHeader>
                      <div className="mt-2">
                        <div className="text-3xl font-display font-light text-white leading-none">
                          {metric.value}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Meta: {metric.target}</p>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                            metric.status === "Objetivo Atingido" 
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" 
                              : "border-slate-700 text-slate-500"
                          }`}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Ecosystem Velocity & ROI */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card variant="glass" className="col-span-4 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal">
                      <Activity className="w-5 h-5 text-slate-400" />
                      Velocidade do Matching Temporal
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-mono text-xs mt-1">
                      Agregação sistêmica da eficiência de alocação de talentos.
                    </CardDescription>
                  </div>
                  <div className="mt-8 flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-4xl font-display text-white">12.4d</p>
                      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">-2.1d vs Baseline</p>
                    </div>
                    <div className="h-24 w-1/2 relative">
                      {/* Simple SVG Chart instead of heavy libraries for performance */}
                      <svg viewBox="0 0 200 100" className="w-full h-full text-white/20">
                        <path d="M0,80 Q50,20 100,50 T200,30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                        <path d="M0,90 Q50,40 100,70 T200,20" fill="none" stroke="url(#gradient)" strokeWidth="3" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="col-span-3">
                  <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal">
                    <Wallet className="w-5 h-5 text-slate-400" />
                    ROI do Ecossistema
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-mono text-xs mt-1">
                    Retorno sobre capital alocado em Escrows.
                  </CardDescription>
                  <div className="mt-8 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Sobe Alçada</p>
                        <p className="text-2xl text-white font-medium">R$ 1.25M</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">+18.4% ROI</p>
                      </div>
                    </div>
                    {/* Linear progress for Escrow Health */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase text-slate-500">
                        <span>Liquidez do Escrow</span>
                        <span>94%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-white" 
                          initial={{ width: 0 }}
                          animate={{ width: "94%" }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "credentials" && (
            <motion.div 
              key="credentials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card variant="glass" className="min-h-[300px] flex flex-col items-center justify-center border-dashed border-white/10 hover:border-white/20">
                <Globe className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-white font-medium">Distribuição Geográfica</h3>
                <p className="text-slate-500 text-xs font-mono mt-2">Sincronizando Nodes Globais...</p>
              </Card>
              <Card variant="glass" className="min-h-[300px] flex flex-col items-center justify-center border-dashed border-white/10">
                <Target className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-white font-medium">Heatmap de Arquétipos</h3>
                <p className="text-slate-500 text-xs font-mono mt-2">Analisando DNA Profissional...</p>
              </Card>
              <Card variant="glass" className="min-h-[300px] flex flex-col items-center justify-center border-dashed border-white/10">
                <Users className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-white font-medium">Fluxo de Talento</h3>
                <p className="text-slate-500 text-xs font-mono mt-2">Mapeando Rotas Cinéticas...</p>
              </Card>
            </motion.div>
          )}

          {/* Additional tabs follow same Liquid Glass pattern... */}
        </AnimatePresence>
      </div>
    </div>
  );
}
