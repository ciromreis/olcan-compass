import React, { useState, useRef } from 'react';
import { File, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  onFilesChange,
  onUpload,
  disabled = false,
  error,
  className,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileExtension = `.${file.name.split('.').pop()}`;
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some(
        (type) =>
          type === mimeType ||
          type === fileExtension ||
          (type.endsWith('/*') && mimeType.startsWith(type.replace('/*', '')))
      );

      if (!isAccepted) {
        return `Tipo de arquivo não permitido. Aceitos: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const fileArray = Array.from(newFiles);
    const currentFileCount = files.length;

    if (currentFileCount + fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const validatedFiles: FileWithProgress[] = fileArray.map((file) => {
      const validationError = validateFile(file);
      return {
        file,
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
      };
    });

    const newFileList = multiple ? [...files, ...validatedFiles] : validatedFiles;
    setFiles(newFileList);
    onFilesChange?.(newFileList.map((f) => f.file));

    // Auto-upload if handler provided
    if (onUpload) {
      const validFiles = validatedFiles.filter((f) => f.status === 'pending');
      if (validFiles.length > 0) {
        handleUpload(validFiles);
      }
    }
  };

  const handleUpload = async (filesToUpload: FileWithProgress[]) => {
    if (!onUpload) return;

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        filesToUpload.find((fu) => fu.file === f.file)
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      )
    );

    try {
      // Simulate progress (in real implementation, use XMLHttpRequest or similar for progress tracking)
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.status === 'uploading' && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      await onUpload(filesToUpload.map((f) => f.file));

      clearInterval(progressInterval);

      // Mark as success
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((fu) => fu.file === f.file)
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );
    } catch (err) {
      // Mark as error
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((fu) => fu.file === f.file)
            ? {
                ...f,
                status: 'error',
                error: err instanceof Error ? err.message : 'Erro ao enviar arquivo',
              }
            : f
        )
      );
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles.map((f) => f.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          'flex flex-col items-center justify-center gap-2',
          isDragging && !disabled && 'border-cyan/50 bg-primary-blue/10',
          !isDragging && !disabled && 'border-white/10 hover:border-cyan/30',
          disabled && 'opacity-50 cursor-not-allowed border-neutral-200',
          error && 'border-semantic-error'
        )}
      >
        <Upload
          className={cn(
            'w-10 h-10',
            isDragging ? 'text-cyan' : 'text-slate'
          )}
        />
        <div className="text-center">
          <p className="text-sm text-neutral-700">
            <span className="font-semibold text-cyan">Clique para enviar</span>{' '}
            ou arraste arquivos aqui
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {accept && `Formatos aceitos: ${accept}`}
            {maxSize && ` • Tamanho máximo: ${formatFileSize(maxSize)}`}
            {multiple && ` • Até ${maxFiles} arquivos`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
          aria-label="Selecionar arquivos"
        />
      </div>

      {error && (
        <p className="text-sm text-semantic-error mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileWithProgress, index) => (
            <div
              key={`${fileWithProgress.file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <File className="w-5 h-5 text-neutral-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 truncate">
                  {fileWithProgress.file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(fileWithProgress.file.size)}
                </p>
                {fileWithProgress.status === 'uploading' && (
                  <div className="mt-1 w-full bg-neutral-200 rounded-full h-1.5">
                    <div
                      className="bg-cyan h-1.5 rounded-full transition-all"
                      style={{ width: `${fileWithProgress.progress}%` }}
                    />
                  </div>
                )}
                {fileWithProgress.error && (
                  <p className="text-xs text-semantic-error mt-1">
                    {fileWithProgress.error}
                  </p>
                )}
              </div>
              {fileWithProgress.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-semantic-success flex-shrink-0" />
              )}
              {fileWithProgress.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-semantic-error flex-shrink-0" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 hover:bg-neutral-200 rounded transition-colors"
                aria-label={`Remover ${fileWithProgress.file.name}`}
              >
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
