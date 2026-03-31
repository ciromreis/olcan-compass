"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Bell, Brain, Compass, FileText, Fingerprint, Globe, Orbit, Shield, Sparkles, Star, Target } from "lucide-react"
import { useAuraStore } from "@/stores/auraStore"
import { useAnalyticsStore } from "@/stores/analyticsStore"
import { type ArchetypeType } from "@/stores/auraStore"
import { getAllArchetypes } from "@/lib/archetypes"

type StepId = "boas-vindas" | "perfil" | "preferencias"

interface ArchetypeOption {
  id: ArchetypeType
  nome: string
  descricao: string
  foco: string[]
}

const ETAPAS: StepId[] = ["boas-vindas", "perfil", "preferencias"]

const ARCHETYPES: ArchetypeOption[] = getAllArchetypes().map((a) => ({
  id: a.id,
  nome: a.name,
  descricao: a.context,
  foco: a.abilities,
}))

export default function OnboardingPage() {
  const router = useRouter()
  const { createAura, aura, isLoading } = useAuraStore()
  const { trackConversion, trackFeatureUsage } = useAnalyticsStore()

  const [etapaAtual, setEtapaAtual] = useState(0)
  const [arquetipoSelecionado, setArquetipoSelecionado] = useState<ArchetypeType | null>(null)
  const [nomeAura, setNomeAura] = useState("")
  const [preferencias, setPreferencias] = useState({
    notificacoes: true,
    lembretes: true,
    rotinaLeve: false,
  })
  const [erro, setErro] = useState<string | null>(null)

  const etapa = ETAPAS[etapaAtual]
  const progresso = ((etapaAtual + 1) / ETAPAS.length) * 100

  const resumo = useMemo(() => {
    return ARCHETYPES.find((item) => item.id === arquetipoSelecionado) ?? null
  }, [arquetipoSelecionado])

  const podeAvancarPerfil = Boolean(arquetipoSelecionado && nomeAura.trim().length >= 2)

  const avancar = async () => {
    setErro(null)

    if (etapa === "perfil") {
      if (!arquetipoSelecionado || nomeAura.trim().length < 2) {
        setErro("Escolha um arquétipo e defina um nome para sua Aura (mín. 2 caracteres).")
        return
      }
    }

    if (etapaAtual < ETAPAS.length - 1) {
      setEtapaAtual((valor) => valor + 1)
      return
    }

    if (!arquetipoSelecionado) {
      setErro("Selecione um arquétipo antes de concluir.")
      return
    }

    try {
      trackFeatureUsage("onboarding_concluido", {
        arquetipo: arquetipoSelecionado,
        preferencias,
      })
      await createAura(nomeAura.trim(), arquetipoSelecionado)
      trackConversion("onboarding_finalizado", {
        arquetipo: arquetipoSelecionado,
      })
      router.push("/aura")
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Não foi possível despertar sua Aura agora.")
    }
  }

  const voltar = () => {
    if (etapaAtual === 0) {
      router.push("/aura")
      return
    }

    setErro(null)
    setEtapaAtual((valor) => valor - 1)
  }

  return (
    <main className="min-h-screen bg-surface-bg px-4 py-10 md:px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl space-y-12">
        <section className="relative overflow-hidden rounded-[3rem] border border-bone-500/10 bg-white/50 p-10 shadow-glass backdrop-blur-3xl md:p-16">
          <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold-600">
                <Sparkles className="h-4 w-4" />
                Despertar de Identidade
              </div>
              <h1 className="font-display text-6xl text-ink-950 md:text-8xl tracking-tighter leading-tight">
                Sincronize sua Aura com seu propósito global.
              </h1>
              <p className="max-w-xl text-xl leading-relaxed text-ink-400 font-medium">
                O v2.5 não é um jogo. É uma <span className="text-gold-500 font-black">Plataforma de Execução Topográfica</span>. 
                Sua Aura organiza sua trajetória para transformar intenção em tração internacional.
              </p>
            </div>

            <div className="min-w-[260px] rounded-[2.5rem] border border-bone-500/10 bg-white/80 p-8 shadow-glass-sm mt-8 md:mt-0">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-ink-300">
                <span>Progresso de Sincronia</span>
                <span className="text-gold-500">{Math.round(progresso)}%</span>
              </div>
              <div className="mt-4 h-3 rounded-full bg-ink-950/5 p-0.5 border border-bone-500/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progresso}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <div className="mt-6 text-sm text-ink-500 font-bold uppercase tracking-widest text-[10px]">
                Fase: <span className="text-ink-950">{etapa.replace("-", " ")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[3rem] border border-bone-500/10 bg-white/30 p-8 shadow-glass-sm backdrop-blur-2xl md:p-12">
          {etapa === "boas-vindas" && (
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500">Início da Jornada</p>
                  <h2 className="font-display text-4xl text-ink-950 md:text-5xl tracking-tight">Onde reside sua intenção?</h2>
                  <p className="text-lg leading-relaxed text-ink-400 font-medium">
                    Antes de acessarmos o Forge ou a Rota, precisamos definir sua base de operações técnica e existencial.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      titulo: "Forge Ativo",
                      descricao: "Seu dossiê evolui em tempo real com cada evidência.",
                      icon: FileText,
                    },
                    {
                      titulo: "Topografia",
                      descricao: "Sua rota visual em 3D mapeia milestones acionáveis.",
                      icon: Target,
                    },
                    {
                      titulo: "Simulação",
                      descricao: "Treinos adaptados pela Aura para máxima maturidade.",
                      icon: Brain,
                    },
                    {
                      titulo: "Proteção",
                      descricao: "Sistemas de segurança e soberania de dados global.",
                      icon: Shield,
                    },
                  ].map((item) => (
                    <div key={item.titulo} className="p-8 rounded-[2rem] border border-bone-500/10 bg-white/60 hover:shadow-glass hover:bg-white transition-all duration-500 group">
                      <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-white transition-all">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 font-display text-2xl text-ink-950">{item.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-400 font-medium">{item.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-12 rounded-[3rem] border border-ink-900 bg-ink-950 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold-400/10 rounded-full blur-[100px]" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20">
                      <Orbit className="h-8 w-8 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500/70">Arquitetura de Produto</p>
                      <p className="font-display text-2xl tracking-tight">Realinhamento v2.5</p>
                    </div>
                  </div>
                  <div className="space-y-6 text-lg leading-relaxed text-white/50 font-medium">
                    <p>O Olcan Compass v2.5 foi desenhado para profissionais de alta performance.</p>
                    <p>Cada interação com sua <span className="text-gold-500">Aura</span> aumenta sua Sincronia, desbloqueando recursos avançados de análise de mercado e simulação técnica.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {etapa === "perfil" && (
            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500">Etapa 02</p>
                <h2 className="font-display text-5xl text-ink-950 tracking-tight">Qual sua postura estratégica?</h2>
                <p className="text-xl leading-relaxed text-ink-400 font-medium max-w-3xl">
                  Escolha o arquétipo que servirá de base para as animações, tom de voz e prioridades da sua <span className="text-gold-500 font-black px-1.5 py-0.5 bg-gold-500/5 rounded-lg">Aura</span>.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ARCHETYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArquetipoSelecionado(item.id)}
                    className={`p-8 rounded-[2.5rem] border text-left transition-all duration-500 relative overflow-hidden group ${
                      arquetipoSelecionado === item.id
                        ? "border-gold-500 bg-white shadow-glass scale-[1.02] z-10"
                        : "border-bone-500/10 bg-white/40 hover:bg-white hover:border-bone-500/30"
                    }`}
                  >
                    {arquetipoSelecionado === item.id && (
                      <div className="absolute top-4 right-4 text-gold-500">
                        <Star className="h-6 w-6 fill-current" />
                      </div>
                    )}
                    <h3 className="font-display text-2xl text-ink-950 leading-tight mb-4">{item.nome}</h3>
                    <p className="text-sm leading-relaxed text-ink-400 font-medium mb-6">{item.descricao}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.foco.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-bone-50 text-[10px] font-black uppercase tracking-widest text-ink-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-10 rounded-[3rem] border border-bone-500/10 bg-bone-50/30 backdrop-blur-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-ink-300 mb-4 ml-2">Como chamaremos sua manifestação Aura?</label>
                    <input
                      type="text"
                      value={nomeAura}
                      onChange={(event) => setNomeAura(event.target.value)}
                      placeholder="Ex.: Aurora, Atlas, Gaia..."
                      maxLength={20}
                      className="w-full h-16 rounded-2xl border border-bone-500/20 bg-white px-8 text-xl font-display text-ink-950 outline-none transition-all placeholder:text-ink-100 focus:border-gold-500 focus:shadow-glass-sm"
                    />
                  </div>
                  {resumo && (
                    <div className="p-6 rounded-3xl bg-ink-950 text-white min-w-[300px] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-ink-950">
                        <Fingerprint className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Ativando Arquétipo</div>
                        <div className="text-lg font-display text-gold-500">{resumo.nome}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {etapa === "preferencias" && (
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500">Etapa 03</p>
                  <h2 className="font-display text-5xl text-ink-950 tracking-tight">Cadência Operacional</h2>
                  <p className="text-xl leading-relaxed text-ink-400 font-medium">
                    Personalize como a <span className="text-gold-500 font-black">Aura</span> deve interagir com sua rotina de execução.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      chave: "notificacoes",
                      titulo: "Prioridade Crítica",
                      descricao: "Alertas para prazos, travas de dossiê e rituais estratégicos.",
                      icon: Bell,
                    },
                    {
                      chave: "lembretes",
                      titulo: "Nudges de Consistência",
                      descricao: "Pequenos estímulos para manter o ritmo de Sincronia ativa.",
                      icon: Target,
                    },
                    {
                      chave: "rotinaLeve",
                      titulo: "Filtro Metamoderno",
                      descricao: "Cadência minimalista focada apenas nos sinais de maior impacto.",
                      icon: Globe,
                    },
                  ].map((item) => {
                    const ativo = preferencias[item.chave as keyof typeof preferencias]
                    return (
                      <button
                        key={item.chave}
                        type="button"
                        onClick={() =>
                          setPreferencias((estado) => ({
                            ...estado,
                            [item.chave]: !estado[item.chave as keyof typeof estado],
                          }))
                        }
                        className={`flex w-full items-center gap-6 p-8 rounded-[2.5rem] border transition-all duration-500 ${
                          ativo
                            ? "border-gold-500 bg-white shadow-glass"
                            : "border-bone-500/10 bg-white/40 hover:bg-white"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${ativo ? "bg-gold-500 text-ink-950 shadow-glass-sm" : "bg-ink-950/5 text-ink-300"}`}>
                          <item.icon className="h-7 w-7" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-display text-2xl text-ink-950 leading-none mb-2">{item.titulo}</h3>
                          <p className="text-sm font-medium text-ink-400">{item.descricao}</p>
                        </div>
                        <div className={`w-14 h-8 rounded-full p-1 transition-all ${ativo ? "bg-gold-500" : "bg-ink-100"}`}>
                          <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${ativo ? "translate-x-6" : "translate-x-0"}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex-1 p-12 rounded-[3.5rem] bg-ink-950 border-ink-900 border-2 text-white relative overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-gold-400/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
                  </div>
                  
                  <div className="relative z-10 space-y-10 w-full">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 rounded-[2rem] bg-gold-500 flex items-center justify-center text-ink-950 shadow-[0_0_40px_rgba(212,175,55,0.4)] animate-pulse">
                        <Orbit className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-500/60 leading-none">Aura Identificada</div>
                        <h3 className="text-5xl font-display text-white tracking-widest uppercase truncate max-w-[300px]">
                          {aura?.name || nomeAura || "???"}
                        </h3>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Configuração de Postura</div>
                        <div className="text-xl font-display text-gold-500 uppercase tracking-tight">{resumo?.nome || "Aguardando Seleção"}</div>
                      </div>
                      <p className="text-sm leading-relaxed text-white/40 font-medium max-w-[280px] mx-auto italic">
                        "O compasso de quem busca soberania global reside na clareza do traçado, não na densidade do ruído."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {erro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {erro}
            </motion.div>
          )}
        </section>

        <div className="flex items-center justify-between gap-6 pt-4">
          <button
            type="button"
            onClick={voltar}
            className="h-16 px-8 rounded-2xl border border-bone-500/20 bg-white/50 font-black text-[10px] uppercase tracking-widest text-ink-300 transition-all hover:bg-white hover:text-ink-950 shadow-glass-sm flex items-center gap-3 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            {etapaAtual === 0 ? "Sair" : "Retornar"}
          </button>

          <button
            type="button"
            onClick={() => void avancar()}
            disabled={isLoading || (etapa === "perfil" && !podeAvancarPerfil)}
            className="h-16 px-10 rounded-2xl bg-ink-950 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gold-500 hover:text-ink-950 shadow-2xl flex items-center gap-3 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {etapaAtual === ETAPAS.length - 1 ? "Despertar Aura" : "Continuar Evolução"}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
  )
}
