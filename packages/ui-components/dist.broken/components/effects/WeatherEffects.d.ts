import React from 'react';
interface WeatherEffectsProps {
    enabled?: boolean;
    intensity?: 'light' | 'medium' | 'heavy';
    className?: string;
}
export declare const WeatherEffects: React.FC<WeatherEffectsProps>;
export declare const LightningEffect: React.FC<{
    enabled?: boolean;
}>;
export declare const WindEffect: React.FC<{
    enabled?: boolean;
}>;
export declare const CelestialBody: React.FC<{
    enabled?: boolean;
}>;
export {};
//# sourceMappingURL=WeatherEffects.d.ts.map