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
        void: tokens.colors.void,
        lux: tokens.colors.lux,
        lumina: tokens.colors.lumina,
        ignis: tokens.colors.ignis,
        neutral: tokens.colors.neutral,
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
      boxShadow: tokens.shadows,
      transitionDuration: {
        fast: tokens.transitions.fast,
        base: tokens.transitions.base,
        slow: tokens.transitions.slow,
        slower: tokens.transitions.slower,
      },
      backgroundImage: {
        'gradient-void': 'linear-gradient(135deg, #001338 0%, #001A4D 50%, #002266 100%)',
        'gradient-lux': 'linear-gradient(135deg, #E6E6EA 0%, #CCCCDB 100%)',
        'gradient-lumina': 'linear-gradient(135deg, #90CAF9 0%, #64B5F6 100%)',
        'gradient-ignis': 'linear-gradient(135deg, #FFCC80 0%, #FFB74D 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(26, 31, 51, 0.8) 0%, rgba(10, 13, 26, 0.9) 100%)',
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(144, 202, 249, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(144, 202, 249, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
