import { useParams } from 'react-router-dom'
import { NarrativeEditor } from '@/components/domain/NarrativeEditor'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useCreateNarrativeVersion, useNarrative, useRequestAnalysis } from '@/hooks/useNarratives'
import { useEditorStore } from '@/store/editor'

/**
 * Narrative Editor page — rich text editing with auto-save and AI feedback.
 */
export function NarrativeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const narrativeQuery = useNarrative(id || '')
  const saveVersion = useCreateNarrativeVersion()
  const requestAnalysis = useRequestAnalysis()
  const { isDirty } = useEditorStore()

  if (!id) {
    return (
      <Alert variant="error">
        ID da narrativa não fornecido.
      </Alert>
    )
  }

  if (narrativeQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (narrativeQuery.error) {
    return (
      <Alert variant="error">
        Erro ao carregar narrativa. Tente novamente.
      </Alert>
    )
  }

  const narrative = narrativeQuery.data

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-h2 text-white truncate">
            {narrative?.title || 'Narrativa'}
          </h1>
          <p className="text-body-sm text-slate mt-1">
            Forja de ativos: escreva bruto, refine com precisão.
          </p>
        </div>
      </div>

      <NarrativeEditor
        narrativeId={id}
        onSave={async (contentToSave) => {
          await saveVersion.mutateAsync({
            narrativeId: id,
            content: contentToSave,
            change_summary: isDirty ? 'Atualização de rascunho' : undefined,
          })
        }}
        onRequestAnalysis={async () => {
          await requestAnalysis.mutateAsync(id)
        }}
        autoSaveInterval={30000}
      />

      {saveVersion.error && (
        <Alert variant="error">
          Não foi possível salvar. Verifique sua conexão e tente novamente.
        </Alert>
      )}

      {requestAnalysis.error && (
        <Alert variant="error">
          Não foi possível analisar. Tente novamente em instantes.
        </Alert>
      )}
    </div>
  )
}
