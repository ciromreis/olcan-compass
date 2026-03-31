"use client";

import { motion } from "framer-motion";

const partners = [
  { name: "SEBRAE ALI", desc: "Parceiro de Produtividade" },
  { name: "GOOGLE", desc: "for Startups Antigravity" },
  { name: "ZENKLUB", desc: "Parceiro de Bem-Estar" },
];

const stats = [
  { value: "500+", label: "Brasileiros na jornada" },
  { value: "12", label: "Perfis de Carreira mapeados" },
  { value: "4", label: "Rotas internacionais" },
  { value: "87%", label: "Satisfação NPS" },
];

export function TrustBar() {
  return (
    <section className="bg-white border-b border-clay-light/50">
      {/* Stats Row */}
      <div className="section-wrapper py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading font-extrabold text-3xl text-void mb-1">{stat.value}</div>
              <div className="text-ink-muted text-sm font-body">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Partners */}
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {partners.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-0.5">
              <span className="font-heading font-extrabold text-sm tracking-widest text-ink">{p.name}</span>
              <span className="text-xs text-ink-muted font-body">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
