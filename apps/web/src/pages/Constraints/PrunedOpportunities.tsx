import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePrunedOpportunities } from '@/hooks/useConstraints';
import { 
  Filter, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Info
} from 'lucide-react';

export function PrunedOpportunities() {
  const { data: pruningResult, isLoading, error, refetch } = usePrunedOpportunities();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Erro ao carregar oportunidades filtradas. Tente novamente.
      </Alert>
    );
  }

  if (!pruningResult) {
    return null;
  }

  const { opportunities, total_opportunities, shown_opportunities, hidden_opportunities } = pruningResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-6 h-6 text-lumina-500" />
          <div>
            <h1 className="font-heading text-h1 text-white">Oportunidades Filtradas</h1>
            <p className="text-body text-neutral-300 mt-1">
              Baseado nas suas restrições pessoais
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lumina-100 rounded-lg">
              <Filter className="w-5 h-5 text-lumina-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total de Oportunidades</p>
              <p className="text-xl font-bold text-white">{total_opportunities}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <Eye className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Visíveis</p>
              <p className="text-xl font-bold text-white">{shown_opportunities}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <EyeOff className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Ocultas</p>
              <p className="text-xl font-bold text-white">{hidden_opportunities}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pruning Explanation */}
      {hidden_opportunities > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">
            {hidden_opportunities} oportunidades foram ocultadas por não corresponderem às suas restrições. 
            Isso reduz a sobrecarga de informações e foca no que é relevante para você.
          </span>
        </Alert>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <PrunedOpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>

      {opportunities.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhuma oportunidade encontrada
            </h3>
            <p className="text-neutral-400">
              Ajuste suas restrições para ver mais oportunidades.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface PrunedOpportunityCardProps {
  opportunity: any;
}

function PrunedOpportunityCard({ opportunity }: PrunedOpportunityCardProps) {
  const isPruned = opportunity.is_pruned;
  const explanation = opportunity.explanation;

  return (
    <Card className={`p-6 transition-all duration-200 ${
      isPruned 
        ? 'bg-neutral-800/50 border-neutral-700 opacity-60' 
        : 'bg-neutral-800 border-lumina-500 hover:border-lumina-400'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {opportunity.title}
            </h3>
            {isPruned ? (
              <Badge variant="warning" size="sm">
                <EyeOff className="w-3 h-3 mr-1" />
                Oculta
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                <Eye className="w-3 h-3 mr-1" />
                Visível
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            {opportunity.organization_name && (
              <span>{opportunity.organization_name}</span>
            )}
            {opportunity.location_country && (
              <span>• {opportunity.location_country}</span>
            )}
            <span>• {opportunity.opportunity_type}</span>
          </div>
        </div>
        
        {/* Scores */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-lumina-500" />
              <span className="text-sm font-medium text-white">
                {opportunity.overall_score.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-neutral-400">Score</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <CheckCircle className={`w-4 h-4 ${
                opportunity.constraint_score >= 80 ? 'text-success-500' : 
                opportunity.constraint_score >= 60 ? 'text-warning-500' : 'text-error-500'
              }`} />
              <span className="text-sm font-medium text-white">
                {opportunity.constraint_score.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-neutral-400">Restrições</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className={`p-4 rounded-lg ${
        isPruned 
          ? 'bg-warning-100/10 border border-warning-500/30' 
          : 'bg-success-100/10 border border-success-500/30'
      }`}>
        <div className="flex items-start gap-3">
          {isPruned ? (
            <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
          )}
          
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">
              {explanation.title}
            </h4>
            <p className="text-sm text-neutral-300 mb-2">
              {explanation.detail}
            </p>
            
            {/* Violations */}
            {explanation.violations.length > 0 && (
              <div className="space-y-1">
                {explanation.violations.map((violation: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Badge 
                      variant={
                        violation.severity === 'hard' ? 'error' : 
                        violation.severity === 'soft' ? 'warning' : 'default'
                      } 
                      size="sm"
                    >
                      {violation.type}
                    </Badge>
                    <span className="text-neutral-400">
                      {Object.entries(violation.details)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-700">
        {!isPruned && (
          <Button variant="primary" size="sm">
            Ver Detalhes
          </Button>
        )}
        
        {isPruned && (
          <Button variant="secondary" size="sm">
            Mostrar Mesmo Assim
          </Button>
        )}
        
        <Button variant="ghost" size="sm">
          <Info className="w-4 h-4 mr-1" />
          Entender Filtro
        </Button>
      </div>
    </Card>
  );
}
