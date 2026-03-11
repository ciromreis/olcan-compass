"use client";

import { useState } from "react";
import { X, Star, Send } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onSubmit?: (rating: number, comment: string) => void;
}

export default function FeedbackModal({
  open,
  onClose,
  title = "Avaliar",
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit?.(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <h2 className="font-heading text-h3 text-text-primary mb-4 text-center">{title}</h2>
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="p-1"
            >
              <Star className={`w-8 h-8 transition-colors ${s <= (hover || rating) ? "text-clay-500 fill-current" : "text-cream-400"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência (opcional)..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none mb-4"
        />
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" /> Enviar Avaliação
        </button>
      </div>
    </div>
  );
}
