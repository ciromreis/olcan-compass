import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, FileEdit, FileText, Lightbulb } from 'lucide-react'
import { useNarratives, useCreateNarrative, type NarrativeType } from '@/hooks/useNarratives'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'

const NARRATIVE_TEMPLATES: Record<string, {
  structure: string;
  placeholder: string;
  tips: string[];
  wordRange: string;
}> = {
  motivation_letter: {
    structure: '1. Por que este programa/instituição?\n2. Sua trajetória relevante\n3. Conexão entre suas experiências e o programa\n4. O que você trará de único\n5. Seus objetivos futuros',
    placeholder: 'Prezada Comissão de Seleção,\n\nDesde [evento/momento marcante], meu interesse por [área] se transformou em compromisso. Ao longo de [X anos], desenvolvi [competências] através de [experiências concretas].\n\nEste programa me atrai especialmente por [razão específica vinculada ao currículo/docente/projeto]...',
    tips: [
      'Seja específico sobre POR QUE esta instituição (cite projetos, professores, valores)',
      'Mostre evidências concretas, não apenas afirmações genéricas',
      'Conecte passado → presente → futuro de forma lógica',
      'Evite clichês como "desde criança sempre sonhei"',
    ],
    wordRange: '500–800 palavras',
  },
  personal_statement: {
    structure: '1. Abertura com gancho narrativo\n2. Momento de virada / descoberta\n3. Experiências formativas (2-3 exemplos concretos)\n4. Reflexão sobre crescimento\n5. Visão de futuro e contribuição',
    placeholder: '[Comece com uma cena, momento ou pergunta que captura quem você é]\n\nFoi durante [experiência concreta] que percebi [insight]. Essa descoberta me levou a [ação/decisão].\n\nAo longo de [período], três experiências moldaram minha perspectiva: [exemplo 1], [exemplo 2] e [exemplo 3]...',
    tips: [
      'Comece com um "gancho" — uma cena, momento ou pergunta intrigante',
      'Mostre, não conte: use exemplos específicos com detalhes sensoriais',
      'Mantenha um fio condutor que conecte todas as partes',
      'Termine projetando como você usará o que aprendeu',
    ],
    wordRange: '600–1000 palavras',
  },
  cover_letter: {
    structure: '1. Posição e como soube da vaga\n2. Qualificações-chave (match com requisitos)\n3. Realizações relevantes com métricas\n4. Por que esta organização\n5. Chamada para ação',
    placeholder: 'Prezado(a) [Nome do Recrutador],\n\nEscrevo para expressar meu interesse na posição de [cargo] na [organização], conforme divulgada em [fonte].\n\nCom [X anos] de experiência em [área], destaco [realização 1 com métrica] e [realização 2 com métrica]...',
    tips: [
      'Adapte CADA carta à vaga específica — nunca use um texto genérico',
      'Use métricas e números sempre que possível',
      'Demonstre conhecimento sobre a organização',
      'Mantenha em 1 página (300-400 palavras)',
    ],
    wordRange: '300–400 palavras',
  },
  research_proposal: {
    structure: '1. Título e resumo do projeto\n2. Contexto e estado da arte\n3. Lacuna na literatura / problema\n4. Metodologia proposta\n5. Cronograma e resultados esperados\n6. Relevância e impacto',
    placeholder: 'Título: [Título provisório do projeto]\n\nResumo: Este projeto propõe investigar [tema] através de [abordagem], contribuindo para [campo] ao [resultado esperado].\n\nContexto: A literatura atual sobre [tema] demonstra que [estado da arte]. No entanto, [lacuna identificada]...',
    tips: [
      'Demonstre domínio da literatura existente',
      'Seja preciso na metodologia — mostre que é viável',
      'Conecte com a linha de pesquisa do orientador/grupo',
      'Inclua cronograma realista com marcos verificáveis',
    ],
    wordRange: '1000–2000 palavras',
  },
  scholarship_essay: {
    structure: '1. Sua história e motivação\n2. Desafios superados\n3. Impacto da bolsa na sua trajetória\n4. Como retribuirá / impacto social\n5. Compromisso com excelência',
    placeholder: '[Sua história começa aqui — o que te trouxe até este ponto?]\n\nVindo de [contexto], enfrentei [desafio concreto]. Para superá-lo, [ação tomada e resultado].\n\nEsta bolsa representaria [impacto específico na sua trajetória]...',
    tips: [
      'Seja autêntico — comitês detectam histórias fabricadas',
      'Mostre resiliência com exemplos reais, não vitimismo',
      'Explique o impacto CONCRETO da bolsa (não apenas "seria um sonho")',
      'Conecte sua história com os valores da instituição/bolsa',
    ],
    wordRange: '500–800 palavras',
  },
  cv_summary: {
    structure: '1. Título profissional\n2. Anos de experiência e área\n3. Principais competências (3-5)\n4. Realização de destaque\n5. Objetivo atual',
    placeholder: '[Sua profissão] com [X anos] de experiência em [área principal]. Especializado em [competência 1], [competência 2] e [competência 3]. Destaque para [realização principal com métrica]. Buscando [objetivo].',
    tips: [
      'Mantenha em 3-5 linhas no máximo',
      'Use palavras-chave da área/vaga',
      'Inclua pelo menos uma métrica de resultado',
      'Adapte para cada contexto de uso',
    ],
    wordRange: '50–150 palavras',
  },
  other: {
    structure: '1. Contexto e propósito\n2. Conteúdo principal\n3. Conclusão',
    placeholder: 'Escreva aqui seu documento...',
    tips: [
      'Defina claramente o propósito do documento',
      'Mantenha a estrutura clara e organizada',
      'Revise antes de submeter',
    ],
    wordRange: 'Variável',
  },
}

