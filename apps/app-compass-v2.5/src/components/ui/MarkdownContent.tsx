"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * MarkdownContent v2.5
 * Renderizador leve e estilizado para documentos da Wiki.
 * Focado em legibilidade high-end e fidelidade aos documentos OIOS.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  // Parser simples para transformar MD em elementos React (Heuristic)
  const lines = content.split("\n");

  return (
    <div className={cn("prose prose-slate max-w-none dark:prose-invert", className)}>
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("# ")) return <h1 key={i} className="text-4xl font-black mb-8 text-slate-950">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold mt-12 mb-4 text-slate-900 border-b border-slate-100 pb-2">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-bold mt-8 mb-3 text-slate-800">{line.slice(4)}</h3>;
        
        // Lists
        if (line.trim().startsWith("- ")) {
          return (
            <div key={i} className="flex gap-3 mb-2 items-start text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>{parseInline(line.trim().slice(2))}</span>
            </div>
          );
        }

        // Quote
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-slate-300 pl-6 my-6 italic text-slate-500 bg-slate-50/50 py-4 rounded-r-xl">
              {line.slice(2)}
            </blockquote>
          );
        }

        // Empty
        if (!line.trim()) return <div key={i} className="h-4" />;

        // Paragraph
        return (
          <p key={i} className="text-slate-600 leading-relaxed mb-4">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parser de Estilos Inline (Bold, Links)
 */
function parseInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-slate-950 font-bold">{part.slice(2, -2)}</strong>;
    }
    // Simple Wiki Links [[Category/Slug]]
    if (part.includes("[[") && part.includes("]]")) {
      const linkMatch = part.match(/\[\[(.*?)\]\]/);
      if (linkMatch) {
         return <span key={i} className="text-blue-600 font-medium">[{linkMatch[1]}]</span>;
      }
    }
    return part;
  });
}
