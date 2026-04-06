'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, Lock, ShieldCheck, ShoppingBag, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()
  
  const [mounted, setMounted] = useState(false)
  const [productSlug, setProductSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const slug = searchParams.get('product')
    setProductSlug(slug)
    
    if (slug) {
      void prepareCheckout(slug)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  const prepareCheckout = async (slug: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // Create a secure checkout intent linked to the current unified session
      const intent = await apiClient.createCheckoutIntent(slug, 'compass-checkout-bridge')
      setCheckoutUrl(intent.checkout_url)
    } catch (err) {
      console.error('Failed to prepare checkout:', err)
      setError('Não foi possível sincronizar sua sessão de compra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-silver-50 to-white">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="group mb-2 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-brand-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao Marketplace
          </button>
          <h1 className="font-heading text-h2 text-text-primary">Finalizar sua Escolha</h1>
          <p className="text-body text-text-secondary">
            Sua identidade Olcan está sendo sincronizada com o gateway de pagamento seguro.
          </p>
        </div>

        <GlassCard className="overflow-hidden border-brand-100 p-0 shadow-2xl">
          <div className="bg-brand-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-caption font-bold uppercase tracking-widest text-brand-100">Checkout Unificado</p>
                  <h2 className="text-xl font-bold">{productSlug ? productSlug.replace(/-/g, ' ') : 'Catálogo Olcan'}</h2>
                </div>
              </div>
              <ShieldCheck className="h-8 w-8 text-brand-200 opacity-50" />
            </div>
          </div>

          <div className="p-8 space-y-8">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Loader2 className="h-12 w-12 animate-spin text-brand-500 mb-4" />
                  <p className="text-body font-medium text-text-primary">Preparando ambiente de pagamento seguro...</p>
                  <p className="text-caption text-text-muted mt-1">Isso levará apenas um segundo.</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center"
                >
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-900 mb-2">Ops! Algo deu errado</h3>
                  <p className="text-body-sm text-red-700 mb-6">{error}</p>
                  <GlassButton onClick={() => productSlug && prepareCheckout(productSlug)}>
                    Tentar Novamente
                  </GlassButton>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Auth Summary */}
                  <div className="rounded-3xl border border-silver-100 bg-silver-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-primary">Sessão Sincronizada</h3>
                        <p className="text-body-sm text-text-secondary mt-1">
                          Você está logado como <span className="font-bold text-brand-500">{user?.full_name || user?.email}</span>. 
                          Seus dados de acesso e histórico serão vinculados a esta compra automaticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-silver-100 text-caption font-medium text-text-muted">
                      <Lock className="h-4 w-4 text-brand-500" />
                      Criptografia de 256 bits
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-silver-100 text-caption font-medium text-text-muted">
                      <ShieldCheck className="h-4 w-4 text-brand-500" />
                      Pagamento Verificado Olcan
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <a
                      href={checkoutUrl || '#'}
                      className="flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-500 px-8 py-5 font-heading text-lg font-bold text-white shadow-xl transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-100"
                    >
                      Ir para Pagamento Seguro
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Footer info */}
        <div className="flex flex-col items-center justify-center gap-4 text-center opacity-60">
          <p className="text-caption flex items-center gap-2">
            <Lock className="h-3 w-3" />
            Processamento de pagamento via parceiros certificados (Hotmart/Stripe)
          </p>
          <div className="h-px w-24 bg-silver-200" />
          <p className="text-[10px] uppercase tracking-widest font-bold">
            Ecossistema Unificado Olcan &copy; 2026
          </p>
        </div>
      </div>
    </div>
  )
}
