import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { SubstackPost } from "@/app/api/substack/route";

async function getSubstackPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/api/substack?limit=3`,
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

// Fallback editorial cards shown when Substack doesn't load
const EDITORIAL_FALLBACK = [
  {
    tag: "Estratégia",
    emoji: "🗺️",
    title: "Como construir um currículo internacional do zero",
    description: "Os erros mais comuns de brasileiros ao tentar adaptar seus CVs para o mercado europeu e norte-americano — e como evitá-los.",
    href: "https://olcanglobal.substack.com",
    date: "2024-03-01",
  },
  {
    tag: "Visto",
    emoji: "🛂",
    title: "Os vistos de trabalho mais acessíveis em 2025",
    description: "Portugal D8, Nomad Visa alemão e o programa de qualificação canadense: guia prático e atualizado para profissionais brasileiros.",
    href: "https://olcanglobal.substack.com",
    date: "2024-02-15",
  },
  {
    tag: "Mentalidade",
    emoji: "🧠",
    title: "Síndrome do Impostor no mercado internacional",
    description: "Por que talentos seniores brasileiros subestimam suas competências diante de recrutadores europeus — e técnicas práticas para superar isso.",
    href: "https://olcanglobal.substack.com",
    date: "2024-01-28",
  },
];

export async function BlogFeedSection() {
  const posts = await getSubstackPosts();
  const hasPosts = posts.length > 0;

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="label-xs text-olcan-navy/60">Conteúdo Editorial</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
              A Inteligência da <br />
              <span className="italic font-light text-brand-600 font-serif">Olcan no Substack.</span>
            </h2>
          </div>

          <div className="pb-2">
            <Link
              href="https://olcanglobal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-4 px-8 group text-sm"
            >
              Assinar Newsletter
              <ExternalLink size={16} className="ml-3 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hasPosts
            ? posts.map((post) => (
                <article key={post.id}>
                  <Link
                    href={post.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-olcan p-8 h-full flex flex-col group border-white/60 hover:border-brand-300 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="fear-pill bg-white/40 border-white text-olcan-navy/60 py-1 px-3">
                        {post.tag}
                      </div>
                      <span className="text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {post.emoji}
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <h3 className="font-display text-xl text-olcan-navy leading-snug group-hover:text-brand-600 group-hover:italic transition-all duration-300 tracking-tight">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-olcan-navy/60 font-medium text-sm leading-relaxed line-clamp-3">
                          {post.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-olcan-navy/5 flex items-center justify-between">
                      <span className="label-xs text-olcan-navy/40">{formatDate(post.post_date)}</span>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olcan-navy group-hover:text-brand-600 transition-colors">
                        Ler <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))
            : EDITORIAL_FALLBACK.map((post) => (
                <article key={post.title}>
                  <Link
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-olcan p-8 h-full flex flex-col group border-white/60 hover:border-brand-300 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="fear-pill bg-white/40 border-white text-olcan-navy/60 py-1 px-3">
                        {post.tag}
                      </div>
                      <span className="text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {post.emoji}
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <h3 className="font-display text-xl text-olcan-navy leading-snug group-hover:text-brand-600 group-hover:italic transition-all duration-300 tracking-tight">
                        {post.title}
                      </h3>
                      <p className="text-olcan-navy/60 font-medium text-sm leading-relaxed line-clamp-3">
                        {post.description}
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-olcan-navy/5 flex items-center justify-between">
                      <span className="label-xs text-olcan-navy/40">{formatDate(post.date)}</span>
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olcan-navy group-hover:text-brand-600 transition-colors">
                        Ler no Substack <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
