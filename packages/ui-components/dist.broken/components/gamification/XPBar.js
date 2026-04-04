"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils';
export const XPBar = ({ current, max, size = 'md', animated = true, showLabel = true, className }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };
    return (_jsxs("div", { className: cn('w-full', className), children: [showLabel && (_jsxs("div", { className: "flex items-center justify-between text-xs text-foreground/60 mb-1", children: [_jsx("span", { children: "XP" }), _jsxs("span", { children: [current, " / ", max] })] })), _jsxs("div", { className: cn('w-full bg-foreground/10 rounded-full overflow-hidden relative', sizeClasses[size]), children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20" }), _jsx(motion.div, { className: "h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full relative overflow-hidden", initial: { width: 0 }, animate: { width: `${percentage}%` }, transition: {
                            duration: animated ? 1.5 : 0,
                            ease: "easeOut"
                        }, children: animated && (_jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent", animate: { x: ['-100%', '100%'] }, transition: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            } })) }), animated && percentage > 0 && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none", animate: {
                            opacity: [0.3, 0.6, 0.3],
                        }, transition: {
                            duration: 2,
                            repeat: Infinity,
                        }, style: {
                            background: `radial-gradient(circle at ${percentage}% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)`
                        } }))] })] }));
};
