/** @type {import('tailwindcss').Config} */
import tokens from './src/design-tokens.json' assert { type: 'json' }

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          ...tokens.colors.void,
          DEFAULT: '#001338',
        },
        abyss: '#000A1A',
        lux: tokens.colors.lux,
        lumina: tokens.colors.lumina,
        ignis: tokens.colors.ignis,
        neutral: tokens.colors.neutral,
        // Liquid Glass palette
        'primary-blue': '#2094F3',
        cyan: {
          DEFAULT: '#00F2FF',
          50: 'rgba(0, 242, 255, 0.05)',
          100: 'rgba(0, 242, 255, 0.10)',
          200: 'rgba(0, 242, 255, 0.20)',
          300: 'rgba(0, 242, 255, 0.30)',
          400: '#33F5FF',
          500: '#00F2FF',
          600: '#00C2CC',
          700: '#009199',
          800: '#006166',
          900: '#003033',
        },
        silver: '#E2E8F0',
        slate: {
          DEFAULT: '#94A3B8',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
        },
        success: tokens.colors.semantic.success,
        warning: tokens.colors.semantic.warning,
        error: tokens.colors.semantic.error,
        info: tokens.colors.semantic.info,
        mirror: tokens.colors.semantic.mirror,
      },
      fontFamily: {
        heading: ['Merriweather Sans', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': [tokens.typography.scale.h1.desktop, { lineHeight: tokens.typography.scale.h1.lineHeight, fontWeight: tokens.typography.scale.h1.fontWeight }],
        'h2': [tokens.typography.scale.h2.desktop, { lineHeight: tokens.typography.scale.h2.lineHeight, fontWeight: tokens.typography.scale.h2.fontWeight }],
        'h3': [tokens.typography.scale.h3.desktop, { lineHeight: tokens.typography.scale.h3.lineHeight, fontWeight: tokens.typography.scale.h3.fontWeight }],
        'h4': [tokens.typography.scale.h4.desktop, { lineHeight: tokens.typography.scale.h4.lineHeight, fontWeight: tokens.typography.scale.h4.fontWeight }],
        'body-lg': [tokens.typography.scale['body-large'].desktop, { lineHeight: tokens.typography.scale['body-large'].lineHeight }],
        'body': [tokens.typography.scale.body.desktop, { lineHeight: tokens.typography.scale.body.lineHeight }],
        'body-sm': [tokens.typography.scale['body-sm'].desktop, { lineHeight: tokens.typography.scale['body-sm'].lineHeight }],
        'caption': [tokens.typography.scale.caption.desktop, { lineHeight: tokens.typography.scale.caption.lineHeight }],
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: {
        ...tokens.shadows,
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.37), 0 0 20px rgba(0, 242, 255, 0.06)',
        'cyan-glow': '0 0 20px rgba(0, 242, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 242, 255, 0.4)',
        'blue-glow': '0 0 20px rgba(32, 148, 243, 0.3)',
        'glow-lumina': '0 4px 12px rgba(32, 148, 243, 0.35)',
        'glow-sm': '0 0 10px rgba(0, 242, 255, 0.15)',
      },
      transitionDuration: {
        fast: tokens.transitions.fast,
        base: tokens.transitions.base,
        slow: tokens.transitions.slow,
        slower: tokens.transitions.slower,
      },
      backgroundImage: {
        'gradient-void': 'linear-gradient(180deg, #000A1A 0%, #001338 40%, #001A4D 100%)',
        'gradient-void-radial': 'radial-gradient(ellipse at 50% 0%, #001A4D 0%, #001338 50%, #000A1A 100%)',
        'gradient-lux': 'linear-gradient(135deg, #E6E6EA 0%, #CCCCDB 100%)',
        'gradient-lumina': 'linear-gradient(135deg, #2094F3 0%, #00F2FF 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #2094F3 0%, #00F2FF 100%)',
        'gradient-ignis': 'linear-gradient(135deg, #FFCC80 0%, #FFB74D 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(0, 19, 56, 0.45) 0%, rgba(0, 10, 26, 0.55) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(0, 19, 56, 0.45) 0%, rgba(0, 19, 56, 0.35) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 242, 255, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 242, 255, 0.4)' },
        },
        radarPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
