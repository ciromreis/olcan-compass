/**
 * Application Document Actions
 * 
 * Quick actions to create/view documents for an application opportunity.
 * Shows suggested documents and allows quick creation.
 */

import { useMemo } from "react";
import Link from "next/link";
import { FilePlus, FileText, ChevronRight, Check } from "lucide-react";
import { useForgeStore, type DocType, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { cn } from "@/lib/utils";

interface ApplicationDocumentActionsProps {
  applicationId: string;
}

// Documents needed per application type based on opportunity type
const DOC_TYPES_BY_OPP: Record<string, DocType[]> = {
  scholarship: ["cv", "motivation_letter", "personal_statement"],
  master: ["cv", "motivation_letter", "statement_of_purpose"],
  phd: ["cv", "research_proposal", "statement_of_purpose"],
  job: ["resume", "cover_letter"],
  internship: ["resume", "cover_letter"],
};

export function ApplicationDocumentActions({ applicationId }: ApplicationDocumentActionsProps) {
  const { documents } = useForgeStore();
  const { applications } = useApplicationStore();
  
  const app = applications.find(a => a.id === applicationId);
  
  const relevantDocs = useMemo(() => {
    if (!app) return [];
    return documents.filter(d => 
      d.primaryOpportunityId === applicationId ||
      d.opportunityIds?.includes(applicationId)
    );
  }, [documents, applicationId, app]);
  
  const oppType = app?.type?.toLowerCase() || "job";
  const neededTypes = DOC_TYPES_BY_OPP[oppType] || DOC_TYPES_BY_OPP["job"];
  
  const missingDocs = neededTypes.filter(
    type => !relevantDocs.some(d => d.type === type)
  );
  
  if (relevantDocs.length === 0 && missingDocs.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3 pt-3 border-t border-cream-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Documentos
        </span>
        <span className="text-xs text-text-muted">
          {relevantDocs.length}/{neededTypes.length}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Existing documents */}
        {relevantDocs.slice(0, 3).map(doc => (
          <Link
            key={doc.id}
            href={`/forge/${doc.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted"
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : doc.competitivenessScore && doc.competitivenessScore >= 50
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-cream-100 text-text-secondary hover:bg-cream-200"
            )}
          >
            <Check className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{DOC_TYPE_LABELS[doc.type]}</span>
          </Link>
        ))}
        
        {/* Missing documents - quick create */}
        {missingDocs.length > 0 && relevantDocs.length < 3 && (
          <Link
            href={`/forge/new?opportunityId=${applicationId}&opportunityTitle=${encodeURIComponent(app?.program || "")}&type=${missingDocs[0]}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-brand-300 text-xs font-medium text-brand-600 hover:bg-brand-50"
          >
            <FilePlus className="w-3 h-3" />
            <span>{DOC_TYPE_LABELS[missingDocs[0]]}</span>
          </Link>
        )}
        
        {relevantDocs.length > 0 && (
          <Link
            href={`/forge?opportunityId=${applicationId}`}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}