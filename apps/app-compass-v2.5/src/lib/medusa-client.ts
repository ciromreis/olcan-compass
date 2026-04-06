/**
 * MedusaJS Client for Olcan Marketplace
 * Connects directly to MedusaJS backend with Olcan JWT authentication
 */

import { authService } from '@olcan/shared-auth';

const MEDUSA_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:9000';

export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  subtitle: string | null;
  thumbnail: string | null;
  images: Array<{ id: string; url: string }>;
  variants: Array<{
    id: string;
    title: string;
    prices: Array<{
      amount: number;
      currency_code: string;
    }>;
    inventory_quantity: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
  tags: Array<{
    id: string;
    value: string;
  }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MedusaCollection {
  id: string;
  title: string;
  handle: string;
  products: MedusaProduct[];
}

export interface MedusaCart {
  id: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  total: number;
  subtotal: number;
  tax_total: number;
}

class MedusaClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = MEDUSA_URL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Olcan JWT token if authenticated
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * List all products from the store
   */
  async listProducts(params?: {
    limit?: number;
    offset?: number;
    category_id?: string;
    collection_id?: string;
    q?: string;
  }): Promise<{ products: MedusaProduct[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    if (params?.category_id) query.set('category_id[]', params.category_id);
    if (params?.collection_id) query.set('collection_id[]', params.collection_id);
    if (params?.q) query.set('q', params.q);

    const response = await fetch(
      `${this.baseUrl}/store/products?${query.toString()}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a single product by ID or handle
   */
  async getProduct(idOrHandle: string): Promise<MedusaProduct> {
    const response = await fetch(
      `${this.baseUrl}/store/products/${idOrHandle}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.product;
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<{ collections: MedusaCollection[] }> {
    const response = await fetch(`${this.baseUrl}/store/collections`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a single collection
   */
  async getCollection(id: string): Promise<MedusaCollection> {
    const response = await fetch(`${this.baseUrl}/store/collections/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection;
  }

  /**
   * Create a cart
   */
  async createCart(): Promise<MedusaCart> {
    const response = await fetch(`${this.baseUrl}/store/carts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to create cart: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<MedusaCart> {
    const response = await fetch(`${this.baseUrl}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        variant_id: variantId,
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cart;
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<MedusaCart> {
    const response = await fetch(`${this.baseUrl}/store/carts/${cartId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cart;
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<{ products: MedusaProduct[] }> {
    return this.listProducts({ q: query });
  }

  /**
   * Get product categories
   */
  async listCategories(): Promise<{ product_categories: any[] }> {
    const response = await fetch(`${this.baseUrl}/store/product-categories`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const medusaClient = new MedusaClient();

// Helper to format price
export function formatPrice(amount: number, currencyCode: string = 'BRL'): string {
  const value = amount / 100; // MedusaJS stores prices in cents
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

// Helper to get product price
export function getProductPrice(product: MedusaProduct): {
  amount: number;
  formatted: string;
  currency: string;
} {
  const variant = product.variants?.[0];
  const price = variant?.prices?.[0];

  if (!price) {
    return {
      amount: 0,
      formatted: 'Sob consulta',
      currency: 'BRL',
    };
  }

  return {
    amount: price.amount,
    formatted: formatPrice(price.amount, price.currency_code),
    currency: price.currency_code,
  };
}

// Helper to check if product is in stock
export function isInStock(product: MedusaProduct): boolean {
  return product.variants?.some(v => v.inventory_quantity > 0) ?? false;
}
