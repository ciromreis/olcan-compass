/**
 * Writing Tips Panel
 * 
 * Context-aware writing tips based on document type.
 */

import { Lightbulb, Check } from "lucide-react";
import { DOC_TYPE_LABELS, type DocType } from "@/stores/forge";
import { cn } from "@/lib/utils";

interface WritingTipsPanelProps {
  docType: DocType;
  wordCount: number;
  className?: string;
}

const TIPS_BY_TYPE: Partial<Record<DocType, { title: string; text: string }[]>> = {
  cv: [
    { title: "Length", text: "Keep to 1-2 pages" },
    { title: "Use numbers", text: "Quantify achievements" },
    { title: "Action verbs", text: "Start bullets with strong verbs" },
  ],
  motivation_letter: [
    { title: "Strong opener", text: "Start with a specific story" },
    { title: "Be specific", text: "Name specific programs" },
    { title: "Call to action", text: "End with clear interest" },
  ],
  personal_statement: [
    { title: "Tell a story", text: "Use narrative arc" },
    { title: "Be authentic", text: "Show your unique voice" },
    { title: "Future vision", text: "Connect past to goals" },
  ],
  research_proposal: [
    { title: "Research question", text: "State clear RQ" },
    { title: "Methodology", text: "Describe methods" },
    { title: "Timeline", text: "Include realistic timeline" },
  ],
  statement_of_purpose: [
    { title: "Past to present", text: "Connect experience" },
    { title: "Be specific", text: "Name faculty and research" },
    { title: "Why this program", text: "Explain your choice" },
  ],
};

const DEFAULT_TIPS = [
  { title: "Be specific", text: "Use examples" },
  { title: "Stay on topic", text: "Keep focused" },
  { title: "Proofread", text: "Check for errors" },
];

export function WritingTipsPanel({
  docType,
  className = "",
}: WritingTipsPanelProps) {
  const tips = TIPS_BY_TYPE[docType] || DEFAULT_TIPS;
  const docLabel = DOC_TYPE_LABELS[docType];
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Lightbulb className="w-4 h-4" />
        <span className="font-medium">Writing Tips</span>
      </div>
      
      <div className="space-y-2">
        {tips.slice(0, 3).map((tip, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <p className="text-sm font-medium text-text-primary">{tip.title}</p>
            <p className="text-xs text-text-muted">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}