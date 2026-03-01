import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress, CircularProgress } from '../components/ui/Progress'
import { Typography } from '../components/ui/Typography'
import { BookOpen, MessageSquare, FolderOpen, Zap, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { usePsychProfile } from '@/hooks/usePsych'
import { useRoutes } from '@/hooks/useRoutes'
import { useSprints } from '@/hooks/useSprints'
import { useUserApplications } from '@/hooks/useApplications'
import { daysUntil, formatDeadline } from '@/lib/utils'
import type { RouteMilestone } from '@/store/route'
import type { Application as ApplicationSummary } from '@/components/domain/ApplicationCard'

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
          <div className="w-10 h-10 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-blue/20 transition-colors">
            <Icon className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-body font-semibold text-white">
                {label}
              </h3>
              {count !== undefined && (
                <span className="metric-badge">
                  {count}
                </span>
              )}
            </div>
            <p className="text-body-sm text-slate mt-0.5">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate group-hover:text-cyan transition-colors mt-1" />
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Main Dashboard component — "O Mapa Operacional".
 */
export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const firstName = user?.full_name?.split(' ')[0] || 'Explorador'
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  const psychProfileQuery = usePsychProfile()
  const routes = useRoutes()
  const sprints = useSprints()
  const applicationsQuery = useUserApplications()

  const activeRoute = routes.routes?.find((r) => r.status === 'active') ?? null
  const nextMilestone =
    activeRoute?.milestones?.find((m: RouteMilestone) => !m.completed) ?? activeRoute?.milestones?.[0] ?? null

  const readinessScore = sprints.readinessOverview?.latest_assessment?.overall_readiness

  const nextDeadline = (() => {
    const items = (applicationsQuery.data || []) as ApplicationSummary[]
    const withDeadline = items.filter((a: ApplicationSummary) => !!a.deadline).sort((a: ApplicationSummary, b: ApplicationSummary) => {
      return daysUntil(a.deadline!) - daysUntil(b.deadline!)
    })
    return withDeadline[0] || null
  })()

  const chips = (() => {
    const profile = psychProfileQuery.data
    if (!profile) return null
    const confidence = Math.round(profile.agency_score ?? profile.extraversion ?? 50)
    const anxiety = Math.round(profile.anxiety_score ?? profile.neuroticism ?? 50)
    const discipline = Math.round(profile.conscientiousness ?? 50)
    const insight =
      discipline >= 70 && anxiety >= 60
        ? 'Disciplina alta com ansiedade ativa: avance em passos curtos e verificáveis.'
        : discipline >= 70
          ? 'Boa disciplina: mantenha o ritmo e feche lacunas pequenas.'
          : confidence >= 70
            ? 'Boa confiança: transforme impulso em entregas mensuráveis.'
            : 'Ajuste o sistema para reduzir fricção: pequenas vitórias primeiro.'
    return { confidence, anxiety, discipline, insight }
  })()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="h2">
            {greeting}, {firstName}
          </Typography>
          <Typography variant="body" className="mt-1 text-slate">
            Seu painel de execução — sem ruído, só sinal.
          </Typography>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/psychology')}
          icon={<MaterialSymbol name="insights" size={18} />}
          iconPosition="left"
        >
          Diagnóstico
        </Button>
      </div>

      {/* ── Estado Hoje ── */}
      <Card className="liquid-glass">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MaterialSymbol name="monitor_heart" size={20} className="text-cyan" />
              <CardTitle className="text-lg">Seu estado hoje</CardTitle>
            </div>
            <p className="text-body-sm text-slate mt-1">
              {chips?.insight || 'Carregando o seu perfil…'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Confiança', value: chips?.confidence, icon: 'trending_up' },
            { label: 'Ansiedade', value: chips?.anxiety, icon: 'bolt' },
            { label: 'Disciplina', value: chips?.discipline, icon: 'check_circle' },
          ].map((item) => (
            <div
              key={item.label}
              className="stat-panel"
            >
              <div className="flex items-center justify-between">
                <p className="text-caption text-slate">{item.label}</p>
                <MaterialSymbol name={item.icon} size={18} className="text-cyan" />
              </div>
              <p className="mt-2 text-body font-semibold text-white font-mono">
                {typeof item.value === 'number' ? `${item.value}/100` : '—'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Rota ativa ── */}
      <Card className="liquid-glass">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MaterialSymbol name="map" size={20} className="text-cyan" />
              <CardTitle className="text-lg">Rota ativa</CardTitle>
            </div>
            <p className="text-body-sm text-slate mt-1 truncate">
              {activeRoute ? activeRoute.name : 'Nenhuma rota ativa.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(activeRoute ? '/routes' : '/routes/templates')}
            icon={<MaterialSymbol name="arrow_forward" size={18} />}
            iconPosition="right"
          >
            {activeRoute ? 'Retomar' : 'Explorar'}
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-body-sm text-slate">
            <span>Progresso</span>
            <span className="font-mono">{Math.round(activeRoute?.progress_percentage || 0)}%</span>
          </div>
          <Progress value={activeRoute?.progress_percentage || 0} />

          {nextMilestone && (
            <div className="stat-panel">
              <p className="text-caption text-slate">Próximo passo</p>
              <p className="text-body font-semibold text-white mt-1">
                {nextMilestone.title}
              </p>
              {nextMilestone.description && (
                <p className="text-body-sm text-slate mt-1 line-clamp-2">
                  {nextMilestone.description}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── Readiness Snapshot ── */}
      <Card className="liquid-glass">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MaterialSymbol name="radar" size={20} className="text-cyan" />
              <CardTitle className="text-lg">Readiness</CardTitle>
            </div>
            <p className="text-body-sm text-slate mt-1">
              Visão rápida: gaps, urgências e tendência.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/sprints')}>
            Ver radar
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          <div className="flex items-center gap-4 stat-panel">
            <CircularProgress value={typeof readinessScore === 'number' ? readinessScore : 0} size={64} color="lumina" />
            <div>
              <p className="text-caption text-slate">Score</p>
              <p className="text-body font-semibold text-white font-mono">
                {typeof readinessScore === 'number' ? `${Math.round(readinessScore)}/100` : '—'}
              </p>
            </div>
          </div>
          <div className="stat-panel">
            <p className="text-caption text-slate">Gaps abertos</p>
            <p className="mt-2 text-body font-semibold text-white font-mono">
              {sprints.readinessOverview?.open_gaps ?? '—'}
            </p>
            <p className="text-body-sm text-slate mt-1">
              Críticos: {sprints.readinessOverview?.critical_gaps ?? '—'}
            </p>
          </div>
          <div className="stat-panel">
            <p className="text-caption text-slate">Tarefas urgentes</p>
            <p className="mt-2 text-body font-semibold text-white font-mono">
              {sprints.readinessOverview?.urgent_tasks?.length ?? '—'}
            </p>
            <p className="text-body-sm text-slate mt-1">
              Sprints ativas: {sprints.readinessOverview?.active_sprints ?? '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Próximo prazo ── */}
      {nextDeadline && (
        <Card variant="elevated" className="liquid-glass border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <MaterialSymbol name="timer" size={22} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-body font-semibold text-white">Próximo prazo</p>
              <p className="text-body-sm text-slate mt-0.5">
                {nextDeadline.opportunity_name} • {nextDeadline.institution || '—'} •{' '}
                {nextDeadline.deadline ? formatDeadline(nextDeadline.deadline) : '—'}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/applications/my-applications')}>
              Abrir
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* ── Next Atomic Action ── */}
      <Card variant="elevated" className="liquid-glass relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-cyan/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
            <MaterialSymbol name="magic_button" size={22} className="text-cyan" />
          </div>
          <div className="flex-1">
            <Typography variant="body" className="font-semibold text-white">
              Próxima ação
            </Typography>
            <Typography variant="body-sm" className="text-slate mt-0.5">
              {activeRoute ? 'Retome a rota e feche o próximo marco.' : 'Escolha um template para iniciar sua rota.'}
            </Typography>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(activeRoute ? '/routes' : '/routes/templates')}
          >
            {activeRoute ? 'Retomar' : 'Começar'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* ── Quick Actions Grid ── */}
      <div>
        <Typography variant="h3" className="mb-4">
          Ações rápidas
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
