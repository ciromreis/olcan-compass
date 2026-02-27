import { useParams } from 'react-router-dom'
import { Calendar, CheckCircle, FileText } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileUpload } from '@/components/ui/FileUpload'
import { Timeline } from '@/components/ui/Timeline'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const { getApplication, uploadDocument } = useApplications()

  const applicationQuery = getApplication(id ?? '')
  const application = applicationQuery?.data

  if (applicationQuery?.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (applicationQuery?.error || !application) {
    return <Alert variant="error">Erro ao carregar aplicação. Tente novamente.</Alert>
  }

  const statusColors = {
    draft: 'default',
    submitted: 'warning',
    under_review: 'warning',
    accepted: 'success',
    rejected: 'error',
  } as const

  const deadlineLabel = application.deadline
    ? new Date(application.deadline).toLocaleDateString('pt-BR')
    : 'Sem prazo definido'

  const requiredDocuments = Array.isArray(application.required_documents)
    ? application.required_documents
    : []

  const timelineItems = [
    {
      id: '1',
      date: application.created_at || new Date().toISOString(),
      title: 'Aplicação criada',
      status: 'completed' as const,
    },
    {
      id: '2',
      date: application.updated_at || application.created_at || new Date().toISOString(),
      title: 'Última atualização',
      status: application.status === 'draft' ? ('upcoming' as const) : ('completed' as const),
    },
    {
      id: '3',
      date: application.deadline || new Date().toISOString(),
      title: 'Prazo final',
      status: application.status === 'submitted' || application.status === 'under_review' || application.status === 'accepted'
        ? ('completed' as const)
        : ('upcoming' as const),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">{application.title || application.opportunity_name}</h1>
          <p className="text-body text-neutral-300 mt-1">{application.institution}</p>
        </div>
        <Badge variant={statusColors[application.status as keyof typeof statusColors]}>
          {application.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Detalhes da Aplicação</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-body-sm text-neutral-400 mb-1">Descrição</p>
                  <p className="text-body text-white">{application.description || 'Sem descrição disponível.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-body-sm text-neutral-400 mb-1">Prazo</p>
                    <div className="flex items-center gap-2 text-body text-white">
                      <Calendar className="w-4 h-4" />
                      {deadlineLabel}
                    </div>
                  </div>
                  <div>
                    <p className="text-body-sm text-neutral-400 mb-1">Match Score</p>
                    <p className="text-body text-white font-medium">{application.match_score ?? '-'}{application.match_score !== undefined ? '%' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Documentos Necessários</h2>
              <div className="space-y-4">
                {requiredDocuments.length === 0 ? (
                  <p className="text-body-sm text-neutral-400">Nenhum documento obrigatório registrado.</p>
                ) : requiredDocuments.map((doc: { id: string; name: string; type: string; uploaded: boolean }) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-lumina" />
                        <div>
                          <p className="text-body text-white">{doc.name}</p>
                          <p className="text-body-sm text-neutral-400">{doc.type}</p>
                        </div>
                      </div>
                      {doc.uploaded ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </div>
                    {!doc.uploaded && (
                      <FileUpload
                        onUpload={(files) => uploadDocument(application.id, files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Linha do Tempo</h2>
              <Timeline items={timelineItems} />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Ações</h2>
              <div className="space-y-3">
                <Button fullWidth>Enviar Aplicação</Button>
                <Button fullWidth variant="secondary">
                  Salvar Rascunho
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
