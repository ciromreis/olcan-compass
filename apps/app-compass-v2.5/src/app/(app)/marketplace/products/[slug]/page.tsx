/**
 * Product Detail Page
 *
 * Keeps discovery inside the app while using the website storefront as the
 * canonical checkout surface.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Shield,
  Star,
} from 'lucide-react'
import { GlassButton, GlassCard } from '@/components/ui'
import { useEcommerceStore } from '@/stores/ecommerceStore'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/lib/api-client'
import { getStorefrontCatalogUrl } from '@/lib/storefront-links'

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getProductTypeLabel(type: string) {
  switch (type) {
    case 'digital':
      return 'Produto digital'
    case 'service':
      return 'Serviço'
    case 'physical':
      return 'Produto físico'
    case 'hybrid':
      return 'Formato híbrido'
    default:
      return type
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { isAuthenticated, user } = useAuthStore()

  const {
    currentProduct,
    isLoading,
    error,
    fetchProductBySlug,
    clearError,
  } = useEcommerceStore()

  const [selectedImage, setSelectedImage] = useState(0)
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      void fetchProductBySlug(slug)
    }
  }, [fetchProductBySlug, slug])

  useEffect(() => {
    if (currentProduct?.images && currentProduct.images.length > 0) {
      setSelectedImage(0)
    }
  }, [currentProduct])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-300/30 border-t-brand-500" />
      </div>
    )
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold">Produto não encontrado</h2>
          <p className="mb-6 text-foreground/60">
            {error || 'Não foi possível localizar este item no catálogo atual.'}
          </p>
          <GlassButton
            onClick={() => {
              clearError()
              router.push('/marketplace')
            }}
          >
            Voltar ao marketplace
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  const discountPercentage = currentProduct.compare_at_price
    ? Math.round(
        ((currentProduct.compare_at_price - currentProduct.price) /
          currentProduct.compare_at_price) *
          100
      )
    : 0

  const images =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : ['/placeholder-product.png']
  const checkoutLabel =
    currentProduct.checkout_mode === 'external'
      ? 'Continuar compra oficial'
      : 'Ver próxima etapa'

  const handleCheckout = async () => {
    setCheckoutError(null)

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/marketplace/products/${slug}`)}`)
      return
    }

    // Use the streamlined internal checkout bridge
    router.push(`/marketplace/checkout?product=${encodeURIComponent(currentProduct.slug)}`)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-foreground/60">
          <button
            onClick={() => router.push('/marketplace')}
            className="inline-flex items-center gap-2 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span>/</span>
          <span className="text-foreground">{currentProduct.name}</span>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <GlassCard className="mb-4 p-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-foreground/5 to-foreground/10">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={currentProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-24 w-24 text-foreground/20" />
                  </div>
                )}

                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {currentProduct.is_olcan_official && (
                    <span className="rounded-full bg-brand-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      Oficial Olcan
                    </span>
                  )}
                  {currentProduct.is_bestseller && (
                    <span className="rounded-full bg-silver-700 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      Destaque
                    </span>
                  )}
                  {currentProduct.is_new && (
                    <span className="rounded-full bg-brand-300 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      Novo
                    </span>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      -{discountPercentage}%
                    </span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev > 0 ? prev - 1 : images.length - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev < images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </GlassCard>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? 'scale-105 border-brand-500'
                        : 'border-foreground/20 hover:border-foreground/40'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <GlassCard className="p-6">
              <div className="mb-4">
                <span className="mb-2 block text-sm font-medium capitalize text-brand-500">
                  {getProductTypeLabel(currentProduct.product_type)}
                </span>
                <h1 className="mb-2 text-3xl font-bold">{currentProduct.name}</h1>

                <div className="mb-4 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="font-semibold">{currentProduct.rating.toFixed(1)}</span>
                    <span className="text-foreground/60">
                      ({currentProduct.review_count} avaliações)
                    </span>
                  </div>
                  <div className="text-foreground/60">
                    {currentProduct.sales_count} vendas
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-brand-500">
                    {formatBRL(currentProduct.price)}
                  </span>
                  {currentProduct.compare_at_price && (
                    <span className="text-xl text-foreground/40 line-through">
                      {formatBRL(currentProduct.compare_at_price)}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="font-medium text-emerald-600">
                    Economia de{' '}
                    {formatBRL(currentProduct.compare_at_price! - currentProduct.price)} (
                    {discountPercentage}%)
                  </p>
                )}
              </div>

              {currentProduct.short_description && (
                <p className="mb-6 leading-relaxed text-foreground/80">
                  {currentProduct.short_description}
                </p>
              )}

              <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
                <p className="text-sm leading-relaxed text-foreground/70">
                  {isAuthenticated ? (
                    <>
                      Sua conta Olcan está ativa{user?.full_name ? `, ${user.full_name}` : ''}. A compra continua no fluxo oficial da oferta, mas parte do mesmo contexto autenticado usado no Compass.
                    </>
                  ) : (
                    <>
                      Entre com sua conta Olcan para continuar a compra com o mesmo contexto usado no Compass. Enquanto o checkout interno não entra, a finalização segue no fluxo oficial da oferta.
                    </>
                  )}
                </p>
              </div>

              {checkoutError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </div>
              )}

              <div className="mb-6 space-y-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isStartingCheckout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isStartingCheckout ? 'Preparando compra...' : checkoutLabel}
                  {!isStartingCheckout && <ArrowRight className="h-4 w-4" />}
                </button>
                <a
                  href={currentProduct.catalog_url || getStorefrontCatalogUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-silver-200 bg-white px-5 py-4 text-base font-semibold text-foreground transition-colors hover:bg-silver-50"
                >
                  Abrir página pública
                </a>
              </div>

              <div className="space-y-3 border-t border-foreground/10 pt-6">
                {currentProduct.product_type === 'digital' && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Download className="h-5 w-5 text-brand-500" />
                    <span>Acesso digital liberado conforme as regras do produto</span>
                  </div>
                )}
                {currentProduct.product_type === 'service' && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Calendar className="h-5 w-5 text-brand-500" />
                    <span>Agendamento e instruções exibidos na vitrine oficial</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-foreground/80">
                  <Shield className="h-5 w-5 text-brand-500" />
                  <span>Pagamento processado em ambiente seguro com identidade Olcan</span>
                </div>
                {currentProduct.is_olcan_official && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Shield className="h-5 w-5 text-brand-500" />
                    <span>Produto oficial do ecossistema Olcan</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-foreground/80">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span>Catálogo unificado entre app v2.5, site e backend do marketplace</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="mb-8 p-8">
          <h2 className="mb-4 text-2xl font-bold">Descrição do produto</h2>
          <div className="max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">
              {currentProduct.description}
            </p>
          </div>

          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <div className="mt-6 border-t border-foreground/10 pt-6">
              <h3 className="mb-3 text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-medium text-brand-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
