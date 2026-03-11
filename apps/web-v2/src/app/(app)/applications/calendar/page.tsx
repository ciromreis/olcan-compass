"use client";

import Link from "next/link";
import { Calendar, AlertTriangle, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { useApplicationStore } from "@/stores/applications";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMonthYear, daysUntil, formatDate } from "@/lib/format";

export default function DeadlineCalendarPage() {
  const { applications } = useApplicationStore();

  // Build month groups from real data, excluding already-resolved apps
  const active = applications.filter((a) => a.status !== "accepted" && a.status !== "rejected");

  const grouped = active.reduce<Record<string, { id: string; program: string; deadline: string; daysLeft: number; urgent: boolean; status: string }[]>>((acc, app) => {
    const cappedKey = formatMonthYear(app.deadline);
    const dl = daysUntil(app.deadline);
    if (!acc[cappedKey]) acc[cappedKey] = [];
    acc[cappedKey].push({ id: app.id, program: app.program, deadline: app.deadline, daysLeft: dl, urgent: dl <= 14, status: app.status });
    return acc;
  }, {});

  const months = Object.entries(grouped)
    .sort(([, a], [, b]) => new Date(a[0].deadline).getTime() - new Date(b[0].deadline).getTime());

  const urgentCount = active.filter((app) => {
    const dl = daysUntil(app.deadline);
    return dl > 0 && dl <= 14 && app.status !== "submitted";
  }).length;
  const submittedCount = active.filter((app) => app.status === "submitted").length;
  const nextDeadline = active
    .filter((app) => daysUntil(app.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Calendário de Deadlines" subtitle={`${active.length} candidaturas ativas`} backHref="/applications" />

      {months.length === 0 ? (
        <EmptyState icon={Calendar} title="Nenhuma candidatura ativa" action={<Link href="/applications/new" className="text-moss-500 font-medium hover:underline">Criar candidatura →</Link>} />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-surface p-5 text-center">
              <p className="font-heading text-h3 text-text-primary">{months.length}</p>
              <p className="text-caption text-text-muted">Meses com deadlines</p>
            </div>
            <div className="card-surface p-5 text-center">
              <p className={`font-heading text-h3 ${urgentCount > 0 ? "text-clay-500" : "text-text-primary"}`}>{urgentCount}</p>
              <p className="text-caption text-text-muted">Urgentes em 14 dias</p>
            </div>
            <div className="card-surface p-5">
              <p className="text-caption text-text-muted mb-1">Próximo prazo</p>
              <p className="text-body-sm font-semibold text-text-primary line-clamp-2">{nextDeadline?.program ?? "Nenhum prazo futuro"}</p>
              <p className="text-caption text-text-muted mt-1">{nextDeadline ? formatDate(nextDeadline.deadline) : `${submittedCount} submetida(s)`}</p>
            </div>
          </div>

          <div className="space-y-8">
            {months.map(([month, items]) => (
              <div key={month}>
                <h2 className="font-heading text-h4 text-text-primary mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-moss-500" /> {month}
                </h2>
                <div className="space-y-2">
                  {items.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).map((item) => (
                    <Link key={item.id} href={`/applications/${item.id}`} className={`card-surface p-4 flex items-center gap-4 hover:bg-cream-100 transition-colors ${item.urgent ? "border-l-4 border-clay-500" : ""}`}>
                      <div className="text-center w-16 flex-shrink-0">
                        <p className="font-heading font-bold text-h3 text-text-primary">{new Date(item.deadline).getDate()}</p>
                        <p className="text-caption text-text-muted">{formatDate(item.deadline, "short")}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-body-sm font-medium text-text-primary">{item.program}</p>
                        <p className={`text-caption flex items-center gap-1 ${item.urgent ? "text-clay-500 font-medium" : "text-text-muted"}`}>
                          {item.status === "submitted" ? (
                            <><CheckCircle className="w-3 h-3 text-moss-500" /> Submetida</>
                          ) : item.daysLeft <= 0 ? (
                            <><AlertTriangle className="w-3 h-3 text-clay-500" /> Vencido</>
                          ) : (
                            <><Clock className="w-3 h-3" /> {item.daysLeft} dias restantes</>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
