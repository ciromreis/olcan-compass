import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ForgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'essay' | 'resume' | 'cover_letter' | 'statement' | 'other';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  versions: ForgeVersion[];
  competitivenessScore?: number;
  metrics?: {
    score: number;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
    suggestions: string[];
    wordCount: number;
    readabilityScore: number;
  };
}

interface ForgeVersion {
  id: string;
  content: string;
  wordCount: number;
  createdAt: string;
  changes: string;
}

interface CoachThread {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  category: 'structure' | 'content' | 'style' | 'grammar' | 'tone';
}

interface ForgeStore {
  // State
  documents: ForgeDocument[];
  activeDocumentId: string | null;
  
  // Document Actions
  createDocument: (title: string, type: ForgeDocument['type']) => string;
  updateContent: (id: string, content: string) => void;
  deleteDocument: (id: string) => void;
  getDocById: (id: string) => ForgeDocument | undefined;
  
  // Version Management
  saveVersion: (id: string, changes?: string) => void;
  getVersionHistory: (id: string) => ForgeVersion[];
  restoreVersion: (id: string, versionId: string) => void;
  
  // Analysis & Coaching
  analyzeDocument: (id: string) => Promise<void>;
  calculateCompetitiveness: (id: string) => number;
  getCoachSuggestions: (id: string) => CoachThread[];
  askCoach: (id: string, question: string) => Promise<string>;
  
  // Search & Filter
  searchDocuments: (query: string) => ForgeDocument[];
  getDocumentsByType: (type: ForgeDocument['type']) => ForgeDocument[];
  
  // Utility
  setActiveDocument: (id: string | null) => void;
  reset: () => void;
}

const generateMockMetrics = (content: string) => {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentences;
  
  // Mock analysis
  const issues = [];
  const suggestions = [];
  
  if (avgWordsPerSentence > 20) {
    issues.push({
      type: "sentence_length",
      severity: "medium",
      message: "Sentenças muito longas. Considere dividir para melhor legibilidade."
    });
  }
  
  if (wordCount < 200) {
    issues.push({
      type: "length",
      severity: "high",
      message: "Texto muito curto. Adicione mais detalhes e desenvolvimento."
    });
  }
  
  if (content.toLowerCase().split(/\s+/).filter(word => word.length > 12).length > 5) {
    issues.push({
      type: "word_complexity",
      severity: "low",
      message: "Considere substituir palavras complexas por alternativas mais simples."
    });
  }
  
  suggestions.push("Adicione exemplos concretos para fortalecer seus argumentos.");
  suggestions.push("Revise a estrutura para garantir fluxo lógico.");
  suggestions.push("Verifique a consistência do tom ao longo do texto.");
  
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2 - (wordCount < 200 ? 20 : 0)));
  const score = Math.max(0, Math.min(100, readabilityScore - issues.length * 5));
  
  return {
    score,
    issues,
    suggestions,
    wordCount,
    readabilityScore
  };
};

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      documents: [],
      activeDocumentId: null,

      // Document Actions
      createDocument: (title, type) => {
        const id = `doc_${Date.now()}`;
        const newDoc: ForgeDocument = {
          id,
          title,
          type,
          content: '',
          wordCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: []
        };

        set((state) => ({
          documents: [...state.documents, newDoc],
          activeDocumentId: id
        }));

        return id;
      },

      updateContent: (id, content) => {
        set((state) => ({
          documents: state.documents.map(doc =>
            doc.id === id
              ? {
                  ...doc,
                  content,
                  wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
                  updatedAt: new Date().toISOString()
                }
              : doc
          )
        }));
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id),
          activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId
        }));
      },

      getDocById: (id) => {
        return get().documents.find(doc => doc.id === id);
      },

      // Version Management
      saveVersion: (id, changes = "Manual save") => {
        const doc = get().getDocById(id);
        if (!doc) return;

        const newVersion: ForgeVersion = {
          id: `v_${Date.now()}`,
          content: doc.content,
          wordCount: doc.wordCount,
          createdAt: new Date().toISOString(),
          changes
        };

        set((state) => ({
          documents: state.documents.map(d =>
            d.id === id
              ? { ...d, versions: [...d.versions, newVersion] }
              : d
          )
        }));
      },

      getVersionHistory: (id) => {
        const doc = get().getDocById(id);
        return doc ? doc.versions : [];
      },

      restoreVersion: (id, versionId) => {
        const doc = get().getDocById(id);
        const version = doc?.versions.find(v => v.id === versionId);
        
        if (doc && version) {
          get().updateContent(id, version.content);
        }
      },

      // Analysis & Coaching
      analyzeDocument: async (id) => {
        const doc = get().getDocById(id);
        if (!doc) return;

        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const metrics = generateMockMetrics(doc.content);

        set((state) => ({
          documents: state.documents.map(d =>
            d.id === id
              ? { ...d, metrics }
              : d
          )
        }));
      },

      calculateCompetitiveness: (id) => {
        const doc = get().getDocById(id);
        if (!doc) return 0;

        // Mock competitiveness calculation
        let score = 50;
        
        if (doc.wordCount > 500) score += 10;
        if (doc.wordCount > 1000) score += 10;
        if (doc.content.includes('experience')) score += 5;
        if (doc.content.includes('skills')) score += 5;
        if (doc.content.includes('achieve')) score += 10;
        if (doc.content.includes('project')) score += 5;
        if (doc.content.includes('leadership')) score += 5;

        return Math.min(100, score);
      },

      getCoachSuggestions: () => {
        // Mock coach suggestions
        return [
          {
            id: 'coach_1',
            question: 'Como posso melhorar a introdução?',
            answer: 'Comece com um gancho forte que capture a atenção do leitor imediatamente. Use dados, estatísticas ou uma história pessoal envolvente.',
            timestamp: new Date().toISOString(),
            category: 'structure'
          },
          {
            id: 'coach_2',
            question: 'Meu texto está muito formal?',
            answer: 'Adapte o tom ao seu público. Para contextos acadêmicos, mantenha a formalidade. Para aplicações mais pessoais, pode ser um pouco mais informal.',
            timestamp: new Date().toISOString(),
            category: 'tone'
          }
        ];
      },

      askCoach: async () => {
        // Simulate AI coach response
        await new Promise(resolve => setTimeout(resolve, 1500));

        const responses = [
          "Considere adicionar exemplos específicos para ilustrar seus pontos.",
          "Sua estrutura está boa, mas poderia beneficiar de transições mais suaves entre parágrafos.",
          "Revise a clareza e concisão da sua linguagem. Menos é mais.",
          "Adicione dados ou evidências para fortalecer seus argumentos.",
          "Seu tom é apropriado, mas verifique a consistência em todo o documento."
        ];

        return responses[Math.floor(Math.random() * responses.length)];
      },

      // Search & Filter
      searchDocuments: (query) => {
        const documents = get().documents;
        const lowercaseQuery = query.toLowerCase();
        
        return documents.filter(doc =>
          doc.title.toLowerCase().includes(lowercaseQuery) ||
          doc.content.toLowerCase().includes(lowercaseQuery)
        );
      },

      getDocumentsByType: (type) => {
        return get().documents.filter(doc => doc.type === type);
      },

      // Utility
      setActiveDocument: (id) => {
        set({ activeDocumentId: id });
      },

      reset: () => {
        set({
          documents: [],
          activeDocumentId: null
        });
      }
    }),
    {
      name: 'forge-store',
      partialize: (state) => ({
        documents: state.documents,
        activeDocumentId: state.activeDocumentId
      })
    }
  )
);
