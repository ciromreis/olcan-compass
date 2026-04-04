import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Check, Lock, Orbit } from 'lucide-react';
const EVOLUTION_STAGES = [
    { id: 'egg', name: 'Semente', mark: '01', level: 1, unlocked: true, current: false, descriptor: 'núcleo latente' },
    { id: 'sprout', name: 'Traço', mark: '02', level: 5, unlocked: false, current: false, descriptor: 'primeiro contorno' },
    { id: 'young', name: 'Figura', mark: '03', level: 15, unlocked: false, current: false, descriptor: 'mistura visível' },
    { id: 'mature', name: 'Entidade', mark: '04', level: 30, unlocked: false, current: false, descriptor: 'assinatura própria' },
    { id: 'master', name: 'Insígnia', mark: '05', level: 50, unlocked: false, current: false, descriptor: 'presença calibrada' },
    { id: 'legendary', name: 'Ressonância', mark: '06', level: 75, unlocked: false, current: false, descriptor: 'eco memorável' }
];
export const EvolutionPath = ({ currentStage, currentLevel, archetype, onStageClick }) => {
    const stages = EVOLUTION_STAGES.map(stage => ({
        ...stage,
        unlocked: currentLevel >= stage.level,
        current: stage.id === currentStage
    }));
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-foreground/70 backdrop-blur-md", children: [_jsx(Orbit, { className: "h-3.5 w-3.5" }), "Recomposi\u00E7\u00E3o visual"] }), _jsx("h3", { className: "text-2xl font-bold text-foreground mb-2", children: "Sequ\u00EAncia de recombina\u00E7\u00E3o" }), _jsx("p", { className: "text-foreground/60", children: "A leitura da presen\u00E7a muda conforme o uso, a cad\u00EAncia e o contexto" })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-0 right-0 top-12 hidden h-1 bg-foreground/10 lg:block", children: _jsx(motion.div, { className: "h-full bg-gradient-to-r from-slate-300 via-companion-primary to-companion-secondary", initial: { width: '0%' }, animate: {
                                width: `${(stages.findIndex(s => s.current) / (stages.length - 1)) * 100}%`
                            }, transition: { duration: 1, ease: 'easeOut' } }) }), _jsx("div", { className: "relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: stages.map((stage, index) => (_jsx(StageNode, { stage: stage, index: index, onClick: () => onStageClick?.(stage.id) }, stage.id))) })] }), _jsx("div", { className: "mt-8 rounded-[28px] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(241,245,249,0.66))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(226,232,240,0.72))] text-xl font-bold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]", children: stages.find(s => s.current)?.mark }), _jsxs("div", { className: "flex-1", children: [_jsxs("h4", { className: "text-xl font-bold text-foreground mb-1", children: ["Leitura atual: ", stages.find(s => s.current)?.name] }), _jsxs("p", { className: "text-foreground/60 mb-2", children: ["N\u00EDvel ", currentLevel, " \u2022 ", archetype] }), _jsx("p", { className: "text-sm text-foreground/75", children: stages.find(s => s.current)?.descriptor }), stages.findIndex(s => s.current) < stages.length - 1 && (_jsx("div", { className: "flex items-center gap-2 text-sm text-foreground/80", children: _jsxs("span", { children: ["Pr\u00F3xima leitura no n\u00EDvel ", stages[stages.findIndex(s => s.current) + 1]?.level] }) }))] })] }) })] }));
};
const StageNode = ({ stage, index, onClick }) => {
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "flex flex-col items-center", children: _jsxs(motion.button, { onClick: onClick, whileHover: { scale: stage.unlocked ? 1.03 : 1 }, whileTap: { scale: stage.unlocked ? 0.95 : 1 }, className: `
          relative z-10 w-full rounded-[24px]
          flex flex-col items-center justify-center gap-3
          px-3 py-4
          transition-all duration-300
          ${stage.current
                ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(219,234,254,0.86))] shadow-[0_18px_40px_rgba(37,99,235,0.18)]'
                : stage.unlocked
                    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,245,249,0.72))] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(235,242,250,0.8))]'
                    : 'bg-foreground/5'}
          ${stage.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
          border ${stage.current ? 'border-white/90' : 'border-white/25'}
        `, disabled: !stage.unlocked, children: [_jsx("div", { className: "pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)]" }), stage.unlocked ? (_jsxs("div", { className: "relative flex h-16 w-16 items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 rounded-full border border-white/35 bg-[conic-gradient(from_130deg,rgba(255,255,255,0.82),rgba(148,163,184,0.28),rgba(37,99,235,0.18),rgba(255,255,255,0.7))]" }), _jsx("div", { className: "absolute inset-[18%] rounded-full border border-white/45 bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(226,232,240,0.82)_68%,rgba(148,163,184,0.26)_100%)]" }), _jsx("span", { className: "relative text-sm font-bold tracking-[0.25em] text-slate-700", children: stage.mark })] })) : (_jsx(Lock, { className: "w-8 h-8 text-foreground/30" })), stage.current && (_jsx(motion.div, { className: "absolute inset-0 rounded-[24px] border border-white/80", animate: { scale: [1, 1.2, 1], opacity: [1, 0, 1] }, transition: { duration: 2, repeat: Infinity } })), stage.unlocked && !stage.current && (_jsx("div", { className: "absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-4 h-4 text-white" }) })), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-sm font-semibold ${stage.current ? 'text-companion-primary' : stage.unlocked ? 'text-foreground' : 'text-foreground/40'}`, children: stage.name }), _jsx("div", { className: "mt-1 text-[11px] uppercase tracking-[0.18em] text-foreground/55", children: stage.descriptor }), _jsxs("div", { className: "mt-2 text-xs text-foreground/60", children: ["Nv. ", stage.level] })] })] }) }));
};
