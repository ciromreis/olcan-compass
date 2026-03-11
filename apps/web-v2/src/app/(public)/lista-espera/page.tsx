"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setJoined(true); }, 1000);
  };

  return (
    <section className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-moss-50 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-7 h-7 text-moss-500" />
      </div>
      <h1 className="font-heading text-display text-text-primary mb-4">Lista de Espera</h1>
      <p className="text-body-lg text-text-secondary mb-10">Estamos liberando acesso gradualmente. Entre na fila e seja avisado quando sua conta for ativada.</p>
      {joined ? (
        <div className="card-surface p-8">
          <CheckCircle className="w-12 h-12 text-moss-500 mx-auto mb-4" />
          <h2 className="font-heading text-h3 text-text-primary mb-2">Você está na fila!</h2>
          <p className="text-body text-text-secondary">Enviaremos um e-mail para <strong>{email}</strong> assim que sua conta for liberada.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-surface p-8">
          <div className="flex gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="flex-1 px-4 py-3 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" required />
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 disabled:opacity-50 transition-colors">
              {loading ? "..." : "Entrar"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-caption text-text-muted mt-3">Sem spam. Apenas um e-mail quando sua vez chegar.</p>
        </form>
      )}
    </section>
  );
}
