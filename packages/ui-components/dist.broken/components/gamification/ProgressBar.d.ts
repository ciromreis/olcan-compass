import React from 'react';
interface ProgressBarProps {
    value: number;
    max: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    animated?: boolean;
    showLabel?: boolean;
    className?: string;
}
export declare const ProgressBar: React.FC<ProgressBarProps>;
export {};
//# sourceMappingURL=ProgressBar.d.ts.map