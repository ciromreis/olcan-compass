/**
 * WordPress REST API Client
 * ─────────────────────────
 * Future integration layer for when the blog migrates from Wix/Substack to WordPress.
 *
 * SETUP:
 * 1. Set NEXT_PUBLIC_WORDPRESS_URL in .env (e.g. https://blog.olcan.com.br)
 * 2. WordPress must have the REST API enabled (default on modern WP installs)
 * 3. For private/draft posts, create an Application Password in WP Admin
 *    and set WORDPRESS_APP_PASSWORD in .env.local (server-side only)
 *
 * USAGE (when ready to activate):
 * - In `src/lib/blog-posts.ts`: replace `LOCAL_POSTS` loop with `getWordPressPosts()`
 * - In `src/app/api/blog/route.ts`: switch source to 'wordpress'
 * - The blog page and [slug] page will work unchanged — same interface
 */

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ name: string }>>;
  };
}

const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : null;

/**
 * Fetch posts from WordPress REST API.
 * Returns empty array when WP_BASE is not configured (pre-migration).
 */
export async function getWordPressPosts(limit = 12): Promise<WPPost[]> {
  if (!WP_BASE) return [];

  try {
    const res = await fetch(
      `${WP_BASE}/posts?_embed&per_page=${limit}&status=publish`,
      {
        next: { revalidate: 3600 },
        headers: process.env.WORDPRESS_APP_PASSWORD
          ? {
              Authorization: `Basic ${Buffer.from(
                `olcan:${process.env.WORDPRESS_APP_PASSWORD}`
              ).toString('base64')}`,
            }
          : {},
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Fetch a single WordPress post by slug.
 */
export async function getWordPressPostBySlug(slug: string): Promise<WPPost | null> {
  if (!WP_BASE) return null;

  try {
    const res = await fetch(
      `${WP_BASE}/posts?slug=${slug}&_embed&status=publish`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const posts: WPPost[] = await res.json();
    return posts[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Map a WPPost to the shared LocalPost interface so pages work uniformly.
 */
export function wpPostToLocal(post: WPPost) {
  return {
    slug: post.slug,
    title: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]+>/g, '').trim(),
    content: post.content.rendered,
    publishedAt: post.date,
    tag: post._embedded?.['wp:term']?.[0]?.[0]?.name ?? 'Blog',
    emoji: '📝',
    coverImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
    author: 'Equipe Olcan',
  };
}
