/**
 * OIOS Recombination Engine - v2.5
 * 
 * Este motor calcula a "Mistura Genética" do usuário, transformando um arquétipo dominante
 * em uma recombinação dinâmica baseada em sinais de progresso e prontidão.
 */

import { ArchetypeId, ARCHETYPES } from './archetypes';
import { RoutePresenceSignal } from './presence-phenotype';

export interface ArchetypeWeight {
  id: ArchetypeId;
  weight: number; // 0 to 100
  label: string;
}

export interface RecombinationProfile {
  weights: ArchetypeWeight[];
  dominantId: ArchetypeId;
  secondaryId: ArchetypeId;
  tertiaryId: ArchetypeId;
  manifestationSeed: number;
}

/**
 * Calcula a recombinação baseada no arquétipo dominante e nos sinais do sistema.
 * Atualmente implementa a lógica de "Oscilação Metamoderna": 
 * O arquétipo dominante é a base, mas outros emergem conforme a atividade.
 */
export function calculateRecombination(
  dominantId: ArchetypeId,
  signals: RoutePresenceSignal[] = []
): RecombinationProfile {
  const weights = {} as Record<ArchetypeId, number>;
  
  // Initialize all with 0
  Object.keys(ARCHETYPES).forEach((id) => {
    weights[id as ArchetypeId] = 0;
  });

  // Base: Dominant archetype gets the primary weight (50-60%)
  weights[dominantId] = 60;

  // Secondary Emergence based on signals
  const avgReadiness = signals.length > 0 
    ? signals.reduce((sum, s) => sum + s.adaptationLevel, 0) / signals.length
    : 15;

  // Logic: 
  // - High progress triggers 'technical_bridge_builder' traits.
  // - Close deadlines trigger 'institutional_escapee' traits.
  // - High document count triggers 'scholarship_cartographer' traits.
  
  const totalDocs = signals.reduce((sum, s) => sum + s.matchedDocumentCount, 0);
  const avgUrgency = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.urgencyLevel, 0) / signals.length
    : 0.2;

  // Distribute remaining 40% based on life signals
  if (totalDocs > 3) {
    weights['scholarship_cartographer'] += 15;
  } else {
    weights['academic_hermit'] += 10;
  }

  if (avgUrgency > 0.6) {
    weights['institutional_escapee'] += 15;
  }

  if (avgReadiness > 70) {
    weights['technical_bridge_builder'] += 10;
  }

  // Fill gaps for nomadic/growth tendencies
  weights['global_nomad'] += Math.floor(avgReadiness / 10);
  
  // Normalize weights to sum up to 100
  const totalRaw = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const sortedWeights: ArchetypeWeight[] = Object.entries(weights)
    .map(([id, w]) => ({
      id: id as ArchetypeId,
      weight: Math.round((w / totalRaw) * 100),
      label: ARCHETYPES[id as ArchetypeId].name
    }))
    .sort((a, b) => b.weight - a.weight);

  return {
    weights: sortedWeights,
    dominantId: sortedWeights[0].id,
    secondaryId: sortedWeights[1].id,
    tertiaryId: sortedWeights[2].id,
    manifestationSeed: Math.floor(totalRaw * 1.5)
  };
}
