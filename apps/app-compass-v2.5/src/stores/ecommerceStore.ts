/**
 * E-Commerce Store
 * 
 * Manages shopping cart, orders, and product browsing for the marketplace.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_kit_application',
    seller_id: 'vendor_olcan_official',
    name: 'Kit Application - Guia Completo',
    description: 'Tudo que você precisa para sua candidatura internacional: templates de CV, carta de apresentação, guias de SOP e vídeos tutoriais.',
    short_description: 'Templates, guias e vídeos para sua candidatura internacional',
    product_type: 'digital',
    category: 'Career Guides',
    status: 'active',
    price: 197,
    compare_at_price: 297,
    currency: 'BRL',
    slug: 'kit-application-guia-completo',
    images: ['/images/products/kit-app-1.jpg'],
    tags: ['application', 'cv', 'sop', 'templates', 'flagship'],
    rating: 4.9,
    review_count: 247,
    sales_count: 1189,
    view_count: 8420,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: true,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'prod_curso_cidadao_mundo',
    seller_id: 'vendor_olcan_official',
    name: 'Curso Cidadão do Mundo',
    description: 'Curso completo sobre mobilidade internacional: planejamento, documentação, adaptação cultural e construção de carreira no exterior. 8 módulos.',
    short_description: '8 módulos sobre mobilidade internacional',
    product_type: 'digital',
    category: 'Courses',
    status: 'active',
    price: 497,
    compare_at_price: 697,
    currency: 'BRL',
    slug: 'curso-cidadao-mundo',
    images: ['/images/products/curso-cidadao.jpg'],
    tags: ['course', 'mobility', 'international', 'bestseller'],
    rating: 4.8,
    review_count: 156,
    sales_count: 834,
    view_count: 6100,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: true,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'prod_ebook_canada',
    seller_id: 'vendor_olcan_official',
    name: 'Guia Completo: Estudar no Canadá',
    description: 'E-book sobre como estudar no Canadá: universidades, vistos, custos, bolsas e caminhos para residência permanente.',
    short_description: 'Universidades, vistos, custos e bolsas no Canadá',
    product_type: 'digital',
    category: 'Career Guides',
    status: 'active',
    price: 47,
    currency: 'BRL',
    slug: 'guia-estudar-canada',
    images: ['/images/products/ebook-canada.jpg'],
    tags: ['canada', 'ebook', 'study-abroad'],
    rating: 4.7,
    review_count: 89,
    sales_count: 512,
    view_count: 3200,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-06-10T10:00:00Z',
  },
  {
    id: 'prod_ebook_europa',
    seller_id: 'vendor_olcan_official',
    name: 'Guia Completo: Estudar na Europa',
    description: 'Guia cobrindo Alemanha, Portugal, Holanda, Espanha e França. Programas gratuitos, Erasmus, vistos e custo de vida.',
    short_description: 'Alemanha, Portugal, Holanda, Espanha e França',
    product_type: 'digital',
    category: 'Career Guides',
    status: 'active',
    price: 57,
    currency: 'BRL',
    slug: 'guia-estudar-europa',
    images: ['/images/products/ebook-europa.jpg'],
    tags: ['europe', 'ebook', 'study-abroad', 'erasmus'],
    rating: 4.6,
    review_count: 67,
    sales_count: 298,
    view_count: 2100,
    is_featured: false,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: true,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-08-20T10:00:00Z',
  },
  {
    id: 'prod_course_interview',
    seller_id: 'vendor_olcan_official',
    name: 'Curso: Preparação para Entrevistas',
    description: 'Curso em vídeo: simulações reais, técnicas STAR, scripts e preparação para bolsas e emprego internacional.',
    short_description: 'Simulações, técnicas e scripts para entrevistas',
    product_type: 'digital',
    category: 'Interview Prep',
    status: 'active',
    price: 297,
    compare_at_price: 397,
    currency: 'BRL',
    slug: 'curso-preparacao-entrevistas',
    images: ['/images/products/course-interview.jpg'],
    tags: ['course', 'interview', 'preparation'],
    rating: 4.8,
    review_count: 43,
    sales_count: 221,
    view_count: 1800,
    is_featured: false,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'prod_coaching_session',
    seller_id: 'vendor_olcan_official',
    name: 'Sessão de Coaching 1:1',
    description: 'Sessão individual de coaching com especialista Olcan. Revisão de CV, estratégia de candidatura ou preparação de entrevista.',
    short_description: 'Sessão individual com especialista Olcan',
    product_type: 'service',
    category: 'Services',
    status: 'active',
    price: 197,
    currency: 'BRL',
    slug: 'sessao-coaching-individual',
    images: ['/images/products/coaching-session.jpg'],
    tags: ['coaching', 'service', '1on1', 'mentoring'],
    rating: 4.9,
    review_count: 312,
    sales_count: 487,
    view_count: 5200,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'prod_rota_premium',
    seller_id: 'vendor_olcan_official',
    name: 'Rota de Internacionalização - Mentoria Premium',
    description: 'Programa premium de mentoria individualizada: 12 semanas de acompanhamento com mentor dedicado, plano personalizado e acesso à rede Olcan.',
    short_description: '12 semanas de mentoria individualizada',
    product_type: 'service',
    category: 'Services',
    status: 'active',
    price: 2997,
    compare_at_price: 3997,
    currency: 'BRL',
    slug: 'rota-internacionalizacao',
    images: ['/images/products/rota-premium.jpg'],
    tags: ['mentoring', 'premium', 'route', 'personalized'],
    rating: 5.0,
    review_count: 18,
    sales_count: 89,
    view_count: 2400,
    is_featured: true,
    is_olcan_official: true,
    is_bestseller: false,
    is_new: false,
    requires_shipping: false,
    stock_quantity: 999,
    created_at: '2025-05-01T10:00:00Z',
  },
]

// Types
interface Product {
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
}

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
            const products = await apiClient.getProducts({ ...filters, ...params })
            set({ products, isLoading: false })
          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch products' })
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
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch featured products' })
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
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch Olcan products' })
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
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch product' })
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
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch product' })
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
