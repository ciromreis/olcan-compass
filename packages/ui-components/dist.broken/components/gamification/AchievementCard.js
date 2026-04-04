"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Trophy, Star, Lock } from 'lucide-react';
import { cn } from '../../utils';
export const AchievementCard = ({ achievement, size = 'md', interactive = true, onClick, className }) => {
    const rarityColors = {
        common: 'border-gray-300/30 bg-gray-500/10',
        rare: 'border-blue-300/30 bg-blue-500/10',
        epic: 'border-purple-300/30 bg-purple-500/10',
        legendary: 'border-yellow-300/30 bg-yellow-500/10'
    };
    const rarityGradients = {
        common: 'from-gray-400 to-gray-600',
        rare: 'from-blue-400 to-blue-600',
        epic: 'from-purple-400 to-purple-600',
        legendary: 'from-yellow-400 to-yellow-600'
    };
    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    };
    return (_jsx(motion.div, { className: cn('liquid-glass rounded-xl border transition-all duration-300', rarityColors[achievement.rarity], sizeClasses[size], interactive && 'hover:scale-105 cursor-pointer', !achievement.unlocked && 'opacity-60', className), onClick: interactive && onClick ? onClick : undefined, whileHover: interactive ? { scale: 1.05 } : undefined, whileTap: interactive ? { scale: 0.95 } : undefined, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: cn('w-12 h-12 rounded-full flex items-center justify-center', achievement.unlocked
                        ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]}`
                        : 'bg-foreground/10'), children: achievement.unlocked ? (achievement.icon) : (_jsx(Lock, { className: "w-6 h-6 text-foreground/40" })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "font-semibold text-foreground", children: achievement.name }), achievement.rarity === 'legendary' && (_jsx(Trophy, { className: "w-4 h-4 text-yellow-400" })), achievement.rarity === 'epic' && (_jsx(Star, { className: "w-4 h-4 text-purple-400" }))] }), _jsx("p", { className: "text-sm text-foreground/60 mb-2", children: achievement.description }), achievement.progress !== undefined && achievement.maxProgress !== undefined && (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-foreground/60 mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [achievement.progress, " / ", achievement.maxProgress] })] }), _jsx("div", { className: "w-full h-1 bg-foreground/10 rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-gradient-to-r from-companion-primary to-companion-secondary rounded-full", initial: { width: 0 }, animate: { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }, transition: { duration: 1, ease: "easeOut" } }) })] })), achievement.unlocked && achievement.unlockedAt && (_jsxs("p", { className: "text-xs text-foreground/40 mt-2", children: ["Unlocked ", new Date(achievement.unlockedAt).toLocaleDateString()] }))] })] }) }));
};
