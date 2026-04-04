/**
 * Product Card Component
 * 
 * Displays product in marketplace grid with pricing, ratings, and quick actions.
 */

'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Star, Eye, TrendingUp, Award, Package, Zap } from 'lucide-react'
import { GlassCard } from '@/components/ui'
import Link from 'next/link'

type ProductType = 'digital' | 'physical' | 'service' | 'hybrid'

interface Product {
  id: string
  name: string
  short_description?: string
  product_type: ProductType
  price: number
  compare_at_price?: number
  currency: string
  slug: string
  images?: string[]
  rating: number
  review_count: number
  sales_count: number
  is_featured: boolean
  is_olcan_official: boolean
  is_bestseller: boolean
  is_new: boolean
  requires_shipping: boolean
  stock_quantity: number
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  showQuickAdd?: boolean
}

const PRODUCT_TYPE_ICONS = {
  digital: Zap,
  physical: Package,
  service: Award,
  hybrid: TrendingUp
}

const PRODUCT_TYPE_COLORS = {
  digital: 'text-purple-500',
  physical: 'text-blue-500',
  service: 'text-green-500',
  hybrid: 'text-orange-500'
}

export function ProductCard({ product, onAddToCart, showQuickAdd = true }: ProductCardProps) {
  const Icon = PRODUCT_TYPE_ICONS[product.product_type]
  const iconColor = PRODUCT_TYPE_COLORS[product.product_type]
  
  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product.id)
    }
  }

  return (
    <Link href={`/marketplace/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <GlassCard className="h-full flex flex-col overflow-hidden group cursor-pointer">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-foreground/5 to-foreground/10 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className={`w-16 h-16 ${iconColor} opacity-20`} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_olcan_official && (
                <span className="px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-bold shadow-lg">
                  Olcan Official
                </span>
              )}
              {product.is_bestseller && (
                <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg">
                  Bestseller
                </span>
              )}
              {product.is_new && (
                <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg">
                  New
                </span>
              )}
              {product.is_featured && (
                <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-lg">
                  Featured
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
                  -{discountPercentage}%
                </span>
              </div>
            )}

            {/* Quick Add Button */}
            {showQuickAdd && onAddToCart && (
              <motion.button
                onClick={handleQuickAdd}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-purple-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Product Type */}
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <span className="text-xs text-foreground/60 capitalize">
                {product.product_type}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-500 transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            {product.short_description && (
              <p className="text-sm text-foreground/70 mb-3 line-clamp-2 flex-1">
                {product.short_description}
              </p>
            )}

            {/* Rating & Sales */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-foreground/40">({product.review_count})</span>
              </div>
              <div className="flex items-center gap-1 text-foreground/60">
                <Eye className="w-4 h-4" />
                <span>{product.sales_count} sold</span>
              </div>
            </div>

            {/* Stock Status */}
            {product.requires_shipping && (
              <div className="mb-3">
                {product.stock_quantity > 0 ? (
                  <span className="text-xs text-green-600 font-medium">
                    {product.stock_quantity} in stock
                  </span>
                ) : (
                  <span className="text-xs text-red-600 font-medium">
                    Out of stock
                  </span>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-500">
                {product.currency === 'USD' ? '$' : product.currency}
                {product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-foreground/40 line-through">
                  {product.currency === 'USD' ? '$' : product.currency}
                  {product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  )
}

export default ProductCard
