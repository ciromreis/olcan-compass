"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface MauticFormProps {
  /** Optional source tag sent to Mautic as a hidden field */
  source?: string;
  /** Visual variant */
  variant?: "light" | "dark";
}

/**
 * Mautic lead capture form.
 * Submits to NEXT_PUBLIC_MAUTIC_URL/form/submit via POST.
 * The form ID must match the form configured in Mautic.
 * Hidden field `mauticform[source]` is used for funnel attribution.
 */
export function MauticNewsletterForm({ source = "blog", variant = "light" }: MauticFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const mauticUrl = process.env.NEXT_PUBLIC_MAUTIC_URL;
  // Mautic form ID — update this to match your actual form ID in Mautic
  const FORM_ID = "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mauticUrl || !email) return;

    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("mauticform[email]", email);
      formData.append("mauticform[firstname]", name);
      formData.append("mauticform[formId]", FORM_ID);
      formData.append("mauticform[source]", source);
      formData.append("mauticform[return]", "");

      const res = await fetch(`${mauticUrl}/form/submit?formId=${FORM_ID}`, {
        method: "POST",
        body: formData,
        // Mautic doesn't send CORS headers by default for fetch; use no-cors
        mode: "no-cors",
      });

      // With no-cors, res.ok is always false even on success. Treat as success.
      setStatus("success");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
    }
  }

  const isDark = variant === "dark";

  if (status === "success") {
    return (
      <div className={`rounded-[2.5rem] p-12 md:p-16 text-center ${isDark ? "bg-white/10 border border-white/20" : "card-olcan border-white/60"}`}>
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className={`font-display text-3xl mb-3 italic ${isDark ? "text-white" : "text-olcan-navy"}`}>
          Cadastro confirmado!
        </h3>
        <p className={isDark ? "text-white/60" : "text-olcan-navy/60"}>
          Você receberá nosso próximo artigo diretamente no seu email.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden ${isDark ? "bg-white/5 border border-white/10" : "card-olcan border-white/60"}`}>
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="label-xs text-olcan-navy/60">Newsletter Olcan · Gratuita</span>
        </div>

        <h2 className={`font-display text-4xl md:text-5xl mb-4 tracking-tight leading-[1.1] ${isDark ? "text-white" : "text-olcan-navy"}`}>
          Receba conteúdo que <span className={`italic font-light ${isDark ? "text-[#E5E7EB]" : "text-brand-600"}`}>vale a viagem.</span>
        </h2>

        <p className={`text-lg mb-10 font-medium leading-relaxed ${isDark ? "text-white/60" : "text-olcan-navy/60"}`}>
          Análises semanais sobre vistos, mercado de trabalho global e estratégias 
          de carreira para quem quer cruzar fronteiras de verdade.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Seu primeiro nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 text-olcan-navy placeholder:text-olcan-navy/30 focus:outline-none focus:border-brand-300 transition-all text-base font-medium"
              required
              minLength={2}
            />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 text-olcan-navy placeholder:text-olcan-navy/30 focus:outline-none focus:border-brand-300 transition-all text-base font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary py-5 text-base w-full group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cadastrando...</span>
              </>
            ) : (
              <>
                <span>Quero receber o conteúdo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-500 font-medium">
              Erro ao cadastrar. Tente novamente ou acesse diretamente no 
              <a href="https://olcanglobal.substack.com/subscribe" className="underline ml-1" target="_blank" rel="noopener noreferrer">Substack</a>.
            </p>
          )}

          <p className={`text-xs font-medium ${isDark ? "text-white/30" : "text-olcan-navy/30"}`}>
            Sem spam. Cancelamento a qualquer momento. De acordo com a LGPD.
          </p>
        </form>
      </div>
    </div>
  );
}
