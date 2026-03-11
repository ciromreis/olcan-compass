import type { Sprint } from "@/stores/sprints";
import { normalizeForComparison } from "./text-normalize";

export interface SubmissionCriterion {
  label: string;
  met: boolean;
  current: string;
}

export interface SubmissionGateEvaluation {
  criteria: SubmissionCriterion[];
  metCount: number;
  canSubmit: boolean;
  totalScore: number;
  scores: {
    financial: number;
    documental: number;
    linguistic: number;
    psychological: number;
    logistical: number;
  };
}

export function computeSprintDimensionScore(sprints: Sprint[], match: string): number {
  const normalizedMatch = normalizeForComparison(match);
  const matching = sprints.filter((sprint) =>
    normalizeForComparison(sprint.dimension).includes(normalizedMatch)
  );
  if (matching.length === 0) return 0;
  const totalTasks = matching.reduce((sum, sprint) => sum + sprint.tasks.length, 0);
  if (totalTasks === 0) return 0;
  const doneTasks = matching.reduce((sum, sprint) => sum + sprint.tasks.filter((task) => task.done).length, 0);
  return Math.round((doneTasks / totalTasks) * 100);
}

interface EvaluateSubmissionGateInput {
  sprints: Sprint[];
  psychComplete: boolean;
  psychScore: number;
  avgRouteProgress: number;
  forgeDocumentsCount: number;
}

export function evaluateSubmissionGate(input: EvaluateSubmissionGateInput): SubmissionGateEvaluation {
  const financial = computeSprintDimensionScore(input.sprints, "financ");
  const documental = computeSprintDimensionScore(input.sprints, "document");
  const linguistic = computeSprintDimensionScore(input.sprints, "linguist");
  const psychological = input.psychComplete ? input.psychScore : 0;
  const logistical = Math.min(input.avgRouteProgress, 100);

  const totalScore = Math.round(
    financial * 0.3 +
      documental * 0.25 +
      linguistic * 0.2 +
      psychological * 0.15 +
      logistical * 0.1
  );

  const criteria: SubmissionCriterion[] = [
    { label: "Score de Prontidão ≥ 60", met: totalScore >= 60, current: String(totalScore) },
    { label: "Dimensão Financeira ≥ 50", met: financial >= 50, current: String(financial) },
    { label: "Dimensão Documental ≥ 70", met: documental >= 70, current: String(documental) },
    { label: "Dimensão Linguística ≥ 70", met: linguistic >= 70, current: String(linguistic) },
    { label: "Diagnóstico psicológico completo", met: input.psychComplete, current: input.psychComplete ? String(psychological) : "Pendente" },
    {
      label: "Pelo menos 1 documento no Forge",
      met: input.forgeDocumentsCount >= 1,
      current: `${input.forgeDocumentsCount} documento${input.forgeDocumentsCount !== 1 ? "s" : ""}`,
    },
  ];

  const metCount = criteria.filter((criterion) => criterion.met).length;

  return {
    criteria,
    metCount,
    canSubmit: metCount === criteria.length,
    totalScore,
    scores: {
      financial,
      documental,
      linguistic,
      psychological,
      logistical,
    },
  };
}
