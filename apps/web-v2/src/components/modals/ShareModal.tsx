"use client";

import { useState } from "react";
import { X, Copy, Mail, Link as LinkIcon, CheckCircle, Share2 } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

export default function ShareModal({
  open,
  onClose,
  title = "Compartilhar",
  url = "https://app.olcan.com/shared/abc123",
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-moss-500" />
          <h2 className="font-heading text-h3 text-text-primary">{title}</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" readOnly value={url} className="flex-1 px-3 py-2 rounded-lg border border-cream-500 bg-cream-50 text-body-sm text-text-primary" />
          <button onClick={handleCopy} className="px-3 py-2 rounded-lg bg-moss-500 text-white hover:bg-moss-600 transition-colors">
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-cream-50 hover:bg-cream-100 transition-colors text-left">
            <Mail className="w-4 h-4 text-text-muted" />
            <span className="text-body-sm text-text-primary">Enviar por e-mail</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-cream-50 hover:bg-cream-100 transition-colors text-left">
            <LinkIcon className="w-4 h-4 text-text-muted" />
            <span className="text-body-sm text-text-primary">Gerar link público</span>
          </button>
        </div>
      </div>
    </div>
  );
}
