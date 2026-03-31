"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Sparkles, AlertTriangle,
  TrendingUp, Target,
  Bold, Italic, List, Quote, Undo2, Redo2
} from "lucide-react";
import { Button, Card, LoadingSpinner } from "@/components/ui";
import { useForgeStore } from "@/stores/forge-enhanced";

interface WritingCoachProps {
  document: {
    metrics?: {
      score: number;
      issues: Array<{
        type: string;
        severity: string;
        message: string;
      }>;
      suggestions: string[];
      wordCount: number;
      readabilityScore: number;
    };
  };
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

function WritingCoach({ document, onAnalyze, isAnalyzing }: WritingCoachProps) {
  const metrics = document.metrics;
  
  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="font-heading text-h4 text-text-primary">Olcan Score</h3>
          <p className="text-body-sm text-text-secondary mb-4">
            Analise seu texto para receber feedback personalizado
          </p>
          <Button onClick={onAnalyze} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="sm" />
                Analisando...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analisar Texto
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number): "moss" | "amber" | "clay" => {
    if (score >= 80) return "moss";
    if (score >= 60) return "amber";
    return "clay";
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Score Overview */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <svg width={120} height={120} className="-rotate-90">
                <circle
                  cx={60}
                  cy={60}
                  r={56}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={8}
                  className="text-gray-200"
                />
                <circle
                  cx={60}
                  cy={60}
                  r={56}
                  fill="none"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (metrics.score / 100) * 351.86}
                  className={getScoreVariant(metrics.score) === "moss" ? "stroke-green-500" : getScoreVariant(metrics.score) === "amber" ? "stroke-yellow-500" : "stroke-red-500"}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-h2">{metrics.score}</span>
              </div>
            </div>
          </div>
          <h3 className="font-heading text-h4 text-text-primary mb-2">
            Olcan Score: <span className={getScoreColor(metrics.score)}>{metrics.score}</span>
          </h3>
          <p className="text-caption text-text-secondary">
            {metrics.wordCount} palavras • Legibilidade: {metrics.readabilityScore}/100
          </p>
        </div>

        {/* Issues */}
        {metrics.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-heading text-h5 text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Pontos a Melhorar
            </h4>
            <div className="space-y-2">
              {metrics.issues.map((issue, index) => (
                <div key={index} className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      issue.severity === 'high' ? 'bg-red-500' :
                      issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-body-sm text-text-secondary">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {metrics.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-heading text-h5 text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Sugestões
            </h4>
            <div className="space-y-2">
              {metrics.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-body-sm text-text-secondary">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={onAnalyze} variant="secondary" className="w-full">
            <Target className="w-4 h-4 mr-2" />
            Reanalisar
          </Button>
          
          <Button className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Revisão Humana (5 min)
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ForgeWritingLabPage() {
  const params = useParams();
  const docId = params.id as string;
  
  const { getDocById, updateContent, analyzeDocument, saveVersion } = useForgeStore();
  
  const document = getDocById(docId);
  const [content, setContent] = useState(document?.content || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    // Set new timeout for auto-save
    saveTimeout.current = setTimeout(() => {
      updateContent(docId, newContent);
      setLastSaved(new Date());
    }, 2000);
  }, [docId, updateContent]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      await analyzeDocument(docId);
    } finally {
      setIsAnalyzing(false);
    }
  }, [docId, analyzeDocument]);

  const handleSave = useCallback(() => {
    saveVersion(docId);
    setLastSaved(new Date());
  }, [docId, saveVersion]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-h1 text-text-primary">Documento não encontrado</h1>
          <p className="text-body text-text-secondary">
            O documento que você está procurando não existe ou foi excluído.
          </p>
          <Link href="/forge">
            <Button>Voltar para Forge</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/forge">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">{document.title}</h1>
            <p className="text-body text-text-secondary">
              {document.type} • {document.wordCount} palavras
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-caption text-text-muted">
              Salvo há {Math.round((Date.now() - lastSaved.getTime()) / 60000)} min
            </span>
          )}
          <Button onClick={handleSave} variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Salvar Versão
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cream-200">
              <Button variant="ghost" size="sm">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Quote className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-cream-300 mx-2" />
              <Button variant="ghost" size="sm">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Text Editor */}
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Comece a escrever seu documento aqui..."
              className="w-full h-96 px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-body text-text-primary"
            />
            
            {/* Word Count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-200">
              <div className="text-caption text-text-muted">
                {content.split(/\s+/).filter(word => word.length > 0).length} palavras
              </div>
              <div className="text-caption text-text-muted">
                {content.length} caracteres
              </div>
            </div>
          </Card>
        </div>

        {/* Writing Coach */}
        <div className="lg:col-span-1">
          <WritingCoach 
            document={document}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}
