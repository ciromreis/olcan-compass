"use client";

import { motion } from "framer-motion";
import type { PresenceFigureSpec } from "./types";

interface ProceduralAuraFigureProps {
  spec: PresenceFigureSpec;
  size?: number;
  active?: boolean;
}

function hsl(hue: number, saturation: number, lightness: number, alpha = 1): string {
  return `hsla(${hue} ${saturation}% ${lightness}% / ${alpha})`;
}

export function ProceduralAuraFigure({
  spec,
  size = 240,
  active = true,
}: ProceduralAuraFigureProps) {
  const center = 100;
  const bodyWidth = 52 * spec.bodyScale;
  const bodyHeight = 60 * spec.bodyScale;
  const headY = 78 - spec.detailLevel;
  const metal = spec.metallic;

  const primary = hsl(spec.primaryHue, 46 + metal * 18, 39 + metal * 18);
  const primarySoft = hsl(spec.primaryHue, 58, 72, 0.9);
  const secondary = hsl(spec.secondaryHue, 38 + metal * 12, 60 + metal * 10, 0.92);
  const silver = hsl(210, 18 + metal * 8, 86, 0.95);
  const core = hsl(spec.primaryHue + 8, 60, 92, 0.96);
  const ring = hsl(spec.secondaryHue, 44, 76, 0.42);
  const outline = hsl(spec.primaryHue, 28, 28, 0.36);

  const eyePositions =
    spec.eyeStyle === "mono"
      ? [{ x: 100, y: 94 }]
      : spec.eyeStyle === "triad"
      ? [
          { x: 91, y: 92 },
          { x: 109, y: 92 },
          { x: 100, y: 102 },
        ]
      : spec.eyeStyle === "visor"
      ? []
      : [
          { x: 92, y: 95 },
          { x: 108, y: 95 },
        ];

  const renderAttachment = () => {
    switch (spec.attachment) {
      case "antlers":
        return (
          <>
            <path d="M86 70 L76 46 L80 43 L88 62 L96 48 L100 51 L92 71" stroke={silver} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M114 70 L124 46 L120 43 L112 62 L104 48 L100 51 L108 71" stroke={silver} strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case "antennae":
        return (
          <>
            <path d="M92 74 C84 56 82 46 86 36" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="86" cy="34" r="4" fill={silver} />
            <path d="M108 74 C116 56 118 46 114 36" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="114" cy="34" r="4" fill={silver} />
          </>
        );
      case "fins":
        return (
          <>
            <path d="M70 106 C46 98 48 74 72 78" fill={secondary} opacity="0.75" />
            <path d="M130 106 C154 98 152 74 128 78" fill={secondary} opacity="0.75" />
          </>
        );
      case "horns":
        return (
          <>
            <path d="M88 73 C76 60 76 46 84 38" stroke={primarySoft} strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M112 73 C124 60 124 46 116 38" stroke={primarySoft} strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        );
      case "orbitals":
        return Array.from({ length: spec.orbitCount }).map((_, index) => (
          <ellipse
            key={`orbital-${index}`}
            cx="100"
            cy="104"
            rx={42 + index * 8}
            ry={26 + index * 4}
            transform={`rotate(${index * (180 / spec.orbitCount)} 100 104)`}
            fill="none"
            stroke={ring}
            strokeWidth="2"
          />
        ));
      case "wings":
      default:
        return (
          <>
            <path d="M76 110 C44 92 44 58 74 72 C62 90 62 102 76 110" fill={secondary} opacity="0.62" />
            <path d="M124 110 C156 92 156 58 126 72 C138 90 138 102 124 110" fill={secondary} opacity="0.62" />
          </>
        );
    }
  };

  const renderLocomotion = () => {
    switch (spec.locomotion) {
      case "limbs":
        return (
          <>
            <path d="M90 145 L82 166" stroke={outline} strokeWidth="4" strokeLinecap="round" />
            <path d="M110 145 L118 166" stroke={outline} strokeWidth="4" strokeLinecap="round" />
          </>
        );
      case "thrusters":
        return (
          <>
            <path d="M88 146 L80 162" stroke={outline} strokeWidth="5" strokeLinecap="round" />
            <path d="M112 146 L120 162" stroke={outline} strokeWidth="5" strokeLinecap="round" />
            <path d="M76 162 C82 172 88 174 92 164" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M124 162 C118 172 112 174 108 164" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          </>
        );
      case "tendrils":
        return (
          <>
            <path d="M88 144 C78 156 76 172 82 180" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M100 148 C96 160 98 174 104 182" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M112 144 C122 156 124 172 118 180" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case "hover":
      default:
        return (
          <ellipse cx="100" cy="164" rx="28" ry="7" fill={hsl(spec.primaryHue, 20, 80, 0.34)} />
        );
    }
  };

  const renderSpeciesAccent = () => {
    switch (spec.species) {
      case "avian":
        return <path d="M100 105 L112 112 L100 118 L104 112 Z" fill={silver} />;
      case "construct":
        return <rect x="91" y="107" width="18" height="12" rx="4" fill={silver} opacity="0.82" />;
      case "feline":
        return <path d="M93 104 C97 110 103 110 107 104" stroke={silver} strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case "moth":
        return <ellipse cx="100" cy="112" rx="9" ry="5" fill={silver} opacity="0.75" />;
      case "serpentine":
        return <path d="M94 120 C98 124 102 124 106 120" stroke={silver} strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case "cephalopod":
      default:
        return <circle cx="100" cy="112" r="5" fill={silver} opacity="0.86" />;
    }
  };

  return (
    <motion.div
      animate={active ? { y: [0, -5, 0], rotate: [0, spec.symmetry * 2, 0] } : undefined}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="h-full w-full overflow-visible"
        animate={active ? { scale: [1, 1.015, 1] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id={`aura-core-${spec.seed}`} cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={core} />
            <stop offset="45%" stopColor={primarySoft} />
            <stop offset="100%" stopColor={primary} />
          </radialGradient>
          <linearGradient id={`aura-shell-${spec.seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={silver} />
            <stop offset="60%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r={56 + spec.haloIntensity * 20} fill={hsl(spec.secondaryHue, 42, 72, 0.12)} />
        {renderAttachment()}

        <motion.ellipse
          cx="100"
          cy="118"
          rx={bodyWidth}
          ry={bodyHeight}
          fill={`url(#aura-core-${spec.seed})`}
          stroke={outline}
          strokeWidth="2"
          animate={active ? { ry: [bodyHeight, bodyHeight * 1.03, bodyHeight] } : undefined}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <ellipse cx="100" cy={headY} rx="33" ry="29" fill={`url(#aura-shell-${spec.seed})`} stroke={outline} strokeWidth="2" />
        <ellipse cx="88" cy={headY - 8} rx="11" ry="7" fill={hsl(spec.primaryHue, 45, 98, 0.36)} />

        {spec.eyeStyle === "visor" ? (
          <rect x="82" y="89" width="36" height="12" rx="6" fill={hsl(spec.secondaryHue, 58, 90, 0.92)} opacity="0.92" />
        ) : (
          eyePositions.map((eye, index) => (
            <g key={`eye-${index}`}>
              <circle cx={eye.x} cy={eye.y} r="5.5" fill={hsl(spec.secondaryHue, 42, 98, 0.95)} />
              <circle cx={eye.x} cy={eye.y} r="2.5" fill={hsl(spec.primaryHue, 24, 16, 0.92)} />
            </g>
          ))
        )}

        {renderSpeciesAccent()}
        {renderLocomotion()}

        <path
          d="M82 133 C90 139 110 139 118 133"
          stroke={hsl(spec.primaryHue, 18, 24, 0.42)}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>
    </motion.div>
  );
}
