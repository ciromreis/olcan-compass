import type { ToastItem } from "@/components/ui";

export type CommunitySaveFeedbackKind = "forge" | "applications" | "routes";

const COMMUNITY_SAVE_FEEDBACK: Record<CommunitySaveFeedbackKind, Pick<ToastItem, "title" | "description" | "variant">> = {
  forge: {
    title: "Salvo na comunidade",
    description: "Este documento agora pode servir como referência reutilizável nas suas coleções.",
    variant: "success",
  },
  applications: {
    title: "Salvo na comunidade",
    description: "Esta candidatura agora pode servir como referência reutilizável nas suas coleções.",
    variant: "success",
  },
  routes: {
    title: "Salvo na comunidade",
    description: "Esta rota agora pode servir como referência reutilizável nas suas coleções.",
    variant: "success",
  },
};

export function getCommunitySaveFeedback(kind: CommunitySaveFeedbackKind): Pick<ToastItem, "title" | "description" | "variant"> {
  return COMMUNITY_SAVE_FEEDBACK[kind];
}
