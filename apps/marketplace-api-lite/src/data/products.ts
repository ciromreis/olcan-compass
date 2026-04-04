// Olcan digital products catalog
export const PRODUCTS = [
  {
    id: 'prod_kit_application',
    title: 'Kit Application - Guia Completo',
    slug: 'kit-application-guia-completo',
    description: 'Tudo que você precisa para sua candidatura internacional: templates de CV, carta de apresentação, guias de SOP e vídeos tutoriais. Desenvolvido pela equipe Olcan com base em mais de 1.000 candidaturas acompanhadas.',
    type: 'kit_application',
    price_b2c: 19700,
    price_b2b: 14700,
    currency: 'BRL',
    download_url: 'https://storage.olcan.com.br/products/kit-application.zip',
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: true,
    files: [
      { name: 'CV Template Europass.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'CV Template Acadêmico.docx', size: 38000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'Cover Letter Template.docx', size: 32000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'Guia SOP Passo a Passo.pdf', size: 1200000, type: 'application/pdf' },
      { name: 'Checklist de Documentos.pdf', size: 250000, type: 'application/pdf' },
      { name: 'Video Tutorial - Como Montar sua Application.mp4', size: 45000000, type: 'video/mp4' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/kit-app-preview-1.jpg',
      'https://cdn.olcan.com.br/products/kit-app-preview-2.jpg'
    ],
    tags: ['application', 'cv', 'sop', 'templates', 'study-abroad', 'flagship'],
    download_count: 1247,
    purchase_count: 1189,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2026-04-01T15:30:00Z'
  },
  {
    id: 'prod_curso_cidadao_mundo',
    title: 'Curso Cidadão do Mundo',
    slug: 'curso-cidadao-mundo',
    description: 'Curso completo sobre mobilidade internacional: planejamento, documentação, adaptação cultural e construção de carreira no exterior. 8 módulos com vídeoaulas, exercícios práticos e comunidade exclusiva.',
    type: 'course',
    price_b2c: 49700,
    price_b2b: 39700,
    currency: 'BRL',
    download_url: 'https://courses.olcan.com.br/cidadao-mundo',
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: true,
    files: [
      { name: 'Módulo 1 - Decisão e Planejamento.mp4', size: 180000000, type: 'video/mp4' },
      { name: 'Módulo 2 - Documentação Essencial.mp4', size: 210000000, type: 'video/mp4' },
      { name: 'Módulo 3 - Financeiro e Bolsas.mp4', size: 195000000, type: 'video/mp4' },
      { name: 'Módulo 4 - Candidatura e Entrevistas.mp4', size: 220000000, type: 'video/mp4' },
      { name: 'Módulo 5 - Visto e Imigração.mp4', size: 175000000, type: 'video/mp4' },
      { name: 'Módulo 6 - Adaptação Cultural.mp4', size: 160000000, type: 'video/mp4' },
      { name: 'Módulo 7 - Carreira Internacional.mp4', size: 200000000, type: 'video/mp4' },
      { name: 'Módulo 8 - Comunidade e Networking.mp4', size: 150000000, type: 'video/mp4' },
      { name: 'Workbook Completo.pdf', size: 4500000, type: 'application/pdf' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/curso-cidadao-thumb.jpg'
    ],
    tags: ['course', 'mobility', 'international', 'career', 'bestseller'],
    download_count: 876,
    purchase_count: 834,
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2026-04-02T12:00:00Z'
  },
  {
    id: 'prod_ebook_canada',
    title: 'Guia Completo: Estudar no Canadá',
    slug: 'guia-estudar-canada',
    description: 'E-book completo sobre como estudar no Canadá: universidades, vistos, custos, bolsas e caminhos para residência permanente.',
    type: 'ebook',
    price_b2c: 4700,
    price_b2b: 3700,
    currency: 'BRL',
    download_url: 'https://storage.olcan.com.br/products/ebook-canada.pdf',
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: true,
    files: [
      { name: 'Guia Canadá 2026.pdf', size: 3500000, type: 'application/pdf' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/ebook-canada-cover.jpg'
    ],
    tags: ['canada', 'ebook', 'study-abroad', 'guide'],
    download_count: 543,
    purchase_count: 512,
    created_at: '2025-06-10T10:00:00Z',
    updated_at: '2026-03-15T12:00:00Z'
  },
  {
    id: 'prod_ebook_europa',
    title: 'Guia Completo: Estudar na Europa',
    slug: 'guia-estudar-europa',
    description: 'Guia abrangente cobrindo Alemanha, Portugal, Holanda, Espanha e França. Programas gratuitos, bolsas Erasmus, processo de visto e custo de vida.',
    type: 'ebook',
    price_b2c: 5700,
    price_b2b: 4500,
    currency: 'BRL',
    download_url: 'https://storage.olcan.com.br/products/ebook-europa.pdf',
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: false,
    files: [
      { name: 'Guia Europa 2026.pdf', size: 4200000, type: 'application/pdf' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/ebook-europa-cover.jpg'
    ],
    tags: ['europe', 'ebook', 'study-abroad', 'guide', 'erasmus'],
    download_count: 312,
    purchase_count: 298,
    created_at: '2025-08-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z'
  },
  {
    id: 'prod_course_interview',
    title: 'Curso: Preparação para Entrevistas',
    slug: 'curso-preparacao-entrevistas',
    description: 'Curso em vídeo sobre como se preparar para entrevistas de admissão, bolsas e emprego internacional. Simulações reais, scripts e técnicas avançadas.',
    type: 'course',
    price_b2c: 29700,
    price_b2b: 24700,
    currency: 'BRL',
    download_url: 'https://courses.olcan.com.br/interview-prep',
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: false,
    files: [
      { name: 'Módulo 1 - Fundamentos.mp4', size: 125000000, type: 'video/mp4' },
      { name: 'Módulo 2 - Técnicas STAR.mp4', size: 180000000, type: 'video/mp4' },
      { name: 'Módulo 3 - Simulações Práticas.mp4', size: 210000000, type: 'video/mp4' },
      { name: 'Scripts e Templates.pdf', size: 2500000, type: 'application/pdf' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/course-interview-thumb.jpg'
    ],
    tags: ['course', 'interview', 'video', 'preparation'],
    download_count: 234,
    purchase_count: 221,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2026-02-20T14:00:00Z'
  },
  {
    id: 'prod_rota_internacionalizacao',
    title: 'Rota de Internacionalização - Mentoria Premium',
    slug: 'rota-internacionalizacao',
    description: 'Programa premium de mentoria individualizada para planejar e executar sua mudança internacional. 12 semanas de acompanhamento com mentor dedicado, plano personalizado e acesso a toda rede Olcan.',
    type: 'kit_application',
    price_b2c: 299700,
    price_b2b: 249700,
    currency: 'BRL',
    download_url: null,
    access_duration_days: 365,
    license_type: 'single',
    vendor_id: 'vendor_olcan_official',
    commission_rate: 0,
    is_active: true,
    is_featured: true,
    files: [
      { name: 'Plano de Rota Personalizado.pdf', size: 500000, type: 'application/pdf' },
      { name: 'Acesso à Comunidade Premium.txt', size: 1000, type: 'text/plain' }
    ],
    preview_images: [
      'https://cdn.olcan.com.br/products/rota-thumb.jpg'
    ],
    tags: ['mentoring', 'premium', 'route', 'international', 'personalized'],
    download_count: 89,
    purchase_count: 89,
    created_at: '2025-05-01T10:00:00Z',
    updated_at: '2026-04-01T09:00:00Z'
  }
]
