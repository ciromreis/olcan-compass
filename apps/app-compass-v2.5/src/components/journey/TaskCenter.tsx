"use client";

import { useJourneySnapshot } from "@/hooks/useJourneySnapshot";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TaskCenter() {
  const { snapshot } = useJourneySnapshot();

  const criticalTasks = snapshot.actionItems.filter((item) => item.priority === "critical");
  const highTasks = snapshot.actionItems.filter((item) => item.priority === "high");
  const mediumTasks = snapshot.actionItems.filter((item) => item.priority === "medium");
  const lowTasks = snapshot.actionItems.filter((item) => item.priority === "low");

  if (snapshot.actionItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-12 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 text-lg font-semibold text-slate-950">Tudo em dia!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Você não tem tarefas pendentes no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {criticalTasks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-rose-600">Crítico</h3>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
              {criticalTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {criticalTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="block rounded-2xl border border-rose-200 bg-rose-50 p-4 transition-colors hover:bg-rose-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-rose-900">{task.title}</p>
                    <p className="mt-1 text-sm text-rose-700">{task.description}</p>
                    {task.meta && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-rose-600">
                        <Clock className="h-3 w-3" />
                        {task.meta}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-rose-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {highTasks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-600">Alta Prioridade</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {highTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {highTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-700">{task.description}</p>
                    {task.meta && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        {task.meta}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(mediumTasks.length > 0 || lowTasks.length > 0) && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-600">Outras Ações</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {mediumTasks.length + lowTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {[...mediumTasks, ...lowTasks].map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                    {task.meta && (
                      <p className="mt-2 text-xs text-slate-500">{task.meta}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
