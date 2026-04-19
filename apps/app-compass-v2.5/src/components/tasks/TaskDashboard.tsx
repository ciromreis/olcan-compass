/**
 * Task Visualization Dashboard
 * 
 * Aggregates and visualizes tasks with:
 * - Status overview (todo, in_progress, done)
 * - Priority distribution
 * - Timeline view
 * - Progress metrics
 */

import { useMemo } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { cn } from "@/lib/utils";

interface TaskDashboardProps {
  className?: string;
}

export function TaskDashboard({ className = "" }: TaskDashboardProps) {
  const { tasks, statistics } = useTaskStore();
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "COMPLETED").length;
    const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = tasks.filter(t => t.status === "PENDING").length;
    const blocked = tasks.filter(t => t.status === "BLOCKED").length;
    
    const highPriority = tasks.filter(t => t.priority === "HIGH" || t.priority === "CRITICAL").length;
    const mediumPriority = tasks.filter(t => t.priority === "MEDIUM").length;
    const lowPriority = tasks.filter(t => t.priority === "LOW").length;
    
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    
    // Upcoming (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = tasks.filter(t => {
      if (!t.due_date || t.status === "COMPLETED") return false;
      const due = new Date(t.due_date);
      return due >= now && due <= nextWeek;
    }).length;
    
    // Overdue
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === "COMPLETED") return false;
      return new Date(t.due_date) < now;
    }).length;
    
    return {
      total,
      done,
      inProgress,
      todo,
      blocked,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      upcoming,
      overdue
    };
  }, [tasks]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-emerald-500";
      case "in_progress": return "bg-blue-500";
      case "blocked": return "bg-red-500";
      default: return "bg-slate-300";
    }
  };
  
  const getPriorityLabel = (p: string) => {
    switch (p) {
      case "high": return { label: "Alta", color: "text-red-600", bg: "bg-red-50" };
      case "medium": return { label: "Média", color: "text-amber-600", bg: "bg-amber-50" };
      default: return { label: "Baixa", color: "text-slate-600", bg: "bg-slate-50" };
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-brand-100 p-2">
              <Target className="h-5 w-5 text-brand-600" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total</span>
          </div>
          <p className="text-h2 font-heading text-text-primary">{stats.total}</p>
          <p className="text-caption text-text-muted mt-1">{statistics?.completed_tasks || 0} concluidas</p>
        </div>
        
        {/* Completion Rate */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Conclusão</span>
          </div>
          <p className="text-h2 font-heading text-emerald-600">{stats.completionRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
        
        {/* In Progress */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Em Andamento</span>
          </div>
          <p className="text-h2 font-heading text-blue-600">{stats.inProgress}</p>
          <p className="text-caption text-text-muted mt-1">{stats.blocked} bloqueadas</p>
        </div>
        
        {/* Upcoming */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-amber-100 p-2">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Próximos 7 dias</span>
          </div>
          <p className="text-h2 font-heading text-amber-600">{stats.upcoming}</p>
          <p className="text-caption text-text-muted mt-1">{stats.overdue} atrasadas</p>
        </div>
      </div>
      
      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-6">
          <h3 className="text-subtitle font-semibold text-text-primary mb-4">Por Status</h3>
          <div className="space-y-4">
            {[
              { label: "Concluidas", value: stats.done, color: "bg-emerald-500" },
              { label: "Em Andamento", value: stats.inProgress, color: "bg-blue-500" },
              { label: "Pendentes", value: stats.todo, color: "bg-slate-300" },
              { label: "Bloqueadas", value: stats.blocked, color: "bg-red-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="flex-1 text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", item.color)}
                    style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Priority Distribution */}
        <div className="card-surface rounded-2xl border border-brand-100/70 p-6">
          <h3 className="text-subtitle font-semibold text-text-primary mb-4">Por Prioridade</h3>
          <div className="space-y-4">
            {[
              { label: "Alta", value: stats.highPriority, color: "bg-red-500" },
              { label: "Média", value: stats.mediumPriority, color: "bg-amber-500" },
              { label: "Baixa", value: stats.lowPriority, color: "bg-slate-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="flex-1 text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", item.color)}
                    style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="card-surface rounded-2xl border border-brand-100/70 p-5">
        <div className="flex flex-wrap gap-3">
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {stats.overdue} tarefa{stats.overdue > 1 ? "s" : ""} atrasada{stats.overdue > 1 ? "s" : ""}
            </div>
          )}
          {stats.upcoming > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <Clock className="h-4 w-4" />
              {stats.upcoming} para esta semana
            </div>
          )}
          {stats.blocked > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4" />
              {stats.blocked} bloqueada{stats.blocked > 1 ? "s" : ""}
            </div>
          )}
          {stats.total === 0 && (
            <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-600">
              <CheckCircle2 className="h-4 w-4" />
              Nenhuma tarefa — você está em dia!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}