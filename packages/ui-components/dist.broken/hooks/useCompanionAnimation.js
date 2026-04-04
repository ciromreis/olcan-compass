import { useState } from 'react';
export const useCompanionAnimation = ({ companionType, evolutionStage, isActive = false }) => {
    const [animationState, setAnimationState] = useState('idle');
    const [mood, setMood] = useState('happy');
    // Evolution stage animations
    const getEvolutionAnimation = () => {
        const animations = {
            egg: {
                float: { y: [0, -8, 0], rotate: [0, -1, 0] },
                scale: { scale: [1, 1.05, 1] },
                duration: 4
            },
            sprout: {
                float: { y: [0, -12, 0], rotate: [0, 2, 0] },
                scale: { scale: [1, 1.1, 1] },
                duration: 3.5
            },
            young: {
                float: { y: [0, -15, 0], rotate: [0, -2, 0] },
                scale: { scale: [1, 1.15, 1] },
                duration: 3
            },
            mature: {
                float: { y: [0, -10, 0], rotate: [0, 1, 0] },
                scale: { scale: [1, 1.08, 1] },
                duration: 4.5
            },
            master: {
                float: { y: [0, -20, 0], rotate: [0, -3, 0] },
                scale: { scale: [1, 1.2, 1] },
                duration: 2.5
            },
            legendary: {
                float: { y: [0, -25, 0], rotate: [0, 5, 0] },
                scale: { scale: [1, 1.25, 1] },
                duration: 2
            }
        };
        return animations[evolutionStage] || animations.egg;
    };
    // Mood-based animations
    const getMoodAnimation = () => {
        const moodAnimations = {
            happy: {
                bounce: { y: [0, -5, 0] },
                rotate: { rotate: [0, 5, 0, -5, 0] },
                duration: 2
            },
            excited: {
                bounce: { y: [0, -10, 0] },
                rotate: { rotate: [0, 10, 0, -10, 0] },
                scale: { scale: [1, 1.1, 1] },
                duration: 1.5
            },
            sleepy: {
                bounce: { y: [0, -2, 0] },
                rotate: { rotate: [0, 1, 0, -1, 0] },
                duration: 5
            },
            focused: {
                bounce: { y: [0, -3, 0] },
                rotate: { rotate: [0, 0, 0] },
                duration: 3
            }
        };
        return moodAnimations[mood];
    };
    // Companion type specific animations
    const getTypeAnimation = () => {
        const typeAnimations = {
            strategist: { rotate: [0, -2, 0], duration: 4 },
            innovator: { rotate: [0, 3, 0], duration: 3 },
            creator: { rotate: [0, -1, 0], duration: 5 },
            diplomat: { rotate: [0, 2, 0], duration: 4.5 },
            pioneer: { rotate: [0, -3, 0], duration: 3.5 },
            scholar: { rotate: [0, 1, 0], duration: 6 }
        };
        return typeAnimations[companionType] || typeAnimations.strategist;
    };
    // Combined animation
    const evolutionAnimation = getEvolutionAnimation();
    const moodAnimation = getMoodAnimation();
    const typeAnimation = getTypeAnimation();
    const animation = isActive ? {
        ...evolutionAnimation.float,
        ...moodAnimation.bounce,
        transition: {
            duration: Math.min(evolutionAnimation.duration, moodAnimation.duration),
            repeat: Infinity,
            ease: "easeInOut"
        }
    } : {};
    // Particle effects for higher evolution stages
    const getParticleCount = () => {
        const particleCounts = {
            egg: 0,
            sprout: 3,
            young: 5,
            mature: 8,
            master: 12,
            legendary: 20
        };
        return particleCounts[evolutionStage] || 0;
    };
    // Glow intensity based on evolution stage
    const getGlowIntensity = () => {
        const glowIntensities = {
            egg: 0.1,
            sprout: 0.3,
            young: 0.5,
            mature: 0.7,
            master: 0.9,
            legendary: 1
        };
        return glowIntensities[evolutionStage] || 0.1;
    };
    return {
        animation,
        animationState,
        setAnimationState,
        mood,
        setMood,
        particleCount: getParticleCount(),
        glowIntensity: getGlowIntensity(),
        evolutionAnimation,
        moodAnimation,
        typeAnimation
    };
};
