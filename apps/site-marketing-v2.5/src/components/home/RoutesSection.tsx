"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Briefcase, Globe, Award } from "lucide-react";

const routes = [
  {
    icon: GraduationCap,
    title: "Rota Acadêmica",
    subtitle: "Mestrado e Doutorado",
    description: "Para quem quer fazer pós-graduação em universidades de ponta — Ranking QS Top 100.",
    tags: ["Chevening", "CNPq", "Erasmus+"],
    href: "/jornadas/academica",
    accent: "#3B82F6",
    bg: "bg-blue-50 border-blue-100 hover:border-blue-300",
    iconBg: "bg-blue-100 text-blue-700",
    emoji: "🏛️",
  },
  {
    icon: Briefcase,
    title: "Rota Corporativa",
    subtitle: "Emprego em Multinacional",
    description: "Para profissionais que querem trabalhar em grandes empresas no exterior com patrocínio de visto.",
    tags: ["H-1B", "Tier 2", "Blaukarte"],
    href: "/jornadas/corporativa",
    accent: "#8B5CF6",
    bg: "bg-violet-50 border-violet-100 hover:border-violet-300",
    iconBg: "bg-violet-100 text-violet-700",
    emoji: "🏢",
  },
  {
    icon: Globe,
    title: "Rota Nômade Digital",
    subtitle: "Trabalho Remoto Global",
    description: "Para quem quer trabalhar de qualquer lugar e construir uma vida independente de localização.",
    tags: ["Freelance", "Visa Nômade", "DNVB"],
    href: "/jornadas/nomade",
    accent: "#10B981",
    bg: "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-700",
    emoji: "🌏",
  },
  {
    icon: Award,
    title: "Bolsas & Governo",
    subtitle: "Programas de Bolsas Completas",
    description: "Para quem quer financiamento integral via bolsas governamentais e fundações privadas.",
    tags: ["Fulbright", "CAPES", "Lemann"],
    href: "/jornadas/bolsas",
    accent: "#F59E0B",
    bg: "bg-amber-50 border-amber-100 hover:border-amber-300",
    iconBg: "bg-amber-100 text-amber-700",
    emoji: "🏆",
  },
];

export function RoutesSection() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <Globe className="w-4 h-4 text-brand-600" />
            <span className="label-xs text-olcan-navy/60">Topografia de Oportunidades</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            As 4 Rotas <br />
            <span className="italic font-light text-brand-600 font-serif">da Transição Global.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Cada caminho exige um protocolo específico. O Compass mapeia sua rota 
            exata para eliminar desperdício de tempo e capital.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {routes.map((route, i) => {
            const Icon = route.icon;
            return (
              <motion.div
                key={route.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={route.href}
                  className="card-olcan p-10 h-full flex flex-col group border-white hover:border-brand-300 transition-all duration-500 relative overflow-hidden"
                >
                  {/* Subtle Route Indicator */}
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
                  </div>

                  {/* Icon + Emoji */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{route.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-olcan-navy text-2xl tracking-tight italic group-hover:text-brand-600 transition-colors">
                        {route.title}
                      </h3>
                      <p className="label-xs text-brand-600/60 uppercase tracking-widest">{route.subtitle}</p>
                    </div>
                    
                    <p className="text-olcan-navy/70 font-medium text-sm leading-relaxed mb-6">
                      {route.description}
                    </p>
                  </div>

                  {/* Tags - OIOS Style */}
                  <div className="flex flex-wrap gap-2 mb-8 mt-6">
                    {route.tags.map((tag) => (
                      <div
                        key={tag}
                        className="fear-pill bg-white/40 border-white text-olcan-navy/60 py-1 px-3 group-hover:border-brand-200 group-hover:text-brand-700 transition-all duration-500"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-olcan-navy group-hover:text-brand-600 transition-colors">
                    Explorar Protocolo <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
