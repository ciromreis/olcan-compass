"use client";

import { Crown, Sparkles, Zap } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface UpgradePlan {
  id: string;
  name: string;
  price: string;
  description: string;
  highlights: string[];
}

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (planId: string) => void;
  currentPlanId?: string;
  plans: UpgradePlan[];
}

function UpgradeModal({ open, onClose, onSelect, currentPlanId, plans }: UpgradeModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Escolha seu próximo plano"
      description="Desbloqueie mais profundidade, velocidade e inteligência na sua jornada."
    >
      <div className="grid md:grid-cols-2 gap-4 mt-2">
        {plans.map((plan) => {
          const current = plan.id === currentPlanId;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 ${current ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${current ? "bg-slate-200" : "bg-slate-50"}`}>
                      {plan.id === "premium" ? <Crown className="w-4 h-4 text-slate-800" /> : <Sparkles className="w-4 h-4 text-slate-700" />}
                    </div>
                    <h3 className="font-heading text-h4 text-text-primary">{plan.name}</h3>
                  </div>
                  <p className="text-body-sm text-text-secondary">{plan.description}</p>
                </div>
                {current && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold uppercase tracking-wider">Atual</span>}
              </div>

              <p className="font-heading text-h2 text-text-primary mb-4">{plan.price}</p>

              <div className="space-y-2 mb-5">
                {plan.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2 text-body-sm text-text-secondary">
                    <Zap className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={plan.id === "premium" ? "accent" : "primary"}
                disabled={current}
                onClick={() => onSelect(plan.id)}
              >
                {current ? "Plano atual" : "Continuar"}
              </Button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export { UpgradeModal, type UpgradeModalProps, type UpgradePlan };
