"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Mic, Clock, Star, Search, Filter, ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { useInterviewStore } from "@/stores/interviews";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton } from "@/components/ui";

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "academic", label: "Acadêmica" },
  { value: "visa", label: "Visto" },
  { value: "job", label: "Trabalho" },
  { value: "scholarship", label: "Bolsa" },
  { value: "panel", label: "Painel" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "completed", label: "Concluídas" },
  { value: "in_progress", label: "Em andamento" },
];

export default function InterviewsListPage() {
  const ready = useHydration();
  const { sessions, getStats } = useInterviewStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const stats = getStats();
  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesQuery =
        query.length === 0 ||
        session.typeLabel.toLowerCase().includes(query) ||
        session.target.toLowerCase().includes(query) ||
        session.language.toLowerCase().includes(query) ||
        session.difficulty.toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || session.type === typeFilter;
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [search, sessions, statusFilter, typeFilter]);
  const inProgressSessions = filteredSessions.filter((s) => s.status === "in_progress");
  const completedSessions = filteredSessions.filter((s) => s.status === "completed");

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        {[1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">Simulador de Entrevistas</h1>
          <p className="text-body text-text-secondary mt-1">Pratique e receba feedback em tempo real</p>
        </div>
        <Link href="/interviews/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          <Plus className="w-4 h-4" /> Nova Sessão
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card-surface p-5 text-center">
          <Mic className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{stats.totalSessions}</p>
          <p className="text-caption text-text-muted">Sessões</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Star className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className={`font-heading text-h2 ${stats.avgScore >= 70 ? "text-brand-500" : "text-amber-500"}`}>{stats.avgScore || "—"}</p>
          <p className="text-caption text-text-muted">Score médio</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingUp className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="font-heading text-h2 text-sage-500">{stats.bestScore || "—"}</p>
          <p className="text-caption text-text-muted">Melhor score</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Clock className="w-5 h-5 text-text-muted mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{stats.totalTime}</p>
          <p className="text-caption text-text-muted">Tempo praticado</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar sessões..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium bg-white">
          <Filter className="w-4 h-4" /> Filtrar
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="bg-transparent focus:outline-none">
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent focus:outline-none">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {inProgressSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-h4 text-text-primary">Em andamento</h2>
            <span className="text-caption text-text-muted">{inProgressSessions.length} sessão(ões)</span>
          </div>
          <div className="grid gap-4">
            {inProgressSessions.map((session) => (
              <Link key={session.id} href={`/interviews/${session.id}/session`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform border border-amber-200 bg-amber-50/40">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-h4 text-text-primary truncate">{session.typeLabel}</h3>
                      <span className="text-caption px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Em andamento</span>
                    </div>
                    <p className="text-body-sm text-text-secondary">{session.target}</p>
                    <div className="flex gap-3 mt-1 text-caption text-text-muted">
                      <span>{session.answers.length} respostas registradas</span>
                      <span>{new Date(session.startedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {completedSessions.map((session) => {
          const duration = session.startedAt && session.completedAt
            ? `${Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)} min`
            : "—";
          return (
            <Link key={session.id} href={`/interviews/${session.id}`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-h4 text-text-primary truncate">{session.typeLabel}</h3>
                  <p className="text-body-sm text-text-secondary">{session.target}</p>
                  <div className="flex gap-3 mt-1 text-caption text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                    <span>{session.answers.length} perguntas</span>
                    <span>{new Date(session.startedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className={`font-heading font-bold text-h3 ${(session.overallScore || 0) >= 70 ? "text-brand-500" : "text-clay-500"}`}>
                      {session.overallScore ?? "—"}
                    </p>
                    <p className="text-caption text-text-muted">Score</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
        {filteredSessions.length === 0 && (
          <div className="card-surface p-6 text-center">
            <p className="font-heading text-h4 text-text-primary">Nenhuma sessão encontrada</p>
            <p className="text-body-sm text-text-secondary mt-1">Ajuste a busca ou os filtros para encontrar uma sessão específica.</p>
          </div>
        )}
      </div>

      <Link href="/interviews/question-bank" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
        <BarChart3 className="w-6 h-6 text-sage-500" />
        <div className="flex-1">
          <h3 className="font-heading text-h4 text-text-primary">Banco de Perguntas</h3>
          <p className="text-body-sm text-text-secondary">Explore categorias de perguntas por tipo de entrevista</p>
        </div>
        <ArrowRight className="w-5 h-5 text-text-muted" />
      </Link>
    </div>
  );
}
