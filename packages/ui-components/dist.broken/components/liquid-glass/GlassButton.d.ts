import React from 'react';
interface GlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
export declare const GlassButton: React.FC<GlassButtonProps>;
export {};
//# sourceMappingURL=GlassButton.d.ts.map