"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, FileCode2, FileType, Copy, Mail, CheckCircle } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, EmptyState, useToast } from "@/components/ui";
import { downloadFile } from "@/lib/file-export";

const FORMATS = [
  { icon: FileText, label: "PDF", description: "Versão pronta para imprimir ou salvar em PDF", ext: ".pdf" },
  { icon: FileType, label: "Markdown", description: "Texto puro com formatação", ext: ".md" },
  { icon: FileCode2, label: "Texto", description: "Arquivo simples para reaproveitamento rápido", ext: ".txt" },
  { icon: FileText, label: "LaTeX", description: "Estrutura base para templates acadêmicos", ext: ".tex" },
];

function slugify(value: string) {
  return value.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export default function ExportPage() {
  const { docId, doc, stats } = useDocument();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!doc || !stats) {
    return <EmptyState icon={FileText} title="Documento não encontrado" action={<Link href="/forge" className="text-brand-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = doc.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fileBaseName = slugify(doc.title);

  const buildLatex = () => [
    "\\documentclass[11pt]{article}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[brazil]{babel}",
    "\\usepackage[a4paper,margin=2.5cm]{geometry}",
    "\\begin{document}",
    `\\section*{${doc.title.replace(/([#$%&_{}])/g, "\\$1")}}`,
    doc.content
      .split("\n\n")
      .map((paragraph) => paragraph.replace(/\n/g, " ").replace(/([#$%&_{}])/g, "\\$1"))
      .join("\n\n"),
    "\\end{document}",
  ].join("\n");

  const openPrintPreview = () => {
    const preview = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
    if (!preview) {
      toast({
        title: "Janela bloqueada",
        description: "Permita pop-ups para abrir a visualização de impressão.",
        variant: "warning",
      });
      return;
    }

    preview.document.write(`
      <html lang="pt-BR">
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: Georgia, serif; margin: 48px; color: #1a1a1a; line-height: 1.6; }
            h1 { font-family: "Plus Jakarta Sans", sans-serif; margin-bottom: 8px; }
            .meta { color: #686352; margin-bottom: 24px; font-size: 14px; }
            p { margin: 0 0 16px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <div class="meta">${stats.typeLabel} · ${stats.wordCount} palavras · ${doc.targetProgram || "Sem programa-alvo definido"}</div>
          ${doc.content.split("\n\n").map((paragraph) => `<p>${paragraph.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("")}
        </body>
      </html>
    `);
    preview.document.close();
    preview.focus();
    preview.print();
  };

  const handleExport = (ext: string) => {
    if (ext === ".pdf") {
      openPrintPreview();
      return;
    }
    if (ext === ".md") {
      downloadFile(doc.content, `${fileBaseName}.md`, "text/markdown;charset=utf-8");
      return;
    }
    if (ext === ".txt") {
      downloadFile(doc.content, `${fileBaseName}.txt`, "text/plain;charset=utf-8");
      return;
    }
    if (ext === ".tex") {
      downloadFile(buildLatex(), `${fileBaseName}.tex`, "text/x-tex;charset=utf-8");
    }
  };

  const handleMailDraft = () => {
    const subject = encodeURIComponent(`Documento Olcan Compass — ${doc.title}`);
    const body = encodeURIComponent([
      `Olá,`,
      ``,
      `Segue abaixo uma versão do documento "${doc.title}".`,
      `Tipo: ${stats.typeLabel}`,
      `Programa-alvo: ${doc.targetProgram || "Não definido"}`,
      ``,
      doc.content,
    ].join("\n"));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Exportar" subtitle={`${doc.title} · ${stats.typeLabel} · ${stats.wordCount} palavras · ${stats.versionCount} versões`} backHref={`/forge/${docId}`} />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Formato de Exportação</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.label}
              onClick={() => handleExport(fmt.ext)}
              className="card-surface p-4 flex items-center gap-3 text-left transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <fmt.icon className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-text-primary">{fmt.label}</p>
                <p className="text-caption text-text-muted">{fmt.description}</p>
              </div>
              <Download className="w-4 h-4 text-text-muted" />
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Outras Opções</h3>
        <div className="space-y-3">
          <button onClick={handleCopy} className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-cream-100 transition-colors text-left">
            {copied ? <CheckCircle className="w-5 h-5 text-brand-500" /> : <Copy className="w-5 h-5 text-text-muted" />}
            <div>
              <p className="text-body-sm font-medium text-text-primary">{copied ? "Copiado!" : "Copiar para Área de Transferência"}</p>
              <p className="text-caption text-text-muted">Texto puro sem formatação</p>
            </div>
          </button>
          <button onClick={handleMailDraft} className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-cream-100 transition-colors text-left">
            <Mail className="w-5 h-5 text-text-muted" />
            <div><p className="text-body-sm font-medium text-text-primary">Abrir rascunho de e-mail</p><p className="text-caption text-text-muted">Prepara um e-mail com assunto e corpo baseados no documento atual</p></div>
          </button>
        </div>
      </div>
    </div>
  );
}
