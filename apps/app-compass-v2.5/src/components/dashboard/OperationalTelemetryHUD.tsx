"use client";

import { Info, TrendingUp, Zap, Radiation, Activity } from "lucide-react";
import { type JourneySnapshot } from "@/lib/journey";
import { cn } from "@/lib/utils";

interface OperationalTelemetryHUDProps {
  snapshot: JourneySnapshot;
}

export function OperationalTelemetryHUD({ snapshot }: OperationalTelemetryHUDProps) {
  const { economics, momentum, psychology } = snapshot;

  if (!economics && !momentum && !psychology) return null;

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: economics?.currency || "BRL",
    }).format(val);
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* 1. Custo da Inação (CIa) */}
      <div className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500">
            <Radiation className="h-4 w-4" />
            {"Custo da Inação ($C_{ia}$)"}
          </div>
          <button className="text-slate-300 transition-colors hover:text-slate-400">
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-4xl font-bold tracking-tight text-slate-900">
            {fmtCurrency(economics?.cumulative_cost || 0)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Perda acumulada em {economics?.days_since_start || 0} dias
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-rose-50 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Diário</p>
            <p className="text-sm font-bold text-rose-600">{fmtCurrency(economics?.daily_cost || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mensal</p>
            <p className="text-sm font-bold text-rose-600">{fmtCurrency(economics?.monthly_cost || 0)}</p>
          </div>
        </div>
        
        {/* Visual Decay Indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-rose-500/10 w-full">
           <div 
             className="h-full bg-rose-500 transition-all duration-1000" 
             style={{ width: `${Math.min((economics?.cumulative_cost || 0) / 10000 * 100, 100)}%` }} 
           />
        </div>
      </div>

      {/* 2. Momentum Score */}
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">
            <TrendingUp className="h-4 w-4" />
            Momentum Operacional
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <p className="text-4xl font-bold tracking-tight text-slate-900">
            {momentum?.momentum_score ? (momentum.momentum_score * 100).toFixed(0) : "0"}
          </p>
          <p className="mb-1 text-sm font-semibold text-indigo-600">pts</p>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Inércia rompida. {momentum?.last_activity_days === 0 ? "Atividade hoje." : `Última ação há ${momentum?.last_activity_days}d.`}
        </p>

        <div className="mt-6 flex flex-col gap-2">
           <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
             <span>Progresso de Inércia</span>
             <span>{(momentum?.momentum_score || 0) * 100}%</span>
           </div>
           <div className="h-2 w-full rounded-full bg-slate-100">
             <div 
               className="h-full rounded-full bg-indigo-500 transition-all duration-700"
               style={{ width: `${(momentum?.momentum_score || 0) * 100}%` }}
             />
           </div>
        </div>
      </div>

      {/* 3. OIOS DNA (Archetype) */}
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
            <Activity className="h-4 w-4" />
            DNA OIOS (Arquétipo)
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {psychology?.dominant_archetype || "Indefinido"}
          </p>
          <div className="mt-2 flex items-center gap-2">
             <span className="flex h-5 items-center rounded-full bg-amber-50 px-2 text-[10px] font-bold text-amber-700 uppercase">
                Estágio {psychology?.evolution_stage || 1}
             </span>
             <span className="text-xs font-medium text-slate-400">
                {psychology?.psychological_state === 'active' ? 'Biomecânica Ativa' : 'Em Sincronização'}
             </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
           <div className="flex-1">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
               <span>Energia Cinética</span>
               <span>{psychology?.kinetic_energy_level || 0}%</span>
             </div>
             <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${psychology?.kinetic_energy_level || 0}%` }}
                />
             </div>
           </div>
           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-amber-50 text-amber-600">
              <Zap className={cn("h-6 w-6", psychology?.kinetic_energy_level && psychology.kinetic_energy_level > 70 && "animate-pulse")} />
           </div>
        </div>
      </div>
    </section>
  );
}
