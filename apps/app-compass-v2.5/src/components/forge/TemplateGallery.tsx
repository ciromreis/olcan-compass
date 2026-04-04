"use client";

import { useState } from "react";
import { FileText, Briefcase, GraduationCap, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";
import { CV_TEMPLATES, type CVTemplate } from "./CVTemplates";

interface TemplateGalleryProps {
  onSelectTemplate?: (template: CVTemplate) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const templateIcons = {
    professional: Briefcase,
    academic: GraduationCap,
    creative: Sparkles,
    minimal: FileText,
  };

  const handleSelect = (template: CVTemplate) => {
    setSelectedId(template.id);
    onSelectTemplate?.(template);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-heading text-h3 text-text-primary mb-2">
          Escolha seu Template
        </h3>
        <p className="text-body-sm text-text-secondary">
          Templates profissionais otimizados para ATS e mercado internacional
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CV_TEMPLATES.map((template, idx) => {
          const Icon = templateIcons[template.id as keyof typeof templateIcons] || FileText;
          const isSelected = selectedId === template.id;

          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelect(template)}
              className={`group relative text-left transition-all ${
                isSelected ? "scale-105" : "hover:scale-102"
              }`}
            >
              {/* Card */}
              <div
                className={`rounded-2xl border-2 p-6 transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/20"
                    : "border-cream-200 bg-white hover:border-brand-300 hover:shadow-md"
                }`}
              >
                {/* Preview Visual */}
                <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-cream-50 to-cream-100 p-4 overflow-hidden relative">
                  {/* Template Preview Mockup */}
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
                      <div className="w-10 h-10 rounded-full bg-brand-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-24 bg-cream-300 rounded" />
                        <div className="h-1.5 w-16 bg-cream-200 rounded" />
                      </div>
                    </div>

                    {/* Content Lines */}
                    <div className="space-y-1.5 pt-2">
                      {[90, 75, 85, 70, 80, 65].map((width, i) => (
                        <div
                          key={i}
                          className="h-1.5 bg-cream-200 rounded"
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>

                    {/* Sections */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="space-y-1">
                        <div className="h-1.5 w-12 bg-brand-300 rounded" />
                        <div className="h-1 w-16 bg-cream-200 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-12 bg-moss-300 rounded" />
                        <div className="h-1 w-16 bg-cream-200 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-brand-500 text-white"
                        : "bg-brand-100 text-brand-600 group-hover:bg-brand-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-body font-semibold text-text-primary mb-1">
                      {template.name}
                    </h4>
                    <p className="text-caption text-text-muted line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-caption font-bold ${
                      isSelected
                        ? "bg-brand-200 text-brand-700"
                        : "bg-cream-100 text-text-muted"
                    }`}
                  >
                    ATS Otimizado
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-caption font-bold ${
                      isSelected
                        ? "bg-brand-200 text-brand-700"
                        : "bg-cream-100 text-text-muted"
                    }`}
                  >
                    Profissional
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="text-body-sm text-brand-700">
          <Sparkles className="inline w-4 h-4 mr-1" />
          Todos os templates são otimizados para ATS e incluem seções personalizáveis
        </p>
      </div>
    </div>
  );
}
