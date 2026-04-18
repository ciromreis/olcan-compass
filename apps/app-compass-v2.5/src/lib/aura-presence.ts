import type { Aura, CareActivityType, EvolutionStage } from "@/stores/auraStore";
import type { PresencePhenotype } from "@/lib/presence-phenotype";

export type PresenceSpecies =
  | "fox"
  | "dragon"
  | "lion"
  | "phoenix"
  | "wolf"
  | "owl"
  | "bear"
  | "eagle"
  | "deer"
  | "tiger"
  | "butterfly"
  | "dolphin";

export type PresenceAttachment =
  | "ears"
  | "horns"
  | "mane"
  | "plumes"
  | "crest"
  | "fins"
  | "antlers"
  | "halo"
  | "orbitals"
  | "wings";

export type PresenceLocomotion = "hover" | "limbs" | "thrusters" | "tendrils" | "tail";
export type PresenceEyeStyle = "slanted" | "round" | "slit" | "monocle" | "visor";
export type PresenceMood = "atenta" | "densa" | "exausta" | "expansiva" | "radiante" | "tensa";
export type PresenceEvent =
  | "idle"
  | "greeting"
  | "care"
  | "document_focus"
  | "interview_focus"
  | "route_focus"
  | "low_energy"
  | "high_urgency"
  | "celebration";

export interface PresenceFigureSpec {
  seed: string;
  species: PresenceSpecies;
  attachment: PresenceAttachment;
  locomotion: PresenceLocomotion;
  eyeStyle: PresenceEyeStyle;
  bodyScale: number;
  detailLevel: number;
  metallic: number;
  symmetry: number;
  primaryHue: number;
  secondaryHue: number;
  orbitCount: number;
  haloIntensity: number;
  stage: EvolutionStage;
}

export interface PresenceProfile {
  figure: PresenceFigureSpec;
  mood: PresenceMood;
  title: string;
  descriptor: string;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)] ?? values[0];
}

function stageIntensity(stage: EvolutionStage): number {
  switch (stage) {
    case "egg":
      return 0.18;
    case "sprout":
      return 0.34;
    case "young":
      return 0.48;
    case "mature":
      return 0.66;
    case "master":
      return 0.82;
    case "legendary":
      return 1;
    default:
      return 0.3;
  }
}

function archetypeHue(archetype: string): { primary: number; secondary: number } {
  const key = archetype.toLowerCase();
  if (key.includes("sage") || key.includes("scholar")) return { primary: 198, secondary: 166 };
  if (key.includes("strateg")) return { primary: 214, secondary: 224 };
  if (key.includes("diplomat")) return { primary: 192, secondary: 206 };
  if (key.includes("creator")) return { primary: 224, secondary: 256 };
  if (key.includes("ruler")) return { primary: 214, secondary: 46 };
  if (key.includes("pioneer")) return { primary: 206, secondary: 184 };
  return { primary: 212, secondary: 208 };
}

function deriveMood(aura: Aura, phenotype?: PresencePhenotype): PresenceMood {
  const urgency = phenotype?.urgencyLevel ?? 0;
  const adaptation = phenotype?.adaptationLevel ?? 0;
  if (aura.energy <= 24) return "exausta";
  if (urgency >= 0.75) return "tensa";
  if (adaptation >= 0.72 && aura.happiness >= 70) return "radiante";
  if (aura.happiness >= 74) return "expansiva";
  if (phenotype?.documentReadiness && phenotype.documentReadiness >= 0.7) return "densa";
  return "atenta";
}

export function derivePresenceSeed(aura: Aura, phenotype?: PresencePhenotype): string {
  return [
    aura.id,
    aura.name,
    aura.archetype,
    aura.evolutionStage,
    phenotype?.routeLabel || "sem-rota",
    phenotype?.routeCount || 0,
  ].join(":");
}

import { ARCHETYPES, type ArchetypeId, type AuraCreature } from "@/lib/archetypes";

