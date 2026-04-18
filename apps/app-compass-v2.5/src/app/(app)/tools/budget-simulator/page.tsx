"use client";

import { useState, useMemo } from "react";
import { Calculator, AlertTriangle, Target, CheckCircle } from "lucide-react";
import { Progress, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CountryRequirement {
  country: string;
  visa: string;
  minIncome: number;
  currency: string;
  proofRequired: string[];
  processingTime: string;
  successRate: number;
}

interface UserBudget {
  monthlyIncome: number;
  savings: number;
  currency: string;
  riskTolerance: "low" | "medium" | "high";
}

const COUNTRY_REQUIREMENTS: CountryRequirement[] = [
  {
    country: "Canadá",
    visa: "Express Entry",
    minIncome: 25000,
    currency: "CAD",
    proofRequired: ["Comprovante de renda", "Declaração de impostos", "Extratos bancários"],
    processingTime: "6-8 meses",
    successRate: 85
  },
  {
    country: "Austrália",
    visa: "Skilled Migration",
    minIncome: 30000,
    currency: "AUD",
    proofRequired: ["Comprovante de emprego", "Balanco patrimonial", "Referências profissionais"],
    processingTime: "8-12 meses",
    successRate: 75
  },
  {
    country: "Reino Unido",
    visa: "Skilled Worker",
    minIncome: 35800,
    currency: "GBP",
    proofRequired: ["Contrato de trabalho", "Comprovante de qualificação", "Certificado de patrocínio"],
    processingTime: "3-6 meses",
    successRate: 90
  },
  {
    country: "Alemanha",
    visa: "Blue Card",
    minIncome: 43000,
    currency: "EUR",
    proofRequired: ["Diploma reconhecido", "Contrato de trabalho", "Comprovante de experiência"],
    processingTime: "4-6 meses",
    successRate: 80
  },
  {
    country: "Estados Unidos",
    visa: "H-1B",
    minIncome: 60000,
    currency: "USD",
    proofRequired: ["Patrocínio empregatício", "Grau acadêmico", "Sorteio H-1B"],
    processingTime: "6-12 meses",
    successRate: 35
  }
];

export default function BudgetSimulatorPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [userBudget, setUserBudget] = useState<UserBudget>({
    monthlyIncome: 5000,
    savings: 20000,
    currency: "BRL",
    riskTolerance: "medium"
  });

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const analysis = useMemo(() => {
    if (selectedCountries.length === 0) return null;

    const selected = COUNTRY_REQUIREMENTS.filter(c => selectedCountries.includes(c.country));
    const totalMinSavings = selected.reduce((sum, c) => sum + (c.minIncome * 6), 0);
    const avgSuccessRate = selected.reduce((sum, c) => sum + c.successRate, 0) / selected.length;
    const maxProcessingTime = Math.max(...selected.map(c => parseInt(c.processingTime.split("-")[1])));

    const budgetScore = Math.min(100, (userBudget.savings / totalMinSavings) * 100);
    const incomeScore = Math.min(100, (userBudget.monthlyIncome * 12 / Math.max(...selected.map(c => c.minIncome))) * 100);
    const overallScore = (budgetScore + incomeScore + avgSuccessRate) / 3;

    return {
      totalMinSavings,
      avgSuccessRate,
      maxProcessingTime,
      budgetScore,
      incomeScore,
      overallScore,
      recommendations: generateRecommendations(selected, userBudget)
    };
  }, [selectedCountries, userBudget]);

  const generateRecommendations = (countries: CountryRequirement[], budget: UserBudget) => {
    const recommendations = [];
    
    if (budget.savings < 10000) {
      recommendations.push({
        type: "warning",
        title: "Aumentar poupança",
        message: "Considere aumentar sua reserva de emergência para pelo menos 6 meses de despesas."
      });
    }

    if (budget.monthlyIncome < 3000) {
      recommendations.push({
        type: "info",
        title: "Diversificar renda",
        message: "Explore fontes adicionais de renda para fortalecer seu perfil financeiro."
      });
    }

    const highCostCountries = countries.filter(c => c.minIncome > 40000);
    if (highCostCountries.length > 0 && budget.riskTolerance === "low") {
      recommendations.push({
        type: "alert",
        title: "Alto custo-benefício",
        message: "Os países selecionados exigem investimento significativo. Considere alternativas mais acessíveis."
      });
    }

    return recommendations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-slate-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "moss";
    if (score >= 60) return "gradient";
    return "clay";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="space-y-4">
        <h1 className="font-heading text-h1 text-text-primary flex items-center gap-3">
          <Calculator className="w-8 h-8 text-brand-500" />
          Simulador Financeiro
        </h1>
        <p className="text-body text-text-secondary">
          Analise sua viabilidade financeira para diferentes destinos de mobilidade internacional.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Budget Input */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="font-heading text-h4 text-text-primary mb-4">Seu Perfil Financeiro</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Renda Mensal (BRL)
                </label>
                <input
                  type="number"
                  value={userBudget.monthlyIncome}
                  onChange={(e) => setUserBudget(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Poupança Atual (BRL)
                </label>
                <input
                  type="number"
                  value={userBudget.savings}
                  onChange={(e) => setUserBudget(prev => ({ ...prev, savings: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Tolerância ao Risco
                </label>
                <select
                  value={userBudget.riskTolerance}
                  onChange={(e) => setUserBudget(prev => ({ ...prev, riskTolerance: e.target.value as "low" | "medium" | "high" }))}
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Country Selection */}
          <Card className="p-6">
            <h2 className="font-heading text-h4 text-text-primary mb-4">Selecionar Destinos</h2>
            
            <div className="space-y-3">
              {COUNTRY_REQUIREMENTS.map(country => (
                <div
                  key={country.country}
                  onClick={() => toggleCountry(country.country)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedCountries.includes(country.country)
                      ? "border-brand-500 bg-brand-50"
                      : "border-cream-300 hover:border-cream-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-primary">{country.country}</div>
                      <div className="text-body-sm text-text-secondary">{country.visa}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-text-primary">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: country.currency 
                        }).format(country.minIncome)}
                      </div>
                      <div className="text-body-sm text-text-secondary">
                        {country.successRate}% sucesso
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          {analysis ? (
            <>
              {/* Overall Score */}
              <Card className="p-6">
                <h2 className="font-heading text-h4 text-text-primary mb-6">Análise de Viabilidade</h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-600 mb-2">
                      {analysis.overallScore.toFixed(0)}%
                    </div>
                    <div className="text-body-sm text-text-secondary">Score Geral</div>
                    <Progress 
                      value={analysis.overallScore} 
                      variant={getScoreVariant(analysis.overallScore)}
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-moss-600 mb-2">
                      {analysis.avgSuccessRate.toFixed(0)}%
                    </div>
                    <div className="text-body-sm text-text-secondary">Taxa de Sucesso Média</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-clay-600 mb-2">
                      {analysis.maxProcessingTime}
                    </div>
                    <div className="text-body-sm text-text-secondary">Meses (Máximo)</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibilidade Orçamentária</span>
                      <span className={getScoreColor(analysis.budgetScore)}>
                        {analysis.budgetScore.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={analysis.budgetScore} 
                      variant={getScoreVariant(analysis.budgetScore) as "moss" | "clay" | "gradient"}
                      size="sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibilidade de Renda</span>
                      <span className={getScoreColor(analysis.incomeScore)}>
                        {analysis.incomeScore.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={analysis.incomeScore} 
                      variant={getScoreVariant(analysis.incomeScore)}
                      size="sm"
                    />
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-heading text-h4 text-text-primary mb-4">Recomendações</h3>
                  
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className={cn(
                        "p-4 rounded-lg border",
                        rec.type === "warning" && "border-slate-200 bg-slate-50",
                        rec.type === "alert" && "border-red-200 bg-red-50",
                        rec.type === "info" && "border-blue-200 bg-blue-50"
                      )}>
                        <div className="flex items-start gap-3">
                          {rec.type === "warning" && <AlertTriangle className="w-5 h-5 text-slate-600 mt-0.5" />}
                          {rec.type === "alert" && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
                          {rec.type === "info" && <Target className="w-5 h-5 text-blue-600 mt-0.5" />}
                          
                          <div>
                            <div className="font-medium text-text-primary mb-1">{rec.title}</div>
                            <div className="text-body-sm text-text-secondary">{rec.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Selected Countries Details */}
              <Card className="p-6">
                <h3 className="font-heading text-h4 text-text-primary mb-4">Detalhes dos Destinos</h3>
                
                <div className="space-y-4">
                  {COUNTRY_REQUIREMENTS
                    .filter(c => selectedCountries.includes(c.country))
                    .map(country => (
                      <div key={country.country} className="border border-cream-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-heading text-h5 text-text-primary">{country.country}</h4>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-body-sm font-medium text-green-600">
                              {country.successRate}% sucesso
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-body-sm">
                          <div>
                            <span className="font-medium text-text-primary">Renda Mínima:</span>
                            <div className="text-text-secondary">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: country.currency 
                              }).format(country.minIncome)}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">Processamento:</span>
                            <div className="text-text-secondary">{country.processingTime}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <span className="font-medium text-text-primary text-body-sm">Documentos:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {country.proofRequired.map((doc, index) => (
                              <span key={index} className="px-2 py-1 bg-cream-100 text-text-secondary text-xs rounded-full">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Calculator className="w-16 h-16 text-brand-500 mx-auto mb-4" />
              <h3 className="font-heading text-h4 text-text-primary mb-2">
                Selecione Destinos para Análise
              </h3>
              <p className="text-body text-text-secondary">
                Escolha pelo menos um destino para ver sua análise de viabilidade financeira.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
