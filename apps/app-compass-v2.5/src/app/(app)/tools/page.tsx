"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Mic } from "lucide-react";
import Link from "next/link";

const TOOLS = [
  {
    href: "/tools/pitch-lab",
    icon: Mic,
    label: "Pitch Lab",
    description:
      "Grave e analise seu pitch profissional. Métricas de duração, ritmo e hesitação para refinar sua apresentação.",
  },
  {
    href: "/tools/budget-simulator",
    icon: BarChart3,
    label: "Simulador de Orçamento",
    description:
      "Modele o custo real da sua rota de mobilidade — vistos, moradia, transição e reserva de emergência.",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Ferramentas
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Instrumentos de apoio
        </h1>
        <p className="text-sm text-slate-500">
          Utilitários complementares para preparação e simulação da sua jornada.
        </p>
      </div>

      <div className="space-y-3">
        {TOOLS.map(({ href, icon: Icon, label, description }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={href}
              className="flex items-start gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-slate-100 group-hover:bg-slate-950 transition-colors">
                <Icon className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-slate-950">{label}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 shrink-0 mt-1 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
