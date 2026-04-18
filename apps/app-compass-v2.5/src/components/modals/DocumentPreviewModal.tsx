"use client";

import { X, Download, ExternalLink, FileText } from "lucide-react";

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

export default function DocumentPreviewModal({
  open,
  onClose,
  title = "Carta de Motivação — v3",
  content,
}: DocumentPreviewModalProps) {
  if (!open) return null;

  const paragraphs = (content ?? "")
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasContent = paragraphs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cream-300">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            <h2 className="font-heading text-h4 text-text-primary">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-cream-200 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!hasContent}
              aria-label="Baixar documento"
            >
              <Download className="w-4 h-4 text-text-muted" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-cream-200 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!hasContent}
              aria-label="Abrir documento em nova visualização"
            >
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {hasContent ? (
            <div className="prose prose-sm max-w-none">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-body text-text-primary mb-4 leading-relaxed">{para}</p>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 text-center">
              <div>
                <p className="font-heading text-h5 text-text-primary">Prévia indisponível</p>
                <p className="mt-2 text-body-sm text-text-secondary">
                  Este documento ainda não possui conteúdo renderizável para pré-visualização.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
