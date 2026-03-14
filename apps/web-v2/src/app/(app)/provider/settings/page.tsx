"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Settings } from "lucide-react";
import { CATEGORY_LABELS, useMarketplaceStore, type ServiceCategory } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, Input, PageHeader, Skeleton, Textarea, useToast } from "@/components/ui";

export default function ProviderSettingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { fetchMyProviderProfile, updateMyProviderProfile } = useMarketplaceStore();
  const provider = useMarketplaceStore((state) => state.myProviderProfile);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [specialties, setSpecialties] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    fetchMyProviderProfile();
  }, [fetchMyProviderProfile]);

  useEffect(() => {
    if (!provider) return;
    setName(provider.name);
    setBio(provider.bio);
    setCountry(provider.country);
    setLanguagesText(provider.languages.join(", "));
    setYearsExperience(String(provider.yearsExperience));
    setSpecialties(provider.specialties);
  }, [provider]);

  const categories = useMemo(
    () => Object.entries(CATEGORY_LABELS) as Array<[ServiceCategory, string]>,
    []
  );

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-80" /></div>;
  }

  if (!provider) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={Settings} title="Perfil de profissional não encontrado" description="Selecione um perfil ativo para ajustar configurações." /></div>;
  }

  const toggleSpecialty = (category: ServiceCategory) => {
    setSpecialties((state) =>
      state.includes(category)
        ? state.filter((item) => item !== category)
        : [...state, category]
    );
  };

  const handleSave = () => {
    const languages = languagesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateMyProviderProfile({
      name: name.trim() || provider.name,
      bio: bio.trim() || provider.bio,
      country: country.trim() || provider.country,
      languages,
      yearsExperience: parseInt(yearsExperience) || 0,
      specialties,
    });

    toast({
      title: "Perfil atualizado",
      description: "As configurações do profissional foram salvas.",
      variant: "success",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref="/provider" title="Configurações do Profissional" subtitle={`Perfil ativo: ${provider.name}`} />

      <div className="card-surface p-6 space-y-4">
        <Input label="Nome profissional" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="País" value={country} onChange={(event) => setCountry(event.target.value)} />
        <Input label="Anos de experiência" type="number" value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)} />
        <Input label="Idiomas (separados por vírgula)" value={languagesText} onChange={(event) => setLanguagesText(event.target.value)} />
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Bio</label>
          <Textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} />
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Especialidades</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {categories.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-lg bg-cream-50 cursor-pointer">
              <span className="text-body-sm text-text-primary">{label}</span>
              <input
                type="checkbox"
                checked={specialties.includes(key)}
                onChange={() => toggleSpecialty(key)}
                className="rounded border-cream-500 text-brand-500 focus:ring-brand-400"
              />
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
        <Save className="w-4 h-4" /> Salvar Configurações
      </button>
    </div>
  );
}
