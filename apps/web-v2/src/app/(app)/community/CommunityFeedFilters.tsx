import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import type { CommunityItemTopic, CommunityItemType, CommunitySourceRef } from "@/stores/community";

type FeedFilter = "all" | CommunityItemType;
type EngineFilter = "all" | CommunitySourceRef["engine"];

interface CommunityFeedFiltersProps {
  search: string;
  typeFilter: FeedFilter;
  topicFilter: CommunityItemTopic | "all";
  engineFilter: EngineFilter;
  selectedCollectionName?: string;
  topicLabels: Record<CommunityItemTopic, string>;
  typeLabels: Record<CommunityItemType, string>;
  engineLabels: Record<Exclude<EngineFilter, "all">, string>;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: FeedFilter) => void;
  onTopicFilterChange: (value: CommunityItemTopic | "all") => void;
  onEngineFilterChange: (value: EngineFilter) => void;
  onClearCollectionFilter: () => void;
}

export function CommunityFeedFilters({
  search,
  typeFilter,
  topicFilter,
  engineFilter,
  selectedCollectionName,
  topicLabels,
  typeLabels,
  engineLabels,
  onSearchChange,
  onTypeFilterChange,
  onTopicFilterChange,
  onEngineFilterChange,
  onClearCollectionFilter,
}: CommunityFeedFiltersProps) {
  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar referências, perguntas, autores ou tags..."
          icon={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value as FeedFilter)} className="rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
            <option value="all">Todos os tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={topicFilter} onChange={(event) => onTopicFilterChange(event.target.value as CommunityItemTopic | "all")} className="rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
            <option value="all">Todos os temas</option>
            {Object.entries(topicLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={engineFilter} onChange={(event) => onEngineFilterChange(event.target.value as EngineFilter)} className="rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
            <option value="all">Todas as origens</option>
            {Object.entries(engineLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {selectedCollectionName ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3">
          <div>
            <p className="text-body-sm font-medium text-text-primary">Filtrando por coleção</p>
            <p className="text-caption text-text-muted">{selectedCollectionName}</p>
          </div>
          <button onClick={onClearCollectionFilter} className="rounded-lg border border-cream-500 px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors hover:bg-cream-200">
            Limpar filtro
          </button>
        </div>
      ) : null}
    </div>
  );
}
