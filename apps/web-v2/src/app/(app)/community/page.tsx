"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
} from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { useHydration } from "@/hooks/use-hydration";
import { useAuthStore } from "@/stores/auth";
import { useCommunityStore, type CommunityItemTopic, type CommunityItemType, type CommunitySourceRef } from "@/stores/community";
import { CommunityCollectionsPanel } from "./CommunityCollectionsPanel";
import { CommunityFeedFilters } from "./CommunityFeedFilters";
import { CommunityFeedItem } from "./CommunityFeedItem";
import { CommunityQuestionForm } from "./CommunityQuestionForm";
import { CommunityReferenceForm } from "./CommunityReferenceForm";

type FeedFilter = "all" | CommunityItemType;
type EngineFilter = "all" | CommunitySourceRef["engine"];

const TOPIC_LABELS: Record<CommunityItemTopic, string> = {
  narrative: "Narrativa",
  visa: "Vistos",
  scholarship: "Bolsas",
  interview: "Entrevistas",
  career: "Carreira",
  readiness: "Prontidão",
  community: "Comunidade",
};

const TYPE_LABELS: Record<CommunityItemType, string> = {
  olcan_post: "Conteúdo Olcan",
  saved_reference: "Referência salva",
  artifact: "Artefato",
  question: "Pergunta",
};

const ENGINE_LABELS = {
  forge: "Forge",
  applications: "Applications",
  routes: "Routes",
} as const;

