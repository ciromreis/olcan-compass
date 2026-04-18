"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuraStore } from "@/stores/auraStore";

/**
 * Listens to Aura store events and surfaces lightweight toasts for feedback.
 */
export function AuraNotificationSystem() {
  const { toast } = useToast();
  const onAuraEvent = useAuraStore((s) => s.onAuraEvent);

  useEffect(() => {
    const unsub = onAuraEvent((event) => {
      switch (event.type) {
        case "aura.cared": {
          const xp = event.payload.xpGained;
          if (typeof xp === "number" && xp > 0) {
            toast({
              title: "XP recebido",
              description: `+${xp} XP pela atividade com a Aura.`,
              variant: "success",
              duration: 3000,
            });
          }
          break;
        }
        case "aura.leveled": {
          const level = event.payload.newLevel;
          toast({
            title: "Nova evolução",
            description:
              typeof level === "number"
                ? `Sua Aura alcançou o nível ${level}.`
                : "Sua Aura evoluiu.",
            variant: "info",
            duration: 5000,
          });
          break;
        }
        case "aura.ability_unlocked": {
          const name = event.payload.name;
          toast({
            title: "Habilidade desbloqueada",
            description: typeof name === "string" ? name : "Nova habilidade disponível.",
            variant: "info",
            duration: 5000,
          });
          break;
        }
        default:
          break;
      }
    });

    return () => unsub();
  }, [onAuraEvent, toast]);

  return null;
}
