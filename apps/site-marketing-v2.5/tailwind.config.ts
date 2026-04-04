import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Shared Metamodern Palette (MMXD v2.5) ───
        bone:      "#FAF9F6",   // Main surface (Light Cream)
        ink:       "#0D0C0A",   // Primary text
        gold:      "#D4AF37",   // Premium accent
        silver:    "#ADB5BD",   // Secondary accent
        slate:     "#7E8CA3",   // Metadata/Muted

        // ─── Cream Scale (maps to CSS vars) ───
        cream: {
          DEFAULT: "#FAF9F6",
          50:  "#FDFCFB",
          100: "#F7F4EF",
        },

        // ─── Olcan Navy (semantic alias) ───
        "olcan-navy": "#001338",
        
        // ─── Olcan Brand - Navy ───
        brand: {
          50:  "#E6EAEE",
          100: "#B3C1CC",
          200: "#8097AA",
          300: "#4D6D88",
          400: "#1A4466",
          500: "#001338", // Official Olcan Navy
          600: "#001132",
          700: "#000E2B",
          800: "#000B24",
          900: "#00081D",
        },

        // ─── Olcan Accent - Flame (uso reduzido, apenas para CTAs específicos) ───
        flame: {
          DEFAULT: "#D4691E",
          50:  "#FDF6F3",
          100: "#FAEEE8",
          200: "#F5DDD1",
          300: "#EDBFA8",
          400: "#E19A70",
          500: "#D4691E",
          600: "#B85818",
          700: "#8F4513",
        },

        // ─── Semantic aliases ───
        surface: {
          bg: "#FAF9F6",
          card: "rgba(255, 255, 255, 0.45)",
          glass: "rgba(255, 255, 255, 0.4)",
        },
        text: {
          primary: "#0D0C0A",
          secondary: "#1F2937",
          muted: "#6B7280",
          accent: "#E8421A",
        }
      },
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        sans:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(4rem, 8vw, 9rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-xl":  ["clamp(3rem, 6vw, 7rem)",  { lineHeight: "0.97", letterSpacing: "-0.03em"  }],
        "display-lg":  ["clamp(2.25rem, 5vw, 5rem)", { lineHeight: "1.0",  letterSpacing: "-0.025em" }],
        "display-md":  ["clamp(1.75rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-sm":  ["clamp(1.375rem, 3vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "liquid-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "fade-up":      "fade-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "liquid-shift": "liquid-shift 12s ease infinite",
      },
      boxShadow: {
        glass:      "inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 24px rgba(0,0,0,0.04)",
        "glass-elevated": "inset 0 1px 1px rgba(255,255,255,0.5), 0 12px 48px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "hero-grain":  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
