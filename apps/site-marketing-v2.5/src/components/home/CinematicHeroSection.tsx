"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Play } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * 🎬 CINEMATIC HERO SECTION — METAMODERN EXPERIENCE DESIGN (MMXD)
 * 
 * Architecture:
 * 1. Scroll-Jacked Video Background (GSAP ScrollTrigger)
 * 2. Cinematic Typography Overlay (Staggered Reveals)
 * 3. Metamodern CTAs (Magnetic Hover)
 * 4. Interactive 3D Telemetry (Mouse Parallax + Liquid Glass Tooltips)
 * 
 * Tech Stack: Next.js 15, React 19, GSAP 3, Tailwind CSS, Lucide React
 */

interface TelemetryZone {
  id: string;
  label: string;
  metric: string;
  x: number; // % from left
  y: number; // % from top
  width: number; // % width
  height: number; // % height
}

const TELEMETRY_ZONES: TelemetryZone[] = [
  {
    id: "outer-ring",
    label: "Identity Engine",
    metric: "Readiness Score: 72%",
    x: 15,
    y: 20,
    width: 70,
    height: 60,
  },
  {
    id: "inner-gears",
    label: "Oracle Search",
    metric: "75 Opportunities Matched",
    x: 35,
    y: 35,
    width: 30,
    height: 30,
  },
  {
    id: "center-axis",
    label: "Execution Metronome",
    metric: "Next Action: Draft CV",
    x: 45,
    y: 45,
    width: 10,
    height: 10,
  },
];

