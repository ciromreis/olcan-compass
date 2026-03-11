"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Eye, RotateCcw, BookmarkPlus } from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { Button, ConfirmationModal, Input, Modal, useToast } from "@/components/ui";

export default function VersionsPage() {
  const params = useParams();
  const docId = params.id as string;
  const { getDocById, updateContent, saveVersion } = useForgeStore();
  const { toast } = useToast();
  const [saveVersionOpen, setSaveVersionOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null);
  const doc = getDocById(docId);

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
        <Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar</Link>
      </div>
    );
  }

  const versions = [...doc.versions].reverse();
  const restoreTarget = restoreTargetId
    ? doc.versions.find((version) => version.id === restoreTargetId) ?? null
    : null;

  const handleRestore = () => {
    if (!restoreTarget) return;
    saveVersion(docId, "Backup antes de restaurar");
    updateContent(docId, restoreTarget.content);
    setRestoreTargetId(null);
    toast({
      title: "Versão restaurada",
      description: "O conteúdo atual foi substituído pela versão selecionada e um backup foi salvo antes da restauração.",
      variant: "success",
    });
  };

  const handleSaveVersion = () => {
    if (!doc.content.trim()) {
      toast({
        title: "Sem conteúdo para versionar",
        description: "Escreva algo no documento antes de salvar uma versão.",
        variant: "warning",
      });
      return;
    }

    saveVersion(docId, versionLabel.trim() || undefined);
    setSaveVersionOpen(false);
    setVersionLabel("");
    toast({
      title: "Versão salva",
      description: "Seu checkpoint foi adicionado ao histórico.",
      variant: "success",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/forge/${docId}`} className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><ArrowLeft className="w-5 h-5 text-text-muted" /></Link>
          <div>
            <h1 className="font-heading text-h2 text-text-primary">Histórico de Versões</h1>
            <p className="text-body-sm text-text-secondary">{doc.title} · {doc.versions.length} versões</p>
          </div>
        </div>
        <button
          onClick={() => setSaveVersionOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors"
        >
          <BookmarkPlus className="w-4 h-4" /> Salvar Versão
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="text-body text-text-muted">Nenhuma versão salva ainda.</p>
          <p className="text-body-sm text-text-secondary mt-1">Clique em &ldquo;Salvar Versão&rdquo; no editor para criar um ponto de restauração.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-cream-400" />
          <div className="space-y-6">
            {versions.map((v, i) => {
              const isCurrent = i === 0;
              return (
                <div key={v.id} className="relative pl-14">
                  <div className={`absolute left-4 top-2 w-4 h-4 rounded-full z-10 ${isCurrent ? "bg-moss-500" : "bg-cream-400"}`} />
                  <div className={`card-surface p-5 ${isCurrent ? "ring-2 ring-moss-500" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-h4 text-text-primary">
                            {v.label || `Versão ${doc.versions.length - i}`}
                          </h3>
                          {isCurrent && <span className="text-caption px-2 py-0.5 rounded-full bg-moss-50 text-moss-500 font-medium">Mais recente</span>}
                        </div>
                        <p className="text-caption text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />{new Date(v.savedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <details className="relative">
                          <summary className="p-2 rounded-lg hover:bg-cream-200 transition-colors cursor-pointer" title="Visualizar"><Eye className="w-4 h-4 text-text-muted" /></summary>
                          <div className="absolute right-0 top-10 w-96 max-h-64 overflow-auto card-surface p-4 z-20 shadow-lg">
                            <p className="text-body-sm text-text-secondary whitespace-pre-wrap">{v.content.slice(0, 500)}{v.content.length > 500 ? "..." : ""}</p>
                          </div>
                        </details>
                        {!isCurrent && (
                          <button onClick={() => setRestoreTargetId(v.id)} className="p-2 rounded-lg hover:bg-cream-200 transition-colors" title="Restaurar">
                            <RotateCcw className="w-4 h-4 text-text-muted" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-caption text-text-muted">{v.wordCount} palavras</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={saveVersionOpen}
        onClose={() => {
          setSaveVersionOpen(false);
          setVersionLabel("");
        }}
        title="Salvar nova versão"
        description="Use um nome curto para identificar este checkpoint no histórico."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome da versão"
            value={versionLabel}
            onChange={(event) => setVersionLabel(event.target.value)}
            placeholder="Ex: versão após feedback do professor"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSaveVersionOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVersion}>
              <BookmarkPlus className="w-4 h-4" /> Salvar versão
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        open={!!restoreTarget}
        onClose={() => setRestoreTargetId(null)}
        onConfirm={handleRestore}
        title="Restaurar esta versão?"
        description={restoreTarget ? `A versão atual será substituída por "${restoreTarget.label || restoreTarget.id}". Um backup do conteúdo atual será salvo antes da troca.` : undefined}
        confirmLabel="Restaurar versão"
        cancelLabel="Cancelar"
        variant="warning"
      />
    </div>
  );
}
