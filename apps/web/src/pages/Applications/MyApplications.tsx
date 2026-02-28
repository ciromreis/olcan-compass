import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Map as MapIcon, Flame, Plus } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { useUIMode } from '@/hooks/useUIMode'
import { ApplicationCard } from '@/components/domain/ApplicationCard'
import type { Application } from '@/components/domain/ApplicationCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'

type ApplicationSummary = Application

export function MyApplications() {
  const navigate = useNavigate()
  const { applications, updateApplication, isLoading, error } = useApplications()
  const { mode, toggleMode } = useUIMode()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar aplicações. Tente novamente.</Alert>
  }

  const nextTask = applications?.find((a: ApplicationSummary) => a.status === 'draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">Minhas Aplicações</h1>
          <p className="text-body text-neutral-300 mt-1">
            Gerencie suas candidaturas e prazos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={toggleMode}
            icon={mode === 'map' ? <Flame className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />} iconPosition="left"
          >
            {mode === 'map' ? 'Modo Forge' : 'Modo Map'}
          </Button>
          <Button
            onClick={() => navigate('/applications/opportunities')}
            icon={<Plus className="w-4 h-4" />} iconPosition="left"
          >
            Nova Aplicação
          </Button>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="liquid-glass">
          <EmptyState
            icon={<Briefcase className="w-12 h-12" />}
            title="Nenhuma aplicação criada"
            description="Explore oportunidades e comece suas candidaturas."
            onAction={() => navigate('/applications/opportunities')}
          />
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {mode === 'forge' && nextTask ? (
            <motion.div
              key="forge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="liquid-glass">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Flame className="w-5 h-5 text-lumina" />
                    <span className="text-body-sm text-lumina font-medium">
                      Modo Forge — Próxima Tarefa
                    </span>
                  </div>
                    <ApplicationCard
                      application={nextTask}
                      onViewDetails={(applicationId) => navigate(`/applications/detail/${applicationId}`)}
                      onUpdateStatus={(applicationId, status) =>
                        updateApplication({ applicationId, status })
                      }
                    />
                    <div className="mt-6 flex gap-3">
                      <Button onClick={() => navigate(`/applications/detail/${nextTask.id}`)}>
                        Continuar Aplicação
                      </Button>
                    <Button variant="ghost" onClick={toggleMode}>
                      Ver Todas
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lumina/5 border border-lumina/20 w-fit">
                <MapIcon className="w-4 h-4 text-lumina" />
                <span className="text-body-sm text-lumina font-medium">Modo Map — Visão Completa</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app: ApplicationSummary, index: number) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ApplicationCard
                      application={app}
                      onViewDetails={(applicationId) => navigate(`/applications/detail/${applicationId}`)}
                      onUpdateStatus={(applicationId, status) =>
                        updateApplication({ applicationId, status })
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
