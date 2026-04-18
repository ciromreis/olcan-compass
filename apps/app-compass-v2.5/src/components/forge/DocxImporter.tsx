"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { importDocx, isDocxFile, formatImportedContent } from "@/lib/docx-import";
import { Button } from "@/components/ui";

interface DocxImporterProps {
  onImport: (content: string) => void;
  onClose?: () => void;
}

export function DocxImporter({ onImport, onClose }: DocxImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(false);

      // Validate file type
      if (!isDocxFile(file)) {
        setError("Por favor, selecione um arquivo .docx válido.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Arquivo muito grande. O tamanho máximo é 10MB.");
        return;
      }

      setIsProcessing(true);

      try {
        const content = await importDocx(file);
        const formattedContent = formatImportedContent(content);

        if (!formattedContent.trim()) {
          setError("O documento não contém texto extraível.");
          setIsProcessing(false);
          return;
        }

        onImport(formattedContent);
        setSuccess(true);

        // Auto-close after success
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } catch (err) {
        console.error("Import error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao importar documento. Verifique se o arquivo está correto."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onImport, onClose]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
          ${
            isDragging
              ? "border-brand-500 bg-brand-50"
              : "border-cream-300 bg-cream-50 hover:border-brand-400 hover:bg-cream-100"
          }
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
              <p className="text-sm font-medium text-text-primary">Processando documento...</p>
            </>
          ) : success ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                <CheckCircle className="h-6 w-6 text-brand-500" />
              </div>
              <p className="text-sm font-medium text-brand-600">Documento importado com sucesso!</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                <Upload className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Arraste um arquivo .docx ou clique para selecionar
                </p>
                <p className="mt-1 text-xs text-text-muted">Tamanho máximo: 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-clay-200 bg-clay-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-clay-700">Erro ao importar</p>
            <p className="mt-1 text-xs text-clay-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="rounded p-1 text-clay-400 transition-colors hover:bg-clay-100 hover:text-clay-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
          <div className="text-xs text-brand-700">
            <p className="font-medium">Sobre a importação:</p>
            <ul className="mt-2 space-y-1 text-brand-600">
              <li>• O texto será extraído e formatado automaticamente</li>
              <li>• Formatação básica (negrito, títulos) será preservada quando possível</li>
              <li>• Imagens e tabelas não serão importadas</li>
              <li>• O conteúdo atual será substituído pelo texto importado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      {onClose && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
