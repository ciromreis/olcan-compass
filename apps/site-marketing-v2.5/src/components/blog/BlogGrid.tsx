"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  image: string;
  author: {
    name: string;
    role: string;
  };
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    slug: 'guia-completo-visto-portugal',
    title: 'Guia Completo: Como Conseguir Visto de Trabalho para Portugal em 2026',
    excerpt: 'Passo a passo detalhado com documentos, prazos e custos para obter seu visto de trabalho português.',
    category: 'Vistos',
    readTime: '12 min',
    publishedAt: '2026-03-15',
    image: '/blog/portugal-visa.jpg',
    author: {
      name: 'Equipe Olcan',
      role: 'Especialistas em Mobilidade'
    }
  },
  {
    slug: 'curriculo-internacional-erros',
    title: '7 Erros Fatais no Currículo Internacional (e Como Evitá-los)',
    excerpt: 'Descubra os erros mais comuns que fazem seu CV ser rejeitado por recrutadores internacionais.',
    category: 'Carreira',
    readTime: '8 min',
    publishedAt: '2026-03-10',
    image: '/blog/cv-mistakes.jpg',
    author: {
      name: 'Equipe Olcan',
      role: 'Especialistas em Mobilidade'
    }
  },
  {
    slug: 'canada-express-entry-2026',
    title: 'Express Entry Canadá 2026: Mudanças e Oportunidades',
    excerpt: 'Tudo sobre as novas regras do Express Entry e como aumentar suas chances de aprovação.',
    category: 'Canadá',
    readTime: '15 min',
    publishedAt: '2026-03-05',
    image: '/blog/canada-express.jpg',
    author: {
      name: 'Equipe Olcan',
      role: 'Especialistas em Mobilidade'
    }
  }
];

const CATEGORIES = ['Todos', 'Vistos', 'Carreira', 'Destinos', 'Documentação', 'Histórias'];

export function BlogGrid() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const filteredPosts = selectedCategory === 'Todos' 
    ? SAMPLE_POSTS 
    : SAMPLE_POSTS.filter(post => post.category === selectedCategory);

  return (
    <div className="container-site mx-auto px-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 mb-20 justify-center">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden ${
              selectedCategory === category
                ? 'bg-olcan-navy text-white shadow-xl shadow-olcan-navy/20 scale-105'
                : 'bg-white/40 backdrop-blur-md border border-white/60 text-olcan-navy/40 hover:border-olcan-navy/20 hover:text-olcan-navy hover:bg-white/60'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredPosts.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.22, 1, 0.36, 1] }}
            className="group h-full"
          >
            <Link href={`/blog/${post.slug}`} className="block h-full">
              <div className="card-olcan flex flex-col h-full overflow-hidden hover:scale-[1.02] transition-all duration-500">
                {/* Image / Header area */}
                <div className="relative h-56 bg-olcan-navy/5 overflow-hidden">
                  <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-multiply" />
                  <div className="absolute top-6 left-6 z-10">
                    <span className="fear-pill bg-white/80 border-white text-olcan-navy">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-olcan-navy/30 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl text-olcan-navy mb-5 group-hover:text-brand-600 transition-colors leading-[1.2] tracking-tight line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-olcan-navy/50 text-base font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-olcan-navy/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-olcan-navy/5 flex items-center justify-center text-olcan-navy/40 font-bold text-[10px] border border-olcan-navy/10">
                        {post.author.name.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-olcan-navy uppercase tracking-widest">{post.author.name}</div>
                        <div className="text-olcan-navy/40 font-medium">{post.author.role}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-olcan-navy/20 group-hover:text-olcan-navy group-hover:translate-x-1.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Newsletter CTA - Rebranded as Intelligence Report */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="mt-32 relative liquid-glass-strong rounded-[3rem] p-12 md:p-20 text-center border-2 border-white/60 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="label-xs text-olcan-navy/40 mb-8 block">Relatórios de Inteligência OIOS</span>
          <h3 className="font-display text-4xl md:text-6xl text-olcan-navy tracking-tighter mb-8 leading-[1.1]">
            Decodifique o mercado global de talentos
          </h3>
          <p className="text-xl md:text-2xl text-olcan-navy/60 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Receba análises estratégicas sobre mobilidade, vistos e carreira internacional diretamente na sua central de comando.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail corporativo"
              className="flex-1 px-8 py-5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-olcan-navy placeholder-olcan-navy/40 focus:outline-none focus:ring-2 focus:ring-olcan-navy/10 transition-all font-medium"
            />
            <button className="btn-primary py-5 px-10 text-lg group">
              Assinar Relatório
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
