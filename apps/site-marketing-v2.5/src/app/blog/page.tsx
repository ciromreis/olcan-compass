import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { MauticNewsletterForm } from '@/components/forms/MauticNewsletterForm';

export const metadata: Metadata = {
  title: 'Blog | Olcan — Conteúdo sobre Internacionalização',
  description: 'Guias, dicas e insights sobre mobilidade internacional, vistos, carreira global e oportunidades no exterior. Novos artigos toda semana.',
  openGraph: {
    title: 'Blog Olcan | Mobilidade Internacional',
    description: 'Conteúdo exclusivo sobre como construir sua carreira internacional',
  }
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-cream">
      <EnhancedNavbar />
      
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-16">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="label-xs text-olcan-navy/60">Editoria Olcan · CMS integrado · Atualizado continuamente</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-tight mb-6">
              Conteúdo que <span className="italic font-light text-brand-600">abre fronteiras</span>
            </h1>
            <p className="text-xl text-ink/70 font-medium max-w-3xl mx-auto leading-relaxed">
              Guias práticos, análises e estratégias para quem quer construir uma carreira 
              internacional com método e clareza.
            </p>
          </div>
          
          <BlogGrid />

          {/* Mautic Lead Capture */}
          <div className="mt-24">
            <MauticNewsletterForm />
          </div>
        </div>
      </section>
      
      <EnhancedFooter />
    </main>
  );
}