/**
 * Narratives Dashboard — list and manage personal statements and essays.
 */
export function NarrativesDashboard() {
  const navigate = useNavigate()
  const narrativesQuery = useNarratives()
  const createNarrativeMutation = useCreateNarrative()
  const narratives = narrativesQuery.data || []
  const isLoading = narrativesQuery.isLoading
  const error = narrativesQuery.error
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNarrativeTitle, setNewNarrativeTitle] = useState('')
  const [newNarrativeType, setNewNarrativeType] = useState<NarrativeType>('personal_statement')
  const [newNarrativeContent, setNewNarrativeContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showStructure, setShowStructure] = useState(true)

  const handleCreate = async () => {
    if (!newNarrativeTitle.trim() || !newNarrativeContent.trim()) return

    setIsCreating(true)
    try {
      const narrative = await createNarrativeMutation.mutateAsync({
        title: newNarrativeTitle,
        narrative_type: newNarrativeType,
        content: newNarrativeContent,
      })
      setIsCreateModalOpen(false)
      setNewNarrativeTitle('')
      setNewNarrativeContent('')
      navigate(`/narratives/${narrative.id}`)
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Erro ao carregar narrativas. Tente novamente.
      </Alert>
    )
  }

  const narrativeTypeLabels = {
    motivation_letter: 'Carta de Motivação',
    personal_statement: 'Declaração Pessoal',
    cover_letter: 'Carta de Apresentação',
    research_proposal: 'Proposta de Pesquisa',
    scholarship_essay: 'Ensaio de Bolsa',
    cv_summary: 'Resumo de CV',
    other: 'Outro',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">
            Narrativas
          </h1>
          <p className="text-body text-slate mt-1">
            Crie e refine suas histórias para aplicações
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Nova Narrativa
        </Button>
      </div>

      {!narratives || narratives.length === 0 ? (
        /* Empty State */
        <Card>
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title="Nenhuma narrativa criada"
            description="Comece escrevendo sua primeira narrativa para se destacar em suas aplicações."
            onAction={() => setIsCreateModalOpen(true)}
            actionLabel="Criar Narrativa"
          />
        </Card>
      ) : (
        /* Narratives Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {narratives.map((narrative: any, index: number) => (
            <motion.div
              key={narrative.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-cyan/30 transition-colors cursor-pointer group">
                <div
                  className="p-6 h-full flex flex-col"
                  onClick={() => navigate(`/narratives/${narrative.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-blue/10 text-cyan group-hover:bg-primary-blue/20 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge variant="default">
                      {narrativeTypeLabels[narrative.narrative_type as keyof typeof narrativeTypeLabels] || narrative.narrative_type}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-h4 text-white mb-2 group-hover:text-cyan transition-colors line-clamp-2">
                      {narrative.title}
                    </h3>
                    <p className="text-body-sm text-slate mb-4">
                      {narrative.version_count || 0} versões
                      {typeof narrative.latest_overall_score === 'number' ? ` • Score ${Math.round(narrative.latest_overall_score)}/100` : ''}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-body-sm text-slate">
                      <Clock className="w-4 h-4" />
                      {new Date(narrative.updated_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <FileEdit className="w-5 h-5 text-cyan group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Narrativa"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={newNarrativeTitle}
            onChange={(e) => setNewNarrativeTitle(e.target.value)}
            placeholder="Ex: Declaração Pessoal - MIT"
            autoFocus
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-silver">
              Tipo de Narrativa
            </label>
            <Select
              value={newNarrativeType}
              onChange={(value) => {
                const val = (Array.isArray(value) ? value[0] : value) as NarrativeType
                setNewNarrativeType(val)
                setShowStructure(true)
              }}
              placeholder="Selecione um tipo..."
              options={[
                { value: 'motivation_letter', label: 'Carta de Motivação' },
                { value: 'personal_statement', label: 'Declaração Pessoal' },
                { value: 'cover_letter', label: 'Carta de Apresentação' },
                { value: 'research_proposal', label: 'Proposta de Pesquisa' },
                { value: 'scholarship_essay', label: 'Ensaio de Bolsa' },
                { value: 'cv_summary', label: 'Resumo de CV' },
                { value: 'other', label: 'Outro' },
              ]}
            />
          </div>

          {/* Template Guidance */}
          {showStructure && NARRATIVE_TEMPLATES[newNarrativeType] && (
            <div className="rounded-xl border border-cyan/20 bg-primary-blue/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-cyan" />
                  <span className="text-body-sm font-semibold text-cyan">
                    Guia de Estrutura
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{NARRATIVE_TEMPLATES[newNarrativeType].wordRange}</Badge>
                  <button
                    type="button"
                    onClick={() => setShowStructure(false)}
                    className="text-xs text-slate hover:text-silver transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
              </div>
              <pre className="text-body-sm text-silver whitespace-pre-wrap font-sans">
                {NARRATIVE_TEMPLATES[newNarrativeType].structure}
              </pre>
              <div className="space-y-1 pt-1 border-t border-white/10">
                <p className="text-caption font-semibold text-slate">Dicas:</p>
                {NARRATIVE_TEMPLATES[newNarrativeType].tips.map((tip, i) => (
                  <p key={i} className="text-caption text-slate flex items-start gap-1.5">
                    <span className="text-cyan mt-0.5">•</span>
                    {tip}
                  </p>
                ))}
              </div>
              {!newNarrativeContent.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setNewNarrativeContent(NARRATIVE_TEMPLATES[newNarrativeType].placeholder)
                  }
                >
                  Usar template como ponto de partida
                </Button>
              )}
            </div>
          )}

          <Textarea
            label="Primeiro rascunho"
            value={newNarrativeContent}
            onChange={(e) => setNewNarrativeContent(e.target.value)}
            placeholder={
              NARRATIVE_TEMPLATES[newNarrativeType]?.placeholder ||
              'Escreva aqui sem se censurar. A forja serve para lapidar depois.'
            }
            helperText={`Dica: comece com 3 fatos + 1 motivação + 1 prova. Meta: ${NARRATIVE_TEMPLATES[newNarrativeType]?.wordRange || '500+ palavras'}`}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!newNarrativeTitle.trim() || !newNarrativeContent.trim()}
              fullWidth
            >
              Criar Narrativa
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
