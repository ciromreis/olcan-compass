/**
 * Forge Usage Analytics
 * 
 * Tracks and displays document usage metrics.
 */

import { useMemo } from "react";
import { TrendingUp, FileText, Clock, Target, Award } from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { cn } from "@/lib/utils";

interface ForgeAnalyticsProps {
  className?: string;
}

export function ForgeAnalytics({ className = "" }: ForgeAnalyticsProps) {
  const { documents, getStats } = useForgeStore();
  const stats = getStats();
  
  const analytics = useMemo(() => {
    const total = documents.length;
    const totalWords = documents.reduce((sum, d) => 
      sum + d.content.split(/\s+/).filter(Boolean).length, 0
    );
    
    const byType = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgScore = total > 0
      ? documents.reduce((sum, d) => sum + (d.competitivenessScore || 0), 0) / total
      : 0;
    
    const readyDocs = documents.filter(d => 
      d.readinessLevel === "export_ready" || d.readinessLevel === "submitted"
    ).length;
    
    const recentDocs = documents.filter(d => {
      const updated = new Date(d.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updated > weekAgo;
    }).length;
    
    return {
      total,
      totalWords,
      avgScore: Math.round(avgScore),
      readyDocs,
      recentDocs,
      byType,
    };
  }, [documents]);
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-clay-600";
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-text-muted">Total Docs</span>
          </div>
          <p className="text-h3 font-heading">{analytics.total}</p>
        </div>
        
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-text-muted">Avg Score</span>
          </div>
          <p className={cn("text-h3 font-heading", getScoreColor(analytics.avgScore))}>
            {analytics.avgScore}%
          </p>
        </div>
        
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-text-muted">Ready</span>
          </div>
          <p className="text-h3 font-heading text-emerald-600">{analytics.readyDocs}</p>
        </div>
        
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-text-muted">This Week</span>
          </div>
          <p className="text-h3 font-heading">{analytics.recentDocs}</p>
        </div>
      </div>
      
      {/* Word Count */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Total Words</span>
          <span className="text-sm font-medium">{analytics.totalWords.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full"
            style={{ width: `${Math.min(100, (analytics.totalWords / 10000) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* By Type */}
      <div className="card-surface p-4">
        <h4 className="text-sm font-medium mb-3">By Type</h4>
        <div className="space-y-2">
          {Object.entries(analytics.byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary capitalize">{type.replace(/_/g, " ")}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}