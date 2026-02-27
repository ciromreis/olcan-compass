import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, FileEdit, FileText } from 'lucide-react'
import { useNarratives, useCreateNarrative } from '@/hooks/useNarratives'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
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
  const narratives = narrativesQuery.data
  const isLoading = narrativesQuery.isLoading
  const error = narrativesQuery.error
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNarrativeTitle, setNewNarrativeTitle] = useState('')
  const [newNarrativeType, setNewNarrativeType] = useState('personal_statement')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!newNarrativeTitle.trim()) return

    setIsCreating(true)
    try {
      const narrative = await createNarrativeMutation.mutateAsync({
        title: newNarrativeTitle,
        type: newNarrativeType,
      })
      setIsCreateModalOpen(false)
      setNewNarrativeTitle('')
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
    personal_statement: 'Declaração Pessoal',
    motivation_letter: 'Carta de Motivação',
    research_proposal: 'Proposta de Pesquisa',
    essay: 'Ensaio',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">
            Narrativas
          </h1>
          <p className="text-body text-neutral-300 mt-1">
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
            description="Comece a escrever sua história para aplicações acadêmicas e profissionais."
            onAction={() => setIsCreateModalOpen(true)}
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
              <Card className="h-full hover:border-lumina/40 transition-colors cursor-pointer group">
                <div
                  className="p-6 h-full flex flex-col"
                  onClick={() => navigate(`/narratives/${narrative.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-lumina/10 text-lumina group-hover:bg-lumina/20 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge variant="default">
                      {narrativeTypeLabels[narrative.type as keyof typeof narrativeTypeLabels] || narrative.type}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-h4 text-white mb-2 group-hover:text-lumina transition-colors line-clamp-2">
                      {narrative.title}
                    </h3>
                    <p className="text-body-sm text-neutral-400 mb-4">
                      {narrative.word_count || 0} palavras
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-600/30">
                    <div className="flex items-center gap-2 text-body-sm text-neutral-400">
                      <Clock className="w-4 h-4" />
                      {new Date(narrative.updated_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <FileEdit className="w-5 h-5 text-lumina group-hover:translate-x-1 transition-transform" />
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
            
            value={newNarrativeTitle}
            onChange={(e) => setNewNarrativeTitle(e.target.value)}
            placeholder="Ex: Declaração Pessoal - MIT"
            autoFocus
          />

          <Select
            value={newNarrativeType}
            onChange={(value) => setNewNarrativeType(Array.isArray(value) ? value[0] : value)}
            options={[
              { value: 'personal_statement', label: 'Declaração Pessoal' },
              { value: 'motivation_letter', label: 'Carta de Motivação' },
              { value: 'research_proposal', label: 'Proposta de Pesquisa' },
              { value: 'essay', label: 'Ensaio' },
            ]}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!newNarrativeTitle.trim()}
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
