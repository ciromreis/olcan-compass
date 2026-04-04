"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils';
export const GlassCard = ({ children, className, variant = 'default', rounded = 'lg', padding = 'md', shadow = true, border = true, hover = false, animated = true, onMouseEnter, onMouseLeave, onClick }) => {
    const variantClasses = {
        default: 'bg-white/60 backdrop-blur-2xl',
        dark: 'bg-navy-900/80 backdrop-blur-2xl',
        light: 'bg-white/40 backdrop-blur-xl',
        olcan: 'bg-gradient-to-br from-cream-50/90 to-white/80 backdrop-blur-2xl'
    };
    const roundedClasses = {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl'
    };
    const paddingClasses = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
    };
    return (_jsxs(motion.div, { onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onClick: onClick, className: cn('relative overflow-hidden', variantClasses[variant], roundedClasses[rounded], paddingClasses[padding], shadow && 'shadow-[0_8px_32px_rgba(10,13,26,0.1),0_2px_8px_rgba(10,13,26,0.05)]', border && 'border border-white/30', hover && 'hover:scale-[1.01] hover:shadow-[0_16px_48px_rgba(10,13,26,0.15),0_4px_16px_rgba(10,13,26,0.08)] transition-all duration-300', className), animate: animated ? {
            y: [0, -3, 0],
        } : undefined, transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-navy-900/5 pointer-events-none" }), _jsx("div", { className: "absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(10,13,26,0.05)] pointer-events-none rounded-[inherit]" }), _jsx("div", { className: "absolute inset-0 opacity-[0.015] pointer-events-none", style: {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                } }), _jsx("div", { className: "relative z-10", children: children })] }));
};
