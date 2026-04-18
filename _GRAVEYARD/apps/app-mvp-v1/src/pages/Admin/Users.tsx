import { useState } from 'react'
import { Search, Edit } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Navigate } from 'react-router-dom'

export function AdminUsers() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Restrict access to admins
  if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role || '')) {
    return <Navigate to="/" replace />
  }

  const mockUsers = [
    { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'USER', status: 'active' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'PROVIDER', status: 'active' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', role: 'USER', status: 'inactive' },
  ]

  const roleColors = {
    USER: 'default',
    PROVIDER: 'warning',
    ORG_ADMIN: 'error',
    SUPER_ADMIN: 'error',
  } as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">Gerenciamento de Usuários</h1>
          <p className="text-body text-neutral-300 mt-1">
            Visualize e gerencie contas de usuários
          </p>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value="all"
              onChange={() => {}}
              options={[
                { value: 'all', label: 'Todos os status' },
                { value: 'active', label: 'Ativos' },
                { value: 'inactive', label: 'Inativos' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            {
              key: 'role',
              label: 'Função',
              render: (value) => (
                <Badge variant={roleColors[value as keyof typeof roleColors]}>{value}</Badge>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <Badge variant={value === 'active' ? 'success' : 'default'}>
                  {value === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Ações',
              render: (_, row) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUser(row)}
                  icon={<Edit className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Editar
                </Button>
              ),
            },
          ]}
          data={mockUsers}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      />

      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Editar Usuário"
      >
        {selectedUser && (
          <div className="space-y-4">
            <Input value={selectedUser.name} onChange={() => {}} />
            <Input value={selectedUser.email} onChange={() => {}} />
            <Select
              value={selectedUser.role}
              onChange={() => {}}
              options={[
                { value: 'USER', label: 'Usuário' },
                { value: 'PROVIDER', label: 'Provedor' },
                { value: 'ORG_ADMIN', label: 'Admin Organização' },
              ]}
            />
            <div className="flex gap-3 pt-4">
              <Button fullWidth>Salvar Alterações</Button>
              <Button fullWidth variant="ghost" onClick={() => setSelectedUser(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
