"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';
export const GlassModal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, closeOnBackdrop = true, className }) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl'
    };
    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-50 flex items-center justify-center p-4", onClick: handleBackdropClick, children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: cn('relative w-full liquid-glass rounded-2xl border border-white/20 shadow-2xl overflow-hidden', sizeClasses[size], className), children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-white/10", children: [title && (_jsx("h2", { className: "text-xl font-semibold text-foreground", children: title })), showCloseButton && (_jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-white/10 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-foreground/60" }) }))] })), _jsx("div", { className: "p-6", children: children })] })] })) }));
};
