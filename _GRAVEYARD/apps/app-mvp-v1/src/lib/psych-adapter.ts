import { PsychProfile } from '@/store/psych';
import { UIMode } from '@/store/uiMode';

/**
 * Psych Adapter - Intelligence layer for psychological profile interpretation
 * 
 * Interprets Big Five personality scores to drive UI adaptation and provide
 * personalized recommendations following MMXD philosophy.
 */

export interface PsychInterpretation {
  anxietyLevel: 'low' | 'moderate' | 'high';
  agencyLevel: 'low' | 'moderate' | 'high';
  recommendedMode: UIMode;
  modeReason: string;
  strengths: string[];
  considerations: string[];
}

/**
 * Calculate anxiety score from Big Five dimensions
 * High neuroticism correlates with anxiety
 */
export function calculateAnxietyScore(profile: PsychProfile): number {
  // Neuroticism is the primary indicator of anxiety
  // Scale: 0-100
  return profile.neuroticism;
}

/**
 * Calculate agency score from Big Five dimensions
 * Combination of conscientiousness, extraversion, and low neuroticism
 */
export function calculateAgencyScore(profile: PsychProfile): number {
  // Agency = (Conscientiousness + Extraversion + (100 - Neuroticism)) / 3
  const agencyScore =
    (profile.conscientiousness +
      profile.extraversion +
      (100 - profile.neuroticism)) /
    3;

  return Math.round(agencyScore);
}

/**
 * Interpret psychological profile and generate UI recommendations
 */
export function interpretProfile(profile: PsychProfile): PsychInterpretation {
  const anxietyScore = calculateAnxietyScore(profile);
  const agencyScore = calculateAgencyScore(profile);

  // Determine anxiety level
  const anxietyLevel: 'low' | 'moderate' | 'high' =
    anxietyScore < 40 ? 'low' : anxietyScore < 70 ? 'moderate' : 'high';

  // Determine agency level
  const agencyLevel: 'low' | 'moderate' | 'high' =
    agencyScore < 40 ? 'low' : agencyScore < 70 ? 'moderate' : 'high';

  // Recommend UI mode based on psychological state
  let recommendedMode: UIMode;
  let modeReason: string;

  if (anxietyLevel === 'high') {
    recommendedMode = 'forge';
    modeReason =
      'Modo Forja recomendado: foco singular para reduzir sobrecarga cognitiva';
  } else if (agencyLevel === 'high') {
    recommendedMode = 'map';
    modeReason =
      'Modo Mapa recomendado: visão ampla para aproveitar sua capacidade de gestão';
  } else {
    recommendedMode = 'map';
    modeReason =
      'Modo Mapa sugerido: você pode alternar conforme sua necessidade';
  }

  // Generate strengths based on high scores
  const strengths: string[] = [];
  if (profile.openness > 70) {
    strengths.push('Abertura para novas experiências e culturas');
  }
  if (profile.conscientiousness > 70) {
    strengths.push('Organização e planejamento estruturado');
  }
  if (profile.extraversion > 70) {
    strengths.push('Facilidade em construir redes e conexões');
  }
  if (profile.agreeableness > 70) {
    strengths.push('Colaboração e adaptação cultural');
  }
  if (profile.neuroticism < 30) {
    strengths.push('Resiliência emocional diante de desafios');
  }

  // Generate considerations based on low scores or high neuroticism
  const considerations: string[] = [];
  if (profile.neuroticism > 70) {
    considerations.push(
      'Considere técnicas de gestão de ansiedade durante o processo'
    );
  }
  if (profile.conscientiousness < 30) {
    considerations.push(
      'Ferramentas de organização podem ajudar no acompanhamento de prazos'
    );
  }
  if (profile.extraversion < 30) {
    considerations.push(
      'Networking pode exigir esforço extra - comece com grupos pequenos'
    );
  }
  if (profile.openness < 30) {
    considerations.push(
      'Prepare-se gradualmente para mudanças culturais significativas'
    );
  }

  return {
    anxietyLevel,
    agencyLevel,
    recommendedMode,
    modeReason,
    strengths,
    considerations,
  };
}

/**
 * Get dimension label in Portuguese
 */
export function getDimensionLabel(dimension: keyof Omit<PsychProfile, 'id' | 'user_id' | 'anxiety_score' | 'agency_score' | 'last_assessment_date' | 'created_at' | 'updated_at'>): string {
  const labels: Record<string, string> = {
    openness: 'Abertura',
    conscientiousness: 'Conscienciosidade',
    extraversion: 'Extroversão',
    agreeableness: 'Amabilidade',
    neuroticism: 'Neuroticismo',
  };

  return labels[dimension] || dimension;
}

/**
 * Get dimension description in Portuguese
 */
export function getDimensionDescription(dimension: keyof Omit<PsychProfile, 'id' | 'user_id' | 'anxiety_score' | 'agency_score' | 'last_assessment_date' | 'created_at' | 'updated_at'>): string {
  const descriptions: Record<string, string> = {
    openness:
      'Curiosidade intelectual, criatividade e abertura para novas experiências',
    conscientiousness:
      'Organização, autodisciplina e orientação para objetivos',
    extraversion:
      'Sociabilidade, assertividade e busca por estimulação externa',
    agreeableness: 'Cooperação, empatia e consideração pelos outros',
    neuroticism: 'Tendência a experimentar emoções negativas e instabilidade',
  };

  return descriptions[dimension] || '';
}

/**
 * Determine if user should be allowed to manually override UI mode
 */
export function canOverrideMode(profile: PsychProfile): boolean {
  const anxietyScore = calculateAnxietyScore(profile);
  const agencyScore = calculateAgencyScore(profile);

  // Allow override if anxiety is not critically high and agency is moderate or high
  return anxietyScore < 80 && agencyScore >= 40;
}
