"use client";

/**
 * Aura Hero - site-marketing-v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Compass, Orbit, Star, Fingerprint, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuraHero() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[100vh] bg-bone" />;

  return (
    <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 overflow-hidden bg-bone">
      {/* Metamodern Grain Background */}
      <div className="absolute inset-0 bg-hero-grain opacity-5 pointer-events-none z-0" />
      
      {/* Subtle Liquid Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] bg-gold-400/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-ink-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-12 max-w-2xl"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-ink-500/5 border border-ink-500/10">
              <Orbit className="w-4 h-4 text-gold-600 animate-spin-slow" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Arquiteto de Prontidão Global</span>
            </div>
            
            <h1 className="font-display text-7xl sm:text-8xl lg:text-9xl text-ink-500 leading-[0.85] tracking-tighter">
              Sua Aura <br />
              <span className="relative inline-block mt-4 italic font-light text-gold-600">
                sem fronteiras.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-ink-300 leading-relaxed font-medium max-w-xl">
              Não cuidamos de currículos. Criamos <span className="text-ink-500 font-bold italic">identidades globais</span> irrevogáveis através de diagnósticos de precisão cirúrgica.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link 
                href="/diagnostico"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-ink-500 text-white font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-gold-500 transition-all group"
              >
                Injetar Aura
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <Link 
                href="/manifesto"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white/40 border border-white/80 backdrop-blur-xl text-ink-500 font-bold flex items-center justify-center gap-3 hover:bg-white/60 transition-all group"
              >
                <Play className="w-5 h-5 fill-ink-500/10 group-hover:scale-110 transition-transform" />
                Explorar Rota
              </Link>
            </div>

            <div className="pt-12 border-t border-ink-500/5 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-bone bg-ink-200 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-400 to-ink-600 opacity-20" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-ink-500">Auditado por Processamento de Rede</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-ink-300 mt-1">Status: Conectado à Matriz Global</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Liquid Glass Passport */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative hidden lg:block h-[600px] perspective-1000"
          >
            {/* The Aura Card */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[580px] p-12 rounded-[3.5rem] bg-white/40 backdrop-blur-[40px] border border-white/80 shadow-[0_100px_100px_-50px_rgba(20,20,30,0.15)] flex flex-col z-20"
              animate={{ 
                y: ["-52%", "-48%", "-52%"], 
                rotateZ: [-1, 1, -1] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-16 relative">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-ink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Fingerprint className="w-8 h-8 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-300 mb-1">PROTOCOLO ATIVO</div>
                    <div className="text-sm font-bold text-ink-500 uppercase tracking-[0.2em]">Olcan Global Passport</div>
                  </div>
                </div>
                <Zap className="w-6 h-6 text-gold-500 fill-gold-500 opacity-20" />
              </div>

              {/* Archetype Data */}
              <div className="space-y-10 flex-1">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-300">ARQUÉTIPO</div>
                  <div className="text-5xl font-display text-ink-500 tracking-tight italic">Soberania</div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-ink-500 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/20 rounded-full blur-3xl" />
                  <div className="relative z-10 flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-400">Densidade de Prontidão</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                    <motion.div 
                      className="h-full bg-gold-500"
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Status de Visto</div>
                      <div className="text-[11px] font-bold">D8 Digital Nomad</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Jurisdição</div>
                      <div className="text-[11px] font-bold">Portugal 🇵🇹</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="mt-auto pt-10 border-t border-ink-500/5 flex items-center justify-between opacity-40">
                <div className="flex gap-1">
                  {[4, 8, 2, 6, 2, 8, 4].map((h, i) => (
                    <div key={i} className="bg-ink-500 w-0.5" style={{ height: `${h * 3}px` }} />
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1">IDENTITY HASH</div>
                  <div className="text-[9px] font-mono font-bold">AURA-X-992-MMXD-2026</div>
                </div>
              </div>
            </motion.div>

            {/* Background Accent Badges */}
            <div className="absolute top-[10%] left-[-5%] w-48 h-48 bg-gold-500/10 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
