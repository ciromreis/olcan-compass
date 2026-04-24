/**
 * Unified Dossier Readiness Algorithm (v1.0.0)
 *
 * Single source of truth for readiness scoring. Mirrored in
 * apps/api-core-v2.5/app/services/dossier_readiness.py — any change
 * to weights or dimension logic MUST be applied in both files.
 *
 * Weights: documents 40% · tasks 30% · profile 20% · deadline 10%
 */

export const READINESS_WEIGHTS = {
  documents: 0.4,
  tasks: 0.3,
  profile: 0.2,
  deadline: 0.1,
} as const;

export const READINESS_ALGORITHM_VERSION = "1.0.0";

export type ReadinessDimension = keyof typeof READINESS_WEIGHTS;

export interface ReadinessComponent {
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ReadinessBreakdown {
  overall: number;
  components: Record<ReadinessDimension, ReadinessComponent>;
  computedAt: string;
  version: string;
}

export interface ReadinessDocumentInput {
  status:
    | "not_started"
    | "draft"
    | "in_review"
    | "final"
    | "submitted"
    | string;
  completionPercentage?: number;
  metrics?: {
    atsScore?: number;
    competitivenessScore?: number;
    alignmentScore?: number;
  } | null;
}

export interface ReadinessTaskInput {
  status: "todo" | "in_progress" | "blocked" | "done" | "cancelled" | string;
}

export interface ReadinessProfileScores {
  logistic?: number;
  narrative?: number;
  performance?: number;
  psychological?: number;
}

export interface ReadinessInput {
  documents: ReadinessDocumentInput[];
  tasks: ReadinessTaskInput[];
  profileScores?: ReadinessProfileScores | null;
  deadline?: Date | string | null;
  dossierStatus?: string | null;
  now?: Date;
}

function scoreDocuments(docs: ReadinessDocumentInput[]): {
  score: number;
  explanation: string;
} {
  if (docs.length === 0) {
    return {
      score: 0,
      explanation:
        "No documents yet. Add the required documents to start scoring.",
    };
  }

  let weightedSum = 0;
  let finalCount = 0;

  for (const doc of docs) {
    const completion = Number(doc.completionPercentage ?? 0) || 0;

    let completeness: number;
    if (doc.status === "submitted" || doc.status === "final") {
      completeness = 100;
      finalCount += 1;
    } else if (doc.status === "in_review") {
      completeness = Math.max(completion, 75);
    } else {
      completeness = completion;
    }

    const qualitySignals = [
      doc.metrics?.atsScore,
      doc.metrics?.competitivenessScore,
      doc.metrics?.alignmentScore,
    ].filter((s): s is number => typeof s === "number" && !Number.isNaN(s));

    const quality =
      qualitySignals.length > 0
        ? qualitySignals.reduce((a, b) => a + b, 0) / qualitySignals.length
        : 100;

    weightedSum += completeness * (quality / 100);
  }

  const avg = weightedSum / docs.length;
  return {
    score: Math.round(avg),
    explanation: `${finalCount}/${docs.length} documents final; avg score ${Math.round(avg)}/100`,
  };
}

function scoreTasks(tasks: ReadinessTaskInput[]): {
  score: number;
  explanation: string;
} {
  if (tasks.length === 0) {
    return {
      score: 50,
      explanation:
        "No tasks defined yet. Generate a checklist to track preparation.",
    };
  }

  const active = tasks.filter((t) => t.status !== "cancelled");
  if (active.length === 0) {
    return { score: 50, explanation: "All tasks cancelled. Re-plan the dossier." };
  }

  const done = active.filter((t) => t.status === "done").length;
  const inProgress = active.filter((t) => t.status === "in_progress").length;
  const blocked = active.filter((t) => t.status === "blocked").length;

  const raw = (done + inProgress * 0.5 - blocked * 0.25) / active.length;
  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  return {
    score,
    explanation: `${done}/${active.length} tasks done, ${inProgress} in progress, ${blocked} blocked`,
  };
}

function scoreProfile(profile: ReadinessProfileScores | null | undefined): {
  score: number;
  explanation: string;
} {
  if (!profile) {
    return {
      score: 0,
      explanation:
        "Profile snapshot not captured yet. Complete the OIOS diagnostic.",
    };
  }

  const values = [
    profile.logistic,
    profile.narrative,
    profile.performance,
    profile.psychological,
  ].filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

  if (values.length === 0) {
    return {
      score: 0,
      explanation:
        "Profile present but no readiness scores. Complete the OIOS diagnostic.",
    };
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    score: Math.round(avg),
    explanation: `OIOS average across ${values.length} dimensions: ${Math.round(avg)}/100`,
  };
}

function scoreDeadline(
  deadline: Date | string | null | undefined,
  dossierStatus: string | null | undefined,
  now: Date,
): { score: number; explanation: string } {
  if (dossierStatus === "submitted" || dossierStatus === "completed") {
    return {
      score: 100,
      explanation: "Dossier submitted. Deadline no longer gates readiness.",
    };
  }
  if (!deadline) {
    return {
      score: 50,
      explanation: "No deadline set. Cannot assess time pressure.",
    };
  }

  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return { score: 50, explanation: "Invalid deadline. Cannot assess time pressure." };
  }

