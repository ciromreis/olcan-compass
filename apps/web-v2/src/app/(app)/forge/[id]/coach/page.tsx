"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Send, Sparkles, User, CheckCircle2, Trash2 } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { PageHeader, EmptyState, Button } from "@/components/ui";
import { generateCoachTips } from "@/lib/analysis";
import { wordCount } from "@/lib/format";
import { useForgeStore, type CoachMessage } from "@/stores/forge";

const QUICK_PROMPTS = [
  "Como deixar a abertura menos genérica?",
  "Quais evidências concretas faltam neste texto?",
  "Como conectar melhor minha experiência ao programa?",
  "Onde meu texto parece clichê demais?",
];

function formatInitialTips(tips: string[]): string {
  if (tips.length === 0) return "Seu documento está bem encaminhado! Posso ajudar a refinar algum trecho específico. O que gostaria de melhorar?";
  return `Analisei seu documento e identifiquei ${tips.length} ponto${tips.length > 1 ? "s" : ""} de melhoria:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nPor qual gostaria de começar?`;
}

function generateReply(input: string, content: string): string {
  const lc = input.toLowerCase();
  if (lc.includes("professor") || lc.includes("pesquisa") || lc.includes("research")) {
    return "Para mencionar um professor, pesquise no site da universidade as linhas de pesquisa que se conectam com sua experiência. Exemplo: \"I am particularly drawn to Prof. [Name]'s work on [topic], which aligns with my experience in [your experience].\"";
  }
  if (lc.includes("objetivo") || lc.includes("carreira") || lc.includes("futuro") || lc.includes("career") || lc.includes("goal")) {
    return "Um bom fechamento conecta o programa com sua visão de futuro. Tente: \"Após concluir o mestrado, planejo [objetivo concreto], e a formação em [programa] me dará [competência específica] para isso.\"";
  }
  if (lc.includes("clichê") || lc.includes("cliche") || lc.includes("passionate")) {
    return "Em vez de 'I am passionate about X', mostre com ações: 'Having built [project] that [result], I developed a deep understanding of X.' Evidências > declarações.";
  }
  if (lc.includes("estrutura") || lc.includes("parágrafo") || lc.includes("organiz")) {
    return "Estrutura recomendada:\n1. **Abertura** — gancho + programa-alvo\n2. **Background** — experiência relevante\n3. **Por que este programa** — pesquisa, professor, currículo\n4. **Plano futuro** — como o programa contribui\n5. **Fechamento** — reafirmação e call-to-action";
  }
  const wc = wordCount(content);
  return `Entendi sua pergunta! Com base no seu documento atual (${wc} palavras), sugiro focar em tornar cada parágrafo mais específico. Pode me mostrar o trecho que quer melhorar?`;
}

export default function CoachPage() {
  const { docId, doc, stats } = useDocument();
  const { coachThreads, setCoachThread, appendCoachMessage, clearCoachThread } = useForgeStore();

  const initialMessages = useMemo<CoachMessage[]>(() => {
    if (!doc || !stats) {
      return [{
        id: "coach-fallback",
        role: "assistant",
        text: "Documento não encontrado.",
        createdAt: new Date().toISOString(),
      }];
    }
    const tips = generateCoachTips(doc.content, doc.targetProgram);
    return [{
      id: `coach-seed-${doc.id}`,
      role: "assistant",
      text: `Olá! Sou o Coach do Forge para o seu documento \u201C${doc.title}\u201D (${stats.typeLabel}).\n\n${formatInitialTips(tips)}`,
      createdAt: doc.updatedAt,
    }];
  }, [doc, stats]);

  const [input, setInput] = useState("");
  const messages = coachThreads[docId] && coachThreads[docId].length > 0 ? coachThreads[docId] : initialMessages;

  useEffect(() => {
    if (doc && stats && (!coachThreads[docId] || coachThreads[docId].length === 0)) {
      setCoachThread(docId, initialMessages);
    }
  }, [coachThreads, doc, docId, initialMessages, setCoachThread, stats]);

  const handleSend = (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || !doc) return;
    appendCoachMessage(docId, { role: "user", text: content });
    appendCoachMessage(docId, { role: "assistant", text: generateReply(content, doc.content) });
    if (!preset) setInput("");
  };

  const handleReset = () => {
    if (!doc) return;
    clearCoachThread(docId);
    setCoachThread(docId, initialMessages);
    setInput("");
  };

  if (!doc) {
    return <EmptyState icon={Sparkles} title="Documento não encontrado" action={<Link href="/forge" className="text-moss-500 font-medium hover:underline">← Voltar</Link>} />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title="Coach Mode"
        subtitle={doc.title}
        backHref={`/forge/${docId}`}
        className="mb-4"
        actions={
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <Trash2 className="w-4 h-4" /> Reiniciar conversa
          </Button>
        }
      />

      <div className="px-3 py-2 mb-3 rounded-lg bg-moss-50 text-moss-700 text-caption flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        Coach persistente local. O histórico desta conversa fica salvo por documento.
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="rounded-full border border-cream-400 bg-white px-3 py-1.5 text-caption text-text-secondary hover:bg-cream-100 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-moss-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-moss-500" />
              </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === "user" ? "bg-moss-500 text-white" : "card-surface"}`}>
              <p className={`text-body-sm whitespace-pre-wrap ${msg.role === "user" ? "text-white" : "text-text-primary"}`}>{msg.text}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-text-muted" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte sobre seu documento..."
          className="flex-1 px-4 py-3 rounded-xl border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent"
        />
        <button onClick={() => handleSend()} className="px-4 py-3 rounded-xl bg-moss-500 text-white hover:bg-moss-600 transition-colors">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
