import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { getMercurProduct, getProductPrice } from "@/lib/mercur-client";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import EnhancedFooter from "@/components/layout/EnhancedFooter";

const COMPASS_APP_URL =
  process.env.NEXT_PUBLIC_COMPASS_APP_URL || "http://localhost:3000";

function resolvePrimaryAction(product: Awaited<ReturnType<typeof getMercurProduct>>) {
  if (!product) {
    return { href: "/marketplace", label: "Voltar ao catálogo", external: false };
  }

  if (product.checkout_mode === "external" && product.checkout_url) {
    return {
      href: product.checkout_url,
      label: product.cta_label || "Continuar para a compra",
      external: true,
    };
  }

  if (product.checkout_mode === "internal") {
    return {
      href: `${COMPASS_APP_URL}/login`,
      label: product.cta_label || "Entrar no Compass",
      external: true,
    };
  }

  return {
    href: "/contato",
    label: product.cta_label || "Falar com a Olcan",
    external: false,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getMercurProduct(handle);

  if (!product) {
    return {
      title: "Produto | Olcan",
      description: "Produto oficial do ecossistema Olcan.",
    };
  }

  return {
    title: `${product.title} | Loja Olcan`,
    description: product.short_description || product.description || undefined,
    openGraph: {
      title: `${product.title} | Olcan`,
      description: product.short_description || product.description || undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getMercurProduct(handle);

  if (!product) {
    notFound();
  }

  const primaryAction = resolvePrimaryAction(product);
  const highlights =
    product.features && product.features.length > 0
      ? product.features
      : ["Oferta oficial do ecossistema Olcan"];

  return (
    <main className="min-h-screen bg-cream selection:bg-brand-500/30 font-body text-ink">
      <EnhancedNavbar />

      <div className="pt-32 pb-20">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-ink/50 hover:text-brand-600 transition-colors text-sm font-bold uppercase tracking-widest mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à loja
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr,1.05fr] gap-14 items-start">
            <div className="bg-white rounded-[2rem] border border-cream-200 overflow-hidden shadow-2xl shadow-ink/5 sticky top-28">
              <div className="aspect-square relative bg-gradient-to-br from-cream-50 via-white to-brand-50/40 flex items-center justify-center p-12">
                {product.thumbnail || product.images[0] ? (
                  <Image
                    src={product.thumbnail || product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-[2rem] border border-white/50 bg-white/50 w-40 h-40">
                    {product.product_type === "hybrid" ? (
                      <Compass className="w-16 h-16 text-brand-600" />
                    ) : (
                      <Sparkles className="w-16 h-16 text-brand-600" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider border border-brand-100">
                  {product.category}
                </span>
                {product.format && (
                  <span className="px-3 py-1.5 bg-white text-ink/60 text-xs font-bold rounded-full uppercase tracking-wider border border-cream-200">
                    {product.format}
                  </span>
                )}
                {product.phase && (
                  <span className="px-3 py-1.5 bg-white text-ink/60 text-xs font-bold rounded-full uppercase tracking-wider border border-cream-200">
                    {product.phase}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight mb-4">
                {product.title}
              </h1>

              {product.legacy_title && (
                <p className="text-sm uppercase tracking-widest text-ink/40 font-semibold mb-4">
                  Nome de referência anterior: {product.legacy_title}
                </p>
              )}

              <p className="text-xl text-ink/70 leading-relaxed font-light mb-8">
                {product.description || product.short_description}
              </p>

              <div className="text-4xl font-display text-brand-600 mb-8 border-b border-cream-200 pb-8">
                {getProductPrice(product)}
              </div>

              <div className="mb-10 space-y-4">
                {primaryAction.external ? (
                  <a
                    href={primaryAction.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full btn-primary py-4 px-8 text-lg flex items-center justify-center gap-3"
                  >
                    {primaryAction.label}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                ) : (
                  <Link
                    href={primaryAction.href}
                    className="w-full btn-primary py-4 px-8 text-lg flex items-center justify-center gap-3"
                  >
                    {primaryAction.label}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}

                <p className="text-center text-xs text-ink/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  Fluxo comercial oficial da Olcan
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-ink uppercase tracking-widest text-sm mb-5 border-l-2 border-brand-500 pl-4">
                    O que está incluso
                  </h3>
                  <ul className="space-y-4">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-ink/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-ink uppercase tracking-widest text-sm mb-5 border-l-2 border-brand-500 pl-4">
                    Informações de uso
                  </h3>
                  <ul className="space-y-4">
                    {(product.specifications || []).map((item) => (
                      <li key={item} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                          <Shield className="w-3 h-3 text-brand-600" />
                        </div>
                        <span className="text-ink/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {(product.modules || []).length > 0 && (
                <div className="mt-10">
                  <h3 className="font-bold text-ink uppercase tracking-widest text-sm mb-5 border-l-2 border-brand-500 pl-4">
                    Estrutura principal
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.modules?.map((module) => (
                      <span
                        key={module}
                        className="px-4 py-2 rounded-full bg-white border border-cream-200 text-sm text-ink/70"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(product.audience || []).length > 0 && (
                <div className="mt-10 rounded-[1.75rem] border border-brand-100 bg-brand-50/50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-4">
                    Para quem faz sentido
                  </p>
                  <ul className="space-y-3">
                    {product.audience?.map((item) => (
                      <li key={item} className="text-sm text-ink/70 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </main>
  );
}
