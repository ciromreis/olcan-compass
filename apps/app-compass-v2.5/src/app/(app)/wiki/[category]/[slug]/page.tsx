import { getWikiDocument } from "@/lib/wiki";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { GlassCard } from "@/components/ui/GlassCard";
import { Compass, Calendar, Tag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface WikiDocPageProps {
  params: {
    category: string;
    slug: string;
  };
}

/**
 * Terminal OIOS: Document View
 * Rota dinâmica para visualização profunda de documentação do monorepo.
 */
export default async function WikiDocPage({ params }: WikiDocPageProps) {
  const doc = await getWikiDocument(params.category, params.slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Back to Hub */}
      <Link 
        href="/wiki" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Hub de Inteligência
      </Link>

      <article className="space-y-10">
        {/* Meta Header */}
        <header className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest">
              {doc.category.replace(/^\d+_/, "").replace(/_/g, " ")}
            </span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tight text-slate-950 leading-tight">
            {doc.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-medium pb-8 border-b border-slate-100">
            {doc.frontmatter.atualizado && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Atualizado: {doc.frontmatter.atualizado}
              </div>
            )}
            {doc.frontmatter.tags && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {doc.frontmatter.tags}
              </div>
            )}
          </div>
        </header>

        {/* Real Content */}
        <section className="relative">
          <MarkdownContent content={doc.content} />
        </section>

        {/* Bottom Context Card */}
        <footer className="pt-12">
          <GlassCard className="p-8 border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white shadow-sm">
                <Compass className="w-6 h-6 text-slate-900" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">Contexto Metamoderno</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Este documento faz parte da infraestrutura de verdade do Olcan Compass. 
                  Sua leitura ativa influencia a densidade narrativa da sua **Aura**.
                </p>
              </div>
            </div>
          </GlassCard>
        </footer>
      </article>
    </div>
  );
}
