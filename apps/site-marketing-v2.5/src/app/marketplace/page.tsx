import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { Shield, FileText, Users, Globe, ShoppingBag, BookOpen, Layers, ArrowRight, Compass, Zap, Lock, Tag, Database } from 'lucide-react';
import { getMercurProducts, getProductPrice } from '@/lib/mercur-client';


export const metadata: Metadata = {
  title: 'Loja | Olcan',
  description: 'Tudo para sua carreira internacional em um só lugar. Cursos, mentorias e serviços especializados para profissionais em mobilidade global.',
  openGraph: {
    title: 'Loja Olcan | Sua Carreira Internacional',
    description: 'Cursos, kits de aplicação, mentorias e serviços verificados para sua jornada de internacionalização profissional.',
  }
};

const digitalProducts = [
  {
    title: 'Curso Cidadão do Mundo',
    slug: 'curso-cidadao-mundo',
    description: 'Mapeamento estratégico e preparatório mental para a vida transnacional sem fronteiras.',
    icon: Globe,
    price: 'R$ 497',
    badge: 'Mais Vendido',
    image: '/images/products/course-cover.png'
  },
  {
    title: 'Kit Application',
    slug: 'kit-application',
    description: 'Templates e documentos essenciais para sua candidatura internacional: currículo, carta de motivação e mais.',
    icon: Layers,
    price: 'R$ 997',
    badge: 'Essencial',
    image: '/images/products/kit-cover.png'
  },
  {
    title: 'Rota de Internacionalização',
    slug: 'rota-internacionalizacao',
    description: 'Bússola estratégica: mentoria e plano de ação tático focado nos maiores epicentros globais.',
    icon: Compass,
    price: 'Sob Consulta',
    badge: 'Mentoria Premium',
    image: '/images/products/mentory-cover.png'
  }
];

const serviceCategories = [
  {
    icon: Shield,
    name: 'Assistência Transicional',
    description: 'Advogados especializados em estruturação diplomática e vistos complexos.',
    color: 'from-blue-500 to-blue-600',
    count: 'Em breve',
  },
  {
    icon: FileText,
    name: 'Tradução Semântica',
    description: 'Tradutores juramentados para adaptação cultural e oficial de documentação.',
    color: 'from-emerald-500 to-emerald-600',
    count: 'Em breve',
  },
  {
    icon: Users,
    name: 'Mentoria Narrativa',
    description: 'Coaches focados na arquitetura da sua autoridade percebida (World Citizen).',
    color: 'from-purple-500 to-purple-600',
    count: 'Em breve',
  }
];

const physicalGear = [
  {
    name: 'Carry-On Trailblazer (Pro)',
    description: 'Mala de cabine em policarbonato aeroespacial com rastreamento GPS integrado.',
    price: 'R$ 1.250',
    tag: 'Travel Gear'
  },
  {
    name: 'Organizador de Viagem Pro',
    description: 'Organizador impermeável para passaporte, carregadores e hard wallets.',
    price: 'R$ 380',
    tag: 'Everyday Carry'
  },
  {
    name: 'Adaptador Universal C-Type',
    description: 'Hub de energia global compatível com 160+ países e Fast Charge de 65W.',
    price: 'R$ 210',
    tag: 'Eletrônicos'
  }
];

