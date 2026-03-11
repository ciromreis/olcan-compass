"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function ResetPasswordConfirmPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1500);
  };

  if (done) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-moss-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-moss-500" />
        </div>
        <h1 className="font-heading text-h2 text-text-primary mb-2">Senha redefinida</h1>
        <p className="text-body text-text-secondary mb-6">Sua senha foi alterada com sucesso. Você já pode entrar.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Ir para o Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-h2 text-text-primary mb-2">Nova senha</h1>
        <p className="text-body text-text-secondary">Crie uma nova senha para sua conta</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Nova senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" required minLength={8} />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Confirmar nova senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repita a nova senha" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 disabled:opacity-50 transition-colors">
          {loading ? "Salvando..." : "Redefinir Senha"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
