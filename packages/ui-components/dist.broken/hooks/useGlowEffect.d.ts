interface UseGlowEffectProps {
    isActive: boolean;
    color?: string;
    intensity?: 'low' | 'medium' | 'high';
}
export declare const useGlowEffect: ({ isActive, color, intensity }: UseGlowEffectProps) => {
    isGlowing: boolean;
    glowIntensity: "medium" | "low" | "high";
    triggerGlow: () => void;
    glowStyle: {
        background: string;
        opacity: number;
    };
    glowAnimation: {
        opacity: number[];
        scale: number[];
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    } | {
        opacity: number;
        scale: number;
        transition?: undefined;
    };
};
export {};
//# sourceMappingURL=useGlowEffect.d.ts.map