"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { Companion, CompanionRoute } from '../../types/companion';
import { NanoBananaImage } from '../effects/NanoBananaImage';

interface CompanionAvatarProps {
  companion: Companion;
  route?: CompanionRoute;
  size?: number;
  className?: string;
  showEvolveEffect?: boolean;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companion,
  route,
  size = 120,
  className,
  showEvolveEffect = false
}) => {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <NanoBananaImage 
        archetype={companion.type}
        stage={companion.evolutionStage}
        route={route || companion.currentRoute}
        size={size}
      />
      
      {showEvolveEffect && companion.evolutionStage !== 'egg' && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-40 bg-white/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};
