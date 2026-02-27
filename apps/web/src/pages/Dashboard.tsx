import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress, CircularProgress } from '../components/ui/Progress'
import { Typography } from '../components/ui/Typography'
import {
  BookOpen,
  MessageSquare,
  FolderOpen,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  Compass,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * PRD Phase 2: "The Operating Map"
 * Route-aware dashboard divided into exploration zones.
 *
 * In V0.1 this is a static representation.
 * Future: real-time data from APIs + state-driven layout.
 */

/**
 * Quick action card for navigation.
 */
function QuickAction({
  icon: Icon,
  label,
  description,
  path,
  count,
}: {
  icon: typeof BookOpen
  label: string
  description: string
  path: string
  count?: number
}) {
  const navigate = useNavigate()

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        variant="elevated"
        className="cursor-pointer group h-full"
        onClick={() => navigate(path)}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-lumina/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lumina/20 transition-colors">
            <Icon className="w-5 h-5 text-lumina" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-body font-semibold text-white">
                {label}
              </h3>
              {count !== undefined && (
                <span className="text-caption text-neutral-400 bg-neutral-600/50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>
            <p className="text-body-sm text-neutral-400 mt-0.5">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-lumina transition-colors mt-1" />
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Main Dashboard component — "O Mapa Operacional".
 */
export function Dashboard() {
  const { user } = useAuthStore()
  const firstName = user?.full_name?.split(' ')[0] || 'Explorador'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <Typography variant="h2">
            Olá, {firstName} 👋
          </Typography>
          <Typography variant="body" className="mt-1 text-neutral-300">
            Seu mapa de mobilidade internacional
          </Typography>
        </div>
        <Button variant="secondary" size="sm">
          <Sparkles className="w-4 h-4" />
          Diagnóstico
        </Button>
      </div>

      {/* ── Readiness Overview ── */}
      <Card
        variant="bordered"
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-lumina" />
              <CardTitle className="text-lg">Índice de Prontidão</CardTitle>
            </div>
            <span className="text-caption text-neutral-400">
              Última atualização: —
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <CircularProgress
            value={0}
            size={76}
            color="lumina"
            
          />
          <CircularProgress
            value={0}
            size={76}
            color="success"
            
          />
          <CircularProgress
            value={0}
            size={76}
            color="warning"
            
          />
          <CircularProgress
            value={0}
            size={76}
            color="mirror"
            
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-neutral-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-body-sm text-neutral-200">Rota Ativa</span>
            </div>
            <p className="text-body font-medium text-neutral-400">
              Nenhuma rota selecionada
            </p>
          </div>
          <div className="bg-neutral-800/40 rounded-lg p-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-lumina" />
              <span className="text-body-sm text-neutral-200">Progresso</span>
            </div>
            <Progress value={0} showLabel  size="md" />
          </div>
        </div>
      </Card>

      {/* ── Next Atomic Action ── */}
      <Card variant="elevated" className="border-l-[3px] border-l-lumina relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-lumina/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lumina-200 to-lumina-300 flex items-center justify-center shadow-glow-sm animate-pulse-subtle">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <Typography variant="body" className="font-semibold text-white">
              Próxima Ação Atômica
            </Typography>
            <Typography variant="body-sm" className="text-neutral-300 mt-0.5">
              Complete seu diagnóstico psicológico para desbloquear seu mapa personalizado.
            </Typography>
          </div>
          <Button size="sm">
            Iniciar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* ── Quick Actions Grid ── */}
      <div>
        <Typography variant="h3" className="mb-4">
          Módulos
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={BookOpen}
            label="Narrativas"
            description="Crie e refine suas cartas de motivação"
            path="/narratives"
          />
          <QuickAction
            icon={MessageSquare}
            label="Entrevistas"
            description="Pratique com simulações inteligentes"
            path="/interviews"
          />
          <QuickAction
            icon={FolderOpen}
            label="Aplicações"
            description="Gerencie suas aplicações ativas"
            path="/applications"
          />
          <QuickAction
            icon={Zap}
            label="Sprints"
            description="Micro-tarefas para manter o ritmo"
            path="/sprints"
          />
        </div>
      </div>
    </div>
  )
}
