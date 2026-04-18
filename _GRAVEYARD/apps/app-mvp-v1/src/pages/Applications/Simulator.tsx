import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useScenarios } from '@/hooks/useScenarios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  Sliders,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  Sparkles,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ScenarioSimulator - Página de simulação de cenários com fronteira viável
 * 
 * Funcionalidades:
 * - Scatter plot interativo (competitividade vs recursos)
 * - Sliders de constraints (budget, tempo, skills)
 * - Multi-select para localizações e indústrias
 * - Recálculo em tempo real com debouncing (via useScenarios)
 * - Destaque de oportunidades Pareto-ótimas
 * - Explicações e sugestões em português
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export const Simulator: React.FC = () => {
  const navigate = useNavigate();
  const {
    constraints,
    updateConstraint,
    resetConstraints,
    paretoOptimal,
    paretoCount,
    totalOpportunitiesAnalyzed,
    isCalculating,
  } = useScenarios();

  // Available options for multi-selects
  const availableLocations = ['USA', 'Canadá', 'Reino Unido', 'Alemanha', 'Austrália', 'Portugal', 'Espanha'];
  const availableIndustries = ['Tecnologia', 'Pesquisa', 'Educação', 'Saúde', 'Finanças', 'Engenharia'];

  // Toggle location selection
  const toggleLocation = (location: string) => {
    const current = constraints.target_locations || [];
    const updated = current.includes(location)
      ? current.filter((l) => l !== location)
      : [...current, location];
    updateConstraint('target_locations', updated);
  };

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    const current = constraints.preferred_industries || [];
    const updated = current.includes(industry)
      ? current.filter((i) => i !== industry)
      : [...current, industry];
    updateConstraint('preferred_industries', updated);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare data for scatter chart
  const chartData = paretoOptimal.map((opp) => ({
    x: opp.resource_requirements_score,
    y: opp.competitiveness_score,
    title: opp.title,
    id: opp.opportunity_id,
    isPareto: opp.is_pareto_optimal,
  }));

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="liquid-glass border border-white/10 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-white mb-2">
            {data.title}
          </p>
          <div className="space-y-1 text-xs text-slate">
            <p>Competitividade: {data.y}%</p>
            <p>Recursos Necessários: {data.x}%</p>
          </div>
          {data.isPareto && (
            <Badge variant="success" size="sm" className="mt-2">
              Pareto-Ótima
            </Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/applications/opportunities')}
            className="mb-2 text-slate hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Oportunidades</span>
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Simulador de Cenários
          </h1>
          <p className="text-slate mt-2">
            Explore oportunidades otimizadas baseadas em suas restrições e objetivos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Constraints */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sliders className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-white">
                Suas Restrições
              </h2>
            </div>

            <div className="space-y-6">
              {/* Budget Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Orçamento Máximo
                  </label>
                  <span className="text-sm font-semibold text-cyan">
                    {formatCurrency(constraints.budget_max)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={constraints.budget_max}
                  onChange={(e) => updateConstraint('budget_max', Number(e.target.value))}
                  className="w-full h-2 bg-void-primary/30 rounded-lg appearance-none cursor-pointer accent-cyan"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>R$ 10k</span>
                  <span>R$ 200k</span>
                </div>
              </div>

              {/* Time Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tempo Disponível
                  </label>
                  <span className="text-sm font-semibold text-cyan">
                    {constraints.time_available_months} meses
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="36"
                  step="1"
                  value={constraints.time_available_months}
                  onChange={(e) => updateConstraint('time_available_months', Number(e.target.value))}
                  className="w-full h-2 bg-void-primary/30 rounded-lg appearance-none cursor-pointer accent-cyan"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>3 meses</span>
                  <span>36 meses</span>
                </div>
              </div>

              {/* Skill Level Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Nível de Habilidade
                  </label>
                  <span className="text-sm font-semibold text-cyan">
                    {constraints.skill_level}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={constraints.skill_level}
                  onChange={(e) => updateConstraint('skill_level', Number(e.target.value))}
                  className="w-full h-2 bg-void-primary/30 rounded-lg appearance-none cursor-pointer accent-cyan"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Iniciante</span>
                  <span>Avançado</span>
                </div>
              </div>

              {/* Locations Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localizações Alvo
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                        constraints.target_locations?.includes(location)
                          ? 'bg-primary-blue/10 text-cyan border-cyan/30'
                          : 'bg-void-primary/20 text-slate border-white/10 hover:border-cyan/30'
                      )}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industries Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Indústrias Preferidas
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableIndustries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                        constraints.preferred_industries?.includes(industry)
                          ? 'bg-primary-blue/10 text-cyan border-cyan/30'
                          : 'bg-void-primary/20 text-slate border-white/10 hover:border-cyan/30'
                      )}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={resetConstraints}
                className="w-full"
              >
                Redefinir Restrições
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Results Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Fronteira Viável
                </h3>
                <p className="text-sm text-slate mt-1">
                  {isCalculating
                    ? 'Calculando oportunidades ótimas...'
                    : `${paretoCount} oportunidades Pareto-ótimas de ${totalOpportunitiesAnalyzed} analisadas`}
                </p>
              </div>
              {paretoCount > 0 && (
                <Badge variant="success" size="lg">
                  <Sparkles className="w-4 h-4" />
                  <span>{paretoCount} Ótimas</span>
                </Badge>
              )}
            </div>
          </Card>

          {/* Scatter Plot */}
          <Card className="p-6">
            <div className="space-y-4">
              {isCalculating ? (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full mx-auto" />
                    <p className="text-sm text-slate">
                      Calculando fronteira viável...
                    </p>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={500}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Recursos Necessários"
                        unit="%"
                        domain={[0, 100]}
                        label={{
                          value: 'Recursos Necessários (%)',
                          position: 'insideBottom',
                          offset: -10,
                          style: { fill: '#6B7280', fontSize: 12 },
                        }}
                        stroke="#9CA3AF"
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Competitividade"
                        unit="%"
                        domain={[0, 100]}
                        label={{
                          value: 'Competitividade (%)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: '#6B7280', fontSize: 12 },
                        }}
                        stroke="#9CA3AF"
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={() => (
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-cyan" />
                              <span className="text-xs text-slate">
                                Pareto-Ótimas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-neutral-400" />
                              <span className="text-xs text-slate">
                                Outras Oportunidades
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      <Scatter data={chartData} fill="#3B82F6">
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isPareto ? '#3B82F6' : '#9CA3AF'}
                            fillOpacity={entry.isPareto ? 1 : 0.5}
                            r={entry.isPareto ? 8 : 5}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>

                  {/* Explanation */}
                  <div className="p-4 bg-primary-blue/5 border border-cyan/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">
                          Estas oportunidades oferecem o melhor equilíbrio entre competitividade e recursos necessários
                        </p>
                        <p className="text-xs text-slate leading-relaxed">
                          Oportunidades Pareto-ótimas (em azul) são aquelas onde nenhuma outra opção oferece
                          simultaneamente maior competitividade e menores requisitos de recursos. Focar nestas
                          oportunidades maximiza suas chances de sucesso.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Sparkles className="w-12 h-12 text-slate mx-auto" />
                    <p className="text-sm text-slate">
                      Ajuste suas restrições para ver oportunidades viáveis
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Pareto-Optimal Opportunities List */}
          {paretoOptimal.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Oportunidades Recomendadas
              </h3>
              <div className="space-y-3">
                {paretoOptimal.slice(0, 5).map((opp, index) => (
                  <motion.div
                    key={opp.opportunity_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 liquid-glass border border-white/10 rounded-lg hover:border-cyan/30 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          {opp.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate">
                          <span>Competitividade: {opp.competitiveness_score}%</span>
                          <span>•</span>
                          <span>Recursos: {opp.resource_requirements_score}%</span>
                        </div>
                      </div>
                      {opp.is_pareto_optimal && (
                        <Badge variant="success" size="sm">
                          Ótima
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
