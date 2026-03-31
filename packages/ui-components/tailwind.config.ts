import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/app-compass-v2/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/site-marketing-v2.5/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Career Companions Theme
        companion: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          accent: '#f59e0b',
          glow: 'rgba(139, 92, 246, 0.6)',
          aura: 'rgba(6, 182, 212, 0.4)',
          sparkle: 'rgba(255, 215, 0, 0.8)'
        },
        // Archetype Colors
        strategist: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        },
        innovator: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        creator: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        diplomat: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63'
        },
        pioneer: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        scholar: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      fontFamily: {
        'serif': ['DM Serif Display', 'Georgia', 'serif'],
        'sans': ['DM Sans', 'system-ui', 'sans-serif']
      },
      animation: {
        'companion-float': 'companion-float 6s ease-in-out infinite',
        'companion-pulse': 'companion-pulse 4s ease-in-out infinite',
        'xp-shine': 'xp-shine 2s infinite',
        'level-glow': 'level-glow 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'magical-pulse': 'magical-pulse 8s ease-in-out infinite'
      },
      keyframes: {
        'companion-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-8px) rotate(-1deg)' },
          '75%': { transform: 'translateY(-4px) rotate(1deg)' }
        },
        'companion-pulse': {
          '0%, 100%': { transform: 'scale(0.8) rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0.8' }
        },
        'xp-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'level-glow': {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' }
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' }
        },
        'magical-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        }
      },
      backdropBlur: {
        'xs': '2px'
      },
      boxShadow: {
        'companion': '0 8px 32px rgba(139, 92, 246, 0.3)',
        'companion-hover': '0 12px 40px rgba(139, 92, 246, 0.4)',
        'liquid-glass': 'inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 20px rgba(13,12,10,0.05)',
        'liquid-glass-dark': 'inset 0 1px 0px rgba(255,255,255,0.07), 0 2px 24px rgba(0,0,0,0.3)',
        'glow': '0 0 20px var(--companion-glow)',
        'level': '0 0 20px rgba(245, 158, 11, 0.5)'
      }
    }
  },
  plugins: []
}

export default config
