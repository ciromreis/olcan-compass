"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: loading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (form.password !== form.confirmPassword) {
      setLocalError("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      await register(form.email, form.password, form.name);
      router.push(DEMO_MODE ? "/aura/discover" : "/dashboard?welcome=1");
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : "Erro ao criar conta. Tente novamente.";
      setLocalError(message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-h2 text-text-primary mb-2">Crie sua conta</h1>
        <p className="text-body text-text-secondary">
          Comece sua jornada de mobilidade internacional
        </p>
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
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors" required minLength={8} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Confirmar senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repita a senha" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {loading ? "Criando conta..." : "Criar Conta"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <p className="mt-4 text-caption text-text-muted text-center">
        Ao criar sua conta, você concorda com os{" "}
        <Link href="/legal" className="text-brand-500 hover:underline">Termos de Uso</Link>
        {" "}e{" "}
        <Link href="/legal" className="text-brand-500 hover:underline">Política de Privacidade</Link>.
      </p>

      <div className="mt-6 text-center">
        <p className="text-body-sm text-text-secondary">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-brand-500 font-medium hover:text-brand-600 transition-colors">Entrar</Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-cream-400 flex flex-col gap-2">
        <Link href="/register/provider" className="text-center text-body-sm text-text-secondary hover:text-brand-500 transition-colors">
          Sou um profissional — quero oferecer serviços →
        </Link>
        <Link href="/register/org" className="text-center text-body-sm text-text-secondary hover:text-brand-500 transition-colors">
          Represento uma organização →
        </Link>
      </div>
    </div>
  );
}
