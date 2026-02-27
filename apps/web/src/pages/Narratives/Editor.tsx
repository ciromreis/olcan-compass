import { useParams } from 'react-router-dom'
import { NarrativeEditor } from '@/components/domain/NarrativeEditor'
import { Alert } from '@/components/ui/Alert'

/**
 * Narrative Editor page — rich text editing with auto-save and AI feedback.
 */
export function NarrativeEditorPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <Alert variant="error">
        ID da narrativa não fornecido.
      </Alert>
    )
  }

  return <NarrativeEditor narrativeId={id} />
}
