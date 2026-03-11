"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, FileEdit, BookOpen, Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { useForgeStore, type DocType } from "@/stores/forge";

const DOC_TYPES: { id: DocType; icon: typeof FileText; label: string; description: string }[] = [
  { id: "motivation_letter", icon: FileEdit, label: "Carta de Motivação", description: "Statement of Purpose / Motivation Letter para programas acadêmicos" },
  { id: "cv", icon: Briefcase, label: "Currículo / CV", description: "CV acadêmico ou profissional formatado para padrões internacionais" },
  { id: "research_proposal", icon: BookOpen, label: "Proposta de Pesquisa", description: "Research proposal para PhD ou programas de pesquisa" },
  { id: "personal_statement", icon: GraduationCap, label: "Personal Statement", description: "Personal statement para universidades anglo-saxônicas" },
  { id: "recommendation", icon: FileText, label: "Carta de Recomendação", description: "Draft de carta de recomendação para orientadores assinarem" },
];

const LANG_MAP: Record<string, string> = { "Inglês": "en", "Alemão": "de", "Francês": "fr", "Espanhol": "es", "Português": "pt" };

export default function NewDocumentPage() {
  const router = useRouter();
  const { createDocument } = useForgeStore();

  const [selected, setSelected] = useState<DocType | null>(null);
  const [title, setTitle] = useState("");
  const [targetProgram, setTargetProgram] = useState("");
  const [language, setLanguage] = useState("Inglês");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as DocType | null;
    const nextTitle = params.get("title") || "";
    const nextTargetProgram = params.get("targetProgram") || "";

    if (type) setSelected(type);
    if (nextTitle) setTitle(nextTitle);
    if (nextTargetProgram) setTargetProgram(nextTargetProgram);
  }, []);

  const handleCreate = () => {
    if (!selected || !title.trim()) return;
    setCreating(true);
    const docId = createDocument({
      title: title.trim(),
      type: selected,
      targetProgram: targetProgram.trim() || undefined,
      language: LANG_MAP[language] || "en",
    });
    router.push(`/forge/${docId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-h2 text-text-primary">Novo Documento</h1>
        <p className="text-body text-text-secondary mt-1">Escolha o tipo e configure seu documento</p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-h4 text-text-primary">Tipo de Documento</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DOC_TYPES.map((type) => (
            <button key={type.id} onClick={() => setSelected(type.id)} className={`card-surface p-5 flex items-start gap-3 text-left transition-all ${selected === type.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === type.id ? "bg-brand-100" : "bg-cream-200"}`}>
                <type.icon className={`w-5 h-5 ${selected === type.id ? "text-brand-500" : "text-text-muted"}`} />
              </div>
              <div>
                <p className="font-heading font-semibold text-text-primary">{type.label}</p>
                <p className="text-caption text-text-secondary mt-0.5">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Título do documento</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Carta de Motivação — TU Berlin MSc Computer Science" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Programa/Vaga alvo</label>
            <input type="text" value={targetProgram} onChange={(e) => setTargetProgram(e.target.value)} placeholder="Ex: MSc Computer Science, TU Berlin" className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Idioma</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option>Inglês</option><option>Alemão</option><option>Francês</option><option>Espanhol</option><option>Português</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : <>Criar e Abrir no Editor <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}
