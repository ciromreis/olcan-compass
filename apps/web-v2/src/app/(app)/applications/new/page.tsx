"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Briefcase, Award, Loader2 } from "lucide-react";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { Input, PageHeader } from "@/components/ui";

const APP_TYPES = [
  { id: "Mestrado", icon: GraduationCap, label: "Programa Acadêmico", description: "Mestrado, doutorado ou graduação" },
  { id: "Bolsa", icon: Award, label: "Bolsa de Estudos", description: "DAAD, Chevening, Fulbright e outras" },
  { id: "Emprego", icon: Briefcase, label: "Vaga de Emprego", description: "Posição internacional com visto patrocinado" },
];

const DEFAULT_DOCS: Record<string, string[]> = {
  Mestrado: ["Carta de Motivação", "CV Acadêmico", "Certificado de Proficiência", "Carta de Recomendação #1"],
  Bolsa: ["Formulário da Bolsa", "Plano de Estudos", "Carta de Motivação", "Comprovante de Proficiência"],
  Emprego: ["CV / Résumé", "Cover Letter", "Portfolio / GitHub", "Referências"],
};

export default function NewApplicationPage() {
  const router = useRouter();
  const { addApplication } = useApplicationStore();

  const [selected, setSelected] = useState<string | null>(null);
  const [program, setProgram] = useState("");
  const [institution, setInstitution] = useState("");
  const [deadline, setDeadline] = useState("");
  const [country, setCountry] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const nextProgram = params.get("program") || "";
    const nextCountry = params.get("country") || "";

    if (type) setSelected(type);
    if (nextProgram) setProgram(nextProgram);
    if (nextCountry) setCountry(nextCountry);
  }, []);

  const handleCreate = () => {
    if (!selected || !program.trim() || !deadline) return;
    setCreating(true);

    const id = `a${Date.now()}`;
    const fullProgram = institution.trim()
      ? `${program.trim()} — ${institution.trim()}`
      : program.trim();

    const docs = (DEFAULT_DOCS[selected] || []).map((name, i) => ({
      id: `d${Date.now()}_${i}`,
      name,
      status: "pending" as const,
    }));

    const app: UserApplication = {
      id,
      program: fullProgram,
      type: selected,
      country: country || "—",
      deadline,
      status: "draft",
      match: 0,
      documents: docs,
      timeline: [
        { id: `te${Date.now()}_1`, event: "Candidatura criada", date: new Date().toISOString().slice(0, 10), done: true },
        { id: `te${Date.now()}_2`, event: "Documentos em preparação", date: new Date().toISOString().slice(0, 10), done: false },
        { id: `te${Date.now()}_3`, event: "Deadline de submissão", date: deadline, done: false },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    addApplication(app);
    router.push(`/applications/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref="/applications" title="Nova Candidatura" subtitle="Registre uma nova aplicação para acompanhar" />

      <div className="space-y-3">
        <h2 className="font-heading text-h4 text-text-primary">Tipo</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {APP_TYPES.map((type) => (
            <button key={type.id} onClick={() => setSelected(type.id)} className={`card-surface p-4 flex flex-col items-center gap-2 text-center transition-all ${selected === type.id ? "ring-2 ring-brand-500 bg-brand-50/50" : "hover:-translate-y-0.5"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected === type.id ? "bg-brand-100" : "bg-cream-200"}`}>
                <type.icon className={`w-5 h-5 ${selected === type.id ? "text-brand-500" : "text-text-muted"}`} />
              </div>
              <p className="font-heading font-semibold text-body-sm text-text-primary">{type.label}</p>
              <p className="text-caption text-text-muted">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card-surface p-6 space-y-4">
          <Input label="Nome do programa/vaga" type="text" value={program} onChange={(e) => setProgram(e.target.value)} placeholder="Ex: MSc Computer Science" />
          <Input label="Instituição/Empresa" type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ex: TU Berlin" />
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">País</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Selecione</option>
              <option>Alemanha</option><option>Canadá</option><option>EUA</option><option>Irlanda</option><option>Holanda</option><option>Portugal</option><option>Reino Unido</option><option>Suécia</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!program.trim() || !deadline || creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : <>Criar Candidatura <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}
