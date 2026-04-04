import React from 'react';
export interface PresencePhenotype {
    routeLabel?: string;
    routeCount?: number;
    activeRouteProgress?: number;
    urgencyLevel?: number;
    interviewReadiness?: number;
    documentReadiness?: number;
    logisticsReadiness?: number;
    adaptationLevel?: number;
}
interface ProceduralPresenceFigureProps {
    primary: string;
    secondary: string;
    stageName: string;
    stageMotif: string;
    accentClass: string;
    sizeClass: string;
    phenotype?: PresencePhenotype;
}
export declare const ProceduralPresenceFigure: React.FC<ProceduralPresenceFigureProps>;
export {};
//# sourceMappingURL=ProceduralPresenceFigure.d.ts.map