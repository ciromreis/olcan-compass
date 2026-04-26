"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, Share2, Compass, ArrowRight } from "lucide-react";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import EnhancedFooter from "@/components/layout/EnhancedFooter";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const questions = [
  {
    id: 1,
    text: "Qual é a sua principal motivação tática para internacionalização?",
    options: [
      { label: "Escapar de um mercado institucionalmente engessado", value: "pioneer" },
      { label: "Atingir o ápice acadêmico ou científico", value: "scholar" },
      { label: "Executar um pivô de carreira em ecossistemas de alta densidade", value: "strategist" },
      { label: "Maximização de liberdade geográfica e lifestyle", value: "diplomat" },
    ],
  },
  {
    id: 2,
    text: "Quando você projeta seu futuro global, qual é o seu pilar de confiança?",
    options: [
      { label: "Minha capacidade de desbravar o desconhecido", value: "pioneer" },
      { label: "Minha especialização técnica e autoridade no tema", value: "scholar" },
      { label: "Minha visão de mercado superior e networking", value: "strategist" },
      { label: "Minha adaptabilidade cultural extrema", value: "diplomat" },
    ],
  },
  {
    id: 3,
    text: "Qual é a principal objeção (Cluster de Medo) que tem te segurado?",
    options: [
      { label: "Medo do Vácuo (não ter infraestrutura inicial)", value: "pioneer" },
      { label: "Medo da Impostora (não ser reconhecido tecnicamente fora)", value: "scholar" },
      { label: "Medo da Burocracia (paralisia frente aos vistos)", value: "strategist" },
      { label: "Medo da Inércia (estar confortável demais hoje)", value: "diplomat" },
    ],
  },
];

const archetypeResults: Record<string, { emoji: string; title: string; subtitle: string; description: string; route: string; product: string }> = {
  scholar: {
    emoji: "🔬",
    title: "O Acadêmico (Scholar)",
    subtitle: "Perfil Global — Especialista em Inovação",
    description: "Sua trajetória é pautada por conhecimento profundo e especialização. A Inteligência Olcan identifica que o seu caminho de menor resistência para os EUA envolve a construção de um Dossiê EB-2 NIW focado no impacto nacional da sua pesquisa ou expertise.",
    route: "/framework/scholar",
    product: "Dossiê EB-2 NIW",
  },
  diplomat: {
    emoji: "🌐",
    title: "O Diplomata (Diplomat)",
    subtitle: "Perfil Global — Liderança Intercultural",
    description: "Sua inteligência cultural e capacidade de transitar entre mundos é sua maior força. O Compass desenha sua rota otimizando vistos e networks que demandam alta agilidade relacional e liderança intercultural.",
    route: "/framework/diplomat",
    product: "Rota Cross-Border",
  },
  strategist: {
    emoji: "♟️",
    title: "O Estrategista (Strategist)",
    subtitle: "Perfil Global — Execução de Alta Performance",
    description: "Para você, a imigração é um jogo de xadrez corporativo. A sua Energia Cinética é destravada quando você possui clareza do ROI da transição. Nossa plataforma ajudará a construir o Business Plan O-1A que o mercado americano exige.",
    route: "/framework/strategist",
    product: "Business Plan O-1",
  },
  pioneer: {
    emoji: "🚀",
    title: "O Pioneiro (Pioneer)",
    subtitle: "Perfil Global — Desbravador de Ecossistemas",
    description: "Você opera na fronteira do risco. Mercados engessados são prisões para sua ambição. A sua trajetória estratégica foca na mitigação de riscos iniciais, criando conexões no Vale do Silício ou hubs similares para suportar sua aterrisagem.",
    route: "/framework/pioneer",
    product: "Compass Landing",
  },
};

