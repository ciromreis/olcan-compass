import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { useInterviews } from '@/hooks/useInterviews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

type InterviewQuestionItem = {
  id: string
  text: string
  category: string
  difficulty: string
}

export function QuestionBank() {
  const navigate = useNavigate()
  const { questions, startSessionAsync, isLoading, error } = useInterviews()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar perguntas. Tente novamente.</Alert>
  }

  const filteredQuestions = questions?.filter((q: InterviewQuestionItem) => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handlePractice = async (question: InterviewQuestionItem) => {
    const session = await startSessionAsync({
      session_type: 'mock',
      estimated_duration_minutes: 20,
      question_count: 1,
      focus_types: question.category ? [question.category] : undefined,
    })
    const sessionId = (session as any)?.id
    if (sessionId) navigate(`/interviews/session/${sessionId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Banco de Perguntas</h1>
        <p className="text-body text-neutral-300 mt-1">
          Explore e pratique perguntas de entrevista
        </p>
      </div>

      <Card className="liquid-glass">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar perguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todas as categorias' },
                { value: 'behavioral', label: 'Comportamental' },
                { value: 'technical', label: 'Técnica' },
                { value: 'situational', label: 'Situacional' },
              ]}
            />
            <Select
              value={difficultyFilter}
              onChange={(value) => setDifficultyFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todas as dificuldades' },
                { value: 'easy', label: 'Fácil' },
                { value: 'medium', label: 'Médio' },
                { value: 'hard', label: 'Difícil' },
              ]}
            />
          </div>
        </div>
      </Card>

      {!filteredQuestions || filteredQuestions.length === 0 ? (
        <Card className="liquid-glass">
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="Nenhuma pergunta encontrada"
            description="Ajuste os filtros para ver mais perguntas."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question: InterviewQuestionItem, index: number) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="liquid-glass hover:border-lumina/40 transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-body text-white mb-2">{question.text}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{question.category}</Badge>
                        <Badge
                          variant={
                            question.difficulty === 'easy'
                              ? 'success'
                              : question.difficulty === 'hard'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePractice(question)}
                      icon={<MaterialSymbol name="play_arrow" size={18} />}
                      iconPosition="left"
                    >
                      Praticar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
