"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Globe, Lock, Bell, CreditCard, Save, Briefcase, Database } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";

const MENTOR_PROFILE_PUBLIC_KEY = "olcan_settings_mentor_profile_public";

export default function SettingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.full_name || "Usuário");
  const [email, setEmail] = useState(user?.email || "usuario@exemplo.com");
  const [language, setLanguage] = useState(user?.language || "pt-BR");
  const [timezone, setTimezone] = useState(user?.timezone || "America/Sao_Paulo");
  const [privacyPublic, setPrivacyPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.full_name || "Usuário");
    setEmail(user.email || "");
    setLanguage(user.language || "pt-BR");
    setTimezone(user.timezone || "America/Sao_Paulo");
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPrivacyPublic(window.localStorage.getItem(MENTOR_PROFILE_PUBLIC_KEY) === "1");
  }, []);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-6"><Skeleton className="h-48 col-span-1" /><Skeleton className="h-96 col-span-2" /></div></div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: name.trim() || undefined,
        language,
        timezone,
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(MENTOR_PROFILE_PUBLIC_KEY, privacyPublic ? "1" : "0");
      }
      toast({
        title: "Configurações salvas",
        description: "Perfil e preferências foram sincronizados com a sua conta.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Não foi possível salvar",
        description: (err as Error)?.message || "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Configurações e Preferências" />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cream-100 text-brand-600 font-medium transition-colors">
            <User className="w-5 h-5" /> Perfil Geral
          </Link>
          <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 text-text-secondary transition-colors">
            <Briefcase className="w-5 h-5 text-text-muted" /> Perfil de Carreira
          </Link>
          <Link href="/settings/billing" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 text-text-secondary transition-colors">
            <CreditCard className="w-5 h-5 text-text-muted" /> Assinaturas
          </Link>
          <Link href="/admin/crm" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 text-text-secondary transition-colors">
            <Database className="w-5 h-5 text-text-muted" /> CRM & Integrações
          </Link>
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-text-muted"
            title="Em breve"
          >
            <Bell className="w-5 h-5 shrink-0 opacity-50" />{" "}
            <span>
              Notificações <span className="text-caption text-text-muted">(em breve)</span>
            </span>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="card-surface p-6 space-y-5">
            <h3 className="font-heading text-h3 text-text-primary">Meus Dados</h3>
            <Input label="Nome Completo" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-mail principal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Usado para login e recibos." disabled />
            
            <div className="pt-4 border-t border-cream-200 space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5 flex items-center gap-2"><Globe className="w-4 h-4 text-text-muted"/> Idioma</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">Inglês (Estados Unidos)</option>
                  <option value="es-ES">Espanhol</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">Fuso horário</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="America/Sao_Paulo">Brasília (America/Sao_Paulo)</option>
                  <option value="America/Manaus">Manaus (America/Manaus)</option>
                  <option value="America/New_York">Nova York (America/New_York)</option>
                  <option value="Europe/Lisbon">Lisboa (Europe/Lisbon)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card-surface p-6 space-y-5">
            <h3 className="font-heading text-h3 text-text-primary flex items-center gap-2"><Lock className="w-5 h-5 text-brand-500" /> Privacidade</h3>
            <label className="flex items-start gap-3 p-3 rounded-lg bg-cream-50 cursor-pointer">
              <input type="checkbox" checked={privacyPublic} onChange={(e) => setPrivacyPublic(e.target.checked)} className="mt-1 rounded border-cream-500 text-brand-500 focus:ring-brand-400" />
              <div>
                <span className="block text-body font-medium text-text-primary">Perfil Público de Mentoria</span>
                <span className="block text-caption text-text-muted">Preferência guardada neste dispositivo até existir suporte no servidor. Permite que recrutadores e universidades encontrem seu perfil anonimizado no painel institucional.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="bg-brand-500 text-white min-w-[140px] justify-center hover:bg-brand-600"
            >
              <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
