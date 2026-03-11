"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Target, TrendingUp, Shield, Lightbulb, DollarSign, Clock, Heart, Route as RouteIcon } from "lucide-react";
import { usePsychStore, type Dimension } from "@/stores/psych";
import { Progress, RadarChart, ProgressRing, type RadarDataPoint } from "@/components/ui";

type RouteType = "scholarship" | "postgrad" | "work_visa" | "exchange" | "study_abroad";

const ROUTE_META: Record<RouteType, { label: string; description: string }> = {
  scholarship: {
    label: "Bolsa de Estudos Internacional",
    description: "Seu perfil combina motivação clara e necessidade de suporte financeiro — uma rota de bolsas maximiza custo-benefício e chances de aprovação.",
  },
  postgrad: {
    label: "Mestrado ou Doutorado",
    description: "Alta confiança, disciplina e tolerância a risco apontam para candidaturas competitivas em programas de pós-graduação.",
  },
  work_visa: {
    label: "Realocação por Visto de Trabalho",
    description: "Clareza de objetivos e tolerância a risco elevada indicam boas condições para uma jornada de recolocação profissional internacional.",
  },
  exchange: {
    label: "Programa de Intercâmbio",
    description: "Um intercâmbio estruturado é a rota mais segura para seu perfil atual, permitindo adaptação gradual ao ambiente internacional.",
  },
  study_abroad: {
    label: "Estudo no Exterior",
    description: "Seu perfil equilibrado indica boas condições para um programa de estudo no exterior com suporte institucional.",
  },
};

function deriveRouteType(scores: Record<string, number>): RouteType {
  const confidence = scores.confidence ?? 0;
  const risk = scores.risk ?? 0;
  const discipline = scores.discipline ?? 0;
  const decisions = scores.decisions ?? 0;
  const anxiety = scores.anxiety ?? 0;
  const goals = scores.goals ?? 0;
  const financial = scores.financial ?? 0;

  if (financial >= 55 && goals >= 55) return "scholarship";
  if (risk >= 60 && confidence >= 60 && discipline >= 55) return "postgrad";
  if (risk >= 55 && goals >= 60 && decisions >= 50) return "work_visa";
  if (anxiety >= 55 && confidence < 50) return "exchange";
  return "study_abroad";
}

const DIMENSION_META: Array<{ key: Dimension; icon: typeof Shield; label: string; invertScore?: boolean }> = [
  { key: "confidence", icon: Shield, label: "Confiança" },
  { key: "risk", icon: TrendingUp, label: "Tolerância a Risco" },
  { key: "discipline", icon: Target, label: "Disciplina" },
  { key: "decisions", icon: Lightbulb, label: "Padrões de Decisão" },
  { key: "anxiety", icon: Heart, label: "Ansiedade", invertScore: true },
  { key: "goals", icon: Clock, label: "Clareza de Objetivos" },
  { key: "financial", icon: DollarSign, label: "Finanças", invertScore: true },
];