  const msPerDay = 86_400_000;
  const daysRemaining = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / msPerDay,
  );

  if (daysRemaining < 0) {
    const isFinal =
      dossierStatus === "final" ||
      dossierStatus === "review" ||
      dossierStatus === "finalizing";
    return {
      score: isFinal ? 40 : 0,
      explanation: `Deadline passed ${-daysRemaining} days ago. ${
        isFinal ? "Dossier marked final — submit now." : "At risk of missing."
      }`,
    };
  }

  let score: number;
  if (daysRemaining >= 90) score = 100;
  else if (daysRemaining >= 60) score = 90;
  else if (daysRemaining >= 30) score = 75;
  else if (daysRemaining >= 14) score = 55;
  else if (daysRemaining >= 7) score = 35;
  else if (daysRemaining >= 3) score = 20;
  else score = 10;

  return { score, explanation: `${daysRemaining} days until deadline.` };
}

export function computeReadiness(input: ReadinessInput): ReadinessBreakdown {
  const now = input.now ?? new Date();

  const documents = scoreDocuments(input.documents ?? []);
  const tasks = scoreTasks(input.tasks ?? []);
  const profile = scoreProfile(input.profileScores ?? null);
  const deadline = scoreDeadline(
    input.deadline ?? null,
    input.dossierStatus ?? null,
    now,
  );

  const components: Record<ReadinessDimension, ReadinessComponent> = {
    documents: {
      score: documents.score,
      weight: READINESS_WEIGHTS.documents,
      contribution: documents.score * READINESS_WEIGHTS.documents,
      explanation: documents.explanation,
    },
    tasks: {
      score: tasks.score,
      weight: READINESS_WEIGHTS.tasks,
      contribution: tasks.score * READINESS_WEIGHTS.tasks,
      explanation: tasks.explanation,
    },
    profile: {
      score: profile.score,
      weight: READINESS_WEIGHTS.profile,
      contribution: profile.score * READINESS_WEIGHTS.profile,
      explanation: profile.explanation,
    },
    deadline: {
      score: deadline.score,
      weight: READINESS_WEIGHTS.deadline,
      contribution: deadline.score * READINESS_WEIGHTS.deadline,
      explanation: deadline.explanation,
    },
  };

  const overall = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        components.documents.contribution +
          components.tasks.contribution +
          components.profile.contribution +
          components.deadline.contribution,
      ),
    ),
  );

  return {
    overall,
    components,
    computedAt: now.toISOString(),
    version: READINESS_ALGORITHM_VERSION,
  };
}
