import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Navigate } from 'react-router-dom'

export function ContentManagement() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('templates')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Restrict access to admins
  if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role || '')) {
    return <Navigate to="/" replace />
  }

  const mockTemplates = [
    { id: '1', name: 'Mestrado nos EUA', type: 'route', items: 12 },
    { id: '2', name: 'Preparação IELTS', type: 'sprint', items: 8 },
  ]

  const mockQuestions = [
    { id: '1', text: 'Conte sobre sua experiência...', category: 'behavioral', difficulty: 'medium' },
    { id: '2', text: 'Por que escolheu esta área?', category: 'motivational', difficulty: 'easy' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">Gerenciamento de Conteúdo</h1>
          <p className="text-body text-neutral-300 mt-1">
            Gerencie templates, perguntas e conteúdo do sistema
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />} iconPosition="left"
        >
          Novo Item
        </Button>
      </div>

      <Tabs
        items={[
          { value: 'templates', label: 'Templates', content: null },
          { value: 'questions', label: 'Perguntas', content: null },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'templates' && (
        <Card>
          <Table
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'type', label: 'Tipo' },
              { key: 'items', label: 'Itens' },
              {
                key: 'actions',
                label: 'Ações',
                render: () => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={mockTemplates}
            keyExtractor={(row) => row.id}
          />
        </Card>
      )}

      {activeTab === 'questions' && (
        <Card>
          <Table
            columns={[
              { key: 'text', label: 'Pergunta' },
              { key: 'category', label: 'Categoria' },
              { key: 'difficulty', label: 'Dificuldade' },
              {
                key: 'actions',
                label: 'Ações',
                render: () => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={mockQuestions}
            keyExtractor={(row) => row.id}
          />
        </Card>
      )}

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Novo ${activeTab === 'templates' ? 'Template' : 'Pergunta'}`}
      >
        <div className="space-y-4">
          {activeTab === 'templates' ? (
            <>
              <Input placeholder="Nome do template" />
              <Select
                value="route"
                onChange={() => {}}
                options={[
                  { value: 'route', label: 'Rota' },
                  { value: 'sprint', label: 'Sprint' },
                ]}
              />
              <Input placeholder="Descrição do template" />
            </>
          ) : (
            <>
              <Input placeholder="Texto da pergunta" />
              <Select
                value="behavioral"
                onChange={() => {}}
                options={[
                  { value: 'behavioral', label: 'Comportamental' },
                  { value: 'technical', label: 'Técnica' },
                  { value: 'motivational', label: 'Motivacional' },
                ]}
              />
              <Select
                value="medium"
                onChange={() => {}}
                options={[
                  { value: 'easy', label: 'Fácil' },
                  { value: 'medium', label: 'Médio' },
                  { value: 'hard', label: 'Difícil' },
                ]}
              />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button fullWidth>Criar</Button>
            <Button fullWidth variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
