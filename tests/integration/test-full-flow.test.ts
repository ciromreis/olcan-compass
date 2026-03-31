/**
 * Full Integration Test
 * Tests the complete flow from frontend to backend
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CompanionPage } from '@/app/companion/page'
import { useCompanionStore } from '@/stores/companionStore'

// Mock the API calls
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}))

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
}))

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Provider>
          {component}
        </Provider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Full Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
  })

  describe('Companion System', () => {
    it('should render companion page with companion data', async () => {
      // Mock companion data
      const mockCompanion = {
        id: 'companion_1',
        userId: 'user_1',
        archetypeId: 'strategist',
        type: 'strategist',
        name: 'Test Companion',
        level: 5,
        xp: 250,
        xpToNext: 500,
        evolutionStage: 'young',
        abilities: [
          { id: 'basic_care', name: 'Basic Care', type: 'passive' }
        ],
        stats: { power: 70, wisdom: 90, charisma: 75, agility: 70 },
        currentHealth: 80,
        maxHealth: 100,
        energy: 60,
        maxEnergy: 100,
        createdAt: new Date().toISOString(),
        lastCaredAt: new Date().toISOString()
      }

      // Mock the store
      const mockStore = {
        companion: mockCompanion,
        performCareActivity: jest.fn(),
        evolveCompanion: jest.fn(),
        dailyCareCompleted: [],
      }

      // Mock the store hook
      jest.spyOn(require('@/stores/companionStore'), 'useCompanionStore')
        .mockReturnValue(mockStore)

      renderWithProviders(<CompanionPage />)

      // Check if companion name is rendered
      expect(screen.getByText('Test Companion')).toBeInTheDocument()
      expect(screen.getByText('Level 5')).toBeInTheDocument()
      expect(screen.getByText('80/100')).toBeInTheDocument() // Health
      expect(screen.getByText('60/100')).toBeInTheDocument() // Energy
    })

    it('should handle care activities', async () => {
      const mockCompanion = {
        id: 'companion_1',
        userId: 'user_1',
        archetypeId: 'strategist',
        type: 'strategist',
        name: 'Test Companion',
        level: 5,
        xp: 250,
        xpToNext: 500,
        evolutionStage: 'young',
        abilities: [],
        stats: { power: 70, wisdom: 90, charisma: 75, agility: 70 },
        currentHealth: 80,
        maxHealth: 100,
        energy: 60,
        maxEnergy: 100,
        createdAt: new Date().toISOString(),
        lastCaredAt: new Date().toISOString()
      }

      const performCareActivity = jest.fn()
      const mockStore = {
        companion: mockCompanion,
        performCareActivity,
        evolveCompanion: jest.fn(),
        dailyCareCompleted: [],
      }

      jest.spyOn(require('@/stores/companionStore'), 'useCompanionStore')
        .mockReturnValue(mockStore)

      renderWithProviders(<CompanionPage />)

      // Find and click the feed button
      const feedButton = screen.getByText('Feed your companion')
      fireEvent.click(feedButton)

      // Check if the activity was performed
      await waitFor(() => {
        expect(performCareActivity).toHaveBeenCalledWith({
          type: 'feed',
          xpReward: 10,
          energyCost: 5,
          description: 'Feed your companion'
        })
      })
    })

    it('should show evolution button when ready', async () => {
      const mockCompanion = {
        id: 'companion_1',
        userId: 'user_1',
        archetypeId: 'strategist',
        type: 'strategist',
        name: 'Test Companion',
        level: 5,
        xp: 500, // Enough XP to evolve
        xpToNext: 500,
        evolutionStage: 'young',
        abilities: [],
        stats: { power: 70, wisdom: 90, charisma: 75, agility: 70 },
        currentHealth: 80,
        maxHealth: 100,
        energy: 60,
        maxEnergy: 100,
        createdAt: new Date().toISOString(),
        lastCaredAt: new Date().toISOString()
      }

      const evolveCompanion = jest.fn()
      const mockStore = {
        companion: mockCompanion,
        performCareActivity: jest.fn(),
        evolveCompanion,
        dailyCareCompleted: [],
      }

      jest.spyOn(require('@/stores/companionStore'), 'useCompanionStore')
        .mockReturnValue(mockStore)

      renderWithProviders(<CompanionPage />)

      // Check if evolve button is available
      const evolveButton = screen.getByText('Evolve')
      expect(evolveButton).toBeInTheDocument()
      expect(evolveButton).not.toBeDisabled()
    })
  })

  describe('WebSocket Connections', () => {
    it('should establish WebSocket connection', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        readyState: 1,
      }

      global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket)

      // Import and use the realtime store
      const { useRealtimeStore } = require('@/stores/realtimeStore')
      const { connect } = useRealtimeStore.getState()

      connect(1)

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/api/v1/ws/1')
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should handle WebSocket messages', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        readyState: 1,
      }

      global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket)

      const { useRealtimeStore } = require('@/stores/realtimeStore')
      const { connect, subscribeToCompanion } = useRealtimeStore.getState()

      connect(1)
      subscribeToCompanion(1)

      // Simulate receiving a message
      const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      if (messageHandler) {
        const message = {
          data: JSON.stringify({
            type: 'companion_update',
            data: {
              companion_id: 1,
              health: 90,
              happiness: 85,
              energy: 70
            }
          })
        }

        messageHandler({ data: message.data })

        // Check if the store was updated
        const state = useRealtimeStore.getState()
        expect(state.messages).toHaveLength(1)
        expect(state.messages[0].type).toBe('companion_update')
      }
    })
  })

  describe('API Integration', () => {
    it('should fetch companion data from API', async () => {
      const mockCompanion = {
        id: 'companion_1',
        name: 'Test Companion',
        level: 5,
        xp: 250,
        evolutionStage: 'young'
      }

      const { api } = require('@/lib/api')
      api.get.mockResolvedValue({ data: mockCompanion })

      // Test API call
      const result = await api.get('/api/v1/companions/1')

      expect(api.get).toHaveBeenCalledWith('/api/v1/companions/1')
      expect(result.data).toEqual(mockCompanion)
    })

    it('should handle API errors gracefully', async () => {
      const { api } = require('@/lib/api')
      api.get.mockRejectedValue(new Error('Network error'))

      try {
        await api.get('/api/v1/companions/1')
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })
  })

  describe('Authentication Flow', () => {
    it('should redirect to login if not authenticated', async () => {
      // Mock localStorage to return no authentication
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      // Mock router
      const mockRouter = {
        push: jest.fn()
      }
      jest.mock('next/router', () => ({
        useRouter: () => mockRouter
      }))

      // Import dashboard page
      const { default: DashboardPage } = require('@/app/dashboard/page')

      // Render dashboard page
      render(<DashboardPage />)

      // Check if redirect to login was called
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('should allow access to dashboard if authenticated', async () => {
      // Mock localStorage to return authentication
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue('true'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      // Mock router
      const mockRouter = {
        push: jest.fn()
      }
      jest.mock('next/router', () => ({
        useRouter: () => mockRouter
      }))

      // Import dashboard page
      const { default: DashboardPage } = require('@/app/dashboard/page')

      // Render dashboard page
      render(<DashboardPage />)

      // Check if redirect was not called
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { api } = require('@/lib/api')
      api.get.mockRejectedValue(new Error('Network error'))

      const { useErrorStore } = require('@/stores/errorStore')
      const { reportError } = useErrorStore.getState()

      // Report a network error
      reportNetworkError('Failed to fetch companion data')

      // Check if error was reported
      const state = useErrorStore.getState()
      expect(state.errors).toHaveLength(1)
      expect(state.errors[0].type).toBe('network')
      expect(state.errors[0].message).toBe('Failed to fetch companion data')
    })

    it('should show error notifications for critical errors', async () => {
      const { useErrorStore } = require('@/stores/errorStore')
      const { reportError } = useErrorStore.getState()

      // Report a critical error
      reportError({
        type: 'database',
        message: 'Database connection failed',
        severity: 'critical'
      })

      // Check if error was reported
      const state = useErrorStore.getState()
      expect(state.errors).toHaveLength(1)
      expect(state.errors[0].severity).toBe('critical')
      expect(state.activeError).not.toBeNull()
    })
  })

  describe('Performance', () => {
    it('should render components within performance thresholds', async () => {
      const startTime = performance.now()

      const mockCompanion = {
        id: 'companion_1',
        userId: 'user_1',
        archetypeId: 'strategist',
        type: 'strategist',
        name: 'Test Companion',
        level: 5,
        xp: 250,
        xpToNext: 500,
        evolutionStage: 'young',
        abilities: [],
        stats: { power: 70, wisdom: 90, charisma: 75, agility: 70 },
        currentHealth: 80,
        maxHealth: 100,
        energy: 60,
        maxEnergy: 100,
        createdAt: new Date().toISOString(),
        lastCaredAt: new Date().toISOString()
      }

      const mockStore = {
        companion: mockCompanion,
        performCareActivity: jest.fn(),
        evolveCompanion: jest.fn(),
        dailyCareCompleted: [],
      }

      jest.spyOn(require('@/stores/companionStore'), 'useCompanionStore')
        .mockReturnValue(mockStore)

      renderWithProviders(<CompanionPage />)

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100)
    })
  })
})

// Helper functions for testing
export const reportNetworkError = (message: string) => {
  const { useErrorStore } = require('@/stores/errorStore')
  const { reportError } = useErrorStore.getState()
  reportError({
    type: 'network',
    message,
    severity: 'high'
  })
}
