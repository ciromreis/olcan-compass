import {
  mergeArchetypeOverrides,
  type AuraCreature,
  type ArchetypeCMSOverride,
  type ArchetypeDefinition,
  type ArchetypeId,
} from "@/lib/archetypes";
import type { DocType } from "@/stores/forge";

const CMS_BASE_URL =
  process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

interface CMSChronicleDoc {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: unknown;
  category?: string | null;
  createdAt?: string;
  published_at?: string | null;
  tags?: Array<{ label?: string | null }>;
}

interface CMSArchetypeDoc {
  key?: ArchetypeId;
  name?: string;
  description?: string;
  context_override?: string | null;
  creature_override?: string | null;
  abilities_override?: Array<{ label?: string | null }>;
  visual_card?: {
    gradient?: string;
  } | null;
  status?: string;
}

export interface CMSDocumentGuidance {
  id: string;
  document_type: DocType;
  title: string;
  description?: string;
  structure?: string[];
  tips?: string[];
  examples?: string[];
  word_count_range?: { min: number; max: number };
  tone_suggestions?: string[];
  common_mistakes?: string[];
  keywords?: string[];
}

async function fetchCMS<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${CMS_BASE_URL}${path}`);
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCommunityChronicles() {
  const query = new URLSearchParams({
    limit: "20",
    "where[status][equals]": "published",
    sort: "-published_at",
  });

  const data = await fetchCMS<{ docs?: CMSChronicleDoc[] }>(
    `/api/chronicles?${query.toString()}`
  );

  return data?.docs || [];
}

export async function fetchCMSArchetypeDefinitions(): Promise<ArchetypeDefinition[]> {
  const query = new URLSearchParams({
    limit: "50",
    "where[status][equals]": "published",
  });

  const data = await fetchCMS<{ docs?: CMSArchetypeDoc[] }>(
    `/api/archetypes?${query.toString()}`
  );

  if (!data?.docs?.length) {
    return mergeArchetypeOverrides([]);
  }

  const overrides: ArchetypeCMSOverride[] = data.docs
    .filter((item): item is CMSArchetypeDoc & { key: ArchetypeId } => Boolean(item.key))
    .map((item) => ({
      key: item.key,
      name: item.name,
      description: item.description,
      context: item.context_override || undefined,
      creature: (item.creature_override as AuraCreature) || undefined,
      abilities: item.abilities_override
        ?.map((entry) => entry.label?.trim())
        .filter((value): value is string => Boolean(value)),
      gradient: item.visual_card?.gradient,
    }));

  return mergeArchetypeOverrides(overrides);
}

interface CMSDocumentTemplateDoc {
  id?: string;
  document_type?: string;
  title?: string;
  description?: string;
  structure?: string | null;
  tips?: string | null;
  examples?: string | null;
  min_word_count?: number;
  max_word_count?: number;
  tone_suggestions?: string | null;
  common_mistakes?: string | null;
  keywords?: string | null;
  status?: string;
}

export async function fetchDocumentGuidance(documentType: DocType): Promise<CMSDocumentGuidance | null> {
  const query = new URLSearchParams({
    "where[document_type][equals]": documentType,
    "where[status][equals]": "published",
    limit: "1",
  });

  const data = await fetchCMS<{ docs?: CMSDocumentTemplateDoc[] }>(
    `/api/document-guidance?${query.toString()}`
  );

  const doc = data?.docs?.[0];
  if (!doc) return null;

  return {
    id: doc.id || "",
    document_type: doc.document_type as DocType || documentType,
    title: doc.title || "",
    description: doc.description || undefined,
    structure: doc.structure?.split("\n").filter(Boolean) || undefined,
    tips: doc.tips?.split("\n").filter(Boolean) || undefined,
    examples: doc.examples?.split("\n---\n").filter(Boolean) || undefined,
    word_count_range: doc.min_word_count || doc.max_word_count
      ? { min: doc.min_word_count || 0, max: doc.max_word_count || 1000 }
      : undefined,
    tone_suggestions: doc.tone_suggestions?.split(",").map(s => s.trim()).filter(Boolean) || undefined,
    common_mistakes: doc.common_mistakes?.split("\n").filter(Boolean) || undefined,
    keywords: doc.keywords?.split(",").map(s => s.trim()).filter(Boolean) || undefined,
  };
}

export async function fetchAllDocumentGuidance(): Promise<CMSDocumentGuidance[]> {
  const query = new URLSearchParams({
    "where[status][equals]": "published",
    limit: "50",
  });

  const data = await fetchCMS<{ docs?: CMSDocumentTemplateDoc[] }>(
    `/api/document-guidance?${query.toString()}`
  );

  if (!data?.docs) return [];

  return data.docs.map((doc) => ({
    id: doc.id || "",
    document_type: (doc.document_type as DocType) || "other",
    title: doc.title || "",
    description: doc.description || undefined,
    structure: doc.structure?.split("\n").filter(Boolean) || undefined,
    tips: doc.tips?.split("\n").filter(Boolean) || undefined,
    examples: doc.examples?.split("\n---\n").filter(Boolean) || undefined,
    word_count_range: doc.min_word_count || doc.max_word_count
      ? { min: doc.min_word_count || 0, max: doc.max_word_count || 1000 }
      : undefined,
    tone_suggestions: doc.tone_suggestions?.split(",").map(s => s.trim()).filter(Boolean) || undefined,
    common_mistakes: doc.common_mistakes?.split("\n").filter(Boolean) || undefined,
    keywords: doc.keywords?.split(",").map(s => s.trim()).filter(Boolean) || undefined,
  }));
}
