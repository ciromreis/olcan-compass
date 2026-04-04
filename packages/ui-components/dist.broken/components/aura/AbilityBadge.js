"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Zap, Shield, Star } from 'lucide-react';
import { cn } from '../../utils';
export const AbilityBadge = ({ ability, size = 'md', interactive = false, selected = false, onClick, className }) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };
    const getAbilityIcon = (type) => {
        switch (type) {
            case 'active':
                return _jsx(Zap, { className: "w-3 h-3" });
            case 'passive':
                return _jsx(Shield, { className: "w-3 h-3" });
            case 'ultimate':
                return _jsx(Star, { className: "w-3 h-3" });
            default:
                return _jsx(Zap, { className: "w-3 h-3" });
        }
    };
    const getAbilityColor = (type) => {
        switch (type) {
            case 'active':
                return 'bg-red-100/20 border-red-200/30 text-red-300';
            case 'passive':
                return 'bg-blue-100/20 border-blue-200/30 text-blue-300';
            case 'ultimate':
                return 'bg-purple-100/20 border-purple-200/30 text-purple-300';
            default:
                return 'bg-gray-100/20 border-gray-200/30 text-gray-300';
        }
    };
    return (_jsxs(motion.button, { className: cn('inline-flex items-center gap-1.5 rounded-full border transition-all duration-200', sizeClasses[size], getAbilityColor(ability.type), interactive && 'hover:scale-105 cursor-pointer', selected && 'ring-2 ring-companion-primary ring-offset-2 ring-offset-background', className), onClick: onClick, whileHover: interactive ? { scale: 1.05 } : undefined, whileTap: interactive ? { scale: 0.95 } : undefined, children: [getAbilityIcon(ability.type), _jsx("span", { className: "font-medium", children: ability.name }), ability.unlockLevel && (_jsxs("span", { className: "text-xs opacity-70", children: ["Lv.", ability.unlockLevel] }))] }));
};
