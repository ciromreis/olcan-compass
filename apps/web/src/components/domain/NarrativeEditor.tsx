import React, { useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEditorStore } from '@/store/editor';
import { debounce } from '@/lib/utils';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NarrativeEditorProps {
  narrativeId: string;
  onSave?: (content: string) => Promise<void>;
  onRequestAnalysis?: () => Promise<void>;
  autoSaveInterval?: number; // milliseconds
  className?: string;
}

export const NarrativeEditor: React.FC<NarrativeEditorProps> = ({
  narrativeId: _narrativeId,
  onSave,
  onRequestAnalysis,
  autoSaveInterval = 30000, // 30 seconds
  className,
}) => {
  const {
    content,
    isDirty,
    isSaving,
    lastSaved,
    analysis,
    wordCount,
    characterCount,
    setContent,
    setSaving,
    setLastSaved,
    setDirty,
  } = useEditorStore();

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(async (contentToSave: string) => {
      if (!onSave || !isDirty) return;

      setSaving(true);
      try {
        await onSave(contentToSave);
        setLastSaved(new Date());
        setDirty(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, autoSaveInterval),
    [onSave, isDirty, autoSaveInterval]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (isDirty && content) {
      debouncedSave(content);
    }
  }, [content, isDirty, debouncedSave]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleManualSave = async () => {
    if (!onSave || !isDirty) return;

    setSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
      setDirty(false);
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAnalysis = async () => {
    if (!onRequestAnalysis) return;

    setIsAnalyzing(true);
    try {
      await onRequestAnalysis();
    } catch (error) {
      console.error('Analysis request failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLastSavedText = () => {
    if (!lastSaved) return 'Nunca salvo';

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Salvo agora';
    if (diffMins === 1) return 'Salvo há 1 minuto';
    if (diffMins < 60) return `Salvo há ${diffMins} minutos`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Salvo há 1 hora';
    return `Salvo há ${diffHours} horas`;
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Editor Panel */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6">
          {/* Editor Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-neutral-900">Editor</h3>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              )}
              {!isSaving && isDirty && (
                <Badge variant="warning" size="sm">
                  Não salvo
                </Badge>
              )}
              {!isSaving && !isDirty && lastSaved && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                  <span>{getLastSavedText()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualSave}
                disabled={!isDirty || isSaving}
              >
                <Save className="w-4 h-4" />
                Salvar
              </Button>
              {onRequestAnalysis && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRequestAnalysis}
                  disabled={isAnalyzing || !content.trim()}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Analisar
                </Button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Comece a escrever sua narrativa..."
            className={cn(
              'w-full min-h-[500px] p-4 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder:text-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-lumina-500 focus:border-lumina-500',
              'resize-y font-body text-base leading-relaxed'
            )}
          />

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <span>{wordCount} palavras</span>
              <span>{characterCount} caracteres</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock className="w-3 h-3" />
              <span>Auto-save a cada 30s</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Feedback Panel */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lumina-600" />
              <h3 className="text-lg font-semibold text-neutral-900">
                Feedback IA
              </h3>
            </div>

            {!analysis && !isAnalyzing && (
              <div className="text-center py-8">
                <p className="text-sm text-neutral-600">
                  Clique em "Analisar" para receber feedback sobre sua narrativa
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-lumina-600" />
                <p className="text-sm text-neutral-600">Analisando...</p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-4">
                {/* Score */}
                {analysis.score !== undefined && (
                  <div className="text-center py-4 bg-lumina-50 rounded-lg">
                    <div className="text-3xl font-bold text-lumina-600">
                      {analysis.score}
                      <span className="text-lg text-neutral-600">/100</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">
                      Pontuação Geral
                    </p>
                  </div>
                )}

                {/* Feedback */}
                {analysis.feedback && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-700">
                      Análise Geral
                    </h4>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {analysis.feedback}
                    </p>
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                      Pontos Fortes
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-neutral-600 flex items-start gap-2"
                        >
                          <span className="text-semantic-success mt-0.5">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements && analysis.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-semantic-warning" />
                      Sugestões de Melhoria
                    </h4>
                    <ul className="space-y-1">
                      {analysis.improvements.map((improvement, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-neutral-600 flex items-start gap-2"
                        >
                          <span className="text-semantic-warning mt-0.5">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamp */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    Analisado em{' '}
                    {new Date(analysis.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
