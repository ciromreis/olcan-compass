"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui";
import { marketplaceApi } from "@/lib/api";

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  bookingId,
  providerId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma avaliação de 1 a 5 estrelas.",
        variant: "warning",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comentário necessário",
        description: "Por favor, escreva um comentário sobre sua experiência.",
        variant: "warning",
      });
      return;
    }

    if (comment.length > 500) {
      toast({
        title: "Comentário muito longo",
        description: "O comentário deve ter no máximo 500 caracteres.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await marketplaceApi.createReview(bookingId, {
        rating,
        comment: comment.trim(),
        communicationRating: rating,
        expertiseRating: rating,
        valueRating: rating,
        wouldRecommend: rating >= 4,
        title: `Avaliação ${rating}/5`,
        isPublic: true,
      });

      toast({
        title: "Avaliação enviada",
        description: "Obrigado por compartilhar sua experiência!",
        variant: "success",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Review submission failed:", error);
      toast({
        title: "Erro ao enviar avaliação",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
        variant: "warning",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Avaliação
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded"
              aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-slate-400 text-slate-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-text-muted mt-2">
            {rating === 1 && "Muito insatisfeito"}
            {rating === 2 && "Insatisfeito"}
            {rating === 3 && "Neutro"}
            {rating === 4 && "Satisfeito"}
            {rating === 5 && "Muito satisfeito"}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Seu Comentário
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência com este prestador de serviços..."
          rows={5}
          maxLength={500}
          className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-colors resize-none"
          required
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-text-muted">
            Seja específico e construtivo em seu feedback
          </p>
          <p
            className={`text-xs ${comment.length > 450 ? "text-slate-600 font-medium" : "text-text-muted"}`}
          >
            {comment.length} / 500
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-cream-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-cream-300 rounded-lg text-text-secondary font-medium hover:bg-cream-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="px-5 py-2.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Avaliação"
          )}
        </button>
      </div>
    </form>
  );
}
