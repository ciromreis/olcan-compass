"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";

// Static blog posts — replace with Substack RSS fetch in production
const posts = [
  {
    title: "De Nova Soure, Bahia para Harvard e LSE: O que ninguém te conta sobre candidaturas de elite",
    excerpt: "A história de Ana Carolina mostra que a rede de contatos pode ser substituída por um sistema. Um metodologia estruturada vale mais que um nome famoso no currículo.",
    date: "15 Mar 2026",
    tag: "Bolsas",
    emoji: "🏛️",
    href: "https://olcanglobal.substack.com",
  },
  {
    title: "Os 4 medos que impedem brasileiros de aplicar para vagas internacionais",
    excerpt: "Mapeamos os padrões emocionais de 500 aspirantes. O medo de competência é o mais paralisante — e também o mais fácil de resolver com a abordagem certa.",
    date: "08 Mar 2026",
    tag: "Psicologia",
    emoji: "🧠",
    href: "https://olcanglobal.substack.com",
  },
  {
    title: "Blaukarte para desenvolvedores brasileiros: o guia completo de 2026",
    excerpt: "Salário mínimo exigido, processo de validação do diploma, e estratégias de oferta de emprego que funcionam para o mercado alemão de tech.",
    date: "01 Mar 2026",
    tag: "Corporativo",
    emoji: "⚙️",
    href: "https://olcanglobal.substack.com",
  },
];

const tagColors: Record<string, string> = {
  Bolsas: "bg-blue-50 text-blue-700",
  Psicologia: "bg-purple-50 text-purple-700",
  Corporativo: "bg-emerald-50 text-emerald-700",
};

export function BlogFeedSection() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="label-xs text-olcan-navy/60">Conteúdo Editorial</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
              A Inteligência da <br />
              <span className="italic font-light text-brand-600 font-serif">Olcan no Substack.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="pb-2"
          >
            <Link
              href="https://olcanglobal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-4 px-8 group text-sm"
            >
              Assinar Newsletter
              <ExternalLink size={16} className="ml-3 group-hover:rotate-12 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card-olcan p-8 h-full flex flex-col group border-white/60 hover:border-brand-300 transition-all duration-500"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="fear-pill bg-white/40 border-white text-olcan-navy/60 py-1 px-3">
                    {post.tag}
                  </div>
                  <span className="text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{post.emoji}</span>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="font-display text-xl text-olcan-navy leading-snug group-hover:text-brand-600 group-hover:italic transition-all duration-300 tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-olcan-navy/60 font-medium text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-olcan-navy/5 flex items-center justify-between">
                  <span className="label-xs text-olcan-navy/40">{post.date}</span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olcan-navy group-hover:text-brand-600 transition-colors">
                    Ler <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
