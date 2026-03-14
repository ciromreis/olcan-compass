"use client";

import { useEffect, useState } from "react";
import { Building2, Save, UserPlus, Shield, Trash2 } from "lucide-react";
import { useHydration } from "@/hooks";
import { useOrgStore } from "@/stores/org";
import { Button, Input, PageHeader, Skeleton, useToast } from "@/components/ui";

export default function OrgSettingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const {
    organization,
    permissions,
    allowedDomains,
    updateOrganization,
    togglePermission,
    setAllowedDomains,
    logActivity,
  } = useOrgStore();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [domainsText, setDomainsText] = useState("");

  useEffect(() => {
    if (!organization) return;
    setName(organization.name || "");
    setType(organization.type || "");
    setCountry(organization.country || "");
    setContactEmail(organization.contactEmail || "");
    setDomainsText(allowedDomains.join(", "));
  }, [allowedDomains, organization]);

  const handleSave = () => {
    updateOrganization({ name: name.trim(), type, country: country.trim(), contactEmail: contactEmail.trim().toLowerCase() });
    setAllowedDomains(domainsText.split(",").map((item) => item.trim()).filter(Boolean));
    logActivity("Configurações da organização atualizadas");
    toast({
      title: "Configurações salvas",
      description: "As alterações da organização foram persistidas localmente.",
      variant: "success",
    });
  };

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-48" /><Skeleton className="h-32" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref="/org" title="Configurações da Organização" />

      <div className="card-surface p-6 space-y-4">
        <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2"><Building2 className="w-5 h-5 text-brand-500" /> Informações</h3>
        <Input label="Nome da organização" type="text" value={name} onChange={(event) => setName(event.target.value)} />
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Tipo</label>
          <select value={type} onChange={(event) => setType(event.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option>Universidade</option><option>Escola de Idiomas</option><option>Consultoria</option><option>ONG</option><option>Empresa</option>
          </select>
        </div>
        <Input label="País" type="text" value={country} onChange={(event) => setCountry(event.target.value)} />
        <Input label="E-mail de contato" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
      </div>

      <div className="card-surface p-6 space-y-4">
        <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2"><Shield className="w-5 h-5 text-brand-500" /> Permissões</h3>
        {[
          { key: "coordinatorsCanInvite", label: "Coordenadores podem convidar membros" },
          { key: "membersCanViewScores", label: "Membros podem ver scores de outros" },
          { key: "exportAggregates", label: "Exportar dados agregados" },
          { key: "marketplaceEnabled", label: "Permitir marketplace para membros" },
        ].map((permission) => (
          <label key={permission.key} className="flex items-center justify-between p-3 rounded-lg bg-cream-50 cursor-pointer">
            <span className="text-body-sm text-text-primary">{permission.label}</span>
            <input
              type="checkbox"
              checked={permissions[permission.key as keyof typeof permissions]}
              onChange={(event) => togglePermission(permission.key as keyof typeof permissions, event.target.checked)}
              className="rounded border-cream-500 text-brand-500 focus:ring-brand-400"
            />
          </label>
        ))}
      </div>

      <div className="card-surface p-6 space-y-4">
        <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-500" /> Domínio de E-mail</h3>
        <p className="text-body-sm text-text-secondary">Membros com estes domínios de e-mail serão automaticamente associados à organização.</p>
        <Input
          type="text"
          value={domainsText}
          onChange={(event) => setDomainsText(event.target.value)}
          placeholder="uni.edu.br, faculdade.edu.br"
          hint="Separe múltiplos domínios por vírgula."
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave}><Save className="w-4 h-4" /> Salvar</Button>
        <Button variant="secondary" className="border-clay-300 text-clay-500 hover:bg-clay-50">
          <Trash2 className="w-4 h-4" /> Encerrar Organização
        </Button>
      </div>
    </div>
  );
}
