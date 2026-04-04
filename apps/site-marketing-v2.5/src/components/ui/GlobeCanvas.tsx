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
  diffuse = 1.2,
  baseColor = [0.12, 0.17, 0.38],
  glowColor = [0.80, 0.88, 1.0],
  markerColor = [235 / 255, 126 / 255, 81 / 255],
  mapBrightness = 5,
  mapSamples = 16000,
  speed = 0.005,
  theta = 0.3,
  markers = DEFAULT_MARKERS,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const initGlobe = () => {
      if (!canvasRef.current || width === 0) return;
      if (globe) return; // already initialized

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
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
          state.width = width * 2;
          state.height = width * 2;
        },
      });
    };

    // ResizeObserver catches initial layout + window resizes
    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      if (width > 0) initGlobe();
    });

    if (canvasRef.current) {
      ro.observe(canvasRef.current);
      // Fallback: read immediately in case already sized
      width = canvasRef.current.offsetWidth;
      if (width > 0) initGlobe();
    }

    return () => {
      ro.disconnect();
      globe?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        contain: 'layout paint size',
        opacity: 1,
        transition: 'opacity 1s ease',
        ...style,
      }}
    />
  );
}
