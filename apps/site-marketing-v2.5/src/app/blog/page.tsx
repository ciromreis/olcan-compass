import { Metadata } from 'next';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { BlogGrid } from '@/components/blog/BlogGrid';

export const metadata: Metadata = {
  title: 'Blog | Olcan',
  description: 'Guias, dicas e insights sobre mobilidade internacional, vistos, carreira global e oportunidades no exterior.',
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
        {/* Binary Matrix Post-Modern Texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "url('/images/binary_matrix_bg.png')" }} 
        />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-tight mb-6">
              Acervo de <span className="italic font-light text-brand-600">Inteligência</span> OIOS
            </h1>
            <p className="text-xl text-ink/70 font-light max-w-3xl mx-auto">
              Sinais e insights hiper-focados para a arquitetura da sua Cidadania e Sustentabilidade Global.
            </p>
          </div>
          
          <BlogGrid />
        </div>
      </section>
      
      <EnhancedFooter />
    </main>
  );
}
