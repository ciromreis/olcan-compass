/**
 * Document Variation System
 * 
 * Creates and manages document variations for parallel applications.
 * Example: Base motivation letter → Chevening variant + University A + University B
 */

import { useState, useMemo } from "react";
import { Copy, FileText, Plus, X, ChevronRight, Check, ArrowRight } from "lucide-react";
import { useForgeStore, type ForgeDocument, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { cn } from "@/lib/utils";

interface DocumentVariationsProps {
  baseDocId: string;
  className?: string;
}

interface Variation {
  id: string;
  baseDocId: string;
  targetOpportunityId: string;
  targetOpportunityName: string;
  modifications: string[];
  createdAt: string;
  content: string;
}

export function DocumentVariations({
  baseDocId,
  className = "",
}: DocumentVariationsProps) {
  const { getDocById, documents, createDocument, updateContent } = useForgeStore();
  const { applications } = useApplicationStore();
  
  const [variations, setVariations] = useState<Variation[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  
  const baseDoc = getDocById(baseDocId);
  
  // Get available opportunities
  const availableOpps = useMemo(() => {
    if (!baseDoc) return [];
    return applications.filter(app => 
      !baseDoc.opportunityIds?.includes(app.id || app.opportunityId || '')
    );
  }, [applications, baseDoc]);
  
  // Get existing variations
  const existingVariations = useMemo(() => {
    return variations.filter(v => v.baseDocId === baseDocId);
  }, [variations, baseDocId]);
  
  const createVariation = async () => {
    if (!selectedOppId || !baseDoc) return;
    
    const opp = applications.find(a => a.id === selectedOppId || a.opportunityId === selectedOppId);
    if (!opp) return;
    
    // Create new document as variation
    const variationTitle = `${baseDoc.title} — ${opp.program}`;
    const newDocId = await createDocument({
      title: variationTitle,
      type: baseDoc.type,
      targetProgram: opp.program,
      language: baseDoc.language,
      primaryOpportunityId: selectedOppId,
      opportunityIds: [selectedOppId],
    });
    
    if (newDocId) {
      // Copy content from base
      await updateContent(newDocId, baseDoc.content);
      
      // Add to variations
      const newVariation: Variation = {
        id: newDocId,
        baseDocId,
        targetOpportunityId: selectedOppId,
        targetOpportunityName: opp.program,
        modifications: ["Initial copy"],
        createdAt: new Date().toISOString(),
        content: baseDoc.content,
      };
      
      setVariations([...variations, newVariation]);
    }
    
    setShowCreator(false);
    setSelectedOppId(null);
  };
  
  if (!baseDoc) return null;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">
          <FileText className="w-4 h-4 inline mr-2" />
          Document Variations
        </h3>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="flex items-center gap-1 text-sm text-brand-600"
        >
          <Plus className="w-4 h-4" />
          Add Variation
        </button>
      </div>
      
      {/* Variations List */}
      <div className="space-y-2">
        {/* Base Document */}
        <div className="rounded-lg border border-brand-300 bg-brand-50 p-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-brand-700">Original</span>
            <span className="text-xs text-brand-500">(Base)</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{baseDoc.title}</p>
        </div>
        
        {/* Existing Variations */}
        {existingVariations.map(variation => (
          <div key={variation.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">{variation.targetOpportunityName}</span>
              </div>
              <span className="text-xs text-text-muted">
                {new Date(variation.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {variation.modifications.join(", ")}
            </p>
          </div>
        ))}
        
        {existingVariations.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            No variations yet. Create one for a different application.
          </p>
        )}
      </div>
      
      {/* Create Variation Modal */}
      {showCreator && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Create Variation</h4>
            <button onClick={() => setShowCreator(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Opportunity
            </label>
            <select
              value={selectedOppId || ""}
              onChange={(e) => setSelectedOppId(e.target.value || null)}
              className="w-full rounded-lg border border-slate-200 p-2"
            >
              <option value="">Select opportunity...</option>
              {availableOpps.map(opp => (
                <option key={opp.id || opp.opportunityId} value={opp.id || opp.opportunityId}>
                  {opp.program} — {opp.country}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={createVariation}
            disabled={!selectedOppId}
            className={cn(
              "w-full py-2 rounded-lg font-medium",
              selectedOppId
                ? "bg-brand-500 text-white"
                : "bg-slate-100 text-slate-400"
            )}
          >
            Create Variation
          </button>
        </div>
      )}
    </div>
  );
}