import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

type ConversationItem = {
  id: string
  provider_name: string
  provider_avatar?: string
  last_message?: string
  unread_count?: number
}

type ConversationMessage = {
  id: string
  content: string
  created_at?: string
  is_from_user: boolean
}

export function Messages() {
  const { conversations, sendMessage, getConversation, isLoading, error } = useMarketplace()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')

  const conversationMessagesQuery = getConversation(selectedConversation ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar mensagens. Tente novamente.</Alert>
  }

  const selectedConv = conversations?.find((c: ConversationItem) => c.id === selectedConversation)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Mensagens</h1>
        <p className="text-body text-neutral-300 mt-1">
          Converse com provedores de serviços
        </p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="Nenhuma conversa"
            description="Você ainda não iniciou nenhuma conversa."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <div className="p-4">
              <h2 className="font-heading text-h4 text-white mb-4">Conversas</h2>
              <div className="space-y-2">
                {conversations.map((conv: ConversationItem) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-lumina/10 border border-lumina/30'
                        : 'bg-neutral-700/30 hover:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={conv.provider_avatar}  size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-white font-medium truncate">
                          {conv.provider_name}
                        </p>
                        <p className="text-caption text-neutral-400 truncate">
                          {conv.last_message}
                        </p>
                      </div>
                      {(conv.unread_count ?? 0) > 0 && (
                        <Badge variant="error" size="sm">
                          {conv.unread_count ?? 0}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            {selectedConv ? (
              <div className="flex flex-col h-[600px]">
                <div className="p-4 border-b border-neutral-600/30">
                  <div className="flex items-center gap-3">
                    <Avatar src={selectedConv.provider_avatar}  size="sm" />
                    <p className="text-body text-white font-medium">{selectedConv.provider_name}</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {(conversationMessagesQuery?.data ?? []).map((msg: ConversationMessage) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.is_from_user
                              ? 'bg-lumina text-white'
                              : 'bg-neutral-700/50 text-neutral-200'
                          }`}
                        >
                          <p className="text-body-sm">{msg.content}</p>
                          <p className="text-caption text-neutral-400 mt-1">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '--:--'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-600/30">
                  <div className="flex items-center gap-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && messageText.trim()) {
                          sendMessage({ conversationId: selectedConversation!, content: messageText })
                          setMessageText('')
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (messageText.trim()) {
                          sendMessage({ conversationId: selectedConversation!, content: messageText })
                          setMessageText('')
                        }
                      }}
                      disabled={!messageText.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <EmptyState
                  icon={<MessageSquare className="w-12 h-12" />}
                  title="Selecione uma conversa"
                  description="Escolha uma conversa para começar a mensagem."
                />
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
