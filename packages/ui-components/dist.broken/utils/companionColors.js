export const companionColors = {
    strategist: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#fbbf24',
        glow: 'rgba(139, 92, 246, 0.6)',
        gradient: 'from-purple-600 to-purple-800',
        light: '#faf5ff',
        medium: '#d8b4fe',
        dark: '#6b21a8'
    },
    innovator: {
        primary: '#06b6d4',
        secondary: '#22d3ee',
        accent: '#fbbf24',
        glow: 'rgba(6, 182, 212, 0.6)',
        gradient: 'from-blue-600 to-blue-800',
        light: '#f0f9ff',
        medium: '#7dd3fc',
        dark: '#075985'
    },
    creator: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#fbbf24',
        glow: 'rgba(16, 185, 129, 0.6)',
        gradient: 'from-emerald-600 to-emerald-800',
        light: '#f0fdf4',
        medium: '#86efac',
        dark: '#166534'
    },
    diplomat: {
        primary: '#06b6d4',
        secondary: '#67e8f9',
        accent: '#3b82f6',
        glow: 'rgba(6, 182, 212, 0.6)',
        gradient: 'from-cyan-600 to-cyan-800',
        light: '#ecfeff',
        medium: '#67e8f9',
        dark: '#155e75'
    },
    pioneer: {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#fbbf24',
        glow: 'rgba(249, 115, 22, 0.6)',
        gradient: 'from-orange-600 to-orange-800',
        light: '#fff7ed',
        medium: '#fdba74',
        dark: '#9a3412'
    },
    scholar: {
        primary: '#6366f1',
        secondary: '#818cf8',
        accent: '#fbbf24',
        glow: 'rgba(99, 102, 241, 0.6)',
        gradient: 'from-indigo-600 to-indigo-800',
        light: '#eef2ff',
        medium: '#a5b4fc',
        dark: '#3730a3'
    },
    guardian: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#f59e0b',
        glow: 'rgba(16, 185, 129, 0.6)',
        gradient: 'from-emerald-600 to-emerald-800',
        light: '#f0fdf4',
        medium: '#86efac',
        dark: '#166534'
    },
    visionary: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#fbbf24',
        glow: 'rgba(139, 92, 246, 0.6)',
        gradient: 'from-purple-600 to-purple-800',
        light: '#faf5ff',
        medium: '#d8b4fe',
        dark: '#6b21a8'
    },
    academic: {
        primary: '#6366f1',
        secondary: '#818cf8',
        accent: '#fbbf24',
        glow: 'rgba(99, 102, 241, 0.6)',
        gradient: 'from-indigo-600 to-indigo-800',
        light: '#eef2ff',
        medium: '#a5b4fc',
        dark: '#3730a3'
    },
    communicator: {
        primary: '#06b6d4',
        secondary: '#67e8f9',
        accent: '#3b82f6',
        glow: 'rgba(6, 182, 212, 0.6)',
        gradient: 'from-cyan-600 to-cyan-800',
        light: '#ecfeff',
        medium: '#67e8f9',
        dark: '#155e75'
    },
    analyst: {
        primary: '#6366f1',
        secondary: '#818cf8',
        accent: '#fbbf24',
        glow: 'rgba(99, 102, 241, 0.6)',
        gradient: 'from-indigo-600 to-indigo-800',
        light: '#eef2ff',
        medium: '#a5b4fc',
        dark: '#3730a3'
    },
    luminary: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#fbbf24',
        glow: 'rgba(139, 92, 246, 0.6)',
        gradient: 'from-purple-600 to-purple-800',
        light: '#faf5ff',
        medium: '#d8b4fe',
        dark: '#6b21a8'
    }
};
export const getCompanionColor = (type) => {
    return companionColors[type] || companionColors.strategist;
};
export const getCompanionGradient = (type) => {
    const colors = getCompanionColor(type);
    return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
};
export const getCompanionGlowStyle = (type) => {
    const colors = getCompanionColor(type);
    return {
        background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
    };
};
