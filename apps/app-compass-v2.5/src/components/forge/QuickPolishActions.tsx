/**
 * Quick Polish Actions
 * 
 * Common writing improvements that can be applied with one click:
 * - Fix passive voice
 * - Strengthen verbs
 * - Fix spelling/grammar patterns
 * - Add transition words
 * - Fix sentence length
 */

import { useState } from "react";
import { 
  Wand2, 
  Check, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Type,
  List,
  Bold
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickPolishActionsProps {
  content: string;
  onApply: (newContent: string) => void;
  className?: string;
}

interface PolishAction {
  id: string;
  label: string;
  icon: typeof Bold;
  apply: (content: string) => string;
}

const POLISH_ACTIONS: PolishAction[] = [
  {
    id: "fix-passive",
    label: "Fix passive voice",
    icon: RefreshCw,
    apply: (content) => {
      // Simple passive voice fixes (in real app, use AI)
      return content
        .replace(/was created/g, "was developed")
        .replace(/was done/g, "was completed")
        .replace(/was made/g, "was built")
        .replace(/is used/g, "is utilized");
    },
  },
  {
    id: "strengthen-verbs",
    label: "Strengthen verbs",
    icon: Bold,
    apply: (content) => {
      return content
        .replace(/\bvery good\b/gi, "excellent")
        .replace(/\breally good\b/gi, "exceptional")
        .replace(/\bvery bad\b/gi, "problematic")
        .replace(/\breally bad\b/gi, "concerning")
        .replace(/\btried to\b/gi, "attempted to")
        .replace(/\bwanted to\b/gi, "intended to");
    },
  },
  {
    id: "fix-typos",
    label: "Fix common typos",
    icon: AlertCircle,
    apply: (content) => {
      return content
        .replace(/\bteh\b/gi, "the")
        .replace(/\brecieve\b/gi, "receive")
        .replace(/\bdefinately\b/gi, "definitely")
        .replace(/\boccured\b/gi, "occurred")
        .replace(/\bseperate\b/gi, "separate")
        .replace(/\buntill\b/gi, "until");
    },
  },
  {
    id: "add-transitions",
    label: "Add transitions",
    icon: List,
    apply: (content) => {
      const transitions = [
        "Furthermore, ", "Additionally, ", "In addition, ",
        "However, ", "Nevertheless, ", "On the other hand, ",
        "Consequently, ", "As a result, ",
        "For example, ", "Specifically, "
      ];
      const sentences = content.split(/\n\n+/);
      if (sentences.length < 3) return content;
      
      // Add transition to middle paragraphs
      sentences[1] = transitions[sentences[1].charCodeAt(0) % transitions.length] + sentences[1].charAt(0).toLowerCase() + sentences[1].slice(1);
      return sentences.join("\n\n");
    },
  },
  {
    id: "improve-flow",
    label: "Improve flow",
    icon: Type,
    apply: (content) => {
      // Fix choppy sentences by combining short ones
      return content
        .replace(/(\w+)\. (\w+)\. (\w+)\./g, "$1, $2, and $3.")
        .replace(/(\w+)\. (\w+)\./g, "$1 and $2.");
    },
  },
];

export function QuickPolishActions({
  content,
  onApply,
  className = "",
}: QuickPolishActionsProps) {
  const [applied, setApplied] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  
  const handleApply = async (action: PolishAction) => {
    setIsApplying(action.id);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newContent = action.apply(content);
    onApply(newContent);
    setApplied(action.id);
    setIsApplying(null);
    
    setTimeout(() => setApplied(null), 2000);
  };
  
  // Count occurrences for better UX
  const passiveCount = (content.match(/\bwas created\b|\bwas done\b|\bwas made\b|\bis used\b/gi) || []).length;
  const typoCount = (content.match(/\bteh\b|\brecieve\b|\bdefinately\b/gi) || []).length;
  const weakVerbCount = (content.match(/\bvery good\b|\breally good\b|\btried to\b/gi) || []).length;
  
  const getCounts = (id: string) => {
    switch(id) {
      case "fix-passive": return passiveCount;
      case "fix-typos": return typoCount;
      case "strengthen-verbs": return weakVerbCount;
      default: return null;
    }
  };
  
  const hasIssues = passiveCount > 0 || typoCount > 0 || weakVerbCount > 0;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
        <Wand2 className="w-4 h-4" />
        <span className="font-medium">Quick Polish</span>
      </div>
      
      {!hasIssues && content.length > 50 && (
        <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
          <Check className="w-3 h-3 inline mr-1" />
          Document looks good!
        </p>
      )}
      
      <div className="space-y-2">
        {POLISH_ACTIONS.map((action) => {
          const count = getCounts(action.id);
          const isApplied = applied === action.id;
          const isApplyingThis = isApplying === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleApply(action)}
              disabled={isApplyingThis}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
                isApplied
                  ? "border-emerald-500 bg-emerald-50"
                  : isApplyingThis
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:border-brand-300"
              )}
            >
              <div className="flex items-center gap-3">
                <action.icon className={cn(
                  "w-4 h-4",
                  isApplied ? "text-emerald-500" : "text-slate-500"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  isApplied ? "text-emerald-700" : "text-text-primary"
                )}>
                  {action.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {count !== null && count > 0 && !isApplied && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {count}
                  </span>
                )}
                {isApplied && <Check className="w-4 h-4 text-emerald-500" />}
                {isApplyingThis && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}