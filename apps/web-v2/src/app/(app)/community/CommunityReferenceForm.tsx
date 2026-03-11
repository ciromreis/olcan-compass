import { Bookmark } from "lucide-react";
import { Input, Textarea } from "@/components/ui";
import type { CommunityItemTopic } from "@/stores/community";

interface CommunityReferenceFormProps {
  title: string;
  body: string;
  source: string;
  url: string;
  topic: CommunityItemTopic;
  activeCollectionName?: string;
  topicLabels: Record<CommunityItemTopic, string>;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onTopicChange: (value: CommunityItemTopic) => void;
  onSubmit: () => void;
}

export function CommunityReferenceForm({
  title,
  body,
  source,
  url,
  topic,
  activeCollectionName,
  topicLabels,
  onTitleChange,
  onBodyChange,
  onSourceChange,
  onUrlChange,
  onTopicChange,
  onSubmit,
}: CommunityReferenceFormProps) {
  return (
    <section className="card-surface p-5 space-y-4">
      <div>
        <h2 className="font-heading text-h4 text-text-primary">Salvar referência</h2>
        <p className="text-body-sm text-text-secondary">Capture posts, links e exemplos que depois podem virar insumo para candidaturas e decisões.</p>
      </div>
      <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3">
        <p className="text-caption font-medium text-sage-700">Destino atual do salvamento</p>
        <p className="text-body-sm text-sage-900">{activeCollectionName ? activeCollectionName : "Coleção padrão"}</p>
      </div>
      <Input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Título da referência" />
      <Input value={source} onChange={(event) => onSourceChange(event.target.value)} placeholder="Fonte (ex: LinkedIn, X, YouTube, blog)" />
      <Input value={url} onChange={(event) => onUrlChange(event.target.value)} placeholder="URL opcional" />
      <select value={topic} onChange={(event) => onTopicChange(event.target.value as CommunityItemTopic)} className="w-full rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
        {Object.entries(topicLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Textarea value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder="Resuma por que isso é útil e onde pode ser reaproveitado." rows={4} />
      <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-lg bg-sage-500 px-4 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-sage-600">
        <Bookmark className="h-4 w-4" />
        Salvar na base
      </button>
    </section>
  );
}
