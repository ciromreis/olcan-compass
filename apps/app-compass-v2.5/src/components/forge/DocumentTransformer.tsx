/**
 * Document Transformer
 * 
 * Provides quick transformation controls for documents:
 * - Tone changes (formal, casual, persuasive)
 * - Length adjustments (expand, condense)
 * - Style improvements
 * - Format conversions
 */

import { useState } from "react";
import { 
  Sparkles, 
  FileEdit, 
  Minimize2, 
  Maximize2, 
  ArrowRightLeft, 
  Check,
  Loader2,
  Wand2
} from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { cn } from "@/lib/utils";

interface DocumentTransformerProps {
  documentId: string;
  currentContent: string;
  onTransform?: (newContent: string) => void;
  className?: string;
}

type TransformType = "tone" | "length" | "style" | "format";
type ToneOption = "formal" | "casual" | "persuasive" | "academic";
type LengthOption = "expand" | "condense" | "same";
type StyleOption = "clear" | "impactful" | "storytelling";

const TONE_OPTIONS: { id: ToneOption; label: string; description: string }[] = [
  { id: "formal", label: "Formal", description: "Professional language" },
  { id: "casual", label: "Casual", description: "Friendly tone" },
  { id: "persuasive", label: "Persuasive", description: "Convincing language" },
  { id: "academic", label: "Acadêmico", description: "Research-focused" },
];

const LENGTH_OPTIONS: { id: LengthOption; label: string; icon: typeof Minimize2 }[] = [
  { id: "condense", label: "Condensar", icon: Minimize2 },
  { id: "same", label: "Manter", icon: ArrowRightLeft },
  { id: "expand", label: "Expandir", icon: Maximize2 },
];

const STYLE_OPTIONS: { id: StyleOption; label: string; description: string }[] = [
  { id: "clear", label: "Claro", description: "Simple, direct language" },
  { id: "impactful", label: "Impactante", description: "Stronger verbs and phrases" },
  { id: "storytelling", label: "Narrativo", description: "Story-driven approach" },
];

export function DocumentTransformer({
  documentId,
  currentContent,
  onTransform,
  className = "",
}: DocumentTransformerProps) {
  const { updateContent } = useForgeStore();
  const [activeTab, setActiveTab] = useState<TransformType>("tone");
  const [selectedTone, setSelectedTone] = useState<ToneOption | null>(null);
  const [selectedLength, setSelectedLength] = useState<LengthOption>("same");
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  
  const handleTransform = async () => {
    if (!selectedTone && !selectedStyle) return;
    
    setIsTransforming(true);
    
    // Simulate transformation (in real app, use AI)
    // For now, just add a note about transformation intent
    const transformNote = `\n\n---\n[Transformação aplicada: ${selectedTone || selectedStyle}]---\n`;
    const newContent = currentContent + transformNote;
    
    try {
      await updateContent(documentId, newContent);
      onTransform?.(newContent);
    } finally {
      setIsTransforming(false);
    }
  };
  
  const hasSelection = selectedTone !== null || selectedStyle !== null;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab Selection */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(["tone", "length", "style"] as TransformType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-white text-brand-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab === "tone" && "Tom"}
            {tab === "length" && "Tamanho"}
            {tab === "style" && "Estilo"}
          </button>
        ))}
      </div>
      
      {/* Options based on tab */}
      <div className="space-y-3">
        {activeTab === "tone" && (
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedTone(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  selectedTone === option.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-brand-300"
                )}
              >
                <p className="text-sm font-medium text-text-primary">{option.label}</p>
                <p className="text-xs text-text-muted">{option.description}</p>
              </button>
            ))}
          </div>
        )}
        
        {activeTab === "length" && (
          <div className="flex gap-2">
            {LENGTH_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedLength(option.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors",
                  selectedLength === option.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-brand-300"
                )}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {activeTab === "style" && (
          <div className="space-y-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedStyle(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-colors",
                  selectedStyle === option.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-brand-300"
                )}
              >
                <p className="text-sm font-medium text-text-primary">{option.label}</p>
                <p className="text-xs text-text-muted">{option.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Apply Button */}
      <button
        onClick={handleTransform}
        disabled={!hasSelection || isTransforming}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors",
          hasSelection
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "bg-slate-100 text-slate-400",
          isTransforming && "opacity-50"
        )}
      >
        {isTransforming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Transformando...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Aplicar Transforma��ão
          </>
        )}
      </button>
    </div>
  );
}