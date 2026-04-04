/**
 * Shopping Cart Drawer Component
 * 
 * Slide-out cart with items, totals, and checkout button.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_image?: string
  product_type: string
  quantity: number
  price_at_add: number
  currency: string
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

interface ShoppingCartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCartDrawer({ isOpen, onClose }: ShoppingCartDrawerProps) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCart()
    }
  }, [isOpen])

  const loadCart = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch from API
      const mockCart: Cart = {
        id: 'cart_123',
        items: [
          {
            id: 'item_1',
            product_id: 'prod_1',
            product_name: 'Ultimate Resume Template Pack',
            product_type: 'digital',
            quantity: 1,
            price_at_add: 29.99,
            currency: 'USD'
          },
          {
            id: 'item_2',
            product_id: 'prod_2',
            product_name: 'Career Coaching Session',
            product_type: 'service',
            quantity: 1,
            price_at_add: 99.00,
            currency: 'USD'
          }
        ],
        subtotal: 128.99,
        tax: 0,
        shipping: 0,
        total: 128.99,
        item_count: 2
      }
      setCart(mockCart)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load cart:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }

    setIsUpdating(itemId)
    try {
      // TODO: Call API to update quantity
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update quantity:', error)
      }
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      // TODO: Call API to remove item
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.filter(item => item.id !== itemId),
          item_count: cart.item_count - 1
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove item:', error)
      }
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCheckout = () => {
    onClose()
    router.push('/marketplace/checkout')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md h-full bg-background shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-foreground/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {cart && (
              <p className="text-foreground/60">
                {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Package className="w-16 h-16 text-foreground/20 mb-4" />
                <h3 className="text-xl font-semibold text-foreground/60 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-foreground/40 mb-6">
                  Add some products to get started
                </p>
                <GlassButton onClick={onClose}>
                  Continue Shopping
                </GlassButton>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-purple-500" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 line-clamp-2">
                            {item.product_name}
                          </h4>
                          <p className="text-sm text-foreground/60 capitalize mb-2">
                            {item.product_type}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-500">
                              ${item.price_at_add.toFixed(2)}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={isUpdating === item.id}
                                className="p-1 hover:bg-foreground/10 rounded transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isUpdating === item.id}
                                className="p-1 hover:bg-foreground/10 rounded transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                disabled={isUpdating === item.id}
                                className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors disabled:opacity-50 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="p-6 border-t border-foreground/10 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.tax > 0 && (
                  <div className="flex justify-between text-foreground/70">
                    <span>Tax</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                )}
                {cart.shipping > 0 && (
                  <div className="flex justify-between text-foreground/70">
                    <span>Shipping</span>
                    <span>${cart.shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-foreground/10">
                  <span>Total</span>
                  <span className="text-purple-500">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <GlassButton
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </GlassButton>

              <button
                onClick={onClose}
                className="w-full py-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ShoppingCartDrawer
