import { Router } from 'express'

export const vendorsRouter = Router()

// Mock vendors data
const VENDORS = [
  {
    id: 'vendor_olcan_official',
    user_id: 'user_olcan',
    business_name: 'Olcan Official',
    business_type: 'company',
    bio: 'Equipe oficial da Olcan com especialistas em mobilidade internacional.',
    headline: 'Especialistas em Mobilidade Internacional',
    avatar_url: 'https://cdn.olcan.com.br/vendors/olcan-logo.png',
    specialties: ['application', 'coaching', 'mentoring'],
    languages: ['pt', 'en'],
    years_experience: 5,
    status: 'approved',
    commission_rate: 0,
    rating_average: 4.9,
    review_count: 1247,
    created_at: '2021-01-01T00:00:00Z'
  },
  {
    id: 'vendor_coach_maria',
    user_id: 'user_maria',
    business_name: 'Maria Silva - Career Coach',
    business_type: 'individual',
    bio: 'Coach de carreira especializada em candidaturas internacionais com 8 anos de experiência.',
    headline: 'Career Coach & Application Specialist',
    avatar_url: 'https://cdn.olcan.com.br/vendors/maria.jpg',
    specialties: ['cv_review', 'coaching', 'career'],
    languages: ['pt', 'en', 'es'],
    years_experience: 8,
    status: 'approved',
    commission_rate: 25,
    rating_average: 4.8,
    review_count: 87,
    created_at: '2023-03-01T00:00:00Z'
  },
  {
    id: 'vendor_coach_joao',
    user_id: 'user_joao',
    business_name: 'João Santos - Interview Coach',
    business_type: 'individual',
    bio: 'Especialista em preparação para entrevistas de admissão e bolsas.',
    headline: 'Interview Preparation Expert',
    avatar_url: 'https://cdn.olcan.com.br/vendors/joao.jpg',
    specialties: ['interview_prep', 'coaching'],
    languages: ['pt', 'en'],
    years_experience: 6,
    status: 'approved',
    commission_rate: 25,
    rating_average: 4.9,
    review_count: 64,
    created_at: '2023-04-15T00:00:00Z'
  },
  {
    id: 'vendor_editor_ana',
    user_id: 'user_ana',
    business_name: 'Ana Costa - Academic Editor',
    business_type: 'individual',
    bio: 'Editora acadêmica especializada em SOPs, essays e documentos de candidatura para universidades no exterior.',
    headline: 'SOP & Academic Writing Specialist',
    avatar_url: 'https://cdn.olcan.com.br/vendors/ana.jpg',
    specialties: ['sop_editing', 'academic_writing', 'application'],
    languages: ['pt', 'en', 'fr'],
    years_experience: 10,
    status: 'approved',
    commission_rate: 25,
    rating_average: 4.7,
    review_count: 45,
    created_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'vendor_mentor_carlos',
    user_id: 'user_carlos',
    business_name: 'Carlos Oliveira - Mentor de Carreira',
    business_type: 'individual',
    bio: 'Mentor sênior com experiência em transição de carreira internacional. Viveu em 4 países e orientou mais de 200 profissionais.',
    headline: 'Senior Career Mentor & International Mobility Expert',
    avatar_url: 'https://cdn.olcan.com.br/vendors/carlos.jpg',
    specialties: ['mentoring', 'career_coaching', 'immigration'],
    languages: ['pt', 'en', 'de'],
    years_experience: 12,
    status: 'approved',
    commission_rate: 20,
    rating_average: 5.0,
    review_count: 23,
    created_at: '2023-01-10T00:00:00Z'
  }
]

// GET /store/vendors - List all vendors
vendorsRouter.get('/', (req, res) => {
  const { specialty, limit = '10', offset = '0' } = req.query
  
  let filtered = [...VENDORS]
  
  if (specialty) {
    filtered = filtered.filter(v => v.specialties.includes(specialty as string))
  }
  
  const start = parseInt(offset as string)
  const end = start + parseInt(limit as string)
  const paginated = filtered.slice(start, end)
  
  res.json({
    vendors: paginated,
    count: filtered.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  })
})

// GET /store/vendors/:id - Get vendor by ID
vendorsRouter.get('/:id', (req, res) => {
  const vendor = VENDORS.find(v => v.id === req.params.id)
  
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found' })
  }
  
  res.json(vendor)
})
