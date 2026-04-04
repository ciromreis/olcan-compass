/**
 * Enhanced Aura Card - Olcan Compass v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */
import React from 'react';
import { type PresencePhenotype } from './ProceduralPresenceFigure';
export interface EnhancedAuraProps {
    aura: {
        id: string;
        name: string;
        archetype: string;
        level: number;
        xp: number;
        xpToNext: number;
        evolutionStage: 'egg' | 'sprout' | 'young' | 'mature' | 'master' | 'legendary';
        currentHealth: number;
        maxHealth: number;
        energy: number;
        maxEnergy: number;
        stats: {
            power: number;
            wisdom: number;
            charisma: number;
            agility: number;
        };
    };
    size?: 'small' | 'medium' | 'large';
    showStats?: boolean;
    showProgress?: boolean;
    interactive?: boolean;
    onInteract?: () => void;
    phenotype?: PresencePhenotype;
}
export declare const EnhancedAuraCard: React.FC<EnhancedAuraProps>;
//# sourceMappingURL=EnhancedAuraCard.d.ts.map