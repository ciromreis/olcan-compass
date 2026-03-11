"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Globe, Lock, Bell, CreditCard, Save } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";

export default function SettingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.full_name || "Usuário");
  const [email, setEmail] = useState(user?.email || "usuario@exemplo.com");
  const [language, setLanguage] = useState("pt-BR");
  const [privacyPublic, setPrivacyPublic] = useState(false);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-6"><Skeleton className="h-48 col-span-1" /><Skeleton className="h-96 col-span-2" /></div></div>;
  }

  const handleSave = () => {
    toast({
      title: "Configurações Salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
      variant: "success"
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Configurações e Preferências" />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cream-100 text-moss-600 font-medium transition-colors">
            <User className="w-5 h-5" /> Perfil Geral
          </Link>
          <Link href="/settings/billing" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 text-text-secondary transition-colors">
            <CreditCard className="w-5 h-5 text-text-muted" /> Assinaturas
          </Link>
          <Link href="/settings/notifications" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 text-text-secondary transition-colors opacity-50 cursor-not-allowed pointer-events-none">
            <Bell className="w-5 h-5 text-text-muted" /> Notificações
          </Link>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="card-surface p-6 space-y-5">
            <h3 className="font-heading text-h3 text-text-primary">Meus Dados</h3>
            <Input label="Nome Completo" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-mail principal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Usado para login e recibos." disabled />
            
            <div className="pt-4 border-t border-cream-200">
              <label className="block text-body-sm font-medium text-text-primary mb-1.5 flex items-center gap-2"><Globe className="w-4 h-4 text-text-muted"/> Idioma e Região</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">Inglês (Estados Unidos)</option>
                <option value="es-ES">Espanhol</option>
              </select>
            </div>
          </div>

          <div className="card-surface p-6 space-y-5">
            <h3 className="font-heading text-h3 text-text-primary flex items-center gap-2"><Lock className="w-5 h-5 text-moss-500" /> Privacidade</h3>
            <label className="flex items-start gap-3 p-3 rounded-lg bg-cream-50 cursor-pointer">
              <input type="checkbox" checked={privacyPublic} onChange={(e) => setPrivacyPublic(e.target.checked)} className="mt-1 rounded border-cream-500 text-moss-500 focus:ring-moss-400" />
              <div>
                <span className="block text-body font-medium text-text-primary">Perfil Público de Mentoria</span>
                <span className="block text-caption text-text-muted">Permite que recrutadores e universidades encontrem seu perfil anonimizado no painel institucional.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={handleSave} className="bg-moss-500 text-white min-w-[140px] justify-center hover:bg-moss-600"><Save className="w-4 h-4 mr-2" /> Salvar Alterações</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