/**
 * Converte HEX para HSL aproximado para o shader procedural
 */
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return Math.round(h * 360);
}

export function generatePresenceFigure(aura: Aura, phenotype?: PresencePhenotype): PresenceFigureSpec {
  const seed = derivePresenceSeed(aura, phenotype);
  const rng = mulberry32(hashString(seed));
  
  const stagePower = stageIntensity(aura.evolutionStage);
  const readinessMix =
    ((phenotype?.documentReadiness ?? 0.24) + (phenotype?.interviewReadiness ?? 0.18) + (phenotype?.logisticsReadiness ?? 0.14)) / 3;
  
  const weights = aura.recombination?.weights || [];
  const primaryId = weights[0]?.id || (aura.archetype as ArchetypeId);
  const secondaryId = weights[1]?.id;

  const primaryArch = ARCHETYPES[primaryId as ArchetypeId] || ARCHETYPES['institutional_escapee'];
  const secondaryArch = secondaryId ? ARCHETYPES[secondaryId as ArchetypeId] : null;

  const primaryHue = hexToHue(primaryArch.colors.primary);
  const secondaryHue = secondaryArch ? hexToHue(secondaryArch.colors.primary) : primaryHue;
  
  // Mapping creatures to attachments
  const attachmentMap: Record<AuraCreature, PresenceAttachment> = {
    fox: "ears", dragon: "horns", lion: "mane", phoenix: "wings",
    wolf: "crest", owl: "halo", bear: "ears", eagle: "wings",
    deer: "antlers", tiger: "mane", butterfly: "wings", dolphin: "fins"
  };

  const eyeMap: Record<AuraCreature, PresenceEyeStyle> = {
    fox: "slanted", dragon: "slit", lion: "round", phoenix: "round",
    wolf: "slanted", owl: "monocle", bear: "round", eagle: "slit",
    deer: "round", tiger: "slit", butterfly: "round", dolphin: "round"
  };

  const finalSpecies = primaryArch.creature as PresenceSpecies;
  const finalAttachment = attachmentMap[primaryArch.creature] || "ears";
  
  return {
    seed,
    species: finalSpecies,
    attachment: finalAttachment,
    locomotion: (primaryArch.creature === 'phoenix' || primaryArch.creature === 'eagle' || primaryArch.creature === 'butterfly') ? "hover" : "limbs",
    eyeStyle: eyeMap[primaryArch.creature] || "round",
    bodyScale: (0.9 + stagePower * 0.45),
    detailLevel: 2 + Math.round(stagePower * 4), // Detail grows with evolution
    metallic: clamp(0.2 + readinessMix * 0.7), // Metallic shininess linked to readiness
    symmetry: clamp(0.5 + (1 - (phenotype?.urgencyLevel ?? 0.2)) * 0.4),
    primaryHue,
    secondaryHue,
    orbitCount: Math.max(1, Math.min(4, Math.round(stagePower * 4))),
    haloIntensity: clamp(0.1 + readinessMix * 0.8),
    stage: aura.evolutionStage,
  };
}

export function derivePresenceProfile(aura: Aura, phenotype?: PresencePhenotype): PresenceProfile {
  const mood = deriveMood(aura, phenotype);
  const figure = generatePresenceFigure(aura, phenotype);
  const routeLabel = phenotype?.routeLabel;
  const descriptorMap: Record<PresenceMood, string> = {
    atenta: "Lê sinais dispersos e mantém margem de manobra.",
    densa: "Condensa repertório e organiza evidências antes do próximo salto.",
    exausta: "Pede recuperação para não perder precisão operacional.",
    expansiva: "Amplia presença social e aproveita tração acumulada.",
    radiante: "Opera com coerência rara entre preparo, ritmo e direção.",
    tensa: "Concentra energia nos próximos marcos críticos sem dispersão.",
  };

  return {
    figure,
    mood,
    title: routeLabel ? `Leitura ativa em ${routeLabel}` : "Leitura basal da jornada",
    descriptor: descriptorMap[mood],
  };
}

