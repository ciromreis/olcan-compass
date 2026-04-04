import { NextResponse } from 'next/server';

// Substack publication slug — change if publication URL changes
const SUBSTACK_PUBLICATION = 'olcanglobal';

export interface SubstackPost {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  post_date: string;
  canonical_url: string;
  cover_image: string | null;
  description: string | null;
  // derived
  tag: string;
  emoji: string;
}

// Map Substack section/tag patterns to our visual categories
function deriveTag(post: { title: string; subtitle?: string | null }): { tag: string; emoji: string } {
  const text = `${post.title} ${post.subtitle ?? ''}`.toLowerCase();
  if (text.match(/bolsa|mestrado|doutorado|phd|scholarship|fulbright|erasmus|chevening/))
    return { tag: 'Bolsas', emoji: '🏛️' };
  if (text.match(/visto|visa|blaukarte|express.entry|imigra/))
    return { tag: 'Vistos', emoji: '🛂' };
  if (text.match(/psicolog|medo|ansied|confiança|mental/))
    return { tag: 'Psicologia', emoji: '🧠' };
  if (text.match(/salário|salary|tech|developer|desenvolvedor|corporat|h-1b/))
    return { tag: 'Corporativo', emoji: '⚙️' };
  if (text.match(/canadá|canada|portugal|alemanha|holanda|amsterdam|berlin/))
    return { tag: 'Destinos', emoji: '🌍' };
  if (text.match(/currículo|cv|curriculo|application|application/))
    return { tag: 'Carreira', emoji: '📄' };
  return { tag: 'Estratégia', emoji: '🧭' };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '3'), 12);

  try {
    const res = await fetch(
      `https://${SUBSTACK_PUBLICATION}.substack.com/api/v1/posts?limit=${limit}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: { 'User-Agent': 'OlcanWebsite/1.0' },
      }
    );

    if (!res.ok) {
      // Substack API unreachable — return fallback so the page never breaks
      return NextResponse.json({ posts: getFallbackPosts(limit), source: 'fallback' });
    }

    const data = await res.json();
    const posts: SubstackPost[] = (data ?? []).slice(0, limit).map((p: any) => {
      const { tag, emoji } = deriveTag(p);
      return {
        id: p.id,
        title: p.title,
        subtitle: p.subtitle ?? null,
        slug: p.slug,
        post_date: p.post_date,
        canonical_url: p.canonical_url ?? `https://${SUBSTACK_PUBLICATION}.substack.com/p/${p.slug}`,
        cover_image: p.cover_image ?? null,
        description: p.description ?? p.subtitle ?? null,
        tag,
        emoji,
      };
    });

    return NextResponse.json({ posts, source: 'substack' });
  } catch {
    return NextResponse.json({ posts: getFallbackPosts(limit), source: 'fallback' });
  }
}

function getFallbackPosts(limit: number): SubstackPost[] {
  const FALLBACK: SubstackPost[] = [
    {
      id: 1,
      title: 'De Nova Soure, Bahia para Harvard e LSE: O que ninguém te conta sobre candidaturas de elite',
      subtitle: null,
      slug: 'de-nova-soure-bahia-para-harvard-e-lse',
      post_date: '2026-03-15T12:00:00.000Z',
      canonical_url: 'https://olcanglobal.substack.com',
      cover_image: null,
      description: 'A história de Ana Carolina mostra que a rede de contatos pode ser substituída por um sistema. Um metodologia estruturada vale mais que um nome famoso no currículo.',
      tag: 'Bolsas',
      emoji: '🏛️',
    },
    {
      id: 2,
      title: 'Os 4 medos que impedem brasileiros de aplicar para vagas internacionais',
      subtitle: null,
      slug: 'os-4-medos-que-impedem-brasileiros',
      post_date: '2026-03-08T12:00:00.000Z',
      canonical_url: 'https://olcanglobal.substack.com',
      cover_image: null,
      description: 'Mapeamos os padrões emocionais de 500 aspirantes. O medo de competência é o mais paralisante — e também o mais fácil de resolver com a abordagem certa.',
      tag: 'Psicologia',
      emoji: '🧠',
    },
    {
      id: 3,
      title: 'Blaukarte para desenvolvedores brasileiros: o guia completo de 2026',
      subtitle: null,
      slug: 'blaukarte-para-desenvolvedores-brasileiros',
      post_date: '2026-03-01T12:00:00.000Z',
      canonical_url: 'https://olcanglobal.substack.com',
      cover_image: null,
      description: 'Salário mínimo exigido, processo de validação do diploma, e estratégias de oferta de emprego que funcionam para o mercado alemão de tech.',
      tag: 'Corporativo',
      emoji: '⚙️',
    },
  ];
  return FALLBACK.slice(0, limit);
}
