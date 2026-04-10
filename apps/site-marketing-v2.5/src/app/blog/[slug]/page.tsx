import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import EnhancedFooter from "@/components/layout/EnhancedFooter";
import { getPublishedChronicleBySlug } from "@/lib/cms";

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;

  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function extractText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join("\n\n");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(extractText)
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chronicle = await getPublishedChronicleBySlug(slug);

  if (!chronicle) {
    return {
      title: "Artigo | Olcan",
    };
  }

  return {
    title: `${chronicle.title} | Blog Olcan`,
    description: chronicle.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chronicle = await getPublishedChronicleBySlug(slug);

  if (!chronicle) {
    notFound();
  }

  const bodyText = extractText(chronicle.content);

  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />

      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-olcan-navy/50 hover:text-brand-600 transition-colors text-sm font-bold uppercase tracking-widest mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao blog
          </Link>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-olcan-navy/40 mb-6">
              {chronicle.category && <span>{chronicle.category}</span>}
              {chronicle.published_at && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(chronicle.published_at)}
                </span>
              )}
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-ink leading-tight mb-6">
              {chronicle.title}
            </h1>

            {chronicle.excerpt && (
              <p className="text-xl text-ink/70 leading-relaxed font-medium">
                {chronicle.excerpt}
              </p>
            )}
          </div>

          <article className="rounded-[2rem] border border-cream-200 bg-white/70 backdrop-blur-xl p-8 md:p-12 shadow-xl shadow-ink/5">
            <div className="prose prose-lg max-w-none prose-headings:text-ink prose-p:text-ink/75 whitespace-pre-wrap">
              {bodyText || "Este conteúdo ainda não recebeu corpo editorial no CMS."}
            </div>

            {chronicle.external_url && (
              <div className="mt-10 pt-8 border-t border-cream-200">
                <a
                  href={chronicle.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700"
                >
                  Abrir versão externa
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </article>
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
