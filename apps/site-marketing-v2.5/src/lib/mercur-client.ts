const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('[mercur-client] Using API:', API_BASE_URL);
}

export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  slug: string;
  description: string | null;
  short_description?: string | null;
  thumbnail: string | null;
  images: string[];
  product_type: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_olcan_official: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  price_amount: number | null;
  price_currency: string;
  price_display: string;
  compare_at_price_amount?: number | null;
  compare_at_price_display?: string | null;
  checkout_mode: 'external' | 'catalog_only' | 'internal';
  checkout_url: string | null;
  catalog_url: string;
}

// Static fallback products for build-time when API is unavailable
const STATIC_FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'curso-cidadao-mundo',
    title: 'Curso Cidadão do Mundo',
    handle: 'curso-cidadao-mundo',
    slug: 'curso-cidadao-mundo',
    description: 'Mapeamento estratégico e preparo mental para uma carreira internacional sustentável.',
    short_description: 'Mapeamento estratégico e preparo mental para uma carreira internacional sustentável.',
    thumbnail: null,
    images: [],
    product_type: 'digital',
    category: 'Cursos',
    tags: ['curso', 'mobilidade', 'carreira'],
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: true,
    is_new: false,
    price_amount: 497,
    price_currency: 'BRL',
    price_display: 'R$ 497,00',
    compare_at_price_amount: 697,
    compare_at_price_display: 'R$ 697,00',
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/exemplo',
    catalog_url: 'https://www.olcan.com.br/marketplace/curso-cidadao-mundo',
  },
  {
    id: 'kit-application',
    title: 'Kit Application',
    handle: 'kit-application',
    slug: 'kit-application',
    description: 'Documentos-base e estrutura narrativa para candidaturas internacionais mais consistentes.',
    short_description: 'Documentos-base e estrutura narrativa para candidaturas internacionais.',
    thumbnail: null,
    images: [],
    product_type: 'digital',
    category: 'Ferramentas',
    tags: ['curriculo', 'cover-letter', 'application'],
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    price_amount: 997,
    price_currency: 'BRL',
    price_display: 'R$ 997,00',
    compare_at_price_amount: null,
    compare_at_price_display: null,
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/exemplo',
    catalog_url: 'https://www.olcan.com.br/marketplace/kit-application',
  },
  {
    id: 'rota-internacionalizacao',
    title: 'Rota de Internacionalização',
    handle: 'rota-internacionalizacao',
    slug: 'rota-internacionalizacao',
    description: 'Mentoria estratégica para organizar decisão, artefatos e execução da sua rota.',
    short_description: 'Mentoria estratégica para organizar decisão, artefatos e execução.',
    thumbnail: null,
    images: [],
    product_type: 'service',
    category: 'Mentorias',
    tags: ['mentoria', 'estrategia', 'rota'],
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    price_amount: 4500,
    price_currency: 'BRL',
    price_display: 'R$ 4.500,00',
    compare_at_price_amount: null,
    compare_at_price_display: null,
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/exemplo',
    catalog_url: 'https://www.olcan.com.br/marketplace/rota-internacionalizacao',
  },
];

export async function getMercurProducts(options?: { limit?: number }): Promise<StorefrontProduct[]> {
  const query = new URLSearchParams();
  if (options?.limit) query.set('limit', options.limit.toString());

  try {
    const response = await fetch(`${API_BASE_URL}/commerce/public/products?${query.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn('[mercur-client] API returned non-OK status, using static fallback');
      return STATIC_FALLBACK_PRODUCTS;
    }

    const data = await response.json();
    return data.items || STATIC_FALLBACK_PRODUCTS;
  } catch (error) {
    console.warn('[mercur-client] API unavailable during build, using static fallback:', error);
    return STATIC_FALLBACK_PRODUCTS;
  }
}

export async function getMercurProduct(handleOrId: string): Promise<StorefrontProduct | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/public/products/${handleOrId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn('[mercur-client] API returned non-OK status, checking static fallback');
      return STATIC_FALLBACK_PRODUCTS.find(p => p.handle === handleOrId || p.id === handleOrId) || null;
    }

    const data = await response.json();
    return data.item || null;
  } catch (error) {
    console.warn('[mercur-client] API unavailable, checking static fallback:', error);
    return STATIC_FALLBACK_PRODUCTS.find(p => p.handle === handleOrId || p.id === handleOrId) || null;
  }
}

export function getProductPrice(product: Pick<StorefrontProduct, 'price_display'>): string {
  return product.price_display || 'Sob consulta';
}
