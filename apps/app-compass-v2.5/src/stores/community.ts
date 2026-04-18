import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CommunityItemType = "olcan_post" | "saved_reference" | "artifact" | "question";
export type CommunityItemTopic = "narrative" | "visa" | "scholarship" | "interview" | "career" | "readiness" | "community";

export interface CommunitySourceRef {
  engine: "forge" | "applications" | "routes";
  entityId: string;
  entityLabel?: string;
}

export interface CommunityReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface CommunityItem {
  id: string;
  type: CommunityItemType;
  title: string;
  description: string;
  author: string;
  topic: CommunityItemTopic;
  savedCount: number;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  href?: string;
  source?: string;
  sourceRef?: CommunitySourceRef;
  collectionIds?: string[];
  tags: string[];
  replies?: CommunityReply[];
  isSaved?: boolean;
  isLiked?: boolean;
  isOfficial?: boolean;
}

export interface CommunityCollection {
  id: string;
  name: string;
  description: string;
  visibility: "private" | "shared";
  itemIds: string[];
}

interface CommunityState {
  items: CommunityItem[];
  collections: CommunityCollection[];
  createQuestion: (payload: { title: string; description: string; topic: CommunityItemTopic; author: string }) => void;
  saveReference: (payload: { title: string; description: string; topic: CommunityItemTopic; author: string; source: string; href?: string; tags?: string[]; collectionId?: string }) => void;
  saveArtifact: (payload: { title: string; description: string; topic: CommunityItemTopic; author: string; source: string; href?: string; tags?: string[]; collectionId?: string; sourceRef: CommunitySourceRef }) => void;
  toggleSave: (itemId: string, collectionId?: string) => void;
  toggleLike: (itemId: string) => void;
  addReply: (itemId: string, payload: { author: string; body: string }) => void;
  createCollection: (payload: { name: string; description: string; visibility: "private" | "shared" }) => void;
  getStats: () => { total: number; saved: number; questions: number; sharedCollections: number };
  fetchPosts: () => Promise<void>;
  reset: () => void;
}

const SEED_COLLECTIONS: CommunityCollection[] = [
  {
    id: "col1",
    name: "Referências para essays",
    description: "Exemplos e estruturas que ajudam a melhorar narrativa e posicionamento.",
    visibility: "shared",
    itemIds: ["ci2", "ci4"],
  },
  {
    id: "col2",
    name: "Vida prática na Alemanha",
    description: "Materiais salvos sobre chegada, vistos e adaptação.",
    visibility: "private",
    itemIds: ["ci3"],
  },
];

