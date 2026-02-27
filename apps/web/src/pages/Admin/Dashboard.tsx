import { Shield, Users, Activity, Database } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Navigate } from 'react-router-dom'

export function AdminDashboard() {
  const { user } = useAuthStore()

  // Restrict access to SUPER_ADMIN only
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-lumina" />
        <div>
          <h1 className="font-heading text-h1 text-white">Painel Administrativo</h1>
          <p className="text-body text-neutral-300 mt-1">
            Métricas e gerenciamento do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuários"
          value="1,234"
          icon={Users}
          trend="up"
          changeLabel="+12%"
        />
        <StatCard
          title="Usuários Ativos"
          value="856"
          icon={Activity}
          trend="up"
          changeLabel="+8%"
        />
        <StatCard
          title="Total de Aplicações"
          value="3,421"
          icon={Database}
          trend="up"
          changeLabel="+15%"
        />
        <StatCard
          title="Taxa de Sucesso"
          value="68%"
          icon={Activity}
          trend="up"
          changeLabel="+3%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="font-heading text-h3 text-white mb-4">Atividade Recente</h2>
            <div className="space-y-3">
              {[
                { action: 'Novo usuário registrado', time: '5 min atrás' },
                { action: 'Aplicação submetida', time: '12 min atrás' },
                { action: 'Sprint completado', time: '1 hora atrás' },
                { action: 'Avaliação psicológica finalizada', time: '2 horas atrás' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30"
                >
                  <span className="text-body-sm text-white">{item.action}</span>
                  <span className="text-caption text-neutral-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="font-heading text-h3 text-white mb-4">Status do Sistema</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body text-neutral-300">API Status</span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-success text-body-sm">
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-neutral-300">Database</span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-success text-body-sm">
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-neutral-300">Storage</span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-success text-body-sm">
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-neutral-300">AI Services</span>
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-body-sm">
                  Limitado
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
