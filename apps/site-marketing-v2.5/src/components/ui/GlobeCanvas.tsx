"use client";

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface GlobeCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  dark?: number;
  diffuse?: number;
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  markerColor?: [number, number, number];
  mapBrightness?: number;
  mapSamples?: number;
  speed?: number;
  theta?: number;
  markers?: Array<{ location: [number, number]; size: number }>;
}

const DEFAULT_MARKERS: Array<{ location: [number, number]; size: number }> = [
  { location: [-23.5505, -46.6333], size: 0.10 }, // São Paulo
  { location: [38.7223, -9.1393], size: 0.08 },   // Lisbon
  { location: [43.6532, -79.3832], size: 0.08 },  // Toronto
  { location: [52.5200, 13.4050], size: 0.07 },   // Berlin
  { location: [37.7749, -122.4194], size: 0.08 }, // San Francisco
  { location: [40.7128, -74.0060], size: 0.06 },  // New York
  { location: [51.5074, -0.1278], size: 0.07 },   // London
  { location: [-33.8688, 151.2093], size: 0.06 }, // Sydney
  { location: [35.6762, 139.6503], size: 0.05 },  // Tokyo
];

export default function GlobeCanvas({
  className,
  style,
  dark = 0,
  diffuse = 1.5,
  baseColor = [0.12, 0.17, 0.38],
  glowColor = [0.80, 0.88, 1.0],
  markerColor = [235 / 255, 126 / 255, 81 / 255],
  mapBrightness = 12,
  mapSamples = 24000,
  speed = 0.005,
  theta = 0.3,
  markers = DEFAULT_MARKERS,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const initGlobe = (w: number) => {
      if (!canvasRef.current || w === 0) return;
      if (globe) globe.destroy();

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
        width: w * 2,
        height: w * 2,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markers,
        // @ts-expect-error onRender exists in cobe runtime
        onRender: (state) => {
          state.phi = phi;
          phi += speed;
          state.width = w * 2;
          state.height = w * 2;
        },
      });
    };

    const container = containerRef.current;
    if (!container) return;

    // ResizeObserver on the CONTAINER div (always has size)
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 0) {
        // Set canvas intrinsic size to match container
        if (canvasRef.current) {
          canvasRef.current.width = w * 2;
          canvasRef.current.height = w * 2;
        }
        initGlobe(w);
      }
    });

    ro.observe(container);

    // Also trigger immediately in case already sized
    const immediate = container.offsetWidth;
    if (immediate > 0) {
      setTimeout(() => initGlobe(immediate), 0);
    }

    return () => {
      ro.disconnect();
      globe?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
