import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { getLocalPostBySlug, getLocalPosts } from '@/lib/blog-posts';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

const SUBSTACK_BASE = 'https://olcanglobal.substack.com/p';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Check for local post first
  const localPost = getLocalPostBySlug(params.slug);
  if (localPost) {
    return {
      title: `${localPost.title} | Blog Olcan`,
      description: localPost.description,
      openGraph: {
        title: localPost.title,
        description: localPost.description,
        images: localPost.coverImage ? [localPost.coverImage] : [],
      },
      alternates: { canonical: `/blog/${localPost.slug}` },
    };
  }

  // Fallback — post lives on Substack
  return {
    title: 'Artigo | Blog Olcan',
    robots: { index: false },
    alternates: { canonical: `${SUBSTACK_BASE}/${params.slug}` },
  };
}

/**
 * Pre-generate static paths for all local posts at build time.
 * Substack posts are handled by the redirect below (no static generation needed).
 */
export async function generateStaticParams() {
  const localPosts = getLocalPosts();
  return localPosts.map((p) => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: Props) {
  const localPost = getLocalPostBySlug(params.slug);

  // If post exists locally — render it
  if (localPost) {
    const readTime = Math.max(3, Math.ceil(localPost.content.split(' ').length / 200));

    return (
      <main className="min-h-screen bg-cream">
        <EnhancedNavbar />

        {/* Hero */}
        <section className="pt-36 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
          <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olcan-navy/40 hover:text-olcan-navy transition-colors mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Blog
            </Link>

            <div className="mb-8">
              <span className="fear-pill bg-white/40 border-white text-olcan-navy text-sm inline-block mb-6">
                {localPost.tag}
              </span>
              <h1 className="font-display text-4xl md:text-6xl text-olcan-navy leading-[1.05] tracking-tight mb-6">
                {localPost.title}
              </h1>
              <p className="text-xl text-olcan-navy/60 font-medium leading-relaxed">
                {localPost.description}
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-olcan-navy/30 border-t border-olcan-navy/8 pt-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(localPost.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readTime} min de leitura
              </span>
              {localPost.author && (
                <span>{localPost.author}</span>
              )}
            </div>
          </div>
        </section>

        {/* Cover image */}
        {localPost.coverImage && (
          <div className="w-full max-w-5xl mx-auto px-6 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPost.coverImage}
              alt={localPost.title}
              className="w-full rounded-3xl object-cover aspect-[2/1]"
            />
          </div>
        )}

        {/* Content */}
        <article className="container-site mx-auto px-6 lg:px-12 w-full max-w-3xl pb-32">
          <div
            className="prose prose-lg prose-olcan max-w-none
              prose-headings:font-display prose-headings:text-olcan-navy prose-headings:tracking-tight
              prose-p:text-olcan-navy/70 prose-p:leading-relaxed prose-p:font-medium
              prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-olcan-navy
              prose-blockquote:border-brand-500 prose-blockquote:text-olcan-navy/60 prose-blockquote:italic
              prose-ul:text-olcan-navy/70 prose-ol:text-olcan-navy/70"
            dangerouslySetInnerHTML={{ __html: localPost.content }}
          />

          {/* Back CTA */}
          <div className="mt-20 pt-10 border-t border-olcan-navy/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Link href="/blog" className="btn-secondary group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Blog
            </Link>
            <Link href="/diagnostico" className="btn-primary">
              Iniciar Diagnóstico Gratuito
            </Link>
          </div>
        </article>

        <EnhancedFooter />
      </main>
    );
  }

  // No local post found → redirect to Substack
  redirect(`${SUBSTACK_BASE}/${params.slug}`);
}
