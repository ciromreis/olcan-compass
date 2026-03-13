"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Brain, Zap, Target, ArrowRight, Share2, X, 
  TrendingUp, AlertTriangle, CheckCircle 
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useNudgeStore, ARCHETYPES } from "@/stores/nudge";

interface NudgeCardProps {
  nudge: {
    id: string;
    type: string;
    title: string;
    message: string;
    actionCta: string;
    actionHref: string;
    shareable: boolean;
  };
  onDismiss: () => void;
  onShare: () => void;
}

function NudgeCard({ nudge, onDismiss, onShare }: NudgeCardProps) {
  const getIcon = () => {
    switch (nudge.type) {
      case "fear_reframe": return <Brain className="w-5 h-5" />;
      case "momentum": return <Zap className="w-5 h-5" />;
      case "achievement": return <Target className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getVariant = () => {
    switch (nudge.type) {
      case "fear_reframe": return "border-blue-200 bg-blue-50";
      case "momentum": return "border-yellow-200 bg-yellow-50";
      case "achievement": return "border-green-200 bg-green-50";
      default: return "border-cream-200 bg-cream-50";
    }
  };

  return (
    <Card className={`p-6 ${getVariant()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-heading text-h5 text-text-primary">{nudge.title}</h3>
            <p className="text-body-sm text-text-secondary mt-1">{nudge.message}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Link href={nudge.actionHref}>
          <Button className="flex-1">
            {nudge.actionCta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        {nudge.shareable && (
          <Button variant="secondary" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function NudgeEnginePage() {
  const { 
    archetype, 
    momentum, 
    nudgeHistory, 
    setArchetype, 
    updateActivity, 
    generateNudge, 
    dismissNudge, 
    shareNudge 
  } = useNudgeStore();
  
  const [pendingNudge, setPendingNudge] = useState<{
    id: string;
    type: string;
    title: string;
    message: string;
    actionCta: string;
    actionHref: string;
    shareable: boolean;
  } | null>(null);

  // Check for inactivity and generate nudges
  useEffect(() => {
    const interval = setInterval(() => {
      updateActivity();
      
      // Generate nudge if user has been inactive
      if (archetype && momentum.inactiveDays >= 5) {
        const nudge = generateNudge();
        if (nudge) {
          setPendingNudge(nudge);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [archetype, momentum.inactiveDays, updateActivity, generateNudge]);

  const handleShareNudge = (nudgeId: string) => {
    const shareUrl = shareNudge(nudgeId);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=550,height=420');
    }
  };

  const handleDismissNudge = (nudgeId: string) => {
    dismissNudge(nudgeId);
    setPendingNudge(null);
  };

  const getMomentumStatus = () => {
    if (momentum.inactiveDays >= 7) return "critical";
    if (momentum.inactiveDays >= 3) return "warning";
    return "active";
  };

  const getStatusColor = () => {
    const status = getMomentumStatus();
    switch (status) {
      case "critical": return "text-red-600";
      case "warning": return "text-yellow-600";
      case "active": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    const status = getMomentumStatus();
    switch (status) {
      case "critical": return <AlertTriangle className="w-5 h-5" />;
      case "warning": return <Zap className="w-5 h-5" />;
      case "active": return <CheckCircle className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    const status = getMomentumStatus();
    switch (status) {
      case "critical": return "Crítico";
      case "warning": return "Atenção";
      case "active": return "Ativo";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-text-primary flex items-center gap-3">
            <Brain className="w-8 h-8 text-brand-500" />
            Motor de Comportamento
          </h1>
          <p className="text-body text-text-secondary mt-1">
            {archetype?.name || "Selecione seu arquétipo"} • Mantenha seu momentum para alcançar seus objetivos
          </p>
        </div>
      </div>

      {/* Pending Nudge */}
      {pendingNudge && (
        <NudgeCard
          nudge={pendingNudge}
          onDismiss={() => handleDismissNudge(pendingNudge.id)}
          onShare={() => handleShareNudge(pendingNudge.id)}
        />
      )}

      {!archetype ? (
        // Archetype Selection
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-brand-600" />
            </div>
            
            <div>
              <h2 className="font-heading text-h2 text-text-primary mb-4">
                Descubra seu Arquétipo de Mobilidade
              </h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Seu arquétipo define como você enfrenta desafios e o que te motiva. 
                Escolha o que mais ressoa com você para receber recomendações personalizadas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {ARCHETYPES.map((archetypeOption) => (
                <div
                  key={archetypeOption.id}
                  onClick={() => setArchetype(archetypeOption)}
                  className="p-6 border border-cream-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${archetypeOption.color}`} />
                    <h3 className="font-heading text-h4 text-text-primary">
                      {archetypeOption.name}
                    </h3>
                  </div>
                  <p className="text-body-sm text-text-secondary mb-3">
                    {archetypeOption.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {archetypeOption.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-cream-100 text-text-secondary text-xs rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        // Main Dashboard
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Momentum Status */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="font-heading text-h4 text-text-primary mb-4">Seu Momentum</h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon()}
                  </div>
                  <div className={`text-2xl font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  <p className="text-caption text-text-secondary">
                    {momentum.inactiveDays} dias inativo
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Sequência atual</span>
                    <span className="font-medium text-text-primary">{momentum.currentStreak} dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Maior sequência</span>
                    <span className="font-medium text-text-primary">{momentum.longestStreak} dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Meta semanal</span>
                    <span className="font-medium text-text-primary">{momentum.weeklyProgress}/{momentum.weeklyGoal}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Archetype Info */}
            <Card className="p-6">
              <h2 className="font-heading text-h4 text-text-primary mb-4">Seu Arquétipo</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${archetype.color}`} />
                  <h3 className="font-heading text-h5 text-text-primary">{archetype.name}</h3>
                </div>
                
                <p className="text-body-sm text-text-secondary">{archetype.description}</p>
                
                <div>
                  <h4 className="font-medium text-text-primary text-sm mb-2">Características</h4>
                  <div className="flex flex-wrap gap-2">
                    {archetype.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary text-sm mb-2">Gatilhos de Medo</h4>
                  <div className="flex flex-wrap gap-2">
                    {archetype.fearTriggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Nudge History */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-heading text-h4 text-text-primary mb-6">Histórico de Nudges</h2>
              
              {nudgeHistory.length > 0 ? (
                <div className="space-y-4">
                  {nudgeHistory.slice(-10).reverse().map((nudge) => (
                    <div
                      key={nudge.id}
                      className={`p-4 rounded-lg border ${
                        nudge.type === "fear_reframe" ? "border-blue-200 bg-blue-50" :
                        nudge.type === "momentum" ? "border-yellow-200 bg-yellow-50" :
                        nudge.type === "achievement" ? "border-green-200 bg-green-50" :
                        "border-cream-200 bg-cream-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-heading text-h5 text-text-primary mb-1">
                            {nudge.title}
                          </h3>
                          <p className="text-body-sm text-text-secondary mb-2">
                            {nudge.message}
                          </p>
                          <div className="flex items-center gap-4 text-caption text-text-muted">
                            <span>{new Date(nudge.timestamp).toLocaleDateString('pt-BR')}</span>
                            {nudge.dismissed && <span>• Dispensado</span>}
                            {nudge.shared && <span>• Compartilhado</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {nudge.type === "fear_reframe" && <Brain className="w-4 h-4 text-blue-600" />}
                          {nudge.type === "momentum" && <Zap className="w-4 h-4 text-yellow-600" />}
                          {nudge.type === "achievement" && <Target className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-heading text-h5 text-text-primary mb-2">
                    Nenhum histórico ainda
                  </h3>
                  <p className="text-body-sm text-text-secondary">
                    Seus nudges aparecerão aqui conforme você interage com a plataforma.
                  </p>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="font-heading text-h4 text-text-primary mb-4">Ações Rápidas</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/opportunities">
                  <Button variant="secondary" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Explorar Oportunidades
                  </Button>
                </Link>
                
                <Link href="/applications">
                  <Button variant="secondary" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Candidaturas
                  </Button>
                </Link>
                
                <Link href="/routes">
                  <Button variant="secondary" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Planejar Rota
                  </Button>
                </Link>
                
                <Link href="/community">
                  <Button variant="secondary" className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Conectar Comunidade
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
