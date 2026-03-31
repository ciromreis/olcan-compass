"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Target, GitMerge, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useSprintStore } from "@/stores/sprints";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ORCHESTRATOR_TEMPLATES = [
  { id: "academic", label: "Readiness Acadêmica", dimension: "Acadêmica", icon: Target },
  { id: "visa", label: "Relocation & Visto", dimension: "Logística", icon: GitMerge },
  { id: "interview", label: "Preparação Mocks", dimension: "Entrevista", icon: Sparkles },
];

export function SprintOrchestratorModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addSprint } = useSprintStore();
  const [selectedTemplate, setSelectedTemplate] = useState(ORCHESTRATOR_TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<{name: string, daysOut: number}[]>([]);

  // @ts-ignore
  const archetype = user?.dominant_archetype || user?.psychProfile?.dominant_archetype || "The Pioneer";

  const handleGenerateDAG = () => {
    setIsGenerating(true);
    setGeneratedSteps([]);
    
    // Simulate API delay for AI orchestration
    setTimeout(() => {
      // Mock DAG route tailored by archetype
      const path = [
        { name: `[${archetype}] Definir milestone inicial`, daysOut: 2 },
        { name: "Levantar documentação baseline", daysOut: 5 },
        { name: "Agendar sessão de mentoria", daysOut: 7 },
        { name: "Reconhecimento de gaps do perfil", daysOut: 11 },
        { name: "Entrega Final", daysOut: 14 }
      ];
      setGeneratedSteps(path);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCommit = async () => {
    setIsGenerating(true);
    try {
      const target = new Date();
      target.setDate(target.getDate() + 14);

      const tasksObj = generatedSteps.map((step, idx) => {
        const d = new Date();
        d.setDate(d.getDate() + step.daysOut);
        return {
          id: `tmp-${idx}`,
          name: step.name,
          done: false,
          dueDate: d.toISOString().slice(0, 10),
        };
      });

      const newSprint = await addSprint({
        id: "temp",
        name: `Trilha: ${selectedTemplate.label}`,
        dimension: selectedTemplate.dimension,
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
        targetDate: target.toISOString().slice(0, 10),
        tasks: tasksObj
      });

      if (newSprint) {
        onClose();
        router.push(`/sprints/${newSprint.id}`);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error(e);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-nanobanana-500/30 rounded-2xl shadow-2xl shadow-nanobanana-500/10 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-nanobanana-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-nanobanana-400" />
                  </div>
                  <div>
                    <Dialog.Title className="font-heading text-h4 text-white">
                      Orquestrador de Sprints
                    </Dialog.Title>
                    <Dialog.Description className="text-body-sm text-slate-400">
                      Geração inteligente de rotas e tarefas personalizadas.
                    </Dialog.Description>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {!generatedSteps.length ? (
                  <>
                    <h3 className="text-body font-medium text-white mb-3">1. Selecione o Objetivo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ORCHESTRATOR_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            selectedTemplate.id === tpl.id 
                              ? "bg-nanobanana-500/10 border-nanobanana-500 shadow-[0_0_15px_rgba(255,235,59,0.15)]" 
                              : "bg-white/5 border-white/10 hover:border-white/30"
                          )}
                        >
                          <tpl.icon className={cn("w-6 h-6 mb-2", selectedTemplate.id === tpl.id ? "text-nanobanana-400" : "text-slate-400")} />
                          <p className="font-heading font-medium text-white text-sm">{tpl.label}</p>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-sm text-slate-300">
                      Perfil ativo: <span className="text-nanobanana-400 font-medium">{archetype}</span>.<br />
                      A inteligência irá orquestrar sua rota compensando as vulnerabilidades deste arquétipo.
                    </div>

                    <button
                      onClick={handleGenerateDAG}
                      disabled={isGenerating}
                      className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-nanobanana-500 hover:bg-nanobanana-600 text-slate-900 font-heading font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Mapeando Rotas...</> : <><GitMerge className="w-5 h-5" /> Gerar Rota Personalizada</>}
                    </button>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h3 className="text-body font-medium text-white">2. Orquestração Validada</h3>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {generatedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="w-6 h-6 rounded-full bg-nanobanana-500/20 text-nanobanana-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <p className="flex-1 text-sm text-white">{step.name}</p>
                          <span className="text-xs text-slate-400 font-mono">D+{step.daysOut}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleCommit}
                      disabled={isGenerating}
                      className="w-full py-3 px-4 mt-4 flex items-center justify-center gap-2 bg-nanobanana-500 hover:bg-nanobanana-600 text-slate-900 font-heading font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,235,59,0.3)] disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submeter Sprint em Massa <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </motion.div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
