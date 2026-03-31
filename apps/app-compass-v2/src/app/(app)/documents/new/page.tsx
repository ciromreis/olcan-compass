/**
 * New Document Page
 * 
 * Template selection and document creation wizard.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'linkedin_profile' | 'personal_statement' | 'career_summary'

interface Template {
  id: string
  name: string
  description: string
  document_type: DocumentType
  is_premium: boolean
  difficulty_level: string
  industry_tags: string[]
  preview_image?: string
}

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: string; description: string }[] = [
  {
    type: 'resume',
    label: 'Resume',
    icon: '📄',
    description: 'Professional resume for job applications'
  },
  {
    type: 'cover_letter',
    label: 'Cover Letter',
    icon: '✉️',
    description: 'Personalized cover letter for specific roles'
  },
  {
    type: 'portfolio',
    label: 'Portfolio',
    icon: '💼',
    description: 'Showcase your work and projects'
  },
  {
    type: 'linkedin_profile',
    label: 'LinkedIn Profile',
    icon: '🔗',
    description: 'Optimize your LinkedIn presence'
  },
  {
    type: 'personal_statement',
    label: 'Personal Statement',
    icon: '📝',
    description: 'Tell your professional story'
  },
  {
    type: 'career_summary',
    label: 'Career Summary',
    icon: '📊',
    description: 'Comprehensive career overview'
  }
]

export default function NewDocumentPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'template' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Mock templates - would fetch from API
  const templates: Template[] = [
    {
      id: 'modern-resume',
      name: 'Modern Professional',
      description: 'Clean, modern design perfect for tech and creative roles',
      document_type: 'resume',
      is_premium: false,
      difficulty_level: 'beginner',
      industry_tags: ['tech', 'creative']
    },
    {
      id: 'executive-resume',
      name: 'Executive',
      description: 'Sophisticated layout for senior positions',
      document_type: 'resume',
      is_premium: true,
      difficulty_level: 'advanced',
      industry_tags: ['business', 'executive']
    },
    {
      id: 'minimal-resume',
      name: 'Minimalist',
      description: 'Simple, elegant design that focuses on content',
      document_type: 'resume',
      is_premium: false,
      difficulty_level: 'beginner',
      industry_tags: ['all']
    }
  ]

  const filteredTemplates = selectedType
    ? templates.filter(t => t.document_type === selectedType)
    : []

  const handleCreateDocument = async () => {
    setIsCreating(true)
    
    try {
      // TODO: Call API to create document
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: documentTitle,
          document_type: selectedType,
          template_id: selectedTemplate
        })
      })

      if (response.ok) {
        const document = await response.json()
        router.push(`/documents/${document.id}`)
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-silver-50 to-navy-50 p-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/documents">
            <button className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">Create New Document</h1>
          <p className="text-foreground/60">
            Sua Aura está pronta para forjar sua carreira.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {['type', 'template', 'details'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s
                    ? 'bg-purple-500 text-white'
                    : ['type', 'template'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-foreground/10 text-foreground/40'
                }`}>
                  {['type', 'template'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm capitalize ${
                  step === s ? 'text-foreground' : 'text-foreground/40'
                }`}>
                  {s}
                </span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-foreground/20" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Choose Document Type</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOCUMENT_TYPES.map((type) => (
                  <motion.button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left p-6 rounded-2xl border-2 transition-all ${
                      selectedType === type.type
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-foreground/10 bg-white/50 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                    <p className="text-sm text-foreground/60">{type.description}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <GlassButton
                  onClick={() => setStep('template')}
                  disabled={!selectedType}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </motion.div>
          )}

          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Select Template</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Start from Scratch Option */}
                <motion.button
                  onClick={() => setSelectedTemplate(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectedTemplate === null
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-foreground/10 bg-white/50 hover:border-purple-300'
                  }`}
                >
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="font-semibold mb-1">Start from Scratch</h3>
                  <p className="text-sm text-foreground/60">Build with AI assistance</p>
                </motion.button>

                {/* Template Options */}
                {filteredTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-foreground/10 bg-white/50 hover:border-purple-300'
                    }`}
                  >
                    {template.is_premium && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium mb-2">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-foreground/60 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.industry_tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-foreground/5 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <GlassButton
                  onClick={() => setStep('type')}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </GlassButton>
                <GlassButton
                  onClick={() => setStep('details')}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Document Details</h2>
              
              <GlassCard className="p-8 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g., Software Engineer Resume - Google"
                      className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-400 mb-1">
                          AI Companion Assistance
                        </h4>
                        <p className="text-sm text-foreground/70">
                          Sua Aura ajudará você a criar conteúdo convincente, sugerir melhorias 
                          e garantir que sua voz profissional ressoe globalmente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-foreground/5 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="space-y-1 text-sm text-foreground/70">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">
                          {DOCUMENT_TYPES.find(t => t.type === selectedType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Template:</span>
                        <span className="font-medium">
                          {selectedTemplate 
                            ? templates.find(t => t.id === selectedTemplate)?.name
                            : 'From Scratch'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-between mt-8">
                <GlassButton
                  onClick={() => setStep('template')}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </GlassButton>
                <GlassButton
                  onClick={handleCreateDocument}
                  disabled={!documentTitle.trim() || isCreating}
                  className="flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Document
                    </>
                  )}
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
