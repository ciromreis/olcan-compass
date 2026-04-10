const CMS_BASE_URL =
  process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export interface CMSChronicle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  author?: string | null;
  category?: string | null;
  cover_image?: string | null;
  external_url?: string | null;
  published_at?: string | null;
  content?: unknown;
  tags?: { label?: string | null }[];
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  hero_section?: Record<string, unknown> | null;
  content_blocks?: Array<{ type?: string; content?: unknown }>;
}

export interface CMSHeroSection {
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

async function fetchCMS<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const response = await fetch(`${CMS_BASE_URL}${path}`, {
      next: { revalidate },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getPublishedChronicles(limit = 12): Promise<CMSChronicle[]> {
  const query = new URLSearchParams({
    limit: String(limit),
    "where[status][equals]": "published",
    sort: "-published_at",
  });

  const data = await fetchCMS<{ docs?: CMSChronicle[] }>(
    `/api/chronicles?${query.toString()}`,
    300
  );

  return data?.docs || [];
}

export async function getPublishedChronicleBySlug(
  slug: string
): Promise<CMSChronicle | null> {
  const query = new URLSearchParams({
    limit: "1",
    "where[status][equals]": "published",
    "where[slug][equals]": slug,
  });

  const data = await fetchCMS<{ docs?: CMSChronicle[] }>(
    `/api/chronicles?${query.toString()}`,
    300
  );

  return data?.docs?.[0] || null;
}

export async function getPublishedPageBySlug(slug: string): Promise<CMSPage | null> {
  const query = new URLSearchParams({
    limit: "1",
    "where[status][equals]": "published",
    "where[slug][equals]": slug,
  });

  const data = await fetchCMS<{ docs?: CMSPage[] }>(`/api/pages?${query.toString()}`, 300);
  return data?.docs?.[0] || null;
}

export function getHeroSection(page: CMSPage | null): CMSHeroSection | null {
  if (!page?.hero_section || typeof page.hero_section !== "object") {
    return null;
  }

  const raw = page.hero_section as Record<string, unknown>;

  return {
    eyebrow: typeof raw.eyebrow === "string" ? raw.eyebrow : undefined,
    title: typeof raw.title === "string" ? raw.title : undefined,
    accent: typeof raw.accent === "string" ? raw.accent : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    primaryCtaLabel:
      typeof raw.primaryCtaLabel === "string" ? raw.primaryCtaLabel : undefined,
    primaryCtaHref:
      typeof raw.primaryCtaHref === "string" ? raw.primaryCtaHref : undefined,
    secondaryCtaLabel:
      typeof raw.secondaryCtaLabel === "string" ? raw.secondaryCtaLabel : undefined,
    secondaryCtaHref:
      typeof raw.secondaryCtaHref === "string" ? raw.secondaryCtaHref : undefined,
  };
}
