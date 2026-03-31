import { CompanionType, EvolutionStage, CompanionRoute } from '../../types/companion';

export const COMPANION_THEMES: Record<CompanionType, { species: string; colors: string; traits: string }> = {
  strategist: { species: 'Fox', colors: 'purple/indigo', traits: 'geometric, sharp eyes, tactical aura' },
  innovator: { species: 'Dragon', colors: 'cyan/teal', traits: 'lightning, futuristic tech wings, digital scales' },
  creator: { species: 'Lioness', colors: 'pink/gold', traits: 'flowing light mane, floating sparkles, artistic crest' },
  diplomat: { species: 'Water Spirit', colors: 'ocean blue/silver', traits: 'liquid form, calm ripples, harmonious glow' },
  pioneer: { species: 'Phoenix', colors: 'orange/gold', traits: 'burning light wings, soaring posture, ember trails' },
  scholar: { species: 'Owl', colors: 'deep violet/navy', traits: 'floating runes, monolithic wisdom, starlit feathers' },
  guardian: { species: 'Golden Elephant', colors: 'amber/bronze', traits: 'shield-like plating, grounded, protective barriers' },
  visionary: { species: 'Stellar Hydra', colors: 'nebula/white', traits: 'cosmic heads, looking into portals, star-powder aura' },
  academic: { species: 'Griffin', colors: 'prestigious blue/cream', traits: 'intellectual focus, traditional robes, silver talons' },
  communicator: { species: 'Hummingbird', colors: 'vibrant prism', traits: 'ultrafast wings, silver soundwave trails, melodic aura' },
  analyst: { species: 'Arachne-Logic', colors: 'monochrome/teal', traits: 'data-thread webs, logical eye array, matrix patterns' },
  luminary: { species: 'Sun Spirit', colors: 'radiant white/gold', traits: 'blinding solar crown, inspirational heat, holy glow' }
};

export const STAGE_DESCRIPTIONS: Record<EvolutionStage, string> = {
  egg: 'a magical, translucent digital egg with a soft internal pulsing core',
  sprout: 'a tiny, ethereal creature just emerging from crystalline shards',
  young: 'a youthful, energetic digital companion with growing magical manifestations',
  mature: 'a powerful, majestic career companion with intricate crystalline structures',
  master: 'an ancient, transcendent digital entity radiating professional mastery',
  legendary: 'a cosmic, legendary companion that has mastered its career trajectory'
};

export const ROUTE_THEMES: Record<CompanionRoute, string> = {
  academic: 'adorned with floating scrolls, prestigious quills, and leather-bound book auras',
  corporate: 'equipped with sleek silver armor, digital terminal displays, and professional sigils',
  sponsored: 'wrapped in golden energy paths, luxury patterns, and global mobility symbols',
  creative: 'surrounded by floating ink droplets, vibrant color splashes, and infinite canvas wings'
};
