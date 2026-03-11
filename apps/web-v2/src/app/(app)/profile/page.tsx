"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { User, Mail, MapPin, DollarSign, Globe, Brain, Edit, Shield, Save, X, FileText, Mic, Calendar, TrendingUp, Target, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { usePsychStore } from "@/stores/psych";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useApplicationStore } from "@/stores/applications";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { useProfileStore } from "@/stores/profile";
import { useHydration } from "@/hooks";
import { Input, PageHeader, Progress, ProgressRing, Skeleton } from "@/components/ui";

export default function ProfilePage() {
  const hydrated = useHydration();
  const { user, updateLocalUser } = useAuthStore();
  const { origin: savedOrigin, destination: savedDestination, plan, updatePrefs } = useProfileStore();
  const PLAN_LABELS: Record<string, string> = { free: "Explorador", pro: "Navegador", premium: "Comandante" };
  const { completedDimensions, getOverallScore, isComplete } = usePsychStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { applications } = useApplicationStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { sprints } = useSprintStore();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editDestination, setEditDestination] = useState("");

  const psychStatus = useMemo(() => {
    if (!hydrated) return { label: "...", score: 0 };
    if (isComplete()) return { label: `Completo — ${getOverallScore()}%`, score: getOverallScore() };
    if (completedDimensions.length > 0) return { label: `${completedDimensions.length}/8 dimensões`, score: Math.round((completedDimensions.length / 8) * 100) };
    return { label: "Não iniciado", score: 0 };
  }, [hydrated, completedDimensions, isComplete, getOverallScore]);

  const stats = useMemo(() => {
    if (!hydrated) return { docs: 0, interviews: 0, apps: 0, sprints: 0 };
    return {
      docs: documents.length,
      interviews: sessions.length,
      apps: applications.length,
      sprints: sprints.length,
    };
  }, [hydrated, documents, sessions, applications, sprints]);

  const [completionOpen, setCompletionOpen] = useState(false);
  const toggleCompletion = useCallback(() => setCompletionOpen((v) => !v), []);

  const completionSteps = useMemo(() => {
    if (!hydrated) return [];
    return [
      { key: "name", label: "Nome completo definido", done: !!(user?.full_name && user.full_name !== "Usuário do Compass"), href: undefined },
      { key: "origin", label: "Cidade de origem configurada", done: !!savedOrigin, href: undefined },
      { key: "destination", label: "Destino pretendido configurado", done: !!savedDestination, href: undefined },
      { key: "psych", label: "Diagnóstico psicológico completo", done: isComplete(), href: "/profile/psych" },
      { key: "route", label: "Primeira rota criada", done: routes.length > 0, href: "/routes/new" },
      { key: "sprint", label: "Primeiro sprint iniciado", done: sprints.length > 0, href: "/sprints/new" },
      { key: "forge", label: "Primeiro documento no Forge", done: documents.length > 0, href: "/forge/new" },
      { key: "interview", label: "Primeira entrevista simulada", done: sessions.length > 0, href: "/interviews/new" },
    ];
  }, [hydrated, user, savedOrigin, savedDestination, isComplete, routes, sprints, documents, sessions]);

  const completionScore = useMemo(() => {
    if (completionSteps.length === 0) return 0;
    return Math.round((completionSteps.filter((s) => s.done).length / completionSteps.length) * 100);
  }, [completionSteps]);

  const readinessStatus = useMemo(() => {
    if (!hydrated) return { label: "...", score: 0 };
    const activeTasks = sprints.flatMap((s) => s.tasks);
    const totalTasks = activeTasks.length;
    const doneTasks = activeTasks.filter((task) => task.done).length;
    const sprintScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const routeScore = routes.length > 0 ? Math.round(routes.reduce((sum, route) => sum + getRouteProgress(route.id), 0) / routes.length) : 0;
    const score = Math.round(sprintScore * 0.75 + routeScore * 0.25);
    return {
      label: sprints.length > 0 ? `${sprints.length} sprint${sprints.length !== 1 ? "s" : ""} ativo${sprints.length !== 1 ? "s" : ""}` : "Não configurado",
      score,
    };
  }, [hydrated, sprints, routes, getRouteProgress]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40" />
        <div className="grid md:grid-cols-2 gap-6"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      </div>
    );
  }

  const displayName = user?.full_name || "Usuário do Compass";
  const displayEmail = user?.email || "usuario@email.com";

  const handleStartEdit = () => {
    setEditName(displayName);
    setEditOrigin(savedOrigin || "São Paulo, BR");
    setEditDestination(savedDestination);
    setEditing(true);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== displayName) {
      updateLocalUser({ full_name: editName.trim() });
    }
    updatePrefs({ origin: editOrigin, destination: editDestination });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Meu Perfil"
        actions={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          ) : (
            <button onClick={handleStartEdit} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
              <Edit className="w-4 h-4" /> Editar
            </button>
          )
        }
      />

      <div className="card-surface p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-brand-400" />
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <Input label="Nome completo" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Origem" value={editOrigin} onChange={(e) => setEditOrigin(e.target.value)} />
                  <Input label="Destino pretendido" value={editDestination} onChange={(e) => setEditDestination(e.target.value)} placeholder="Ex: Berlim, DE" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-h3 text-text-primary">{displayName}</h2>
                <p className="text-body-sm text-text-muted flex items-center gap-1 mt-1"><Mail className="w-3.5 h-3.5" /> {displayEmail}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <span className="text-body-sm text-text-secondary flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-text-muted" /> {savedOrigin || "São Paulo, BR"}</span>
                  <span className="text-body-sm text-text-secondary flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-text-muted" /> Destino: {savedDestination || "Não definido"}</span>
                  <span className="text-body-sm text-text-secondary flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-text-muted" /> {PLAN_LABELS[plan] ?? "Navegador"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {completionScore < 100 && (
        <div className="card-surface overflow-hidden">
          <button
            onClick={toggleCompletion}
            className="w-full flex items-center justify-between gap-4 p-5 hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-cream-300" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={`${(completionScore / 100) * 125.66} 125.66`}
                    className={completionScore >= 70 ? "text-brand-500" : completionScore >= 40 ? "text-amber-400" : "text-clay-400"}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-text-primary">{completionScore}%</span>
              </div>
              <div className="text-left min-w-0">
                <p className="font-heading font-semibold text-text-primary text-body-sm">Configuração do perfil</p>
                <p className="text-caption text-text-muted">
                  {completionSteps.filter((s) => s.done).length} de {completionSteps.length} etapas concluídas
                </p>
              </div>
            </div>
            {completionOpen ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
          </button>

          {completionOpen && (
            <div className="border-t border-cream-200 px-5 py-4 grid sm:grid-cols-2 gap-2">
              {completionSteps.map((step) => {
                const content = (
                  <span className={`flex items-center gap-2 text-body-sm px-3 py-2 rounded-lg transition-colors ${step.done ? "text-text-secondary" : "text-text-primary font-medium"} ${!step.done && step.href ? "hover:bg-cream-100 cursor-pointer" : ""}`}>
                    {step.done
                      ? <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-cream-500 flex-shrink-0" />}
                    <span className={step.done ? "line-through" : ""}>{step.label}</span>
                  </span>
                );
                return step.href && !step.done
                  ? <Link key={step.key} href={step.href}>{content}</Link>
                  : <div key={step.key}>{content}</div>;
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/forge" className="card-surface p-4 text-center group hover:-translate-y-0.5 transition-transform">
          <FileText className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.docs}</p>
          <p className="text-caption text-text-muted">Documentos</p>
        </Link>
        <Link href="/interviews" className="card-surface p-4 text-center group hover:-translate-y-0.5 transition-transform">
          <Mic className="w-5 h-5 text-clay-500 mx-auto mb-1" />
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.interviews}</p>
          <p className="text-caption text-text-muted">Entrevistas</p>
        </Link>
        <Link href="/applications" className="card-surface p-4 text-center group hover:-translate-y-0.5 transition-transform">
          <Calendar className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.apps}</p>
          <p className="text-caption text-text-muted">Candidaturas</p>
        </Link>
        <Link href="/sprints" className="card-surface p-4 text-center group hover:-translate-y-0.5 transition-transform">
          <Target className="w-5 h-5 text-text-secondary mx-auto mb-1" />
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.sprints}</p>
          <p className="text-caption text-text-muted">Sprints</p>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/profile/psych" className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start gap-4">
            <ProgressRing value={psychStatus.score} size={84} strokeWidth={8} variant="auto" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center"><Brain className="w-5 h-5 text-brand-500" /></div>
                <div>
                  <h3 className="font-heading text-h4 text-text-primary">Perfil Psicológico</h3>
                  <p className="text-caption text-text-muted">{psychStatus.label}</p>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary mb-3">Complete o diagnóstico para calibrar sua jornada e receber recomendações personalizadas.</p>
              <Progress value={psychStatus.score} size="sm" showLabel label={isComplete() ? "Calibração psicológica" : "Avanço do diagnóstico"} variant={psychStatus.score >= 60 ? "moss" : "clay"} />
            </div>
          </div>
        </Link>

        <Link href="/readiness" className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start gap-4">
            <ProgressRing value={readinessStatus.score} size={84} strokeWidth={8} variant="auto" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center"><Shield className="w-5 h-5 text-sage-500" /></div>
                <div>
                  <h3 className="font-heading text-h4 text-text-primary">Prontidão</h3>
                  <p className="text-caption text-text-muted">{readinessStatus.label}</p>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary mb-3">Verifique sua prontidão em finanças, documentação, idioma, psicológico e logística.</p>
              <div className="flex items-center gap-3 mb-3 text-caption text-text-muted">
                <span>{routes.length} rota{routes.length !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{sprints.length} sprint{sprints.length !== 1 ? "s" : ""}</span>
              </div>
              <Progress value={readinessStatus.score} size="sm" showLabel label="Prontidão composta" variant={readinessStatus.score >= 60 ? "moss" : "clay"} />
            </div>
          </div>
        </Link>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Atividade Recente</h3>
          <Link href="/dashboard" className="text-body-sm text-brand-500 font-medium hover:underline flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Ver Dashboard
          </Link>
        </div>
        <div className="space-y-3">
          {documents.slice(0, 2).map((doc) => (
            <Link key={doc.id} href={`/forge/${doc.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-50 transition-colors">
              <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-sm text-text-primary truncate">{doc.title}</p>
                <p className="text-caption text-text-muted">Forge · v{doc.versions.length}</p>
              </div>
            </Link>
          ))}
          {sessions.slice(0, 2).map((s) => (
            <Link key={s.id} href={`/interviews/${s.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-50 transition-colors">
              <Mic className="w-4 h-4 text-clay-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-sm text-text-primary truncate">{s.typeLabel}</p>
                <p className="text-caption text-text-muted">Entrevista · {s.overallScore ?? "—"}%</p>
              </div>
            </Link>
          ))}
          {stats.docs === 0 && stats.interviews === 0 && (
            <p className="text-body-sm text-text-muted text-center py-4">Nenhuma atividade recente. Comece explorando o Forge ou as Entrevistas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
