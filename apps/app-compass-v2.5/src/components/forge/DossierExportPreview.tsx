"use client";

import { useState } from "react";
import { Download, Eye, FileText, X, Printer } from "lucide-react";
import { type ForgeDocument } from "@/stores/forge";
import { type UserApplication } from "@/stores/applications";
import { Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

interface DossierExportPreviewProps {
  documents: ForgeDocument[];
  application?: UserApplication;
  onClose: () => void;
}

export function DossierExportPreview({ documents, application, onClose }: DossierExportPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"screen" | "print">("screen");

  const handleExportPDF = () => {
    // Trigger browser print dialog
    window.print();
  };

  const handleExportDocx = () => {
    // TODO: Implement DOCX export
    alert("DOCX export coming soon!");
  };

  const handleExportZip = () => {
    // TODO: Implement ZIP export of all documents
    alert("ZIP export coming soon!");
  };

  return (
    <Modal open onClose={onClose} size="lg">
      <div className="flex min-h-[80vh] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-h3 text-text-primary">
              Pré-visualização do Dossier
            </h2>
            {application && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                {application.program}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 p-1">
              <button
                onClick={() => setPreviewMode("screen")}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  previewMode === "screen"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Eye className="h-4 w-4" />
                Tela
              </button>
              <button
                onClick={() => setPreviewMode("print")}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  previewMode === "print"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Printer className="h-4 w-4" />
                Impressão
              </button>
            </div>

            {/* Export Actions */}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
            <button
              onClick={handleExportDocx}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <FileText className="h-4 w-4" />
              DOCX
            </button>
            <button
              onClick={handleExportZip}
              className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-cream-100"
            >
              <Download className="h-4 w-4" />
              ZIP
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted hover:bg-cream-100 hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-cream-100 p-8">
          <div
            className={cn(
              "mx-auto bg-white shadow-2xl",
              previewMode === "print" ? "w-[210mm]" : "max-w-4xl"
            )}
            style={previewMode === "print" ? { minHeight: "297mm" } : undefined}
          >
            {/* Dossier Cover Page */}
            <div className="border-b-4 border-brand-500 p-12">
              {/* Olcan Logo */}
              <div className="mb-8">
                <svg className="h-12 w-auto" viewBox="0 0 120 40" fill="none">
                  <text
                    x="0"
                    y="30"
                    className="font-heading text-3xl font-bold"
                    fill="#001338"
                  >
                    OLCAN
                  </text>
                </svg>
                <p className="mt-2 text-sm text-text-muted">
                  Professional Mobility Platform
                </p>
              </div>

              {/* Dossier Title */}
              <h1 className="mb-4 font-heading text-4xl font-bold text-text-primary">
                Application Dossier
              </h1>
              
              {application && (
                <div className="space-y-2 text-lg">
                  <p className="font-semibold text-text-primary">
                    {application.program}
                  </p>
                  <p className="text-text-secondary">
                    {application.country}
                  </p>
                  {application.deadline && (
                    <p className="text-text-muted">
                      Deadline: {new Date(application.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 border-t border-cream-200 pt-4">
                <p className="text-sm text-text-muted">
                  Generated on {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-text-muted">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} included
                </p>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="border-b border-cream-200 p-12">
              <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">
                Contents
              </h2>
              <ol className="space-y-3">
                {documents.map((doc, index) => (
                  <li key={doc.id} className="flex items-start gap-3">
                    <span className="font-semibold text-brand-600">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">
                        {doc.title}
                      </p>
                      <p className="text-sm text-text-muted">
                        {doc.content.split(/\s+/).length} words
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Documents */}
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className={cn(
                  "p-12",
                  index < documents.length - 1 && "border-b border-cream-200"
                )}
                style={previewMode === "print" ? { pageBreakBefore: "always" } : undefined}
              >
                {/* Document Header */}
                <div className="mb-6 border-b-2 border-brand-500 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                        Document {index + 1}
                      </p>
                      <h2 className="mt-1 font-heading text-2xl font-bold text-text-primary">
                        {doc.title}
                      </h2>
                    </div>
                    {doc.readinessLevel && (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold uppercase",
                          doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted"
                            ? "bg-emerald-100 text-emerald-700"
                            : doc.readinessLevel === "review"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {doc.readinessLevel === "export_ready"
                          ? "Ready"
                          : doc.readinessLevel === "submitted"
                          ? "Submitted"
                          : doc.readinessLevel === "review"
                          ? "In Review"
                          : "Draft"}
                      </span>
                    )}
                  </div>
                  {doc.targetProgram && (
                    <p className="mt-2 text-sm text-text-muted">
                      Target: {doc.targetProgram}
                    </p>
                  )}
                </div>

                {/* Document Content */}
                <div className="prose prose-slate max-w-none">
                  <div
                    className="whitespace-pre-wrap text-base leading-relaxed text-text-primary"
                    dangerouslySetInnerHTML={{
                      __html: doc.content
                        .split('\n\n')
                        .map(para => `<p>${para}</p>`)
                        .join('')
                    }}
                  />
                </div>

                {/* Document Footer */}
                <div className="mt-8 border-t border-cream-200 pt-4 text-sm text-text-muted">
                  <div className="flex items-center justify-between">
                    <p>
                      Last updated: {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      {doc.content.split(/\s+/).length} words
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="border-t-4 border-brand-500 bg-cream-50 p-8 text-center">
              <p className="text-sm font-semibold text-text-primary">
                Generated by Olcan Compass
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Professional Mobility Platform • olcan.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .dossier-print-content,
          .dossier-print-content * {
            visibility: visible;
          }
          .dossier-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}</style>
    </Modal>
  );
}
