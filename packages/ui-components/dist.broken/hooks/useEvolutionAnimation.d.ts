export declare const useEvolutionAnimation: ({ isEvolving }: {
    isEvolving?: boolean;
}) => {
    animationPhase: "idle" | "evolving" | "complete";
    evolutionProgress: number;
    evolutionAnimation: {
        scale: number[];
        rotate: number[];
        opacity: number[];
        duration: number;
        ease: string;
    };
    particleAnimation: {
        initial: {
            opacity: number;
            scale: number;
            y: number;
        };
        animate: {
            opacity: number[];
            scale: number[];
            y: number[];
        };
        transition: {
            duration: number;
            repeat: number;
            delay: number;
        };
    };
    lightBeamAnimation: {
        initial: {
            opacity: number;
            scaleY: number;
        };
        animate: {
            opacity: number[];
            scaleY: number[];
        };
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
    glowAnimation: {
        animate: {
            opacity: number[];
            scale: number[];
        };
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
    isAnimating: boolean;
};
//# sourceMappingURL=useEvolutionAnimation.d.ts.map