const REACTION_LIBRARY: Record<PresenceEvent, string[]> = {
  idle: [
    "Estou recombinando sinais da sua jornada.",
    "Ainda há margem para ganhar clareza sem forçar velocidade.",
    "Seu contexto está mudando. Vale ler o padrão antes de agir.",
  ],
  greeting: [
    "Voltei a mapear seus próximos movimentos.",
    "Sua presença já está captando o tom do dia.",
    "Estou aqui para condensar ruído em direção prática.",
  ],
  care: [
    "Esse cuidado melhora minha leitura do seu ritmo.",
    "A calibração foi absorvida. Sinal mais limpo agora.",
    "Bom ajuste. A forma responde melhor quando você cuida da base.",
  ],
  document_focus: [
    "Documento forte reduz atrito nas próximas decisões.",
    "Se a narrativa fechar bem, o resto da rota fica menos caro.",
    "Aqui vale densidade, não volume.",
  ],
  interview_focus: [
    "Entrevista exige resposta viva, não texto decorado.",
    "Ritmo, evidência e presença precisam soar como uma coisa só.",
    "O treino fica melhor quando a fala encosta no documento certo.",
  ],
  route_focus: [
    "Cada rota me reorganiza de um jeito diferente.",
    "Estou priorizando a trilha que pede menos improviso e mais precisão.",
    "Comparar rotas sem densidade documental sempre custa caro depois.",
  ],
  low_energy: [
    "Se insistir cansado, sua leitura perde definição.",
    "Talvez agora seja hora de preservar energia e manter consistência.",
    "Recuperar tração também é avanço.",
  ],
  high_urgency: [
    "Há prazo comprimindo a forma. Vamos reduzir dispersão.",
    "O contexto apertou. Priorize o que muda decisão agora.",
    "Urgência alta: menos enfeite, mais evidência utilizável.",
  ],
  celebration: [
    "Boa. A forma absorveu esse ganho.",
    "Esse avanço reorganiza a presença inteira.",
    "Sinal forte. Isso muda o próximo ciclo.",
  ],
};

export function resolvePresenceEvent(args: {
  pathname?: string;
  phenotype?: PresencePhenotype;
  activityType?: CareActivityType;
  aura: Aura;
}): PresenceEvent {
  const { pathname, phenotype, activityType, aura } = args;
  if (activityType) return "care";
  if (aura.energy <= 24) return "low_energy";
  if ((phenotype?.urgencyLevel ?? 0) >= 0.72) return "high_urgency";
  if (pathname?.includes("/forge")) return "document_focus";
  if (pathname?.includes("/interviews")) return "interview_focus";
  if (pathname?.includes("/routes") || pathname?.includes("/dashboard")) return "route_focus";
  return "idle";
}

export function getPresenceReaction(args: {
  aura: Aura;
  phenotype?: PresencePhenotype;
  event: PresenceEvent;
  activityType?: CareActivityType;
}): string {
  const { aura, phenotype, event, activityType } = args;
  const pool = REACTION_LIBRARY[event] || REACTION_LIBRARY.idle;
  const rng = mulberry32(hashString(`${derivePresenceSeed(aura, phenotype)}:${event}:${activityType || "none"}`));
  const base = pool[Math.floor(rng() * pool.length)] ?? pool[0];

  if (event === "document_focus" && phenotype?.documentReadiness != null && phenotype.documentReadiness < 0.45) {
    return "Sua rota pede mais densidade documental antes de ganhar tração real.";
  }
  if (event === "interview_focus" && phenotype?.interviewReadiness != null && phenotype.interviewReadiness < 0.35) {
    return "Vale treinar agora para não deixar a fala descolar do seu material.";
  }
  if (event === "high_urgency" && phenotype?.routeLabel) {
    return `${phenotype.routeLabel} entrou em faixa crítica. Priorize o que altera prazo e decisão.`;
  }
  return base;
}
