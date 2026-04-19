"use client";

import { useMemo } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle,
  ArrowRight,
  FileText,
  Users,
  Building,
  Target,
  ChevronRight,
} from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { useTaskStore } from "@/stores/taskStore";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  type: "deadline" | "document" | "task" | "interview" | "milestone";
  status: "completed" | "pending" | "overdue" | "upcoming";
  description?: string;
  link?: string;
}

interface DossierTimelineProps {
  className?: string;
}

export function DossierTimeline({ className = "" }: DossierTimelineProps) {
  const { documents } = useForgeStore();
  const { applications } = useApplicationStore();
  const { tasks } = useTaskStore();

  const events = useMemo((): TimelineEvent[] => {
    const now = new Date();
    const timeline: TimelineEvent[] = [];

    applications
      .filter((app) => app.deadline && app.status !== "submitted")
      .forEach((app) => {
        const deadline = new Date(app.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        timeline.push({
          id: `deadline-${app.id}`,
          date: deadline,
          title: app.program,
          type: "deadline",
          status: daysUntil < 0 ? "overdue" : daysUntil <= 7 ? "upcoming" : "pending",
          description: daysUntil < 0 
            ? `Expirado há ${Math.abs(daysUntil)} dias` 
            : daysUntil === 0 
              ? " deadline今天!" 
              : `${daysUntil} dias restantes`,
          link: `/applications/${app.id}`,
        });
      });

    documents
      .filter((doc) => doc.readinessLevel !== "export_ready" && doc.readinessLevel !== "submitted")
      .forEach((doc) => {
        const updated = new Date(doc.updatedAt);
        timeline.push({
          id: `doc-${doc.id}`,
          date: updated,
          title: doc.title,
          type: "document",
          status: "pending",
          description: `Precisa trabalho: ${doc.readinessLevel}`,
          link: `/forge/${doc.id}`,
        });
      });

    tasks
      .filter((task) => task.status !== "COMPLETED")
      .slice(0, 10)
      .forEach((task) => {
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        timeline.push({
          id: `task-${task.id}`,
          date: dueDate || new Date(task.created_at || now),
          title: task.title,
          type: "task",
          status: dueDate && dueDate < now ? "overdue" : "pending",
          description: task.status,
          link: `/tasks/${task.id}`,
        });
      });

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [applications, documents, tasks]);

  const upcoming = useMemo(() => {
    return events.filter((e) => e.status === "upcoming" || e.status === "pending");
  }, [events]);

  const overdue = useMemo(() => {
    return events.filter((e) => e.status === "overdue");
  }, [events]);

  const completed = useMemo(() => {
    return events.filter((e) => e.status === "completed");
  }, [events]);

  const getIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "deadline": return Calendar;
      case "document": return FileText;
      case "task": return Target;
      case "interview": return Users;
      case "milestone": return CheckCircle;
    }
  };

  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "overdue": return "bg-rose-500";
      case "upcoming": return "bg-amber-500";
      default: return "bg-slate-300";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    if (days === -1) return "Ontem";
    if (days < 0) return `${Math.abs(days)} dias atrás`;
    if (days <= 7) return `${days} dias`;
    if (days <= 30) return `${Math.ceil(days / 7)} sem`;
    return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const groupedByMonth = useMemo(() => {
    const groups: Map<string, TimelineEvent[]> = new Map();
    
    events.forEach((event) => {
      const monthKey = event.date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(event);
    });
    
    return groups;
  }, [events]);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-heading text-h3 text-[#001338]">Linha do Tempo</h3>
        <p className="mt-1 text-body-sm text-[#001338]/50">
          Visão chronological dos seus processos e tarefas
        </p>
      </div>

      {overdue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">Atrasado</span>
          </div>
          <div className="space-y-1">
            {overdue.map((event) => {
              const Icon = getIcon(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-200">
                    <Icon className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-rose-900">{event.title}</p>
                    <p className="text-sm text-rose-700">{event.description}</p>
                  </div>
                  <span className="text-sm font-medium text-rose-600">{formatDate(event.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {groupedByMonth.size === 0 ? (
          <GlassCard variant="olcan" padding="lg" className="border-[#001338]/10 border-dashed bg-transparent">
            <Calendar className="mx-auto mb-3 h-8 w-8 text-[#001338]/20" />
            <p className="font-heading text-h4 text-[#001338]">Nenhum evento cronograma</p>
            <p className="mt-1 text-body-sm text-[#001338]/50">
              Adicione oportunidades e tarefas para ver sua linha do tempo.
            </p>
          </GlassCard>
        ) : (
          Array.from(groupedByMonth.entries()).map(([month, monthEvents]) => (
            <div key={month} className="space-y-2">
              <div className="sticky top-0 bg-white/80 backdrop-blur-sm py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#001338]/50">{month}</p>
              </div>
              <div className="relative border-l-2 border-cream-200 ml-4 space-y-4">
                {monthEvents.map((event, idx) => {
                  const Icon = getIcon(event.type);
                  const isLink = event.link;
                  
                  const content = (
                    <div key={event.id} className="relative pl-6">
                      <div className={cn(
                        "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white",
                        getStatusColor(event.status)
                      )} />
                      <div className={cn(
                        "rounded-lg border p-3",
                        event.status === "overdue" ? "border-rose-200 bg-rose-50" :
                        event.status === "upcoming" ? "border-amber-200 bg-amber-50" :
                        "border-cream-200 bg-white"
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#001338]" />
                            <p className="font-medium text-[#001338]">{event.title}</p>
                          </div>
                          <span className={cn(
                            "text-xs font-semibold",
                            event.status === "overdue" ? "text-rose-600" :
                            event.status === "upcoming" ? "text-amber-600" :
                            "text-[#001338]/50"
                          )}>
                            {formatDate(event.date)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="mt-1 text-sm text-[#001338]/60">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                  
                  if (isLink) {
                    return (
                      <a key={event.id} href={event.link} className="block">
                        {content}
                      </a>
                    );
                  }
                  return content;
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cream-200">
        <div className="text-center">
          <p className="font-heading text-h3 text-rose-600">{overdue.length}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-rose-500/50">Atrasado</p>
        </div>
        <div className="text-center">
          <p className="font-heading text-h3 text-amber-600">{upcoming.filter((e) => e.status === "upcoming").length}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-amber-500/50">Esta Semana</p>
        </div>
        <div className="text-center">
          <p className="font-heading text-h3 text-[#001338]">{upcoming.length + overdue.length}</p>
          <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">TotalEvents</p>
        </div>
      </div>
    </div>
  );
}