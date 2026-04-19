/**
 * Bulk Document Creator
 * 
 * Allows creating multiple documents for parallel applications at once.
 * Use case: Apply to Chevening + 3 universities = 4 processes with shared + unique docs
 */

import { useState } from "react";
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Plus, 
  X, 
  Check,
  Copy,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { useForgeStore, type DocType, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore } from "@/stores/applications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BulkDocumentCreatorProps {
  onClose: () => void;
  opportunityId?: string | null;
  opportunityTitle?: string | null;
}

// Document types needed per opportunity type
const DOCUMENTS_BY_TYPE: Record<string, DocType[]> = {
  scholarship: ["cv", "motivation_letter", "personal_statement", "recommendation"],
  master: ["cv", "motivation_letter", "statement_of_purpose", "recommendation"],
  phd: ["cv", "research_proposal", "statement_of_purpose", "recommendation"],
  job: ["resume", "cover_letter", "portfolio"],
  job_senior: ["cv", "cover_letter", "recommendation"],
};

interface OpportunityTemplate {
  id: string;
  label: string;
  icon: typeof Briefcase;
  requiredDocuments: DocType[];
  wordCounts: Partial<Record<DocType, { min: number; max: number }>>;
}

const OPPORTUNITY_TEMPLATES: OpportunityTemplate[] = [
  {
    id: "scholarship",
    label: "Bolsa de Estudos",
    icon: GraduationCap,
    requiredDocuments: ["cv", "motivation_letter", "personal_statement", "recommendation"],
    wordCounts: {
      cv: { min: 300, max: 600 },
      motivation_letter: { min: 250, max: 400 },
      personal_statement: { min: 300, max: 500 },
      recommendation: { min: 200, max: 400 },
    },
  },
  {
    id: "master",
    label: "Mestrado",
    icon: GraduationCap,
    requiredDocuments: ["cv", "motivation_letter", "statement_of_purpose"],
    wordCounts: {
      cv: { min: 300, max: 600 },
      motivation_letter: { min: 250, max: 400 },
      statement_of_purpose: { min: 500, max: 1000 },
    },
  },
  {
    id: "phd",
    label: "Doutorado",
    icon: GraduationCap,
    requiredDocuments: ["cv", "research_proposal", "statement_of_purpose", "recommendation"],
    wordCounts: {
      cv: { min: 300, max: 600 },
      research_proposal: { min: 1000, max: 3000 },
      statement_of_purpose: { min: 500, max: 1000 },
    },
  },
  {
    id: "job",
    label: "Vaga Corporativa",
    icon: Briefcase,
    requiredDocuments: ["resume", "cover_letter"],
    wordCounts: {
      resume: { min: 200, max: 500 },
      cover_letter: { min: 150, max: 300 },
    },
  },
  {
    id: "job_senior",
    label: "Vaga Sênior",
    icon: Briefcase,
    requiredDocuments: ["cv", "cover_letter", "recommendation"],
    wordCounts: {
      cv: { min: 400, max: 800 },
      cover_letter: { min: 200, max: 400 },
    },
  },
];