function getArchetype(answers: string[]): keyof typeof archetypeResults {
  const counts: Record<string, number> = {};
  for (const a of answers) {
    counts[a] = (counts[a] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof typeof archetypeResults || "strategist";
  return top;
}

export default function DiagnosticoPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const archetype = done ? archetypeResults[getArchetype(answers)] : null;

  function handleOption(value: string) {
    setSelected(value);
    setTimeout(() => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 400);
  }

  return (
    <main className="bg-cream min-h-screen selection:bg-[#001338] selection:text-white flex flex-col noise relative overflow-hidden">
      <EnhancedNavbar />
      
      <section className="flex-1 relative z-10 flex items-center justify-center pt-32 pb-24">
        {/* Background light glass effect */}
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-olcan-navy/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 w-full max-w-2xl">
          {!done ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="card-olcan p-8 md:p-14"
              >
                {/* Header / Progress */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-olcan-navy/5 border border-olcan-navy/10">
                      <Compass className="w-5 h-5 text-olcan-navy" />
                    </div>
                    <span className="text-olcan-navy/40 text-[10px] font-bold uppercase tracking-wide">Intelligência de Posicionamento</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-olcan-navy/5 border border-olcan-navy/10 text-olcan-navy/40 text-[10px] font-mono tracking-tighter">
                    STEP {current + 1} / {questions.length}
                  </div>
                </div>
                
                {/* Progress Bar - XP Style */}
                <div className="w-full h-1.5 bg-olcan-navy/5 rounded-full mb-12 overflow-hidden border border-olcan-navy/5 p-[1px]">
                  <motion.div 
                    className="h-full xp-bar"
                    initial={{ width: `${(current / questions.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                  />
                </div>

                <h1 className="font-display text-3xl md:text-5xl text-olcan-navy mb-12 leading-[1.1] tracking-tight">
                  {q.text}
                </h1>

                <div className="flex flex-col gap-5">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOption(opt.value)}
                      className={`text-left p-6 md:p-8 rounded-[1.5rem] border-2 font-sans text-lg transition-all duration-400 group relative overflow-hidden ${
                        selected === opt.value
                          ? "border-olcan-navy bg-olcan-navy text-white shadow-2xl scale-[1.02]"
                          : "bg-white/40 border-white/40 text-olcan-navy/70 hover:border-olcan-navy/30 hover:bg-white/60 hover:text-olcan-navy"
                      }`}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-medium leading-relaxed">{opt.label}</span>
                        <ArrowRight className={`w-5 h-5 transition-all transform duration-500 ${selected === opt.value ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                      </div>
                    </button>
                  ))}
                </div>

                {current > 0 && (
                  <button
                    className="mt-10 flex items-center gap-2 text-olcan-navy/30 hover:text-olcan-navy text-xs font-bold uppercase tracking-widest transition-colors"
                    onClick={() => { setCurrent((c) => c - 1); setAnswers((a) => a.slice(0, -1)); setSelected(null); }}
                  >
                    <ArrowLeft size={14} /> Voltar
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          ) : archetype ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="card-olcan p-12 md:p-20 relative overflow-hidden border-2 border-white/60">
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/5 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-9xl mb-12 drop-shadow-2xl companion-float">{archetype.emoji}</div>
                  <div className="fear-pill mb-10 border-olcan-navy/10 bg-white/40">
                    {archetype.subtitle}
                  </div>
                  <h2 className="font-display text-5xl sm:text-7xl text-olcan-navy mb-8 tracking-tighter">
                    {archetype.title}
                  </h2>
                  <p className="text-olcan-navy/60 font-medium text-xl leading-relaxed max-w-xl mb-14">
                    {archetype.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                    <Link 
                      href={`${API_ENDPOINTS.app.base}/register?archetype=${archetype.title}`} 
                      className="btn-primary flex-1 py-5 text-lg group"
                    >
                      <Sparkles className="w-5 h-5" />
                      Acessar bússola
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                    <button className="btn-secondary flex-1 py-5 text-lg group">
                      <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
