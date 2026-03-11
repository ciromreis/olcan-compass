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
              className={`rounded-2xl border p-5 ${current ? "border-moss-500 bg-moss-50" : "border-cream-400 bg-cream-50"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${current ? "bg-moss-100" : "bg-white"}`}>
                      {plan.id === "premium" ? <Crown className="w-4 h-4 text-clay-500" /> : <Sparkles className="w-4 h-4 text-moss-500" />}
                    </div>
                    <h3 className="font-heading text-h4 text-text-primary">{plan.name}</h3>
                  </div>
                  <p className="text-body-sm text-text-secondary">{plan.description}</p>
                </div>
                {current && <span className="text-caption px-2 py-1 rounded-full bg-moss-500 text-white font-medium">Atual</span>}
              </div>

              <p className="font-heading text-h2 text-text-primary mb-4">{plan.price}</p>

              <div className="space-y-2 mb-5">
                {plan.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2 text-body-sm text-text-secondary">
                    <Zap className="w-4 h-4 mt-0.5 text-moss-500 flex-shrink-0" />
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
