/**
 * Local Blog Post Store
 * ─────────────────────
 * Blog posts authored directly in the codebase. Posts can also flow in
 * from Payload CMS via `lib/cms.ts`; this file is the static fallback.
 */

export interface LocalPost {
  slug: string;
  title: string;
  description: string;
  /** Rich text content — can be HTML string (from Wix export) or plain markdown */
  content: string;
  /** ISO date string */
  publishedAt: string;
  /** Category tag */
  tag: string;
  emoji: string;
  /** Optional cover image URL or local /public path */
  coverImage?: string;
  /** Author display name */
  author?: string;
}

/**
 * Posts migrated from Wix or written natively.
 * ─ Add new posts here in reverse chronological order.
 * ─ When this list grows past ~20 posts, consider moving to a CMS or MDX files.
 */
export const LOCAL_POSTS: LocalPost[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // MIGRATED FROM WIX — paste exported content below, one object per post
  // ──────────────────────────────────────────────────────────────────────────
  //
  // Example structure (uncomment and fill in):
  //
  // {
  //   slug: 'como-conseguir-emprego-em-portugal',
  //   title: 'Como conseguir emprego em Portugal sendo brasileiro',
  //   description: 'Guia prático com os passos que realmente funcionam para entrar no mercado português.',
  //   content: `<h2>Introdução</h2><p>...</p>`, // paste Wix HTML export here
  //   publishedAt: '2024-03-15T00:00:00Z',
  //   tag: 'Destinos',
  //   emoji: '🇵🇹',
  //   author: 'Equipe Olcan',
  // },
];

/**
 * Get all local posts sorted by date (newest first)
 */
export function getLocalPosts(): LocalPost[] {
  return [...LOCAL_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single post by slug
 */
export function getLocalPostBySlug(slug: string): LocalPost | undefined {
  return LOCAL_POSTS.find((p) => p.slug === slug);
}
