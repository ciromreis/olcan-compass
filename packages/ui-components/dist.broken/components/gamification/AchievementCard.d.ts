import React from 'react';
interface AchievementCardProps {
    achievement: {
        id: string;
        name: string;
        description: string;
        icon: React.ReactNode;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        unlocked: boolean;
        progress?: number;
        maxProgress?: number;
        unlockedAt?: string;
    };
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onClick?: () => void;
    className?: string;
}
export declare const AchievementCard: React.FC<AchievementCardProps>;
export {};
//# sourceMappingURL=AchievementCard.d.ts.map