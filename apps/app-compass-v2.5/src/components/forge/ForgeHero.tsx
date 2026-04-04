"use client";

import Link from "next/link";
import { FileText, Sparkles, TrendingUp, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ForgeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-moss-50 py-16 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-200" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-caption font-bold text-brand-700">
              <Sparkles className="w-4 h-4" />
              Narrative Forge v2.5
            </div>

            {/* Heading */}
            <h1 className="font-heading text-h1 text-text-primary leading-tight">
              Transforme sua trajetória em uma{" "}
              <span className="bg-gradient-to-r from-brand-600 to-moss-600 bg-clip-text text-transparent">
                narrativa de ouro
              </span>
            </h1>

            {/* Description */}
            <p className="text-body text-text-secondary max-w-xl">
              Crie currículos profissionais, otimize para ATS, pratique entrevistas por voz e receba feedback inteligente. 
              Tudo em uma plataforma premium para candidaturas internacionais.
            </p>

            {/* Features List */}
            <ul className="space-y-3">
              {[
                "Templates profissionais em português",
                "Análise ATS com score em tempo real",
                "Treino de entrevistas com IA",
                "Feedback personalizado e acionável"
              ].map((feature, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 text-body-sm text-text-secondary"
                >
                  <CheckCircle2 className="w-5 h-5 text-moss-500 flex-shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/forge/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-body font-heading font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40"
              >
                <FileText className="w-5 h-5" />
                Criar Documento
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-200 bg-white px-8 py-4 text-body font-heading font-semibold text-brand-700 transition-all hover:border-brand-300 hover:bg-brand-50"
              >
                Ver Recursos
              </Link>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Illustration */}
            <div className="relative rounded-3xl bg-gradient-to-br from-white to-cream-50 p-8 shadow-2xl border border-cream-200">
              {/* Document Preview */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-cream-200">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-moss-500 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-cream-200 rounded-full mb-2" />
                    <div className="h-3 w-32 bg-cream-100 rounded-full" />
                  </div>
                </div>

                {/* Content Lines */}
                <div className="space-y-3">
                  {[100, 85, 95, 70, 90].map((width, idx) => (
                    <div key={idx} className="h-3 bg-cream-100 rounded-full" style={{ width: `${width}%` }} />
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[
                    { icon: TrendingUp, value: "92", label: "ATS Score" },
                    { icon: Zap, value: "450", label: "Palavras" },
                    { icon: Sparkles, value: "A+", label: "Qualidade" }
                  ].map((stat, idx) => (
                    <div key={idx} className="rounded-xl bg-white p-3 text-center border border-cream-200">
                      <stat.icon className="w-5 h-5 mx-auto mb-1 text-brand-500" />
                      <div className="font-heading text-h4 text-text-primary">{stat.value}</div>
                      <div className="text-caption text-text-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-moss-400 to-moss-600 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
