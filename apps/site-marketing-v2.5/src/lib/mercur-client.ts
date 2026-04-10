import fs from "node:fs/promises";
import path from "node:path";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export interface StorefrontProduct {
  id: string;
  title: string;
  legacy_title?: string | null;
  handle: string;
  slug: string;
  description: string | null;
  short_description?: string | null;
  thumbnail: string | null;
  images: string[];
  product_type: string;
  category: string;
  area?: string | null;
  format?: string | null;
  language?: string | null;
  version?: string | null;
  phase?: string | null;
  status?: string | null;
  revenue_model?: string | null;
  platform_sale?: string | null;
  tags: string[];
  features?: string[];
  specifications?: string[];
  modules?: string[];
  audience?: string[];
  cta_label?: string | null;
  catalog_visibility?: string;
  is_featured: boolean;
  is_olcan_official: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  price_amount: number | null;
  price_currency: string;
  price_display: string;
  compare_at_price_amount?: number | null;
  compare_at_price_display?: string | null;
  checkout_mode: "external" | "catalog_only" | "internal";
  checkout_url: string | null;
  catalog_url: string;
}

function catalogFilePath() {
  return path.resolve(
    process.cwd(),
    "data",
    "commerce",
    "olcan-products.json"
  );
}

function formatPrice(amount: number | null) {
  if (amount == null) {
    return "Sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function normalizeFallbackProduct(raw: any): StorefrontProduct {
  return {
    id: raw.id,
    title: raw.title,
    legacy_title: raw.legacy_title ?? null,
    handle: raw.handle,
    slug: raw.handle,
    description: raw.description ?? raw.short_description ?? null,
    short_description: raw.short_description ?? null,
    thumbnail: null,
    images: [],
    product_type: raw.product_type ?? "digital",
    category: raw.category ?? "Marketplace",
    area: raw.area ?? null,
    format: raw.format ?? null,
    language: raw.language ?? null,
    version: raw.version ?? null,
    phase: raw.phase ?? null,
    status: raw.status ?? null,
    revenue_model: raw.revenue_model ?? null,
    platform_sale: raw.platform_sale ?? null,
    tags: raw.tags ?? [],
    features: raw.features ?? [],
    specifications: raw.specifications ?? [],
    modules: raw.modules ?? [],
    audience: raw.audience ?? [],
    cta_label: raw.cta_label ?? null,
    catalog_visibility: raw.catalog_visibility ?? "public",
    is_featured: Boolean(raw.is_featured),
    is_olcan_official: Boolean(raw.is_olcan_official),
    is_bestseller: Boolean(raw.is_bestseller),
    is_new: Boolean(raw.is_new),
    price_amount: raw.price_brl ?? null,
    price_currency: "BRL",
    price_display: raw.price_display_override ?? formatPrice(raw.price_brl ?? null),
    compare_at_price_amount: raw.compare_at_price_brl ?? null,
    compare_at_price_display:
      raw.compare_at_price_brl != null ? formatPrice(raw.compare_at_price_brl) : null,
    checkout_mode: raw.checkout_mode ?? "catalog_only",
    checkout_url: raw.checkout_url ?? null,
    catalog_url: `/marketplace/${raw.handle}`,
  };
}

async function getFallbackProducts(): Promise<StorefrontProduct[]> {
  const raw = await fs.readFile(catalogFilePath(), "utf-8");
  const items = JSON.parse(raw);
  return items
    .map(normalizeFallbackProduct)
    .filter((item: StorefrontProduct) => item.catalog_visibility === "public");
}

export async function getMercurProducts(options?: {
  limit?: number;
}): Promise<StorefrontProduct[]> {
  const query = new URLSearchParams();
  if (options?.limit) {
    query.set("limit", options.limit.toString());
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/commerce/public/products?${query.toString()}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return getFallbackProducts();
    }

    const data = await response.json();
    return data.items || (await getFallbackProducts());
  } catch {
    return getFallbackProducts();
  }
}

export async function getMercurProduct(
  handleOrId: string
): Promise<StorefrontProduct | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/commerce/public/products/${handleOrId}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      const fallback = await getFallbackProducts();
      return (
        fallback.find((product) => product.handle === handleOrId || product.id === handleOrId) ||
        null
      );
    }

    const data = await response.json();
    return data.item || null;
  } catch {
    const fallback = await getFallbackProducts();
    return (
      fallback.find((product) => product.handle === handleOrId || product.id === handleOrId) ||
      null
    );
  }
}

export function getProductPrice(product: Pick<StorefrontProduct, "price_display">) {
  return product.price_display || "Sob consulta";
}
