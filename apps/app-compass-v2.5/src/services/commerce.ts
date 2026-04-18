/**
 * Unified Commerce Service
 * Single source of truth for product catalog, cart, and orders
 * Replaces scattered ecommerceStore, medusa-client, and api-client commerce calls
 */

import { resolveApiBaseUrl } from "@/lib/api";

const API_BASE_URL = resolveApiBaseUrl();

export interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  title: string;
  handle: string;
  slug: string;
  description: string;
  short_description?: string;
  product_type: "digital" | "physical" | "service" | "hybrid";
  category: string;
  status: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  thumbnail?: string | null;
  images: string[];
  tags: string[];
  rating: number;
  review_count: number;
  sales_count: number;
  view_count: number;
  is_featured: boolean;
  is_olcan_official: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  requires_shipping: boolean;
  stock_quantity: number;
  created_at: string;
  checkout_mode?: "external" | "catalog_only" | "internal";
  checkout_url?: string | null;
  catalog_url?: string | null;
  price_display?: string;
  compare_at_price_display?: string | null;
  // CMS-enriched fields
  journey_tags?: string[];
  recommended_for?: string[];
}

export interface ProductListResponse {
  items: Product[];
  count: number;
  limit: number;
  offset: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  product_type?: string;
  currency?: string;
  quantity: number;
  price_at_add: number;
  booking_date?: string;
  booking_notes?: string;
  added_at: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  item_count: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  payment_status: string;
  tracking_number?: string;
  created_at: string;
}

export interface CheckoutIntentResponse {
  checkout_url: string;
  catalog_url: string;
  product: Product;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  auth_mode: string;
  source: string;
}

class CommerceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("olcan_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An error occurred",
      }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List products from unified commerce endpoint
   * This endpoint proxies MedusaJS and enriches with PayloadCMS metadata
   */
  async listProducts(params?: {
    product_type?: string;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    tags?: string[];
    is_featured?: boolean;
    is_olcan_official?: boolean;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.product_type) queryParams.append("product_type", params.product_type);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.min_price !== undefined) queryParams.append("min_price", params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append("max_price", params.max_price.toString());
    if (params?.tags) params.tags.forEach((tag) => queryParams.append("tags", tag));
    if (params?.is_featured !== undefined) queryParams.append("is_featured", params.is_featured.toString());
    if (params?.is_olcan_official !== undefined) queryParams.append("is_olcan_official", params.is_olcan_official.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await fetch(
      `${this.baseUrl}/commerce/public/products?${queryParams.toString()}`,
      {
        headers: this.getHeaders(false),
      }
    );

    return this.handleResponse<ProductListResponse>(response);
  }

  /**
   * Get a single product by slug or ID
   */
  async getProduct(slugOrId: string): Promise<Product> {
    const response = await fetch(
      `${this.baseUrl}/commerce/public/products/${slugOrId}`,
      {
        headers: this.getHeaders(false),
      }
    );

    const data = await this.handleResponse<{ item: Product }>(response);
    return data.item;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.listProducts({
      is_featured: true,
      limit,
    });
    return response.items;
  }

  /**
   * Get Olcan official products
   */
  async getOlcanProducts(category?: string, limit: number = 50): Promise<Product[]> {
    const response = await this.listProducts({
      is_olcan_official: true,
      category,
      limit,
    });
    return response.items;
  }

  /**
   * Create checkout intent for a product
   */
  async createCheckoutIntent(
    handle: string,
    origin: string = "compass-product-page"
  ): Promise<CheckoutIntentResponse> {
    const response = await fetch(`${this.baseUrl}/commerce/me/checkout-intents`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ handle, origin }),
    });

    return this.handleResponse<CheckoutIntentResponse>(response);
  }

  /**
   * Get user's shopping cart
   */
  async getCart(): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart`, {
      headers: this.getHeaders(true),
    });

    return this.handleResponse<Cart>(response);
  }

  /**
   * Add item to cart
   */
  async addToCart(data: {
    product_id: string;
    quantity?: number;
    booking_date?: string;
    booking_notes?: string;
  }): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Cart>(response);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    const response = await fetch(
      `${this.baseUrl}/marketplace/cart/items/${cartItemId}`,
      {
        method: "PATCH",
        headers: this.getHeaders(true),
        body: JSON.stringify({ quantity }),
      }
    );

    return this.handleResponse<Cart>(response);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/marketplace/cart/items/${cartItemId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove item from cart: ${response.statusText}`);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }
  }

  /**
   * Create order from cart
   */
  async createOrder(data: {
    shipping_address?: ShippingAddress;
    billing_address?: ShippingAddress;
    payment_method?: string;
    customer_notes?: string;
  }): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Order>(response);
  }

  /**
   * Get user's orders
   */
  async getOrders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await fetch(
      `${this.baseUrl}/marketplace/orders?${queryParams.toString()}`,
      {
        headers: this.getHeaders(true),
      }
    );

    return this.handleResponse<Order[]>(response);
  }

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders/${orderId}`, {
      headers: this.getHeaders(true),
    });

    return this.handleResponse<Order>(response);
  }

  /**
   * Create product review
   */
  async createReview(
    productId: string,
    data: {
      rating: number;
      title?: string;
      comment?: string;
      order_id?: string;
    }
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/marketplace/products/${productId}/reviews`,
      {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create review: ${response.statusText}`);
    }
  }
}

export const commerceService = new CommerceService();
