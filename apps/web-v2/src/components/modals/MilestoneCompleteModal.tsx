"use client";

import { X, Trophy, ArrowRight, Sparkles } from "lucide-react";

interface MilestoneCompleteModalProps {
  open: boolean;
  onClose: () => void;
  milestone?: string;
  nextMilestone?: string;
}

export default function MilestoneCompleteModal({
  open,
  onClose,
  milestone = "Documentação Completa",
  nextMilestone = "Submissão da Candidatura",
}: MilestoneCompleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-7 h-7 text-brand-500" />
        </div>
        <div className="flex items-center justify-center gap-1 mb-2">
          <Sparkles className="w-4 h-4 text-clay-500" />
          <span className="text-caption font-heading font-semibold text-clay-500 uppercase tracking-wider">Milestone Concluído!</span>
          <Sparkles className="w-4 h-4 text-clay-500" />
        </div>
        <h2 className="font-heading text-h3 text-text-primary mb-2">{milestone}</h2>
        <p className="text-body-sm text-text-secondary mb-6">Parabéns! Você completou mais uma etapa importante da sua jornada.</p>
        {nextMilestone && (
          <div className="p-3 rounded-xl bg-cream-50 mb-4">
            <p className="text-caption text-text-muted">Próximo milestone</p>
            <p className="text-body-sm font-medium text-text-primary flex items-center justify-center gap-1">
              <ArrowRight className="w-3 h-3 text-brand-500" /> {nextMilestone}
            </p>
          </div>
        )}
        <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          Continuar Jornada
        </button>
      </div>
    </div>
  );
}
