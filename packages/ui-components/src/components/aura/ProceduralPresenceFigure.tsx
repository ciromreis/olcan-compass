import React from 'react'
import { motion } from 'framer-motion'

export interface PresencePhenotype {
  routeLabel?: string
  routeCount?: number
  activeRouteProgress?: number
  urgencyLevel?: number
  interviewReadiness?: number
  documentReadiness?: number
  logisticsReadiness?: number
  adaptationLevel?: number
}

interface ProceduralPresenceFigureProps {
  primary: string
  secondary: string
  stageName: string
  stageMotif: string
  accentClass: string
  sizeClass: string
  phenotype?: PresencePhenotype
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function deriveFigureGeometry(phenotype?: PresencePhenotype) {
  const routeCount = Math.max(1, phenotype?.routeCount || 1)
  const urgency = clamp(phenotype?.urgencyLevel ?? 0.28)
  const interview = clamp(phenotype?.interviewReadiness ?? 0.45)
  const document = clamp(phenotype?.documentReadiness ?? 0.52)
  const logistics = clamp(phenotype?.logisticsReadiness ?? 0.48)
  const adaptation = clamp(phenotype?.adaptationLevel ?? 0.5)
  const progress = clamp((phenotype?.activeRouteProgress ?? 52) / 100)

  return {
    routeCount,
    urgency,
    interview,
    document,
    logistics,
    adaptation,
    progress,
    wingSpan: 34 + logistics * 22,
    hornLift: 10 + urgency * 18,
    tailLength: 16 + document * 22,
    eyeSize: 5 + interview * 4,
    shellInset: 16 - document * 5,
    nodeCount: Math.min(4, Math.max(2, routeCount + (adaptation > 0.68 ? 1 : 0))),
  }
}

export const ProceduralPresenceFigure: React.FC<ProceduralPresenceFigureProps> = ({
  primary,
  secondary,
  stageName,
  stageMotif,
  accentClass,
  sizeClass,
  phenotype,
}) => {
  const geometry = deriveFigureGeometry(phenotype)
  const orbitNodes = Array.from({ length: geometry.nodeCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / geometry.nodeCount
    return {
      id: index,
      x: 90 + Math.cos(angle) * (46 + geometry.routeCount * 3),
      y: 90 + Math.sin(angle) * (32 + geometry.progress * 10),
      delay: index * 0.25,
    }
  })

  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [0, 1.2, -1.2, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative ${sizeClass}`}
    >
      <div
        className="absolute inset-2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${primary}66 0%, ${secondary}28 42%, transparent 76%)` }}
      />
      <motion.div
        className="absolute inset-[7%] rounded-full border border-white/18"
        style={{ background: `conic-gradient(from 100deg, ${primary}18, rgba(255,255,255,0.04), ${secondary}36, rgba(255,255,255,0.05), ${primary}18)` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-[16%] rounded-full border border-white/12"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />

      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="presenceShell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.82)" />
            <stop offset="38%" stopColor={secondary} stopOpacity="0.56" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.84" />
          </linearGradient>
          <linearGradient id="presenceBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.82)" />
            <stop offset="45%" stopColor={secondary} stopOpacity="0.48" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.94" />
          </linearGradient>
          <linearGradient id="presenceWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.34" />
          </linearGradient>
        </defs>

        <path
          d={`M54 126 C ${42 - geometry.tailLength * 0.35} 134, ${30 - geometry.tailLength * 0.7} ${122 + geometry.urgency * 18}, ${28 - geometry.tailLength * 0.82} ${106 + geometry.document * 16} C 42 108, 56 102, 62 94`}
          fill="none"
          stroke="rgba(226,232,240,0.56)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d={`M58 72 C ${44 - geometry.wingSpan * 0.22} 56, ${26 - geometry.wingSpan * 0.45} 72, ${20 - geometry.wingSpan * 0.24} 96 C 36 94, 54 92, 66 88`}
          fill="url(#presenceWing)"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="1.8"
        />
        <path
          d={`M122 72 C ${136 + geometry.wingSpan * 0.2} 56, ${154 + geometry.wingSpan * 0.42} 72, ${160 + geometry.wingSpan * 0.18} 96 C 144 94, 128 92, 114 88`}
          fill="url(#presenceWing)"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="1.8"
        />

        <path
          d={`M66 58 C 70 ${46 - geometry.hornLift}, 80 ${38 - geometry.hornLift}, 88 44`}
          fill="none"
          stroke="rgba(255,255,255,0.48)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d={`M114 58 C 110 ${46 - geometry.hornLift}, 100 ${38 - geometry.hornLift}, 92 44`}
          fill="none"
          stroke="rgba(255,255,255,0.48)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <ellipse cx="90" cy="96" rx={36 + geometry.document * 7} ry={40 + geometry.adaptation * 8} fill="url(#presenceShell)" stroke="rgba(255,255,255,0.34)" strokeWidth="2" />
        <ellipse cx="90" cy="86" rx={24 + geometry.adaptation * 5} ry={26 + geometry.interview * 4} fill="url(#presenceBody)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.8" />
        <ellipse cx="90" cy="96" rx={18 + geometry.document * 3} ry={22 + geometry.document * 5} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />

        <ellipse cx={78 - geometry.routeCount} cy="80" rx={geometry.eyeSize} ry={geometry.eyeSize + 1.2} fill="rgba(6,10,18,0.92)" />
        <ellipse cx={102 + Math.min(2, geometry.routeCount - 1)} cy="80" rx={geometry.eyeSize} ry={geometry.eyeSize + 1.2} fill="rgba(6,10,18,0.92)" />
        <circle cx={79 - geometry.routeCount} cy="78" r="1.7" fill="rgba(255,255,255,0.9)" />
        <circle cx={103 + Math.min(2, geometry.routeCount - 1)} cy="78" r="1.7" fill="rgba(255,255,255,0.9)" />

        <path
          d={`M72 70 C 76 ${62 - geometry.interview * 5}, 84 ${58 - geometry.interview * 7}, 90 60 C 98 ${58 - geometry.interview * 7}, 106 ${62 - geometry.interview * 5}, 108 70`}
          fill="none"
          stroke="rgba(226,232,240,0.34)"
          strokeWidth="1.5"
        />

        {Array.from({ length: 3 }, (_, rib) => (
          <path
            key={rib}
            d={`M${74 + rib * 7} ${96 + rib * 8} C ${78 + rib * 5} ${92 + rib * 6}, ${100 + rib * 2} ${92 + rib * 6}, ${106 - rib * 4} ${98 + rib * 8}`}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        ))}

        <path
          d={`M76 114 C 82 ${118 + geometry.document * 4}, 98 ${118 + geometry.document * 4}, 104 114`}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>

      {orbitNodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute h-2.5 w-2.5 rounded-full border border-white/30 bg-white/70"
          style={{ left: `${(node.x / 180) * 100}%`, top: `${(node.y / 180) * 100}%` }}
          animate={{ y: [0, -7, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.4, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-slate-950/24 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/72 backdrop-blur-md">
        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${accentClass} text-[9px] font-bold text-slate-900`}>
          {stageMotif}
        </span>
        {stageName}
      </div>
    </motion.div>
  )
}
