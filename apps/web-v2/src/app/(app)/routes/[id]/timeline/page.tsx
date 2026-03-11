"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Circle, Clock, CalendarDays } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { formatMonthYear } from "@/lib/format";

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { getRouteById } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);

  const timeline = useMemo(() => {
    if (!route) return [];
    const withDate = route.milestones.filter((m) => m.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    const grouped = new Map<string, typeof withDate>();
    for (const m of withDate) {
      const key = formatMonthYear(m.dueDate!);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(m);
    }
    // Also add milestones without dates at the end
    const noDates = route.milestones.filter((m) => !m.dueDate);
    if (noDates.length > 0) {
      grouped.set("Sem prazo definido", noDates);
    }
    return Array.from(grouped.entries()).map(([month, items]) => ({ month, items }));
  }, [route]);

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" />{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (!route) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={CalendarDays} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Timeline" subtitle={`${route.name} — ${route.milestones.length} milestones`} />

      {timeline.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhum milestone com prazo" description="Adicione prazos aos milestones para visualizar a timeline." />
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-cream-400" />
          <div className="space-y-8">
            {timeline.map((period) => (
              <div key={period.month} className="relative pl-14">
                <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-2 border-moss-500 z-10" />
                <h3 className="font-heading text-h4 text-text-primary mb-3">{period.month}</h3>
                <div className="space-y-2">
                  {period.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-cream-50">
                      {item.status === "completed" ? <CheckCircle className="w-4 h-4 text-moss-500 flex-shrink-0" /> : item.status === "in_progress" ? <Clock className="w-4 h-4 text-moss-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-cream-500 flex-shrink-0" />}
                      <span className={`text-body-sm ${item.status === "completed" ? "text-text-muted line-through" : "text-text-primary"}`}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
