/**
 * E-Commerce Store
 * 
 * Manages shopping cart, orders, and product browsing for the marketplace.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

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
          set({ isLoading: true, error: null })
          
          try {
            const filters = get().filters
            const products = await apiClient.getProducts({
              ...filters,
              ...params
            })
            
            set({ products, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch products'
            })
          }
        },
        
        fetchFeaturedProducts: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const featuredProducts = await apiClient.getFeaturedProducts(10)
            set({ featuredProducts, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch featured products'
            })
          }
        },
        
        fetchOlcanProducts: async (category?: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const olcanProducts = await apiClient.getOlcanOfficialProducts(category)
            set({ olcanProducts, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch Olcan products'
            })
          }
        },
        
        fetchProduct: async (productId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const currentProduct = await apiClient.getProduct(productId)
            set({ currentProduct, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch product'
            })
          }
        },
        
        fetchProductBySlug: async (slug: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const currentProduct = await apiClient.getProductBySlug(slug)
            set({ currentProduct, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch product'
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
          set({ isLoading: true, error: null })
          
          try {
            const cart = await apiClient.getCart()
            set({ cart, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch cart'
            })
          }
        },
        
        addToCart: async (productId: string, quantity: number = 1, bookingData?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.addToCart({
              product_id: productId,
              quantity,
              ...bookingData
            })
            
            // Refresh cart
            await get().fetchCart()
            
            // Open cart drawer
            set({ cartOpen: true, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add to cart'
            })
          }
        },
        
        updateCartItem: async (cartItemId: string, quantity: number) => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.updateCartItem(cartItemId, quantity)
            
            // Refresh cart
            await get().fetchCart()
            
            set({ isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update cart item'
            })
          }
        },
        
        removeFromCart: async (cartItemId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.removeFromCart(cartItemId)
            
            // Refresh cart
            await get().fetchCart()
            
            set({ isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to remove from cart'
            })
          }
        },
        
        clearCart: async () => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.clearCart()
            
            set({ cart: null, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to clear cart'
            })
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
          set({ isLoading: true, error: null })
          
          try {
            const order = await apiClient.createOrder(orderData)
            
            // Clear cart after successful order
            set({ cart: null, currentOrder: order, isLoading: false })
            
            return order
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create order'
            })
            throw error
          }
        },
        
        fetchOrders: async (params?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const orders = await apiClient.getOrders(params)
            set({ orders, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch orders'
            })
          }
        },
        
        fetchOrder: async (orderId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const currentOrder = await apiClient.getOrder(orderId)
            set({ currentOrder, isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch order'
            })
          }
        },
        
        // Review actions
        createReview: async (productId: string, reviewData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.createReview(productId, reviewData)
            
            // Refresh product to get updated rating
            if (get().currentProduct?.id === productId) {
              await get().fetchProduct(productId)
            }
            
            set({ isLoading: false })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create review'
            })
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
