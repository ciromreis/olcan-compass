import {
  mergeArchetypeOverrides,
  type AuraCreature,
  type ArchetypeCMSOverride,
  type ArchetypeDefinition,
  type ArchetypeId,
} from "@/lib/archetypes";

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
