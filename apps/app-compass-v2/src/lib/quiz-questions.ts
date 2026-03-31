/**
 * Archetype Discovery Quiz - 10 Questions
 * Determines user's dominant archetype for companion assignment
 */

import { ArchetypeId } from './archetypes'

export interface QuizOption {
  text: string
  archetype: ArchetypeId
  weight: number
}

export interface QuizQuestion {
  id: string
  question: string
  category: 'motivation' | 'work_style' | 'challenge' | 'fear' | 'goal'
  options: QuizOption[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'primary_motivation',
    question: 'What primarily drives your decision to pursue international opportunities?',
    category: 'motivation',
    options: [
      { text: 'Freedom from institutional constraints and bureaucracy', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Achieving prestigious academic recognition', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Personal growth and mastering new skills', archetype: 'career_pivot', weight: 3 },
      { text: 'Adventure and experiencing different cultures', archetype: 'global_nomad', weight: 3 },
      { text: 'Stable career progression in tech', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Better quality of life for my family', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'work_environment',
    question: 'What type of work environment appeals to you most?',
    category: 'work_style',
    options: [
      { text: 'Independent consulting or entrepreneurship', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Top-tier research institutions', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Dynamic startups with learning opportunities', archetype: 'career_pivot', weight: 2 },
      { text: 'Remote-first companies with global teams', archetype: 'global_nomad', weight: 2 },
      { text: 'Established tech companies with clear structure', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Stable organizations with work-life balance', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'biggest_fear',
    question: 'What concerns you most about moving abroad?',
    category: 'fear',
    options: [
      { text: 'Losing my independence or autonomy', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Not being competitive enough academically', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Starting over in a new field', archetype: 'career_pivot', weight: 2 },
      { text: 'Not being able to return if things don\'t work out', archetype: 'global_nomad', weight: 2 },
      { text: 'Failing technical interviews or language barriers', archetype: 'insecure_corporate_dev', weight: 2 },
      { text: 'Not providing security for my family', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'success_definition',
    question: 'How do you define success in your international journey?',
    category: 'goal',
    options: [
      { text: 'Complete financial and personal freedom', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Securing a prestigious scholarship or position', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Successfully transitioning to a new career path', archetype: 'career_pivot', weight: 3 },
      { text: 'Living and working from anywhere in the world', archetype: 'global_nomad', weight: 3 },
      { text: 'Landing a stable tech role at a good company', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Creating a safe, stable life for my family', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'challenge_preference',
    question: 'What type of challenges excite you most?',
    category: 'challenge',
    options: [
      { text: 'Breaking free from systems and creating my own path', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Competing for highly selective opportunities', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Learning completely new skills and domains', archetype: 'career_pivot', weight: 2 },
      { text: 'Adapting to new cultures and environments', archetype: 'global_nomad', weight: 2 },
      { text: 'Solving complex technical problems', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Overcoming obstacles to protect loved ones', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'current_situation',
    question: 'Which best describes your current professional situation?',
    category: 'work_style',
    options: [
      { text: 'Feeling trapped in a rigid corporate or government structure', archetype: 'trapped_public_servant', weight: 3 },
      { text: 'Pursuing or planning to pursue advanced degrees', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Mid-career looking to pivot industries', archetype: 'career_pivot', weight: 3 },
      { text: 'Already working remotely or as a digital nomad', archetype: 'global_nomad', weight: 3 },
      { text: 'Working in tech but feeling insecure about skills', archetype: 'insecure_corporate_dev', weight: 3 },
      { text: 'Balancing career with family responsibilities', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'decision_making',
    question: 'How do you typically make important career decisions?',
    category: 'work_style',
    options: [
      { text: 'Based on maximizing personal freedom', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Based on prestige and recognition potential', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Based on learning and growth opportunities', archetype: 'career_pivot', weight: 2 },
      { text: 'Based on lifestyle and location flexibility', archetype: 'global_nomad', weight: 2 },
      { text: 'Based on stability and career progression', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Based on security and family wellbeing', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'ideal_outcome',
    question: 'What would be your ideal outcome 5 years from now?',
    category: 'goal',
    options: [
      { text: 'Running my own business or consulting independently', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Holding a prestigious academic or research position', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Thriving in a completely new career field', archetype: 'career_pivot', weight: 3 },
      { text: 'Living as a true global citizen', archetype: 'global_nomad', weight: 3 },
      { text: 'Senior technical role at a top company', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Stable life in a safe country with my family', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'motivation_source',
    question: 'What motivates you to keep pushing forward?',
    category: 'motivation',
    options: [
      { text: 'The desire for autonomy and self-determination', archetype: 'institutional_escapee', weight: 2 },
      { text: 'The pursuit of excellence and recognition', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'The excitement of transformation and growth', archetype: 'career_pivot', weight: 2 },
      { text: 'The thrill of new experiences and cultures', archetype: 'global_nomad', weight: 2 },
      { text: 'Building technical expertise and career stability', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Creating a better future for my loved ones', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'support_need',
    question: 'What kind of support would help you most right now?',
    category: 'challenge',
    options: [
      { text: 'Strategies for breaking free from constraints', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Help crafting competitive applications', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Guidance on career transition strategies', archetype: 'career_pivot', weight: 2 },
      { text: 'Visa and remote work logistics', archetype: 'global_nomad', weight: 2 },
      { text: 'Interview preparation and confidence building', archetype: 'insecure_corporate_dev', weight: 2 },
      { text: 'Family-friendly relocation planning', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  }
]

export interface QuizResult {
  dominantArchetype: ArchetypeId
  scores: Record<ArchetypeId, number>
  answers: Record<string, string>
}

export function calculateArchetype(answers: Record<string, QuizOption>): QuizResult {
  const scores: Record<string, number> = {}
  
  // Initialize all archetype scores
  const allArchetypes: ArchetypeId[] = [
    'institutional_escapee',
    'scholarship_cartographer',
    'career_pivot',
    'global_nomad',
    'technical_bridge_builder',
    'insecure_corporate_dev',
    'exhausted_solo_mother',
    'trapped_public_servant',
    'academic_hermit',
    'executive_refugee',
    'creative_visionary',
    'lifestyle_optimizer'
  ]
  
  allArchetypes.forEach(archetype => {
    scores[archetype] = 0
  })
  
  // Calculate scores based on weighted answers
  Object.values(answers).forEach(option => {
    scores[option.archetype] = (scores[option.archetype] || 0) + option.weight
  })
  
  // Find dominant archetype
  const dominantArchetype = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0] as ArchetypeId
  
  return {
    dominantArchetype,
    scores: scores as Record<ArchetypeId, number>,
    answers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, value.text])
    )
  }
}
