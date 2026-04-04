/**
 * Shared content analysis utilities for Forge document evaluation.
 * Used by analysis, competitiveness, alignment, and coach pages.
 * Single source of truth for heuristic scoring logic.
 */

// ── Clichés & specificity detection ──────────────────────────────────────────

const CLICHES_EN = ["passionate about", "unique opportunity", "I believe", "I am confident", "great experience"];
const CLICHES_PT = ["sou apaixonado", "oportunidade única", "acredito que"];
export const CLICHES = [...CLICHES_EN, ...CLICHES_PT];

export const SPECIFICITY_PATTERNS: RegExp[] = [
  /\b(20\d{2})\b/,
  /\b\d+[%+]/,
  /Prof\.|Dr\.|professor/i,
  /\b[A-Z]{2,}\b/,
];

// ── Text metrics ─────────────────────────────────────────────────────────────

export interface TextMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLen: number;
  clicheCount: number;
  foundCliches: string[];
  specificityHits: number;
}

export function computeTextMetrics(content: string): TextMetrics {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = content.split("\n\n").filter(Boolean);
  const lc = content.toLowerCase();
  const foundCliches = CLICHES.filter((c) => lc.includes(c));
  const specificityHits = SPECIFICITY_PATTERNS.filter((r) => r.test(content)).length;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgSentenceLen: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    clicheCount: foundCliches.length,
    foundCliches,
    specificityHits,
  };
}

// ── Dimension analysis (used by analysis page) ──────────────────────────────

export interface AnalysisDimension {
  category: string;
  score: number;
  feedback: string;
}

export function analyzeContent(content: string): AnalysisDimension[] {
  const m = computeTextMetrics(content);

  return [
    {
      category: "Clareza",
      score: clamp(m.avgSentenceLen <= 20 ? 85 : m.avgSentenceLen <= 30 ? 70 : 50),
      feedback: m.avgSentenceLen <= 20
        ? "Boa legibilidade. Frases curtas e claras."
        : `Média de ${m.avgSentenceLen} palavras por frase. Considere simplificar — o ideal é até 20 palavras.`,
    },
    {
      category: "Originalidade",
      score: clamp(m.clicheCount === 0 ? 88 : 88 - m.clicheCount * 12),
      feedback: m.clicheCount === 0
        ? "Sem clichês detectados. Linguagem original."
        : `Detectados ${m.clicheCount} clichês: ${m.foundCliches.map((c) => `\u201C${c}\u201D`).join(", ")}. Substitua por evidências concretas.`,
    },
    {
      category: "Especificidade",
      score: clamp(40 + m.specificityHits * 15, 25),
      feedback: m.specificityHits >= 3
        ? "Bom nível de detalhes específicos (datas, nomes, métricas)."
        : "Adicione mais detalhes concretos: nomes de professores, datas, métricas, resultados quantificáveis.",
    },
    {
      category: "Estrutura",
      score: clamp(m.paragraphCount >= 3 && m.paragraphCount <= 7 ? 85 : m.paragraphCount >= 2 ? 65 : 40),
      feedback: m.paragraphCount >= 3
        ? `Estrutura sólida com ${m.paragraphCount} parágrafos. Boa divisão de ideias.`
        : "Divida o texto em mais parágrafos para melhor organização. O ideal é 3–6 parágrafos.",
    },
    {
      category: "Extensão",
      score: clamp(m.wordCount >= 200 && m.wordCount <= 600 ? 90 : m.wordCount >= 100 ? 65 : 30, 20),
      feedback: m.wordCount < 100
        ? `Apenas ${m.wordCount} palavras. Para a maioria dos documentos, o ideal é 300–500 palavras.`
        : m.wordCount > 600
          ? `${m.wordCount} palavras. Considere editar para ficar entre 300–500 palavras.`
          : `${m.wordCount} palavras. Extensão adequada.`,
    },
  ];
}

// ── Benchmark analysis (used by competitiveness page) ────────────────────────

export interface Benchmark {
  metric: string;
  yours: number;
  average: number;
  top10: number;
}

