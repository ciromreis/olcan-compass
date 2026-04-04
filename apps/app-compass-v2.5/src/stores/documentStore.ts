/**
 * Document Store - Narrative Forge State Management
 */

import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface Document {
  id: string
  user_id: string
  title: string
  document_type: string
  status: string
  content: string
  content_html?: string
  target_character_count?: number
  min_character_count?: number
  max_character_count?: number
  current_character_count: number
  target_word_count?: number
  current_word_count: number
  ats_score?: number
  ats_keywords: string[]
  ats_suggestions: string[]
  polish_count: number
  last_polished_at?: string
  version: number
  is_latest_version: boolean
  parent_version_id?: string
  tags: string[]
  notes?: string
  focus_mode_time_seconds: number
  created_at: string
  updated_at: string
  last_edited_at?: string
}

export interface PolishRequest {
  id: string
  document_id: string
  status: string
  original_content: string
  polished_content?: string
  suggestions: any[]
  changes_made: any[]
  model_used?: string
  tokens_used?: number
  processing_time_ms?: number
  created_at: string
  completed_at?: string
}

export interface CharacterCount {
  character_count: number
  word_count: number
  target_character_count?: number
  min_character_count?: number
  max_character_count?: number
  is_within_limits: boolean
  characters_over?: number
  characters_under?: number
  percentage_complete?: number
}

interface DocumentStore {
  // State
  documents: Document[]
  currentDocument: Document | null
  polishHistory: PolishRequest[]
  characterCount: CharacterCount | null
  isLoading: boolean
  error: string | null
  
  // Focus mode
  isFocusMode: boolean
  focusStartTime: number | null
  
  // Actions
  fetchDocuments: (params?: any) => Promise<void>
  fetchDocument: (documentId: string) => Promise<void>
  createDocument: (data: any) => Promise<Document>
  updateDocument: (documentId: string, data: any) => Promise<void>
  deleteDocument: (documentId: string) => Promise<void>
  
  // Polish
  polishDocument: (documentId: string, instructions?: string) => Promise<void>
  fetchPolishHistory: (documentId: string) => Promise<void>
  submitPolishFeedback: (documentId: string, polishId: string, feedback: any) => Promise<void>
  
  // Character counting
  updateCharacterCount: (documentId: string, content: string) => Promise<void>
  
  // Focus mode
  startFocusMode: () => void
  endFocusMode: (documentId: string) => Promise<void>
  
  // Utility
  setCurrentDocument: (document: Document | null) => void
  clearError: () => void
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  documents: [],
  currentDocument: null,
  polishHistory: [],
  characterCount: null,
  isLoading: false,
  error: null,
  isFocusMode: false,
  focusStartTime: null,

  // Fetch documents
  fetchDocuments: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.listDocuments(params)
      set({ documents: response.documents, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Fetch single document
  fetchDocument: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      const document = await apiClient.getDocument(documentId)
      set({ currentDocument: document, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Create document
  createDocument: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const document = await apiClient.createDocument(data)
      set((state) => ({
        documents: [document, ...state.documents],
        currentDocument: document,
        isLoading: false,
      }))
      return document
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Update document
  updateDocument: async (documentId, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await apiClient.updateDocument(documentId, data)
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updated : doc
        ),
        currentDocument: state.currentDocument?.id === documentId ? updated : state.currentDocument,
        isLoading: false,
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteDocument(documentId)
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
        currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument,
        isLoading: false,
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Polish document
  polishDocument: async (documentId, instructions) => {
    set({ isLoading: true, error: null })
    try {
      const polishRequest = await apiClient.polishDocument(documentId, {
        instructions,
        preserve_voice: true,
      })
      set((state) => ({
        polishHistory: [polishRequest, ...state.polishHistory],
        isLoading: false,
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Fetch polish history
  fetchPolishHistory: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      const history = await apiClient.getPolishHistory(documentId)
      set({ polishHistory: history, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Submit polish feedback
  submitPolishFeedback: async (documentId, polishId, feedback) => {
    try {
      await apiClient.submitPolishFeedback(documentId, polishId, feedback)
      set((state) => ({
        polishHistory: state.polishHistory.map((req) =>
          req.id === polishId ? { ...req, user_accepted: feedback.accepted } : req
        ),
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Update character count
  updateCharacterCount: async (documentId, content) => {
    try {
      const count = await apiClient.updateCharacterCount(documentId, content)
      set({ characterCount: count })
    } catch (error: any) {
      console.error('Failed to update character count:', error)
    }
  },

  // Start focus mode
  startFocusMode: () => {
    set({ isFocusMode: true, focusStartTime: Date.now() })
  },

  // End focus mode
  endFocusMode: async (documentId) => {
    const { focusStartTime } = get()
    if (!focusStartTime) return

    const durationSeconds = Math.floor((Date.now() - focusStartTime) / 1000)
    
    try {
      await apiClient.trackFocusSession(documentId, durationSeconds)
      set({ isFocusMode: false, focusStartTime: null })
    } catch (error: any) {
      console.error('Failed to track focus session:', error)
      set({ isFocusMode: false, focusStartTime: null })
    }
  },

  // Set current document
  setCurrentDocument: (document) => {
    set({ currentDocument: document })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
