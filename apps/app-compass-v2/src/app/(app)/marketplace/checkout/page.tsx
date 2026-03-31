/**
 * Checkout Page
 * 
 * Complete checkout flow with shipping, billing, and payment.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock
} from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import { useEcommerceStore } from '@/stores/ecommerceStore'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading, createOrder, fetchCart } = useEcommerceStore()
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  })
  
  const [billingAddress, setBillingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  })
  
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [customerNotes, setCustomerNotes] = useState('')

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress({
        full_name: shippingAddress.full_name,
        address_line1: shippingAddress.address_line1,
        address_line2: shippingAddress.address_line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country
      })
    }
  }, [useSameAddress, shippingAddress])

  const hasPhysicalProducts = cart?.items.some(item => {
    // Check if any items require shipping
    return true // TODO: Check product.requires_shipping
  })

  const validateShipping = () => {
    if (!hasPhysicalProducts) return true
    
    return (
      shippingAddress.full_name &&
      shippingAddress.address_line1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postal_code &&
      shippingAddress.phone
    )
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    
    try {
      const order = await createOrder({
        shipping_address: hasPhysicalProducts ? shippingAddress : undefined,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        customer_notes: customerNotes || undefined
      })
      
      setOrderNumber(order.order_number)
      setOrderComplete(true)
    } catch (error) {
      console.error('Failed to create order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-8 max-w-md text-center">
          <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-foreground/60 mb-6">
            Add some products to your cart before checking out.
          </p>
          <GlassButton onClick={() => router.push('/marketplace')}>
            Continue Shopping
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8 max-w-md text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Order Placed!</h2>
            <p className="text-foreground/60 mb-6">
              Your order has been successfully placed.
            </p>
            <div className="bg-foreground/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/60 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-purple-500">{orderNumber}</p>
            </div>
            <p className="text-sm text-foreground/60 mb-6">
              We've sent a confirmation email with your order details.
            </p>
            <div className="flex gap-3">
              <GlassButton onClick={() => router.push('/marketplace/orders')} className="flex-1">
                View Orders
              </GlassButton>
              <GlassButton onClick={() => router.push('/marketplace')} className="flex-1">
                Continue Shopping
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {['shipping', 'payment', 'review'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step === s
                      ? 'bg-purple-500 text-white'
                      : index < ['shipping', 'payment', 'review'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-foreground/10 text-foreground/40'
                  }`}
                >
                  {index < ['shipping', 'payment', 'review'].indexOf(step) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      index < ['shipping', 'payment', 'review'].indexOf(step)
                        ? 'bg-green-500'
                        : 'bg-foreground/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Address */}
            {step === 'shipping' && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Shipping Address</h2>
                </div>

                {!hasPhysicalProducts ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <p className="text-blue-500">
                      Your order contains only digital products. No shipping address required.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.full_name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={shippingAddress.address_line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                        <input
                          type="text"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                          placeholder="10001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <GlassButton
                    onClick={() => setStep('payment')}
                    disabled={hasPhysicalProducts && !validateShipping()}
                    className="bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                  >
                    Continue to Payment
                  </GlassButton>
                </div>
              </GlassCard>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-foreground/20 hover:border-purple-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Credit/Debit Card</div>
                      <div className="text-sm text-foreground/60">Pay securely with Stripe</div>
                    </div>
                    <Lock className="w-5 h-5 text-green-500" />
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-foreground/20 hover:border-purple-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-sm text-foreground/60">Pay with your PayPal account</div>
                    </div>
                    <Lock className="w-5 h-5 text-green-500" />
                  </label>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>Billing address same as shipping</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <GlassButton onClick={() => setStep('shipping')}>
                    Back
                  </GlassButton>
                  <GlassButton
                    onClick={() => setStep('review')}
                    className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                  >
                    Review Order
                  </GlassButton>
                </div>
              </GlassCard>
            )}

            {/* Review */}
            {step === 'review' && (
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Notes (Optional)</h3>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none resize-none"
                      rows={3}
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-500">
                      <p className="font-semibold mb-1">Payment Processing</p>
                      <p>
                        By placing this order, you agree to our terms and conditions. Your payment will be processed securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <GlassButton onClick={() => setStep('payment')}>
                    Back
                  </GlassButton>
                  <GlassButton
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </GlassButton>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <GlassCard className="p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-foreground/10 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">Product Name</p>
                      <p className="text-sm text-foreground/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold">
                      ${(item.price_at_add * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-foreground/10">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.shipping > 0 && (
                  <div className="flex justify-between text-foreground/70">
                    <span>Shipping</span>
                    <span>${cart.shipping.toFixed(2)}</span>
                  </div>
                )}
                {cart.tax > 0 && (
                  <div className="flex justify-between text-foreground/70">
                    <span>Tax</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-foreground/10">
                  <span>Total</span>
                  <span className="text-purple-500">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
