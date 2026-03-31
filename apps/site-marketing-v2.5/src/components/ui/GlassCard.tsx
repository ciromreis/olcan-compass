"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animated?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  animated = false 
}: GlassCardProps) {
  const Component = animated ? motion.div : 'div';
  
  return (
    <Component
      className={cn(
        "bg-white/70 backdrop-blur-xl",
        "border border-white/30",
        "shadow-[0_8px_32px_rgba(1,19,56,0.1)]",
        "rounded-2xl p-6",
        hover && "hover:shadow-[0_16px_48px_rgba(1,19,56,0.15)] transition-all duration-300",
        className
      )}
      {...(animated && {
        whileHover: { y: -5 },
        transition: { duration: 0.3 }
      })}
    >
      {children}
    </Component>
  );
}
