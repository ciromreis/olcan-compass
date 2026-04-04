import { CompanionType } from '../types/companion';
export interface ArchetypeColors {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    gradient: string;
    light: string;
    medium: string;
    dark: string;
}
export declare const companionColors: Record<CompanionType, ArchetypeColors>;
export declare const getCompanionColor: (type: CompanionType) => ArchetypeColors;
export declare const getCompanionGradient: (type: CompanionType) => string;
export declare const getCompanionGlowStyle: (type: CompanionType) => React.CSSProperties;
//# sourceMappingURL=companionColors.d.ts.map