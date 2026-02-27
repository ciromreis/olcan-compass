import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSprints } from '@/hooks/useSprints'
import { SprintTaskCard } from '@/components/domain/SprintTaskCard'
import type { SprintTask } from '@/components/domain/SprintTaskCard'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

type SprintDetailData = {
  name: string
  description?: string
  tasks?: SprintTask[]
}

export function SprintDetail() {
  const { id } = useParams<{ id: string }>()
  const { getSprint } = useSprints()

  const sprintQuery = getSprint(id ?? '')
  const sprint = sprintQuery?.data as SprintDetailData | undefined

  if (sprintQuery?.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (sprintQuery?.error || !sprint) {
    return <Alert variant="error">Erro ao carregar sprint. Tente novamente.</Alert>
  }

  const completedTasks = sprint?.tasks?.filter((t: SprintTask) => t.completed).length || 0
  const totalTasks = sprint?.tasks?.length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">{sprint.name}</h1>
        <p className="text-body text-neutral-300 mt-1">{sprint.description}</p>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body text-white">Progresso Geral</span>
            <span className="text-body-sm text-neutral-400">
              {completedTasks} de {totalTasks} tarefas
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-heading text-h3 text-white">Tarefas</h2>
        {sprint.tasks?.map((task: SprintTask, index: number) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <SprintTaskCard
              task={task}
              allTasks={sprint.tasks || []}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
