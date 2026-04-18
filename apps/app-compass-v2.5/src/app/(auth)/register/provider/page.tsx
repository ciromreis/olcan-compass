"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Briefcase, ArrowRight } from "lucide-react";
import { marketplaceApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const SPECIALIZATION_MAP: Record<string, string> = {
  legal: "visa_guidance",
  translation: "translation",
  coaching: "career_coaching",
  academic: "academic_mentoring",
  interview: "interview_prep",
  psych: "mentoring",
  relocation: "application_strategy",
};

export default function ProviderRegisterPage() {
  const router = useRouter();
  const { register, fetchProfile, clearError, error: authError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", headline: "", specialization: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);

      try {
        await marketplaceApi.applyAsProvider({
          headline: form.headline.trim(),
          bio: `${form.name.trim()} atua em ${form.headline.trim().toLowerCase()}.`,
          current_title: form.headline.trim(),
          specializations: [SPECIALIZATION_MAP[form.specialization] || form.specialization],
          languages_spoken: ["pt", "en"],
        });
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        if (detail !== "Application already submitted") {
          throw err;
        }
      }

      await fetchProfile();
      router.push("/provider/onboarding");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Não foi possível concluir sua inscrição como profissional.";
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-clay-50 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-6 h-6 text-clay-500" />
        </div>
        <h1 className="font-heading text-h2 text-text-primary mb-2">Cadastro de Profissional</h1>
        <p className="text-body text-text-secondary">Ofereça seus serviços no marketplace verificado</p>
      </div>
      {displayError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-body-sm text-red-700">
          {displayError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Nome completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome profissional" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="profissional@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Título profissional</label>
          <input type="text" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Ex: Advogado de Imigração, Coach de Carreira" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Especialização</label>
          <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required>
            <option value="">Selecione sua área</option>
            <option value="legal">Assessoria Jurídica / Imigração</option>
            <option value="translation">Tradução e Revisão</option>
            <option value="coaching">Coaching de Carreira</option>
            <option value="academic">Revisão Acadêmica</option>
            <option value="interview">Preparação para Entrevistas</option>
            <option value="psych">Apoio Psicológico</option>
            <option value="relocation">Relocation / Logística</option>
          </select>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required minLength={8} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-clay-500 text-white font-heading font-semibold hover:bg-clay-600 disabled:opacity-50 transition-colors">
          {loading ? "Criando conta e enviando candidatura..." : "Criar Conta de Profissional"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/register" className="text-body-sm text-text-secondary hover:text-brand-500 transition-colors">← Voltar para cadastro padrão</Link>
      </div>
    </div>
  );
}
