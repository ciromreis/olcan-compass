"use client";

import { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";

export default function MFAPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="card-surface p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-moss-50 flex items-center justify-center mx-auto mb-4">
        <Shield className="w-7 h-7 text-moss-500" />
      </div>
      <h1 className="font-heading text-h2 text-text-primary mb-2">Verificação em duas etapas</h1>
      <p className="text-body text-text-secondary mb-6">Digite o código de 6 dígitos do seu aplicativo autenticador</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-full text-center text-h2 font-mono tracking-[0.5em] py-3 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" required />
        <button type="submit" disabled={loading || code.length < 6} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 disabled:opacity-50 transition-colors">
          {loading ? "Verificando..." : "Verificar"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
