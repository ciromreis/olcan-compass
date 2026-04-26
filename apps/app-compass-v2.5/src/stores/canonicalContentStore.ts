import { create } from "zustand";

export interface NexusChronicle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  category?: string;
  cover_image?: string;
  external_url?: string;
  published_at?: string;
  status: "draft" | "published";
  isAppFeed?: boolean;
  isBlog?: boolean;
  tags?: { label: string; id?: string }[];
  updatedAt: string;
  createdAt: string;
}

export interface NexusCommunityItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  author_name?: string;
  topic?: string;
  source?: string;
  url?: string;
  is_official?: boolean;
  tags?: { label: string; id?: string }[];
  updatedAt: string;
  createdAt: string;
}

interface NexusContentStore {
  chronicles: NexusChronicle[];
  communityItems: NexusCommunityItem[];
  isLoading: boolean;
  error: string | null;
  fetchFeedChronicles: () => Promise<void>;
  fetchCommunityFeed: () => Promise<void>;
  postToNexus: (payload: {
    title: string;
    description: string;
    type: "question" | "reference" | "artifact";
    topic: string;
    author_name: string;
    source?: string;
    url?: string;
  }) => Promise<void>;
}

import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const useCanonicalContentStore = create<NexusContentStore>((set, get) => ({
  chronicles: [],
  communityItems: [],
  isLoading: false,
  error: null,

  fetchFeedChronicles: async () => {
    const zenithApi = API_ENDPOINTS.zenith.base;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${zenithApi}/chronicles?where[isAppFeed][equals]=true&where[status][equals]=published&sort=-published_at`);
      if (!response.ok) throw new Error("Failed to fetch chronicles");
      const data = await response.json();
      set({ chronicles: data.docs || [], isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchCommunityFeed: async () => {
    const zenithApi = API_ENDPOINTS.zenith.base;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${zenithApi}/community-items?where[status][equals]=published&sort=-createdAt`);
      if (!response.ok) throw new Error("Failed to fetch community items");
      const data = await response.json();
      set({ communityItems: data.docs || [], isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  postToNexus: async (payload) => {
    const zenithApi = API_ENDPOINTS.zenith.base;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${zenithApi}/community-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: "published" }),
      });
      
      if (!response.ok) throw new Error("Failed to post to Nexus-Zenith");
      
      // Refresh feed after posting
      await get().fetchCommunityFeed();
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },
}));
