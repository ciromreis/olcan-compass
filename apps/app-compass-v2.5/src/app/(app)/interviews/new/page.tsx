"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, GraduationCap, Briefcase, Stamp, Users, FileText } from "lucide-react";
import { useInterviewStore, type InterviewType } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";

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
  const { getDocById } = useForgeStore();
  const [selected, setSelected] = useState<InterviewType | null>(null);
  const [language, setLanguage] = useState("en");
  const [target, setTarget] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediário");
  const [sourceDocumentId, setSourceDocumentId] = useState("");
  const [sourceDocumentTitle, setSourceDocumentTitle] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as InterviewType | null;
    const targetParam = params.get("target");
    const languageParam = params.get("language");
    const difficultyParam = params.get("difficulty");
    const documentIdParam = params.get("documentId");
    const documentTitleParam = params.get("documentTitle");

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

    if (documentIdParam) {
      setSourceDocumentId(documentIdParam);
      const sourceDoc = getDocById(documentIdParam);
      setSourceDocumentTitle(sourceDoc?.title || documentTitleParam || "");
    } else if (documentTitleParam) {
      setSourceDocumentTitle(documentTitleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedType = INTERVIEW_TYPES.find((t) => t.id === selected);

  const handleStart = async () => {
    if (!selected || !selectedType) return;
    const id = await startSession({
      type: selected,
      typeLabel: selectedType.label,
      target: target || selectedType.label,
      language,
      difficulty,
      sourceDocumentId: sourceDocumentId || undefined,
      sourceDocumentTitle: sourceDocumentTitle || undefined,
    });
    if (!id) return;
    router.push(`/interviews/${id}/session`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card-surface border border-brand-200/70 bg-gradient-to-br from-white via-brand-50/50 to-slate-50/90 p-6">
        <div className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1 text-caption font-medium text-brand-600 shadow-sm">
          Entrevistas
        </div>
        <h1 className="mt-4 font-heading text-h2 text-text-primary">Treine com contexto real antes da conversa que importa</h1>
        <p className="mt-2 max-w-2xl text-body text-text-secondary">
          Configure a simulação com base no seu alvo e pratique respostas, ritmo e presença com mais precisão.
        </p>
        <p className="mt-3 max-w-2xl text-body-sm text-text-muted">
          A Aura usa esses sinais para ajustar prioridades e apoio sugerido sem transformar sua experiência em um placar artificial.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-h4 text-text-primary">Que tipo de conversa você quer preparar?</h2>
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
          {(sourceDocumentId || sourceDocumentTitle) && (
            <div className="rounded-2xl border border-brand-100 bg-white/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-text-primary">Contexto vindo do Forge</p>
                  <p className="mt-1 text-body-sm text-text-secondary">
                    Esta simulação vai usar o mesmo alvo do documento para deixar as perguntas mais próximas da conversa real.
                  </p>
                  <p className="mt-2 text-caption text-text-muted truncate">
                    Documento: {sourceDocumentTitle || "Documento selecionado"}
                  </p>
                  {sourceDocumentId && (
                    <Link href={`/forge/${sourceDocumentId}`} className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-brand-600 hover:text-brand-700">
                      Revisar documento
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Programa, vaga ou contexto alvo</label>
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
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-body-sm text-text-secondary">
            Simulações mais específicas geram feedback mais útil. Vale informar um programa, empresa, bolsa ou tipo de avaliador sempre que possível.
          </div>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors"
          >
            Iniciar simulação <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
