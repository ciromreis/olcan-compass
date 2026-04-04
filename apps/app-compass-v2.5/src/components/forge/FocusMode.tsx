"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";

interface FocusModeProps {
  children: React.ReactNode;
  isFocused: boolean;
  onToggle: () => void;
}

export function FocusMode({ children, isFocused, onToggle }: FocusModeProps) {
  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFocused]);

  const handleToggle = () => {
    try {
      if (!isFocused) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch((err) => console.warn(err));
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => console.warn(err));
        }
      }
    } catch (e) {
      console.warn("Fullscreen API not supported", e);
    }
    onToggle();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocused) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, onToggle]);

  return (
    <>
      <button
        onClick={handleToggle}
        title={isFocused ? "Sair do Focus Mode" : "Modo Foco (Esc)"}
        className={`fixed z-[60] bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 ${isFocused ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" : "bg-brand-500 text-white hover:bg-brand-600 hover:shadow-brand-500/20"}`}
      >
        {isFocused ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 sm:p-8 overflow-y-auto"
          >
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-12">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isFocused ? "invisible h-0 overflow-hidden" : "visible"}>
        {children}
      </div>
    </>
  );
}