function AnimatedScore({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 40;
    const timer = setInterval(() => {
      frame++;
      setValue(Math.round((frame / total) * target));
      if (frame >= total) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{value}</>;
}

function getInsights(scores: Record<string, number>): Array<{ type: "strength" | "warning"; text: string }> {
  const insights: Array<{ type: "strength" | "warning"; text: string }> = [];

  if ((scores.discipline || 0) >= 65) insights.push({ type: "strength", text: "Disciplina alta — bom potencial para sprints intensivos" });
  if ((scores.confidence || 0) >= 65) insights.push({ type: "strength", text: "Confiança sólida — você acredita na sua capacidade" });
  if ((scores.goals || 0) >= 65) insights.push({ type: "strength", text: "Objetivos claros — isso acelera o planejamento de rota" });

  if ((scores.anxiety || 0) >= 65) insights.push({ type: "warning", text: "Ansiedade com entrevistas pode travar candidaturas" });
  if ((scores.financial || 0) >= 65) insights.push({ type: "warning", text: "Estresse financeiro pode limitar opções de destino" });
  if ((scores.risk || 0) < 45) insights.push({ type: "warning", text: "Baixa tolerância a risco — considere rotas mais seguras" });
  if ((scores.decisions || 0) < 45) insights.push({ type: "warning", text: "Paralisia de análise pode atrasar decisões críticas" });

  return insights.slice(0, 5);
}

export default function ResultsPage() {
  const { getDimensionScore, getOverallScore } = usePsychStore();
  const overallScore = getOverallScore();

  const dimensionScores = DIMENSION_META.map((d) => {
    const raw = getDimensionScore(d.key);
    const score = d.invertScore ? Math.max(0, 100 - raw) : raw;
    return { ...d, score };
  });

  const rawScoreMap: Record<string, number> = {};
  DIMENSION_META.forEach((d) => { rawScoreMap[d.key] = getDimensionScore(d.key); });

  const scoreMap: Record<string, number> = {};
  dimensionScores.forEach((d) => { scoreMap[d.key] = d.score; });

  const insights = getInsights(scoreMap);

  const coiPerDay = Math.max(15, Math.round(350 * (1 - (overallScore || 0) / 100)));
  const recommendedRouteType = deriveRouteType(rawScoreMap);
  const recommendedRoute = ROUTE_META[recommendedRouteType];

  const radarData: RadarDataPoint[] = dimensionScores.map((d) => ({
    label: d.label,
    value: d.score || 0,
    max: 100,
  }));

  return (
    <div className="space-y-6">
      <div className="card-surface p-8 text-center noise-overlay relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-caption font-heading font-semibold tracking-widest uppercase text-moss-400 mb-4">Seu Score de Certeza</p>
          <ProgressRing
            value={overallScore || 63}
            size={160}
            strokeWidth={10}
            variant="auto"
            className="mx-auto mb-5"
          >
            <span className={`font-heading text-display ${overallScore >= 65 ? "text-moss-500" : overallScore >= 40 ? "text-amber-500" : "text-clay-500"}`}>
              <AnimatedScore target={overallScore || 63} />
            </span>
          </ProgressRing>
          <p className="text-body-lg text-text-secondary max-w-md mx-auto">
            {overallScore >= 65
              ? "Seu perfil mostra forte preparação psicológica para a jornada de mobilidade. Continue fortalecendo as áreas de atenção."
              : overallScore >= 40
              ? "Seu perfil indica potencial, mas algumas dimensões precisam de atenção antes de avançar com confiança."
              : "Recomendamos trabalhar nas áreas de atenção antes de tomar decisões definitivas. O Compass pode ajudar."}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Perfil Dimensional</h3>
          <RadarChart data={radarData} size={300} showValues className="mb-4" />
          <div className="space-y-3">
            {dimensionScores.map((d) => (
              <div key={d.key} className="rounded-xl bg-cream-50 border border-cream-300 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm text-text-primary flex items-center gap-2">
                    <d.icon className="w-4 h-4 text-text-muted" /> {d.label}
                  </span>
                  <span className={`text-body-sm font-bold ${d.score >= 65 ? "text-moss-500" : d.score >= 40 ? "text-amber-500" : "text-clay-500"}`}>
                    {d.score || "—"}
                  </span>
                </div>
                <Progress
                  value={d.score || 0}
                  variant={d.score >= 65 ? "moss" : "clay"}
                  size="sm"
                  showLabel
                  label="Leitura dimensional"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-surface p-6">
            <h3 className="font-heading text-h4 text-text-primary mb-2">Custo de Inação Estimado</h3>
            <p className="font-heading text-h1 text-clay-500">
              R$ <AnimatedScore target={coiPerDay} /><span className="text-body text-text-muted">/dia</span>
            </p>
            <p className="text-body-sm text-text-secondary mt-2">
              Baseado na diferença salarial estimada entre Brasil e destinos prováveis para o seu perfil.
            </p>
          </div>
          <div className="card-surface p-6">
            <h3 className="font-heading text-h4 text-text-primary mb-3">Pontos de Atenção</h3>
            <ul className="space-y-2.5">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary">
                  <span className={`font-bold mt-0.5 flex-shrink-0 ${insight.type === "strength" ? "text-moss-500" : "text-clay-500"}`}>
                    {insight.type === "strength" ? "+" : "!"}
                  </span>
                  {insight.text}
                </li>
              ))}
              {insights.length === 0 && (
                <li className="text-body-sm text-text-muted">Complete o diagnóstico para ver suas análises personalizadas.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="card-surface p-8 bg-gradient-to-r from-moss-50 to-cream-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-xl bg-moss-100 flex items-center justify-center flex-shrink-0">
          <RouteIcon className="w-7 h-7 text-moss-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-h3 text-text-primary mb-1">Rota Recomendada</h3>
          <p className="text-body text-text-secondary">Com base no seu perfil, a rota de <strong>{recommendedRoute.label}</strong> tem a maior probabilidade de sucesso dentro do seu prazo e perfil psicológico. {recommendedRoute.description}</p>
        </div>
        <Link href="/routes" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors shadow-sm">
          Explorar Rotas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex justify-center gap-4">
        <Link href="/profile/psych" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors text-body-sm">
          Refazer Diagnóstico
        </Link>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors text-body-sm">
          Voltar ao Painel <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
