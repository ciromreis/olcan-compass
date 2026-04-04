import type { ForgeDocument } from "@/stores/forge";
import type { InterviewSession } from "@/stores/interviews";

export interface ForgeInterviewSuggestion {
  id: string;
  title: string;
  text: string;
  tone: "brand" | "clay" | "sage";
}

export interface ForgeInterviewInsights {
  linkedSessions: InterviewSession[];
  latestSession: InterviewSession | null;
  averageScore: number | null;
  alignmentScore: number | null;
  evidenceCoverage: number | null;
  averageTimeSeconds: number | null;
  suggestions: ForgeInterviewSuggestion[];
}

function extractTerms(...values: Array<string | undefined>): string[] {
  const stopwords = new Set([
    "para", "como", "sobre", "entre", "your", "with", "from", "this", "that",
    "program", "programa", "documento", "statement", "letter", "carta", "personal",
    "research", "proposal", "curriculo", "currículo",
  ]);

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .join(" ")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/\s+/)
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 5 && !stopwords.has(term))
    )
  ).slice(0, 6);
}

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function linkSessions(doc: ForgeDocument, sessions: InterviewSession[]): InterviewSession[] {
  const docTitle = normalize(doc.title);
  const target = normalize(doc.targetProgram);

  return sessions.filter((session) => {
    if (session.sourceDocumentId && session.sourceDocumentId === doc.id) return true;
    const sourceTitle = normalize(session.sourceDocumentTitle);
    const sessionTarget = normalize(session.target);

    return Boolean(
      (docTitle && sourceTitle && sourceTitle.includes(docTitle)) ||
      (target && sessionTarget && sessionTarget.includes(target))
    );
  });
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function deriveForgeInterviewInsights(
  doc: ForgeDocument,
  sessions: InterviewSession[]
): ForgeInterviewInsights {
  const linkedSessions = linkSessions(doc, sessions).sort((a, b) => {
    const left = new Date(b.completedAt || b.startedAt).getTime();
    const right = new Date(a.completedAt || a.startedAt).getTime();
    return left - right;
  });
  const latestSession = linkedSessions[0] || null;

  if (linkedSessions.length === 0) {
    return {
      linkedSessions,
      latestSession,
      averageScore: null,
      alignmentScore: null,
      evidenceCoverage: null,
      averageTimeSeconds: null,
      suggestions: [
        {
          id: "start-training",
          title: "Abrir treino contextual",
          text: "Rode uma primeira simulação com este dossiê para descobrir quais provas, exemplos e trechos ainda não sobrevivem à fala.",
          tone: "brand",
        },
        {
          id: "prepare-evidence",
          title: "Separar três evidências-chave",
          text: "Antes do treino, deixe neste texto três evidências concretas que você quer conseguir verbalizar sem esforço.",
          tone: "sage",
        },
      ],
    };
  }

  const docTerms = extractTerms(doc.title, doc.targetProgram, doc.content.slice(0, 220));
  const allAnswers = linkedSessions.flatMap((session) => session.answers);
  const answerTexts = allAnswers.map((answer) => answer.answer.toLowerCase());
  const answersWithTerms = docTerms.length === 0
    ? []
    : answerTexts.filter((answer) => docTerms.some((term) => answer.includes(term)));
  const answersWithEvidence = answerTexts.filter((answer) =>
    /\d/.test(answer) || answer.includes("resultado") || answer.includes("impacto") || answer.includes("projeto")
  );

  const averageScore = average(linkedSessions.map((session) => session.overallScore || 0));
  const alignmentScore = docTerms.length === 0 || allAnswers.length === 0
    ? null
    : Math.round((answersWithTerms.length / allAnswers.length) * 100);
  const evidenceCoverage = allAnswers.length === 0
    ? null
    : Math.round((answersWithEvidence.length / allAnswers.length) * 100);
  const averageTimeSeconds = average(allAnswers.map((answer) => answer.timeSpent));

  const suggestions: ForgeInterviewSuggestion[] = [];

  if ((alignmentScore ?? 100) < 65) {
    suggestions.push({
      id: "alignment",
      title: "Reforçar coerência entre texto e fala",
      text: "O treino ainda não recupera com consistência os sinais centrais deste dossiê. Vale destacar melhor os mesmos termos, metas e provas nas primeiras seções do texto.",
      tone: "clay",
    });
  }

  if ((evidenceCoverage ?? 100) < 60) {
    suggestions.push({
      id: "evidence",
      title: "Adicionar prova concreta",
      text: "As respostas ainda dependem pouco de fatos observáveis. Inclua resultados, métricas ou episódios específicos que possam ser reutilizados em entrevista.",
      tone: "clay",
    });
  }

  if ((averageTimeSeconds ?? 0) > 135) {
    suggestions.push({
      id: "trim",
      title: "Enxugar blocos longos",
      text: "O tempo médio está acima do ideal para uma resposta oral. Revise parágrafos extensos e transforme trechos densos em estruturas mais diretas.",
      tone: "brand",
    });
  }

  if ((averageScore ?? 0) >= 78 && latestSession) {
    suggestions.push({
      id: "reuse-strengths",
      title: "Capturar o que já funcionou",
      text: "Há sinais fortes no treino recente. Aproveite os argumentos que pontuaram melhor e reescreva o opening do documento com a mesma clareza.",
      tone: "sage",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "maintain-loop",
      title: "Manter o ciclo de calibração",
      text: "Texto e fala estão razoavelmente coerentes. O próximo ganho tende a vir de pequenos refinamentos por rota, especialmente no opening e no fechamento.",
      tone: "sage",
    });
  }

  return {
    linkedSessions,
    latestSession,
    averageScore,
    alignmentScore,
    evidenceCoverage,
    averageTimeSeconds,
    suggestions,
  };
}
