"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, TrendingUp, Users, DollarSign, Wallet, Brain, 
  Target, Globe, Sparkles, Activity, PieChart, ShieldCheck, Store
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

// Mock Data for the Economics Intelligence Dashboard
const OVERVIEW_METRICS = [
  { title: "Total Escrow TVL", value: "$4.2M", change: "+12.5%", icon: Wallet },
  { title: "Avg. Opportunity Cost Saved", value: "$180k", change: "+5.2%", icon: TrendingUp },
  { title: "Active Aura Scenarios", value: "2,450", change: "+18%", icon: Brain },
  { title: "Marketplace Match Rate", value: "94%", change: "+2.1%", icon: Target },
];

const CREDENTIALS_DATA = [
  { archetype: "The Scientist", volume: 450, avgEscrow: "$15,000" },
  { archetype: "The Strategist", volume: 380, avgEscrow: "$12,500" },
  { archetype: "The Diplomat", volume: 620, avgEscrow: "$8,000" },
  { archetype: "The Pioneer", volume: 290, avgEscrow: "$25,000" },
];

export default function EconomicsIntelligencePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            Economics Intelligence
            <span className="px-3 py-1 bg-nanobanana-500/10 text-nanobanana-400 border border-nanobanana-500/30 rounded-full text-xs font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(255,235,59,0.15)]">
              Live System
            </span>
          </h2>
          <p className="text-white/50 mt-2 font-mono text-sm">
            Core economic flows, Temporal Matching, and Opportunity Cost simulations (Aura).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-nanobanana-500 hover:bg-nanobanana-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-[0_0_20px_rgba(255,235,59,0.25)] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Alpha Report
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 bg-slate-900 border border-white/5 p-1 rounded-xl overflow-x-auto">
          {["overview", "credentials", "temporal", "opportunity", "marketplace", "scenarios"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab 
                  ? "bg-nanobanana-500/10 text-nanobanana-400" 
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
          {/* Top KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {OVERVIEW_METRICS.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-white/5 hover:border-nanobanana-500/30 transition-colors group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-nanobanana-500 group-hover:scale-110 transition-transform" />
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <p className="text-xs text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {metric.change} from last month
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart Area */}
            <Card className="col-span-4 bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-nanobanana-500" />
                  Temporal Match Velocity
                </CardTitle>
                <CardDescription className="text-white/50">
                  Speed of pairing clients with relevant mobility products across borders.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 pl-2 flex items-center justify-center min-h-[300px]">
                {/* Visual Placeholder for Nano Banana aesthetics */}
                <div className="relative w-full h-48 flex flex-col items-center justify-center border border-dashed border-nanobanana-500/20 bg-nanobanana-500/5 rounded-xl">
                  <LineChart className="w-12 h-12 text-nanobanana-500/50 mb-4" />
                  <span className="text-nanobanana-400/80 font-mono text-sm">[ Temporal Velocity Chart Canvas ]</span>
                  <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-nanobanana-500/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </Card>

            {/* Credentials Volume */}
            <Card className="col-span-3 bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-nanobanana-500" />
                  Aura Target Segments
                </CardTitle>
                <CardDescription className="text-white/50">
                  Total Active Users per Archetype
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-6">
                  {CREDENTIALS_DATA.map((item, i) => (
                    <div key={i} className="flex items-center group">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-4 group-hover:bg-nanobanana-500/20 transition-colors">
                        <Users className="w-5 h-5 text-nanobanana-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{item.archetype}</p>
                        <p className="text-xs text-white/50 font-mono">
                          {item.volume} cases
                        </p>
                      </div>
                      <div className="font-mono text-nanobanana-400">
                        {item.avgEscrow}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="space-y-4">
            <Card className="col-span-4 bg-slate-900/50 border-white/5 h-[500px] flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-nanobanana-500/5 group-hover:bg-nanobanana-500/10 transition-colors duration-700" />
               <div className="absolute w-[800px] h-[800px] bg-nanobanana-500/10 rounded-full blur-[100px] -top-1/2 -right-1/4 animate-pulse-subtle pointer-events-none" />
               <div className="text-center relative z-10">
                  <Brain className="w-16 h-16 text-nanobanana-500 mx-auto mb-6 opacity-80 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white mb-2">Scenario Optimizer Matrix</h3>
                  <p className="text-white/50 font-mono">Nano-banana aesthetics rendering active node parameters...</p>
                  <button className="mt-8 px-6 py-2 border border-nanobanana-500 text-nanobanana-400 font-mono text-sm hover:bg-nanobanana-500 hover:text-slate-950 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(255,235,59,0.2)]">
                    Initialize Simulation
                  </button>
               </div>
            </Card>
          </div>
        )}

        {activeTab === "credentials" && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <Card key={idx} className="bg-slate-900/50 border-white/5 hover:border-nanobanana-500/50 transition-all relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-nanobanana-500/10 rounded-bl-full blur-[30px] group-hover:bg-nanobanana-500/20 transition-all" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-nanobanana-500" />
                    Tier {idx} Analysis
                  </CardTitle>
                </CardHeader>
                <div className="px-6 pb-6 relative z-10">
                  <div className="text-3xl font-display text-white mb-2">{(idx * 1.5).toFixed(1)}x</div>
                  <p className="text-nanobanana-400 font-mono text-sm mb-4">Escrow Verification Multiplier</p>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-nanobanana-500 h-1.5 rounded-full" style={{ width: `${100 - (idx * 15)}%` }} />
                  </div>
                  <p className="text-xs text-white/40text-right">{100 - (idx * 15)}% Processing Rate</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "temporal" && (
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Temporal Engine Pipeline</CardTitle>
                <CardDescription className="text-white/50">Real-time matching velocity across all active Olcan profiles</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 border border-nanobanana-500/20 rounded-xl bg-slate-950/50 shadow-[0_0_30px_rgba(255,235,59,0.05)] inset-0">
                  <div className="text-center">
                    <p className="text-white/50 text-sm mb-1">Time-to-Match</p>
                    <p className="text-4xl font-mono text-nanobanana-400 drop-shadow-[0_0_8px_rgba(255,235,59,0.5)]">14.2d</p>
                  </div>
                  <Activity className="w-8 h-8 text-white/20 animate-pulse" />
                  <div className="text-center">
                    <p className="text-white/50 text-sm mb-1">Success Rate</p>
                    <p className="text-4xl font-mono text-nanobanana-400 drop-shadow-[0_0_8px_rgba(255,235,59,0.5)]">92.8%</p>
                  </div>
                  <Activity className="w-8 h-8 text-white/20 animate-pulse" />
                  <div className="text-center">
                    <p className="text-white/50 text-sm mb-1">Est. Savings</p>
                    <p className="text-4xl font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">+$2.1M</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "opportunity" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-slate-900/50 border-white/5">
               <CardHeader>
                 <CardTitle className="text-white flex gap-2"><DollarSign className="text-nanobanana-500" /> Cost Savings</CardTitle>
               </CardHeader>
               <div className="px-6 pb-6 flex items-center justify-center p-12">
                 <div className="w-48 h-48 rounded-full border-[8px] border-slate-800 border-t-nanobanana-500 border-l-nanobanana-400 animate-[spin_10s_linear_infinite] flex items-center justify-center shadow-[0_0_40px_rgba(255,235,59,0.15)]">
                   <div className="w-32 h-32 rounded-full bg-slate-950 flex flex-col items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                      <span className="text-white text-3xl font-bold font-display">64%</span>
                      <span className="text-nanobanana-500 font-mono text-xs">Retained</span>
                   </div>
                 </div>
               </div>
             </Card>
             <Card className="bg-nanobanana-500/5 border-nanobanana-500/30 shadow-[0_0_20px_rgba(255,235,59,0.1)] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-nanobanana-500/20 blur-[40px]" />
               <CardHeader>
                 <CardTitle className="text-nanobanana-400">Opportunity Alpha</CardTitle>
                 <CardDescription className="text-white/60">Estimated financial delta from optimized routes</CardDescription>
               </CardHeader>
               <div className="px-6 pb-6">
                 <div className="space-y-4">
                    {[
                      { label: "Tax Liability Reduction", val: "$45,000" },
                      { label: "Friction Cost Avoided", val: "$12,400" },
                      { label: "Premium Route Uplift", val: "+$85,000" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-white/70">{row.label}</span>
                        <span className="font-mono text-nanobanana-400">{row.val}</span>
                      </div>
                    ))}
                 </div>
               </div>
             </Card>
          </div>
        )}

        {activeTab === "marketplace" && (
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-nanobanana-500" /> Active Service Orders
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
               <div className="w-full relative h-[400px] bg-slate-950 rounded-xl border border-nanobanana-500/20 flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-nanobanana-500/10 to-transparent" />
                 <Globe className="w-24 h-24 text-nanobanana-500/30 animate-pulse mb-6" />
                 <h2 className="text-3xl font-display text-white mb-2 tracking-tight">Marketplace Topology</h2>
                 <p className="text-nanobanana-400/80 font-mono text-sm max-w-sm text-center border border-nanobanana-500/30 p-4 rounded bg-nanobanana-500/5 backdrop-blur-md">
                   Routing algorithms currently active.<br/> Connecting 14 Providers to 128 End-users.
                 </p>
               </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
