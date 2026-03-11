import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Map,
  CheckCircle2,
  Circle,
  Lock,
  Calendar,
  Clock,
  FileText,
  ChevronLeft,
  ArrowRight,
  Tag,
  StickyNote,
} from 'lucide-react'
import { useRoute, useUpdateMilestone } from '@/hooks/useRoutes'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import type { RouteMilestone } from '@/store/route'

const categoryLabels: Record<string, string> = {
  documentation: 'Documentação',
  finance: 'Finanças',
  language: 'Idioma',
  application: 'Candidatura',
  preparation: 'Preparação',
  visa: 'Visto',
  logistics: 'Logística',
}

const statusLabels: Record<string, string> = {
  locked: 'Bloqueado',
  available: 'Disponível',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  skipped: 'Pulado',
}

const statusVariants: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  locked: 'default',
  available: 'warning',
  in_progress: 'warning',
  completed: 'success',
  skipped: 'default',
}

export function RouteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const routeQuery = useRoute(id || '')
  const updateMilestone = useUpdateMilestone()
  const [selectedMilestone, setSelectedMilestone] = useState<RouteMilestone | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  if (!id) {
    return <Alert variant="error">ID da rota não fornecido.</Alert>
  }

  if (routeQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (routeQuery.error || !routeQuery.data) {
    return <Alert variant="error">Erro ao carregar rota. Tente novamente.</Alert>
  }

  const route = routeQuery.data
  const sortedMilestones = [...route.milestones].sort(
    (a, b) => a.order_index - b.order_index
  )
  const completedCount = route.milestones.filter((m) => m.completed).length
  const totalCount = route.milestones.length

  const getMilestoneIcon = (milestone: RouteMilestone) => {
    if (milestone.completed) return <CheckCircle2 className="w-5 h-5 text-success" />
    if (milestone.status === 'locked') return <Lock className="w-4 h-4 text-slate" />
    if (milestone.status === 'in_progress') return <Circle className="w-5 h-5 text-cyan" />
    return <Circle className="w-5 h-5 text-silver" />
  }

  const canInteract = (milestone: RouteMilestone) => {
    return milestone.status === 'available' || milestone.status === 'in_progress'
  }

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return
    await updateMilestone.mutateAsync({
      routeId: route.id,
      milestoneId: selectedMilestone.id,
      updates: { completed: true },
    })
    setShowCompleteModal(false)
    setSelectedMilestone(null)
    setCompletionNotes('')
    routeQuery.refetch()
  }

  const handleStartMilestone = async (milestone: RouteMilestone) => {
    if (milestone.status !== 'available') return
    await updateMilestone.mutateAsync({
      routeId: route.id,
      milestoneId: milestone.id,
      updates: { completed: false },
    })
    routeQuery.refetch()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            onClick={() => navigate('/routes')}
            className="flex items-center gap-1 text-body-sm text-slate hover:text-cyan transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar às rotas
          </button>
          <h1 className="font-heading text-h2 text-white truncate">{route.name}</h1>
          {route.description && (
            <p className="text-body text-slate mt-1">{route.description}</p>
          )}
        </div>
        <Badge
          variant={
            route.status === 'completed'
              ? 'success'
              : route.status === 'active'
                ? 'warning'
                : 'default'
          }
        >
          {route.status === 'completed'
            ? 'Completa'
            : route.status === 'active'
              ? 'Ativa'
              : 'Rascunho'}
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card className="liquid-glass" noPadding>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-cyan" />
              <h2 className="font-heading text-h3 text-white">Progresso</h2>
            </div>
            <span className="text-body-sm text-slate font-mono">
              {completedCount} de {totalCount} marcos
            </span>
          </div>
          <Progress value={route.progress_percentage} showLabel />
        </div>
      </Card>

      {/* Milestones List */}
      <div className="space-y-3">
        <h2 className="font-heading text-h3 text-white">Marcos da Rota</h2>
        {sortedMilestones.map((milestone, index) => {
          const isInteractive = canInteract(milestone)
          const isLocked = milestone.status === 'locked'

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={[
                  'liquid-glass transition-all',
                  isInteractive ? 'hover:border-cyan/30 cursor-pointer' : '',
                  isLocked ? 'opacity-60' : '',
                  selectedMilestone?.id === milestone.id ? 'border-cyan/50 ring-1 ring-cyan/20' : '',
                ].join(' ')}
                noPadding
              >
                <div
                  className="p-5"
                  onClick={() => {
                    if (!isLocked) setSelectedMilestone(
                      selectedMilestone?.id === milestone.id ? null : milestone
                    )
                  }}
                >
                  {/* Milestone Header */}
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      {getMilestoneIcon(milestone)}
                      {index < sortedMilestones.length - 1 && (
                        <div className="w-px h-8 bg-white/10 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-body font-semibold text-white truncate">
                            {milestone.title}
                          </h3>
                          {milestone.description && (
                            <p className="text-body-sm text-slate mt-1 line-clamp-2">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={statusVariants[milestone.status || 'available']}>
                          {statusLabels[milestone.status || 'available']}
                        </Badge>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {milestone.category && (
                          <div className="flex items-center gap-1 text-body-sm text-slate">
                            <Tag className="w-3.5 h-3.5" />
                            {categoryLabels[milestone.category] || milestone.category}
                          </div>
                        )}
                        {milestone.estimated_days && (
                          <div className="flex items-center gap-1 text-body-sm text-slate">
                            <Clock className="w-3.5 h-3.5" />
                            ~{milestone.estimated_days} dias
                          </div>
                        )}
                        {milestone.target_date && (
                          <div className="flex items-center gap-1 text-body-sm text-slate">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(milestone.target_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        {milestone.required_evidence && milestone.required_evidence.length > 0 && (
                          <div className="flex items-center gap-1 text-body-sm text-slate">
                            <FileText className="w-3.5 h-3.5" />
                            {milestone.required_evidence.length} evidência(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedMilestone?.id === milestone.id && !isLocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 ml-9 space-y-4"
                    >
                      {/* Required Evidence */}
                      {milestone.required_evidence && milestone.required_evidence.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-body-sm font-semibold text-silver">
                            Evidências Necessárias
                          </h4>
                          <ul className="space-y-1">
                            {milestone.required_evidence.map((ev, i) => (
                              <li key={i} className="flex items-center gap-2 text-body-sm text-slate">
                                <FileText className="w-3.5 h-3.5 text-cyan" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* User Notes */}
                      {milestone.user_notes && (
                        <div className="space-y-1">
                          <h4 className="text-body-sm font-semibold text-silver flex items-center gap-1">
                            <StickyNote className="w-3.5 h-3.5" />
                            Notas
                          </h4>
                          <p className="text-body-sm text-slate">{milestone.user_notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {isInteractive && !milestone.completed && (
                        <div className="flex items-center gap-3 pt-2">
                          <Button
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              setShowCompleteModal(true)
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Marcar como Concluído
                          </Button>
                          {milestone.status === 'available' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                handleStartMilestone(milestone)
                              }}
                            >
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>
                      )}

                      {milestone.completed && milestone.completed_at && (
                        <p className="text-body-sm text-success">
                          Concluído em{' '}
                          {new Date(milestone.completed_at).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Complete Milestone Modal */}
      <Modal
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false)
          setCompletionNotes('')
        }}
        title={`Concluir: ${selectedMilestone?.title || ''}`}
      >
        <div className="space-y-4">
          <p className="text-body text-slate">
            Confirme a conclusão deste marco. Adicione notas opcionais sobre o que foi feito.
          </p>
          <Textarea
            label="Notas de conclusão (opcional)"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="O que você fez para completar este marco?"
          />
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleCompleteMilestone}
              isLoading={updateMilestone.isPending}
              fullWidth
            >
              Confirmar Conclusão
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCompleteModal(false)
                setCompletionNotes('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
