import { FolderOpen, Shapes } from "lucide-react";
import { Input, Textarea } from "@/components/ui";
import type { CommunityCollection } from "@/stores/community";

interface CommunityCollectionsPanelProps {
  collections: CommunityCollection[];
  selectedCollectionId: string | null;
  activeCollectionName?: string;
  collectionName: string;
  collectionDescription: string;
  onSelectCollection: (collectionId: string) => void;
  onCollectionNameChange: (value: string) => void;
  onCollectionDescriptionChange: (value: string) => void;
  onCreateCollection: () => void;
}

export function CommunityCollectionsPanel({
  collections,
  selectedCollectionId,
  activeCollectionName,
  collectionName,
  collectionDescription,
  onSelectCollection,
  onCollectionNameChange,
  onCollectionDescriptionChange,
  onCreateCollection,
}: CommunityCollectionsPanelProps) {
  return (
    <section className="card-surface p-5 space-y-4">
      <div>
        <h2 className="font-heading text-h4 text-text-primary">Coleções</h2>
        <p className="text-body-sm text-text-secondary">Organize seu Pinterest operacional em boards reutilizáveis e compartilháveis.</p>
      </div>
      <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3">
        <p className="text-caption font-medium text-sage-700">Coleção ativa para salvamentos</p>
        <p className="text-body-sm text-sage-900">{activeCollectionName ? activeCollectionName : "Coleção padrão"}</p>
      </div>
      <div className="space-y-3">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => onSelectCollection(collection.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selectedCollectionId === collection.id ? "border-sage-300 bg-sage-50" : "border-cream-300 bg-cream-50 hover:bg-cream-100"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-body text-text-primary">{collection.name}</p>
                <p className="text-caption text-text-muted">{collection.description}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-caption text-text-secondary">{collection.visibility === "shared" ? "Compartilhada" : "Privada"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-caption text-text-muted">
              <FolderOpen className="h-3.5 w-3.5" />
              {collection.itemIds.length} itens
            </div>
          </button>
        ))}
      </div>
      <Input value={collectionName} onChange={(event) => onCollectionNameChange(event.target.value)} placeholder="Nome da nova coleção" />
      <Textarea value={collectionDescription} onChange={(event) => onCollectionDescriptionChange(event.target.value)} placeholder="Descreva o foco dessa coleção." rows={3} />
      <button onClick={onCreateCollection} className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-4 py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:bg-cream-200">
        <Shapes className="h-4 w-4" />
        Criar coleção compartilhada
      </button>
    </section>
  );
}
