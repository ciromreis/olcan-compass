import { Plus } from "lucide-react";
import { Input, Textarea } from "@/components/ui";
import type { CommunityItemTopic } from "@/stores/community";

interface CommunityQuestionFormProps {
  title: string;
  body: string;
  topic: CommunityItemTopic;
  topicLabels: Record<CommunityItemTopic, string>;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onTopicChange: (value: CommunityItemTopic) => void;
  onSubmit: () => void;
}

export function CommunityQuestionForm({
  title,
  body,
  topic,
  topicLabels,
  onTitleChange,
  onBodyChange,
  onTopicChange,
  onSubmit,
}: CommunityQuestionFormProps) {
  return (
    <section className="card-surface p-5 space-y-4">
      <div>
        <h2 className="font-heading text-h4 text-text-primary">Pergunta temática</h2>
        <p className="text-body-sm text-text-secondary">Abra dúvidas que geram inteligência coletiva dentro do fluxo da mobilidade.</p>
      </div>
      <Input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Ex: como diferenciar uma narrativa forte de uma genérica?" />
      <select value={topic} onChange={(event) => onTopicChange(event.target.value as CommunityItemTopic)} className="w-full rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
        {Object.entries(topicLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Textarea value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder="Descreva o contexto da sua dúvida e o tipo de resposta que ajudaria." rows={4} />
      <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-lg bg-moss-500 px-4 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-moss-600">
        <Plus className="h-4 w-4" />
        Publicar pergunta
      </button>
    </section>
  );
}
