import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useConstraintProfile, useUpdateConstraintProfile } from '@/hooks/useConstraints';
import { Settings, DollarSign, Globe, BookOpen, Briefcase } from 'lucide-react';

export function ConstraintsSettings() {
  const { data: profile, isLoading, error } = useConstraintProfile();
  const updateProfile = useUpdateConstraintProfile();
  
  const [formData, setFormData] = useState({
    budget_max: '',
    time_available_months: '',
    weekly_bandwidth_hours: '',
    target_countries: '',
    excluded_countries: '',
    education_level: '',
    years_experience: '',
    visa_status: '',
    commitment_level: 'flexible',
    risk_tolerance: 'moderate',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        budget_max: profile.budget_max?.toString() || '',
        time_available_months: profile.time_available_months?.toString() || '',
        weekly_bandwidth_hours: profile.weekly_bandwidth_hours?.toString() || '',
        target_countries: profile.target_countries.join(', '),
        excluded_countries: profile.excluded_countries.join(', '),
        education_level: profile.education_level || '',
        years_experience: profile.years_experience?.toString() || '',
        visa_status: profile.visa_status || '',
        commitment_level: profile.commitment_level,
        risk_tolerance: profile.risk_tolerance,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
      time_available_months: formData.time_available_months ? parseInt(formData.time_available_months) : undefined,
      weekly_bandwidth_hours: formData.weekly_bandwidth_hours ? parseInt(formData.weekly_bandwidth_hours) : undefined,
      target_countries: formData.target_countries.split(',').map(c => c.trim()).filter(c => c),
      excluded_countries: formData.excluded_countries.split(',').map(c => c.trim()).filter(c => c),
      education_level: formData.education_level || undefined,
      years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
      visa_status: formData.visa_status || undefined,
      commitment_level: formData.commitment_level,
      risk_tolerance: formData.risk_tolerance,
    };

    updateProfile.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        Erro ao carregar perfil de restrições. Tente novamente.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-cyan" />
        <div>
          <h1 className="font-heading text-h1 text-white">Configurar Restrições</h1>
          <p className="text-body text-slate mt-1">
            Defina suas preferências para filtrar oportunidades de forma inteligente
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial Constraints */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-white">Restrições Financeiras</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Orçamento Máximo (USD)"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => handleInputChange('budget_max', e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <Input
                  label="Tempo Disponível (meses)"
                  type="number"
                  value={formData.time_available_months}
                  onChange={(e) => handleInputChange('time_available_months', e.target.value)}
                  placeholder="Ex: 24"
                />
              </div>
            </div>
            
            <div>
              <Input
                label="Banda Semanal (horas)"
                type="number"
                value={formData.weekly_bandwidth_hours}
                onChange={(e) => handleInputChange('weekly_bandwidth_hours', e.target.value)}
                placeholder="Ex: 20"
              />
            </div>
          </div>

          {/* Location Constraints */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-white">Preferências de Localização</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Países Preferidos"
                  value={formData.target_countries}
                  onChange={(e) => handleInputChange('target_countries', e.target.value)}
                  placeholder="Ex: US, UK, CA, PT"
                />
                <p className="text-xs text-slate mt-1">
                  Separe por vírgula os códigos dos países
                </p>
              </div>
              <div>
                <Input
                  label="Países Excluídos"
                  value={formData.excluded_countries}
                  onChange={(e) => handleInputChange('excluded_countries', e.target.value)}
                  placeholder="Ex: RU, FR"
                />
                <p className="text-xs text-slate mt-1">
                  Países que você não considera
                </p>
              </div>
            </div>
            
            <div>
              <Input
                label="Status de Visto Atual"
                value={formData.visa_status}
                onChange={(e) => handleInputChange('visa_status', e.target.value)}
                placeholder="Ex: F1, H1B, Tourist"
              />
            </div>
          </div>

          {/* Professional Constraints */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-white">Perfil Profissional</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={formData.education_level}
                  onChange={(value) => handleInputChange('education_level', Array.isArray(value) ? value[0] : value || '')}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: 'high_school', label: 'Ensino Médio' },
                    { value: 'bachelor', label: 'Bacharelado' },
                    { value: 'master', label: 'Mestrado' },
                    { value: 'phd', label: 'Doutorado' },
                  ]}
                />
                <label className="block text-sm font-medium text-slate mb-2">
                  Nível de Educação
                </label>
              </div>
              <div>
                <Input
                  label="Anos de Experiência"
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', e.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
            </div>
          </div>

          {/* Commitment & Risk */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-white">Compromisso e Risco</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={formData.commitment_level}
                  onChange={(value) => handleInputChange('commitment_level', Array.isArray(value) ? value[0] : value || '')}
                  options={[
                    { value: 'full_time', label: 'Tempo Integral' },
                    { value: 'part_time', label: 'Meio Período' },
                    { value: 'flexible', label: 'Flexível' },
                  ]}
                />
                <label className="block text-sm font-medium text-slate mb-2">
                  Nível de Compromisso
                </label>
              </div>
              <div>
                <Select
                  value={formData.risk_tolerance}
                  onChange={(value) => handleInputChange('risk_tolerance', Array.isArray(value) ? value[0] : value || '')}
                  options={[
                    { value: 'conservative', label: 'Conservador' },
                    { value: 'moderate', label: 'Moderado' },
                    { value: 'aggressive', label: 'Agressivo' },
                  ]}
                />
                <label className="block text-sm font-medium text-slate mb-2">
                  Tolerância ao Risco
                </label>
              </div>
            </div>
          </div>

          {/* Current Profile Status */}
          {profile && (
            <div className="bg-lux/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">Status Atual</h3>
              <div className="flex items-center gap-2">
                <Badge variant={profile.is_active ? 'success' : 'warning'}>
                  {profile.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <span className="text-xs text-slate">
                  Última atualização: {new Date(profile.last_updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={updateProfile.isPending}
              disabled={updateProfile.isPending}
            >
              Salvar Restrições
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      {updateProfile.isSuccess && (
        <Alert variant="success">
          Restrições atualizadas com sucesso! As oportunidades serão filtradas de acordo com suas preferências.
        </Alert>
      )}
    </div>
  );
}
