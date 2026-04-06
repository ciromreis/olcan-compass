"use client";

import { 
  ArrowRight, 
  ExternalLink, 
  Star, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { Product } from "@/stores/ecommerceStore";
import { cn } from "@/lib/utils";
import { getStorefrontProductUrl } from "@/lib/storefront-links";

interface FlagshipProductCardProps {
  product: Product;
  className?: string;
}

export function FlagshipProductCard({ product, className }: FlagshipProductCardProps) {
  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl",
      className
    )}>
      {/* Premium Badge */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          <Trophy className="h-3 w-3" />
          Olcan Flagship
        </span>
        {discount > 0 && (
          <span className="w-fit rounded-full bg-clay-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            Oferta -{discount}%
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Visual/Icon Side */}
        <div className="relative flex h-48 w-full shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 md:h-auto md:w-56 overflow-hidden">
          <Sparkles className="absolute right-0 top-0 h-32 w-32 -translate-y-1/4 translate-x-1/4 text-white/10" />
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl">
            <Zap className="h-12 w-12 fill-white" />
          </div>
          
          {/* Animated Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Info Side */}
        <div className="flex flex-1 flex-col p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted mb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase text-brand-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verificado Olcan
            </span>
            <span className="h-1 w-1 rounded-full bg-silver-300" />
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
              <span className="font-bold text-text-primary">{product.rating.toFixed(1)}</span>
            </span>
          </div>

          <h3 className="font-heading text-h3 font-bold leading-tight text-text-primary group-hover:text-brand-500 transition-colors">
            {product.name}
          </h3>
          
          <p className="mt-3 text-body-sm text-text-secondary leading-relaxed line-clamp-2 lg:line-clamp-none">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {product.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} className="rounded-lg bg-silver-50 px-3 py-1.5 text-caption font-semibold text-text-muted border border-silver-100">
                #{tag}
              </span>
            ))}
          </div>

          {/* Pricing & CTA */}
          <div className="mt-auto pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-silver-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-h2 text-brand-600">
                  R$ {product.price.toLocaleString('pt-BR')}
                </span>
                {product.compare_at_price && (
                  <span className="text-body-sm text-text-muted line-through">
                    R$ {product.compare_at_price.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">
                Acesso Vitalício + Certificado
              </p>
            </div>
            
            <Link
              href={`/marketplace/checkout?product=${encodeURIComponent(product.slug)}`}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-brand-500 px-8 font-heading text-body-sm font-bold text-white shadow-lg transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-100"
            >
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 h-1.5 w-full bg-gradient-to-r from-brand-500 via-white to-brand-500 opacity-50" />
    </div>
  );
}
