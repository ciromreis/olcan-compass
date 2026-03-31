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
        // Metamodern MMXD Palette
        bone: tokens.colors.bone,
        ink: tokens.colors.ink,
        gold: tokens.colors.gold,
        silver: tokens.colors.silver,
        slate: tokens.colors.slate,
        
        // Semantic
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
        heading: ["var(--font-heading)", "DM Serif Display", "serif"],
        emphasis: ["var(--font-emphasis)", "DM Sans", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
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
        "gradient-premium": "linear-gradient(135deg, #0A0A0B 0%, #1A1A1F 100%)",
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #AB8D2C 100%)",
        "gradient-glass": "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "noise-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 350ms cubic-bezier(0.23, 1, 0.32, 1)",
        "scale-in": "scaleIn 250ms cubic-bezier(0.23, 1, 0.32, 1)",
        "glass-reveal": "glassReveal 500ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glassReveal: {
          "0%": { opacity: "0", backdropFilter: "blur(0px)" },
          "100%": { opacity: "1", backdropFilter: "blur(24px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
