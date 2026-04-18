"use client";

import { motion } from "framer-motion";
import type { PresenceFigureSpec, PresenceSpecies, PresenceAttachment, PresenceEyeStyle } from "@/lib/aura-presence";

interface ProceduralAuraFigureProps {
  spec: PresenceFigureSpec;
  size?: number;
  active?: boolean;
}

function hsl(hue: number, saturation: number, lightness: number, alpha = 1): string {
  return `hsla(${hue} ${saturation}% ${lightness}% / ${alpha})`;
}

/**
 * ProceduralAuraFigure v2.5
 * Materializa as espécies do OIOS com anatomia distinta e específica.
 * Inclui o estágio "Egg" e variações geométricas baseadas em Seed (DNA).
 */
export function ProceduralAuraFigure({
  spec,
  size = 240,
  active = true,
}: ProceduralAuraFigureProps) {
  const metal = spec.metallic;

  // Hue Constrain: Block Orange/Amber.
  const safeHue = (hue: number) => {
    if (hue > 15 && hue < 80) return hue + 120;
    return hue;
  };

  const primaryHue = safeHue(spec.primaryHue);
  const secondaryHue = safeHue(spec.secondaryHue);

  const primary = hsl(primaryHue, 40 + metal * 20, 35 + metal * 15);
  const primarySoft = hsl(primaryHue, 60, 70, 0.9);
  const secondary = hsl(secondaryHue, 45, 55, 0.9);
  const silver = hsl(210, 10 + metal * 20, 88, 0.95);
  const outline = hsl(primaryHue, 30, 15, 0.45);

  // Seed-based geometric jitter (Deterministic uniqueness)
  const jitter = (index: number, range: number) => {
    let hash = 0;
    for (let i = 0; i < spec.seed.length; i++) {
      hash = spec.seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return ((Math.abs(hash + index * 97) % 100) / 100) * range - (range / 2);
  };

  const renderSpeciesBase = (species: PresenceSpecies) => {
    if (spec.stage === 'egg') return null;

    const scale = 1 + (spec.detailLevel - 3) * 0.05;
    const j1 = jitter(1, 4);
    const j2 = jitter(2, 4);
    
    switch (species) {
      case "fox":
        return (
          <g id="fox-base" transform={`scale(${scale})`}>
            <path d={`M${70+j1} 145 Q40 170 85 155`} stroke={primary} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M82 72 L65 35 L90 55 Z" fill={primary} stroke={outline} />
            <path d="M118 72 L135 35 L110 55 Z" fill={primary} stroke={outline} />
          </g>
        );
      case "dragon":
        return (
          <g id="dragon-base" transform={`scale(${scale})`}>
            <path d={`M${85+j1} ${75+j2} Q60 30 80 25`} stroke={silver} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d={`M${115+j1} ${75+j2} Q140 30 120 25`} stroke={silver} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M100 155 Q140 190 170 150" stroke={primary} strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        );
      case "lion":
        return (
          <g id="lion-base">
            <circle cx="100" cy="100" r={(45 + j1) * scale} fill="none" stroke={secondary} strokeWidth="12" strokeDasharray="1 4" opacity="0.4" />
            <path d="M80 75 L70 50 L90 65 Z" fill={primary} stroke={outline} />
            <path d="M120 75 L130 50 L110 65 Z" fill={primary} stroke={outline} />
          </g>
        );
      case "phoenix":
        return (
          <g id="phoenix-base">
            <path d={`M100 150 Q100 190 ${80+j1} 200`} stroke={secondary} strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M100 70 L100 35 L108 45 Z" fill={secondary} />
          </g>
        );
      case "wolf":
        return (
          <g id="wolf-base">
            <path d={`M${82+j1} 72 L75 35 L95 60 Z`} fill={primary} stroke={outline} />
            <path d="M118 72 L125 35 L105 60 Z" fill={primary} stroke={outline} />
          </g>
        );
      case "owl":
        return (
          <g id="owl-base">
            <ellipse cx={85+j1} cy={95+j2} rx="14" ry="18" fill="none" stroke={silver} strokeWidth="0.5" opacity="0.3" />
            <ellipse cx={115+j1} cy={95+j2} rx="14" ry="18" fill="none" stroke={silver} strokeWidth="0.5" opacity="0.3" />
          </g>
        );
      default:
        return (
          <g opacity="0.5">
            <circle cx={85+j1} cy={75+j2} r="8" fill={primary} />
            <circle cx={115+j1} cy={75+j2} r="8" fill={primary} />
          </g>
        );
    }
  };

  const renderEyes = (style: PresenceEyeStyle) => {
    if (spec.stage === 'egg') return null;
    const eyeY = 96;
    const j = jitter(5, 2);
    switch (style) {
      case "slanted":
        return (
          <g>
            <path d="M86 94 Q92 92 98 96 Q92 102 86 100 Z" fill="white" stroke={outline} strokeWidth="0.5" />
            <path d="M114 94 Q108 92 102 96 Q108 102 114 100 Z" fill="white" stroke={outline} strokeWidth="0.5" />
            <circle cx={92+j} cy={96} r="2" fill="black" />
            <circle cx={108-j} cy={96} r="2" fill="black" />
          </g>
        );
      case "round":
        return (
          <g>
            <circle cx={90+j} cy={eyeY} r="7" fill="white" stroke={outline} />
            <circle cx={110-j} cy={eyeY} r="7" fill="white" stroke={outline} />
            <circle cx={90+j} cy={eyeY} r="3" fill="black" />
            <circle cx={110-j} cy={eyeY} r="3" fill="black" />
          </g>
        );
      default:
        return (
          <g>
            <rect x="80" y={eyeY - 4} width="40" height="8" rx="4" fill="black" stroke={silver} strokeWidth="1" />
          </g>
        );
    }
  };

  const renderAttachments = (attach: PresenceAttachment) => {
    if (spec.stage === 'egg') return null;
    const j = jitter(10, 5);
    switch (attach) {
      case "wings":
        return (
          <g opacity="0.7">
            <path d={`M70 120 C${30+j} 80 20 40 75 90`} fill={secondary} stroke={outline} strokeWidth="0.5" />
            <path d={`M130 120 C${170-j} 80 180 40 125 90`} fill={secondary} stroke={outline} strokeWidth="0.5" />
          </g>
        );
      case "horns":
      case "antlers":
        return (
          <g>
            <path d={`M85 70 Q${70+j} 20 50 15`} stroke={silver} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d={`M115 70 Q${130-j} 20 150 15`} stroke={silver} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderEgg = () => {
    if (spec.stage !== 'egg') return null;
    const j = jitter(20, 10);
    return (
      <g id="egg-stage">
        {/* Core Egg Shape */}
        <ellipse cx="100" cy="120" rx="45" ry="55" fill={silver} stroke={outline} strokeWidth="1.5" />
        {/* Metabolic Cracks (Luz Interior) */}
        <path d={`M85 90 L${90+j} 110 L80 130`} stroke={primarySoft} strokeWidth="1" fill="none" opacity="0.6" />
        <path d={`M115 95 L${110-j} 115 L120 125`} stroke={primarySoft} strokeWidth="1" fill="none" opacity="0.6" />
        {/* Pulsing Core */}
        <motion.circle 
          cx="100" cy="120" r="15" 
          fill={primarySoft} 
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </g>
    );
  };

  return (
    <motion.div
      animate={active ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`glow-${spec.seed}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primarySoft} stopOpacity="0.4" />
            <stop offset="100%" stopColor={primarySoft} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo / Aura Glow */}
        <motion.circle 
          cx="100" cy="110" r={65 * spec.haloIntensity} 
          fill={`url(#glow-${spec.seed})`} 
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Species Base Features (Ears, Tail) */}
        {renderSpeciesBase(spec.species)}

        {/* Egg Rendering (Overlay/Priority) */}
        {renderEgg()}

        {/* Body Main (Liquid Glass Core) - Hidden if Egg */}
        {spec.stage !== 'egg' && (
          <ellipse 
            cx="100" cy="128" 
            rx={38 * spec.bodyScale} ry={48 * spec.bodyScale} 
            fill={primary} 
            stroke={outline} 
            strokeWidth="0.8" 
          />
        )}

        {/* Head Main (High Contrast Silver/Glass) - Hidden if Egg */}
        {spec.stage !== 'egg' && (
          <ellipse 
            cx="100" cy="100" 
            rx="34" ry="30" 
            fill={silver} 
            stroke={outline} 
            strokeWidth="1.5" 
          />
        )}

        {/* Facial Expression - Hidden if Egg */}
        {spec.stage !== 'egg' && renderEyes(spec.eyeStyle)}
        {spec.stage !== 'egg' && (
          <path d="M96 114 Q100 117 104 114" stroke={outline} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        )}

        {/* Attachments (Wings, Horns) - Hidden if Egg */}
        {spec.stage !== 'egg' && renderAttachments(spec.attachment)}

        {/* Orbitals (Unique for High Evolution) */}
        {spec.stage !== 'egg' && spec.orbitCount > 0 && Array.from({ length: spec.orbitCount }).map((_, i) => (
          <motion.circle
            key={i}
            cx="100"
            cy="110"
            r={75 + i * 8}
            fill="none"
            stroke={secondary}
            strokeWidth="0.5"
            strokeDasharray="2 10"
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
