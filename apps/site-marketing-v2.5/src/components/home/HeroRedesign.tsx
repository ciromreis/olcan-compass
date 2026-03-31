"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import GlobeSubcomponent from './GlobeSubcomponent';

// --- Puppet Components (SVG representations based on generated theme) ---

const CartographerPuppet = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-puppet">
    <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
      {/* Body/Coat */}
      <path d="M60 260 L60 120 L140 120 L140 260 Z" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      <path d="M60 120 Q100 100 140 120" fill="none" stroke="#0D0C0A" strokeWidth="2" />
      {/* Head */}
      <circle cx="100" cy="80" r="30" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      <path d="M85 75 Q100 65 115 75" fill="none" stroke="#0D0C0A" strokeWidth="1.5" /> {/* Eyes */}
      {/* Map */}
      <rect x="70" y="140" width="60" height="40" fill="#FBFAF7" stroke="#E8421A" strokeWidth="1.5" transform="rotate(-5 100 160)" />
      <path d="M75 150 L125 170 M75 170 L125 150" stroke="#E8421A" strokeWidth="0.5" transform="rotate(-5 100 160)" />
      {/* Badge */}
      <circle cx="100" cy="115" r="8" fill="#E8421A" />
      <path d="M100 110 L100 120 M95 115 L105 115" stroke="white" strokeWidth="1" />
    </motion.g>
  </svg>
);

const BridgePuppet = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-puppet">
    <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
      {/* Shirt/Tie */}
      <path d="M70 260 L70 120 L130 120 L130 260 Z" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      <path d="M100 120 L100 260" stroke="#0D0C0A" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M90 120 L100 150 L110 120 Z" fill="#E8421A" />
      {/* Head (Split Color) */}
      <path d="M100 50 A30 30 0 0 0 100 110 Z" fill="#0D0C0A" />
      <path d="M100 110 A30 30 0 0 0 100 50 Z" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      {/* Bridge detail on arm */}
      <path d="M70 150 Q100 130 130 150" fill="none" stroke="#E8421A" strokeWidth="2" strokeOpacity="0.5" />
    </motion.g>
  </svg>
);

const NomadPuppet = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-puppet">
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
      {/* Hoodie/Backpack */}
      <path d="M65 260 L65 140 Q100 110 135 140 L135 260 Z" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      <rect x="75" y="130" width="50" height="60" rx="10" fill="none" stroke="#E8421A" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Head */}
      <circle cx="100" cy="90" r="30" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      <rect x="90" y="85" width="20" height="2" fill="#0D0C0A" /> {/* Glasses vibe */}
      {/* Laptop */}
      <rect x="110" y="180" width="40" height="30" rx="2" fill="#0D0C0A" transform="rotate(15 130 195)" />
      <circle cx="130" cy="195" r="3" fill="#E8421A" />
    </motion.g>
  </svg>
);

const EscapeePuppet = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-puppet">
    <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3 }}>
      {/* Academic Gown / Broken Frame */}
      <path d="M60 260 L60 120 L140 120 L140 260 Z" fill="#0D0C0A" />
      <path d="M80 120 L100 160 L120 120" fill="#F7F4EF" />
      {/* Head */}
      <circle cx="100" cy="80" r="30" fill="#F7F4EF" stroke="#0D0C0A" strokeWidth="2" />
      {/* Briefcase */}
      <rect x="110" y="210" width="50" height="35" fill="#E8421A" />
      <path d="M125 210 L125 200 L145 200 L145 210" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Broken Frame effect */}
      <path d="M40 80 L60 100 M160 80 L140 100" stroke="#E8421A" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </svg>
);

export default function HeroRedesign() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-cream pt-20">
      {/* Background Video Simulation / Ambient Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,66,26,0.03),transparent_70%)]" />
        <div className="absolute inset-0 noise opacity-40" />
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-flame/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="container-site relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-ink/10 bg-white/50 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-flame animate-pulse" />
              <span className="label-xs text-ink-2">Metamodern Career Intelligence</span>
            </div>
            
            <h1 className="font-display text-display-xl text-ink mb-8">
              Sua carreira não é uma linha. <br />
              <span className="italic text-flame">É uma evolução.</span>
            </h1>

            <p className="font-sans text-xl text-ink-2 leading-relaxed mb-10 max-w-lg">
              Deixe o "slop" algorítmico para trás. Olcan Compass mapeia seu arquétipo profissional para destravar rotas globais reais.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-flame text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-flame-2 transition-all flex items-center gap-3 shadow-flame hover:scale-[1.02] active:scale-[0.98]">
                Começar Diagnóstico
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="bg-white text-ink border border-ink/10 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-bone transition-all flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center group-hover:bg-flame group-hover:border-flame group-hover:text-white transition-all">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                Ver Manifesto
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-cream bg-linen flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink-3 font-medium">
                <span className="text-ink font-bold">+2.400</span> profissionais em evolução
              </p>
            </div>
          </motion.div>
        </div>

        {/* Visual Content: Globe + Puppets */}
        <div className="relative">
          <div className="relative z-10">
            <GlobeSubcomponent />
          </div>

          {/* Floating Puppets around the Globe */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* The Cartographer */}
            <motion.div 
              initial={{ opacity: 0, x: -50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute top-[-10%] left-[-5%] w-32 md:w-44"
            >
              <CartographerPuppet />
              <div className="mt-2 text-center">
                <span className="label-xs bg-white/80 px-2 py-0.5 rounded border border-ink/5">Cartographer</span>
              </div>
            </motion.div>

            {/* The Bridge */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: -50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="absolute top-[10%] right-[-5%] w-32 md:w-44"
            >
              <BridgePuppet />
              <div className="mt-2 text-center">
                <span className="label-xs bg-white/80 px-2 py-0.5 rounded border border-ink/5">The Bridge</span>
              </div>
            </motion.div>

            {/* The Nomad */}
            <motion.div 
              initial={{ opacity: 0, x: -50, y: -50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="absolute bottom-[-5%] left-[5%] w-32 md:w-44"
            >
              <NomadPuppet />
              <div className="mt-2 text-center">
                <span className="label-xs bg-white/80 px-2 py-0.5 rounded border border-ink/5">The Nomad</span>
              </div>
            </motion.div>

            {/* The Escapee */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="absolute bottom-[20%] right-[-10%] w-32 md:w-44"
            >
              <EscapeePuppet />
              <div className="mt-2 text-center">
                <span className="label-xs bg-white/80 px-2 py-0.5 rounded border border-ink/5">The Escapee</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Diagonal Cut Effect */}
      <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-slate overflow-hidden transform-gpu" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}>
        <div className="absolute top-0 left-0 w-full h-px bg-white/10" />
      </div>
    </section>
  );
}
