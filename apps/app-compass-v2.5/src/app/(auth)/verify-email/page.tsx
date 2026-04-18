"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export default function VerifyEmailPage() {
  const email = useAuthStore((state) => state.user?.email || "");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerContext, setProviderContext] = useState(false);
  const [orgContext, setOrgContext] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setProviderContext(params.get("provider") === "1");
    setOrgContext(params.get("org") === "1");
    const tokenParam = params.get("token");
    if (!tokenParam) return;
    const token = tokenParam;

    async function verify() {
      setVerifying(true);
      setError(null);
      try {
        await authApi.verifyEmail(token);
        setVerified(true);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          "Não foi possível verificar seu e-mail.";
        setError(message);
      } finally {
        setVerifying(false);
      }
    }

    void verify();
  }, []);

  const handleResend = async () => {
    if (!email) {
      setError("Faça login novamente para reenviar o e-mail de verificação.");
      return;
    }
    setResending(true);
    setError(null);
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Não foi possível reenviar o e-mail de verificação.";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card-surface p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-brand-500" />
      </div>
      <h1 className="font-heading text-h2 text-text-primary mb-2">Verifique seu e-mail</h1>
      <p className="text-body text-text-secondary mb-6 max-w-sm mx-auto">
        {verifying
          ? "Validando seu link de verificação..."
          : verified
          ? "Seu e-mail foi verificado com sucesso."
          : providerContext
          ? "Sua conta foi criada e sua candidatura de profissional foi enviada. Verifique seu e-mail para ativar o acesso."
          : orgContext
          ? "Sua conta foi criada e o pedido de onboarding institucional foi enviado para a equipe. Verifique seu e-mail para ativar o acesso."
          : "Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta."}
      </p>
      {error && <p className="mb-4 text-body-sm text-clay-500">{error}</p>}
      {verified && (
        <div className="flex items-center gap-2 justify-center mb-4 text-body-sm text-success">
          <CheckCircle className="w-4 h-4" /> Conta verificada com sucesso
        </div>
      )}
      {resent && (
        <div className="flex items-center gap-2 justify-center mb-4 text-body-sm text-success">
          <CheckCircle className="w-4 h-4" /> E-mail reenviado com sucesso
        </div>
      )}
      <button onClick={handleResend} disabled={resending || verifying || verified} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 disabled:opacity-50 transition-colors">
        <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
        {resending ? "Reenviando..." : "Reenviar e-mail"}
      </button>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Entrar no Compass
        </Link>
        <Link href="/login" className="text-body-sm text-text-secondary hover:text-brand-500 transition-colors">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
