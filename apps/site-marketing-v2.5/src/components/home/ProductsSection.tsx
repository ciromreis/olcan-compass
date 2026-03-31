"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Map, FileText, Globe, Users, Brain, Briefcase, ArrowRight, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const PRODUCTS = [
  {
    id: 'cidadao-mundo',
    name: 'Curso Cidadão do Mundo',
    tagline: 'Sua jornada internacional começa aqui',
    description: 'Encontros ao vivo 3x por semana com orientação prática para processos seletivos internacionais. Acesso às gravações e materiais exclusivos.',
    icon: Globe,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Aulas ao vivo e gravadas',
      'Preparação de documentos',
      'Networking global',
      'Suporte especializado'
    ],
    link: '/marketplace/curso-cidadao-mundo',
    featured: true
  },
  {
    id: 'rota-internacionalizacao',
    name: 'Rota da Internacionalização',
    tagline: 'Seu caminho personalizado',
    description: 'Planejamento estratégico completo para sua mobilidade internacional com roadmap detalhado e acompanhamento.',
    icon: Map,
    color: 'from-emerald-500 to-emerald-600',
    features: [
      'Diagnóstico personalizado',
      'Roadmap detalhado',
      'Acompanhamento mensal',
      'Ajustes estratégicos'
    ],
    link: '/marketplace/rota-internacionalizacao',
    featured: true
  },
  {
    id: 'kit-application',
    name: 'Kit Application',
    tagline: 'Documentos profissionais',
    description: 'Preparação completa de currículo, carta de motivação e documentos para processos seletivos internacionais.',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    features: [
      'Currículo internacional',
      'Carta de motivação',
      'Revisão profissional',
      'Templates premium'
    ],
    link: '/marketplace/kit-application',
    featured: true
  },
  {
    id: 'mentoria',
    name: 'Mentoria Individual',
    tagline: 'Acompanhamento personalizado',
    description: 'Sessões individuais com especialistas para acelerar sua jornada internacional com foco nos seus objetivos.',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
    features: [
      'Sessões 1:1',
      'Estratégia personalizada',
      'Feedback direto',
      'Aceleração de resultados'
    ],
    link: '/contato',
    featured: false
  },
  {
    id: 'sem-fronteiras',
    name: 'Sem Fronteiras',
    tagline: 'Comunidade global',
    description: 'Acesso à comunidade exclusiva de profissionais em mobilidade internacional com eventos e networking.',
    icon: Briefcase,
    color: 'from-pink-500 to-pink-600',
    features: [
      'Comunidade exclusiva',
      'Eventos mensais',
      'Networking qualificado',
      'Oportunidades compartilhadas'
    ],
    link: '/contato',
    featured: false
  },
  {
    id: 'medmind-pro',
    name: 'MedMind Pro',
    tagline: 'Para profissionais da saúde',
    description: 'Programa especializado para médicos e profissionais da saúde que buscam oportunidades internacionais.',
    icon: Brain,
    color: 'from-red-500 to-red-600',
    features: [
      'Foco em saúde',
      'Processos específicos',
      'Rede de médicos',
      'Certificações internacionais'
    ],
    link: '/contato',
    featured: false
  }
];

export default function ProductsSection() {
  return (
    <section className="py-24 md:py-32 bg-cream-50 relative overflow-hidden noise">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 bg-olcan-navy pointer-events-none" />
      
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
            <BookOpen className="w-4 h-4 text-olcan-navy" />
            <span className="label-xs text-olcan-navy/60">Soluções Estratégicas</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Arquitetura <br />
            <span className="italic font-light text-brand-600">para sua evolução.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-3xl mx-auto leading-relaxed font-medium">
            Do diagnóstico inicial à transição completa, nossas soluções aplicam 
            inteligência estratégica para sua trajetória internacional.
          </p>
        </motion.div>

        {/* Featured Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRODUCTS.filter(p => p.featured).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-olcan p-10 h-full flex flex-col border-2 border-white/60 hover:border-brand-300 transition-all duration-500">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-8 border border-white/60 shadow-xl shadow-olcan-navy/5 group-hover:scale-110 group-hover:bg-white transition-all">
                  <product.icon className="w-8 h-8 text-olcan-navy" />
                </div>
                
                {/* Content */}
                <div className="label-xs text-brand-600 mb-2 uppercase tracking-[0.2em]">{product.tagline}</div>
                <h3 className="font-display text-3xl text-olcan-navy mb-4 italic leading-tight">{product.name}</h3>
                <p className="text-olcan-navy/70 mb-8 leading-relaxed font-medium flex-1">{product.description}</p>
                
                {/* Features */}
                <div className="space-y-4 mb-10 pt-6 border-t border-olcan-navy/5">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-olcan-navy/60">
                      <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <Link
                  href={product.link}
                  className="btn-primary w-full py-5 group/btn"
                >
                  Saiba Mais
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="pt-20 border-t border-olcan-navy/5"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <div className="label-xs text-olcan-navy/40 mb-3">Expanda seu horizonte</div>
              <h3 className="font-display text-4xl text-olcan-navy italic">Serviços Especializados</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRODUCTS.filter(p => !p.featured).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="liquid-glass p-8 h-full border border-white/60 hover:border-brand-300 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center mb-6 border border-white/60 group-hover:scale-110 transition-all">
                    <product.icon className="w-6 h-6 text-olcan-navy" />
                  </div>
                  
                  <div className="label-xs text-brand-600 mb-1">{product.tagline}</div>
                  <h4 className="font-bold text-xl text-olcan-navy mb-4 tracking-tight">{product.name}</h4>
                  <p className="text-sm text-olcan-navy/70 mb-8 leading-relaxed font-medium">{product.description}</p>
                  
                  <Link
                    href={product.link}
                    className="inline-flex items-center gap-2 text-olcan-navy font-bold text-sm tracking-widest uppercase hover:text-brand-600 transition-colors group/link"
                  >
                    Explorar
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section - Redeisgned as Intelligence Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="liquid-glass-strong rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden bg-olcan-navy">
            <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <div className="label-xs text-brand-400 mb-6 tracking-[0.3em]">Direct Consultation Unit</div>
              <h3 className="font-display text-4xl md:text-6xl text-white mb-8 italic tracking-tight">
                Inicie sua transição estratégica hoje.
              </h3>
              <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                Agende uma conversa com nossos especialistas em internacionalização 
                e receba um parecer preliminar sobre sua viabilidade global.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/contato"
                  className="btn-primary py-5 px-10 text-lg w-full sm:w-auto"
                >
                  Falar com Especialista
                  <Users className="w-5 h-5 ml-2" />
                </Link>
                <div className="flex items-center gap-3 text-white/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="label-xs tracking-widest">Available for Q1 2026</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
