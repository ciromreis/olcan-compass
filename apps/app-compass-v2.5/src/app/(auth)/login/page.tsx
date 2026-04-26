"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

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

      // Allow cross-origin redirects ONLY to trusted *.olcan.com.br subdomains
      const TRUSTED_ORIGINS = [new URL(API_ENDPOINTS.app.base).hostname];
      let destination = "/dashboard";

      if (redirect) {
        if (redirect.startsWith("/")) {
          destination = redirect;
        } else {
          try {
            const url = new URL(redirect);
            const isTrusted = TRUSTED_ORIGINS.some((domain) =>
              url.hostname === domain || url.hostname.endsWith(`.${domain}`)
            );
            if (isTrusted) {
              // External redirect to a trusted subdomain
              window.location.href = redirect;
              return;
            }
          } catch {
            // Malformed URL — fall through to dashboard
          }
        }
      }

      router.push(destination);
    } catch {
      // error is already set in the store
    }
  };

  return (
    <div className="glass-panel relative overflow-hidden border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,251,255,0.82))] p-8 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,32,74,0.16),transparent)]" />
        <div className="absolute -right-12 top-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(16,53,110,0.10),transparent_70%)] blur-2xl" />
        <div className="absolute -left-10 bottom-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(185,194,208,0.22),transparent_68%)] blur-2xl" />
        <motion.div
          className="absolute right-8 top-8 h-16 w-16 rounded-full border border-white/35 bg-[conic-gradient(from_120deg,rgba(255,255,255,0.18),rgba(15,23,42,0.06),rgba(255,255,255,0.55),rgba(15,23,42,0.05),rgba(255,255,255,0.18))]"
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-6 top-20 h-px w-28 bg-[linear-gradient(90deg,transparent,rgba(17,24,39,0.22),transparent)]"
          animate={{ x: [0, 16, 0], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-16 right-10 h-px w-24 bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.5),transparent)]"
          animate={{ x: [0, -12, 0], opacity: [0.3, 0.75, 0.3] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="relative z-10">
      <div className="text-center mb-8">
        <div className="mb-3 inline-flex items-center rounded-full border border-white/40 bg-white/60 px-3 py-1 text-body-sm uppercase tracking-[0.28em] text-text-secondary backdrop-blur-md">
          Base Olcan
        </div>
        <h1 className="font-heading text-h2 text-text-primary mb-2">
          Acesse sua base de operação
        </h1>
        <p className="text-body text-text-secondary">
          Continue a preparar candidaturas, entrevistas e decisões com mais clareza
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50/90 backdrop-blur-sm border border-red-200 text-body-sm text-red-700">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-400/60 bg-white/90 backdrop-blur-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white transition-all shadow-sm"
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
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cream-400/60 bg-white/90 backdrop-blur-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white transition-all shadow-sm"
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
          className="w-full btn-liquid flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-heading font-semibold disabled:opacity-50 transition-all"
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
            <span className="bg-white/90 backdrop-blur-sm px-3 text-text-muted">ou continue com</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cream-400/60 bg-white/80 backdrop-blur-sm text-text-secondary text-body-sm font-medium hover:bg-white hover:border-cream-500 transition-all shadow-sm">
            Google
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cream-400/60 bg-white/80 backdrop-blur-sm text-text-secondary text-body-sm font-medium hover:bg-white hover:border-cream-500 transition-all shadow-sm">
            LinkedIn
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(241,245,249,0.5))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 text-body-sm">
          <span className="text-text-primary">Contexto em sincronia</span>
          <span className="rounded-full bg-slate-900/6 px-2 py-0.5 text-body-sm uppercase tracking-[0.22em] text-text-muted">
            sinais ativos
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
