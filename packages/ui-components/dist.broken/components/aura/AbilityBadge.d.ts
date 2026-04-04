import React from 'react';
import { Ability } from '../../types/companion';
interface AbilityBadgeProps {
    ability: Ability;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}
export declare const AbilityBadge: React.FC<AbilityBadgeProps>;
export {};
//# sourceMappingURL=AbilityBadge.d.ts.map