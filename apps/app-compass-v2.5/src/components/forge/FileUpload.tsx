"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui";

interface FileUploadProps {
  onContentExtracted: (content: string, filename: string) => void;
  onClose?: () => void;
}

export function FileUpload({ onContentExtracted, onClose }: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setUploadedFile(file);

    try {
      // Check file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];

      if (!validTypes.includes(file.type)) {
        throw new Error('Formato não suportado. Use PDF, DOCX ou TXT.');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      // For text files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setExtractedContent(text);
        toast({
          title: "Arquivo processado",
          description: `${file.name} foi importado com sucesso.`,
          variant: "success",
        });
        return;
      }

      // For PDF/DOCX, we'd normally call a backend API
      // For now, show a placeholder message
      const placeholderContent = `# ${file.name}

[Conteúdo extraído do arquivo]

Este é um placeholder. Em produção, o conteúdo seria extraído do arquivo ${file.type === 'application/pdf' ? 'PDF' : 'DOCX'} usando um serviço de parsing no backend.

Para implementar:
1. Enviar arquivo para /api/parse-document
2. Backend usa biblioteca de parsing (PyPDF2, python-docx, etc.)
3. Retorna texto extraído
4. Exibe no editor

Por enquanto, você pode:
- Copiar e colar o conteúdo manualmente
- Ou usar arquivos .txt que funcionam diretamente
`;

      setExtractedContent(placeholderContent);
      
      toast({
        title: "Arquivo carregado",
        description: `${file.name} - Parsing completo em breve`,
        variant: "success",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(message);
      toast({
        title: "Erro no upload",
        description: message,
        variant: "warning",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleUseContent = () => {
    if (extractedContent && uploadedFile) {
      onContentExtracted(extractedContent, uploadedFile.name);
      toast({
        title: "Conteúdo importado",
        description: "O texto foi adicionado ao editor.",
        variant: "success",
      });
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setExtractedContent("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-brand-500 bg-brand-50"
              : "border-cream-300 bg-cream-50 hover:border-brand-400"
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-brand-500" : "text-text-muted"}`} />
          <h3 className="font-heading text-h4 text-text-primary mb-2">
            Arraste seu arquivo aqui
          </h3>
          <p className="text-body-sm text-text-secondary mb-4">
            ou clique para selecionar
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-medium cursor-pointer hover:bg-brand-600 transition-colors">
            <FileText className="w-4 h-4" />
            Selecionar Arquivo
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-xs text-text-muted mt-4">
            Formatos suportados: PDF, DOCX, TXT (máx. 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-lg border border-cream-300">
            <FileText className="w-8 h-8 text-brand-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{uploadedFile.name}</p>
              <p className="text-xs text-text-muted">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {isProcessing && <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />}
            {!isProcessing && !error && <CheckCircle className="w-5 h-5 text-brand-500" />}
            {error && <AlertCircle className="w-5 h-5 text-red-500" />}
            <button
              onClick={handleReset}
              className="p-1 hover:bg-cream-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Preview */}
          {extractedContent && !error && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Prévia do Conteúdo Extraído
                </label>
                <div className="max-h-64 overflow-y-auto p-4 bg-white border border-cream-300 rounded-lg">
                  <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans">
                    {extractedContent.substring(0, 500)}
                    {extractedContent.length > 500 && "..."}
                  </pre>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  {extractedContent.split(/\s+/).filter(Boolean).length} palavras extraídas
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-cream-200">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-cream-300 rounded-lg text-text-secondary font-medium hover:bg-cream-100 transition-colors"
                >
                  Tentar Outro Arquivo
                </button>
                <button
                  onClick={handleUseContent}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                >
                  Usar Este Conteúdo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
