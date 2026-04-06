"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { usePsychStore } from "@/stores/psych";
import { Button } from "@/components/ui";

const DIMENSION = "confidence" as const;
const QUESTIONS = [
  { id: "self_belief", label: "Quando penso em me mudar para outro país, sinto que sou capaz de fazer isso acontecer.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "past_success", label: "Já realizei desafios significativos na minha vida que exigiram planejamento e persistência.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "competence", label: "Acredito que minhas habilidades profissionais são competitivas no mercado internacional.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
  { id: "resilience", label: "Quando enfrento rejeição ou falha, consigo me recuperar e tentar novamente.", options: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];

export default function ConfidenceBlockPage() {
  const router = useRouter();
  const { setAnswer, getDimensionAnswers, markDimensionComplete } = usePsychStore();
  const answers = getDimensionAnswers(DIMENSION);
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleNext = () => {
    markDimensionComplete(DIMENSION);
    router.push("/profile/psych/risk");
  };

  return (
    <div className="space-y-6">
      <div className="card-surface p-8">
        <h2 className="font-heading text-h3 text-text-primary mb-1">Bloco de Confiança</h2>
        <p className="text-body text-text-secondary mb-8">Avalie como você se sente em relação à sua capacidade de realizar mudanças significativas.</p>
        <div className="space-y-8">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="font-heading font-semibold text-text-primary mb-3">
                <span className="text-brand-400 mr-2">{qi + 1}.</span>
                {q.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(DIMENSION, q.id, opt)}
                    className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all duration-fast ${
                      answers[q.id] === opt
                        ? "bg-brand-500 text-white shadow-sm scale-[1.02]"
                        : "border border-cream-500 text-text-secondary hover:bg-cream-200 hover:border-cream-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Link href="/profile/psych/calibration" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Button onClick={handleNext} disabled={!allAnswered} className={!allAnswered ? "opacity-50" : "!text-white"}>
          Avançar <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
