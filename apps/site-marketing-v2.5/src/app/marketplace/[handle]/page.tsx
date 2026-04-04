import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/medusa';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { ArrowLeft, Check, Shield, Globe, Layers, Compass, Star } from 'lucide-react';

// Static fallbacks for infoproducts that aren't yet in Medusa DB
const STATIC_PRODUCTS = {
  'curso-cidadao-mundo': {
    id: 'curso-cidadao-mundo',
    title: 'Curso Cidadão do Mundo',
    description: 'Mapeamento estratégico e preparatório mental para a vida transnacional sem fronteiras. Engloba módulos sobre arquitetura fiscal, mindset global e posicionamento.',
    price: 49700, // in cents
    currency: 'BRL',
    icon: Globe,
    thumbnail: '/images/products/course-cover.png',
    features: ['Mais de 40 videoaulas', 'Acesso Vitalício', 'Comunidade Exclusiva', 'Materiais Complementares']
  },
  'kit-application': {
    id: 'kit-application',
    title: 'Kit Application',
    description: 'Templates e documentos essenciais para sua candidatura internacional: currículo no padrão europeu/americano, cartas de motivação e planilhas de tracking.',
    price: 99700,
    currency: 'BRL',
    icon: Layers,
    thumbnail: '/images/products/kit-cover.png',
    features: ['10+ Templates de CV', 'Modelos de Cover Letter', 'Guia de Entrevistas', 'Tracker de Aplicações']
  },
  'rota-internacionalizacao': {
    id: 'rota-internacionalizacao',
    title: 'Rota de Internacionalização',
    description: 'Bússola estratégica: mentoria e plano de ação tático focado nos maiores epicentros globais. Ideal para executivos e nômades.',
    price: 450000,
    currency: 'BRL',
    icon: Compass,
    thumbnail: '/images/products/mentory-cover.png',
    features: ['Mentoria Individual', 'Plano Personalizado', 'Avaliação de Perfil', 'Indicação de Parceiros']
  }
};

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  return {
    title: `Marketplace | Olcan`,
    description: `Detalhes do produto ou serviço.`,
  };
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const { handle } = params;
  let product: any = null;

  // 1. Try static infoproducts first
  if (STATIC_PRODUCTS[handle as keyof typeof STATIC_PRODUCTS]) {
    product = STATIC_PRODUCTS[handle as keyof typeof STATIC_PRODUCTS];
  } else {
    // 2. Fetch from Medusa backend
    const medusaProducts = await getProducts({ handle });
    if (medusaProducts && medusaProducts.length > 0) {
      product = medusaProducts[0];
    }
  }

  if (!product) {
    notFound();
  }

  // Handle price display depending on Medusa or Static format
  let displayPrice = 'Consulta';
  if (product.variants?.[0]?.calculated_price?.calculated_amount) {
    displayPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(product.variants[0].calculated_price.calculated_amount);
  } else if (product.price) {
    displayPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(product.price / 100);
  }

  const features = product.features || ['Benefício Premium 1', 'Suporte Especializado', 'Acesso Imediato', 'Verificado pela Olcan'];

  return (
    <main className="min-h-screen bg-cream selection:bg-brand-500/30 font-body text-ink">
      <EnhancedNavbar />
      
      <div className="pt-32 pb-16">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-ink/50 hover:text-brand-600 transition-colors text-sm font-bold uppercase tracking-widest mb-12">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Visual Column */}
            <div className="bg-white rounded-[2rem] border border-cream-200 overflow-hidden shadow-2xl shadow-ink/5 sticky top-32">
               <div className="aspect-square relative bg-cream-50 flex items-center justify-center p-12">
                 {product.thumbnail || product.images?.[0]?.url ? (
                   <Image 
                      src={product.thumbnail || product.images[0].url} 
                      alt={product.title}
                      fill
                      className="object-cover"
                   />
                 ) : (
                    product.icon ? <product.icon className="w-32 h-32 text-brand-300" /> : <Layers className="w-32 h-32 text-brand-300" />
                 )}
               </div>
            </div>

            {/* Details Column */}
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider w-fit mb-6 border border-brand-100">
                  <Star className="w-3 h-3" fill="currentColor" /> Produto Oficial
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight mb-4">
                {product.title}
              </h1>
              
              <p className="text-xl text-ink/70 leading-relaxed font-light mb-8">
                {product.description || "Descrição não disponível para este item no momento."}
              </p>

              <div className="text-4xl font-display text-brand-600 mb-8 border-b border-cream-200 pb-8">
                {displayPrice}
              </div>

              {/* Checkout CTA */}
              <div className="mb-12 space-y-4">
                {/* For Medusa or Static, clicking buy defaults to Stripe integration / checkout process */}
                <button className="w-full btn-primary py-4 px-8 text-lg flex items-center justify-center gap-3">
                   Comprar Agora <Shield className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-ink/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                   <Lock className="w-3 h-3" /> Transação 100% Segura
                </p>
              </div>

              {/* Features List */}
              <div>
                <h3 className="font-bold text-ink uppercase tracking-widest text-sm mb-6 border-l-2 border-brand-500 pl-4">
                  O que está incluso
                </h3>
                <ul className="space-y-4">
                  {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-ink/70 leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </main>
  );
}
