"use client";

import { useState, useMemo } from "react";
import { 
  Users, TrendingUp, AlertTriangle, Target,
  Building2, Award, Globe,
  Filter, Download
} from "lucide-react";
import { Button, Card, Progress } from "@/components/ui";

interface CohortMetrics {
  id: string;
  name: string;
  institution: string;
  totalUsers: number;
  activeUsers: number;
  avgReadiness: number;
  avgProgress: number;
  dropoffRate: number;
  topCountries: string[];
  riskFactors: Array<{
    dimension: string;
    riskLevel: number;
    priority: "high" | "medium" | "low";
    recommendation: string;
  }>;
}

// Cohort data will be loaded from the org API when the institutional backend is connected.
// Until then, the page renders an empty state prompting configuration.

export default function InstitutionalDashboardPage() {
  const [cohorts] = useState<CohortMetrics[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("6months");
  const [showRiskDetails, setShowRiskDetails] = useState(false);

  const selectedCohortData = useMemo(() => {
    return selectedCohort
      ? cohorts.find(c => c.id === selectedCohort)
      : null;
  }, [selectedCohort, cohorts]);

  const aggregatedMetrics = useMemo(() => {
    if (cohorts.length === 0) {
      return { totalUsers: 0, activeUsers: 0, avgReadiness: 0, avgProgress: 0, avgDropoff: 0, activationRate: 0 };
    }
    const totalUsers = cohorts.reduce((sum, c) => sum + c.totalUsers, 0);
    const activeUsers = cohorts.reduce((sum, c) => sum + c.activeUsers, 0);
    const avgReadiness = cohorts.reduce((sum, c) => sum + c.avgReadiness, 0) / cohorts.length;
    const avgProgress = cohorts.reduce((sum, c) => sum + c.avgProgress, 0) / cohorts.length;
    const avgDropoff = cohorts.reduce((sum, c) => sum + c.dropoffRate, 0) / cohorts.length;

    return {
      totalUsers,
      activeUsers,
      avgReadiness,
      avgProgress,
      avgDropoff,
      activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }, [cohorts]);

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 35) return "text-red-600";
    if (riskLevel >= 25) return "text-slate-600";
    return "text-green-600";
  };

  const getRiskVariant = (riskLevel: number) => {
    if (riskLevel >= 35) return "clay";
    if (riskLevel >= 25) return "amber";
    return "moss";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low" | string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-slate-600 bg-slate-50 border-slate-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-text-primary flex items-center gap-3">
            <Building2 className="w-8 h-8 text-brand-500" />
            Dashboard Institucional
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Analytics e insights para mobilidade internacional
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="1month">Último Mês</option>
            <option value="3months">Últimos 3 Meses</option>
            <option value="6months">Últimos 6 Meses</option>
            <option value="1year">Último Ano</option>
          </select>
          
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-brand-500" />
            <span className="text-body-sm text-text-secondary">Total de Usuários</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{aggregatedMetrics.totalUsers}</div>
          <div className="text-caption text-text-muted">Across all cohorts</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-body-sm text-text-secondary">Ativos</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{aggregatedMetrics.activeUsers}</div>
          <div className="text-caption text-text-muted">{aggregatedMetrics.activationRate.toFixed(1)}% ativação</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-moss-500" />
            <span className="text-body-sm text-text-secondary">Readiness Médio</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{aggregatedMetrics.avgReadiness.toFixed(0)}%</div>
          <div className="text-caption text-text-muted">Score de preparação</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-blue-500" />
            <span className="text-body-sm text-text-secondary">Progresso Médio</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{aggregatedMetrics.avgProgress.toFixed(0)}%</div>
          <div className="text-caption text-text-muted">Caminho percorrido</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-body-sm text-text-secondary">Dropoff Rate</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{aggregatedMetrics.avgDropoff.toFixed(1)}%</div>
          <div className="text-caption text-text-muted">Taxa de abandono</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cohorts List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h2 className="font-heading text-h4 text-text-primary mb-4">Cohorts</h2>
            
            <div className="space-y-3">
              {cohorts.map(cohort => (
                <div
                  key={cohort.id}
                  onClick={() => setSelectedCohort(cohort.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCohort === cohort.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-cream-300 hover:border-cream-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-h5 text-text-primary">{cohort.name}</h3>
                    <div className="text-caption text-text-muted">{cohort.totalUsers} users</div>
                  </div>
                  
                  <div className="text-body-sm text-text-secondary mb-3">{cohort.institution}</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Readiness</span>
                      <span className="font-medium text-text-primary">{cohort.avgReadiness}%</span>
                    </div>
                    <Progress value={cohort.avgReadiness} variant="moss" size="sm" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Progresso</span>
                      <span className="font-medium text-text-primary">{cohort.avgProgress}%</span>
                    </div>
                    <Progress value={cohort.avgProgress} variant="gradient" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Cohort Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCohortData ? (
            <>
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-h4 text-text-primary mb-2">{selectedCohortData.name}</h3>
                    <p className="text-body text-text-secondary">{selectedCohortData.institution}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-cream-50 rounded-lg">
                      <div className="text-h3 font-bold text-brand-600">{selectedCohortData.totalUsers}</div>
                      <p className="text-caption text-text-muted">Total</p>
                    </div>
                    <div className="text-center p-3 bg-cream-50 rounded-lg">
                      <div className="text-h3 font-bold text-moss-600">{selectedCohortData.activeUsers}</div>
                      <p className="text-caption text-text-muted">Ativos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-heading text-h5 text-text-primary">Top Destinos</h4>
                    {selectedCohortData.topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-body-sm text-text-secondary flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {country}
                        </span>
                        <span className="text-caption text-text-muted">
                          Top {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Risk Factors */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-h4 text-text-primary">Fatores de Risco</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowRiskDetails(!showRiskDetails)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showRiskDetails ? "Simplificar" : "Detalhes"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedCohortData.riskFactors.map((risk, index) => (
                    <div key={index} className="border border-cream-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading text-h5 text-text-primary">{risk.dimension}</h4>
                        <span className={`text-sm font-medium ${getRiskColor(risk.riskLevel)}`}>
                          {risk.riskLevel}% afetados
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <Progress 
                          value={risk.riskLevel} 
                          variant={getRiskVariant(risk.riskLevel) as "moss" | "clay" | "gradient"}
                          size="sm"
                          className="flex-1"
                        />
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(risk.priority)}`}>
                          {risk.priority}
                        </span>
                      </div>
                      <p className="text-body-sm text-text-secondary">{risk.recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Heatmap */}
              <Card className="p-6">
                <h3 className="font-heading text-h4 text-text-primary mb-4">Mapa de Calor de Riscos</h3>
                
                <div className="grid grid-cols-4 gap-2">
                  {selectedCohortData.riskFactors.length > 0 ? (
                    selectedCohortData.riskFactors.map((risk, index) => {
                      const color = risk.riskLevel >= 35 ? "bg-red-500" : risk.riskLevel >= 25 ? "bg-slate-500" : "bg-green-500";
                      return (
                        <div key={index} className="text-center">
                          <div className={`h-16 rounded ${color}`} style={{ opacity: Math.min(risk.riskLevel / 50, 1) }} />
                          <div className="text-xs text-text-secondary mt-1">{risk.dimension}</div>
                          <div className="text-caption text-text-muted">{risk.riskLevel}%</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-4 text-center text-text-muted text-body-sm py-4">
                      Nenhum fator de risco registrado.
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-heading text-h4 text-text-primary mb-2">
                Selecione uma Cohort
              </h3>
              <p className="text-body text-text-secondary">
                Escolha uma cohort para ver detalhes e analytics específicos.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
