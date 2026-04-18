"use client";

import { useAura } from "@/stores/auraStore";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/services/commerce";

// Simulated Archetype to specific Product Tags or Categories
const ARCHETYPE_SYNERGY: Record<string, { title: string, description: string, recommendedTags: string[] }> = {
  institutional_escapee: {
    title: "Estratégia de Independência",
    description: "Sua Raposa Estratégica busca maximar as vias de escape institucional de forma calculada.",
    recommendedTags: ["planejamento", "imigracao", "vistos"],
  },
  scholarship_cartographer: {
    title: "Excelência Acadêmica",
    description: "Seu Dragão Acadêmico mapeia as melhores rotas educacionais no exterior.",
    recommendedTags: ["bolsas", "academico", "mentoria"],
  },
  career_pivot: {
    title: "Transição Mestra",
    description: "O Leão Transformador ganha bônus de aprendizado em produtos de adaptação.",
    recommendedTags: ["carreira", "pivot", "transicao"],
  },
  global_nomad: {
    title: "Vida Sem Fronteiras",
    description: "A Fênix Global ganha mais vitalidade explorando opções de mobilidade.",
    recommendedTags: ["nomade", "lifestyle", "remoto"],
  },
  technical_bridge_builder: {
    title: "Ponte Tecnológica",
    description: "Seu Lobo Técnico precisa de recursos avançados para estruturação lógica.",
    recommendedTags: ["tech", "developer", "engenharia"],
  },
  insecure_corporate_dev: {
    title: "Construção de Autoconfiança",
    description: "A Coruja Sábia necessita de certificações para se sentir segura no salto.",
    recommendedTags: ["confianca", "psicologia", "preparacao"],
  },
  exhausted_solo_mother: {
    title: "Jornada Segura",
    description: "A Ursa Protetora tem prioridade de acesso em produtos para famílias.",
    recommendedTags: ["familia", "educacao_infantil", "seguranca"],
  },
  trapped_public_servant: {
    title: "Passaporte para Fora da Caixa",
    description: "A Águia Visionária foca no destravamento mental.",
    recommendedTags: ["empreendedorismo", "setor_privado"],
  },
  academic_hermit: {
    title: "Pesquisa Pura",
    description: "O Cervo Intelectual ganha eficiência ao lidar com papers e vistos de talento.",
    recommendedTags: ["eb2niw", "pesquisa", "ciencia"],
  },
  executive_refugee: {
    title: "Soft Landing Executivo",
    description: "Seu Tigre Consciente busca a manutenção de status com qualidade de vida.",
    recommendedTags: ["executivo", "patrimonio", "investimento"],
  },
  creative_visionary: {
    title: "Voo Criativo",
    description: "A Borboleta Criativa se alinha a oportunidades de O1 e portfólios.",
    recommendedTags: ["criativo", "arte", "portfolio"],
  },
  lifestyle_optimizer: {
    title: "Máxima Otimização",
    description: "Seu Golfinho explora a curva de eficiência de qualidade de vida.",
    recommendedTags: ["saude", "imposto", "otimizacao"],
  },
};

export function AuraSynergyBlock() {
  const aura = useAura();

  if (!aura) return null;

  const synergy = ARCHETYPE_SYNERGY[aura.archetype] || {
    title: "Recomendação Personalizada",
    description: "Ofertas baseadas em sua evolução contínua.",
    recommendedTags: ["geral"],
  };

  return (
    <div className="mt-6 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
            <Sparkles className="h-3 w-3" /> Sinergia de Aura Ativa
          </div>
          <h2 className="font-heading text-h3 text-brand-600">
            {synergy.title}
          </h2>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {synergy.description}
          </p>
        </div>
        
        <div className="shrink-0 flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-caption text-text-muted bg-white px-3 py-1.5 rounded-xl border border-silver-200">
            <ShieldCheck className="h-4 w-4 text-brand-400" />
            Compras impulsionam Experiência
          </div>
          {/* Simulated call to action that would pre-fill filters */}
          <button className="flex h-12 w-full animate-pulse-slow items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 font-bold text-white shadow-lg transition-all hover:bg-brand-600 md:w-auto">
            Ver recomendações exclusivas <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
