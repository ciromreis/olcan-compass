"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, FileText, Mic, ShoppingBag } from "lucide-react";

const features = [
  { icon: Brain, label: "Diagnóstico Estratégico", desc: "Perfil de mobilidade" },
  { icon: FileText, label: "Narrative Forge", desc: "Essays com IA" },
  { icon: Mic, label: "Interview Coach", desc: "Mock com voz" },
  { icon: ShoppingBag, label: "Marketplace", desc: "Mentores verificados" },
];

export function CompassSpotlight() {
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 70% 50%, #002060 0%, #001338 70%)" }}
    >
      {/* Orbs */}
      <div
        className="absolute rounded-full blur-[100px] w-64 h-64 right-0 top-0 opacity-20"
        style={{ background: "rgba(229, 231, 235, 0.2)" }}
      />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6">
              <Sparkles size={13} className="text-cyan-300" />
              <span className="text-cyan-300 text-xs font-body font-semibold">Plataforma Flagship</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight mb-6">
              Compass by Olcan —
              <br />
              <span className="text-cyan-300">seu sistema operacional</span>
              <br />
              de mobilidade.
            </h2>

            <p className="text-white/65 font-body text-lg leading-relaxed mb-8 max-w-lg">
              Do diagnóstico de arquétipo à aprovação — o Compass é a plataforma de IA que orquestra toda a sua jornada internacional em um único lugar.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-white font-display font-semibold text-xs">{f.label}</p>
                      <p className="text-white/40 text-xs font-body">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="https://compass.olcan.com.br" className="btn-primary justify-center">
                Acessar o Compass <ArrowRight size={15} />
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-500 justify-center">
                Saber mais
              </Link>
            </div>
          </motion.div>

          {/* Right: Mock Screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-1 backdrop-blur-sm shadow-2xl">
              {/* Mock UI */}
              <div className="rounded-xl bg-[#020617] p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/60 text-xs font-mono">compass.olcan.com.br</span>
                </div>

                {/* Evolution card */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <p className="text-white font-display font-bold text-xs">Cartógrafa de Bolsas</p>
                      <p className="text-white/40 text-xs font-mono">Estágio Champion — Nômade Armado</p>
                    </div>
                    <div className="ml-auto text-cyan-300 font-display font-extrabold text-sm">Lv. 2</div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: "67%" }} />
                  </div>
                  <p className="text-white/30 text-xs font-body mt-1">67% → Próxima evolução: concluir Motivation Letter</p>
                </div>

                {/* Nudge card */}
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-cyan-300 text-xs font-display font-bold mb-1">⚡ Oráculo ativado</p>
                  <p className="text-white/60 text-xs font-body">
                    Sua bandwidth semanal é 4h. Injecting Micro-Sprint: &ldquo;Escreve 3 bullet points do seu SOP hoje.&rdquo;
                  </p>
                </div>

                {/* Score bar */}
                <div className="flex gap-2">
                  {[["Competência", "82%"], ["Narrativa", "74%"], ["Idioma", "61%"]].map(([label, val]) => (
                    <div key={label} className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-white font-display font-extrabold text-sm">{val}</p>
                      <p className="text-white/30 text-xs font-body">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl px-4 py-2 shadow-2xl shadow-cyan-500/50">
              <p className="text-white font-display font-extrabold text-sm">Readiness Score</p>
              <p className="text-white/90 text-xs font-body">78 / 100</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
