"use client";

import Link from "next/link";
import { FileText, Sparkles, TrendingUp, Mic, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  variant: "no-documents" | "no-ats" | "no-interviews" | "no-feedback";
  onAction?: () => void;
}

const emptyStates = {
  "no-documents": {
    icon: FileText,
    title: "Nenhum documento criado ainda",
    description: "Comece sua jornada criando seu primeiro documento profissional no Forge",
    actionText: "Criar Primeiro Documento",
    actionHref: "/forge/new",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="80" fill="currentColor" className="text-cream-100" />
        <rect x="60" y="50" width="80" height="100" rx="8" fill="currentColor" className="text-white" stroke="currentColor" strokeWidth="2" />
        <line x1="75" y1="70" x2="125" y2="70" stroke="currentColor" strokeWidth="3" className="text-brand-300" />
        <line x1="75" y1="85" x2="115" y2="85" stroke="currentColor" strokeWidth="2" className="text-cream-300" />
        <line x1="75" y1="95" x2="120" y2="95" stroke="currentColor" strokeWidth="2" className="text-cream-300" />
        <line x1="75" y1="105" x2="110" y2="105" stroke="currentColor" strokeWidth="2" className="text-cream-300" />
        <circle cx="100" cy="130" r="15" fill="currentColor" className="text-brand-500" />
        <path d="M 95 130 L 98 133 L 105 126" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  "no-ats": {
    icon: TrendingUp,
    title: "Análise ATS não realizada",
    description: "Cole a descrição da vaga para receber análise de compatibilidade e sugestões de melhoria",
    actionText: "Analisar Agora",
    actionHref: undefined,
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="80" fill="currentColor" className="text-moss-50" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-moss-200" />
        <path d="M 100 100 L 100 50" stroke="currentColor" strokeWidth="6" className="text-moss-500" />
        <circle cx="100" cy="100" r="8" fill="currentColor" className="text-moss-600" />
        <text x="100" y="160" textAnchor="middle" className="text-2xl font-bold fill-moss-600">?</text>
      </svg>
    ),
  },
  "no-interviews": {
    icon: Mic,
    title: "Nenhuma entrevista praticada",
    description: "Pratique entrevistas por voz e receba feedback sobre delivery e conteúdo",
    actionText: "Iniciar Primeiro Treino",
    actionHref: undefined,
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="80" fill="currentColor" className="text-clay-50" />
        <rect x="80" y="60" width="40" height="60" rx="20" fill="currentColor" className="text-clay-300" />
        <path d="M 60 110 Q 60 140 100 140 Q 140 140 140 110" fill="none" stroke="currentColor" strokeWidth="6" className="text-clay-400" />
        <line x1="100" y1="140" x2="100" y2="165" stroke="currentColor" strokeWidth="6" className="text-clay-400" />
        <line x1="75" y1="165" x2="125" y2="165" stroke="currentColor" strokeWidth="6" className="text-clay-400" />
        <circle cx="140" cy="70" r="12" fill="currentColor" className="text-clay-500" />
        <circle cx="150" cy="90" r="8" fill="currentColor" className="text-clay-400" />
      </svg>
    ),
  },
  "no-feedback": {
    icon: Sparkles,
    title: "Sem feedback disponível",
    description: "Complete entrevistas para receber sugestões personalizadas de melhoria para seu documento",
    actionText: "Ver Como Funciona",
    actionHref: undefined,
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="80" fill="currentColor" className="text-brand-50" />
        <path d="M 100 50 L 110 80 L 140 80 L 115 100 L 125 130 L 100 110 L 75 130 L 85 100 L 60 80 L 90 80 Z" fill="currentColor" className="text-brand-300" />
        <circle cx="60" cy="60" r="6" fill="currentColor" className="text-moss-300" />
        <circle cx="140" cy="70" r="8" fill="currentColor" className="text-brand-400" />
        <circle cx="150" cy="130" r="10" fill="currentColor" className="text-moss-400" />
        <circle cx="50" cy="140" r="7" fill="currentColor" className="text-brand-300" />
      </svg>
    ),
  },
};

export function EmptyState({ variant, onAction }: EmptyStateProps) {
  const state = emptyStates[variant];
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 border-dashed border-cream-300 bg-gradient-to-br from-white to-cream-50 p-12 text-center"
    >
      {/* Illustration */}
      <div className="mx-auto mb-6 w-48 h-48">
        {state.illustration}
      </div>

      {/* Icon */}
      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-moss-500 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Content */}
      <h3 className="font-heading text-h3 text-text-primary mb-3">
        {state.title}
      </h3>
      <p className="text-body text-text-secondary max-w-md mx-auto mb-6">
        {state.description}
      </p>

      {/* Action */}
      {state.actionHref ? (
        <Link
          href={state.actionHref}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 text-body font-heading font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40"
        >
          <Plus className="w-5 h-5" />
          {state.actionText}
          <ArrowRight className="w-5 h-5" />
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 text-body font-heading font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40"
        >
          {state.actionText}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
}
