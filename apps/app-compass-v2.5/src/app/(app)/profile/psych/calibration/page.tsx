"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { usePsychStore } from "@/stores/psych";
import { Button } from "@/components/ui";

const DIMENSION = "calibration" as const;
const QUESTIONS = [
  { id: "age", label: "Qual é a sua faixa etária?", options: ["18–24", "25–30", "31–35", "36–40", "40+"] },
  { id: "education", label: "Qual é seu nível de escolaridade?", options: ["Ensino médio", "Graduação", "Pós-graduação", "Mestrado", "Doutorado"] },
  { id: "languages", label: "Quantos idiomas você fala com proficiência?", options: ["1 (Português)", "2 idiomas", "3 idiomas", "4+ idiomas"] },
  { id: "experience_abroad", label: "Já morou fora do Brasil?", options: ["Nunca", "Intercâmbio curto (<6 meses)", "Morei 6–12 meses", "Morei 1–3 anos", "Morei 3+ anos"] },
];

export default function CalibrationPage() {
  const router = useRouter();
  const { setAnswer, getDimensionAnswers, markDimensionComplete, startAssessment } = usePsychStore();
  const answers = getDimensionAnswers(DIMENSION);
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleNext = () => {
    startAssessment();
    markDimensionComplete(DIMENSION);
    router.push("/profile/psych/confidence");
  };

  return (
    <div className="space-y-6">
      <div className="card-surface p-8">
        <h2 className="font-heading text-h3 text-text-primary mb-1">Calibração de Contexto</h2>
        <p className="text-body text-text-secondary mb-8">Informações básicas para personalizar as próximas perguntas.</p>
        <div className="space-y-8">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="font-heading font-semibold text-text-primary mb-3">
                <span className="text-brand-400 mr-2">{qi + 1}.</span>{q.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button key={opt} onClick={() => setAnswer(DIMENSION, q.id, opt)} className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all duration-fast ${answers[q.id] === opt ? "bg-brand-500 text-white shadow-sm scale-[1.02]" : "border border-cream-500 text-text-secondary hover:bg-cream-200 hover:border-cream-600"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Link href="/profile/psych" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cream-500 text-text-secondary font-medium text-body-sm hover:bg-cream-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Button onClick={handleNext} disabled={!allAnswered} className={!allAnswered ? "opacity-50" : ""}>Próximo <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
