"use client";

import { useState } from "react";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui";

interface PDFExporterProps {
  documentId: string;
  documentTitle: string;
  content: string;
  className?: string;
}

export function PDFExporter({ documentId, documentTitle, content, className = "" }: PDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = () => {
    setIsExporting(true);
    
    try {
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor, permita pop-ups para exportar o PDF.');
        return;
      }
      
      // Format content with basic markdown parsing
      const formattedContent = content
        .replace(/^# (.+)$/gm, '<h1 style="font-size: 24pt; font-weight: bold; margin-top: 12mm; margin-bottom: 6mm; color: #001338;">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size: 18pt; font-weight: bold; margin-top: 8mm; margin-bottom: 4mm; color: #001338;">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin-left: 5mm; margin-bottom: 2mm;">$1</li>')
        .replace(/\n\n/g, '</p><p style="margin-bottom: 4mm;">')
        .replace(/\n/g, '<br>');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${documentTitle}</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              @media print {
                body { margin: 0; }
              }
              body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #000000;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
              }
              h1, h2, h3 { page-break-after: avoid; }
              p { page-break-inside: avoid; }
              ul, ol { margin-left: 5mm; }
              li { margin-bottom: 2mm; }
            </style>
          </head>
          <body>
            <div>${formattedContent}</div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const exportToJSON = () => {
    const data = {
      id: documentId,
      title: documentTitle,
      content: content,
      exportedAt: new Date().toISOString(),
      format: "olcan-forge-v1",
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        onClick={exportToPDF}
        disabled={isExporting || !content.trim()}
        variant="primary"
        size="md"
        className="w-full"
      >
        {isExporting ? (
          <>
            <Printer className="w-4 h-4" />
            Abrindo impressão...
          </>
        ) : (
          <>
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </>
        )}
      </Button>
      
      <Button
        onClick={exportToJSON}
        disabled={!content.trim()}
        variant="secondary"
        size="md"
        className="w-full"
      >
        <FileText className="w-4 h-4" />
        Exportar como JSON
      </Button>
      
      <p className="text-caption text-text-muted text-center">
        PDF para impressão ou envio • JSON para backup e portabilidade
      </p>
    </div>
  );
}
