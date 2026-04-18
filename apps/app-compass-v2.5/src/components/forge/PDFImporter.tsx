"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFImporterProps {
  onImport: (text: string) => void;
  className?: string;
}

export function PDFImporter({ onImport, className = "" }: PDFImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText.trim();
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) {
      setStatus("error");
      setErrorMessage("Por favor, selecione um arquivo PDF válido.");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setIsProcessing(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const text = await extractTextFromPDF(file);
      
      if (!text || text.length < 50) {
        throw new Error("O PDF parece estar vazio ou não contém texto extraível.");
      }

      onImport(text);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Erro ao processar o PDF. Tente novamente."
      );
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setIsProcessing(false);
    }
  }, [onImport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-xl border-2 border-dashed p-8 text-center transition-all
          ${isDragging 
            ? "border-brand-500 bg-brand-50/50" 
            : "border-cream-400 bg-cream-50/30 hover:border-brand-400 hover:bg-brand-50/30"
          }
          ${isProcessing ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="font-heading text-body font-semibold text-text-primary">
              Processando PDF...
            </p>
            <p className="text-caption text-text-muted">
              Extraindo texto do documento
            </p>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <p className="font-heading text-body font-semibold text-emerald-700">
              PDF importado com sucesso!
            </p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-clay-500" />
            <p className="font-heading text-body font-semibold text-clay-700">
              Erro ao importar
            </p>
            <p className="text-caption text-text-muted max-w-md">
              {errorMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-brand-500" />
              </div>
              
              <div>
                <p className="font-heading text-h4 text-text-primary mb-1">
                  Importar currículo existente
                </p>
                <p className="text-body-sm text-text-secondary">
                  Arraste um PDF aqui ou clique para selecionar
                </p>
              </div>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="pdf-upload"
              />
              
              <label htmlFor="pdf-upload">
                <Button variant="secondary" size="md" className="cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Selecionar PDF
                </Button>
              </label>

              <p className="text-caption text-text-muted mt-2">
                O texto será extraído automaticamente e você poderá editá-lo
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
