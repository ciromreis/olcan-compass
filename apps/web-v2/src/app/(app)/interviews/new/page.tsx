"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Briefcase, Stamp, Users } from "lucide-react";
import { useInterviewStore, type InterviewType } from "@/stores/interviews";

const INTERVIEW_TYPES: { id: InterviewType; icon: typeof GraduationCap; label: string; description: string }[] = [
  { id: "academic", icon: GraduationCap, label: "Admissão Acadêmica", description: "Entrevista para mestrado, doutorado ou graduação" },
  { id: "visa", icon: Stamp, label: "Entrevista de Visto", description: "Simulação de entrevista consular" },
  { id: "job", icon: Briefcase, label: "Entrevista de Emprego", description: "Processo seletivo para vaga internacional" },
  { id: "scholarship", icon: GraduationCap, label: "Entrevista de Bolsa", description: "DAAD, Chevening, Fulbright e outras" },
  { id: "panel", icon: Users, label: "Painel/Comitê", description: "Entrevista com múltiplos avaliadores" },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const { startSession } = useInterviewStore();
  const [selected, setSelected] = useState<InterviewType | null>(null);
  const [language, setLanguage] = useState("en");
  const [target, setTarget] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediário");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as InterviewType | null;
    const targetParam = params.get("target");
    const languageParam = params.get("language");
    const difficultyParam = params.get("difficulty");

    if (type && INTERVIEW_TYPES.some((entry) => entry.id === type)) {
      setSelected(type);
    }

    if (targetParam) {
      setTarget(targetParam);
    }

    if (languageParam) {
      setLanguage(languageParam);
    }

    if (difficultyParam) {
      setDifficulty(difficultyParam);
    }
  }, []);

  const selectedType = INTERVIEW_TYPES.find((t) => t.id === selected);

  const handleStart = () => {
    if (!selected || !selectedType) return;
    const id = startSession({
      type: selected,
      typeLabel: selectedType.label,
      target: target || selectedType.label,
      language,
      difficulty,
    });
    router.push(`/interviews/${id}/session`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-h2 text-text-primary">Nova Sessão de Entrevista</h1>
        <p className="text-body text-text-secondary mt-1">Configure o tipo e contexto da simulação</p>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-h4 text-text-primary">Tipo de Entrevista</h2>
        {INTERVIEW_TYPES.map((type) => (
          <button key={type.id} onClick={() => setSelected(type.id)} className={`w-full card-surface p-4 flex items-center gap-4 text-left transition-all ${selected === type.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected === type.id ? "bg-brand-100" : "bg-cream-200"}`}>
              <type.icon className={`w-5 h-5 ${selected === type.id ? "text-brand-500" : "text-text-muted"}`} />
            </div>
            <div>
              <p className="font-heading font-semibold text-text-primary">{type.label}</p>
              <p className="text-caption text-text-secondary">{type.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Programa/Vaga alvo</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ex: MSc Computer Science, TU Berlin" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Idioma da entrevista</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="en">Inglês</option><option value="de">Alemão</option><option value="fr">Francês</option><option value="es">Espanhol</option><option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Dificuldade</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
            </select>
          </div>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors"
          >
            Iniciar Simulação <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
