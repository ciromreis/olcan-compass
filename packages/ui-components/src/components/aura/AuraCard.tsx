"use client";

import React from 'react';
import { cn } from '../../utils';
import { Companion } from '../../types/companion';
import { CompanionAvatar } from './CompanionAvatar';
import { GlassCard } from '../liquid-glass/GlassCard';
import { getArchetypeInfo, getEvolutionStageInfo } from '../../../../apps/app-compass-v2/src/stores/companionStore';

interface CompanionCardProps {
  companion: Companion;
  onCare?: () => void;
  onEvolve?: () => void;
  className?: string;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  companion,
  onCare,
  onEvolve,
  className
}) => {
  const archetypeInfo = getArchetypeInfo(companion.type);
  const stageInfo = getEvolutionStageInfo(companion.evolutionStage);

  return (
    <GlassCard 
      variant="olcan" 
      padding="xl" 
      hover 
      className={cn("w-full max-w-md border-[#001338]/10 overflow-hidden", className)}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Header with Route Tag */}
        <div className="w-full flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-heading text-h3 text-[#001338] leading-tight">{companion.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#001338]/5 text-[#001338]/60 text-caption font-bold uppercase tracking-widest">
                Lvl {companion.level} {archetypeInfo.name}
              </span>
              {companion.currentRoute && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-caption font-bold uppercase tracking-widest border border-emerald-100">
                  Rota {companion.currentRoute}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-caption font-bold text-[#001338]/40 uppercase tracking-tighter">Estágio</p>
            <p className="text-body-sm font-semibold text-[#001338]">{stageInfo.name}</p>
          </div>
        </div>

        {/* AI Avatar */}
        <CompanionAvatar 
          companion={companion} 
          size={180} 
          className="drop-shadow-2xl" 
          showEvolveEffect
        />

        {/* Stats Summary */}
        <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-[#001338]/5">
          <div className="space-y-1">
            <div className="flex justify-between text-caption font-bold uppercase tracking-widest text-[#001338]/40">
              <span>Energia</span>
              <span>{companion.energy}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#001338]/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${companion.energy}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-caption font-bold uppercase tracking-widest text-[#001338]/40">
              <span>XP</span>
              <span>{Math.round((companion.xp / companion.xpToNext) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#001338]/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#001338]" style={{ width: `${(companion.xp / companion.xpToNext) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCare}
            className="px-4 py-2.5 rounded-xl border border-[#001338]/10 text-[#001338] font-heading font-semibold text-body-sm hover:bg-[#001338]/5 transition-all"
          >
            Cuidar
          </button>
          <button
            onClick={onEvolve}
            disabled={companion.xp < companion.xpToNext}
            className="px-4 py-2.5 rounded-xl bg-[#001338] text-white font-heading font-semibold text-body-sm hover:shadow-lg hover:shadow-[#001338]/20 transition-all disabled:opacity-30"
          >
            Evoluir
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
