import React from 'react';
import { Companion, EvolutionStage } from '../../types/companion';
interface EvolutionViewerProps {
    companion: Companion;
    currentStage: EvolutionStage;
    nextStage?: EvolutionStage;
    onEvolve?: () => void;
    className?: string;
}
export declare const EvolutionViewer: React.FC<EvolutionViewerProps>;
export {};
//# sourceMappingURL=EvolutionViewer.d.ts.map