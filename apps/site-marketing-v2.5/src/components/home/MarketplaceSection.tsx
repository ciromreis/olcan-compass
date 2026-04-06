"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Shield, Calendar, MessageCircle, ArrowRight, CheckCircle, Users, Briefcase, FileText, Globe, Compass } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { 
    id: 'legal', 
    name: 'Assistência Jurídica', 
    icon: Shield,
    description: 'Advogados especializados em vistos e imigração',
    color: 'from-blue-500 to-blue-600',
    status: 'coming-soon'
  },
  { 
    id: 'translation', 
    name: 'Tradução Jurídica', 
    icon: FileText,
    description: 'Tradutores certificados para documentos oficiais',
    color: 'from-emerald-500 to-emerald-600',
    status: 'coming-soon'
  },
  { 
    id: 'coaching', 
    name: 'Coaching de Carreira', 
    icon: Users,
    description: 'Coaches para carreira internacional e entrevistas',
    color: 'from-purple-500 to-purple-600',
    status: 'coming-soon'
  },
  { 
    id: 'relocation', 
    name: 'Serviço de Relocação', 
    icon: Globe,
    description: 'Suporte completo para mudança e instalação',
    color: 'from-orange-500 to-orange-600',
    status: 'coming-soon'
  }
];

const MARKETPLACE_BENEFITS = [
  {
    id: 1,
    icon: Shield,
    title: 'Profissionais Verificados',
    description: 'Processo rigoroso de verificação de credenciais e experiência'
  },
  {
    id: 2,
    icon: CheckCircle,
    title: 'Pagamento Seguro',
    description: 'Sistema de escrow protege seu investimento até a entrega'
  },
  {
    id: 3,
    icon: Star,
    title: 'Avaliações Reais',
    description: 'Sistema de reviews transparente de clientes verificados'
  }
];

export default function MarketplaceSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-60 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.12] bg-brand-300 pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08] bg-olcan-navy pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <Briefcase className="w-4 h-4 text-olcan-navy" />
            <span className="label-xs text-olcan-navy/60">Ecossistema de Especialistas</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Marketplace <br />
            <span className="italic font-light text-brand-600 font-serif">de Profissionais Verificados.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-3xl mx-auto leading-relaxed font-medium">
            Estamos curando uma rede de elite composta por advogados, tradutores e coaches 
            especializados em mobilidade internacional. <span className="text-olcan-navy">Acesso restrito em breve.</span>
          </p>
        </motion.div>

        {/* Marketplace Access CTA - Replacing Waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-24"
        >
          <div className="card-olcan p-10 md:p-14 border-2 border-brand-500/30 relative overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Compass className="w-32 h-32 text-olcan-navy" />
            </div>
            
            <div className="relative z-10 text-center space-y-8">
              <div className="space-y-3">
                <div className="label-xs text-brand-600 tracking-wide font-bold">Acesso Liberado</div>
                <h3 className="font-display text-3xl text-olcan-navy italic">Explore o Novo Ecossistema</h3>
                <p className="text-olcan-navy/80 font-medium">Os recursos, mentorias e equipamentos de alta performance que você precisa agora estão disponíveis nativamente.</p>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/marketplace" className="btn-primary px-10 py-4 shadow-xl shadow-brand-500/20 text-lg flex items-center gap-2">
                  Acessar Plataforma <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="liquid-glass p-8 h-full flex flex-col border border-white/60 hover:border-brand-300 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center mb-8 border border-white/60 shadow-xl shadow-olcan-navy/5 group-hover:scale-110 group-hover:bg-white transition-all">
                  <category.icon className="w-7 h-7 text-olcan-navy" />
                </div>
                
                <h3 className="font-display text-xl text-olcan-navy mb-3 italic tracking-tight">{category.name}</h3>
                <p className="text-sm text-olcan-navy/70 mb-8 leading-relaxed font-medium flex-1">{category.description}</p>
                
                <div className="fear-pill bg-white/40 border-white text-olcan-navy/40">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  Em breve
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Marketplace Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <div className="label-xs text-brand-600 mb-4 tracking-wide">Protocolo de Segurança Olcan</div>
            <h3 className="font-display text-4xl text-olcan-navy italic">Transparência e Segurança</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MARKETPLACE_BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="card-olcan p-10 text-center border-2 border-white/60 hover:border-brand-300 transition-all duration-500">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/40 flex items-center justify-center mb-8 border border-white/60 shadow-xl shadow-olcan-navy/5 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-8 h-8 text-brand-600" />
                  </div>
                  <h4 className="font-display text-xl text-olcan-navy mb-4 italic tracking-tight">{benefit.title}</h4>
                  <p className="text-sm text-olcan-navy/70 leading-relaxed font-medium">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Signals Block - Redesigned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="liquid-glass-strong px-12 py-8 flex flex-wrap justify-center items-center gap-12 border-white/60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-olcan-navy flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-olcan-navy uppercase tracking-widest">Pagamento Seguro</p>
                <p className="label-xs text-olcan-navy/40">Protegido em escrow</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-olcan-navy/10" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-olcan-navy flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-olcan-navy uppercase tracking-widest">Profissionais Verificados</p>
                <p className="label-xs text-olcan-navy/40">Auditoria manual</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-olcan-navy/10" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-olcan-navy flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-olcan-navy uppercase tracking-widest">Suporte Internacional</p>
                <p className="label-xs text-olcan-navy/40">Atendimento dedicado</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
