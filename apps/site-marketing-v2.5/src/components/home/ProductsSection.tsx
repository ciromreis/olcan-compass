"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Map, FileText, Globe, Users, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const PRODUCTS = [
  {
    id: 'curso-cidadao-mundo',
    name: 'Cidadão do Mundo',
    tagline: 'Curso Online — A base da transformação',
    description: 'Tudo o que você precisa saber para planejar, executar e conquistar sua vaga no mercado internacional. Do currículo ao visto, do LinkedIn à oferta de emprego.',
    icon: Globe,
    image: '/images/product-cidadao-mundo.png',
    features: [
      'Módulos completos de carreira global',
      'Templates e materiais exclusivos',
      'Preparação para entrevistas internacionais',
      'Acesso vitalício ao conteúdo',
    ],
    link: 'https://pay.hotmart.com/N97314230U',
    linkLabel: 'Conhecer o curso',
    external: true,
    featured: true,
    badge: 'Mais Popular',
  },
  {
    id: 'rota-internacionalizacao',
    name: 'Rota da Internacionalização',
    tagline: 'Mapa estratégico — Seu caminho personalizado',
    description: 'Um roadmap interativo e detalhado para sua jornada internacional. Planejamento mês a mês com todas as etapas que você precisa concluir antes de embarcar.',
    icon: Map,
    image: '/images/product-rota.png',
    features: [
      'Mapa interativo (Miro Board)',
      'Checklist por país-alvo',
      'Cronograma realista e adaptável',
      'Atualizações contínuas de conteúdo',
    ],
    link: 'https://pay.hotmart.com/K97966494E',
    linkLabel: 'Ver o mapa',
    external: true,
    featured: true,
    badge: 'Prático',
  },
  {
    id: 'kit-application',
    name: 'Kit Application',
    tagline: 'Template Notion — Documentos profissionais',
    description: 'Sistema completo em Notion para organizar, criar e revisar toda a documentação necessária para sua candidatura internacional. Currículo, carta de motivação e mais.',
    icon: FileText,
    image: '/images/product-kit.png',
    features: [
      'Templates prontos em Notion',
      'Currículo no padrão internacional',
      'Carta de motivação estruturada',
      'Guia de uso com exemplos reais',
    ],
    link: 'https://pay.hotmart.com/X85073158P',
    linkLabel: 'Ver o kit',
    external: true,
    featured: true,
    badge: 'Essencial',
  },
  {
    id: 'mentoria',
    name: 'Mentoria com Ciro',
    tagline: 'Sessão 1:1 — Estratégia personalizada',
    description: 'Sessão individual com Ciro Moraes, fundador da Olcan. Estratégia real baseada no seu perfil único — nada de fórmulas genéricas.',
    icon: Users,
    features: [
      'Sessão 1:1 de 60 min',
      'Diagnóstico do seu perfil',
      'Plano de ação personalizado',
      'Feedback direto e honesto',
    ],
    link: 'https://zenklub.com.br/coaches/ciro-moraes/',
    linkLabel: 'Agendar sessão',
    external: true,
    featured: false,
  },
  {
    id: 'consultoria',
    name: 'Consultoria Olcan',
    tagline: 'Suporte especializado completo',
    description: 'Acompanhamento estratégico completo para sua transição internacional. Para quem quer ir além dos cursos e ter suporte real do início ao fim.',
    icon: BookOpen,
    features: [
      'Acompanhamento personalizado',
      'Suporte em todo o processo',
      'Revisão de documentos',
      'Estratégia de visto e carreira',
    ],
    link: 'https://go.hotmart.com/P85051099X',
    linkLabel: 'Conhecer',
    external: true,
    featured: false,
  },
  {
    id: 'medmind-pro',
    name: 'MedMind Pro',
    tagline: 'Para profissionais da saúde',
    description: 'Programa especializado para médicos e profissionais da saúde que buscam revalidação e oportunidades internacionais.',
    icon: Brain,
    features: [
      'Foco em revalidação médica',
      'Processos específicos por país',
      'Rede de médicos no exterior',
      'Cronograma realista',
    ],
    link: '/contato',
    linkLabel: 'Saiba mais',
    external: false,
    featured: false,
  },
];

export default function ProductsSection() {
  return (
    <section className="py-24 md:py-32 bg-cream-50 relative overflow-hidden noise">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-60 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.12] bg-brand-400 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] bg-olcan-navy pointer-events-none" />
      
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
            <span className="label-xs text-olcan-navy/60">Nossos Produtos</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Ferramentas para <br />
            <span className="italic font-light text-brand-600">sua jornada global.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/80 max-w-3xl mx-auto leading-relaxed font-medium">
            Do primeiro passo ao destino final — cada produto foi criado para resolver 
            uma etapa real da sua transição internacional.
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
                {/* Badge */}
                {product.badge && (
                  <div className="inline-flex self-start mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Image / Icon Container */}
                <div className="relative w-full aspect-video mb-8 rounded-2xl overflow-hidden border border-white/20 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/40 flex items-center justify-center">
                      <product.icon className="w-12 h-12 text-olcan-navy" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                {/* Content */}
                <div className="label-xs text-brand-600 mb-2 uppercase tracking-wide font-bold">{product.tagline}</div>
                <h3 className="font-display text-3xl text-olcan-navy mb-4 italic leading-tight">{product.name}</h3>
                <p className="text-olcan-navy/80 mb-8 leading-relaxed font-medium flex-1">{product.description}</p>
                
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
                {product.external ? (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full py-5 group/btn"
                  >
                    {product.linkLabel}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                  </a>
                ) : (
                  <Link href={product.link} className="btn-primary w-full py-5 group/btn">
                    {product.linkLabel}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                  </Link>
                )}
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
                  
                  {product.external ? (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-olcan-navy font-bold text-sm tracking-widest uppercase hover:text-brand-600 transition-colors group/link"
                    >
                      {product.linkLabel}
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href={product.link}
                      className="inline-flex items-center gap-2 text-olcan-navy font-bold text-sm tracking-widest uppercase hover:text-brand-600 transition-colors group/link"
                    >
                      {product.linkLabel}
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)' }}>
            <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <div className="label-xs text-brand-400 mb-6 tracking-wide">Consultoria Especializada</div>
              <h3 className="font-display text-4xl md:text-6xl text-white mb-8 italic tracking-tight">
                Inicie sua transição estratégica hoje.
              </h3>
              <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                Agende uma conversa com nossos especialistas em internacionalização 
                e receba um parecer preliminar sobre sua viabilidade global.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/contato" className="btn-primary py-5 px-10 text-lg w-full sm:w-auto">
                  Falar com Especialista
                  <Users className="w-5 h-5 ml-2" />
                </Link>
                <div className="flex items-center gap-3 text-white/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="label-xs tracking-widest">Vagas abertas para mentorias</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
