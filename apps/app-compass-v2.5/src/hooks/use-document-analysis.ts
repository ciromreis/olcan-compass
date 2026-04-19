/**
 * Document Analysis Hooks
 * 
 * Hooks for document AI analysis and metrics tracking.
 */

import { useState, useCallback } from "react";
import { useForgeStore, type ForgeDocument } from "@/stores/forge";
import { forgeApi } from "@/lib/api";
import { analyzeATSCompatibility, type ATSAnalysisResult } from "@/lib/ats-analyzer";

export function useDocumentAnalysis(docId: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getDocById, updateContent } = useForgeStore();
  
  const doc = getDocById(docId);
  
  const runLocalAnalysis = useCallback(async (jobDescription?: string): Promise<ATSAnalysisResult | null> => {
    if (!doc?.content) return null;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (jobDescription) {
        const result = analyzeATSCompatibility({
          resumeText: doc.content,
          jobDescription,
        });
        return result;
      }
      
      // Basic content analysis
      const words = doc.content.split(/\s+/).length;
      const sentences = doc.content.split(/[.!?]+/).length;
      
      return {
        overallScore: Math.min(100, Math.round((words / 500) * 50 + 30)),
        keywordMatch: { score: 50, matched: [], missing: [], total: 0 },
        skillsMatch: { score: 50, matched: [], missing: [], recommendations: [] },
        experienceMatch: { score: 50, yearsRequired: null, yearsFound: null, feedback: "N/A" },
        educationMatch: { score: 50, required: [], found: [], feedback: "N/A" },
        suggestions: [],
        strengths: ["Document created"],
        weaknesses: [],
      };
    } catch (e) {
      setError("Analysis failed");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [doc?.content]);
  
  const runBackendAnalysis = useCallback(async () => {
    if (!docId) return null;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data } = await forgeApi.analyzeDocument(docId);
      return data;
    } catch (e) {
      setError("Backend analysis unavailable");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [docId]);
  
  const runATSAnalysis = useCallback(async (jobDescription: string): Promise<ATSAnalysisResult | null> => {
    if (!doc?.content || !jobDescription) return null;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = analyzeATSCompatibility({
        resumeText: doc.content,
        jobDescription,
      });
      
      // Also try backend
      try {
        await forgeApi.atsAnalyzeDocument(docId, {
          job_description: jobDescription,
          target_keywords: result.keywordMatch.missing.slice(0, 10),
        });
      } catch {
        // Backend optional
      }
      
      return result;
    } catch (e) {
      setError("ATS analysis failed");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [doc?.content, docId]);
  
  return {
    doc,
    isAnalyzing,
    error,
    runLocalAnalysis,
    runBackendAnalysis,
    runATSAnalysis,
  };
}

export function useDocumentMetrics() {
  const { documents, getStats } = useForgeStore();
  
  const metrics = getStats();
  
  const byType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgScore = documents.length > 0
    ? documents.reduce((sum, d) => sum + (d.competitivenessScore || 0), 0) / documents.length
    : 0;
  
  const totalWords = documents.reduce((sum, d) => sum + d.content.split(/\s+/).length, 0);
  
  return {
    total: documents.length,
    metrics,
    byType,
    avgScore: Math.round(avgScore),
    totalWords,
  };
}