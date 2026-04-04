"use client";

import { FileText, TrendingUp, Mic, Sparkles, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "CV Builder Profissional",
    description: "Crie currículos impecáveis com templates premium em português. Drag-and-drop, auto-save e exportação PDF/JSON.",
    gradient: "from-brand-500 to-brand-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect x="20" y="20" width="160" height="160" rx="12" fill="currentColor" className="text-brand-50" />
        <rect x="40" y="40" width="60" height="8" rx="4" fill="currentColor" className="text-brand-300" />
        <rect x="40" y="60" width="120" height="4" rx="2" fill="currentColor" className="text-brand-200" />
        <rect x="40" y="70" width="100" height="4" rx="2" fill="currentColor" className="text-brand-200" />
        <rect x="40" y="90" width="120" height="4" rx="2" fill="currentColor" className="text-brand-200" />
        <rect x="40" y="100" width="110" height="4" rx="2" fill="currentColor" className="text-brand-200" />
        <rect x="40" y="110" width="90" height="4" rx="2" fill="currentColor" className="text-brand-200" />
        <circle cx="160" cy="45" r="12" fill="currentColor" className="text-moss-400" />
      </svg>
    )
  },
  {
    icon: TrendingUp,
    title: "Otimizador ATS",
    description: "Análise em tempo real de compatibilidade com vagas. Score detalhado, keywords ausentes e sugestões priorizadas.",
    gradient: "from-moss-500 to-moss-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-moss-100" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="440" strokeDashoffset="110" className="text-moss-500" transform="rotate(-90 100 100)" />
        <text x="100" y="105" textAnchor="middle" className="text-4xl font-bold fill-moss-600">85</text>
        <text x="100" y="125" textAnchor="middle" className="text-xs fill-moss-400">ATS Score</text>
      </svg>
    )
  },
  {
    icon: Mic,
    title: "Entrevistas por Voz",
    description: "Pratique com gravação de áudio. Análise de delivery (tom, ritmo, clareza) e feedback de conteúdo personalizado.",
    gradient: "from-clay-500 to-clay-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="60" fill="currentColor" className="text-clay-100" />
        <rect x="85" y="70" width="30" height="50" rx="15" fill="currentColor" className="text-clay-500" />
        <path d="M 70 110 Q 70 140 100 140 Q 130 140 130 110" fill="none" stroke="currentColor" strokeWidth="4" className="text-clay-500" />
        <line x1="100" y1="140" x2="100" y2="160" stroke="currentColor" strokeWidth="4" className="text-clay-500" />
        <line x1="80" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" className="text-clay-500" />
      </svg>
    )
  },
  {
    icon: Sparkles,
    title: "Feedback Inteligente",
    description: "Loop de melhoria contínua. Sugestões das entrevistas aplicadas ao documento para resultados cada vez melhores.",
    gradient: "from-brand-600 to-moss-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <path d="M 100 40 L 110 70 L 140 70 L 115 90 L 125 120 L 100 100 L 75 120 L 85 90 L 60 70 L 90 70 Z" fill="currentColor" className="text-brand-400" />
        <circle cx="50" cy="50" r="8" fill="currentColor" className="text-moss-300" />
        <circle cx="150" cy="60" r="6" fill="currentColor" className="text-brand-300" />
        <circle cx="160" cy="140" r="10" fill="currentColor" className="text-moss-400" />
        <circle cx="40" cy="150" r="7" fill="currentColor" className="text-brand-300" />
      </svg>
    )
  },
  {
    icon: Zap,
    title: "Editor Robusto",
    description: "TipTap com 15+ ferramentas. Formatação rica, auto-save, undo/redo ilimitado e contador de palavras em tempo real.",
    gradient: "from-amber-500 to-amber-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect x="30" y="40" width="140" height="120" rx="8" fill="currentColor" className="text-amber-50" />
        <rect x="40" y="50" width="20" height="20" rx="4" fill="currentColor" className="text-amber-300" />
        <rect x="65" y="50" width="20" height="20" rx="4" fill="currentColor" className="text-amber-300" />
        <rect x="90" y="50" width="20" height="20" rx="4" fill="currentColor" className="text-amber-300" />
        <rect x="40" y="85" width="120" height="4" rx="2" fill="currentColor" className="text-amber-200" />
        <rect x="40" y="95" width="100" height="4" rx="2" fill="currentColor" className="text-amber-200" />
        <rect x="40" y="105" width="110" height="4" rx="2" fill="currentColor" className="text-amber-200" />
      </svg>
    )
  },
  {
    icon: Target,
    title: "100% em Português",
    description: "Plataforma completa em português brasileiro. Templates, análises e feedback pensados para o mercado internacional.",
    gradient: "from-emerald-500 to-emerald-600",
    image: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="70" fill="currentColor" className="text-emerald-100" />
        <circle cx="100" cy="100" r="50" fill="currentColor" className="text-emerald-200" />
        <circle cx="100" cy="100" r="30" fill="currentColor" className="text-emerald-400" />
        <circle cx="100" cy="100" r="10" fill="currentColor" className="text-emerald-600" />
      </svg>
    )
  }
];

export function FeaturesShowcase() {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-white to-cream-50">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-caption font-bold text-brand-700 mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Ecossistema Completo
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-h2 text-text-primary mb-4"
          >
            Tudo que você precisa para{" "}
            <span className="bg-gradient-to-r from-brand-600 to-moss-600 bg-clip-text text-transparent">
              conquistar o mundo
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-body text-text-secondary max-w-2xl mx-auto"
          >
            Combinamos as melhores práticas de projetos open-source líderes em uma plataforma única e premium
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="h-full rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-h4 text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary mb-4">
                    {feature.description}
                  </p>

                  {/* Visual */}
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-cream-50">
                    {feature.image}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
