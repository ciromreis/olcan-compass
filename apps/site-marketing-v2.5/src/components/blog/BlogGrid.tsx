import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { SubstackPost } from '@/app/api/substack/route';
import { getPublishedChronicles, type CMSChronicle } from '@/lib/cms';

const CATEGORIES = ['Todos', 'Bolsas', 'Vistos', 'Carreira', 'Destinos', 'Psicologia', 'Corporativo'];

// Editorial fallback content - always available
const EDITORIAL_POSTS: SubstackPost[] = [
  {
    id: 1,
    title: "Como construir um currículo internacional do zero",
    subtitle: "Guia completo para adaptar seu CV ao mercado global",
    slug: "curriculo-internacional-guia",
    post_date: "2024-03-15T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    description: "Descubra as diferenças críticas entre currículos brasileiros e internacionais, e aprenda a estruturar um documento que passa pelos filtros ATS e chama atenção de recrutadores globais.",
    tag: "Carreira",
    emoji: "📄"
  },
  {
    id: 2,
    title: "Os 5 vistos de trabalho mais acessíveis em 2024",
    subtitle: "Análise comparativa de rotas migratórias para profissionais brasileiros",
    slug: "vistos-trabalho-acessiveis-2024",
    post_date: "2024-03-10T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    description: "Portugal D7, Alemanha Blue Card, Canadá Express Entry, Austrália Skilled Migration e Holanda Highly Skilled Migrant — comparamos custos, prazos e requisitos reais.",
    tag: "Vistos",
    emoji: "🛂"
  },
  {
    id: 3,
    title: "Síndrome do Impostor no mercado internacional",
    subtitle: "Como profissionais do Sul Global podem superar a barreira psicológica",
    slug: "sindrome-impostor-mercado-internacional",
    post_date: "2024-03-05T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    description: "A sensação de 'não ser bom o suficiente' afeta 70% dos profissionais em transição internacional. Entenda a psicologia por trás e estratégias práticas para construir confiança genuína.",
    tag: "Psicologia",
    emoji: "🧠"
  },
  {
    id: 4,
    title: "Bolsas Chevening 2025: Guia completo de candidatura",
    subtitle: "Como estruturar uma application competitiva para o Reino Unido",
    slug: "bolsas-chevening-2025-guia",
    post_date: "2024-02-28T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    description: "Análise detalhada do processo Chevening: desde a escolha de cursos até a construção de essays que demonstram liderança e impacto. Inclui timeline e erros comuns a evitar.",
    tag: "Bolsas",
    emoji: "🏛️"
  },
  {
    id: 5,
    title: "Berlim vs Lisboa: Qual cidade escolher para tech?",
    subtitle: "Comparativo de custo de vida, mercado de trabalho e qualidade de vida",
    slug: "berlim-vs-lisboa-tech",
    post_date: "2024-02-20T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80",
    description: "Duas das cidades mais procuradas por profissionais de tecnologia brasileiros. Analisamos salários, impostos, aluguel, visto, clima e ecossistema de startups.",
    tag: "Destinos",
    emoji: "🌍"
  },
  {
    id: 6,
    title: "Transferência interna: A rota corporativa para o exterior",
    subtitle: "Como usar sua empresa atual como ponte para mobilidade internacional",
    slug: "transferencia-interna-corporativa",
    post_date: "2024-02-15T10:00:00Z",
    canonical_url: "https://olcanglobal.substack.com",
    cover_image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    description: "Muitas multinacionais oferecem programas de mobilidade interna. Descubra como se posicionar estrategicamente, construir o business case e negociar a transferência.",
    tag: "Corporativo",
    emoji: "⚙️"
  }
];

async function getPosts(): Promise<SubstackPost[]> {
  const chronicles = await getPublishedChronicles(12);

  if (chronicles.length > 0) {
    return chronicles.map(mapChronicleToPost);
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/api/substack?limit=12`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.posts && data.posts.length > 0) {
      return data.posts;
    }
  } catch {
    // Fall through to editorial content
  }

  // Always return editorial content as fallback
  return EDITORIAL_POSTS;
}

function mapChronicleToPost(item: CMSChronicle): SubstackPost {
  const category = item.category || 'Estratégia';
  const emojiByCategory: Record<string, string> = {
    Bolsas: '🏛️',
    Vistos: '🛂',
    Psicologia: '🧠',
    Corporativo: '⚙️',
    Destinos: '🌍',
    Carreira: '📄',
    Estratégia: '🧭',
  };

  return {
    id: Number(String(item.id).replace(/\D/g, '').slice(0, 9) || '0'),
    title: item.title,
    subtitle: item.excerpt || null,
    slug: item.slug,
    post_date: item.published_at || new Date().toISOString(),
    canonical_url: item.external_url || `/blog/${item.slug}`,
    cover_image: item.cover_image || null,
    description: item.excerpt || null,
    tag: category,
    emoji: emojiByCategory[category] || '🧭',
  };
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

function PostCard({ post, featured = false }: { post: SubstackPost; featured?: boolean }) {
  return (
    <article className="group h-full">
      <Link
        href={post.canonical_url}
        target={post.canonical_url.startsWith('http') ? "_blank" : undefined}
        rel={post.canonical_url.startsWith('http') ? "noopener noreferrer" : undefined}
        className="block h-full"
      >
        <div className={`card-olcan flex flex-col h-full overflow-hidden hover:scale-[1.02] transition-all duration-500 ${featured ? 'md:flex-row' : ''}`}>
          {/* Cover image */}
          <div className={`relative ${featured ? 'md:w-1/2 h-64 md:h-auto' : 'h-56'} bg-olcan-navy/5 overflow-hidden flex-shrink-0`}>
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
          <div className={`p-8 md:p-10 flex-1 flex flex-col ${featured ? 'justify-center' : ''}`}>
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

            <h3 className={`font-display ${featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'} text-olcan-navy mb-5 group-hover:text-brand-600 transition-colors leading-[1.2] tracking-tight line-clamp-2`}>
              {post.title}
            </h3>

            {post.description && (
              <p className={`text-olcan-navy/50 text-base font-medium leading-relaxed mb-8 flex-1 ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>
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
  );
}

export async function BlogGrid() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-olcan-navy/50 font-medium mb-6">
          Conteúdo editorial da Olcan sendo carregado...
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

  const featuredPost = posts[0];
  const sidePosts = posts.slice(1, 3);
  const remainingPosts = posts.slice(3);

  return (
    <div className="container-site mx-auto px-6">
      {/* Category pills — decorative */}
      <div className="flex flex-wrap gap-4 mb-20 justify-center">
        {CATEGORIES.map((category) => (
          <span
            key={category}
            className="px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/40 backdrop-blur-md border border-white/60 text-olcan-navy/40 hover:border-olcan-navy/20 hover:text-olcan-navy hover:bg-white/60 transition-all duration-500 cursor-default"
          >
            {category}
          </span>
        ))}
      </div>

      {/* Bento layout: Featured post + 2 side posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Featured (large, spans full height) */}
        <div className="lg:row-span-2">
          <PostCard post={featuredPost} featured />
        </div>

        {/* Side posts (stacked) */}
        {sidePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Remaining posts grid */}
      {remainingPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {remainingPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-32 relative liquid-glass-strong rounded-[3rem] p-12 md:p-20 text-center border-2 border-white/60 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="label-xs text-olcan-navy/40 mb-8 block">Newsletter e editoria Olcan</span>
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
