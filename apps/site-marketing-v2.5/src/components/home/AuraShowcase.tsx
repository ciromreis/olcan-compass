"use client";

/**
 * Aura Showcase - site-marketing-v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, Heart, Star, ArrowRight, Orbit, Fingerprint, Activity } from 'lucide-react';

// Aura Icons (Metamodern / Minimalist Style)
const AuraIcon = ({ type, active }: { type: string; active: boolean }) => {
  const baseClasses = `transition-all duration-500 ${active ? 'text-gold-500 scale-110' : 'text-ink-300 opacity-40'}`;
  
  switch (type) {
    case 'sovereignty': return <Shield className={baseClasses} size={120} strokeWidth={1} />;
    case 'elite': return <Star className={baseClasses} size={120} strokeWidth={1} />;
    case 'mastery': return <Zap className={baseClasses} size={120} strokeWidth={1} />;
    case 'presence': return <Orbit className={baseClasses} size={120} strokeWidth={1} />;
    case 'architect': return <Activity className={baseClasses} size={120} strokeWidth={1} />;
    case 'talent': return <Fingerprint className={baseClasses} size={120} strokeWidth={1} />;
    default: return <Sparkles className={baseClasses} size={120} strokeWidth={1} />;
  }
};

interface Aura {
  id: string;
  name: string;
  description: string;
  archetype: string;
  benefits: string[];
  stats: {
    power: number;
    wisdom: number;
    charisma: number;
  };
}

const auras: Aura[] = [
  {
    id: 'sovereignty',
    name: 'Soberania Individual',
    description: 'Foco na autonomia geopolítica e liberdade financeira.',
    archetype: 'Individual Sovereignty',
    benefits: ['Geographic Arbitrage', 'Private Wealth Protection'],
    stats: { power: 95, wisdom: 80, charisma: 70 }
  },
  {
    id: 'elite',
    name: 'Elite Acadêmica',
    description: 'Acesso às instituições de maior prestígio global.',
    archetype: 'Academic Elite',
    benefits: ['Ivy League Pipeline', 'Research Excellence'],
    stats: { power: 70, wisdom: 98, charisma: 85 }
  },
  {
    id: 'mastery',
    name: 'Maestria de Carreira',
    description: 'Re-alinhamento estratégico de valor no mercado senior.',
    archetype: 'Career Mastery',
    benefits: ['Market Re-positioning', 'Senior Authority'],
    stats: { power: 85, wisdom: 90, charisma: 80 }
  },
  {
    id: 'presence',
    name: 'Presença Global',
    description: 'Habitante do fluxo. Mobilidade total sem fricção.',
    archetype: 'Global Presence',
    benefits: ['Digital Nomad Visas', 'Global Mobility'],
    stats: { power: 60, wisdom: 85, charisma: 95 }
  },
  {
    id: 'architect',
    name: 'Arquiteto de Fronteira',
    description: 'Construindo pontes técnicas em novos ecossistemas.',
    archetype: 'Frontier Architect',
    benefits: ['Technical Relocation', 'Infrastructure Ops'],
    stats: { power: 90, wisdom: 85, charisma: 65 }
  },
  {
    id: 'talent',
    name: 'Talento Validado',
    description: 'Auditado e pronto para os maiores desafios globais.',
    archetype: 'Verified Talent',
    benefits: ['Performance Validation', 'Expert Recognition'],
    stats: { power: 80, wisdom: 80, charisma: 75 }
  }
];

const AuraShowcase = () => {
  const [selectedAura, setSelectedAura] = useState<string | null>(null);

  return (
    <section className="py-32 relative bg-bone overflow-hidden">
      {/* Background Liquid Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-hero-grain" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold-600">MANIFESTO DE PRONTIDÃO</span>
            <h2 className="text-6xl lg:text-7xl font-display text-ink-500 tracking-tight leading-none">
              Sua <span className="text-gold-500 italic">Aura</span> de Mobilidade
            </h2>
            <p className="text-xl text-ink-300 font-medium leading-relaxed max-w-2xl pt-4">
              Cada perfil técnico possui um rastro evolutivo único. Identificamos seu arquétipo para otimizar cada etapa da sua transição global.
            </p>
          </motion.div>
        </div>

        {/* Aura Selection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {auras.map((aura, index) => (
            <motion.div
              key={aura.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedAura(aura.id)}
              className={`
                group relative p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer
                ${selectedAura === aura.id 
                  ? 'bg-ink-500 border-ink-500 shadow-2xl scale-[1.02]' 
                  : 'bg-white/40 border-white/80 hover:bg-white/60 shadow-glass-sm'}
              `}
            >
              {/* Visual Icon */}
              <div className="flex justify-center mb-12 py-8 relative">
                <AnimatePresence>
                  {selectedAura === aura.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-gold-400/20 rounded-full blur-3xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
                <AuraIcon type={aura.id} active={selectedAura === aura.id} />
              </div>

              {/* Aura Info */}
              <div className="space-y-6">
                <div>
                  <h3 className={`text-3xl font-display mb-2 ${selectedAura === aura.id ? 'text-gold-500' : 'text-ink-500'}`}>
                    {aura.name}
                  </h3>
                  <p className={`text-sm font-medium leading-relaxed ${selectedAura === aura.id ? 'text-white/60' : 'text-ink-300'}`}>
                    {aura.description}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {aura.benefits.map((benefit, i) => (
                    <span 
                      key={i} 
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                        ${selectedAura === aura.id 
                          ? 'bg-white/10 border-white/20 text-white/80' 
                          : 'bg-ink-500/5 border-ink-500/10 text-ink-300'}
                      `}
                    >
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Call to Action */}
                <div className={`pt-8 border-t ${selectedAura === aura.id ? 'border-white/10' : 'border-ink-500/5'}`}>
                  <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all
                    ${selectedAura === aura.id ? 'text-gold-500 group-hover:gap-4' : 'text-ink-500 group-hover:text-gold-600'}
                  `}>
                    Explorar Trajetória <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Systemic Trust Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-12 rounded-[3.5rem] bg-ink-500/5 border border-ink-500/5"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <Orbit className="w-10 h-10 text-gold-500 mx-auto" />
            <h3 className="text-3xl font-display text-ink-500">Arquitetura de Transição Auditável</h3>
            <p className="text-ink-300 font-medium">
              Não cuidamos de currículos. Criamos identidades globais irrevogáveis. O sistema de Auras Olcan utiliza processamento de rede para validar sua senioridade em territórios de alta complexidade.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuraShowcase;
