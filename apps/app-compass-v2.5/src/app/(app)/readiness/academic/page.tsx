"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calculator, CheckSquare, Save } from "lucide-react";
import { useToast } from "@/components/ui";

export default function AcademicReadinessPage() {
  const { toast } = useToast();
  const [gpa, setGpa] = useState("3.5");
  const [gmat, setGmat] = useState("700");
  const [toefl, setToefl] = useState("105");

  const [checklist, setChecklist] = useState([
    { id: "1", text: "Histórico Escolar Traduzido e Juramentado", done: true },
    { id: "2", text: "Diploma (Graduação ou Ensino Médio) Traduzido", done: false },
    { id: "3", text: "Cartas de Recomendação Acadêmica (2x)", done: false },
    { id: "4", text: "Syllabus das principais matérias (opcional)", done: true },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Dados salvos", description: "Informações acadêmicas atualizadas com sucesso.", variant: "success" });
  };

  const progress = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/readiness" className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="font-heading text-h3 text-text-primary">Academics & Tests</h1>
          <p className="text-body text-text-secondary">Informações de background acadêmico e proficiência</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Metrics Form */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-brand-500" />
            <h2 className="font-heading text-h4">Suas Métricas</h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">GPA (Max 4.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">GMAT / GRE Score</label>
              <input
                type="number"
                value={gmat}
                onChange={(e) => setGmat(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">TOEFL / IELTS Score</label>
              <input
                type="number"
                value={toefl}
                onChange={(e) => setToefl(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-white font-medium py-2 rounded-lg hover:bg-brand-600 transition-colors">
              <Save className="w-4 h-4" /> Salvar Métricas
            </button>
          </form>
        </div>

        {/* Action Checklist */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sage-500" />
              <h2 className="font-heading text-h4">Checklist de Documentos</h2>
            </div>
            <span className="text-body-sm font-bold text-sage-600">{progress}%</span>
          </div>

          <div className="w-full bg-cream-200 rounded-full h-2 mb-4">
            <div className="bg-sage-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <label key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-cream-200 bg-cream-50 hover:bg-cream-100 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 flex-shrink-0 w-4 h-4 text-brand-600 bg-white border-cream-300 rounded focus:ring-brand-500"
                />
                <span className={`text-body-sm ${item.done ? "line-through text-text-muted" : "text-text-primary"}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
            <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-heading text-body-sm font-semibold text-blue-800">Dica Olcan</h4>
              <p className="text-caption text-blue-600 mt-1">Apenas envie traduções juramentadas quando a universidade exigir explicitamente. &ldquo;Certified Translations&rdquo; costumam ser suficientes e são mais baratas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
