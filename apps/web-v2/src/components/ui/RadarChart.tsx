"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RadarDataPoint {
  label: string;
  value: number;
  max?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  fillColor?: string;
  strokeColor?: string;
  gridColor?: string;
  labelColor?: string;
  className?: string;
  showValues?: boolean;
  rings?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function RadarChart({
  data,
  size = 280,
  fillColor = "rgba(107, 142, 95, 0.2)",
  strokeColor = "rgb(107, 142, 95)",
  gridColor = "rgb(214, 207, 196)",
  labelColor = "rgb(90, 85, 78)",
  className,
  showValues = false,
  rings = 4,
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.36;
  const labelRadius = size * 0.46;
  const n = data.length;

  const angleStep = 360 / n;

  const gridPaths = useMemo(() => {
    const paths: string[] = [];
    for (let ring = 1; ring <= rings; ring++) {
      const r = (maxRadius / rings) * ring;
      const pts = Array.from({ length: n }, (_, i) =>
        polarToCartesian(cx, cy, r, i * angleStep)
      );
      paths.push(pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z");
    }
    return paths;
  }, [cx, cy, maxRadius, n, angleStep, rings]);

  const axisPaths = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const end = polarToCartesian(cx, cy, maxRadius, i * angleStep);
      return `M ${cx},${cy} L ${end.x},${end.y}`;
    });
  }, [cx, cy, maxRadius, n, angleStep]);

  const dataPath = useMemo(() => {
    const pts = data.map((d, i) => {
      const pct = Math.min(1, Math.max(0, d.value / (d.max || 100)));
      return polarToCartesian(cx, cy, maxRadius * pct, i * angleStep);
    });
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";
  }, [data, cx, cy, maxRadius, angleStep]);

  const labels = useMemo(() => {
    return data.map((d, i) => {
      const pos = polarToCartesian(cx, cy, labelRadius, i * angleStep);
      const angle = i * angleStep;
      let textAnchor: "start" | "middle" | "end" = "middle";
      if (angle > 10 && angle < 170) textAnchor = "start";
      else if (angle > 190 && angle < 350) textAnchor = "end";
      return { ...d, ...pos, textAnchor };
    });
  }, [data, cx, cy, labelRadius, angleStep]);

  return (
    <div className={cn("flex items-center justify-center w-full max-w-sm mx-auto", className)}>
      <svg width="100%" height="auto" viewBox={`-40 -40 ${size + 80} ${size + 80}`} className="overflow-visible">
        {gridPaths.map((d, i) => (
          <path key={`grid-${i}`} d={d} fill="none" stroke={gridColor} strokeWidth={0.8} opacity={0.5} />
        ))}
        {axisPaths.map((d, i) => (
          <path key={`axis-${i}`} d={d} stroke={gridColor} strokeWidth={0.8} opacity={0.5} />
        ))}
        <path d={dataPath} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
        {data.map((d, i) => {
          const pct = Math.min(1, Math.max(0, d.value / (d.max || 100)));
          const pt = polarToCartesian(cx, cy, maxRadius * pct, i * angleStep);
          return <circle key={`dot-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={strokeColor} />;
        })}
        {labels.map((l, i) => (
          <text
            key={`label-${i}`}
            x={l.x}
            y={l.y}
            textAnchor={l.textAnchor}
            dominantBaseline="central"
            fill={labelColor}
            fontSize={11}
            fontWeight={500}
            fontFamily="var(--font-heading), sans-serif"
          >
            {l.label}
            {showValues && (
              <tspan dx={4} fontSize={10} fontWeight={600} fill={strokeColor}>
                {l.value}
              </tspan>
            )}
          </text>
        ))}
      </svg>
    </div>
  );
}

export { RadarChart, type RadarChartProps, type RadarDataPoint };
