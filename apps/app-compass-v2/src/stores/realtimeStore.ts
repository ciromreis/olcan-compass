/**
 * Real-time WebSocket Store
 * Manages WebSocket connections and real-time updates
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
interface RealtimeMessage {
  type: string
  data: any
  timestamp: string
}

interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  error?: string
  lastConnected?: string
  reconnectAttempts: number
}

interface RoomSubscription {
  room: string
  subscribed: boolean
  userCount: number
}

interface RealtimeState {
  // Connection
  connectionStatus: ConnectionStatus
  socket: WebSocket | null
  userId: number | null
  
  // Subscriptions
  subscriptions: Map<string, RoomSubscription>
  
  // Messages
  messages: RealtimeMessage[]
  notifications: any[]
  
  // Actions
  connect: (userId: number) => void
  disconnect: () => void
  reconnect: () => void
  
  // Room management
  subscribeToRoom: (room: string) => void
  unsubscribeFromRoom: (room: string) => void
  
  // Messaging
  sendMessage: (type: string, data: any) => void
  sendPing: () => void
  
  // Companion updates
  subscribeToCompanion: (companionId: number) => void
  unsubscribeFromCompanion: (companionId: number) => void
  
  // Guild updates
  subscribeToGuild: (guildId: number) => void
  unsubscribeFromGuild: (guildId: number) => void
  
  // Marketplace updates
  subscribeToMarketplace: () => void
  unsubscribeFromMarketplace: () => void
  
  // Clear messages
  clearMessages: () => void
  clearNotifications: () => void
}

// WebSocket URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws'

// Store implementation
export const useRealtimeStore = create<RealtimeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      connectionStatus: {
        connected: false,
        connecting: false,
        reconnectAttempts: 0
      },
      socket: null,
      userId: null,
      subscriptions: new Map(),
      messages: [],
      notifications: [],
      
      // Connection management
      connect: (userId: number) => {
        const state = get()
        
        if (state.socket && state.connectionStatus.connected) {
          return // Already connected
        }
        
        set({ 
          connecting: true, 
          connectionStatus: { 
            connected: false, 
            connecting: true, 
            reconnectAttempts: state.connectionStatus.reconnectAttempts 
          } 
        })
        
        try {
          const socket = new WebSocket(`${WS_URL}/${userId}`)
          
          socket.onopen = () => {
            set({
              socket,
              userId,
              connectionStatus: {
                connected: true,
                connecting: false,
                lastConnected: new Date().toISOString(),
                reconnectAttempts: 0
              }
            })
            
            // Send initial ping
            get().sendPing()
            
            // Start ping interval
            const pingInterval = setInterval(() => {
              get().sendPing()
            }, 30000) // Ping every 30 seconds
            
            // Store ping interval for cleanup
            ;(socket as any).pingInterval = pingInterval
          }
          
          socket.onmessage = (event) => {
            try {
              const message: RealtimeMessage = JSON.parse(event.data)
              get().handleMessage(message)
            } catch (error) {
              console.error('Error parsing WebSocket message:', error)
            }
          }
          
          socket.onclose = (event) => {
            const state = get()
            
            // Clear ping interval
            if ((state.socket as any)?.pingInterval) {
              clearInterval((state.socket as any).pingInterval)
            }
            
            set({
              socket: null,
              connectionStatus: {
                connected: false,
                connecting: false,
                error: event.code === 1000 ? undefined : 'Connection lost',
                reconnectAttempts: state.connectionStatus.reconnectAttempts
              }
            })
            
            // Attempt reconnection if not a clean close
            if (event.code !== 1000 && state.connectionStatus.reconnectAttempts < 5) {
              setTimeout(() => {
                get().reconnect()
              }, Math.pow(2, state.connectionStatus.reconnectAttempts) * 1000) // Exponential backoff
            }
          }
          
          socket.onerror = (error) => {
            console.error('WebSocket error:', error)
            set({
              connectionStatus: {
                connected: false,
                connecting: false,
                error: 'Connection error',
                reconnectAttempts: get().connectionStatus.reconnectAttempts
              }
            })
          }
          
        } catch (error) {
          console.error('Error creating WebSocket connection:', error)
          set({
            connectionStatus: {
              connected: false,
              connecting: false,
              error: 'Failed to connect',
              reconnectAttempts: get().connectionStatus.reconnectAttempts
            }
          })
        }
      },
      
      disconnect: () => {
        const state = get()
        
        if (state.socket) {
          // Clear ping interval
          if ((state.socket as any)?.pingInterval) {
            clearInterval((state.socket as any).pingInterval)
          }
          
          state.socket.close(1000, 'User disconnected')
          set({
            socket: null,
            connectionStatus: {
              connected: false,
              connecting: false,
              reconnectAttempts: 0
            }
          })
        }
        
        // Clear subscriptions
        set({ subscriptions: new Map() })
      },
      
      reconnect: () => {
        const state = get()
        
        if (state.userId) {
          set({
            connectionStatus: {
              ...state.connectionStatus,
              reconnectAttempts: state.connectionStatus.reconnectAttempts + 1
            }
          })
          
          get().connect(state.userId)
        }
      },
      
      // Room management
      subscribeToRoom: (room: string) => {
        const state = get()
        
        if (!state.connectionStatus.connected) {
          console.warn('Cannot subscribe to room: not connected')
          return
        }
        
        // Update local state
        const newSubscriptions = new Map(state.subscriptions)
        newSubscriptions.set(room, {
          room,
          subscribed: true,
          userCount: (newSubscriptions.get(room)?.userCount || 0) + 1
        })
        
        set({ subscriptions: newSubscriptions })
        
        // Send subscription message
        state.socket?.send(JSON.stringify({
          type: 'subscribe',
          data: { room }
        }))
      },
      
      unsubscribeFromRoom: (room: string) => {
        const state = get()
        
        if (!state.connectionStatus.connected) {
          return
        }
        
        // Update local state
        const newSubscriptions = new Map(state.subscriptions)
        const subscription = newSubscriptions.get(room)
        
        if (subscription) {
          subscription.subscribed = false
          subscription.userCount = Math.max(0, subscription.userCount - 1)
        }
        
        set({ subscriptions: newSubscriptions })
        
        // Send unsubscription message
        state.socket?.send(JSON.stringify({
          type: 'unsubscribe',
          data: { room }
        }))
      },
      
      // Messaging
      sendMessage: (type: string, data: any) => {
        const state = get()
        
        if (!state.connectionStatus.connected || !state.socket) {
          console.warn('Cannot send message: not connected')
          return
        }
        
        state.socket.send(JSON.stringify({
          type,
          data
        }))
      },
      
      sendPing: () => {
        get().sendMessage('ping', { timestamp: new Date().toISOString() })
      },
      
      // Companion updates
      subscribeToCompanion: (companionId: number) => {
        get().subscribeToRoom(`companion_${companionId}`)
      },
      
      unsubscribeFromCompanion: (companionId: number) => {
        get().unsubscribeFromRoom(`companion_${companionId}`)
      },
      
      // Guild updates
      subscribeToGuild: (guildId: number) => {
        get().subscribeToRoom(`guild_${guildId}`)
      },
      
      unsubscribeFromGuild: (guildId: number) => {
        get().unsubscribeFromRoom(`guild_${guildId}`)
      },
      
      // Marketplace updates
      subscribeToMarketplace: () => {
        get().subscribeToRoom('marketplace')
      },
      
      unsubscribeFromMarketplace: () => {
        get().unsubscribeFromRoom('marketplace')
      },
      
      // Message handling
      handleMessage: (message: RealtimeMessage) => {
        const state = get()
        
        // Add to messages
        set(state => ({
          messages: [...state.messages.slice(-99), message] // Keep last 100 messages
        }))
        
        // Handle specific message types
        switch (message.type) {
          case 'pong':
            // Ping response - no action needed
            break
            
          case 'companion_updated':
            // Companion care activity completed
            state.handleCompanionUpdate(message.data)
            break
            
          case 'companion_level_up':
            // Companion leveled up
            state.handleCompanionLevelUp(message.data)
            break
            
          case 'battle_started':
          case 'battle_action':
          case 'battle_ended':
            // Guild battle updates
            state.handleGuildBattleUpdate(message)
            break
            
          case 'purchase_completed':
            // Marketplace purchase completed
            state.handlePurchaseCompleted(message.data)
            break
            
          case 'new_item_added':
            // New item added to marketplace
            state.handleNewItemAdded(message.data)
            break
            
          case 'recording_status_update':
            // Video recording status update
            state.handleRecordingUpdate(message.data)
            break
            
          case 'guild_member_activity':
            // Guild member activity notification
            state.handleGuildMemberActivity(message.data)
            break
            
          case 'companion_notification':
            // Companion notification
            state.handleCompanionNotification(message.data)
            break
            
          default:
            console.log('Unhandled message type:', message.type, message.data)
        }
      },
      
      // Message handlers
      handleCompanionUpdate: (data: any) => {
        // This would typically update the companion store
        console.log('Companion updated:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'companion_update',
            title: 'Companion Activity',
            message: `${data.activity} completed!`,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleCompanionLevelUp: (data: any) => {
        console.log('Companion leveled up:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'level_up',
            title: 'Level Up!',
            message: `Your companion reached level ${data.new_level}!`,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleGuildBattleUpdate: (message: any) => {
        console.log('Guild battle update:', message.data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'guild_battle',
            title: 'Guild Battle Update',
            message: `Battle ${message.data.action}!`,
            data: message.data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handlePurchaseCompleted: (data: any) => {
        console.log('Purchase completed:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'purchase_completed',
            title: 'Purchase Successful',
            message: `You bought ${data.item_name}!`,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleNewItemAdded: (data: any) => {
        console.log('New item added:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'new_item',
            title: 'New Item Available',
            message: `${data.item.name} is now available!`,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleRecordingUpdate: (data: any) => {
        console.log('Recording update:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'recording_update',
            title: 'Recording Update',
            message: `Recording ${data.status}!`,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleGuildMemberActivity: (data: any) => {
        console.log('Guild member activity:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'guild_activity',
            title: 'Guild Activity',
            message: data.activity,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      handleCompanionNotification: (data: any) => {
        console.log('Companion notification:', data)
        
        // Add notification
        set(state => ({
          notifications: [...state.notifications.slice(-9), {
            id: Date.now(),
            type: 'companion_notification',
            title: 'Companion Alert',
            message: data.message,
            data,
            timestamp: new Date().toISOString()
          }]
        }))
      },
      
      // Clear messages
      clearMessages: () => {
        set({ messages: [] })
      },
      
      clearNotifications: () => {
        set({ notifications: [] })
      }
    }),
    {
      name: 'realtime-store'
    }
  )
)

// Hooks for easier usage
export const useRealtime = () => useRealtimeStore()
export const useRealtimeActions = () => useRealtimeStore(state => state)

// Utility functions
export const getConnectionStatusText = (status: ConnectionStatus) => {
  if (status.connecting) return 'Connecting...'
  if (status.connected) return 'Connected'
  if (status.error) return `Error: ${status.error}`
  return 'Disconnected'
}

export const getConnectionStatusColor = (status: ConnectionStatus) => {
  if (status.connecting) return 'text-yellow-500'
  if (status.connected) return 'text-green-500'
  if (status.error) return 'text-red-500'
  return 'text-gray-500'
}

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

// Auto-connect hook
export const useAutoConnect = (userId: number | null) => {
  const { connect, disconnect, connectionStatus } = useRealtimeActions()
  
  // Auto-connect when userId changes
  if (userId && !connectionStatus.connected && !connectionStatus.connecting) {
    connect(userId)
  }
  
  // Disconnect when userId is cleared
  if (!userId && connectionStatus.connected) {
    disconnect()
  }
}
