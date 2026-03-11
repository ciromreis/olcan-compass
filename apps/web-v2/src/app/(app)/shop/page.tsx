"use client";

import { Smartphone, Wifi, CreditCard, Globe, Shield, ArrowRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui";

interface Product { id: string; icon: LucideIcon; name: string; description: string; price: string; tag: string | null }

const PRODUCTS: Product[] = [
  { id: "esim", icon: Smartphone, name: "eSIM Internacional", description: "Chip virtual com dados para 50+ países. Ative antes de embarcar.", price: "A partir de R$ 49", tag: "Popular" },
  { id: "vpn", icon: Wifi, name: "VPN Premium (12 meses)", description: "Acesse serviços brasileiros de qualquer lugar. Netflix, banco, etc.", price: "R$ 149/ano", tag: null },
  { id: "insurance", icon: Shield, name: "Seguro Viagem Internacional", description: "Cobertura médica, bagagem e cancelamento. Parceiros verificados.", price: "A partir de R$ 89/mês", tag: "Essencial" },
  { id: "transfer", icon: CreditCard, name: "Conta Multi-moeda", description: "Wise, Revolut ou N26 — compare taxas e abra sua conta.", price: "Grátis", tag: null },
  { id: "translation", icon: Globe, name: "Pacote de Tradução Juramentada", description: "5 documentos com desconto. Tradutores verificados do Marketplace.", price: "R$ 350 (5 docs)", tag: "Desconto" },
];

export default function ShopPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Loja" subtitle="Produtos e serviços essenciais para sua mudança internacional" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-moss-50 flex items-center justify-center">
                <product.icon className="w-5 h-5 text-moss-500" />
              </div>
              {product.tag && <span className="text-caption px-2 py-0.5 rounded-full bg-clay-50 text-clay-500 font-medium">{product.tag}</span>}
            </div>
            <h3 className="font-heading text-h4 text-text-primary mb-1">{product.name}</h3>
            <p className="text-body-sm text-text-secondary mb-3">{product.description}</p>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-cream-300">
              <span className="text-body-sm font-bold text-moss-500">{product.price}</span>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-moss-500 text-white text-caption font-medium hover:bg-moss-600 transition-colors">Ver <ArrowRight className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