export default function CommunityPage() {
  const ready = useHydration();
  const { user } = useAuthStore();
  const {
    items,
    collections,
    createQuestion,
    saveReference,
    toggleLike,
    toggleSave,
    addReply,
    createCollection,
    getStats,
  } = useCommunityStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FeedFilter>("all");
  const [topicFilter, setTopicFilter] = useState<CommunityItemTopic | "all">("all");
  const [engineFilter, setEngineFilter] = useState<EngineFilter>("all");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionTopic, setQuestionTopic] = useState<CommunityItemTopic>("community");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [referenceBody, setReferenceBody] = useState("");
  const [referenceSource, setReferenceSource] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceTopic, setReferenceTopic] = useState<CommunityItemTopic>("narrative");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const stats = getStats();
  const activeCollectionId = selectedCollectionId ?? collections[0]?.id;
  const activeCollectionName = collections.find((collection) => collection.id === activeCollectionId)?.name;
  const selectedCollectionName = collections.find((collection) => collection.id === selectedCollectionId)?.name;

  const feed = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...items]
      .filter((item) => {
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesTopic = topicFilter === "all" || item.topic === topicFilter;
        const matchesEngine = engineFilter === "all" || item.sourceRef?.engine === engineFilter;
        const matchesCollection = !selectedCollectionId || item.collectionIds?.includes(selectedCollectionId);
        const matchesSearch = !term
          || item.title.toLowerCase().includes(term)
          || item.description.toLowerCase().includes(term)
          || item.tags.some((tag) => tag.toLowerCase().includes(term))
          || item.author.toLowerCase().includes(term);
        return matchesType && matchesTopic && matchesEngine && matchesCollection && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [engineFilter, items, search, selectedCollectionId, topicFilter, typeFilter]);

  const handleCreateQuestion = () => {
    if (!questionTitle.trim() || !questionBody.trim()) return;
    createQuestion({
      title: questionTitle.trim(),
      description: questionBody.trim(),
      topic: questionTopic,
      author: user?.full_name || "Você",
    });
    setQuestionTitle("");
    setQuestionBody("");
    setQuestionTopic("community");
  };

  const handleSaveReference = () => {
    if (!referenceTitle.trim() || !referenceBody.trim() || !referenceSource.trim()) return;
    saveReference({
      title: referenceTitle.trim(),
      description: referenceBody.trim(),
      topic: referenceTopic,
      author: user?.full_name || "Você",
      source: referenceSource.trim(),
      href: referenceUrl.trim() || undefined,
      tags: [referenceTopic, referenceSource.trim()],
      collectionId: activeCollectionId,
    });
    setReferenceTitle("");
    setReferenceBody("");
    setReferenceSource("");
    setReferenceUrl("");
    setReferenceTopic("narrative");
  };

  const handleCreateCollection = () => {
    if (!collectionName.trim() || !collectionDescription.trim()) return;
    createCollection({
      name: collectionName.trim(),
      description: collectionDescription.trim(),
      visibility: "shared",
    });
    setCollectionName("");
    setCollectionDescription("");
  };

  const handleReplyChange = (itemId: string, value: string) => {
    setReplyDrafts((current) => ({
      ...current,
      [itemId]: value,
    }));
  };

  const handleReplySubmit = (itemId: string) => {
    const body = replyDrafts[itemId]?.trim();
    if (!body) return;
    addReply(itemId, {
      author: user?.full_name || "Você",
      body,
    });
    setReplyDrafts((current) => ({
      ...current,
      [itemId]: "",
    }));
  };

  if (!ready) {
    return <div className="max-w-6xl mx-auto" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Conteúdo & Comunidade"
        subtitle="Transforme referências, artefatos e conversas em vantagem operacional para sua mobilidade"
        actions={
          <Link href="/forge" className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-4 py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:bg-cream-200">
            <Sparkles className="h-4 w-4" />
            Ir para Documentos
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-text-primary">{stats.total}</p>
          <p className="text-caption text-text-muted">Itens no ecossistema</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-brand-500">{stats.saved}</p>
          <p className="text-caption text-text-muted">Salvos por você</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-text-primary">{stats.questions}</p>
          <p className="text-caption text-text-muted">Perguntas temáticas</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-sage-500">{stats.sharedCollections}</p>
          <p className="text-caption text-text-muted">Coleções compartilhadas</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <CommunityFeedFilters
            search={search}
            typeFilter={typeFilter}
            topicFilter={topicFilter}
            engineFilter={engineFilter}
            selectedCollectionName={selectedCollectionName}
            topicLabels={TOPIC_LABELS}
            typeLabels={TYPE_LABELS}
            engineLabels={ENGINE_LABELS}
            onSearchChange={setSearch}
            onTypeFilterChange={setTypeFilter}
            onTopicFilterChange={setTopicFilter}
            onEngineFilterChange={setEngineFilter}
            onClearCollectionFilter={() => setSelectedCollectionId(null)}
          />

          {feed.length === 0 ? (
            <EmptyState icon={BookOpen} title="Nada encontrado" description="Ajuste os filtros ou comece salvando sua primeira referência." />
          ) : (
            <div className="grid gap-4">
              {feed.map((item) => (
                <CommunityFeedItem
                  key={item.id}
                  item={item}
                  collectionId={activeCollectionId}
                  collectionNames={(item.collectionIds || [])
                    .map((collectionId) => collections.find((collection) => collection.id === collectionId)?.name)
                    .filter((collectionName): collectionName is string => Boolean(collectionName))}
                  activeCollectionName={selectedCollectionName}
                  replyDraft={replyDrafts[item.id] || ""}
                  engineLabels={ENGINE_LABELS}
                  topicLabels={TOPIC_LABELS}
                  typeLabels={TYPE_LABELS}
                  onToggleSave={toggleSave}
                  onToggleLike={toggleLike}
                  onReplyChange={handleReplyChange}
                  onReplySubmit={handleReplySubmit}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <CommunityQuestionForm
            title={questionTitle}
            body={questionBody}
            topic={questionTopic}
            topicLabels={TOPIC_LABELS}
            onTitleChange={setQuestionTitle}
            onBodyChange={setQuestionBody}
            onTopicChange={setQuestionTopic}
            onSubmit={handleCreateQuestion}
          />

          <CommunityReferenceForm
            title={referenceTitle}
            body={referenceBody}
            source={referenceSource}
            url={referenceUrl}
            topic={referenceTopic}
            activeCollectionName={activeCollectionName}
            topicLabels={TOPIC_LABELS}
            onTitleChange={setReferenceTitle}
            onBodyChange={setReferenceBody}
            onSourceChange={setReferenceSource}
            onUrlChange={setReferenceUrl}
            onTopicChange={setReferenceTopic}
            onSubmit={handleSaveReference}
          />

          <CommunityCollectionsPanel
            collections={collections}
            selectedCollectionId={selectedCollectionId}
            activeCollectionName={activeCollectionName}
            collectionName={collectionName}
            collectionDescription={collectionDescription}
            onSelectCollection={(collectionId) => setSelectedCollectionId((current) => current === collectionId ? null : collectionId)}
            onCollectionNameChange={setCollectionName}
            onCollectionDescriptionChange={setCollectionDescription}
            onCreateCollection={handleCreateCollection}
          />
        </div>
      </div>
    </div>
  );
}
