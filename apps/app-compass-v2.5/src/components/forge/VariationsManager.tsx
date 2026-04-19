"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  Plus,
  Copy,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  Target,
  Building,
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit,
  Download,
  Filter,
  Search,
  Sparkles,
  Layers,
  X,
  Wand2,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useForgeStore, type ForgeDocument, DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { GlassCard } from "@/components/ui";

interface VariationGroup {
  baseDoc: ForgeDocument;
  variants: ForgeDocument[];
}

interface VariationsManagerProps {
  className?: string;
}

export function VariationsManager({ className = "" }: VariationsManagerProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const { documents, createDocument, updateContent, getDocsByOpportunity } = useForgeStore();
  const { applications } = useApplicationStore();

  const baseDocuments = useMemo(() => {
    const bases: Map<string, ForgeDocument> = new Map();
    
    documents.forEach((doc) => {
      if (doc.primaryOpportunityId) {
        const existing = bases.get(doc.primaryOpportunityId);
        if (!existing || existing.createdAt > doc.createdAt) {
          bases.set(doc.primaryOpportunityId, doc);
        }
      }
    });
    
    return Array.from(bases.values());
  }, [documents]);

  const variationGroups = useMemo(() => {
    return baseDocuments.map((baseDoc) => {
      const variants = documents.filter(
        (doc) =>
          doc.id !== baseDoc.id &&
          doc.type === baseDoc.type &&
          doc.primaryOpportunityId !== baseDoc.primaryOpportunityId &&
          doc.opportunityIds?.some((id) => baseDoc.opportunityIds?.includes(id))
      );
      
      return {
        baseDoc,
        variants,
        totalDocs: 1 + variants.length,
        readyCount: (baseDoc.readinessLevel === "export_ready" || baseDoc.readinessLevel === "submitted" ? 1 : 0) +
          variants.filter((v) => v.readinessLevel === "export_ready" || v.readinessLevel === "submitted").length,
      };
    });
  }, [baseDocuments, documents]);

  const availableOpportunities = useMemo(() => {
    const usedIds = new Set<string>();
    variationGroups.forEach((group) => {
      group.baseDoc.opportunityIds?.forEach((id) => usedIds.add(id));
    });
    
    return applications.filter(
      (app) => !usedIds.has(app.id || app.opportunityId || '')
    );
  }, [applications, variationGroups]);

  const handleCreateVariation = async (baseDocId: string) => {
    if (!selectedOpportunity) return;
    
    const baseDoc = documents.find((d) => d.id === baseDocId);
    if (!baseDoc) return;
    
    const opp = applications.find((a) => a.id === selectedOpportunity);
    if (!opp) return;
    
    setIsCreating(true);
    
    try {
      const variantTitle = `${baseDoc.title.split(" — ")[0]} — ${opp.program}`;
      const newDocId = await createDocument({
        title: variantTitle,
        type: baseDoc.type,
        targetProgram: opp.program,
        language: baseDoc.language,
        primaryOpportunityId: selectedOpportunity,
        opportunityIds: [selectedOpportunity],
      });
      
      if (newDocId) {
        await updateContent(newDocId, baseDoc.content);
        
        await import("@/lib/event-bus").then(({ eventBus }) => {
          eventBus.emit("document.created", { docId: newDocId, docType: baseDoc.type, variation: true });
        });
      }
      
      setSelectedOpportunity(null);
      setExpandedGroup(baseDocId);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloneToAllOpportunities = async (baseDocId: string) => {
    const baseDoc = documents.find((d) => d.id === baseDocId);
    if (!baseDoc || availableOpportunities.length === 0) return;
    
    setIsCreating(true);
    
    try {
      for (const opp of availableOpportunities.slice(0, 3)) {
        const variantTitle = `${baseDoc.title.split(" — ")[0]} — ${opp.program}`;
        const newDocId = await createDocument({
          title: variantTitle,
          type: baseDoc.type,
          targetProgram: opp.program,
          language: baseDoc.language,
          primaryOpportunityId: opp.id,
          opportunityIds: [opp.id],
        });
        
        if (newDocId) {
          await updateContent(newDocId, baseDoc.content);
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-h3 text-[#001338]">Variações e Processos Paralelos</h3>
          <p className="mt-1 text-body-sm text-[#001338]/50">
            Gerencie variações para diferentes processos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#001338]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-3 py-2 rounded-lg border border-cream-300 bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {variationGroups.length === 0 ? (
        <GlassCard variant="olcan" padding="xl" className="border-[#001338]/10 border-dashed bg-transparent">
          <GitBranch className="mx-auto mb-4 h-10 w-10 text-[#001338]/10" />
          <p className="font-heading text-h4 text-[#001338]">Nenhuma variação criada</p>
          <p className="mt-2 text-body-sm text-[#001338]/50">
            Vincule documentos a oportunidades para criar variações.
          </p>
          <Link
            href="/forge/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#001338] px-4 py-2 text-sm font-semibold text-white hover:bg-[#001338]/90"
          >
            <Plus className="h-4 w-4" />
            Criar Documento Base
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {variationGroups.map((group) => {
            const isExpanded = expandedGroup === group.baseDoc.id;
            const opp = applications.find(
              (a) => a.id === group.baseDoc.primaryOpportunityId || a.opportunityId === group.baseDoc.primaryOpportunityId
            );
            
            return (
              <GlassCard
                key={group.baseDoc.id}
                variant="olcan"
                padding="none"
                className={cn("overflow-hidden border-[#001338]/5", isExpanded && "ring-2 ring-brand-500/20")}
              >
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.baseDoc.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
                    <Layers className="h-6 w-6 text-brand-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-h4 text-[#001338] truncate">
                        {group.baseDoc.title.split(" — ")[0]}
                      </h4>
                      <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {group.totalDocs} documentos
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-caption text-[#001338]/50">
                      {opp && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {opp.program}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {DOC_TYPE_LABELS[group.baseDoc.type]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-500" />
                        {group.readyCount}/{group.totalDocs} prontos
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className={cn("h-5 w-5 text-[#001338]/20 transition-transform", isExpanded && "rotate-90")} />
                </button>
                
                {isExpanded && (
                  <div className="border-t border-cream-200 bg-cream-50/50 p-4 space-y-4">
                    <div className="grid gap-3">
                      <Link
                        href={`/forge/${group.baseDoc.id}`}
                        className="flex items-center gap-3 rounded-lg border border-brand-200 bg-white p-3 transition-colors hover:border-brand-300"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                          <FileText className="h-4 w-4 text-brand-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#001338]">Documento Base</p>
                          <p className="text-caption text-[#001338]/40">
                            {group.baseDoc.readinessLevel === "export_ready" ? "Pronto" : "Em desenvolvimento"}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-brand-400" />
                      </Link>
                      
                      {group.variants.map((variant) => {
                        const varOpp = applications.find(
                          (a) => a.id === variant.primaryOpportunityId || a.opportunityId === variant.primaryOpportunityId
                        );
                        return (
                          <Link
                            key={variant.id}
                            href={`/forge/${variant.id}`}
                            className="flex items-center gap-3 rounded-lg border border-cream-200 bg-white p-3 transition-colors hover:border-brand-300"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100">
                              <GitBranch className="h-4 w-4 text-[#001338]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#001338]">
                                {variant.title.split(" — ")[1] || "Variação"}
                              </p>
                              {varOpp && (
                                <p className="text-caption text-[#001338]/40">{varOpp.program}</p>
                              )}
                            </div>
                            {variant.readinessLevel === "export_ready" ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCreateVariation(group.baseDoc.id)}
                        disabled={isCreating || availableOpportunities.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        Nova Variação
                      </button>
                      <button
                        onClick={() => handleCloneToAllOpportunities(group.baseDoc.id)}
                        disabled={isCreating || availableOpportunities.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#001338] px-3 py-2 text-sm font-semibold text-white hover:bg-[#001338]/90 disabled:opacity-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        Clonar para Todos
                      </button>
                      <Link
                        href={`/forge/${group.baseDoc.id}/coach`}
                        className="inline-flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-cream-50"
                      >
                        <Wand2 className="h-4 w-4" />
                        IA Coach
                      </Link>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}