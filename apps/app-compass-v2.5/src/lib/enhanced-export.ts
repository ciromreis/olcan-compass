/**
 * Enhanced Dossier Export System
 * 
 * Provides comprehensive export capabilities for dossiers with:
 * - Multiple format support (PDF, DOCX, ZIP)
 * - Olcan branding options
 * - Batch document export
 * - Customizable sections
 */

import { type ForgeDocument, DOC_TYPE_LABELS } from "@/stores/forge";
import { type UserApplication } from "@/stores/applications";
import { downloadDocx } from "./docx-export";

export interface ExportOptions {
  branding: boolean;
  includeMetrics: boolean;
  includeTimeline: boolean;
  targetOpportunityId?: string | null;
}

export interface DossierExport {
  id: string;
  title: string;
  format: "pdf" | "docx" | "zip";
  createdAt: Date;
}

/**
 * Compose a professional dossier export from multiple documents
 */
export function composeDossierExport(
  documents: ForgeDocument[],
  application: UserApplication | null,
  options: ExportOptions
): string {
  const parts: string[] = [];
  
  // Cover Page
  if (options.branding) {
    parts.push(`
================================================================================
OLCAN COMPASS - DOSSIER DIGITAL DE CANDIDATURA
================================================================================

${application ? application.program : "Documentos Profissionais"}
${application ? application.country : ""}
Gerado em: ${new Date().toLocaleDateString("pt-BR")}
--------------------------------------------------------------------------------
`);
  }
  
  // Documents
  documents.forEach((doc, index) => {
    const docTypeLabel = DOC_TYPE_LABELS[doc.type] || doc.type;
    parts.push(`
================================================================================
DOCUMENTO ${index + 1}: ${doc.title.toUpperCase()}
Tipo: ${docTypeLabel}
================================================================================

${doc.content}

`);
    
    // Include metrics if requested
    if (options.includeMetrics && doc.competitivenessScore) {
      parts.push(`
---
METRICAS:
- Score de Alinhamento: ${doc.competitivenessScore}%
- Palavras: ${doc.content.split(/\s+/).length}
- Última atualização: ${new Date(doc.updatedAt).toLocaleDateString("pt-BR")}
`);
    }
  });
  
  // Timeline
  if (options.includeTimeline && application) {
    parts.push(`

================================================================================
CRONOGRAMA DE CANDIDATURA
================================================================================

- Oportunidade: ${application.program}
- Deadline: ${application.deadline ? new Date(application.deadline).toLocaleDateString("pt-BR") : "N/A"}
- Status: ${application.status}
- País: ${application.country}
`);
  }
  
  // Footer
  if (options.branding) {
    parts.push(`

================================================================================
Documento gerado pelo Olcan Compass - Narrative Forge
Para modifications, accesse: https://app.olcan.com.br/forge
================================================================================
`);
  }
  
  return parts.join("\n");
}

/**
 * Export a single document as PDF (print-based)
 */
export function exportDocumentAsPDF(
  title: string,
  content: string,
  branding: boolean = true
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permita pop-ups para exportar PDF.");
    return;
  }
  
  const formattedContent = content
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18pt;font-weight:bold;margin:12mm 0 6mm;color:#001338;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14pt;font-weight:bold;margin:8mm 0 4mm;color:#001338;">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li style="margin-left:5mm;margin-bottom:2mm;">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  
  const brandingHeader = branding ? `
    <div style="border-bottom:2px solid #001338;padding-bottom:4mm;margin-bottom:8mm;">
      <span style="font-size:10pt;color:#666;font-style:italic;">Gerado pelo Olcan Compass</span>
    </div>
  ` : "";
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Georgia','Times New Roman',serif; font-size:11pt; line-height:1.6; color:#000; max-width:190mm; margin:0 auto; padding:20mm; }
          h1, h2, h3 { page-break-after:avoid; }
          p { page-break-inside:avoid; }
          ul { margin-left:5mm; }
          li { margin-bottom:2mm; }
        </style>
      </head>
      <body>
        ${brandingHeader}
        <div>${formattedContent}</div>
        <script>window.onload=function(){window.print();}</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Export multiple documents as a ZIP-like bundle (single DOCX with all)
 */
export async function exportDossierBundle(
  documents: ForgeDocument[],
  application: UserApplication | null,
  options: ExportOptions,
  bundleTitle: string
): Promise<void> {
  const content = composeDossierExport(documents, application, options);
  await downloadDocx(bundleTitle, content, `${bundleTitle.replace(/\s+/g, "_")}.docx`);
}

/**
 * Quick export single document
 */
export function quickExportDocument(
  doc: ForgeDocument,
  format: "pdf" | "docx"
): void {
  if (format === "pdf") {
    exportDocumentAsPDF(doc.title, doc.content, true);
  } else {
    downloadDocx(doc.title, doc.content, `${doc.title.replace(/\s+/g, "_")}.docx`);
  }
}