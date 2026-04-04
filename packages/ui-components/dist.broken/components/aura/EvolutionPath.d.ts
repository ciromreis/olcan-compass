/**
 * Evolution Path Visualization
 * Shows the 6-stage evolution journey with progress indicators
 */
import React from 'react';
export interface EvolutionStage {
    id: string;
    name: string;
    mark: string;
    level: number;
    unlocked: boolean;
    current: boolean;
    descriptor: string;
}
export interface EvolutionPathProps {
    currentStage: 'egg' | 'sprout' | 'young' | 'mature' | 'master' | 'legendary';
    currentLevel: number;
    archetype: string;
    onStageClick?: (stage: string) => void;
}
export declare const EvolutionPath: React.FC<EvolutionPathProps>;
//# sourceMappingURL=EvolutionPath.d.ts.map