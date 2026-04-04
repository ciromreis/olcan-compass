import React from 'react';
import { CompanionType, EvolutionStage, CompanionRoute } from '../../types/companion';
interface NanoBananaImageProps {
    archetype: CompanionType;
    stage: EvolutionStage;
    route?: CompanionRoute;
    className?: string;
    size?: number;
}
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
export declare const NanoBananaImage: React.FC<NanoBananaImageProps>;
export {};
//# sourceMappingURL=NanoBananaImage.d.ts.map