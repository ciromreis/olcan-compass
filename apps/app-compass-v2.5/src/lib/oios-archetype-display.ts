/**
 * Shared copy for OIOS archetype quiz outcomes (onboarding quiz + profile psych).
 */

export const OIOS_ARCHETYPE_LABELS: Record<string, string> = {
  institutional_escapee: "O Fugitivo Institucional",
  scholarship_cartographer: "O Cartógrafo de Bolsas",
  career_pivot: "A Virada de Carreira",
  global_nomad: "O Nômade Global",
  technical_bridge_builder: "O Construtor de Pontes",
  insecure_corporate_dev: "O Executivo Inseguro",
  exhausted_solo_mother: "A Mãe Solo Exausta",
  trapped_public_servant: "O Servidor Aprisionado",
  academic_hermit: "O Eremita Acadêmico",
  executive_refugee: "O Refugiado Executivo",
  creative_visionary: "O Visionário Criativo",
  lifestyle_optimizer: "O Otimizador de Estilo",
};

export const OIOS_FEAR_CLUSTER_LABELS: Record<string, string> = {
  freedom: "Liberdade",
  success: "Sucesso",
  stability: "Estabilidade",
  validation: "Validação",
};

export const OIOS_ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  institutional_escapee:
    "Você sente o peso das estruturas corporativas e busca um caminho autônomo. Sua energia vem do desejo de quebrar ciclos e criar suas próprias regras.",
  scholarship_cartographer:
    "Você mapeou cada edital, bolsa e oportunidade com precisão cirúrgica. Sua disciplina acadêmica é sua principal vantagem competitiva.",
  career_pivot:
    "Você está no ponto de inflexão: tem experiência acumulada e energia para reinventar sua trajetória em uma direção completamente nova.",
  global_nomad:
    "Fronteiras não te limitam. Você prospera na diversidade cultural e enxerga mobilidade internacional como modo de vida, não como exceção.",
  technical_bridge_builder:
    "Você conecta mundos que normalmente não se falam — técnica e estratégia, local e global, teoria e prática.",
  insecure_corporate_dev:
    "Você tem mais capacidade do que acredita. O principal obstáculo não é o mercado — é a narrativa interna que você carrega sobre si mesmo.",
  exhausted_solo_mother:
    "Você acumula responsabilidades que a maioria não consegue imaginar. Sua resiliência é real, mas precisa de estrutura para se converter em mobilidade.",
  trapped_public_servant:
    "A estabilidade que você construiu pode ter se tornado uma gaiola dourada. Existe um caminho entre segurança e crescimento.",
  academic_hermit:
    "Você tem profundidade intelectual rara, mas pode estar subutilizando sua capacidade de comunicar e conectar esse valor ao mercado.",
  executive_refugee:
    "Você construiu carreira de alto impacto e agora busca uma nova plataforma à altura do que você pode entregar.",
  creative_visionary:
    "Você enxerga possibilidades que outros não enxergam. Seu desafio é transformar visão em execução sem perder a essência criativa.",
  lifestyle_optimizer:
    "Você é pragmático sobre o que quer: vida, não apenas carreira. Você otimiza para liberdade, saúde e presença — não só para status.",
};

export function formatOiosArchetypeLabel(archetype: string | null | undefined): string {
  if (!archetype) return "—";
  return OIOS_ARCHETYPE_LABELS[archetype] ?? archetype.replace(/_/g, " ");
}

export function formatOiosFearClusterLabel(cluster: string | null | undefined): string {
  if (!cluster) return "—";
  return OIOS_FEAR_CLUSTER_LABELS[cluster] ?? cluster;
}

export function getOiosArchetypeDescription(archetype: string | null | undefined): string {
  if (!archetype) return "";
  return OIOS_ARCHETYPE_DESCRIPTIONS[archetype] ?? "";
}
