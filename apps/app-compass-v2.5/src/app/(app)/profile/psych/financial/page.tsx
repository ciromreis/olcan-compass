"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { usePsychStore } from "@/stores/psych";
import { Button } from "@/components/ui";

const DIMENSION = "financial" as const;
const QUESTIONS = [
  { id: "savings", label: "Tenho reserva financeira suficiente para cobrir pelo menos 6 meses no exterior.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "debt", label: "Tenho dívidas ou compromissos financeiros que dificultam a mudança.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "income_gap", label: "Aceito um possível período sem renda durante a transição.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "investment", label: "Qual faixa de investimento você pode dedicar ao processo de emigração?", options: ["Até R$ 5.000", "R$ 5.000–15.000", "R$ 15.000–50.000", "R$ 50.000–100.000", "Mais de R$ 100.000"] },
];

export default function FinancialBlockPage() {
  const router = useRouter();
  const { setAnswer, getDimensionAnswers, markDimensionComplete, finishAssessment } = usePsychStore();
  const answers = getDimensionAnswers(DIMENSION);
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleNext = () => {
    markDimensionComplete(DIMENSION);
    finishAssessment();
    router.push("/profile/psych/summary");
  };

  return (
    <div className="space-y-6">
      <div className="card-surface p-8">
        <h2 className="font-heading text-h3 text-text-primary mb-1">Estresse Financeiro</h2>
        <p className="text-body text-text-secondary mb-8">Sua relação com dinheiro e como isso impacta suas decisões de mobilidade.</p>
        <div className="space-y-8">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="font-heading font-semibold text-text-primary mb-3">
                <span className="text-brand-400 mr-2">{qi + 1}.</span>{q.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button key={opt} onClick={() => setAnswer(DIMENSION, q.id, opt)} className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all duration-fast ${answers[q.id] === opt ? "bg-brand-500 text-white shadow-sm scale-[1.02]" : "border border-cream-500 text-text-secondary hover:bg-cream-200 hover:border-cream-600"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Link href="/profile/psych/goals" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        <Button onClick={handleNext} disabled={!allAnswered} className={!allAnswered ? "opacity-50" : ""}>Próximo <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
