"use client";

import { useMemo } from "react";
import { FileText, MessageSquare, Edit, Plus } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useForgeStore } from "@/stores/forge";
import { getQuestionBank, type InterviewType, useInterviewStore } from "@/stores/interviews";

export default function AdminContentPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();

  const templates = useMemo(() => {
    return documents.slice(0, 6).map((document, index) => ({
      id: document.id,
      name: document.title,
      type: document.type,
      uses: Math.max(1, (document.versions?.length || 1) * 12 + index * 3),
      updated: document.updatedAt,
    }));
  }, [documents]);

  const questionBanks = useMemo(() => {
    const labels: Record<InterviewType, string> = {
      academic: "Admissão Acadêmica",
      visa: "Entrevista de Visto",
      job: "Entrevista de Emprego",
      scholarship: "Bolsa de Estudos",
      panel: "Painel",
    };
    const bank = getQuestionBank() as Record<InterviewType, string[]>;

    return (Object.keys(bank) as InterviewType[]).map((type) => {
      const latestByType = sessions
        .filter((session) => session.type === type)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
      return {
        id: type,
        name: labels[type],
        questions: bank[type].length,
        lastEdit: latestByType?.startedAt || new Date().toISOString(),
      };
    });
  }, [sessions]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Conteúdo" />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2"><FileText className="w-5 h-5 text-moss-500" /> Templates do Forge</h3>
          <button
            onClick={() => toast({ title: "Fluxo integrado", description: "Crie novos templates diretamente no Forge.", variant: "info" })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-cream-50">
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-text-primary">{t.name}</p>
                <p className="text-caption text-text-muted">{t.type} · {t.uses} usos · Atualizado {formatDate(t.updated)}</p>
              </div>
              <button className="p-1.5 rounded hover:bg-cream-200"><Edit className="w-4 h-4 text-text-muted" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2"><MessageSquare className="w-5 h-5 text-clay-500" /> Banco de Perguntas</h3>
          <button
            onClick={() => toast({ title: "Fluxo integrado", description: "As categorias seguem o Interview Engine; ajuste via configuração de domínio.", variant: "info" })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> Nova Categoria
          </button>
        </div>
        <div className="space-y-2">
          {questionBanks.map((q) => (
            <div key={q.id} className="flex items-center gap-4 p-3 rounded-lg bg-cream-50">
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-text-primary">{q.name}</p>
                <p className="text-caption text-text-muted">{q.questions} perguntas · Editado {formatDate(q.lastEdit)}</p>
              </div>
              <button className="p-1.5 rounded hover:bg-cream-200"><Edit className="w-4 h-4 text-text-muted" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
