"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "O Compass é gratuito?", a: "Sim, o plano Lite é 100% gratuito e inclui diagnóstico psicológico, 1 rota ativa, Score de Certeza e Custo de Inação. Planos pagos desbloqueiam IA avançada, simulador de entrevista e marketplace." },
  { q: "Como funciona o Score de Certeza?", a: "O Score de Certeza (Cs) combina probabilidade de visto, gap financeiro, capital necessário e índice de prontidão em uma fórmula ponderada. Quanto mais dados você fornecer, mais preciso o score." },
  { q: "Meus dados são seguros?", a: "Sim. Usamos criptografia end-to-end, Row Level Security (RLS) no banco de dados, e nunca compartilhamos seus dados com terceiros. Compliance total com LGPD." },
  { q: "Como funciona o escrow do marketplace?", a: "Quando você contrata um profissional, o valor fica retido (escrow) até que o serviço seja entregue e aprovado. Se houver disputa, nossa equipe media a resolução." },
  { q: "O simulador de entrevista usa IA real?", a: "Sim. Usamos Gemini 1.5 Pro para gerar perguntas contextualizadas, analisar suas respostas em tempo real e fornecer feedback sobre clareza, hesitação e confiança projetada." },
  { q: "Posso usar o Compass para mais de um destino?", a: "Sim! No plano Core você pode ter até 3 rotas ativas simultâneas, e no Pro são ilimitadas. Cada rota tem seu próprio grafo de dependências." },
  { q: "O que é o Custo de Inação (COI)?", a: "É quanto você perde por dia ao não agir. Calculamos com base na diferença entre seu salário atual e o salário-alvo no destino, ajustado pela taxa de câmbio." },
  { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim, sem multa. Você mantém acesso até o final do período pago e pode reativar quando quiser." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="font-heading text-display text-text-primary mb-4">Perguntas Frequentes</h1>
        <p className="text-body-lg text-text-secondary">Tudo que você precisa saber sobre o Compass</p>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card-surface overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-heading font-semibold text-text-primary pr-4">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 -mt-1">
                <p className="text-body text-text-secondary">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
