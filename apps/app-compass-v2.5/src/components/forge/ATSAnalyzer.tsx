"use client";

import { useState } from "react";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles
} from "lucide-react";
import { analyzeATSCompatibility, type ATSAnalysisResult, type ATSSuggestion } from "@/lib/ats-analyzer";
import { Button, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ATSAnalyzerProps {
  resumeContent: string;
  onAnalysisComplete?: (result: ATSAnalysisResult) => void;
  className?: string;
}

export function ATSAnalyzer({ resumeContent, onAnalysisComplete, className = "" }: ATSAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!jobDescription.trim() || !resumeContent.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const result = analyzeATSCompatibility({
        resumeText: resumeContent,
        jobDescription: jobDescription,
      });
      
      setAnalysis(result);
      setIsAnalyzing(false);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    }, 800);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-clay-600";
  };

  const getScoreVariant = (score: number): "moss" | "gradient" | "clay" => {
    if (score >= 80) return "moss";
    if (score >= 60) return "gradient";
    return "clay";
  };

  const getSuggestionIcon = (type: ATSSuggestion["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-clay-500" />;
      case "important":
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case "optional":
        return <Sparkles className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="card-surface border border-brand-200/70 bg-gradient-to-br from-white via-brand-50/50 to-slate-50/90 p-6">
        <div className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1 text-caption font-medium text-brand-600 shadow-sm mb-4">
          <Target className="w-3.5 h-3.5 mr-1.5" />
          Otimizador ATS
        </div>
        
        <h2 className="font-heading text-h3 text-text-primary mb-2">
          Análise de Compatibilidade com Vaga
        </h2>
        
        <p className="text-body text-text-secondary mb-4">
          Cole a descrição da vaga abaixo para analisar a compatibilidade do seu currículo com sistemas ATS (Applicant Tracking Systems).
        </p>

        <div className="space-y-3">
          <label className="block text-body-sm font-medium text-text-primary">
            Descrição da Vaga
          </label>
          
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Cole aqui a descrição completa da vaga, incluindo requisitos, responsabilidades e qualificações desejadas..."
            className="w-full h-48 px-4 py-3 rounded-lg border border-cream-400 bg-white text-body-sm text-text-primary leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
          />

          <Button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || !resumeContent.trim() || isAnalyzing}
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Analisando compatibilidade...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Analisar Compatibilidade
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="card-surface p-6 border-2 border-brand-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-h3 text-text-primary">
                Score de Compatibilidade
              </h3>
              <div className={cn("font-heading text-h1", getScoreColor(analysis.overallScore))}>
                {analysis.overallScore}
                <span className="text-h4 text-text-muted">/100</span>
              </div>
            </div>

            <Progress
              value={analysis.overallScore}
              variant={getScoreVariant(analysis.overallScore)}
              size="lg"
              className="mb-4"
            />

            <p className="text-body-sm text-text-secondary">
              {analysis.overallScore >= 80
                ? "Excelente! Seu currículo está muito bem alinhado com a vaga."
                : analysis.overallScore >= 60
                ? "Bom alinhamento. Algumas otimizações podem melhorar suas chances."
                : "Há espaço para melhorias significativas. Veja as sugestões abaixo."}
            </p>
          </div>

          {/* Detailed Scores */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Keywords */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-body font-semibold text-text-primary">
                    Palavras-chave
                  </h4>
                  <p className={cn("text-h4 font-bold", getScoreColor(analysis.keywordMatch.score))}>
                    {analysis.keywordMatch.score}%
                  </p>
                </div>
              </div>
              <Progress value={analysis.keywordMatch.score} variant={getScoreVariant(analysis.keywordMatch.score)} size="sm" className="mb-2" />
              <p className="text-caption text-text-muted">
                {analysis.keywordMatch.matched.length} de {analysis.keywordMatch.total} palavras-chave encontradas
              </p>
            </div>

            {/* Skills */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-body font-semibold text-text-primary">
                    Competências
                  </h4>
                  <p className={cn("text-h4 font-bold", getScoreColor(analysis.skillsMatch.score))}>
                    {analysis.skillsMatch.score}%
                  </p>
                </div>
              </div>
              <Progress value={analysis.skillsMatch.score} variant={getScoreVariant(analysis.skillsMatch.score)} size="sm" className="mb-2" />
              <p className="text-caption text-text-muted">
                {analysis.skillsMatch.matched.length} competências alinhadas
              </p>
            </div>

            {/* Experience */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-body font-semibold text-text-primary">
                    Experiência
                  </h4>
                  <p className={cn("text-h4 font-bold", getScoreColor(analysis.experienceMatch.score))}>
                    {analysis.experienceMatch.score}%
                  </p>
                </div>
              </div>
              <Progress value={analysis.experienceMatch.score} variant={getScoreVariant(analysis.experienceMatch.score)} size="sm" className="mb-2" />
              <p className="text-caption text-text-muted">
                {analysis.experienceMatch.feedback}
              </p>
            </div>

            {/* Education */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-body font-semibold text-text-primary">
                    Formação
                  </h4>
                  <p className={cn("text-h4 font-bold", getScoreColor(analysis.educationMatch.score))}>
                    {analysis.educationMatch.score}%
                  </p>
                </div>
              </div>
              <Progress value={analysis.educationMatch.score} variant={getScoreVariant(analysis.educationMatch.score)} size="sm" className="mb-2" />
              <p className="text-caption text-text-muted">
                {analysis.educationMatch.feedback}
              </p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="card-surface border border-emerald-200 bg-emerald-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-heading text-body font-semibold text-emerald-900">
                    Pontos Fortes
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-caption text-emerald-800 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses.length > 0 && (
              <div className="card-surface border border-clay-200 bg-clay-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-clay-600" />
                  <h4 className="font-heading text-body font-semibold text-clay-900">
                    Áreas de Melhoria
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-caption text-clay-800 flex items-start gap-2">
                      <span className="text-clay-500 mt-0.5">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h3 className="font-heading text-h4 text-text-primary">
                Sugestões de Otimização
              </h3>
            </div>

            <div className="space-y-3">
              {analysis.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    suggestion.type === "critical" && "border-clay-200 bg-clay-50/30",
                    suggestion.type === "important" && "border-amber-200 bg-amber-50/30",
                    suggestion.type === "optional" && "border-brand-200 bg-brand-50/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-heading text-body-sm font-semibold text-text-primary">
                          {suggestion.title}
                        </h5>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-caption font-bold uppercase",
                          suggestion.impact === "high" && "bg-clay-100 text-clay-700",
                          suggestion.impact === "medium" && "bg-amber-100 text-amber-700",
                          suggestion.impact === "low" && "bg-brand-100 text-brand-700"
                        )}>
                          {suggestion.impact === "high" ? "Alto impacto" : suggestion.impact === "medium" ? "Médio impacto" : "Baixo impacto"}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary mb-2">
                        {suggestion.description}
                      </p>
                      <div className="rounded bg-white/50 px-3 py-2 border border-cream-300">
                        <p className="text-caption font-medium text-text-primary">
                          <strong>Ação:</strong> {suggestion.actionable}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords & Skills */}
          {(analysis.keywordMatch.missing.length > 0 || analysis.skillsMatch.missing.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {analysis.keywordMatch.missing.length > 0 && (
                <div className="card-surface p-5">
                  <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">
                    Palavras-chave Ausentes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordMatch.missing.slice(0, 10).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-full bg-clay-100 text-clay-700 text-caption font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.skillsMatch.missing.length > 0 && (
                <div className="card-surface p-5">
                  <h4 className="font-heading text-body-sm font-semibold text-text-primary mb-3">
                    Competências Ausentes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsMatch.missing.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-caption font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