const SEED_ITEMS: CommunityItem[] = [
  {
    id: "ci1",
    type: "olcan_post",
    title: "Como estruturar uma candidatura internacional sem se perder",
    description: "Guia Olcan sobre como dividir a jornada em rota, prontidão, narrativa e execução.",
    author: "Equipe Olcan",
    topic: "readiness",
    savedCount: 31,
    likeCount: 24,
    replyCount: 2,
    createdAt: "2026-03-05T10:00:00Z",
    href: "/dashboard",
    tags: ["guia", "prontidão", "estratégia"],
    replies: [
      { id: "rep1", author: "Marina", body: "Esse framework ajudou a organizar meu caos mental antes de aplicar.", createdAt: "2026-03-05T12:00:00Z" },
      { id: "rep2", author: "Lucas", body: "Seria ótimo ver isso conectado com modelos de rotas por país.", createdAt: "2026-03-05T15:00:00Z" },
    ],
  },
  {
    id: "ci2",
    type: "saved_reference",
    title: "Thread com exemplos fortes de personal statement",
    description: "Referência salva do X/Twitter com padrões de abertura, especificidade e motivação.",
    author: "Ciro",
    topic: "narrative",
    savedCount: 18,
    likeCount: 11,
    replyCount: 1,
    createdAt: "2026-03-04T09:30:00Z",
    source: "X / Twitter",
    href: "https://example.com/reference/personal-statement",
    collectionIds: ["col1"],
    tags: ["essay", "personal statement", "exemplos"],
    isSaved: true,
    replies: [
      { id: "rep3", author: "Ana", body: "Salvei também. Tem bons exemplos de tom sem soar genérico.", createdAt: "2026-03-04T12:30:00Z" },
    ],
  },
  {
    id: "ci3",
    type: "artifact",
    title: "Checklist pessoal de chegada em Berlim",
    description: "Resumo salvo com passos de visto, moradia temporária, anmeldung e conta bancária.",
    author: "Rafaela",
    topic: "visa",
    savedCount: 12,
    likeCount: 8,
    replyCount: 0,
    createdAt: "2026-03-03T14:00:00Z",
    collectionIds: ["col2"],
    tags: ["berlim", "chegada", "logística"],
  },
  {
    id: "ci4",
    type: "question",
    title: "Quais sinais fazem uma carta de motivação parecer genérica?",
    description: "Quero entender o que vocês revisam primeiro quando avaliam se a narrativa está fraca ou clichê.",
    author: "João",
    topic: "narrative",
    savedCount: 9,
    likeCount: 17,
    replyCount: 2,
    createdAt: "2026-03-02T19:00:00Z",
    tags: ["carta de motivação", "feedback", "narrativa"],
    replies: [
      { id: "rep4", author: "Equipe Olcan", body: "Falta de especificidade, excesso de adjetivos e pouca evidência concreta costumam ser os primeiros sinais.", createdAt: "2026-03-02T20:00:00Z" },
      { id: "rep5", author: "Beatriz", body: "Quando todo parágrafo poderia servir para qualquer país ou programa, geralmente está genérico.", createdAt: "2026-03-02T21:30:00Z" },
    ],
  },
];

