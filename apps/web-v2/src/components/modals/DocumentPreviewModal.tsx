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
  content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
}: DocumentPreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cream-300">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-moss-500" />
            <h2 className="font-heading text-h4 text-text-primary">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><Download className="w-4 h-4 text-text-muted" /></button>
            <button className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><ExternalLink className="w-4 h-4 text-text-muted" /></button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {content.split("\n\n").map((para, i) => (
              <p key={i} className="text-body text-text-primary mb-4 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
