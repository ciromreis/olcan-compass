"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dna, Info, Target, Compass,
  ArrowRight, Shield, Zap, Brain, Hexagon
} from "lucide-react";
import { useAuraStore } from "@/stores/auraStore";
import { ArchetypeId, getAllArchetypes } from "@/lib/archetypes";
import { calculateRecombination, RecombinationProfile } from "@/lib/recombination";
import { usePresenceSignals } from "@/hooks/usePresenceSignals";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ProceduralAuraFigure } from "@/components/aura/ProceduralAuraFigure";
import { cn } from "@/lib/utils";

/**
 * Atlas de Recombinação OIOS
 * Página que visualiza o DNA dinâmico do usuário baseado em seus sinais de jornada.
 */
export default function AtlasPage() {
  const { aura } = useAuraStore();
  const signals = usePresenceSignals();
  const [profile, setProfile] = useState<RecombinationProfile | null>(null);
  const [selectedArch, setSelectedArch] = useState<ArchetypeId | null>(null);

  useEffect(() => {
    if (aura?.archetype) {
      const recomb = calculateRecombination(aura.archetype, signals);
      setProfile(recomb);
    }
  }, [aura, signals]);

  const allArchetypes = getAllArchetypes();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-bone-50 text-[10px] font-black tracking-[0.22em] uppercase shadow-xl shadow-slate-200">
          <Compass className="w-3.5 h-3.5" />
          Protocolo de Identidade Metamoderna
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-950">
          O Atlas da <span className="text-slate-400">Presença</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
          Sua identidade de mobilidade não é uma categoria estática; é uma oscilação dinâmica. 
          Abaixo, mapeamos sua recombinação de DNA ajustada por performance tática e prontidão sistêmica.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-10 space-y-10 border-slate-100 shadow-2xl" variant="olcan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-950 text-white shadow-lg">
                <Dna className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Snap Shot de Recombinação</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronização em tempo real via Diagnóstico</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-4">
            {profile?.weights.slice(0, 3).map((w, i) => (
              <div key={w.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-3 h-3 rounded-md transition-all duration-slower",
                      i === 0 ? "bg-slate-950 ring-4 ring-slate-100" : i === 1 ? "bg-slate-400" : "bg-slate-200"
                    )} />
                    <span className="font-black text-[11px] uppercase tracking-widest text-slate-900">{w.label}</span>
                    {i === 0 && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-slate-200">Dominante</span>}
                  </div>
                  <span className="font-mono text-xl font-black text-slate-950">{w.weight}%</span>
                </div>
                <div className="h-6 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-1.5 flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${w.weight}%` }}
                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: i * 0.2 }}
                    className={cn(
                      "h-full rounded-lg shadow-sm",
                      i === 0 ? "bg-slate-950 active-gradient" : 
                      i === 1 ? "bg-slate-400" : "bg-slate-200"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 text-sm text-slate-500 flex items-start gap-4 italic font-medium leading-relaxed">
            <div className="p-2 bg-slate-50 rounded-full flex-shrink-0">
               <Info className="w-5 h-5 text-slate-400" />
            </div>
            <p>
              Este mapeamento governa a anatomia da sua Aura e calibra os multiplicadores de 
              **Codificação de Arbitragem** nos seus projetos ativos.
            </p>
          </div>
        </GlassCard>

        <section className="space-y-6">
          <GlassCard className="p-8 space-y-6 border-slate-100" variant="olcan">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-slate-950" />
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tighter">Nexo Estratégico</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                  <Brain className="w-4 h-4" />
                  Estado de Prontidão
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Sua faceta **{profile?.weights[0].label}** exige um aumento no rigor documental no Forge.
                </p>
              </div>
              
              <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Intervenção Sugerida
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  A recombinação atual otimiza o uso da **Forja** para densificação semiótica.
                </p>
                <GlassButton size="sm" className="w-full mt-2 font-black tracking-widest uppercase text-[10px]" variant="primary">
                  Iniciar Forja
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>

      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Hexagon className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Compêndio de Mobilidade</h2>
          </div>
          <div className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            12 Arquétipos de Manifestação Sistêmica
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allArchetypes.map((arch) => (
            <motion.div
              key={arch.id}
              whileHover={{ scale: 1.02, y: -8 }}
              onClick={() => setSelectedArch(selectedArch === arch.id ? null : arch.id)}
              className={cn(
                "cursor-pointer p-7 rounded-[2rem] border transition-all duration-slow group",
                selectedArch === arch.id 
                  ? "bg-slate-950 text-white border-slate-950 shadow-2xl shadow-slate-300" 
                  : "bg-white text-slate-900 border-slate-100 hover:border-slate-300 hover:shadow-xl"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-slow",
                  selectedArch === arch.id ? "bg-white shadow-xl" : "bg-slate-50"
                )}>
                  <ProceduralAuraFigure
                    spec={{
                      seed: arch.id,
                      species: "fox",
                      attachment: "ears",
                      locomotion: "limbs",
                      eyeStyle: "round",
                      bodyScale: 1,
                      detailLevel: selectedArch === arch.id ? 1 : 0.5,
                      metallic: selectedArch === arch.id ? 1 : 0,
                      symmetry: 0.9,
                      primaryHue: 220,
                      secondaryHue: 180,
                      orbitCount: 0,
                      haloIntensity: selectedArch === arch.id ? 0.8 : 0,
                      stage: "mature",
                    }}
                    size={48}
                    active={selectedArch === arch.id}
                  />
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Espécie</div>
                   <div className="text-[11px] font-bold uppercase tracking-widest">{arch.creature}</div>
                </div>
              </div>
              
              <h3 className="text-lg font-black tracking-tighter mb-2 uppercase">{arch.name}</h3>
              <p className={cn(
                "text-xs leading-relaxed font-medium",
                selectedArch === arch.id ? "text-slate-400" : "text-slate-500"
              )}>
                {arch.description}
              </p>

              <AnimatePresence>
                {selectedArch === arch.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Caminho Evolutivo</span>
                        <div className="flex items-center gap-3 text-[11px] font-bold">
                          {arch.evolutionPath.from} <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> {arch.evolutionPath.to}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {arch.abilities.map((ability) => (
                          <span key={ability} className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/5">
                            {ability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
