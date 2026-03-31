"use client";

import React, { useRef, useEffect } from "react";
import createGlobe from "cobe";
import { motion } from "framer-motion";

export default function GlobeSubcomponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.97, 0.96, 0.94], // Cream/Bone base
      markerColor: [0.91, 0.26, 0.1], // Flame (#E8421A)
      glowColor: [1, 1, 1],
      markers: [
        // Brazil
        { location: [-23.5505, -46.6333], size: 0.1 },
        // Europe Hubs
        { location: [52.52, 13.405], size: 0.05 }, // Berlin
        { location: [48.8566, 2.3522], size: 0.05 }, // Paris
        { location: [51.5074, -0.1278], size: 0.05 }, // London
        { location: [40.4168, -3.7038], size: 0.05 }, // Madrid
        // North America
        { location: [40.7128, -74.006], size: 0.05 }, // NYC
        { location: [43.6532, -79.3832], size: 0.05 }, // Toronto
      ],
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto">
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
        className="opacity-0 animate-fade-up"
      />
      {/* Overlay rings for technical feel */}
      <div className="absolute inset-0 pointer-events-none rounded-full border border-ink/[0.03] scale-110" />
      <div className="absolute inset-0 pointer-events-none rounded-full border border-ink/[0.02] scale-125" />
    </div>
  );
}
