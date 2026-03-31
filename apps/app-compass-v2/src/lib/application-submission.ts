import type { UserApplication } from "@/stores/applications";
import type { SubmissionGateEvaluation } from "@/lib/readiness-gate";

export interface SubmissionEligibility {
  eligible: boolean;
  allDocumentsReady: boolean;
  pendingDocumentCount: number;
  reason?: string;
}

export function evaluateApplicationSubmissionEligibility(
  application: UserApplication,
  gate: Pick<SubmissionGateEvaluation, "canSubmit">
): SubmissionEligibility {
  const readyDocs = application.documents.filter((document) => document.status === "ready").length;
  const allDocumentsReady = readyDocs === application.documents.length;
  const pendingDocumentCount = application.documents.length - readyDocs;

  if (!allDocumentsReady) {
    return {
      eligible: false,
      allDocumentsReady,
      pendingDocumentCount,
      reason: `Finalize ${pendingDocumentCount} documento(s) pendente(s) antes da submissão.`,
    };
  }

  if (!gate.canSubmit) {
    return {
      eligible: false,
      allDocumentsReady,
      pendingDocumentCount: 0,
      reason: "Gate de prontidão bloqueado. Complete os critérios em /readiness/gate.",
    };
  }

  return {
    eligible: true,
    allDocumentsReady,
    pendingDocumentCount: 0,
  };
}
