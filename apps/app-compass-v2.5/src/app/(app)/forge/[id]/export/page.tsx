"use client";

import { useParams } from "next/navigation";
import { Download, FileText, Copy, Mail } from "lucide-react";
import { useForgeStore, DOC_TYPE_LABELS } from "@/stores/forge";
import { downloadDocx } from "@/lib/docx-export";
import { RecruitmentFormHelper } from "@/components/forge/RecruitmentFormHelper";
import { useToast } from "@/components/ui";

export default function ForgeExportPage() {
  const params = useParams();
  const docId = params.id as string;
  const { toast } = useToast();
  
  const { getDocById } = useForgeStore();
  const doc = getDocById(docId);

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">Documento não encontrado.</p>
      </div>
    );
  }

  const handleExportDocx = async () => {
    try {
      await downloadDocx(doc.title, doc.content);
      toast({
        title: "Exportado com sucesso",
        description: "Documento .docx baixado.",
        variant: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o documento.",
        variant: "warning",
      });
    }
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([doc.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportado com sucesso",
      description: "Documento Markdown baixado.",
      variant: "success",
    });
  };

  const handleExportPlainText = () => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportado com sucesso",
      description: "Documento de texto baixado.",
      variant: "success",
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(doc.content);
      toast({
        title: "Copiado",
        description: "Conteúdo copiado para a área de transferência.",
        variant: "success",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "warning",
      });
    }
  };

  const handleEmailDraft = () => {
    const subject = encodeURIComponent(doc.title);
    const body = encodeURIComponent(doc.content);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const wordCount = doc.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = doc.content.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Download className="h-6 w-6 text-brand-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-h4 text-text-primary">Exportar Ativo do Dossier</h2>
            <p className="mt-1 text-sm text-text-muted">
              Baixe este ativo em formatos editaveis, reaproveite trechos em formularios e leve sua
              versao livre para Word, Google Docs ou fluxos manuais de submissao.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
              <span>Tipo: {DOC_TYPE_LABELS[doc.type]}</span>
              <span>·</span>
              <span>{wordCount} palavras</span>
              <span>·</span>
              <span>{charCount} caracteres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* DOCX Export */}
        <button
          onClick={handleExportDocx}
          className="group flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-6 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Microsoft Word (.docx)</h3>
            <p className="mt-1 text-sm text-text-muted">
              Formato editavel compativel com Word, Google Docs e outros editores
            </p>
          </div>
        </button>

        {/* Markdown Export */}
        <button
          onClick={handleExportMarkdown}
          className="group flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-6 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 transition-colors group-hover:bg-violet-200">
            <FileText className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Markdown (.md)</h3>
            <p className="mt-1 text-sm text-text-muted">
              Formato portavel para versionamento, GitHub e reaproveitamento estrutural
            </p>
          </div>
        </button>

        {/* Plain Text Export */}
        <button
          onClick={handleExportPlainText}
          className="group flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-6 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Texto Simples (.txt)</h3>
            <p className="mt-1 text-sm text-text-muted">
              Formato universal para formularios, campos de plataforma e colagem rapida
            </p>
          </div>
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className="group flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-6 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 transition-colors group-hover:bg-brand-200">
            <Copy className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Copiar para Área de Transferência</h3>
            <p className="mt-1 text-sm text-text-muted">
              Copie o conteúdo completo para colar em outro lugar
            </p>
          </div>
        </button>

        {/* Email Draft */}
        <button
          onClick={handleEmailDraft}
          className="group flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-6 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md sm:col-span-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
            <Mail className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Rascunho de E-mail</h3>
            <p className="mt-1 text-sm text-text-muted">
              Abra seu cliente com o conteudo pre-preenchido para envio ou revisao externa
            </p>
          </div>
        </button>
      </div>

      {/* Recruitment Form Helper */}
      {doc.type === "cv" && (
        <div className="rounded-2xl border border-white/60 bg-white/50 p-6 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="font-heading text-h4 text-text-primary">Assistente de Formulários</h2>
            <p className="mt-1 text-sm text-text-muted">
              Copie rapidamente informações estruturadas para preencher formulários de candidatura
            </p>
          </div>
          <RecruitmentFormHelper doc={doc} content={doc.content} />
        </div>
      )}
    </div>
  );
}
