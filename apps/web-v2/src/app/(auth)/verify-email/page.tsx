"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = () => {
    setResending(true);
    setTimeout(() => { setResending(false); setResent(true); }, 1500);
  };

  return (
    <div className="card-surface p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-brand-500" />
      </div>
      <h1 className="font-heading text-h2 text-text-primary mb-2">Verifique seu e-mail</h1>
      <p className="text-body text-text-secondary mb-6 max-w-sm mx-auto">
        Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta.
      </p>
      {resent && (
        <div className="flex items-center gap-2 justify-center mb-4 text-body-sm text-success">
          <CheckCircle className="w-4 h-4" /> E-mail reenviado com sucesso
        </div>
      )}
      <button onClick={handleResend} disabled={resending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 disabled:opacity-50 transition-colors">
        <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
        {resending ? "Reenviando..." : "Reenviar e-mail"}
      </button>
      <div className="mt-8">
        <Link href="/login" className="text-body-sm text-text-secondary hover:text-brand-500 transition-colors">Voltar para o login</Link>
      </div>
    </div>
  );
}
