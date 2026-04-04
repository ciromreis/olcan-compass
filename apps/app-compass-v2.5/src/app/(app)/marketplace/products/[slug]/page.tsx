/**
 * Product Detail Page
 * 
 * Displays comprehensive product information with purchase options.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Package,
  Truck,
  Download,
  Calendar,
  Award,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { useEcommerceStore } from '@/stores/ecommerceStore'
import Image from 'next/image'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const {
    currentProduct,
    isLoading,
    error,
    fetchProductBySlug,
    addToCart,
    clearError
  } = useEcommerceStore()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug)
    }
  }, [slug])

  useEffect(() => {
    if (currentProduct?.images && currentProduct.images.length > 0) {
      setSelectedImage(0)
    }
  }, [currentProduct])

  const handleAddToCart = async () => {
    if (!currentProduct) return
    
    setIsAddingToCart(true)
    try {
      await addToCart(currentProduct.id, quantity)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!currentProduct) return
    
    await handleAddToCart()
    router.push('/marketplace/checkout')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-foreground/60 mb-6">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <GlassButton onClick={() => router.push('/marketplace')}>
            Back to Marketplace
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  const discountPercentage = currentProduct.compare_at_price
    ? Math.round(((currentProduct.compare_at_price - currentProduct.price) / currentProduct.compare_at_price) * 100)
    : 0

  const images = currentProduct.images && currentProduct.images.length > 0
    ? currentProduct.images
    : ['/placeholder-product.png']

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-foreground/60">
          <button onClick={() => router.push('/marketplace')} className="hover:text-foreground">
            Marketplace
          </button>
          <span>/</span>
          <span className="text-foreground">{currentProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <GlassCard className="p-4 mb-4">
              <div className="relative aspect-square bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-lg overflow-hidden">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-foreground/20" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {currentProduct.is_olcan_official && (
                    <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-sm font-bold shadow-lg">
                      Olcan Official
                    </span>
                  )}
                  {currentProduct.is_bestseller && (
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-bold shadow-lg">
                      Bestseller
                    </span>
                  )}
                  {currentProduct.is_new && (
                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg">
                      New
                    </span>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold shadow-lg">
                      -{discountPercentage}%
                    </span>
                  </div>
                )}

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </GlassCard>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-purple-500 scale-105'
                        : 'border-foreground/20 hover:border-foreground/40'
                    }`}
                  >
                    <img src={image} alt={`${currentProduct.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <GlassCard className="p-6">
              {/* Title & Type */}
              <div className="mb-4">
                <span className="text-sm text-purple-500 font-medium capitalize mb-2 block">
                  {currentProduct.product_type}
                </span>
                <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{currentProduct.rating.toFixed(1)}</span>
                    <span className="text-foreground/60">({currentProduct.review_count} reviews)</span>
                  </div>
                  <div className="text-foreground/60">
                    {currentProduct.sales_count} sold
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-purple-500">
                    ${currentProduct.price.toFixed(2)}
                  </span>
                  {currentProduct.compare_at_price && (
                    <span className="text-xl text-foreground/40 line-through">
                      ${currentProduct.compare_at_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-green-600 font-medium">
                    Save ${(currentProduct.compare_at_price! - currentProduct.price).toFixed(2)} ({discountPercentage}% off)
                  </p>
                )}
              </div>

              {/* Stock Status */}
              {currentProduct.requires_shipping && (
                <div className="mb-6">
                  {currentProduct.stock_quantity > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">
                        In Stock ({currentProduct.stock_quantity} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              )}

              {/* Short Description */}
              {currentProduct.short_description && (
                <p className="text-foreground/80 mb-6 leading-relaxed">
                  {currentProduct.short_description}
                </p>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={currentProduct.stock_quantity || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center rounded-lg bg-foreground/10 border border-foreground/20 focus:border-purple-500 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(currentProduct.stock_quantity || 999, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <GlassButton
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || (currentProduct.requires_shipping && currentProduct.stock_quantity === 0)}
                  className="flex-1 bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </GlassButton>
                <GlassButton
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (currentProduct.requires_shipping && currentProduct.stock_quantity === 0)}
                  className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </GlassButton>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 py-2 px-4 rounded-lg border border-foreground/20 hover:bg-foreground/5 flex items-center justify-center gap-2 transition-colors">
                  <Heart className="w-5 h-5" />
                  Save
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg border border-foreground/20 hover:bg-foreground/5 flex items-center justify-center gap-2 transition-colors">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t border-foreground/10">
                {currentProduct.product_type === 'digital' && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Download className="w-5 h-5 text-purple-500" />
                    <span>Instant digital download</span>
                  </div>
                )}
                {currentProduct.requires_shipping && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Truck className="w-5 h-5 text-purple-500" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                )}
                {currentProduct.product_type === 'service' && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span>Flexible scheduling available</span>
                  </div>
                )}
                {currentProduct.is_olcan_official && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Official Olcan product - Quality guaranteed</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Description & Details */}
        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Product Description</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {currentProduct.description}
            </p>
          </div>

          {/* Tags */}
          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-foreground/10">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Reviews Section */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <GlassButton>Write a Review</GlassButton>
          </div>

          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{currentProduct.rating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(currentProduct.rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-foreground/60">
                {currentProduct.review_count} reviews
              </div>
            </div>
          </div>

          {currentProduct.review_count === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground/60 mb-2">
                No reviews yet
              </h3>
              <p className="text-foreground/40 mb-6">
                Be the first to review this product!
              </p>
              <GlassButton>Write the First Review</GlassButton>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-foreground/60 text-center">
                Reviews coming soon...
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
