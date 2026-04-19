/**
 * Interview Prep Variants
 * 
 * Creates and manages interview preparation variants for different interview types.
 * Example: Technical interview, Behavioral, Culture fit, etc.
 */

import { useState, useMemo } from "react";
import { Mic, Plus, X, Target, Check, Clock, Users, Briefcase, Lightbulb, Zap } from "lucide-react";
import { useInterviewStore } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";
import { cn } from "@/lib/utils";

const INTERVIEW_TYPES = [
  { id: "technical", label: "Technical", icon: Briefcase, color: "bg-blue-100 text-blue-700" },
  { id: "behavioral", label: "Behavioral", icon: Users, color: "bg-purple-100 text-purple-700" },
  { id: "culture", label: "Culture Fit", icon: Lightbulb, color: "bg-amber-100 text-amber-700" },
  { id: "case", label: "Case Study", icon: Target, color: "bg-emerald-100 text-emerald-700" },
  { id: "coding", label: "Coding", icon: Zap, color: "bg-cyan-100 text-cyan-700" },
  { id: "system", label: "System Design", icon: Target, color: "bg-orange-100 text-orange-700" },
  { id: "behavior", label: "STAR Stories", icon: Users, color: "bg-pink-100 text-pink-700" },
];

interface InterviewPrepVariantsProps {
  documentId: string;
  targetRole: string;
  targetCompany?: string;
  className?: string;
}

export function InterviewPrepVariants({
  documentId,
  targetRole,
  targetCompany,
  className = "",
}: InterviewPrepVariantsProps) {
  const { sessions } = useInterviewStore();
  const { getDocById } = useForgeStore();
  
  const doc = getDocById(documentId);
  
  // Get interview types relevant to this document
  const relevantTypes = useMemo(() => {
    if (!doc) return INTERVIEW_TYPES;
    
    // Prioritize based on document type
    switch (doc.type) {
      case "cv":
      case "resume":
        return INTERVIEW_TYPES.filter(t => 
          ["technical", "behavioral", "culture", "coding", "system"].includes(t.id)
        );
      case "research_proposal":
        return INTERVIEW_TYPES.filter(t => 
          ["technical", "case", "system"].includes(t.id)
        );
      default:
        return INTERVIEW_TYPES;
    }
  }, [doc]);
  
  // Get estimated time per interview type
  const getPrepTime = (type: string) => {
    switch (type) {
      case "technical": return "45-60 min";
      case "behavioral": return "30-45 min";
      case "culture": return "20-30 min";
      case "case": return "45-60 min";
      case "coding": return "60-90 min";
      case "system": return "45-60 min";
      case "behavior": return "30-45 min";
      default: return "30 min";
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div>
        <h3 className="font-medium text-text-primary flex items-center gap-2">
          <Mic className="w-4 h-4 text-brand-500" />
          Interview Prep Variants
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Prepare for different interview types with your document
        </p>
      </div>
      
      {/* Document Context */}
      <div className="rounded-lg bg-brand-50 p-3 text-sm">
        <p className="text-brand-700 font-medium">{targetRole}</p>
        {targetCompany && (
          <p className="text-brand-600 text-xs">{targetCompany}</p>
        )}
      </div>
      
      {/* Interview Type Cards */}
      <div className="space-y-2">
        {relevantTypes.map((type) => (
          <button
            key={type.id}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-300 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", type.color)}>
                <type.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getPrepTime(type.id)}
                </p>
              </div>
            </div>
            <Plus className="w-4 h-4 text-brand-500" />
          </button>
        ))}
      </div>
      
      {/* Start All Button */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600">
        <Mic className="w-4 h-4" />
        Start All Prep Sessions
      </button>
    </div>
  );
}