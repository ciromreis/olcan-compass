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

type InterviewQuestionItem = {
  id: string
  text: string
  category: string
  difficulty: string
}

export function QuestionBank() {
  const { questions, isLoading, error } = useInterviews()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Banco de Perguntas</h1>
        <p className="text-body text-neutral-300 mt-1">
          Explore e pratique perguntas de entrevista
        </p>
      </div>

      <Card>
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
              onChange={(value) => setCategoryFilter(value as string)}
              options={[
                { value: 'all', label: 'Todas as categorias' },
                { value: 'behavioral', label: 'Comportamental' },
                { value: 'technical', label: 'Técnica' },
                { value: 'situational', label: 'Situacional' },
              ]}
            />
            <Select
              value={difficultyFilter}
              onChange={(value) => setDifficultyFilter(value as string)}
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
        <Card>
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
              <Card className="hover:border-lumina/40 transition-colors">
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
                    <Button size="sm">Praticar</Button>
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
