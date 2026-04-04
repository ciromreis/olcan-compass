import React from 'react';
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    className?: string;
}
export declare const GlassModal: React.FC<GlassModalProps>;
export {};
//# sourceMappingURL=GlassModal.d.ts.map