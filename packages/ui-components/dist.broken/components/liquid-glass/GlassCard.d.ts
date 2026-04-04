import React from 'react';
interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'dark' | 'light' | 'olcan';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadow?: boolean;
    border?: boolean;
    hover?: boolean;
    animated?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
}
export declare const GlassCard: React.FC<GlassCardProps>;
export {};
//# sourceMappingURL=GlassCard.d.ts.map