export function BulkDocumentCreator({ 
  onClose, 
  opportunityId, 
  opportunityTitle 
}: BulkDocumentCreatorProps) {
  const router = useRouter();
  const { createDocument } = useForgeStore();
  const { applications } = useApplicationStore();
  
  const [step, setStep] = useState<"select" | "customize" | "creating" | "done">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [targetProgram, setTargetProgram] = useState(opportunityTitle || "");
  const [language, setLanguage] = useState("en");
  const [selectedDocs, setSelectedDocs] = useState<Set<DocType>>(new Set());
  const [creating, setCreating] = useState(false);
  const [createdDocs, setCreatedDocs] = useState<string[]>([]);
  
  const template = OPPORTUNITY_TEMPLATES.find(t => t.id === selectedTemplate);
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = OPPORTUNITY_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setSelectedDocs(new Set(tmpl.requiredDocuments));
    }
  };
  
  const toggleDoc = (docType: DocType) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(docType)) {
      newSet.delete(docType);
    } else {
      newSet.add(docType);
    }
    setSelectedDocs(newSet);
  };
  
  const handleCreateAll = async () => {
    if (!targetProgram.trim() || selectedDocs.size === 0) return;
    
    setCreating(true);
    setStep("creating");
    
    const created: string[] = [];
    
    for (const docType of selectedDocs) {
      const docLabel = DOC_TYPE_LABELS[docType];
      const title = `${docLabel} — ${targetProgram}`;
      
      const docId = await createDocument({
        title,
        type: docType,
        targetProgram: targetProgram,
        language,
        primaryOpportunityId: opportunityId || undefined,
        opportunityIds: opportunityId ? [opportunityId] : undefined,
      });
      
      if (docId) {
        created.push(docId);
      }
    }
    
    setCreatedDocs(created);
    setCreating(false);
    setStep("done");
  };
  
  const goToDocument = (docId: string) => {
    router.push(`/forge/${docId}`);
    onClose();
  };
  
  if (step === "done") {
    return (
      <div className="card-surface border border-brand-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Documents created!</p>
            <p className="text-sm text-text-muted">{createdDocs.length} documents ready</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {createdDocs.map((docId, i) => (
            <button
              key={docId}
              onClick={() => goToDocument(docId)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Document {i + 1}</span>
              <ArrowRight className="w-4 h-4 text-brand-500" />
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
        >
          Done
        </button>
      </div>
    );
  }
  
  if (step === "creating") {
    return (
      <div className="card-surface border border-brand-200 p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
        <p className="font-medium text-text-primary">Creating {selectedDocs.size} documents...</p>
        <p className="text-sm text-text-muted">This will take a moment</p>
      </div>
    );
  }
  
  if (step === "customize") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Customize Documents</h3>
          <button onClick={() => setStep("select")} className="text-sm text-brand-500">
            Back
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Target Program
          </label>
          <input
            type="text"
            value={targetProgram}
            onChange={(e) => setTargetProgram(e.target.value)}
            placeholder="Ex: MSc Computer Science, TU Berlin"
            className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Documents to create
          </label>
          <div className="space-y-2">
            {Array.from(selectedDocs).map((docType) => (
              <div
                key={docType}
                className="flex items-center justify-between p-3 rounded-lg border border-brand-200 bg-brand-50/50"
              >
                <span className="text-sm font-medium text-text-primary">
                  {DOC_TYPE_LABELS[docType]}
                </span>
                <button
                  onClick={() => toggleDoc(docType)}
                  className="text-brand-500 hover:text-brand-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Idioma</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="pt">Português</option>
          </select>
        </div>
        
        <button
          onClick={handleCreateAll}
          disabled={!targetProgram.trim() || selectedDocs.size === 0}
          className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Create {selectedDocs.size} Documents
        </button>
      </div>
    );
  }
  
  // Step 1: Select template
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Bulk Document Creator</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-text-muted">
        Select the type of process. We'll create the standard documents automatically.
      </p>
      
      <div className="space-y-2">
        {OPPORTUNITY_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => handleTemplateSelect(tmpl.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
              selectedTemplate === tmpl.id
                ? "border-brand-500 bg-brand-50"
                : "border-cream-200 hover:border-brand-300"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              selectedTemplate === tmpl.id ? "bg-brand-100" : "bg-cream-100"
            )}>
              <tmpl.icon className={cn(
                "w-5 h-5",
                selectedTemplate === tmpl.id ? "text-brand-500" : "text-text-muted"
              )} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">{tmpl.label}</p>
              <p className="text-xs text-text-muted">
                {tmpl.requiredDocuments.length} documents
              </p>
            </div>
            {selectedTemplate === tmpl.id && (
              <Check className="w-5 h-5 text-brand-500" />
            )}
          </button>
        ))}
      </div>
      
      {selectedTemplate && (
        <button
          onClick={() => setStep("customize")}
          className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
        >
          Continue <ArrowRight className="w-4 h-4 inline ml-2" />
        </button>
      )}
    </div>
  );
}