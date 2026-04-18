/**
 * @component OpportunityDossierView
 * @layer Forge / Dossier Management
 * @purpose Group and display documents by opportunity
 * 
 * Shows documents organized by the opportunities they serve,
 * making it clear which assets belong to which application.
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileEdit, Target, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS, type ForgeDocument } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { Badge, Card, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

interface OpportunityGroup {
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  deadline?: string;
  documents: ForgeDocument[];
  readyCount: number;
  draftCount: number;
  totalCount: number;
  completionPercentage: number;
}

interface OpportunityDossierViewProps {
  className?: string;
}

export function OpportunityDossierView({ className }: OpportunityDossierViewProps) {
  const { documents } = useForgeStore();
  const { applications } = useApplicationStore();

  const { opportunityGroups, universalDocuments } = useMemo(() => {
    // Group documents by opportunity
    const groups = new Map<string, OpportunityGroup>();
    const universal: ForgeDocument[] = [];

    documents.forEach((doc) => {
      // Universal documents (not bound to any opportunity)
      if (!doc.primaryOpportunityId && (!doc.opportunityIds || doc.opportunityIds.length === 0)) {
        universal.push(doc);
        return;
      }

      // Get all opportunities this document serves
      const oppIds = new Set<string>();
      if (doc.primaryOpportunityId) oppIds.add(doc.primaryOpportunityId);
      doc.opportunityIds?.forEach((id) => oppIds.add(id));

      // Add to each opportunity group
      oppIds.forEach((oppId) => {
        if (!groups.has(oppId)) {
          // Find application for this opportunity
          const app = applications.find((a) => a.opportunityId === oppId);
          
          groups.set(oppId, {
            opportunityId: oppId,
            opportunityTitle: app?.program || "Oportunidade",
            opportunityType: app?.type || "unknown",
            deadline: app?.deadline,
            documents: [],
            readyCount: 0,
            draftCount: 0,
            totalCount: 0,
            completionPercentage: 0,
          });
        }

        const group = groups.get(oppId)!;
        group.documents.push(doc);
        group.totalCount++;

        if (doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted") {
          group.readyCount++;
        } else if (doc.readinessLevel === "draft") {
          group.draftCount++;
        }
      });
    });

    // Calculate completion percentages
    groups.forEach((group) => {
      group.completionPercentage = group.totalCount > 0
        ? Math.round((group.readyCount / group.totalCount) * 100)
        : 0;
    });

    return {
      opportunityGroups: Array.from(groups.values()).sort((a, b) => {
        // Sort by deadline (soonest first)
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return b.totalCount - a.totalCount;
      }),
      universalDocuments: universal,
    };
  }, [documents, applications]);

  if (documents.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <FileEdit className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">Nenhum documento criado ainda.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Opportunity-bound documents */}
      {opportunityGroups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Dossiers por Oportunidade</h3>
          
          {opportunityGroups.map((group) => (
            <Card key={group.opportunityId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-brand-500" />
                    <h4 className="font-semibold text-slate-900">{group.opportunityTitle}</h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>{group.totalCount} {group.totalCount === 1 ? "ativo" : "ativos"}</span>
                    {group.deadline && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(group.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-600">
                    {group.completionPercentage}%
                  </div>
                  <div className="text-xs text-slate-600">pronto</div>
                </div>
              </div>

              <Progress value={group.completionPercentage} className="mb-4" />

              <div className="space-y-2">
                {group.documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/forge/${doc.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ReadinessIcon level={doc.readinessLevel} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{doc.title}</div>
                        <div className="text-sm text-slate-600">{DOC_TYPE_LABELS[doc.type]}</div>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  </Link>
                ))}
              </div>

              <Link
                href={`/applications/${group.opportunityId}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Ver candidatura completa
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Universal documents */}
      {universalDocuments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Documentos Universais</h3>
          <p className="text-sm text-slate-600">
            Ativos reutilizáveis que não estão vinculados a uma oportunidade específica.
          </p>
          
          <div className="grid gap-3">
            {universalDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/forge/${doc.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <ReadinessIcon level={doc.readinessLevel} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{doc.title}</div>
                    <div className="text-sm text-slate-600">{DOC_TYPE_LABELS[doc.type]}</div>
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessIcon({ level }: { level?: ForgeDocument["readinessLevel"] }) {
  switch (level) {
    case "export_ready":
    case "submitted":
      return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />;
    case "review":
      return <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
    case "draft":
    default:
      return <AlertCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />;
  }
}
