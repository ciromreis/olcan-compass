import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { SubstackPost } from '@/app/api/substack/route';

const CATEGORIES = ['Todos', 'Bolsas', 'Vistos', 'Carreira', 'Destinos', 'Psicologia', 'Corporativo'];

async function getPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/api/substack?limit=12`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function estimateReadTime(description: string | null): string {
  if (!description) return '5 min';
  const words = description.split(' ').length;
  return `${Math.max(3, Math.ceil(words / 200))} min`;
}

// Server component — categories filter requires client interaction.
// We show all posts grouped by tag with a note to visit Substack for full archive.
export async function BlogGrid() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-olcan-navy/50 font-medium mb-6">
          Conteúdo sendo carregado do Substack...
        </p>
        <Link
          href="https://olcanglobal.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Ver no Substack
        </Link>
      </div>
    );
  }

  return (
    <div className="container-site mx-auto px-6">
      {/* Category pills — static display, links to filtered Substack */}
      <div className="flex flex-wrap gap-4 mb-20 justify-center">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={
              category === 'Todos'
                ? 'https://olcanglobal.substack.com'
                : `https://olcanglobal.substack.com`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-500 bg-white/40 backdrop-blur-md border border-white/60 text-olcan-navy/40 hover:border-olcan-navy/20 hover:text-olcan-navy hover:bg-white/60"
          >
            {category}
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post) => (
          <article key={post.id} className="group h-full">
            <Link
              href={post.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <div className="card-olcan flex flex-col h-full overflow-hidden hover:scale-[1.02] transition-all duration-500">
                {/* Cover image or placeholder */}
                <div className="relative h-56 bg-olcan-navy/5 overflow-hidden">
                  <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-multiply" />
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                      {post.emoji}
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="fear-pill bg-white/80 border-white text-olcan-navy">
                      {post.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wide text-olcan-navy/30 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.post_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{estimateReadTime(post.description)}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl text-olcan-navy mb-5 group-hover:text-brand-600 transition-colors leading-[1.2] tracking-tight line-clamp-2">
                    {post.title}
                  </h3>

                  {post.description && (
                    <p className="text-olcan-navy/50 text-base font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                      {post.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-8 border-t border-olcan-navy/5 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-olcan-navy/5 flex items-center justify-center text-olcan-navy/40 font-bold text-[10px] border border-olcan-navy/10">
                        O
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-olcan-navy uppercase tracking-widest">Equipe Olcan</div>
                        <div className="text-olcan-navy/40 font-medium">Especialistas em Mobilidade</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-olcan-navy/20 group-hover:text-olcan-navy group-hover:translate-x-1.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-32 relative liquid-glass-strong rounded-[3rem] p-12 md:p-20 text-center border-2 border-white/60 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="label-xs text-olcan-navy/40 mb-8 block">Newsletter Olcan · Substack</span>
          <h3 className="font-display text-4xl md:text-6xl text-olcan-navy tracking-tighter mb-8 leading-[1.1]">
            Fique à frente do mercado global
          </h3>
          <p className="text-xl md:text-2xl text-olcan-navy/60 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Análises semanais sobre vistos, oportunidades internacionais e estratégias de carreira — direto no seu email.
          </p>
          <Link
            href="https://olcanglobal.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-5 px-10 text-lg group inline-flex items-center gap-3"
          >
            Assinar a Newsletter
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
