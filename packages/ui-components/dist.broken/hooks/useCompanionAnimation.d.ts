interface UseCompanionAnimationProps {
    companionType: string;
    evolutionStage: string;
    isActive?: boolean;
}
export declare const useCompanionAnimation: ({ companionType, evolutionStage, isActive }: UseCompanionAnimationProps) => {
    animation: {};
    animationState: string;
    setAnimationState: import("react").Dispatch<import("react").SetStateAction<string>>;
    mood: "happy" | "excited" | "sleepy" | "focused";
    setMood: import("react").Dispatch<import("react").SetStateAction<"happy" | "excited" | "sleepy" | "focused">>;
    particleCount: number;
    glowIntensity: number;
    evolutionAnimation: {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        float: {
            y: number[];
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    };
    moodAnimation: {
        bounce: {
            y: number[];
        };
        rotate: {
            rotate: number[];
        };
        duration: number;
    } | {
        bounce: {
            y: number[];
        };
        rotate: {
            rotate: number[];
        };
        scale: {
            scale: number[];
        };
        duration: number;
    } | {
        bounce: {
            y: number[];
        };
        rotate: {
            rotate: number[];
        };
        duration: number;
    } | {
        bounce: {
            y: number[];
        };
        rotate: {
            rotate: number[];
        };
        duration: number;
    };
    typeAnimation: {
        rotate: number[];
        duration: number;
    } | {
        rotate: number[];
        duration: number;
    } | {
        rotate: number[];
        duration: number;
    } | {
        rotate: number[];
        duration: number;
    } | {
        rotate: number[];
        duration: number;
    } | {
        rotate: number[];
        duration: number;
    };
};
export {};
//# sourceMappingURL=useCompanionAnimation.d.ts.map