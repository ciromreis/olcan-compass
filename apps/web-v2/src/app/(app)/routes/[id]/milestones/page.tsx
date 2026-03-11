"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Circle, Clock, ChevronRight, Milestone } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function MilestonesPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { getRouteById } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);

  const groups = useMemo(() => {
    if (!route) return [];
    const groupNames = Array.from(new Set(route.milestones.map((m) => m.group)));
    return groupNames.map((name) => ({
      name,
      milestones: route.milestones.filter((m) => m.group === name),
    }));
  }, [route]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!route) {
    return <div className="max-w-4xl mx-auto"><EmptyState icon={Milestone} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Milestones" subtitle={`${route.name} — ${route.milestones.length} milestones em ${groups.length} grupos`} />

      <div className="space-y-8">
        {groups.map((group) => {
          const completed = group.milestones.filter((m) => m.status === "completed").length;
          return (
            <div key={group.name}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-h4 text-text-primary">{group.name}</h2>
                <span className="text-caption text-text-muted">{completed}/{group.milestones.length} completos</span>
              </div>
              <div className="space-y-2">
                {group.milestones.map((m) => (
                  <Link key={m.id} href={`/routes/${id}/milestones/${m.id}`} className="card-surface p-4 flex items-center gap-3 group hover:bg-cream-100 transition-colors">
                    {m.status === "completed" ? <CheckCircle className="w-5 h-5 text-moss-500 flex-shrink-0" /> : m.status === "in_progress" ? <div className="w-5 h-5 rounded-full border-2 border-moss-500 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-moss-500" /></div> : <Circle className="w-5 h-5 text-cream-500 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className={`text-body-sm font-medium ${m.status === "completed" ? "text-text-muted line-through" : "text-text-primary"}`}>{m.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {m.dueDate && <span className="text-caption text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>}
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-moss-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
