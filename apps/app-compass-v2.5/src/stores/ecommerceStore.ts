/**
 * E-Commerce Store
 * 
 * Manages shopping cart, orders, and product browsing for the marketplace.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'
import { getStorefrontProductUrl } from '@/lib/storefront-links'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Types
export interface Product {
  id: string
  seller_id: string
  name: string
  description: string
  short_description?: string
  product_type: 'digital' | 'physical' | 'service' | 'hybrid'
  category: string
  status: string
  price: number
  compare_at_price?: number
  currency: string
  slug: string
  images?: string[]
  thumbnail?: string | null
  video_url?: string
  tags?: string[]
  rating: number
  review_count: number
  sales_count: number
  view_count: number
  is_featured: boolean
  is_olcan_official: boolean
  is_bestseller: boolean
  is_new: boolean
  requires_shipping: boolean
  stock_quantity: number
  created_at: string
  checkout_mode?: 'external' | 'catalog_only' | 'internal'
  checkout_url?: string | null
  catalog_url?: string | null
  price_display?: string
  compare_at_price_display?: string | null
}

function createDemoProduct(product: Omit<Product, 'catalog_url'>): Product {
  return {
    ...product,
    catalog_url: getStorefrontProductUrl(product.slug),
  }
}

const DEMO_PRODUCTS: Product[] = [
  createDemoProduct({
    id: 'kit-application',
    seller_id: 'vendor_olcan_official',
    name: 'Kit Application',
    description: 'Sistema completo em Notion para organizar candidaturas internacionais, documentos e prazos sem depender de planilhas soltas.',
    short_description: 'Template Notion para organizar candidaturas, documentos e prazos',
    product_type: 'digital',
    category: 'Ferramentas & Modelos',
    status: 'Venda ativa',
    price: 75,
    currency: 'BRL',
    slug: 'kit-application',
    images: [],
    tags: ['application', 'notion', 'templates', 'flagship'],
    rating: 5,
    review_count: 0,
    sales_count: 0,
    view_count: 0,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: true,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2026-04-07T10:00:00Z',
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/X85073158P',
  }),
  createDemoProduct({
    id: 'curso-cidadao-mundo',
    seller_id: 'vendor_olcan_official',
    name: 'Sem Fronteiras',
    description: 'Curso online com 9 módulos e mais de 30 aulas curtas para famílias e adultos planejarem estudos internacionais com estratégia, finanças e preparo emocional.',
    short_description: 'Curso online estruturado para organizar estudos internacionais',
    product_type: 'digital',
    category: 'Educação & Formação',
    status: 'Venda ativa',
    price: 497,
    currency: 'BRL',
    slug: 'curso-cidadao-mundo',
    images: [],
    tags: ['course', 'international', 'familias', 'bestseller'],
    rating: 5,
    review_count: 0,
    sales_count: 0,
    view_count: 0,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: true,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2026-04-07T10:00:00Z',
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/N97314230U',
  }),
  createDemoProduct({
    id: 'rota-internacionalizacao',
    seller_id: 'vendor_olcan_official',
    name: 'Rota da Internacionalização',
    description: 'Mapa visual e interativo para planejar sua jornada de internacionalização com clareza, checklists e decisões práticas.',
    short_description: 'Board Miro com roteiro visual da jornada internacional',
    product_type: 'digital',
    category: 'Ferramentas & Modelos',
    status: 'Venda ativa',
    price: 35,
    currency: 'BRL',
    slug: 'rota-internacionalizacao',
    images: [],
    tags: ['miro', 'planejamento', 'roadmap', 'international'],
    rating: 5,
    review_count: 0,
    sales_count: 0,
    view_count: 0,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2026-04-07T10:00:00Z',
    checkout_mode: 'external',
    checkout_url: 'https://pay.hotmart.com/K97966494E',
  }),
  createDemoProduct({
    id: 'mentorias-olcan',
    seller_id: 'vendor_olcan_official',
    name: 'Mentorias Olcan',
    description: 'Acompanhamento 1:1 para acelerar narrativa, candidaturas e posicionamento internacional com orientação humana e modular.',
    short_description: 'Sessões 1:1 para narrativa, candidaturas e entrevistas',
    product_type: 'service',
    category: 'Serviços de Coaching & Consultoria',
    status: 'Venda ativa',
    price: 225,
    currency: 'BRL',
    slug: 'mentorias-olcan',
    images: [],
    tags: ['mentoria', 'service', '1on1', 'narrativa'],
    rating: 5,
    review_count: 0,
    sales_count: 0,
    view_count: 0,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2026-04-07T10:00:00Z',
    checkout_mode: 'catalog_only',
    checkout_url: null,
  }),
  createDemoProduct({
    id: 'compass-by-olcan',
    seller_id: 'vendor_olcan_official',
    name: 'Compass by Olcan',
    description: 'Plataforma SaaS da Olcan para diagnóstico, rotas, construção de artefatos, preparação para entrevistas e operação da jornada internacional.',
    short_description: 'Plataforma web para diagnóstico, rotas, Forge e entrevistas',
    product_type: 'hybrid',
    category: 'Plataforma SaaS',
    status: 'Acesso restrito',
    price: 79,
    currency: 'BRL',
    slug: 'compass-by-olcan',
    images: [],
    tags: ['saas', 'compass', 'diagnostico', 'forge'],
    rating: 5,
    review_count: 0,
    sales_count: 0,
    view_count: 0,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: true,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2026-04-07T10:00:00Z',
    checkout_mode: 'internal',
    checkout_url: null,
  }),
]

interface CartItem {
  id: string
  product_id: string
  quantity: number
  price_at_add: number
  booking_date?: string
  booking_notes?: string
  added_at: string
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  item_count: number
}

interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  currency: string
  payment_status: string
  tracking_number?: string
  created_at: string
}

interface EcommerceState {
  // Products
  products: Product[]
  featuredProducts: Product[]
  olcanProducts: Product[]
  currentProduct: Product | null
  
  // Cart
  cart: Cart | null
  cartOpen: boolean
  
  // Orders
  orders: Order[]
  currentOrder: Order | null
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Filters
  filters: {
    product_type?: string
    category?: string
    search?: string
    min_price?: number
    max_price?: number
    tags?: string[]
    sort_by?: string
  }
  
  // Actions - Products
  fetchProducts: (params?: any) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchOlcanProducts: (category?: string) => Promise<void>
  fetchProduct: (productId: string) => Promise<void>
  fetchProductBySlug: (slug: string) => Promise<void>
  setFilters: (filters: any) => void
  clearFilters: () => void
  
  // Actions - Cart
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number, bookingData?: any) => Promise<void>
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Actions - Orders
  createOrder: (orderData: any) => Promise<Order>
  fetchOrders: (params?: any) => Promise<void>
  fetchOrder: (orderId: string) => Promise<void>
  
  // Actions - Reviews
  createReview: (productId: string, reviewData: any) => Promise<void>
  
  // Utility
  clearError: () => void
  reset: () => void
}

const initialFilters = {
  product_type: undefined,
  category: undefined,
  search: undefined,
  min_price: undefined,
  max_price: undefined,
  tags: undefined,
  sort_by: 'newest'
}

export const useEcommerceStore = create<EcommerceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        featuredProducts: [],
        olcanProducts: [],
        currentProduct: null,
        cart: null,
        cartOpen: false,
        orders: [],
        currentOrder: null,
        isLoading: false,
        error: null,
        filters: initialFilters,
        
        // Product actions
        fetchProducts: async (params?: any) => {
          if (DEMO_MODE) {
            let filtered = [...DEMO_PRODUCTS]
            const filters = { ...get().filters, ...params }
            if (filters.product_type) filtered = filtered.filter(p => p.product_type === filters.product_type)
            if (filters.category) filtered = filtered.filter(p => p.category === filters.category)
            if (filters.search) {
              const q = filters.search.toLowerCase()
              filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
            }
            set({ products: filtered, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const filters = get().filters
            const products = await apiClient.getPublicProducts({ ...filters, ...params })
            set({ products, isLoading: false })
          } catch (error) {
            const filters = get().filters
            let fallback = [...DEMO_PRODUCTS]
            if (filters.product_type) fallback = fallback.filter((p) => p.product_type === filters.product_type)
            if (filters.category) fallback = fallback.filter((p) => p.category === filters.category)
            if (filters.search) {
              const q = filters.search.toLowerCase()
              fallback = fallback.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
            }
            set({
              products: fallback,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch products',
            })
          }
        },

        fetchFeaturedProducts: async () => {
          if (DEMO_MODE) {
            set({ featuredProducts: DEMO_PRODUCTS.filter(p => p.is_featured), isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const featuredProducts = await apiClient.getFeaturedProducts(10)
            set({ featuredProducts, isLoading: false })
          } catch (error) {
            set({
              featuredProducts: DEMO_PRODUCTS.filter((p) => p.is_featured),
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch featured products',
            })
          }
        },

        fetchOlcanProducts: async (category?: string) => {
          if (DEMO_MODE) {
            let products = DEMO_PRODUCTS.filter(p => p.is_olcan_official)
            if (category) products = products.filter(p => p.category === category)
            set({ olcanProducts: products, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const olcanProducts = await apiClient.getOlcanOfficialProducts(category)
            set({ olcanProducts, isLoading: false })
          } catch (error) {
            let fallback = DEMO_PRODUCTS.filter((p) => p.is_olcan_official)
            if (category) fallback = fallback.filter((p) => p.category === category)
            set({
              olcanProducts: fallback,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch Olcan products',
            })
          }
        },

        fetchProduct: async (productId: string) => {
          if (DEMO_MODE) {
            const currentProduct = DEMO_PRODUCTS.find(p => p.id === productId) || null
            set({ currentProduct, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const currentProduct = await apiClient.getProduct(productId)
            set({ currentProduct, isLoading: false })
          } catch (error) {
            const fallback = DEMO_PRODUCTS.find((p) => p.id === productId) || null
            set({
              currentProduct: fallback,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch product',
            })
          }
        },

        fetchProductBySlug: async (slug: string) => {
          if (DEMO_MODE) {
            const currentProduct = DEMO_PRODUCTS.find(p => p.slug === slug) || null
            set({ currentProduct, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const currentProduct = await apiClient.getProductBySlug(slug)
            set({ currentProduct, isLoading: false })
          } catch (error) {
            const fallback = DEMO_PRODUCTS.find((p) => p.slug === slug) || null
            set({
              currentProduct: fallback,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch product',
            })
          }
        },
        
        setFilters: (newFilters: any) => {
          set({ filters: { ...get().filters, ...newFilters } })
        },
        
        clearFilters: () => {
          set({ filters: initialFilters })
        },
        
        // Cart actions
        fetchCart: async () => {
          if (DEMO_MODE) { set({ isLoading: false }); return }

          set({ isLoading: true, error: null })
          try {
            const cart = await apiClient.getCart()
            set({ cart, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch cart' })
          }
        },

        addToCart: async (productId: string, quantity: number = 1) => {
          if (DEMO_MODE) {
            const product = DEMO_PRODUCTS.find(p => p.id === productId)
            if (!product) return
            const cart = get().cart || { id: 'demo_cart', items: [], subtotal: 0, tax: 0, shipping: 0, total: 0, item_count: 0 }
            const existing = cart.items.find(i => i.product_id === productId)
            let items: CartItem[]
            if (existing) {
              items = cart.items.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i)
            } else {
              items = [...cart.items, { id: `ci_${Date.now()}`, product_id: productId, quantity, price_at_add: product.price, added_at: new Date().toISOString() }]
            }
            const subtotal = items.reduce((s, i) => s + i.price_at_add * i.quantity, 0)
            set({ cart: { ...cart, items, subtotal, total: subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) }, cartOpen: true, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            await apiClient.addToCart({ product_id: productId, quantity })
            await get().fetchCart()
            set({ cartOpen: true, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add to cart' })
          }
        },

        updateCartItem: async (cartItemId: string, quantity: number) => {
          if (DEMO_MODE) {
            const cart = get().cart
            if (!cart) return
            const items = quantity > 0 ? cart.items.map(i => i.id === cartItemId ? { ...i, quantity } : i) : cart.items.filter(i => i.id !== cartItemId)
            const subtotal = items.reduce((s, i) => s + i.price_at_add * i.quantity, 0)
            set({ cart: { ...cart, items, subtotal, total: subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) }, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            await apiClient.updateCartItem(cartItemId, quantity)
            await get().fetchCart()
            set({ isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update cart item' })
          }
        },

        removeFromCart: async (cartItemId: string) => {
          if (DEMO_MODE) {
            const cart = get().cart
            if (!cart) return
            const items = cart.items.filter(i => i.id !== cartItemId)
            const subtotal = items.reduce((s, i) => s + i.price_at_add * i.quantity, 0)
            set({ cart: { ...cart, items, subtotal, total: subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) }, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            await apiClient.removeFromCart(cartItemId)
            await get().fetchCart()
            set({ isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to remove from cart' })
          }
        },

        clearCart: async () => {
          if (DEMO_MODE) { set({ cart: null, isLoading: false }); return }

          set({ isLoading: true, error: null })
          try {
            await apiClient.clearCart()
            set({ cart: null, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to clear cart' })
          }
        },
        
        toggleCart: () => {
          set({ cartOpen: !get().cartOpen })
        },
        
        openCart: () => {
          set({ cartOpen: true })
        },
        
        closeCart: () => {
          set({ cartOpen: false })
        },
        
        // Order actions
        createOrder: async (orderData: any) => {
          if (DEMO_MODE) {
            const cart = get().cart
            const order: Order = {
              id: `demo_order_${Date.now()}`,
              order_number: `OLC-${Date.now().toString(36).toUpperCase()}`,
              status: 'completed',
              subtotal: cart?.subtotal || 0,
              tax: 0,
              shipping_cost: 0,
              discount: 0,
              total: cart?.total || 0,
              currency: 'BRL',
              payment_status: 'paid',
              created_at: new Date().toISOString(),
            }
            set({ cart: null, currentOrder: order, orders: [order, ...get().orders], isLoading: false })
            return order
          }

          set({ isLoading: true, error: null })
          try {
            const order = await apiClient.createOrder(orderData)
            set({ cart: null, currentOrder: order, isLoading: false })
            return order
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to create order' })
            throw error
          }
        },

        fetchOrders: async (params?: any) => {
          if (DEMO_MODE) { set({ isLoading: false }); return }

          set({ isLoading: true, error: null })
          try {
            const orders = await apiClient.getOrders(params)
            set({ orders, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch orders' })
          }
        },

        fetchOrder: async (orderId: string) => {
          if (DEMO_MODE) {
            const currentOrder = get().orders.find(o => o.id === orderId) || null
            set({ currentOrder, isLoading: false })
            return
          }

          set({ isLoading: true, error: null })
          try {
            const currentOrder = await apiClient.getOrder(orderId)
            set({ currentOrder, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch order' })
          }
        },

        // Review actions
        createReview: async (productId: string, reviewData: any) => {
          if (DEMO_MODE) { set({ isLoading: false }); return }

          set({ isLoading: true, error: null })
          try {
            await apiClient.createReview(productId, reviewData)
            if (get().currentProduct?.id === productId) { await get().fetchProduct(productId) }
            set({ isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to create review' })
          }
        },
        
        // Utility
        clearError: () => {
          set({ error: null })
        },
        
        reset: () => {
          set({
            products: [],
            featuredProducts: [],
            olcanProducts: [],
            currentProduct: null,
            cart: null,
            cartOpen: false,
            orders: [],
            currentOrder: null,
            isLoading: false,
            error: null,
            filters: initialFilters
          })
        }
      }),
      {
        name: 'ecommerce-store',
        partialize: (state) => ({
          cart: state.cart,
          filters: state.filters
        })
      }
    ),
    {
      name: 'ecommerce-store'
    }
  )
)

// Selectors
export const useProducts = () => useEcommerceStore(state => state.products)
export const useFeaturedProducts = () => useEcommerceStore(state => state.featuredProducts)
export const useOlcanProducts = () => useEcommerceStore(state => state.olcanProducts)
export const useCurrentProduct = () => useEcommerceStore(state => state.currentProduct)
export const useCart = () => useEcommerceStore(state => state.cart)
export const useCartOpen = () => useEcommerceStore(state => state.cartOpen)
export const useOrders = () => useEcommerceStore(state => state.orders)
export const useCurrentOrder = () => useEcommerceStore(state => state.currentOrder)
export const useEcommerceLoading = () => useEcommerceStore(state => state.isLoading)
export const useEcommerceError = () => useEcommerceStore(state => state.error)

// Actions
export const useEcommerceActions = () => useEcommerceStore(state => ({
  fetchProducts: state.fetchProducts,
  fetchFeaturedProducts: state.fetchFeaturedProducts,
  fetchOlcanProducts: state.fetchOlcanProducts,
  fetchProduct: state.fetchProduct,
  fetchProductBySlug: state.fetchProductBySlug,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  fetchCart: state.fetchCart,
  addToCart: state.addToCart,
  updateCartItem: state.updateCartItem,
  removeFromCart: state.removeFromCart,
  clearCart: state.clearCart,
  toggleCart: state.toggleCart,
  openCart: state.openCart,
  closeCart: state.closeCart,
  createOrder: state.createOrder,
  fetchOrders: state.fetchOrders,
  fetchOrder: state.fetchOrder,
  createReview: state.createReview,
  clearError: state.clearError,
  reset: state.reset
}))

export default useEcommerceStore
