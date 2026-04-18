"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, MapPin, Clock, MessageSquare, Globe, ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import { useMarketplaceStore, CATEGORY_LABELS } from "@/stores/canonicalMarketplaceProviderStore";
import { useHydration } from "@/hooks/use-hydration";
import { Skeleton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import Link from "next/link";


export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { getProviderById, ensureConversation, loadProviderDetail } = useMarketplaceStore();
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);

  const provider = hydrated ? getProviderById(id) : undefined;

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    setIsLoadingProvider(true);
    void loadProviderDetail(id).finally(() => {
      if (active) setIsLoadingProvider(false);
    });
    return () => {
      active = false;
    };
  }, [hydrated, id, loadProviderDetail]);

  if (!hydrated || isLoadingProvider) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState 
          icon={ArrowLeft} 
          title="Mentor não encontrado" 
          description="Este especialista não está mais disponível no Olcan Mentors Hub." 
          action={
            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Voltar ao marketplace
            </button>
          }
        />
      </div>
    );
  }

  const archetype = provider.specialties?.[0]
    ? CATEGORY_LABELS[provider.specialties[0]]
    : "Especialista";

  const handleContact = () => {
    const conversation = ensureConversation(provider.id);
    if (!conversation) return;
    router.push(`/marketplace/messages/${conversation.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Hub
      </Link>

      {/* Hero Header */}
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Banner Gradient */}
        <div className="h-40 sm:h-56 bg-gradient-to-br from-slate-800 to-slate-950 relative border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <span className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/40 text-xs sm:text-sm uppercase font-bold text-white tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <Zap className="w-4 h-4" /> {archetype}
            </span>
          </div>
        </div>

        <div className="px-6 sm:px-12 pb-8 sm:pb-12 relative flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start -mt-20">
          {/* Avatar */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-slate-800 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center flex-shrink-0 z-10 relative">
            {provider.avatar ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading text-[5rem] text-slate-500">{provider.name.charAt(0)}</span>
            )}
            
            {provider.verified && (
              <div className="absolute bottom-2 right-2 bg-white text-slate-900 p-2 rounded-xl border-2 border-slate-900 shadow-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left pt-2 sm:pt-24 min-w-0">
            <h1 className="font-heading text-h2 text-white mb-2 leading-tight">{provider.name}</h1>
            <p className="text-lg text-white/90 font-medium mb-4">
              {provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ")}
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm text-slate-300 font-medium mb-6">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white">{provider.rating}</span> 
                <span className="text-slate-500">({provider.reviewCount})</span>
              </span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" />{provider.country}</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500" />{provider.languages.join(", ")}</span>
            </div>

            <button 
              onClick={handleContact} 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-heading font-bold text-body-sm hover:bg-white/10 transition-all hover:border-white/40 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Conversar com especialista
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="bg-slate-900 border border-white/5 rounded-3xl p-8">
            <h3 className="font-heading text-h3 text-white mb-4">Sobre o Coach</h3>
            <p className="text-body text-slate-400 leading-relaxed whitespace-pre-wrap">{provider.bio}</p>
          </section>

          {/* Services */}
          <section className="space-y-4">
            <h3 className="font-heading text-h3 text-white">Serviços Disponíveis</h3>
            <div className="grid gap-4">
              {provider.services.filter((s) => s.isActive).map((svc) => (
                <div key={svc.id} className="group p-6 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/40 transition-all flex flex-col sm:flex-row sm:items-center gap-6 shadow-xl hover:shadow-[0_10px_40px_-15px_rgba(255,255,255,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>

                  <div className="flex-1 relative z-10">
                    <h4 className="font-heading text-xl text-white font-bold mb-1">{svc.title}</h4>
                    <p className="text-body-sm text-slate-400 mb-4 sm:mb-0 line-clamp-2 md:line-clamp-none">{svc.description}</p>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 relative z-10 w-full sm:w-auto">
                    <div className="flex justify-between sm:flex-col sm:items-end w-full sm:w-auto">
                      <p className="font-heading font-black text-2xl text-white">R$ {svc.price.toLocaleString("pt-BR")}</p>
                      {svc.duration > 0 && <p className="text-caption text-slate-500 flex items-center gap-1 font-medium tracking-wide uppercase"><Clock className="w-3.5 h-3.5" />{svc.duration} min</p>}
                    </div>

                    <button 
                      onClick={() => router.push(`/marketplace/provider/${provider.id}/book?service=${svc.id}`)} 
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-900 font-heading font-bold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                      Reservar atendimento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          {provider.reviews.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-heading text-h3 text-white">O que dizem os clientes</h3>
              <div className="grid gap-4">
                {provider.reviews.map((r) => (
                  <div key={r.id} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 relative">
                    <div className="absolute top-6 right-6 text-slate-800">
                      <MessageSquare className="w-12 h-12 opacity-50" />
                    </div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white">{r.userName}</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex mb-3 relative z-10">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < r.rating ? "text-white fill-white" : "text-slate-700"}`} />
                      ))}
                    </div>
                    <p className="text-body-sm text-slate-300 relative z-10 italic">&ldquo;{r.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-8">
          <div className="pb-6 border-b border-white/5 text-center">
            <h4 className="font-heading text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Ponte de Evolução</h4>
            <p className="text-body-sm text-slate-500">
              O perfil <strong className="text-white">{archetype}</strong> deste especialista indica senioridade prática para orientar decisões de mobilidade e posicionamento internacional.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Atendimentos</span>
              <span className="text-white font-bold">{Math.floor(Math.random() * 50) + 10}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Resposta média</span>
              <span className="text-emerald-400 font-bold">98% (menos de 2h)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Entrada na plataforma</span>
              <span className="text-white font-bold">{new Date(provider.joinedAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