export default async function MarketplacePage() {
  // Fetch real products from the commerce backend
  const mercurProducts = await getMercurProducts({ limit: 12 });

  return (
    <main className="min-h-screen bg-cream selection:bg-brand-500/30">
      <EnhancedNavbar />
      
      {/* Hero Storefront */}
      <section className="pt-32 pb-16 relative overflow-hidden border-b border-cream-200">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "url('/images/binary_matrix_bg.png')" }} 
        />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/30 shadow-sm mb-6">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/70">Loja Olcan</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.05] tracking-tight mb-6">
              Tudo para sua<br />
              <span className="italic font-light text-brand-600">Carreira Internacional</span>
            </h1>
            
            <p className="text-xl text-ink/70 leading-relaxed font-light max-w-2xl mx-auto">
              Cursos, mentorias especializadas e ferramentas essenciais para profissionais em mobilidade global. Prepare-se com quem já trilhou esse caminho.
            </p>
          </div>
        </div>
      </section>

      {/* Flagship Digital Products */}
      <section className="py-20 bg-white border-b border-cream-200 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.03] mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "url('/images/fractal_pattern_bg.png')" }} 
        />
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl text-ink mb-2">Produtos Digitais</h2>
              <p className="text-ink/60 font-light">As ferramentas essenciais para sua jornada internacional.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-brand-600 text-sm font-bold uppercase tracking-wider">
              Acesso Imediato <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {digitalProducts.map((prod, idx) => (
              <Link 
                key={idx} 
                href={`/marketplace/${prod.slug}`}
                className="group flex flex-col bg-white border border-cream-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-cream to-cream-100 flex items-center justify-center p-8">
                  {/* Image Placeholder - since we don't have actual product images yet */}
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-xl shadow-ink/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <prod.icon className="w-10 h-10 text-brand-600" />
                  </div>
                  {prod.badge && (
                    <div className="absolute top-4 right-4 bg-ink text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {prod.badge}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-heading font-bold text-xl text-ink mb-2">{prod.title}</h3>
                  <p className="text-ink/60 text-sm leading-relaxed mb-6 flex-1">{prod.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                    <span className="font-display text-xl text-brand-600">{prod.price}</span>
                    <div className="w-8 h-8 rounded-full bg-cream-50 flex items-center justify-center text-ink group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products from the commerce backend */}
      {mercurProducts.length > 0 && (
        <section className="py-20 bg-cream-50 border-b border-cream-200">
          <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-4xl text-ink mb-2">Catálogo Oficial</h2>
                <p className="text-ink/60 font-light">Catálogo canônico servido pelo backend Olcan, com Medusa como motor comercial por trás da experiência.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-brand-600 text-sm font-bold uppercase tracking-wider">
                Sincronizado <Database className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {mercurProducts.map((prod) => (
                <Link 
                  key={prod.id} 
                  href={`/marketplace/${prod.handle || prod.id}`}
                  className="group flex flex-col bg-white border border-cream-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300"
                >
                  <div className="relative aspect-square bg-cream flex items-center justify-center p-4">
                    {prod.thumbnail || prod.images?.[0] ? (
                      <Image 
                        src={prod.thumbnail || (prod.images?.[0] ?? '')} 
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Tag className="w-10 h-10 text-brand-300" />
                    )}
                    {prod.category && (
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-ink text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                         {prod.category}
                       </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-lg text-ink mb-2 line-clamp-1">{prod.title}</h3>
                    <p className="text-ink/60 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{prod.description || 'Produto oficial do ecossistema Olcan.'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                      <span className="font-display text-lg text-brand-600">
                        {getProductPrice(prod)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services (Marketplace / Vendors) */}
      <section className="py-20 bg-cream-50">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="mb-12">
            <h2 className="font-display text-4xl text-ink mb-2">Especialistas Parceiros</h2>
            <p className="text-ink/60 font-light">Serviços verificados e recomendados pela Olcan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCategories.map((category, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-xl border border-cream-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-ink mb-2">{category.name}</h3>
                <p className="text-ink/60 text-sm leading-relaxed mb-6">{category.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink/5 text-ink/70 text-xs font-bold rounded-full uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  {category.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Gear / Dropshipping Storefront Demo */}
      <section className="py-20 bg-white border-t border-cream-200">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
           <div className="mb-12 relative flex items-center justify-between">
            <div>
              <h2 className="font-display text-4xl text-ink mb-2">Equipamentos de Viagem</h2>
              <p className="text-ink/60 font-light">Acessórios essenciais para quem vive entre fronteiras.</p>
            </div>
            <div className="px-4 py-2 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full border border-brand-100 hidden sm:block">
              Dropshipping (Em Breve)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-70 grayscale-[30%] hover:grayscale-0 transition-all duration-500">
            {physicalGear.map((item, idx) => (
              <div key={idx} className="group cursor-not-allowed">
                <div className="aspect-square bg-cream-50 rounded-3xl mb-4 border border-cream-100 flex items-center justify-center relative overflow-hidden">
                   <Globe className="w-16 h-16 text-cream-200" />
                   <div className="absolute inset-0 bg-ink/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <span className="px-4 py-2 bg-white text-ink font-bold text-xs uppercase tracking-widest rounded-full">Lista de Espera</span>
                   </div>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mb-1">{item.tag}</div>
                    <h3 className="font-heading font-bold text-ink mb-1">{item.name}</h3>
                    <p className="text-ink/60 text-xs leading-relaxed">{item.description}</p>
                  </div>
                  <div className="font-display text-brand-600 whitespace-nowrap">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
