"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart3, DollarSign, Star, MessageSquare, Calendar, Settings, ArrowRight, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton } from "@/components/ui";

export default function ProviderDashboardPage() {
  const hydrated = useHydration();
  const { 
    myProviderProfile: provider, 
    myServices, 
    bookings, 
    conversations,
  } = useMarketplaceStore();

  const stats = useMemo(() => {
    if (!hydrated || !provider) return null;
    const myBookings = bookings.filter((b) => b.providerId === provider.id);
    const completed = myBookings.filter((b) => b.status === "completed");
    const pending = myBookings.filter((b) => b.status === "pending" || b.status === "confirmed");
    const totalRevenue = completed.reduce((s, b) => s + b.price, 0);
    const myConvos = conversations.filter((c) => c.providerId === provider.id);
    const unread = myConvos.reduce((s, c) => s + c.unread, 0);
    const uniqueClients = new Set(myBookings.map((b) => b.serviceId)).size;

    return {
      revenue: totalRevenue,
      totalBookings: myBookings.length,
      pendingBookings: pending.length,
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      clients: uniqueClients,
      unread,
      recentBookings: [...myBookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    };
  }, [hydrated, provider, bookings, conversations]);

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Portal do Profissional"
        subtitle={provider ? `${provider.name} · ${provider.languages.join(", ")}` : "Gerencie seus serviços, agendamentos e finanças"}
        actions={
          <Link href="/provider/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            <Settings className="w-4 h-4" /> Configurações
          </Link>
        }
      />

      {/* Profile summary removed switch for single profile context */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <DollarSign className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Receita Total</p>
          <p className="font-heading text-h2 text-text-primary">R$ {(stats?.revenue ?? 0).toLocaleString("pt-BR")}</p>
          <p className="text-caption text-brand-500 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" />{stats?.totalBookings ?? 0} contratações</p>
        </div>
        <div className="card-surface p-5">
          <Calendar className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Agendamentos</p>
          <p className="font-heading text-h2 text-text-primary">{stats?.totalBookings ?? 0}</p>
          <p className="text-caption text-text-muted mt-1">{stats?.pendingBookings ?? 0} pendentes</p>
        </div>
        <div className="card-surface p-5">
          <Star className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Rating</p>
          <p className="font-heading text-h2 text-text-primary">{stats?.rating?.toFixed(1) ?? "—"}</p>
          <p className="text-caption text-text-muted mt-1">{stats?.reviewCount ?? 0} avaliações</p>
        </div>
        <div className="card-surface p-5">
          <MessageSquare className="w-5 h-5 text-sage-500 mb-2" />
          <p className="text-caption text-text-muted">Mensagens</p>
          <p className="font-heading text-h2 text-text-primary">{stats?.unread ?? 0}</p>
          <p className="text-caption text-text-muted mt-1">não lidas</p>
        </div>
      </div>

      {/* Services */}
      {myServices.length > 0 && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Meus Serviços</h3>
          <div className="space-y-3">
            {myServices.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-cream-50">
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary truncate">{s.title}</p>
                  <p className="text-caption text-text-muted">{s.duration} min · {s.isActive ? "Ativo" : "Inativo"}</p>
                </div>
                <span className="text-body-sm font-bold text-brand-500">R$ {s.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {stats && stats.recentBookings.length > 0 && (
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Contratações Recentes</h3>
          <div className="space-y-3">
            {stats.recentBookings.map((b) => (
              <Link key={b.id} href={`/marketplace/bookings/${b.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 hover:bg-cream-100 transition-colors">
                {b.status === "completed" ? <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" /> : <Clock className="w-4 h-4 text-clay-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary truncate">{b.serviceTitle}</p>
                  <p className="text-caption text-text-muted">{b.date} · {b.status}</p>
                </div>
                <span className="text-body-sm font-bold text-text-primary">R$ {b.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/provider/bookings" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <Calendar className="w-6 h-6 text-brand-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Agendamentos</h3><p className="text-body-sm text-text-secondary">Gerencie suas consultas e entregas</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
        <Link href="/provider/services" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <BarChart3 className="w-6 h-6 text-clay-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Meus Serviços</h3><p className="text-body-sm text-text-secondary">Edite preços, descrições e disponibilidade</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
        <Link href="/provider/earnings" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <DollarSign className="w-6 h-6 text-brand-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Financeiro</h3><p className="text-body-sm text-text-secondary">Receitas, saques e relatórios</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
        <Link href="/marketplace/messages" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <MessageSquare className="w-6 h-6 text-sage-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Mensagens</h3><p className="text-body-sm text-text-secondary">Converse com seus clientes</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
      </div>
    </div>
  );
}
