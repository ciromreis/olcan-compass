"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  User, 
  Briefcase, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useAuthStore } from "@/stores/auth";
import { useHydration } from "@/hooks";
import { Button, Input, Textarea, Select, useToast } from "@/components/ui";
import { ServiceCategory, CATEGORY_LABELS } from "@/stores/canonicalMarketplaceProviderStore";

const STEPS = [
  { id: 1, name: "Perfil", icon: User },
  { id: 2, name: "Especialização", icon: Briefcase },
  { id: 3, name: "Primeiro Serviço", icon: DollarSign },
  { id: 4, name: "Concluído", icon: CheckCircle },
];

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ServiceCategory[];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { 
    myProviderProfile, 
    updateMyProviderProfile, 
    createService,
    fetchMyProviderProfile 
  } = useMarketplaceStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile
  const [profileData, setProfileData] = useState({
    headline: "",
    bio: "",
    currentTitle: "",
    yearsExperience: 0,
  });

  // Step 2: Specialization
  const [specializationData, setSpecializationData] = useState({
    specializations: [] as string[],
    languages: ["pt", "en"],
    availability: "full_time" as "full_time" | "part_time" | "weekends",
  });

  // Step 3: First Service
  const [serviceData, setServiceData] = useState({
    title: "",
    description: "",
    category: "career_coaching" as ServiceCategory,
    price: 150,
    duration: 60,
  });

  useEffect(() => {
    if (hydrated && myProviderProfile) {
      // If already has bio (onboarded), redirect to dashboard
      if (myProviderProfile.bio && myProviderProfile.bio.length > 50) {
        router.push("/provider");
      }
    }
  }, [hydrated, myProviderProfile, router]);

  useEffect(() => {
    if (hydrated) {
      fetchMyProviderProfile();
    }
  }, [hydrated, fetchMyProviderProfile]);

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate profile data
      if (!profileData.headline || !profileData.bio || !profileData.currentTitle) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos do perfil.",
          variant: "warning",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate specialization
      if (specializationData.specializations.length === 0) {
        toast({
          title: "Especialização necessária",
          description: "Selecione pelo menos uma área de especialização.",
          variant: "warning",
        });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save everything and create first service
      setLoading(true);
      try {
        // Update provider profile
        await updateMyProviderProfile({
          headline: profileData.headline,
          bio: profileData.bio,
          current_title: profileData.currentTitle,
          years_experience: profileData.yearsExperience,
          specializations: specializationData.specializations,
          languages_spoken: specializationData.languages,
          availability: specializationData.availability,
        });

        // Create first service
        await createService({
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price,
          currency: "BRL",
          duration: serviceData.duration,
          isActive: true,
        });

        setCurrentStep(4);
      } catch (error) {
        console.error("Onboarding error:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível concluir o cadastro. Tente novamente.",
          variant: "warning",
        });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 4) {
      router.push("/provider");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setSpecializationData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-brand-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? "bg-brand-500 text-white"
                        : "bg-white text-text-muted border-2 border-cream-300"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 font-medium text-text-secondary">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step.id ? "bg-brand-500" : "bg-cream-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="card-surface p-8">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-brand-600" />
                </div>
                <h2 className="font-heading text-h2 text-text-primary mb-2">
                  Complete seu Perfil
                </h2>
                <p className="text-body text-text-secondary">
                  Conte-nos sobre sua experiência profissional
                </p>
              </div>

              <Input
                label="Título Profissional"
                placeholder="Ex: Advogado de Imigração, Coach de Carreira"
                value={profileData.currentTitle}
                onChange={(e) => setProfileData({ ...profileData, currentTitle: e.target.value })}
                required
              />

              <Input
                label="Headline (Resumo em uma linha)"
                placeholder="Ex: Especialista em vistos para Europa com 10 anos de experiência"
                value={profileData.headline}
                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                required
              />

              <Textarea
                label="Biografia"
                placeholder="Conte sua história profissional, experiências relevantes e como você pode ajudar seus clientes..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={5}
                required
              />

              <Input
                label="Anos de Experiência"
                type="number"
                value={profileData.yearsExperience}
                onChange={(e) => setProfileData({ ...profileData, yearsExperience: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          )}

          {/* Step 2: Specialization */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-clay-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-clay-600" />
                </div>
                <h2 className="font-heading text-h2 text-text-primary mb-2">
                  Áreas de Especialização
                </h2>
                <p className="text-body text-text-secondary">
                  Selecione as áreas em que você atua
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Especializações (selecione todas que se aplicam)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "visa_guidance", label: "Assessoria de Vistos" },
                    { value: "career_coaching", label: "Coaching de Carreira" },
                    { value: "translation", label: "Tradução" },
                    { value: "academic_mentoring", label: "Mentoria Acadêmica" },
                    { value: "interview_prep", label: "Preparação para Entrevistas" },
                    { value: "application_strategy", label: "Estratégia de Candidatura" },
                    { value: "mentoring", label: "Mentoria Geral" },
                    { value: "relocation", label: "Relocation" },
                  ].map((spec) => (
                    <button
                      key={spec.value}
                      type="button"
                      onClick={() => toggleSpecialization(spec.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        specializationData.specializations.includes(spec.value)
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-cream-300 bg-white text-text-secondary hover:border-brand-300"
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Idiomas que você fala
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "pt", label: "Português" },
                    { value: "en", label: "Inglês" },
                    { value: "es", label: "Espanhol" },
                    { value: "fr", label: "Francês" },
                    { value: "de", label: "Alemão" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => {
                        setSpecializationData(prev => ({
                          ...prev,
                          languages: prev.languages.includes(lang.value)
                            ? prev.languages.filter(l => l !== lang.value)
                            : [...prev.languages, lang.value]
                        }));
                      }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        specializationData.languages.includes(lang.value)
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-cream-300 bg-white text-text-secondary hover:border-brand-300"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Disponibilidade"
                value={specializationData.availability}
                onChange={(e) => setSpecializationData({ ...specializationData, availability: e.target.value as "full_time" | "part_time" | "weekends" })}
                options={[
                  { value: "full_time", label: "Tempo Integral" },
                  { value: "part_time", label: "Meio Período" },
                  { value: "weekends", label: "Fins de Semana" },
                ]}
              />
            </div>
          )}

          {/* Step 3: First Service */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-sage-600" />
                </div>
                <h2 className="font-heading text-h2 text-text-primary mb-2">
                  Crie seu Primeiro Serviço
                </h2>
                <p className="text-body text-text-secondary">
                  Defina o que você vai oferecer no marketplace
                </p>
              </div>

              <Input
                label="Título do Serviço"
                placeholder="Ex: Consultoria de Visto para Portugal - 1 hora"
                value={serviceData.title}
                onChange={(e) => setServiceData({ ...serviceData, title: e.target.value })}
                required
              />

              <Textarea
                label="Descrição do Serviço"
                placeholder="Descreva o que está incluído, como funciona a consultoria, o que o cliente pode esperar..."
                value={serviceData.description}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                rows={5}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Categoria"
                  value={serviceData.category}
                  onChange={(e) => setServiceData({ ...serviceData, category: e.target.value as ServiceCategory })}
                  options={CATEGORIES.map(c => ({ label: CATEGORY_LABELS[c], value: c }))}
                />

                <Input
                  label="Duração (minutos)"
                  type="number"
                  value={serviceData.duration}
                  onChange={(e) => setServiceData({ ...serviceData, duration: parseInt(e.target.value) || 60 })}
                  required
                />
              </div>

              <Input
                label="Preço (BRL)"
                type="number"
                value={serviceData.price}
                onChange={(e) => setServiceData({ ...serviceData, price: parseFloat(e.target.value) || 0 })}
                required
                hint="Sugestão: R$ 100-300 para consultorias de 1 hora"
              />
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-brand-600" />
              </div>
              <h2 className="font-heading text-h2 text-text-primary mb-3">
                Parabéns! Seu perfil está completo
              </h2>
              <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
                Você já pode começar a receber contratações no marketplace. Seu perfil será revisado pela equipe Olcan em até 24 horas.
              </p>
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-brand-700">
                  <strong>Próximos passos:</strong>
                  <br />
                  • Adicione mais serviços ao seu catálogo
                  <br />
                  • Configure suas preferências de pagamento
                  <br />
                  • Comece a responder mensagens de clientes
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-cream-200">
            {currentStep > 1 && currentStep < 4 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              loading={loading}
              className="ml-auto"
            >
              {currentStep === 4 ? "Ir para Dashboard" : "Continuar"}
              {currentStep < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
