/**
 * Test Setup Configuration
 * Configures test environment and utilities
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { server } from './mocks/server'

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 10000,
})

// Start the mock server before all tests
beforeAll(() => server.listen())

// Reset request handlers after each test
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url
    setTimeout(() => {
      this.onopen && this.onopen()
    }, 100)
  }
  
  send(data) {
    setTimeout(() => {
      this.onmessage && this.onmessage({ data: JSON.stringify({ type: 'pong' }) })
    }, 50)
  }
  
  close() {}
}

// Mock AudioContext
global.AudioContext = class AudioContext {
  constructor() {
    this.state = 'running'
  }
  
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440, setValue: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    }
  }
  
  createGain() {
    return {
      gain: { value: 1, setValue: () => {} },
      connect: () => {}
    }
  }
  
  resume() {
    return Promise.resolve()
  }
}

// Mock MediaRecorder
global.MediaRecorder = class MediaRecorder {
  constructor(stream) {
    this.stream = stream
    this.state = 'inactive'
  }
  
  start() {
    this.state = 'recording'
    this.onstart && this.onstart()
  }
  
  stop() {
    this.state = 'inactive'
    this.onstop && this.onstop()
  }
  
  pause() {
    this.state = 'paused'
    this.onpause && this.onpause()
  }
  
  resume() {
    this.state = 'recording'
    this.onresume && this.onresume()
  }
}

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: (constraints) => {
    return Promise.resolve({
      getTracks: () => [
        { kind: 'audio', enabled: true },
        { kind: 'video', enabled: true }
      ]
    })
  }
}

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

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn(),
}

// Mock File
global.File = class File {
  constructor(bits, name, options) {
    this.bits = bits
    this.name = name
    this.options = options
    this.size = bits.length
    this.type = options.type
  }
}

// Mock Blob
global.Blob = class Blob {
  constructor(bits, options) {
    this.bits = bits
    this.options = options
    this.size = bits.length
    this.type = options.type
  }
}

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  
  append(name, value) {
    this.data.set(name, value)
  }
  
  get(name) {
    return this.data.get(name)
  }
}

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// Mock console methods for cleaner test output
const originalConsole = { ...console }
beforeEach(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterEach(() => {
  console.error = originalConsole.error
  console.warn = originalConsole.warn
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
})

// Test utilities
export const createMockCompanion = (overrides = {}) => ({
  id: 1,
  name: 'Test Companion',
  archetype: 'strategist',
  level: 1,
  experience_points: 0,
  health: 100,
  happiness: 100,
  energy: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockGuild = (overrides = {}) => ({
  id: 1,
  name: 'Test Guild',
  description: 'A test guild',
  emblem: '🏰',
  color: '#8b5cf6',
  focus_area: 'general',
  member_count: 5,
  level: 1,
  experience_points: 0,
  battles_won: 0,
  battles_lost: 0,
  is_private: false,
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockVideo = (overrides = {}) => ({
  id: 1,
  title: 'Test Video',
  description: 'A test video',
  video_type: 'interview',
  duration_seconds: 180,
  file_path: '/uploads/test.mp4',
  file_size: 50000000,
  thumbnail_path: '/thumbnails/test.jpg',
  recording_date: new Date().toISOString(),
  status: 'recorded',
  youtube_url: null,
  youtube_video_id: null,
  is_public: false,
  view_count: 0,
  like_count: 0,
  comment_count: 0,
  ...overrides
})

export const createMockMarketplaceItem = (overrides = {}) => ({
  id: 1,
  name: 'Test Item',
  description: 'A test item',
  category: 'companion_accessory',
  item_type: 'toy',
  price: 100,
  rarity: 'common',
  effect_type: 'happiness_boost',
  effect_value: 10,
  icon: '🎮',
  is_active: true,
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const act = async (callback: () => void | Promise<void>) => {
  await callback()
}

export const renderWithProviders = (component: React.ReactElement, options = {}) => {
  const Wrapper = ({ children }) => children
  return render(
    <Wrapper>
      {component}
    </Wrapper>,
    options
  )
}

export const createMockStore = (initialState = {}) => {
  return {
    getState: jest.fn(() => initialState),
    setState: jest.fn(),
    subscribe: jest.fn(),
    destroy: jest.fn(),
    ...initialState
  }
}

// Test data factories
export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  ok: status >= 200 && status < 300,
  json: async () => data,
  text: async () => JSON.stringify(data),
})

export const mockApiError = (message: string, status = 400) => ({
  data: { detail: message },
  status,
  ok: false,
  json: async () => ({ detail: message }),
  text: async () => JSON.stringify({ detail: message }),
})

// Environment setup
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000/api/v1/ws'

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
})

afterAll(() => {
  // Clean up any global test configuration
})