const CinematicHeroSection: React.FC = () => {
  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // State for interactive telemetry
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<TelemetryZone | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorScale, setCursorScale] = useState(1);

  /**
   * 🎥 SCROLL-JACKED VIDEO SETUP
   * Binds video playback to scroll position using GSAP ScrollTrigger
   */
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    // GSAP Context for clean lifecycle management
    const ctx = gsap.context(() => {
      // Pin the hero section and control video playback with scroll
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=80%", // Fast progression: 0.8x viewport height for quick video load
        pin: true,
        scrub: 0.3, // Very fast scrubbing for immediate response
        onUpdate: (self) => {
          // Map scroll progress (0-1) to video duration with clamping to avoid end-of-video flickering
          if (video.duration) {
            const time = video.duration * self.progress;
            video.currentTime = Math.min(time, video.duration - 0.05);
          }

          // Unlock telemetry when video reaches 100%
          if (self.progress >= 0.98 && !isVideoComplete) {
            setIsVideoComplete(true);
          }
        },
      });

      // Cinematic entrance animations
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      // Eyebrow reveal (skewed slide-up)
      tl.from(eyebrowRef.current, {
        y: 60,
        skewY: 7,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
      });

      // Headline reveal (staggered text mask)
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".word");
        tl.from(
          words,
          {
            y: 100,
            skewY: 5,
            opacity: 0,
            duration: 1,
            stagger: 0.08,
          },
          "-=0.8"
        );
      }

      // CTA buttons fade-in
      tl.from(
        ctaContainerRef.current,
        {
          y: 40,
          opacity: 0,
          duration: 1,
        },
        "-=0.6"
      );
    }, container);

    return () => ctx.revert(); // Cleanup
  }, [isVideoComplete]);

  /**
   * 🎯 3D MOUSE PARALLAX (Subtle)
   * Applies very subtle 3D tilt to video based on cursor position
   */
  useEffect(() => {
    if (!isVideoComplete) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position to -1 to 1
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      setMousePosition({ x, y });

      // Apply very subtle 3D transform to video (max 1.5deg)
      if (videoRef.current) {
        gsap.to(videoRef.current, {
          rotateY: x * 1.5,
          rotateX: -y * 1.5,
          duration: 0.8,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isVideoComplete]);

  /**
   * 🔍 TELEMETRY ZONE HOVER HANDLERS
   */
  const handleZoneEnter = (zone: TelemetryZone) => {
    setHoveredZone(zone);
  };

  const handleZoneLeave = () => {
    setHoveredZone(null);
  };

  /**
   * 🧲 MAGNETIC BUTTON LOGIC
   * Makes buttons "pull" towards the cursor on hover
   */
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>, speed: number = 0.2) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * speed;
    const y = (e.clientY - centerY) * speed;

    gsap.to(btn, {
      x,
      y,
      scale: 1.05,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <>
      {/* Hero Container (Pinned by ScrollTrigger) */}
      <section
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-[#001338]"
      >
        {/* 🎥 SCROLL-JACKED VIDEO BACKGROUND (Cropped to hide watermarks) */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            className="absolute w-full h-full"
            muted
            playsInline
            preload="auto"
            style={{
              objectFit: "cover",
              objectPosition: "center center",
              transform: "scale(1.15)", // Crop 15% to hide VEO watermark and passport edges
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <source src="/videos/olcan-hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Gradient Overlay (Deep Navy → Transparent) + Edge Vignette */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-t from-[#001338] via-[#001338]/70 to-[#001338]/30 pointer-events-none"
        />
        
        {/* Strong Edge Vignette to mask watermarks and weird images */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_80px_rgba(0,19,56,0.9)] pointer-events-none" />

        {/* 📝 TYPOGRAPHY & UI OVERLAY */}
        <div className="relative z-10 h-full flex items-end pb-24 lg:pb-32 px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <span
              ref={eyebrowRef}
              className="inline-block text-[#00BCD4] tracking-widest uppercase text-sm font-bold mb-6"
            >
              De onde você está — para onde quer chegar.
            </span>

            {/* H1 Headline (Staggered Word Reveals) */}
            <h1
              ref={headlineRef}
              className="text-white font-bold text-5xl lg:text-7xl leading-[1.1] mb-10 tracking-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: "var(--font-merriweather-sans, sans-serif)",
                background: "linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <span className="word inline-block">O</span>{" "}
              <span className="word inline-block">mundo</span>{" "}
              <span className="word inline-block">é</span>{" "}
              <span className="word inline-block">seu.</span>
              <br />
              <span className="word inline-block">Você</span>{" "}
              <span className="word inline-block">só</span>{" "}
              <span className="word inline-block">precisa</span>{" "}
              <span className="word inline-block">das</span>{" "}
              <span className="word inline-block">ferramentas</span>{" "}
              <span className="word inline-block">certas</span>
              <br />
              <span className="word inline-block">para</span>{" "}
              <span className="word inline-block">atravessá-lo.</span>
        </h1>

            {/* 🎯 METAMODERN CTAs */}
            <div
              ref={ctaContainerRef}
              className="flex flex-wrap gap-4 items-center"
            >
              {/* Primary CTA (Cyan Accent) */}
              <Link
                href="/diagnostico"
                onMouseMove={(e) => handleMagneticMove(e, 0.3)}
                onMouseLeave={handleMagneticLeave}
                className="group relative overflow-hidden px-8 py-4 bg-[#00BCD4] text-[#001338] font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00BCD4]/50"
              >
                {/* Sliding background layer */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                
                <span className="relative flex items-center gap-2">
                  Iniciar Diagnóstico Estratégico
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Secondary CTA (Ghost) */}
              <Link
                href="/marketplace"
                onMouseMove={(e) => handleMagneticMove(e, 0.2)}
                onMouseLeave={handleMagneticLeave}
                className="group relative overflow-hidden px-8 py-4 border border-white/30 text-white font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10"
              >
                <span className="relative flex items-center gap-2">
                  Ver produtos
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🔍 INTERACTIVE TELEMETRY OVERLAY (Unlocked at 100%) */}
        {isVideoComplete && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {TELEMETRY_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="absolute pointer-events-auto cursor-none"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
                onMouseEnter={() => handleZoneEnter(zone)}
                onMouseLeave={handleZoneLeave}
              >
                {/* Invisible hitbox */}
                <div className="w-full h-full" />
              </div>
            ))}

            {/* 💧 LIQUID GLASS TOOLTIP */}
            {hoveredZone && (
              <div
                className="absolute pointer-events-none transition-all duration-300"
                style={{
                  left: `${hoveredZone.x + hoveredZone.width / 2}%`,
                  top: `${hoveredZone.y + hoveredZone.height / 2}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-2xl shadow-black/40">
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                    [{hoveredZone.label}: Active]
                  </div>
                  <div className="text-white text-lg font-semibold tracking-tight">
                    {hoveredZone.metric}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default CinematicHeroSection;
