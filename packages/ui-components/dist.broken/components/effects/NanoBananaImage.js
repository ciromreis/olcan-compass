import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { COMPANION_THEMES, STAGE_DESCRIPTIONS, ROUTE_THEMES } from './NanoBananaThemes';
/**
 * NanoBananaImage Component (v2.5)
 *
 * Integrates with Google's Nano Banana image generation engine to provide
 * high-end, ethereal career companions.
 *
 * Logic Weave:
 * - Prompt builds from Archetype + Stage + Career Route.
 * - Route adds specific "career gear" (e.g., academic scrolls vs. corporate armor).
 */
export const NanoBananaImage = ({ archetype, stage, route = 'academic', className, size = 200 }) => {
    const prompt = useMemo(() => {
        const stageDesc = STAGE_DESCRIPTIONS[stage];
        const theme = COMPANION_THEMES[archetype] || COMPANION_THEMES.strategist;
        const routeDecor = ROUTE_THEMES[route] || ROUTE_THEMES.academic;
        return `Professional digital companion, ${stageDesc}. Species: ${theme.species}. Palette: ${theme.colors}. Traits: ${theme.traits}. Career Gear: ${routeDecor}. Aesthetic: Liquid-Glass, translucent, high-end 3D octane render, ethereal lighting, minimalist premium background, 8k resolution, Google Nano Banana style.`;
    }, [archetype, stage, route]);
    // Placeholder Unsplash mapping for aesthetic demonstration
    const placeholderUrl = `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=${size}&auto=format&fit=crop`;
    return (_jsxs("div", { className: cn("relative group shrink-0", className), style: { width: size, height: size }, children: [_jsxs(motion.div, { className: "absolute inset-0 rounded-full bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden ring-1 ring-white/10", initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1, ease: "backOut" }, children: [_jsx(motion.img, { src: placeholderUrl, alt: prompt, className: "w-full h-full object-cover opacity-60 mix-blend-plus-lighter group-hover:scale-105 transition-transform duration-1000" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-[#001338]/20 via-transparent to-white/30 pointer-events-none" }), _jsx("div", { className: "absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" }), _jsx("div", { className: "absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" })] }), _jsx(motion.div, { className: "absolute -inset-2 -z-10 rounded-full opacity-40 blur-xl bg-[#001338]/5", animate: {
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } })] }));
};
