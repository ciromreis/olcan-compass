"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
} from "lucide-react";
import { useDossierStore } from "@/stores/dossier";
import { useHydration } from "@/hooks";
import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DocumentTypeSelector } from "@/components/dossier/DocumentTypeSelector";
import { DocumentWizard } from "@/components/dossier/DocumentWizard";
import { cn } from "@/lib/utils";
import type { DocumentType, DocumentStatus } from "@/types/dossier-system";

export default function DossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dossierId = params.id as string;
  const hydrated = useHydration();

  const {
    getDossierById,
    getDocumentsByStatus,
    getTasksByStatus,
    getOverdueTasks,
    updateDossierStatus,
    deleteDossier,
  } = useDossierStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

  const dossier = getDossierById(dossierId);

  useEffect(() => {
    if (!dossier && hydrated) {
      router.push("/dossiers");
    }
  }, [dossier, hydrated, router]);

  if (!hydrated || !dossier) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  const notStartedDocs = getDocumentsByStatus(dossierId, "not_started");
  const draftDocs = getDocumentsByStatus(dossierId, "draft");
  const reviewDocs = getDocumentsByStatus(dossierId, "in_review");
  const finalDocs = getDocumentsByStatus(dossierId, "final");

  const todoTasks = getTasksByStatus(dossierId, "todo");
  const inProgressTasks = getTasksByStatus(dossierId, "in_progress");
  const overdueTasks = getOverdueTasks(dossierId);

  const totalDocs = dossier.documents.length;
  const completedDocs = finalDocs.length;
  const completionPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  const daysUntilDeadline = Math.ceil(
    (new Date(dossier.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleDelete = async () => {
    await deleteDossier(dossierId);
    router.push("/dossiers");
  };

  const handleAddDocument = () => {
    setShowTypeSelector(true);
  };

  const handleTypeSelected = (type: DocumentType) => {
    setSelectedDocType(type);
    setShowTypeSelector(false);
    setShowWizard(true);
  };

  const handleWizardComplete = async (documentData: any) => {
    // Create document in store
    const { addDocument } = useDossierStore.getState();
    
    await addDocument(dossierId, {
      type: selectedDocType!,
      title: documentData.title || `New ${selectedDocType}`,
      content: documentData.content || "",
      status: "draft",
      ...documentData,
    });

    setShowWizard(false);
    setSelectedDocType(null);
    setActiveTab("documents");
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      cv: "Currículo",
      resume: "Resume",
      motivation_letter: "Carta de Motivação",
      cover_letter: "Cover Letter",
      research_proposal: "Proposta de Pesquisa",
      personal_statement: "Personal Statement",
      statement_of_purpose: "Statement of Purpose",
      recommendation_letter: "Carta de Recomendação",
      transcript: "Histórico Escolar",
      portfolio: "Portfólio",
      writing_sample: "Amostra de Escrita",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const getDocumentStatusColor = (status: DocumentStatus): string => {
    const colors: Record<DocumentStatus, string> = {
      not_started: "bg-slate-100 text-slate-700 border-slate-200",
      draft: "bg-amber-100 text-amber-700 border-amber-200",
      in_review: "bg-brand-100 text-brand-700 border-brand-200",
      final: "bg-emerald-100 text-emerald-700 border-emerald-200",
      submitted: "bg-sage-100 text-sage-700 border-sage-200",
    };
    return colors[status] || colors.not_started;
  };

  const getDocumentStatusLabel = (status: DocumentStatus): string => {
    const labels: Record<DocumentStatus, string> = {
      not_started: "Não Iniciado",
      draft: "Rascunho",
      in_review: "Em Revisão",
      final: "Finalizado",
      submitted: "Enviado",
    };
    return labels[status] || status;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dossiers"
            className="mt-1 rounded-lg p-2 hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">{dossier.title}</h1>
            {dossier.opportunity.program && (
              <p className="mt-1 text-body text-text-secondary">
                {dossier.opportunity.program}
                {dossier.opportunity.institution && ` • ${dossier.opportunity.institution}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dossiers/${dossierId}/export`}
            className="inline-flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-cream-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Link>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showDeleteConfirm && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDeleteConfirm(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-cream-200 bg-white shadow-xl">
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-clay-600 hover:bg-clay-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Dossier
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-cream-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Progresso</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{completionPercentage}%</p>
            </div>
            <div className="rounded-lg bg-brand-100 p-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-cream-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Documentos</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {completedDocs}/{totalDocs}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-2">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-text-muted">{completedDocs} finalizados</p>
        </div>

        <div className="rounded-2xl border border-cream-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Tarefas</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {todoTasks.length + inProgressTasks.length}
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-2">
              <CheckCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {overdueTasks.length > 0 && `${overdueTasks.length} atrasadas`}
          </p>
        </div>

        <div
          className={cn(
            "rounded-2xl border p-4",
            daysUntilDeadline <= 7
              ? "border-clay-200 bg-clay-50"
              : "border-cream-200 bg-white"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Prazo</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold",
                  daysUntilDeadline <= 7 ? "text-clay-700" : "text-text-primary"
                )}
              >
                {daysUntilDeadline}d
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg p-2",
                daysUntilDeadline <= 7 ? "bg-clay-200" : "bg-slate-100"
              )}
            >
              <Calendar
                className={cn("h-5 w-5", daysUntilDeadline <= 7 ? "text-clay-700" : "text-slate-600")}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {new Date(dossier.deadline).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="readiness">Prontidão</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Documents Overview */}
              <div className="rounded-2xl border border-cream-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-text-primary">
                    Documentos
                  </h2>
                  <Button size="sm" onClick={handleAddDocument}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {dossier.documents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-cream-300 bg-cream-50 p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-cream-400" />
                    <p className="mt-3 font-medium text-text-primary">Nenhum documento ainda</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Comece adicionando documentos ao seu dossier
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dossier.documents.slice(0, 5).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-cream-200 bg-cream-50 p-3 hover:bg-cream-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-brand-500" />
                          <div>
                            <p className="font-medium text-text-primary">{doc.title}</p>
                            <p className="text-xs text-text-muted">
                              {getDocumentTypeLabel(doc.type)} • {doc.wordCount} palavras
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-medium",
                            getDocumentStatusColor(doc.status)
                          )}
                        >
                          {getDocumentStatusLabel(doc.status)}
                        </span>
                      </div>
                    ))}
                    {dossier.documents.length > 5 && (
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="w-full rounded-lg border border-cream-300 bg-white p-2 text-sm text-brand-600 hover:bg-brand-50"
                      >
                        Ver todos ({dossier.documents.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tasks Overview */}
              <div className="rounded-2xl border border-cream-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-text-primary">
                    Tarefas Pendentes
                  </h2>
                  <Button size="sm" onClick={() => setActiveTab("tasks")}>
                    Ver Todas
                  </Button>
                </div>

                {todoTasks.length === 0 && inProgressTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-cream-300 bg-cream-50 p-8 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-cream-400" />
                    <p className="mt-3 font-medium text-text-primary">Nenhuma tarefa pendente</p>
                    <p className="mt-1 text-sm text-text-muted">Você está em dia!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...inProgressTasks, ...todoTasks].slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 rounded-lg border border-cream-200 bg-cream-50 p-3"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-cream-300"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{task.title}</p>
                          {task.dueDate && (
                            <p className="mt-1 text-xs text-text-muted">
                              <Clock className="mr-1 inline h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Readiness Score */}
              <div className="rounded-2xl border border-cream-200 bg-white p-6">
                <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-text-muted">
                  Prontidão
                </h3>
                <div className="text-center">
                  <div className="mx-auto h-32 w-32 rounded-full border-8 border-brand-200 bg-brand-50 flex items-center justify-center">
                    <span className="text-3xl font-bold text-brand-600">
                      {dossier.readiness?.overall || 0}%
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-text-secondary">
                    {dossier.readiness?.overall >= 80
                      ? "Excelente! Você está pronto."
                      : dossier.readiness?.overall >= 60
                      ? "Bom progresso. Continue!"
                      : "Ainda há trabalho a fazer."}
                  </p>
                </div>
              </div>

              {/* Opportunity Info */}
              <div className="rounded-2xl border border-cream-200 bg-white p-6">
                <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-text-muted">
                  Oportunidade
                </h3>
                <div className="space-y-3 text-sm">
                  {dossier.opportunity.program && (
                    <div>
                      <p className="text-xs text-text-muted">Programa</p>
                      <p className="font-medium text-text-primary">
                        {dossier.opportunity.program}
                      </p>
                    </div>
                  )}
                  {dossier.opportunity.institution && (
                    <div>
                      <p className="text-xs text-text-muted">Instituição</p>
                      <p className="font-medium text-text-primary">
                        {dossier.opportunity.institution}
                      </p>
                    </div>
                  )}
                  {dossier.opportunity.location && (
                    <div>
                      <p className="text-xs text-text-muted">Localização</p>
                      <p className="font-medium text-text-primary">
                        {dossier.opportunity.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{dossier.documents.length} documentos</p>
            <Button onClick={handleAddDocument}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </div>

          {dossier.documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-cream-400" />
              <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
                Nenhum documento ainda
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Comece criando seu primeiro documento para este dossier
              </p>
              <Button className="mt-6" onClick={handleAddDocument}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Documento
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dossier.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group rounded-2xl border border-cream-200 bg-white p-5 hover:border-brand-300 hover:shadow-lg transition-all"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-text-primary group-hover:text-brand-600">
                        {doc.title}
                      </h3>
                      <p className="mt-1 text-xs text-text-muted">
                        {getDocumentTypeLabel(doc.type)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        getDocumentStatusColor(doc.status)
                      )}
                    >
                      {getDocumentStatusLabel(doc.status)}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-4 text-xs text-text-muted">
                    <span>{doc.wordCount} palavras</span>
                    {doc.metrics.atsScore && <span>ATS: {doc.metrics.atsScore}%</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <p className="text-sm text-text-muted">Gerenciamento de tarefas em desenvolvimento...</p>
        </TabsContent>

        {/* Readiness Tab */}
        <TabsContent value="readiness">
          <p className="text-sm text-text-muted">Relatório de prontidão em desenvolvimento...</p>
        </TabsContent>
      </Tabs>

      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={handleTypeSelected}
      />

      {/* Document Wizard Modal */}
      {selectedDocType && (
        <DocumentWizard
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            setSelectedDocType(null);
          }}
          dossierId={dossierId}
          documentType={selectedDocType}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
}
