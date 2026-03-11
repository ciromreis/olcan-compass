import type { Config } from "tailwindcss";
import tokens from "../../packages/design-tokens/tokens.json";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: tokens.colors.moss,
        clay: tokens.colors.clay,
        cream: tokens.colors.cream,
        sage: tokens.colors.sage,
        neutral: tokens.colors.neutral,
        success: tokens.colors.semantic.success,
        warning: tokens.colors.semantic.warning,
        error: tokens.colors.semantic.error,
        info: tokens.colors.semantic.info,
        surface: {
          bg: tokens.colors.surface.background,
          card: tokens.colors.surface.card,
          elevated: tokens.colors.surface.elevated,
          overlay: tokens.colors.surface.overlay,
          glass: tokens.colors.surface.glass,
        },
        text: {
          primary: tokens.colors.text.primary,
          secondary: tokens.colors.text.secondary,
          muted: tokens.colors.text.muted,
          inverse: tokens.colors.text.inverse,
          accent: tokens.colors.text.accent,
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        emphasis: ["var(--font-emphasis)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: [
          tokens.typography.scale.display.desktop,
          {
            lineHeight: tokens.typography.scale.display.lineHeight,
            fontWeight: tokens.typography.scale.display.fontWeight,
            letterSpacing: tokens.typography.scale.display.letterSpacing,
          },
        ],
        h1: [
          tokens.typography.scale.h1.desktop,
          {
            lineHeight: tokens.typography.scale.h1.lineHeight,
            fontWeight: tokens.typography.scale.h1.fontWeight,
            letterSpacing: tokens.typography.scale.h1.letterSpacing,
          },
        ],
        h2: [
          tokens.typography.scale.h2.desktop,
          {
            lineHeight: tokens.typography.scale.h2.lineHeight,
            fontWeight: tokens.typography.scale.h2.fontWeight,
            letterSpacing: tokens.typography.scale.h2.letterSpacing,
          },
        ],
        h3: [
          tokens.typography.scale.h3.desktop,
          {
            lineHeight: tokens.typography.scale.h3.lineHeight,
            fontWeight: tokens.typography.scale.h3.fontWeight,
          },
        ],
        h4: [
          tokens.typography.scale.h4.desktop,
          {
            lineHeight: tokens.typography.scale.h4.lineHeight,
            fontWeight: tokens.typography.scale.h4.fontWeight,
          },
        ],
        "body-lg": [
          tokens.typography.scale["body-lg"].desktop,
          { lineHeight: tokens.typography.scale["body-lg"].lineHeight },
        ],
        body: [
          tokens.typography.scale.body.desktop,
          { lineHeight: tokens.typography.scale.body.lineHeight },
        ],
        "body-sm": [
          tokens.typography.scale["body-sm"].desktop,
          { lineHeight: tokens.typography.scale["body-sm"].lineHeight },
        ],
        caption: [
          tokens.typography.scale.caption.desktop,
          {
            lineHeight: tokens.typography.scale.caption.lineHeight,
            fontWeight: tokens.typography.scale.caption.fontWeight,
          },
        ],
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
      transitionTimingFunction: {
        spring: tokens.transitions.spring,
      },
      backgroundImage: {
        "gradient-moss": "linear-gradient(135deg, #2E4036 0%, #5D8B65 100%)",
        "gradient-clay": "linear-gradient(135deg, #CC5833 0%, #E86B40 100%)",
        "gradient-cream":
          "linear-gradient(180deg, #F2F0E9 0%, #FBF9F5 100%)",
        "gradient-card":
          "linear-gradient(180deg, #FFFFFF 0%, #FBF9F5 100%)",
        "noise-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "slide-in-right": "slideInRight 300ms ease-out",
        "slide-in-left": "slideInLeft 300ms ease-out",
        "scale-in": "scaleIn 200ms var(--spring, cubic-bezier(0.34, 1.56, 0.64, 1))",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "count-up": "countUp 1s ease-out",
        shuffle: "shuffle 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shuffle: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
