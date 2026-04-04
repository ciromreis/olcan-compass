/**
 * Document Forge Page - Olcan Compass v2.5
 * 
 * Main page for creating and managing career documents with Aura assistance.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Sparkles,
  Clock,
  CheckCircle,
  Archive,
  ChevronRight
} from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import Link from 'next/link'

type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'linkedin_profile' | 'personal_statement' | 'career_summary'
type DocumentStatus = 'draft' | 'in_review' | 'completed' | 'archived'

interface Document {
  id: string
  title: string
  document_type: DocumentType
  status: DocumentStatus
  updated_at: string
  aura_contribution_score: number
  ai_suggestions_count: number
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  resume: 'Currículo',
  cover_letter: 'Carta de Apresentação',
  portfolio: 'Portfólio',
  linkedin_profile: 'Perfil LinkedIn',
  personal_statement: 'Carta de Motivação',
  career_summary: 'Resumo de Carreira'
}

const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  resume: '📄',
  cover_letter: '✉️',
  portfolio: '💼',
  linkedin_profile: '🔗',
  personal_statement: '📝',
  career_summary: '📊'
}

const STATUS_CONFIG: Record<DocumentStatus, { color: string; icon: typeof Clock; label: string }> = {
  draft: { color: 'text-ink-400', icon: Clock, label: 'Rascunho' },
  in_review: { color: 'text-blue-500', icon: Sparkles, label: 'Em Revisão' },
  completed: { color: 'text-emerald-500', icon: CheckCircle, label: 'Concluído' },
  archived: { color: 'text-ink-300', icon: Archive, label: 'Arquivado' }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Placeholder data aligned with Aura branding
    setDocuments([
      {
        id: '1',
        title: 'Software Engineer Resume - International Focus',
        document_type: 'resume',
        status: 'completed',
        updated_at: new Date().toISOString(),
        aura_contribution_score: 85,
        ai_suggestions_count: 12
      },
      {
        id: '2',
        title: 'Strategic Cover Letter - Big Tech',
        document_type: 'cover_letter',
        status: 'draft',
        updated_at: new Date().toISOString(),
        aura_contribution_score: 45,
        ai_suggestions_count: 5
      }
    ])
    setIsLoading(false)
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.document_type === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-gold-500 animate-spin" />
          <div className="text-caption uppercase tracking-widest text-ink-300 font-semibold">Forjando Documentos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-24 px-4 sm:px-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-caption font-semibold uppercase tracking-[0.25em] text-gold-600">
              <FileText className="w-4 h-4" />
              Manifesto Executivo
            </div>
            <h1 className="text-6xl md:text-8xl font-display text-ink-950 tracking-tighter leading-tight">Document Forge</h1>
            <p className="text-xl text-ink-400 font-medium max-w-2xl">
              Crie narrativas de carreira poderosas com assistência da sua <span className="text-gold-500 font-semibold">Aura</span>.
            </p>
          </div>
          <Link href="/documents/new">
            <GlassButton className="min-w-[220px] h-16 rounded-[2rem] bg-ink-950 text-white font-semibold text-sm uppercase tracking-tight hover:bg-gold-500 hover:text-ink-950 transition-all shadow-xl group">
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
              Novo Documento
            </GlassButton>
          </Link>
        </div>

        {/* Filters & Search - Liquid Glass */}
        <GlassCard className="p-6 rounded-[2.5rem] bg-bone-50/20 border border-bone-500/10 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/40 border border-bone-500/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-ink-950 font-medium placeholder:text-ink-300"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
                className="px-6 py-4 bg-white/40 border border-bone-500/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-ink-950 font-semibold text-xs uppercase tracking-tight cursor-pointer"
              >
                <option value="all">TODOS OS TIPOS</option>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>{label.toUpperCase()}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
                className="px-6 py-4 bg-white/40 border border-bone-500/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-ink-950 font-semibold text-xs uppercase tracking-tight cursor-pointer"
              >
                <option value="all">TODOS OS STATUS</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>{config.label.toUpperCase()}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-white/40 p-1.5 rounded-2xl border border-bone-500/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gold-500 text-ink-950 shadow-sm'
                      : 'text-ink-300 hover:text-ink-950'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-gold-500 text-ink-950 shadow-sm'
                      : 'text-ink-300 hover:text-ink-950'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 bg-bone-50/20 rounded-[4rem] border-2 border-dashed border-bone-500/10"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-ink-950/5 flex items-center justify-center mx-auto mb-8 border border-bone-500/10">
            <FileText className="w-10 h-10 text-ink-100" />
          </div>
          <h3 className="text-3xl font-display text-ink-950 mb-3">
            Nenhum artefato encontrado
          </h3>
          <p className="text-ink-400 font-medium max-w-sm mx-auto mb-10">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Tente ajustar os filtros ou termo de busca para encontrar o documento.'
              : 'Seu inventário de carreira está vazio. Comece a forjar agora.'}
          </p>
          <Link href="/documents/new">
            <GlassButton className="min-w-[200px] h-14 rounded-2xl bg-gold-500 text-ink-950 font-semibold uppercase text-xs tracking-widest hover:scale-105 transition-all">
              <Plus className="w-5 h-5 mr-3" />
              Forjar Documento
            </GlassButton>
          </Link>
        </motion.div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12'
            : 'space-y-6 pb-12'
        }>
          <AnimatePresence mode="popLayout">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                layout
              >
                {viewMode === 'grid' ? (
                  <DocumentCard document={doc} />
                ) : (
                  <DocumentListItem document={doc} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function DocumentCard({ document }: { document: Document }) {
  const statusConfig = STATUS_CONFIG[document.status]
  const StatusIcon = statusConfig.icon

  return (
    <Link href={`/documents/${document.id}`}>
      <GlassCard className="p-8 rounded-[3rem] bg-white border border-bone-500/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-ink-950/5 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
            {DOCUMENT_TYPE_ICONS[document.document_type]}
          </div>
          <div className={`px-4 py-1.5 rounded-full border bg-white shadow-sm flex items-center gap-2 text-caption font-semibold uppercase tracking-tight ${statusConfig.color} border-current/20`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-display text-2xl text-ink-950 mb-3 group-hover:text-gold-500 transition-colors leading-tight">
            {document.title}
          </h3>
          
          <p className="text-xs font-semibold text-ink-300 uppercase tracking-widest mb-6 px-1">
            {DOCUMENT_TYPE_LABELS[document.document_type]}
          </p>
        </div>

        <div className="space-y-6 pt-6 border-t border-bone-500/10">
          {/* Sync Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-caption font-semibold uppercase tracking-widest text-ink-300">Sincronia Aura</span>
              <span className="text-sm font-semibold text-ink-950">{document.aura_contribution_score}%</span>
            </div>
            <div className="h-1.5 bg-ink-950/5 rounded-full overflow-hidden p-0.5 border border-bone-400/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${document.aura_contribution_score}%` }}
                className="h-full bg-gold-400 rounded-full"
                transition={{ duration: 1.5, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-caption font-semibold text-ink-300 uppercase tracking-tight">
              <Clock className="w-3.5 h-3.5" />
              {new Date(document.updated_at).toLocaleDateString()}
            </div>
            {document.ai_suggestions_count > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold-500/10 text-gold-600 text-caption font-semibold uppercase tracking-tight">
                <Sparkles className="w-3 h-3" />
                <span>{document.ai_suggestions_count} Dicas</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

function DocumentListItem({ document }: { document: Document }) {
  const statusConfig = STATUS_CONFIG[document.status]
  const StatusIcon = statusConfig.icon

  return (
    <Link href={`/documents/${document.id}`}>
      <GlassCard className="p-6 rounded-[1.5rem] bg-white border border-bone-500/10 shadow-sm hover:shadow-xl hover:translate-x-1 transition-all duration-500 cursor-pointer group">
        <div className="flex items-center gap-6">
          <div className="text-4xl w-14 h-14 rounded-2xl bg-ink-950/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            {DOCUMENT_TYPE_ICONS[document.document_type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl text-ink-950 group-hover:text-gold-500 transition-colors truncate">
              {document.title}
            </h3>
            <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-1">
              {DOCUMENT_TYPE_LABELS[document.document_type]}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:block w-48 space-y-2">
              <div className="flex justify-between text-[8px] font-semibold uppercase text-ink-200">
                <span>Sincronia</span>
                <span>{document.aura_contribution_score}%</span>
              </div>
              <div className="h-1 bg-ink-950/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${document.aura_contribution_score}%` }}
                  className="h-full bg-gold-400 rounded-full"
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {document.ai_suggestions_count > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-500/10 text-gold-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">{document.ai_suggestions_count}</span>
              </div>
            )}

            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border border-current/20 text-caption font-semibold uppercase tracking-tight ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{statusConfig.label}</span>
            </div>

            <ChevronRight className="w-6 h-6 text-ink-100 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
