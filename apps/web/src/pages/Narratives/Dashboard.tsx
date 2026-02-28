import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, FileEdit, FileText } from 'lucide-react'
import { useNarratives, useCreateNarrative, type NarrativeType } from '@/hooks/useNarratives'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'

/**
 * Narratives Dashboard — list and manage personal statements and essays.
 */
export function NarrativesDashboard() {
  const navigate = useNavigate()
  const narrativesQuery = useNarratives()
  const createNarrativeMutation = useCreateNarrative()
  const narratives = narrativesQuery.data || []
  const isLoading = narrativesQuery.isLoading
  const error = narrativesQuery.error
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNarrativeTitle, setNewNarrativeTitle] = useState('')
  const [newNarrativeType, setNewNarrativeType] = useState<NarrativeType>('personal_statement')
  const [newNarrativeContent, setNewNarrativeContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!newNarrativeTitle.trim() || !newNarrativeContent.trim()) return

    setIsCreating(true)
    try {
      const narrative = await createNarrativeMutation.mutateAsync({
        title: newNarrativeTitle,
        narrative_type: newNarrativeType,
        content: newNarrativeContent,
      })
      setIsCreateModalOpen(false)
      setNewNarrativeTitle('')
      setNewNarrativeContent('')
      navigate(`/narratives/${narrative.id}`)
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Erro ao carregar narrativas. Tente novamente.
      </Alert>
    )
  }

  const narrativeTypeLabels = {
    motivation_letter: 'Carta de Motivação',
    personal_statement: 'Declaração Pessoal',
    cover_letter: 'Carta de Apresentação',
    research_proposal: 'Proposta de Pesquisa',
    scholarship_essay: 'Ensaio de Bolsa',
    cv_summary: 'Resumo de CV',
    other: 'Outro',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">
            Narrativas
          </h1>
          <p className="text-body text-slate mt-1">
            Crie e refine suas histórias para aplicações
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Nova Narrativa
        </Button>
      </div>

      {!narratives || narratives.length === 0 ? (
        /* Empty State */
        <Card>
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title="Nenhuma narrativa criada"
            description="Comece escrevendo sua primeira narrativa para se destacar em suas aplicações."
            onAction={() => setIsCreateModalOpen(true)}
            actionLabel="Criar Narrativa"
          />
        </Card>
      ) : (
        /* Narratives Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {narratives.map((narrative: any, index: number) => (
            <motion.div
              key={narrative.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-cyan/30 transition-colors cursor-pointer group">
                <div
                  className="p-6 h-full flex flex-col"
                  onClick={() => navigate(`/narratives/${narrative.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-blue/10 text-cyan group-hover:bg-primary-blue/20 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge variant="default">
                      {narrativeTypeLabels[narrative.narrative_type as keyof typeof narrativeTypeLabels] || narrative.narrative_type}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-h4 text-white mb-2 group-hover:text-cyan transition-colors line-clamp-2">
                      {narrative.title}
                    </h3>
                    <p className="text-body-sm text-slate mb-4">
                      {narrative.version_count || 0} versões
                      {typeof narrative.latest_overall_score === 'number' ? ` • Score ${Math.round(narrative.latest_overall_score)}/100` : ''}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-body-sm text-slate">
                      <Clock className="w-4 h-4" />
                      {new Date(narrative.updated_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <FileEdit className="w-5 h-5 text-cyan group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Narrativa"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={newNarrativeTitle}
            onChange={(e) => setNewNarrativeTitle(e.target.value)}
            placeholder="Ex: Declaração Pessoal - MIT"
            autoFocus
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-silver">
              Tipo de Narrativa
            </label>
            <Select
              value={newNarrativeType}
              onChange={(value) => {
                setNewNarrativeType((Array.isArray(value) ? value[0] : value) as NarrativeType)
              }}
              placeholder="Selecione um tipo..."
              options={[
                { value: 'motivation_letter', label: 'Carta de Motivação' },
                { value: 'personal_statement', label: 'Declaração Pessoal' },
                { value: 'cover_letter', label: 'Carta de Apresentação' },
                { value: 'research_proposal', label: 'Proposta de Pesquisa' },
                { value: 'scholarship_essay', label: 'Ensaio de Bolsa' },
                { value: 'cv_summary', label: 'Resumo de CV' },
                { value: 'other', label: 'Outro' },
              ]}
            />
          </div>

          <Textarea
            label="Primeiro rascunho"
            value={newNarrativeContent}
            onChange={(e) => setNewNarrativeContent(e.target.value)}
            placeholder="Escreva aqui sem se censurar. A forja serve para lapidar depois."
            helperText="Dica: comece com 3 fatos + 1 motivação + 1 prova."
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!newNarrativeTitle.trim() || !newNarrativeContent.trim()}
              fullWidth
            >
              Criar Narrativa
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
