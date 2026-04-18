"use client";

import Link from "next/link";
import { FileText, AlignLeft, FileType, Clock, BookmarkCheck, Target, Mic, Sparkles, AlertCircle, Zap, Briefcase, Plus, X } from "lucide-react";
import { MetadataSidebar, type MetadataSection } from "@/components/layout/MetadataSidebar";
import { Progress } from "@/components/ui";
import { type ForgeDocument } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { cn } from "@/lib/utils";

interface ForgeMetadataSidebarProps {
  doc: ForgeDocument;
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  readingTime: number;
  linkedSessionCount: number;
  averageInterviewScore: number | null;
  alignmentScore: number | null;
  latestFeedbackHref: string | null;
  suggestionCards: Array<{
    id: string;
    title: string;
    text: string;
    tone: "brand" | "sage" | "clay";
  }>;
}

export function ForgeMetadataSidebar({
  doc,
  wordCount,
  charCount,
  paragraphCount,
  readingTime,
  linkedSessionCount,
  averageInterviewScore,
  alignmentScore,
  latestFeedbackHref,
  suggestionCards,
}: ForgeMetadataSidebarProps) {
  const { applications } = useApplicationStore();
  
  // Get bound opportunities
  const boundOpportunities = applications.filter(app => 
    doc.opportunityIds?.includes(app.opportunityId || '')
  );
  const isPrimary = (oppId: string) => doc.primaryOpportunityId === oppId;
  
  const sections: MetadataSection[] = [
    {
      title: "Estatísticas",
      fields: [
        { label: "Palavras", value: wordCount.toLocaleString('pt-BR'), icon: AlignLeft },
        { label: "Leitura", value: `~${readingTime} min`, icon: Clock },
        { label: "Versões", value: doc.versions.length, icon: BookmarkCheck },
      ],
    },
  ];

  return (
    <MetadataSidebar
      sections={sections}
      extra={
        <>
          {/* Opportunity Bindings */}
          {(boundOpportunities.length > 0 || doc.scope === "universal") && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Briefcase className="mr-1 inline h-3.5 w-3.5 text-brand-500" />
                Oportunidades
              </h4>
              
              {doc.scope === "universal" ? (
                <div className="rounded-lg border border-brand-200 bg-white/70 p-3">
                  <p className="text-xs font-semibold text-brand-700">✨ Documento Universal</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Pode ser usado em qualquer candidatura
                  </p>
                </div>
              ) : boundOpportunities.length > 0 ? (
                <div className="space-y-2">
                  {boundOpportunities.map(app => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="block rounded-lg border border-brand-200 bg-white/70 p-3 transition-colors hover:bg-brand-100/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {app.program}
                          </p>
                          {isPrimary(app.opportunityId || '') && (
                            <span className="mt-1 inline-block rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                      {app.deadline && (
                        <p className="mt-1 text-xs text-text-muted">
                          Prazo: {new Date(app.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-cream-200 bg-cream-50 p-3">
                  <p className="text-xs text-text-muted">
                    Nenhuma oportunidade vinculada ainda
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Competitiveness Score - Compact */}
          <div className="rounded-2xl border border-cream-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Target className="mr-1 inline h-3.5 w-3.5 text-brand-500" />
                Competitividade
              </h4>
              {doc.competitivenessScore !== null && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    doc.competitivenessScore >= 70
                      ? "bg-emerald-100 text-emerald-700"
                      : doc.competitivenessScore >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-clay-100 text-clay-700"
                  )}
                >
                  {doc.competitivenessScore >= 70
                    ? "Forte"
                    : doc.competitivenessScore >= 50
                    ? "Médio"
                    : "Fraco"}
                </span>
              )}
            </div>
            {doc.competitivenessScore !== null ? (
              <>
                <div className="text-2xl font-bold text-text-primary">
                  {doc.competitivenessScore}/100
                </div>
                <Progress
                  value={doc.competitivenessScore}
                  className="mt-2 h-1.5"
                />
              </>
            ) : (
              <p className="text-sm text-text-muted mt-1">
                Escreva mais para avaliação
              </p>
            )}
          </div>

          {/* Interview Loop */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Circuito documento-fala
            </h4>
            {linkedSessionCount > 0 ? (
              <>
                <p className="text-xs text-text-secondary">
                  Este dossiê já conversou com {linkedSessionCount} treino
                  {linkedSessionCount !== 1 ? "s" : ""}. Use isso para ajustar narrativa, prova e ritmo.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/70 p-2.5">
                    <span className="block text-text-muted">Média recente</span>
                    <span className="font-semibold text-text-primary">
                      {averageInterviewScore ?? "—"}/100
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/70 p-2.5">
                    <span className="block text-text-muted">Aderência</span>
                    <span className="font-semibold text-text-primary">{alignmentScore ?? "—"}%</span>
                  </div>
                </div>
                {latestFeedbackHref ? (
                  <Link
                    href={latestFeedbackHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Abrir último feedback
                    <Mic className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-xs text-text-secondary">
                  Quando este texto estiver minimamente sólido, vale abrir uma simulação de entrevista com o
                  mesmo alvo para testar coerência, presença e repertório.
                </p>
                <Link
                  href={`/interviews/new?documentId=${encodeURIComponent(
                    doc.id
                  )}&documentTitle=${encodeURIComponent(doc.title)}&target=${encodeURIComponent(
                    doc.targetProgram || doc.title
                  )}&language=${encodeURIComponent(doc.language || "en")}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Iniciar treino contextual
                  <Mic className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Word Count Progress */}
          {doc.constraints && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  <Target className="mr-1 inline h-3.5 w-3.5 text-brand-500" />
                  Meta de Conteúdo
                </h4>
                {doc.constraints.targetScholarship && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold uppercase text-brand-700">
                    {doc.constraints.targetScholarship}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-muted">Progresso</span>
                    <span className="text-[#001338]">
                      {wordCount} / {doc.constraints.maxWords || 500} palavras
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (wordCount / (doc.constraints.maxWords || 500)) * 100)}
                    variant={
                      wordCount > (doc.constraints.maxWords || 500)
                        ? "clay"
                        : wordCount > (doc.constraints.minWords || 300)
                        ? "moss"
                        : "gradient"
                    }
                    size="sm"
                  />
                  <p className="text-xs italic text-text-muted">
                    {wordCount < (doc.constraints.minWords || 300)
                      ? `Faltam ${(doc.constraints.minWords || 300) - wordCount} palavras para o mínimo.`
                      : wordCount > (doc.constraints.maxWords || 500)
                      ? `Você excedeu o limite em ${
                          wordCount - (doc.constraints.maxWords || 500)
                        } palavras.`
                      : "Volume ideal atingido. Foco no refinamento!"}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#001338]/5 bg-white/40 p-3">
                  <Zap
                    className={cn(
                      "h-5 w-5 transition-all",
                      wordCount >= (doc.constraints.minWords || 300)
                        ? "scale-110 text-slate-500 drop-shadow-md"
                        : "text-[#001338]/10"
                    )}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#001338]/60">
                      Impulso da Aura
                    </p>
                    <p className="text-xs leading-tight text-[#001338]/40">
                      {wordCount >= (doc.constraints.minWords || 300)
                        ? "Sua Aura está brilhando com seu progresso!"
                        : "Continue escrevendo para energizar sua Aura."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions - Compact */}
          {suggestionCards.length > 0 && (
            <div className="rounded-2xl border border-cream-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Zap className="mr-1 inline h-3.5 w-3.5 text-brand-500" />
                Ajustes sugeridos
              </h4>
              <div className="space-y-2">
                {suggestionCards.slice(0, 2).map((card) => (
                  <div
                    key={card.id}
                    className={cn(
                      "rounded-lg border p-2.5",
                      card.tone === "brand" && "border-brand-200 bg-brand-50/50",
                      card.tone === "sage" && "border-emerald-200 bg-emerald-50/50",
                      card.tone === "clay" && "border-clay-200 bg-clay-50/50"
                    )}
                  >
                    <p className="text-xs text-text-secondary leading-relaxed">{card.text}</p>
                  </div>
                ))}
                {suggestionCards.length > 2 && (
                  <p className="text-xs text-text-muted text-center">+{suggestionCards.length - 2} mais</p>
                )}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