function syncCollectionMembership(
  collections: CommunityCollection[],
  itemId: string,
  collectionId?: string,
  shouldAttach?: boolean,
): CommunityCollection[] {
  if (!collectionId) return collections;
  return collections.map((collection) => {
    if (collection.id !== collectionId) return collection;
    const alreadyIncluded = collection.itemIds.includes(itemId);
    if (shouldAttach && !alreadyIncluded) {
      return { ...collection, itemIds: [...collection.itemIds, itemId] };
    }
    if (!shouldAttach && alreadyIncluded) {
      return { ...collection, itemIds: collection.itemIds.filter((id) => id !== itemId) };
    }
    return collection;
  });
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      items: SEED_ITEMS,
      collections: SEED_COLLECTIONS,

      createQuestion: ({ title, description, topic, author }) =>
        set((state) => ({
          items: [
            {
              id: `ci${Date.now()}`,
              type: "question",
              title,
              description,
              author,
              topic,
              savedCount: 0,
              likeCount: 0,
              replyCount: 0,
              createdAt: new Date().toISOString(),
              tags: [topic],
              replies: [],
            },
            ...state.items,
          ],
        })),

      saveReference: ({ title, description, topic, author, source, href, tags, collectionId }) =>
        set((state) => {
          const itemId = `ci${Date.now()}`;
          return {
            items: [
              {
                id: itemId,
                type: "saved_reference",
                title,
                description,
                author,
                topic,
                savedCount: 1,
                likeCount: 0,
                replyCount: 0,
                createdAt: new Date().toISOString(),
                source,
                href,
                tags: tags?.length ? tags : [topic],
                collectionIds: collectionId ? [collectionId] : [],
                isSaved: true,
                replies: [],
              },
              ...state.items,
            ],
            collections: syncCollectionMembership(state.collections, itemId, collectionId, true),
          };
        }),

      saveArtifact: ({ title, description, topic, author, source, href, tags, collectionId, sourceRef }) =>
        set((state) => {
          const existing = state.items.find((item) => item.sourceRef?.engine === sourceRef.engine && item.sourceRef?.entityId === sourceRef.entityId);
          if (existing) {
            const nextCollectionIds = collectionId
              ? Array.from(new Set([...(existing.collectionIds || []), collectionId]))
              : existing.collectionIds;
            return {
              items: state.items.map((item) =>
                item.id === existing.id
                  ? {
                      ...item,
                      title,
                      description,
                      topic,
                      source,
                      href,
                      tags: tags?.length ? tags : item.tags,
                      isSaved: true,
                      savedCount: item.isSaved ? item.savedCount : item.savedCount + 1,
                      collectionIds: nextCollectionIds,
                    }
                  : item,
              ),
              collections: syncCollectionMembership(state.collections, existing.id, collectionId, true),
            };
          }

          const itemId = `ci${Date.now()}`;
          return {
            items: [
              {
                id: itemId,
                type: "artifact",
                title,
                description,
                author,
                topic,
                savedCount: 1,
                likeCount: 0,
                replyCount: 0,
                createdAt: new Date().toISOString(),
                source,
                sourceRef,
                href,
                tags: tags?.length ? tags : [topic, source],
                collectionIds: collectionId ? [collectionId] : [],
                isSaved: true,
                replies: [],
              },
              ...state.items,
            ],
            collections: syncCollectionMembership(state.collections, itemId, collectionId, true),
          };
        }),

      toggleSave: (itemId, collectionId) =>
        set((state) => {
          const item = state.items.find((entry) => entry.id === itemId);
          if (!item) return state;
          const nextSaved = !item.isSaved;
          const nextCollectionIds = collectionId
            ? nextSaved
              ? Array.from(new Set([...(item.collectionIds || []), collectionId]))
              : (item.collectionIds || []).filter((id) => id !== collectionId)
            : item.collectionIds;
          return {
            items: state.items.map((entry) =>
              entry.id === itemId
                ? {
                    ...entry,
                    isSaved: nextSaved,
                    savedCount: Math.max(0, entry.savedCount + (nextSaved ? 1 : -1)),
                    collectionIds: nextCollectionIds,
                  }
                : entry,
            ),
            collections: syncCollectionMembership(state.collections, itemId, collectionId, nextSaved),
          };
        }),

      toggleLike: (itemId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) return item;
            const isLiked = !item.isLiked;
            return {
              ...item,
              isLiked,
              likeCount: Math.max(0, item.likeCount + (isLiked ? 1 : -1)),
            };
          }),
        })),

      addReply: (itemId, { author, body }) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) return item;
            const replies = [
              ...(item.replies || []),
              {
                id: `rep${Date.now()}`,
                author,
                body,
                createdAt: new Date().toISOString(),
              },
            ];
            return {
              ...item,
              replies,
              replyCount: replies.length,
            };
          }),
        })),

      createCollection: ({ name, description, visibility }) =>
        set((state) => ({
          collections: [
            {
              id: `col${Date.now()}`,
              name,
              description,
              visibility,
              itemIds: [],
            },
            ...state.collections,
          ],
        })),

      getStats: () => {
        const { items, collections } = get();
        return {
          total: items.length,
          saved: items.filter((item) => item.isSaved).length,
          questions: items.filter((item) => item.type === "question").length,
          sharedCollections: collections.filter((collection) => collection.visibility === "shared").length,
        };
      },

      fetchPosts: async () => {
        try {
          const docs = await fetchCommunityChronicles();

          const payloadItems: CommunityItem[] = docs.map((doc) => ({
            id: doc.id,
            type: "olcan_post" as const,
            title: doc.title,
            description:
              doc.excerpt ||
              (typeof doc.content === "string" ? doc.content : "Conteúdo editorial da Olcan"),
            author: "Equipe Olcan",
            topic: (doc.category || "community") as CommunityItemTopic,
            savedCount: 0,
            likeCount: 0,
            replyCount: 0,
            createdAt: doc.published_at || doc.createdAt || new Date().toISOString(),
            tags: doc.tags?.map((t) => t.label).filter((v): v is string => Boolean(v)) || [],
            replies: [],
          }));

          set((state) => ({
            items: [...payloadItems, ...state.items.filter(i => i.type !== "olcan_post")]
          }));
        } catch (error) {
          console.error("Payload fetch error:", error);
        }
      },

      reset: () => set({ items: SEED_ITEMS, collections: SEED_COLLECTIONS }),
    }),
    { name: "olcan-community" },
  ),
);
import { fetchCommunityChronicles } from "@/lib/cms";
