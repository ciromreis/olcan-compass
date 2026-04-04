"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils';
export const ProgressBar = ({ value, max, size = 'md', color = 'primary', animated = true, showLabel = false, className }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };
    const colorClasses = {
        primary: 'bg-gradient-to-r from-companion-primary to-companion-secondary',
        secondary: 'bg-gradient-to-r from-blue-500 to-purple-500',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        error: 'bg-gradient-to-r from-red-500 to-pink-500'
    };
    return (_jsxs("div", { className: cn('w-full', className), children: [showLabel && (_jsxs("div", { className: "flex items-center justify-between text-xs text-foreground/60 mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [Math.round(percentage), "%"] })] })), _jsx("div", { className: cn('w-full bg-foreground/10 rounded-full overflow-hidden', sizeClasses[size]), children: _jsx(motion.div, { className: cn('h-full rounded-full', colorClasses[color]), initial: { width: 0 }, animate: { width: `${percentage}%` }, transition: {
                        duration: animated ? 1 : 0,
                        ease: "easeOut"
                    } }) })] }));
};
