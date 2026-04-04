"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Info } from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { ATSAnalyzer } from "@/components/forge/ATSAnalyzer";
import { useToast } from "@/components/ui";
import type { ATSAnalysisResult } from "@/lib/ats-analyzer";

export default function ATSOptimizerPage() {
  const params = useParams();
  const docId = params.id as string;
  const { toast } = useToast();
  
  const { getDocById } = useForgeStore();
  const doc = getDocById(docId);

  const handleAnalysisComplete = (result: ATSAnalysisResult) => {
    toast({
      title: "Análise concluída",
      description: `Score de compatibilidade: ${result.overallScore}/100`,
      variant: result.overallScore >= 70 ? "success" : "warning",
    });
  };

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-brand-500 font-medium hover:underline">
          ← Voltar ao Forge
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/forge/${docId}`}
          className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="font-heading text-h2 text-text-primary">
            Otimizador ATS
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            {doc.title}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card-surface border border-brand-200 bg-brand-50/40 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading text-body-sm font-semibold text-text-primary mb-1">
              O que é ATS?
            </h3>
            <p className="text-caption text-text-secondary">
              <strong>ATS (Applicant Tracking System)</strong> são sistemas que empresas usam para filtrar currículos automaticamente. 
              Esta ferramenta analisa a compatibilidade do seu currículo com a vaga e sugere otimizações para passar pelos filtros ATS 
              e aumentar suas chances de ser chamado para entrevista.
            </p>
          </div>
        </div>
      </div>

      {/* ATS Analyzer */}
      <ATSAnalyzer
        resumeContent={doc.content}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Tips */}
      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-500" />
          Dicas para Otimização ATS
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary">
              ✅ Faça
            </h4>
            <ul className="space-y-1.5 text-caption text-text-secondary">
              <li>• Use palavras-chave exatas da descrição da vaga</li>
              <li>• Mantenha formatação simples (sem tabelas ou gráficos)</li>
              <li>• Liste competências técnicas em seção dedicada</li>
              <li>• Quantifique resultados com números e percentuais</li>
              <li>• Use títulos de seção padrão (Experiência, Formação, etc.)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-heading text-body-sm font-semibold text-text-primary">
              ❌ Evite
            </h4>
            <ul className="space-y-1.5 text-caption text-text-secondary">
              <li>• Cabeçalhos e rodapés complexos</li>
              <li>• Imagens, logos ou gráficos</li>
              <li>• Colunas múltiplas ou caixas de texto</li>
              <li>• Fontes decorativas ou muito pequenas</li>
              <li>• Abreviações não explicadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
