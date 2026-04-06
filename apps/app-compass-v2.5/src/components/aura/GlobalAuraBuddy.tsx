"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Activity, MessageCircle, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuraStore } from "@/stores/auraStore";

export default function GlobalAuraBuddy() {
  const { aura } = useAuraStore();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // If the user hasn't generated an Aura, don't show the buddy
  if (!aura) return null;

  // Derive dynamic color from archetype (defaulting to teal/emerald Liquid-Glass styling)
  let glowColor = "shadow-brand-500/20";
  let coreGradient = "from-brand-300 to-brand-500";
  let ringGradient = "from-brand-400/40 to-brand-600/40";

  switch (String(aura.archetype).toLowerCase()) {
    case "creator":
      coreGradient = "from-indigo-400 to-purple-500";
      glowColor = "shadow-indigo-500/30";
      ringGradient = "from-indigo-400/40 to-purple-600/40";
      break;
    case "sage":
      coreGradient = "from-emerald-400 to-teal-500";
      glowColor = "shadow-emerald-500/30";
      ringGradient = "from-emerald-400/40 to-teal-600/40";
      break;
    case "ruler":
      coreGradient = "from-brand-500 to-ink-800";
      glowColor = "shadow-brand-500/30";
      ringGradient = "from-brand-500/40 to-ink-600/40";
      break;
    // other archetypes use default brand-500
  }

  // Generate context-aware hint based on current route
  let hint = "Aqui para guiar a sua jornada hoje.";
  if (pathname.includes("/dashboard")) hint = "Ótimo progresso! Vamos revisar suas metas de mobilidade.";
  if (pathname.includes("/routes")) hint = "Analisando padrões complexos para otimizar sua rota internacional...";
  if (pathname.includes("/forge")) hint = "Pronto para lapidar sua narrativa e validar seus documentos?";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none"
        >
          {/* Expanded Dialogue Box */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mb-4 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-4 w-64 pointer-events-auto liquid-glass relative overflow-hidden"
              >
                {/* Subtle gradient background matched to aura */}
                <div className={`absolute -inset-10 bg-gradient-to-br ${coreGradient} opacity-5 blur-2xl`} />

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-900">
                      Intelecto Aura
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-ink-700 leading-relaxed relative z-10 mb-3 font-medium">
                  {hint}
                </p>

                <div className="flex items-center space-x-3 text-xs bg-white/50 rounded-lg p-2 border border-white/60">
                   <div className="flex flex-col">
                     <span className="font-bold text-ink-900">Nível {aura.level}</span>
                     <span className="text-ink-500">{aura.experiencePoints} XP</span>
                   </div>
                   <div className="h-full w-px bg-white" />
                   <div className="flex items-center space-x-1 text-emerald-600">
                     <Activity className="w-3 h-3" />
                     <span className="font-semibold capitalize">{aura.archetype || "Iniciado"}</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Creature Sphere / Floating Core */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pointer-events-auto relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ${glowColor}`}
          >
            {/* Outer Rotating Glass Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 rounded-full border border-t-[1.5px] border-l-[1px] bg-gradient-to-br ${ringGradient} backdrop-blur-md`}
            />

            {/* Pulsing Core */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute w-10 h-10 rounded-full bg-gradient-to-tr ${coreGradient} blur-[2px] opacity-90 mix-blend-screen shadow-inner`}
            />
            
            {/* Creature Avatar */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center p-2 z-10"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image 
                src={String(aura.archetype).toLowerCase().includes('scholar') || String(aura.archetype).toLowerCase().includes('sage') ? "/images/creature-scholar.png" : "/images/creature-compass.png"}
                alt="Aura Companion"
                width={48}
                height={48}
                className="object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Notifications Badge */}
            {!isExpanded && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                1
              </span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
