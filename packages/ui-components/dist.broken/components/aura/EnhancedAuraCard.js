import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Aura Card - Olcan Compass v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Star, TrendingUp, Orbit } from 'lucide-react';
import { ProceduralPresenceFigure } from './ProceduralPresenceFigure';
/**
 * ARCHETYPE_THEMES - SOBER V2.5
 * Using Gold, Silver, and Ink instead of generic blues/greens.
 */
const ARCHETYPE_THEMES = {
    individual_sovereignty: { primary: '#D4AF37', secondary: '#0A0A0B', mood: 'Definitivo' }, // Escapee
    academic_elite: { primary: '#7E8CA3', secondary: '#F9F6F0', mood: 'Erudito' }, // Scholar
    career_mastery: { primary: '#4D4D51', secondary: '#D4AF37', mood: 'Evolutivo' }, // Pivot
    global_presence: { primary: '#D4AF37', secondary: '#7E8CA3', mood: 'Livre' }, // Nomad
    frontier_architect: { primary: '#0A0A0B', secondary: '#ADB5BD', mood: 'Estrutural' }, // Bridge
    verified_talent: { primary: '#7E8CA3', secondary: '#F9F6F0', mood: 'Certificado' }, // DEV
    future_guardian: { primary: '#D4AF37', secondary: '#F9F6F0', mood: 'Protetor' }, // Mother
    change_agent: { primary: '#4D4D51', secondary: '#ADB5BD', mood: 'Impacto' }, // Servant
    knowledge_node: { primary: '#7E8CA3', secondary: '#0A0A0B', mood: 'Verdade' }, // Hermit
    conscious_leader: { primary: '#D4AF37', secondary: '#0A0A0B', mood: 'Sóbrio' }, // Refugee
    cultural_protagonist: { primary: '#7E8CA3', secondary: '#D4AF37', mood: 'Expressivo' }, // Visionary
    destiny_arbitrator: { primary: '#0A0A0B', secondary: '#F9F6F0', mood: 'Eficiente' } // Optimizer
};
const STAGE_DISPLAY = {
    egg: { name: 'Semente', accent: 'from-gold-100 to-gold-400' },
    sprout: { name: 'Traço', accent: 'from-silver-100 to-silver-400' },
    young: { name: 'Figura', accent: 'from-slate-200 to-slate-500' },
    mature: { name: 'Entidade', accent: 'from-ink-300 to-ink-600' },
    master: { name: 'Insígnia', accent: 'from-gold-300 to-gold-600' },
    legendary: { name: 'Ressonância', accent: 'from-white via-gold-200 to-silver-300' }
};
const ARCHETYPE_LABELS = {
    individual_sovereignty: 'Soberania Individual',
    academic_elite: 'Elite Acadêmica',
    career_mastery: 'Maestria de Carreira',
    global_presence: 'Presença Global',
    frontier_architect: 'Arquiteto de Fronteira',
    verified_talent: 'Talento Validado',
    future_guardian: 'Guardiã do Futuro',
    change_agent: 'Agente de Mudança',
    knowledge_node: 'Nó de Conhecimento',
    conscious_leader: 'Liderança Consciente',
    cultural_protagonist: 'Protagonista Cultural',
    destiny_arbitrator: 'Arbitrador de Destino'
};
export const EnhancedAuraCard = memo(({ aura, size = 'medium', showStats = true, showProgress = true, interactive = true, onInteract, phenotype, }) => {
    const theme = ARCHETYPE_THEMES[aura.archetype] || ARCHETYPE_THEMES.individual_sovereignty;
    const stage = STAGE_DISPLAY[aura.evolutionStage];
    const sizeClasses = {
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8'
    };
    const glyphSizes = {
        small: 'h-40 w-40',
        medium: 'h-52 w-52',
        large: 'h-64 w-64'
    };
    return (_jsxs(motion.div, { whileHover: interactive ? { y: -4, transition: { duration: 0.3, ease: 'easeOut' } } : {}, whileTap: interactive ? { scale: 0.99 } : {}, onClick: onInteract, className: `
        relative overflow-hidden rounded-[2rem]
        bg-surface-card backdrop-blur-2xl border border-white/40
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer' : ''}
        shadow-card hover:shadow-card-hover transition-all duration-500
      `, children: [_jsx("div", { className: "absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none" }), _jsx("div", { className: "absolute -bottom-16 -left-16 w-48 h-48 bg-silver-500/5 rounded-full blur-[60px] pointer-events-none" }), _jsxs("div", { className: "relative z-10 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-start justify-between mb-8", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-500/5 border border-ink-500/10 text-[10px] font-bold uppercase tracking-widest text-ink-300", children: [_jsx(Orbit, { className: "h-3 w-3 text-gold-500" }), "Manifesto de Identidade"] }), _jsx("h3", { className: "text-3xl font-display text-ink-500 tracking-tight", children: aura.name }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-300/80", children: [_jsx("span", { className: "font-semibold text-gold-600", children: stage.name }), _jsx("span", { className: "w-1 h-1 rounded-full bg-ink-100" }), _jsx("span", { children: ARCHETYPE_LABELS[aura.archetype] || aura.archetype })] })] }), _jsxs("div", { className: "flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold-500/10 border border-gold-500/20", children: [_jsx(Star, { className: "w-4 h-4 text-gold-600 fill-gold-600" }), _jsxs("span", { className: "text-gold-700 font-bold text-sm", children: ["N\u00EDvel ", aura.level] })] })] }), _jsx("div", { className: "flex-1 flex justify-center items-center py-6", children: _jsx(ProceduralPresenceFigure, { sizeClass: glyphSizes[size], primary: theme.primary, secondary: theme.secondary, stageName: stage.name, stageMotif: stage.name, accentClass: stage.accent, phenotype: phenotype }) }), _jsxs("div", { className: "mt-auto space-y-6", children: [showProgress && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-[11px] font-bold uppercase tracking-wider text-ink-300", children: [_jsx("span", { children: "Densidade de Experi\u00EAncia" }), _jsxs("span", { className: "text-gold-600", children: [Math.round((aura.xp / aura.xpToNext) * 100), "%"] })] }), _jsx("div", { className: "h-1.5 bg-ink-500/5 rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-gold-500", initial: { width: 0 }, animate: { width: `${(aura.xp / aura.xpToNext) * 100}%` }, transition: { duration: 1.5, ease: [0.23, 1, 0.32, 1] } }) })] })), showStats && (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: _jsx(Shield, { className: "w-3.5 h-3.5" }), label: "Resili\u00EAncia", value: aura.stats.power }), _jsx(StatItem, { icon: _jsx(Star, { className: "w-3.5 h-3.5" }), label: "Eloqu\u00EAncia", value: aura.stats.charisma }), _jsx(StatItem, { icon: _jsx(Zap, { className: "w-3.5 h-3.5" }), label: "Intelecto", value: aura.stats.wisdom }), _jsx(StatItem, { icon: _jsx(TrendingUp, { className: "w-3.5 h-3.5" }), label: "Tra\u00E7\u00E3o", value: aura.stats.agility })] }))] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none bg-noise-texture opacity-[0.03]" })] }));
});
EnhancedAuraCard.displayName = 'EnhancedAuraCard';
const StatItem = ({ icon, label, value }) => (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-300", children: [icon, _jsx("span", { children: label })] }), _jsx("div", { className: "text-lg font-display text-ink-500", children: value })] }));
