"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  if (sent) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-moss-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-moss-500" />
        </div>
        <h1 className="font-heading text-h2 text-text-primary mb-2">E-mail enviado</h1>
        <p className="text-body text-text-secondary mb-6">
          Se uma conta existir com <strong>{email}</strong>, você receberá um link para redefinir sua senha.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-moss-500 font-medium hover:text-moss-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-h2 text-text-primary mb-2">Redefinir senha</h1>
        <p className="text-body text-text-secondary">Informe seu e-mail para receber o link de recuperação</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent transition-colors" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 disabled:opacity-50 transition-colors">
          {loading ? "Enviando..." : "Enviar Link de Recuperação"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/login" className="text-body-sm text-text-secondary hover:text-moss-500 transition-colors">
          <ArrowLeft className="w-3 h-3 inline mr-1" /> Voltar para o login
        </Link>
      </div>
    </div>
  );
}
