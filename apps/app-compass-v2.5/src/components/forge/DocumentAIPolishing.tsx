/**
 * Document AI Polishing Panel
 * 
 * Advanced AI modification options similar to Grammarly.
 * Provides deep rewriting, tone adjustment, clarity improvement, etc.
 */

import { useState } from "react";
import { 
  Wand2, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Sparkles,
  Type,
  AlignLeft,
  Zap,
  Target,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { cn } from "@/lib/utils";

interface DocumentAIPolishingProps {
  documentId: string;
  currentContent: string;
  onApply: (newContent: string) => void;
  className?: string;
}

interface AIPolishOption {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: typeof Wand2;
}

const POLISH_OPTIONS: AIPolishOption[] = [
  {
    id: "deep-rewrite",
    label: "Deep Rewrite",
    description: "Complete restructuring with better flow and clarity",
    prompt: "Rewrite this document with improved clarity, flow, and impact while maintaining the original message and key points.",
    icon: RefreshCw,
  },
  {
    id: "clarify",
    label: "Improve Clarity",
    description: "Simplify complex sentences and improve readability",
    prompt: "Improve clarity by simplifying complex sentences, removing jargon, and making the document easier to understand.",
    icon: AlignLeft,
  },
  {
    id: "formalize",
    label: "Make Formal",
    description: "Convert to more professional language",
    prompt: "Convert to a more formal, professional tone appropriate for academic or job applications.",
    icon: Type,
  },
  {
    id: "personalize",
    label: "Add Personal Voice",
    description: "Make it warmer and more personal",
    prompt: "Add a warm, personal voice while maintaining professionalism. Include authentic examples from personal experience.",
    icon: MessageSquare,
  },
  {
    id: "impact",
    label: "Increase Impact",
    description: "Strengthen language and make it more persuasive",
    prompt: "Strengthen the language to be more impactful and persuasive. Use stronger verbs and more compelling phrasing.",
    icon: Zap,
  },
  {
    id: "structure",
    label: "Improve Structure",
    description: "Better organization and flow",
    prompt: "Improve document structure with better paragraphs, transitions, and organization.",
    icon: AlignLeft,
  },
  {
    id: " ATS-optimize",
    label: "Optimize for ATS",
    description: "Optimize for applicant tracking systems",
    prompt: "Optimize for ATS by including relevant keywords, avoiding complex formatting, and ensuring machine readability.",
    icon: Target,
  },
];

export function DocumentAIPolishing({
  documentId,
  currentContent,
  onApply,
  className = "",
}: DocumentAIPolishingProps) {
  const { updateContent } = useForgeStore();
  const [selectedOption, setSelectedOption] = useState<AIPolishOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  
  const handlePolish = async (option?: AIPolishOption) => {
    const opt = option || selectedOption;
    if (!opt) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate AI processing (in real app, call AI API)
      const newContent = currentContent + `\n\n<!-- Polished with: ${opt.label} -->`;
      
      await updateContent(documentId, newContent);
      onApply?.(newContent);
      
      // Reset after short delay
      setTimeout(() => {
        setIsProcessing(false);
        setSelectedOption(null);
      }, 1500);
    } catch (e) {
      setIsProcessing(false);
    }
  };
  
  const handleCustomPolish = async () => {
    if (!customPrompt.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const newContent = currentContent + `\n\n<!-- Custom: ${customPrompt.slice(0, 50)}... -->`;
      
      await updateContent(documentId, newContent);
      onApply?.(newContent);
      
      setTimeout(() => {
        setIsProcessing(false);
        setCustomPrompt("");
        setShowCustomPrompt(false);
      }, 1500);
    } catch (e) {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">AI Polishing</span>
      </div>
      
      {/* Processing State */}
      {isProcessing && (
        <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
          <p className="text-sm text-brand-700">Processing with AI...</p>
        </div>
      )}
      
      {/* Quick Options Grid */}
      {!isProcessing && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {POLISH_OPTIONS.slice(0, 6).map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(option);
                  handlePolish(option);
                }}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors hover:border-brand-300",
                  selectedOption?.id === option.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200"
                )}
              >
                <option.icon className="w-4 h-4 text-brand-500 mb-1" />
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-text-muted">{option.description}</p>
              </button>
            ))}
          </div>
          
          {/* Custom Prompt */}
          <button
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="w-full py-2 text-sm text-brand-600 hover:text-brand-700"
          >
            {showCustomPrompt ? "Cancel custom" : "Custom prompt..."}
          </button>
          
          {showCustomPrompt && (
            <div className="space-y-2">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to change..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                rows={3}
              />
              <button
                onClick={handleCustomPolish}
                disabled={!customPrompt.trim()}
                className={cn(
                  "w-full py-2 rounded-lg font-medium",
                  customPrompt.trim()
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                Apply Custom
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Credits */}
      <div className="rounded-lg bg-slate-50 p-3 text-xs text-text-muted">
        <Zap className="w-3 h-3 inline mr-1" />
        Uses 1 credit per AI polish
      </div>
    </div>
  );
}