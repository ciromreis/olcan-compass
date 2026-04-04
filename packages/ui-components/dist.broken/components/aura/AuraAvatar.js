"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { NanoBananaImage } from '../effects/NanoBananaImage';
export const CompanionAvatar = ({ companion, route, size = 120, className, showEvolveEffect = false }) => {
    return (_jsxs("div", { className: cn('relative flex items-center justify-center', className), children: [_jsx(NanoBananaImage, { archetype: companion.type, stage: companion.evolutionStage, route: route || companion.currentRoute, size: size }), showEvolveEffect && companion.evolutionStage !== 'egg' && (_jsx(motion.div, { className: "absolute inset-0 -z-10 rounded-full blur-2xl opacity-40 bg-white/20", animate: {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2],
                }, transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                } }))] }));
};
