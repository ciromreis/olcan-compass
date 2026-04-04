import { describe, expect, it } from "vitest";
import { evaluateApplicationSubmissionEligibility } from "./application-submission";
import type { UserApplication } from "../stores/applications";

const baseApplication: UserApplication = {
  id: "app_1",
  program: "MSc Computer Science",
  type: "Mestrado",
  country: "Alemanha",
  deadline: "2026-05-01",
  status: "in_progress",
  match: 85,
  createdAt: "2026-03-10",
  notes: "",
  timeline: [],
  documents: [
    { id: "d1", name: "CV", status: "ready" },
    { id: "d2", name: "Carta", status: "ready" },
  ],
};

describe("application submission eligibility", () => {
  it("is eligible when all docs are ready and gate is open", () => {
    const result = evaluateApplicationSubmissionEligibility(baseApplication, { canSubmit: true });
    expect(result.eligible).toBe(true);
    expect(result.allDocumentsReady).toBe(true);
    expect(result.pendingDocumentCount).toBe(0);
  });

  it("is ineligible when documents are pending", () => {
    const appWithPendingDoc: UserApplication = {
      ...baseApplication,
      documents: [
        { id: "d1", name: "CV", status: "ready" },
        { id: "d2", name: "Carta", status: "pending" },
      ],
    };

    const result = evaluateApplicationSubmissionEligibility(appWithPendingDoc, { canSubmit: true });
    expect(result.eligible).toBe(false);
    expect(result.allDocumentsReady).toBe(false);
    expect(result.pendingDocumentCount).toBe(1);
    expect(result.reason).toContain("documento(s) pendente(s)");
  });

  it("is ineligible when gate is blocked even if docs are ready", () => {
    const result = evaluateApplicationSubmissionEligibility(baseApplication, { canSubmit: false });
    expect(result.eligible).toBe(false);
    expect(result.allDocumentsReady).toBe(true);
    expect(result.pendingDocumentCount).toBe(0);
    expect(result.reason).toContain("Gate de prontidão bloqueado");
  });
});

