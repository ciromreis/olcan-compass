import { useEffect, useMemo, useRef, useState } from 'react'
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

  const conversationId = selectedConversation ?? ''
  const conversationMessagesQuery = getConversation(conversationId)
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedConversation && conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0]?.id ?? null)
    }
  }, [conversations, selectedConversation])

  const selectedConv = useMemo(
    () => conversations?.find((c: ConversationItem) => c.id === selectedConversation),
    [conversations, selectedConversation]
  )

  useEffect(() => {
    if (conversationMessagesQuery.isFetching || conversationMessagesQuery.isLoading) return
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversationMessagesQuery.isFetching, conversationMessagesQuery.isLoading, conversationMessagesQuery.data])

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

  const handleSend = () => {
    const trimmed = messageText.trim()
    if (!trimmed || !selectedConversation) return

    sendMessage(
      { conversationId: selectedConversation, content: trimmed },
      { onSuccess: () => setMessageText('') }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Mensagens</h1>
        <p className="text-body text-slate mt-1">
          Converse com provedores de serviços
        </p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <Card className="liquid-glass" noPadding>
          <div className="p-8">
            <EmptyState
              icon={<MessageSquare className="w-12 h-12" />}
              title="Nenhuma conversa"
              description="Você ainda não iniciou nenhuma conversa."
            />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 liquid-glass" noPadding>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-h4 text-white">Conversas</h2>
                <div className="text-caption text-slate">
                  {conversations.length} ativa{conversations.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {conversations.map((conv: ConversationItem) => {
                  const isActive = selectedConversation === conv.id
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConversation(conv.id)}
                      aria-selected={isActive}
                      className={[
                        'w-full text-left p-3 rounded-xl border transition-colors',
                        isActive
                          ? 'bg-primary-blue/10 border-cyan/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={conv.provider_avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm text-white font-medium truncate">
                            {conv.provider_name}
                          </p>
                          <p className="text-caption text-slate truncate">
                            {conv.last_message || '—'}
                          </p>
                        </div>
                        {(conv.unread_count ?? 0) > 0 && (
                          <Badge variant="error" size="sm">
                            {conv.unread_count ?? 0}
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 liquid-glass" noPadding>
            {selectedConv ? (
              <div className="flex flex-col h-[70vh] min-h-[520px]">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar src={selectedConv.provider_avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-body text-white font-medium truncate">
                        {selectedConv.provider_name}
                      </p>
                      <p className="text-caption text-slate truncate">
                        {selectedConv.last_message || 'Conversa aberta'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {conversationMessagesQuery.isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(conversationMessagesQuery?.data ?? []).map((msg: ConversationMessage) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={[
                              'max-w-[80%] p-3 rounded-2xl border',
                              msg.is_from_user
                                ? 'bg-primary-blue/20 border-cyan/30 text-white'
                                : 'bg-white/5 border-white/10 text-silver',
                            ].join(' ')}
                          >
                            <p className="text-body-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-caption text-slate mt-1">
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
                      <div ref={scrollAnchorRef} />
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Digite sua mensagem…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                    />
                    <Button onClick={handleSend} disabled={!messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[70vh] min-h-[520px]">
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
