"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
export const EvolutionViewer = ({ companion, currentStage, nextStage, onEvolve, className }) => {
    const stages = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary'];
    const currentIndex = stages.indexOf(currentStage);
    const getStageIcon = (stage) => {
        const icons = {
            egg: '🥚',
            sprout: '🌱',
            young: '🌿',
            mature: '🌳',
            master: '⭐',
            legendary: '🌟'
        };
        return icons[stage];
    };
    const getStageName = (stage) => {
        const names = {
            egg: 'Egg',
            sprout: 'Sprout',
            young: 'Young',
            mature: 'Mature',
            master: 'Master',
            legendary: 'Legendary'
        };
        return names[stage];
    };
    const canEvolve = companion.xp >= companion.xpToNext && nextStage;
    return (_jsxs("div", { className: cn('liquid-glass rounded-2xl p-6', className), children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-4", children: "Evolution Journey" }), _jsx("div", { className: "flex items-center justify-between mb-6", children: stages.map((stage, index) => (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx(motion.div, { className: cn('w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300', index <= currentIndex
                                        ? 'border-companion-primary bg-companion-primary/20'
                                        : 'border-foreground/20 bg-foreground/5'), animate: index <= currentIndex ? {
                                        scale: [1, 1.1, 1],
                                    } : undefined, transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.2
                                    }, children: getStageIcon(stage) }), _jsx("span", { className: "text-xs text-foreground/60 mt-1", children: getStageName(stage) })] }), index < stages.length - 1 && (_jsx("div", { className: "flex-1 h-0.5 mx-2 bg-gradient-to-r from-companion-primary/20 to-transparent" }))] }, stage))) }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between p-4 liquid-glass rounded-xl border border-companion-primary/20", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-r from-companion-primary to-companion-secondary flex items-center justify-center text-white", children: getStageIcon(currentStage) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: getStageName(currentStage) }), _jsxs("p", { className: "text-sm text-foreground/60", children: ["Level ", companion.level, " \u2022 ", companion.xp, " XP"] })] })] }) }), canEvolve && onEvolve && (_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: onEvolve, className: "w-full py-3 bg-gradient-to-r from-companion-primary to-companion-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4" }), "Evolve to ", getStageName(nextStage), _jsx(ArrowRight, { className: "w-4 h-4" })] })), !canEvolve && nextStage && (_jsxs("div", { className: "p-4 liquid-glass rounded-xl border border-foreground/20", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Evolution Requirements" }), _jsxs("div", { className: "space-y-2 text-sm text-foreground/60", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Level Required:" }), _jsx("span", { className: "font-medium", children: companion.level + 1 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "XP Required:" }), _jsx("span", { className: "font-medium", children: companion.xpToNext })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Current XP:" }), _jsx("span", { className: cn('font-medium', companion.xp >= companion.xpToNext ? 'text-green-400' : 'text-foreground/80'), children: companion.xp })] })] })] }))] })] }));
};
