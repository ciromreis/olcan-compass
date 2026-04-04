import React from 'react';
interface GlassInputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
export declare const GlassInput: React.FC<GlassInputProps>;
export {};
//# sourceMappingURL=GlassInput.d.ts.map