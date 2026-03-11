"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { usePsychStore } from "@/stores/psych";
import { Button } from "@/components/ui";

const DIMENSION = "risk" as const;
const QUESTIONS = [
  { id: "financial_risk", label: "Estou disposto(a) a investir uma parte significativa das minhas economias nesta mudança.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "career_risk", label: "Aceito que pode haver um período de instabilidade profissional durante a transição.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "social_risk", label: "Consigo lidar com a ideia de ficar longe da família e amigos por um período longo.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "uncertainty", label: "Sinto-me confortável tomando decisões mesmo quando não tenho todas as informações.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];

export default function RiskBlockPage() {
  const router = useRouter();
  const { setAnswer, getDimensionAnswers, markDimensionComplete } = usePsychStore();
  const answers = getDimensionAnswers(DIMENSION);
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleNext = () => {
    markDimensionComplete(DIMENSION);
    router.push("/profile/psych/discipline");
  };

  return (
    <div className="space-y-6">
      <div className="card-surface p-8">
        <h2 className="font-heading text-h3 text-text-primary mb-1">Bloco de Risco</h2>
        <p className="text-body text-text-secondary mb-8">Como você lida com incerteza e riscos financeiros, profissionais e sociais.</p>
        <div className="space-y-8">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="font-heading font-semibold text-text-primary mb-3">
                <span className="text-moss-400 mr-2">{qi + 1}.</span>{q.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button key={opt} onClick={() => setAnswer(DIMENSION, q.id, opt)} className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all duration-fast ${answers[q.id] === opt ? "bg-moss-500 text-white shadow-sm scale-[1.02]" : "border border-cream-500 text-text-secondary hover:bg-cream-200 hover:border-cream-600"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Link href="/profile/psych/confidence" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        <Button onClick={handleNext} disabled={!allAnswered} className={!allAnswered ? "opacity-50" : ""}>Próximo <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
