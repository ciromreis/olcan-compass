"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, GraduationCap, Briefcase, Stamp, MessageSquare, ChevronRight, Users, ArrowRight, Mic } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { getQuestionBank, useInterviewStore, type InterviewType } from "@/stores/interviews";

const CATEGORY_META: Record<InterviewType, { icon: typeof GraduationCap; label: string; subcategories: string[]; targetHint: string }> = {
  academic: {
    icon: GraduationCap,
    label: "Admissão Acadêmica",
    subcategories: ["Motivação", "Pesquisa", "Experiência", "Objetivos", "Situacional"],
    targetHint: "Ex: MSc Computer Science, TU Berlin",
  },
  visa: {
    icon: Stamp,
    label: "Entrevista de Visto",
    subcategories: ["Propósito da viagem", "Financeiro", "Vínculo com Brasil", "Plano de retorno"],
    targetHint: "Ex: Consulado Alemão — São Paulo",
  },
  job: {
    icon: Briefcase,
    label: "Entrevista de Emprego",
    subcategories: ["Comportamental", "Técnica", "Cultura/Fit", "Liderança", "Case study"],
    targetHint: "Ex: Software Engineer — Klarna",
  },
  scholarship: {
    icon: GraduationCap,
    label: "Bolsa de Estudos",
    subcategories: ["Impacto social", "Liderança", "Diversidade", "Plano de carreira"],
    targetHint: "Ex: DAAD Scholarship 2025/26",
  },
  panel: {
    icon: Users,
    label: "Painel/Comitê",
    subcategories: ["Introdução", "Liderança", "Colaboração", "Visão estratégica"],
    targetHint: "Ex: Comitê de seleção internacional",
  },
};

export default function QuestionBankPage() {
  const { sessions } = useInterviewStore();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<InterviewType | "all">("all");

  const questionBank = useMemo(() => getQuestionBank() as Record<InterviewType, string[]>, []);

  const categories = useMemo(() => {
    return (Object.entries(CATEGORY_META) as Array<[InterviewType, typeof CATEGORY_META[InterviewType]]>).map(([type, meta]) => {
      const completedSessions = sessions.filter((session) => session.type === type && session.status === "completed").length;
      return {
        id: type,
        ...meta,
        count: questionBank[type].length,
        completedSessions,
      };
    });
  }, [questionBank, sessions]);

  const allQuestions = useMemo(() => {
    return categories.flatMap((category) =>
      questionBank[category.id].map((question, index) => ({
        id: `${category.id}-${index}`,
        type: category.id,
        label: category.label,
        question,
        practicedCount: sessions.filter((session) => session.answers.some((answer) => answer.question === question)).length,
      }))
    );
  }, [categories, questionBank, sessions]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return allQuestions.filter((entry) => {
      const matchesType = selectedType === "all" || entry.type === selectedType;
      const matchesSearch = !normalizedSearch || entry.question.toLowerCase().includes(normalizedSearch) || entry.label.toLowerCase().includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [allQuestions, search, selectedType]);

  const popularQuestions = useMemo(() => {
    return [...allQuestions]
      .sort((a, b) => b.practicedCount - a.practicedCount || a.question.localeCompare(b.question))
      .slice(0, 6);
  }, [allQuestions]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Banco de Perguntas" subtitle={`${allQuestions.length} perguntas no banco real de entrevistas`} backHref="/interviews" />

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="text" placeholder="Buscar perguntas..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedType("all")} className={`rounded-lg px-4 py-2.5 text-body-sm font-medium transition-colors ${selectedType === "all" ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>
            Todas
          </button>
          {categories.map((category) => (
            <button key={category.id} onClick={() => setSelectedType(category.id)} className={`rounded-lg px-4 py-2.5 text-body-sm font-medium transition-colors ${selectedType === category.id ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="card-surface p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-moss-50 flex items-center justify-center"><cat.icon className="w-5 h-5 text-moss-500" /></div>
              <div>
                <h3 className="font-heading text-h4 text-text-primary">{cat.label}</h3>
                <p className="text-caption text-text-muted">{cat.count} perguntas</p>
              </div>
            </div>
            <p className="mb-3 text-caption text-text-muted">{cat.completedSessions} sessão{cat.completedSessions !== 1 ? "ões" : ""} concluída{cat.completedSessions !== 1 ? "s" : ""} neste tipo</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.subcategories.map((sub) => (
                <span key={sub} className="text-caption px-2 py-0.5 rounded-full bg-cream-200 text-text-muted">{sub}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setSelectedType(cat.id)} className="inline-flex items-center gap-2 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary">
                Ver perguntas
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link href={`/interviews/new?type=${cat.id}&target=${encodeURIComponent(cat.targetHint)}`} className="inline-flex items-center gap-2 text-body-sm font-medium text-moss-500 transition-colors hover:text-moss-600">
                Praticar agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Mais Praticadas</h3>
        <div className="space-y-2">
          {popularQuestions.map((entry) => (
            <Link key={entry.id} href={`/interviews/new?type=${entry.type}&target=${encodeURIComponent(entry.label)}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-100 transition-colors">
              <MessageSquare className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-body-sm text-text-primary">{entry.question}</span>
                <span className="block text-caption text-text-muted">{entry.label} · {entry.practicedCount} prática{entry.practicedCount !== 1 ? "s" : ""}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          ))}
        </div>
      </div>

      <div className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-h4 text-text-primary">Perguntas filtradas</h3>
            <p className="text-body-sm text-text-secondary mt-1">Use este banco como ponto de partida para iniciar uma nova sessão com contexto.</p>
          </div>
          <span className="text-caption text-text-muted">{filteredQuestions.length} resultado{filteredQuestions.length !== 1 ? "s" : ""}</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <EmptyState icon={Search} title="Nenhuma pergunta encontrada" description="Tente ajustar o termo de busca ou trocar o tipo de entrevista selecionado." />
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((entry) => (
              <Link key={entry.id} href={`/interviews/new?type=${entry.type}&target=${encodeURIComponent(entry.label)}`} className="flex items-center gap-3 rounded-lg border border-cream-300 px-4 py-3 transition-colors hover:bg-cream-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100">
                  <Mic className="h-4 w-4 text-moss-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary">{entry.question}</p>
                  <p className="text-caption text-text-muted">{entry.label} · {entry.practicedCount} prática{entry.practicedCount !== 1 ? "s" : ""}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