export function computeBenchmarks(content: string): Benchmark[] {
  const m = computeTextMetrics(content);
  const lc = content.toLowerCase();

  return [
    { metric: "Especificidade", yours: clamp(35 + m.specificityHits * 15), average: 55, top10: 90 },
    { metric: "Originalidade", yours: clamp(85 - m.clicheCount * 12), average: 48, top10: 85 },
    { metric: "Evidências concretas", yours: clamp(30 + (/\d/.test(content) ? 25 : 0) + (m.specificityHits >= 2 ? 25 : 0)), average: 52, top10: 92 },
    { metric: "Personalização", yours: clamp(35 + (lc.match(/prof\.|dr\.|professor|group|lab|research/gi) || []).length * 12), average: 45, top10: 88 },
    { metric: "Estrutura", yours: clamp(m.paragraphCount >= 3 && m.paragraphCount <= 7 ? 85 : m.paragraphCount >= 2 ? 65 : 40), average: 65, top10: 95 },
    { metric: "Clareza linguística", yours: clamp(m.sentenceCount > 0 ? (m.avgSentenceLen <= 20 ? 85 : 65) : 30), average: 60, top10: 90 },
  ];
}

// ── Alignment check (used by alignment page) ─────────────────────────────────

export interface AlignmentCriterion {
  label: string;
  met: boolean;
  note: string;
}

export function checkAlignment(content: string, targetProgram?: string): AlignmentCriterion[] {
  const lc = content.toLowerCase();
  const target = (targetProgram || "").toLowerCase();
  const targetPrefix = target.split("—")[0]?.trim().toLowerCase().slice(0, 10) || "";
  const targetInstitution = target.split("—")[1]?.trim().toLowerCase().slice(0, 8) || "";

  return [
    {
      label: "Menciona o nome do programa corretamente",
      met: targetPrefix.length > 3 && lc.includes(targetPrefix),
      note: target ? `Programa-alvo: ${targetProgram}` : "Nenhum programa-alvo definido — adicione nas configurações do documento.",
    },
    {
      label: "Referencia professor ou grupo de pesquisa",
      met: /prof\.|dr\.|professor|research group|grupo de pesquisa|lab\b/i.test(content),
      note: /prof\.|dr\./i.test(content) ? "Referência a professor encontrada." : "Mencione um professor ou grupo de pesquisa para demonstrar interesse específico.",
    },
    {
      label: "Conecta experiência prévia com o programa",
      met: /experience|experiência|project|projeto|work|trabalh|developed|desenvolv/i.test(content),
      note: /experience|experiência/i.test(content) ? "Conexão com experiência prévia identificada." : "Conecte suas experiências anteriores com o que o programa oferece.",
    },
    {
      label: "Demonstra conhecimento da instituição",
      met: /university|universidade|institut|campus|faculty|faculdade/i.test(content) || (targetInstitution.length > 3 && lc.includes(targetInstitution)),
      note: "Mencione aspectos específicos da instituição: cultura, projetos, rankings, localização.",
    },
    {
      label: "Explica motivação pessoal específica",
      met: /because|porque|razão|motiv|interest|interesse|drawn to|atraído/i.test(content),
      note: "Explique por que este programa especificamente, e não outro similar.",
    },
    {
      label: "Apresenta plano pós-formação",
      met: /after|após|career|carreira|goal|objetivo|future|futuro|plan|plano/i.test(content),
      note: "Compartilhe seus objetivos de carreira ou pesquisa após concluir o programa.",
    },
    {
      label: "Tom adequado ao contexto",
      met: content.length > 100 && !/lol|haha|btw|gonna|wanna/i.test(content),
      note: content.length < 100 ? "Documento muito curto para avaliar o tom." : "Tom formal e profissional.",
    },
  ];
}

// ── Coach tips (used by coach page) ──────────────────────────────────────────

export function generateCoachTips(content: string, targetProgram?: string): string[] {
  const m = computeTextMetrics(content);
  const tips: string[] = [];

  if (m.wordCount < 50) tips.push("Seu documento está muito curto. Comece descrevendo sua motivação principal.");
  if (!/prof\.|dr\.|professor/i.test(content)) tips.push("Mencione um professor ou grupo de pesquisa do programa para mostrar interesse concreto.");
  if (!/after|após|career|carreira|goal|objetivo|future|futuro/i.test(content)) tips.push("Adicione seus objetivos pós-formação para demonstrar planejamento.");
  if (m.clicheCount > 0) tips.push(`Substitua clichês (${m.foundCliches.slice(0, 2).map((c) => `\u201C${c}\u201D`).join(", ")}) por evidências concretas.`);
  if (targetProgram) {
    const prefix = targetProgram.split("—")[0]?.trim().toLowerCase().slice(0, 8) || "";
    if (prefix && !content.toLowerCase().includes(prefix)) {
      tips.push(`Mencione o programa-alvo (${targetProgram}) explicitamente no texto.`);
    }
  }

  return tips;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min = 30, max = 95): number {
  return Math.min(max, Math.max(min, value));
}
