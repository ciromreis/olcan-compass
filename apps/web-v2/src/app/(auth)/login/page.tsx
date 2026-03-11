"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: loading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const destination = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
      router.push(destination);
    } catch {
      // error is already set in the store
    }
  };

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-h2 text-text-primary mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-body text-text-secondary">
          Entre na sua conta para continuar sua jornada
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-body-sm font-medium text-text-primary">
              Senha
            </label>
            <Link
              href="/reset-password"
              className="text-caption text-brand-500 hover:text-brand-600 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-body-sm text-text-secondary">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-brand-500 font-medium hover:text-brand-600 transition-colors">
            Criar conta gratuita
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cream-400" />
          </div>
          <div className="relative flex justify-center text-caption">
            <span className="bg-white px-3 text-text-muted">ou continue com</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            Google
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}
