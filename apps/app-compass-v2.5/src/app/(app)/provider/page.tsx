"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, DollarSign, Star, MessageSquare, Calendar, Settings, ArrowRight, TrendingUp, CheckCircle, Clock, PlusCircle
} from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks";
import { Skeleton, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui";

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
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 font-body">
      {/* Header Profissional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-medium text-white">Portal do Profissional</h1>
            <span className="px-2 py-0.5 bg-white/5 text-slate-400 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest backdrop-blur-md">
              Vendor Node
            </span>
          </div>
          <p className="text-slate-400 mt-1 font-mono text-sm">
            {provider ? `${provider.name} · ${provider.languages.join(", ")}` : "Gerencie seus serviços e fluxos operacionais."}
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Link href="/provider/services/new" className="px-4 py-2 bg-white text-slate-950 font-medium rounded-lg text-sm flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-glass">
            <PlusCircle className="w-4 h-4" /> Novo Serviço
          </Link>
          <Link href="/provider/settings" className="p-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg hover:text-white hover:bg-white/10 transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats - Liquid Glass */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Receita Total</CardTitle>
            <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </CardHeader>
          <div className="mt-2 px-1">
            <p className="text-3xl font-display font-light text-white">R$ {(stats?.revenue ?? 0).toLocaleString("pt-BR")}</p>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stats?.totalBookings ?? 0} Contratações
            </p>
          </div>
        </Card>

        <Card variant="glass" className="group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Agendamentos</CardTitle>
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </CardHeader>
          <div className="mt-2 px-1">
            <p className="text-3xl font-display font-light text-white">{stats?.totalBookings ?? 0}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-3">
               {stats?.pendingBookings ?? 0} Pendentes
            </p>
          </div>
        </Card>

        <Card variant="glass" className="group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Avaliação Média</CardTitle>
            <Star className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </CardHeader>
          <div className="mt-2 px-1">
            <p className="text-3xl font-display font-light text-white">{stats?.rating?.toFixed(1) ?? "—"}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-3">
               {stats?.reviewCount ?? 0} Reviews
            </p>
          </div>
        </Card>

        <Card variant="glass" className="group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Comunicação</CardTitle>
            <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </CardHeader>
          <div className="mt-2 px-1">
            <p className="text-3xl font-display font-light text-white">{stats?.unread ?? 0}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-3">
               Mensagens não lidas
            </p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {myServices.length > 0 && (
            <Card variant="glass">
              <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal mb-6">
                Meus Serviços
              </CardTitle>
              <div className="space-y-3">
                {myServices.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">{s.duration} min · {s.isActive ? "Ativo" : "Inativo"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">R$ {s.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stats && stats.recentBookings.length > 0 && (
            <Card variant="glass">
              <CardTitle className="text-white flex items-center gap-2 font-display text-xl font-normal mb-6">
                Contratações Recentes
              </CardTitle>
              <div className="space-y-3">
                {stats.recentBookings.map((b) => (
                  <Link key={b.id} href={`/marketplace/bookings/${b.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                       {b.status === "completed" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">{b.serviceTitle}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">{b.date} · {b.status}</p>
                    </div>
                    <span className="text-sm font-bold text-white">R$ {b.price}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="space-y-4">
          <Link href="/provider/bookings" className="block">
            <Card variant="glass" className="hover:border-white/30 transition-all group">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">Agendamentos</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Gerencie consultas</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          <Link href="/provider/services" className="block">
             <Card variant="glass" className="hover:border-white/30 transition-all group">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">Catálogo</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Edite serviços</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          <Link href="/provider/earnings" className="block">
             <Card variant="glass" className="hover:border-white/30 transition-all group">
              <div className="flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">Financeiro</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Saques e ROI</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
