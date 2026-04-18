"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BarChart3, Shield, DollarSign, FileText,
  Activity, ScrollText, Building2, Rocket, Globe2,
  ArrowUpRight, Layers, ChevronRight, Sparkles, RefreshCw, Cpu
} from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useApplicationStore } from "@/stores/applications";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { Skeleton, Card, CardHeader, CardTitle } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/lib/format";

const ADMIN_SECTIONS = [
  { href: "/admin/users", icon: Users, label: "Usuários", description: "Contas e permissões" },
  { href: "/admin/organizations", icon: Building2, label: "Organizações", description: "Clientes B2B" },
  { href: "/admin/providers", icon: Shield, label: "Provedores", description: "Verificação" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", description: "Funis e metas" },
  { href: "/admin/economics-intelligence", icon: DollarSign, label: "Economia", description: "Cia e Escrows" },
  { href: "/admin/content", icon: FileText, label: "Conteúdo", description: "CMS e Lexical" },
  { href: "/admin/ai", icon: Cpu, label: "IA & Prompts", description: "Vercel AI SDK" },
  { href: "/admin/observability", icon: Activity, label: "Observabilidade", description: "Sentry & Vitals" },
];

export default function AdminDashboardPage() {
  const hydrated = useHydration();
  const { providers, bookings } = useMarketplaceStore();
  const { documents } = useForgeStore();
  useInterviewStore();
  useApplicationStore();
  useSprintStore();
  useRouteStore();
  const { auditLogs } = useAdminStore();
  const [activeTab, setActiveTab] = useState<"overview" | "modules">("overview");
  const [isSyncing, setIsSyncing] = useState(false);

  const kpis = useMemo(() => {
    if (!hydrated) return [];
    
    const totalRevenue = bookings.reduce((s, b) => s + b.price, 0);
    const _activeProviders = providers.filter((p) => p.verified).length;
    
    return [
      { label: "Receita Capitalizada", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, change: "+14.2%" },
      { label: "Nós de Provedor", value: String(providers.length), icon: Shield, change: "+3" },
      { label: "Contratações Ativas", value: String(bookings.length), icon: Layers, change: "+12%" },
      { label: "Documentos Forge", value: String(documents.length), icon: FileText, change: "+8%" },
    ];
  }, [hydrated, providers, bookings, documents]);

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 pb-20 font-body">
      {/* Liquid Glass God Mode Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-10 text-white backdrop-blur-3xl shadow-glass"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono uppercase tracking-[0.2em] mb-4 border border-white/5">
              <Sparkles className="w-3.5 h-3.5" /> Platinum God Mode
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light leading-tight tracking-tight text-white italic">
              Centro de <span className="text-slate-400 not-italic">Governança</span> Sincronizado
            </h1>
            <p className="text-slate-400 mt-3 text-base font-mono max-w-2xl leading-relaxed">
              Orquestração sistêmica do ecossistema Zenith: Sincronização de dados multitenant e diagnósticos Omega.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-4">
               <button 
                onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
               >
                 <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-white ${isSyncing ? 'animate-spin' : ''}`} />
               </button>
               <Link href="/admin/economics-intelligence" className="px-6 py-3 bg-white text-slate-950 font-medium rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-glass">
                 <DollarSign className="w-4 h-4" /> Inteligência Econômica
               </Link>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
               <span className="text-xs font-mono text-slate-300">System Core Live · 99.99% Uptime</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl w-fit backdrop-blur-md">
          {["overview", "modules"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "overview" | "modules")}
              className={`px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              {tab === "overview" ? "Visão Geral" : "Módulos de Comando"}
            </button>
          ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* KPI Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, i) => (
                <Card key={i} variant="glass" className="group hover:border-white/30 transition-all duration-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                      {kpi.label}
                    </CardTitle>
                    <kpi.icon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                  </CardHeader>
                  <div className="mt-2">
                    <p className="text-3xl font-display font-light text-white leading-none">
                      {kpi.value}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-4">
                      {kpi.change} vs Last Period
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Matrix View */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* System Cluster Health */}
              <div className="lg:col-span-4">
                <Card variant="glass" className="h-full">
                  <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal mb-8">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Ecossistema Zenith
                  </CardTitle>
                  <div className="space-y-4">
                    {[
                      { label: "Marketing Zenith", detail: "olcan.com.br", icon: Globe2 },
                      { label: "Compass Platform", detail: "app.olcan.com.br", icon: Rocket },
                      { label: "Sovereign Admin", detail: "admin.olcan.com.br", icon: Shield },
                      { label: "Vendor Portal", detail: "vendors.olcan.com.br", icon: Building2 },
                    ].map((node, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                          <node.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{node.label}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">{node.detail}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Central Logs / Fluxo */}
              <div className="lg:col-span-8">
                <Card variant="glass" className="h-full">
                  <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal">
                      <ScrollText className="w-5 h-5 text-slate-400" />
                      Fluxo Operacional Live
                    </CardTitle>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                      Pulse Active
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {auditLogs.slice(0, 6).map((log, i) => (
                      <div key={i} className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-crosshair">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{formatDate(log.at)}</span>
                          <span className="text-[10px] font-mono text-slate-400 border border-white/10 px-2 rounded-full">AUDIT</span>
                        </div>
                        <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed tracking-tight group-hover:text-white">
                          {log.summary}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 rounded-2xl bg-white text-slate-950 flex items-center justify-between shadow-glass group cursor-pointer active:scale-95 transition-all">
                    <div>
                      <h4 className="font-display font-medium text-lg">Gerar Manifestação Zenith</h4>
                      <p className="text-slate-600 text-xs font-mono mt-1">Consolidação sintética de todos os logs do ciclo Omega.</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "modules" && (
           <motion.div 
            key="modules"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
           >
             {ADMIN_SECTIONS.map((section, i) => (
               <Link key={i} href={section.href}>
                 <Card variant="glass" className="hover:border-white/30 hover:bg-white/10 transition-all group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        <section.icon className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-white font-medium">{section.label}</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">{section.description}</p>
                 </Card>
               </Link>
             ))}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
