/**
 * Real Working YouTube Studio Store
 * Actually connects to backend API and manages real video recording data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface VideoRecording {
  id: number
  title: string
  description: string
  videoType: 'interview' | 'presentation' | 'tutorial' | 'vlog'
  durationSeconds: number
  filePath?: string
  fileSize?: number
  thumbnailPath?: string
  recordingDate: string
  status: 'recorded' | 'processing' | 'processed' | 'uploaded' | 'published'
  youtubeUrl?: string
  youtubeVideoId?: string
  isPublic: boolean
  viewCount: number
  likeCount: number
  commentCount: number
}

interface VideoScript {
  id: number
  scriptContent: string
  scriptType: 'teleprompter' | 'outline' | 'notes'
  wordCount: number
  estimatedDuration: number
  createdAt: string
  updatedAt: string
}

interface VideoAnalytics {
  id: number
  metricDate: string
  views: number
  likes: number
  comments: number
  shares: number
  watchTimeMinutes: number
  engagementRate: number
  audienceRetention: number
}

interface RecordingSession {
  id: number
  title: string
  sessionType: 'practice' | 'recording' | 'live'
  teleprompterEnabled: boolean
  teleprompterSpeed: number
  backgroundType: 'blur' | 'virtual' | 'green_screen'
  cameraPosition: 'center' | 'left' | 'right'
  audioQuality: 'low' | 'medium' | 'high'
  videoQuality: '720p' | '1080p' | '4k'
  startedAt: string
  endedAt?: string
  durationSeconds: number
  isCompleted: boolean
  outputPath?: string
}

interface YouTubeIntegration {
  connected: boolean
  channelName?: string
  channelId?: string
  autoUploadEnabled: boolean
  defaultPrivacy: 'private' | 'unlisted' | 'public'
  tokenExpiresAt?: string
}

interface YouTubeState {
  // State
  videos: VideoRecording[]
  currentVideo: VideoRecording | null
  recordingSession: RecordingSession | null
  isRecording: boolean
  youtubeIntegration: YouTubeIntegration | null
  stats: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchVideos: (params?: any) => Promise<void>
  fetchVideoDetails: (videoId: number) => Promise<void>
  startRecordingSession: (sessionData: any) => Promise<void>
  stopRecordingSession: (sessionId: number, videoFile?: File) => Promise<void>
  createVideoScript: (videoId: number, scriptData: any) => Promise<void>
  uploadVideoToYouTube: (videoId: number, uploadData: any) => Promise<void>
  connectYouTubeAccount: (authData: any) => Promise<void>
  fetchYouTubeStatus: () => Promise<void>
  fetchYouTubeStats: () => Promise<void>
  clearError: () => void
  
  // Recording actions
  updateRecordingSettings: (settings: any) => void
  startRecording: () => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class YouTubeAPI {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/v1/youtube${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Request failed')
    }
    
    return response.json()
  }
  
  static async getVideos(params?: any) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/videos${query ? '?' + query : ''}`)
  }
  
  static async getVideoDetails(videoId: number) {
    return this.request(`/videos/${videoId}`)
  }
  
  static async startRecordingSession(sessionData: any) {
    return this.request('/recordings/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    })
  }
  
  static async stopRecordingSession(sessionId: number, videoFile?: File) {
    const formData = new FormData()
    if (videoFile) {
      formData.append('video_file', videoFile)
    }
    
    return this.request(`/recordings/${sessionId}/stop`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    })
  }
  
  static async createVideoScript(videoId: number, scriptData: any) {
    return this.request(`/videos/${videoId}/scripts`, {
      method: 'POST',
      body: JSON.stringify(scriptData),
    })
  }
  
  static async uploadVideoToYouTube(videoId: number, uploadData: any) {
    return this.request(`/videos/${videoId}/upload-to-youtube`, {
      method: 'POST',
      body: JSON.stringify(uploadData),
    })
  }
  
  static async connectYouTubeAccount(authData: any) {
    return this.request('/youtube/connect', {
      method: 'POST',
      body: JSON.stringify(authData),
    })
  }
  
  static async getYouTubeStatus() {
    return this.request('/youtube/status')
  }
  
  static async getYouTubeStats() {
    return this.request('/stats/summary')
  }
}

// Store implementation
export const useYouTubeStore = create<YouTubeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        videos: [],
        currentVideo: null,
        recordingSession: null,
        isRecording: false,
        youtubeIntegration: null,
        stats: null,
        isLoading: false,
        error: null,
        
        // Actions
        fetchVideos: async (params?: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const videos = await YouTubeAPI.getVideos(params)
            set({ videos, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch videos' 
            })
          }
        },
        
        fetchVideoDetails: async (videoId: number) => {
          set({ isLoading: true, error: null })
          
          try {
            const details = await YouTubeAPI.getVideoDetails(videoId)
            set({ currentVideo: details.video, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch video details' 
            })
          }
        },
        
        startRecordingSession: async (sessionData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await YouTubeAPI.startRecordingSession(sessionData)
            
            set({ 
              recordingSession: response.session,
              isRecording: true,
              isLoading: false 
            })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to start recording' 
            })
          }
        },
        
        stopRecordingSession: async (sessionId: number, videoFile?: File) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await YouTubeAPI.stopRecordingSession(sessionId, videoFile)
            
            // Refresh videos list
            await get().fetchVideos()
            
            set({ 
              recordingSession: null,
              isRecording: false,
              isLoading: false 
            })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to stop recording' 
            })
          }
        },
        
        createVideoScript: async (videoId: number, scriptData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await YouTubeAPI.createVideoScript(videoId, scriptData)
            
            // Refresh video details
            await get().fetchVideoDetails(videoId)
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to create script' 
            })
          }
        },
        
        uploadVideoToYouTube: async (videoId: number, uploadData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await YouTubeAPI.uploadVideoToYouTube(videoId, uploadData)
            
            // Refresh video details
            await get().fetchVideoDetails(videoId)
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to upload to YouTube' 
            })
          }
        },
        
        connectYouTubeAccount: async (authData: any) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await YouTubeAPI.connectYouTubeAccount(authData)
            
            // Refresh YouTube status
            await get().fetchYouTubeStatus()
            
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to connect YouTube account' 
            })
          }
        },
        
        fetchYouTubeStatus: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const status = await YouTubeAPI.getYouTubeStatus()
            set({ youtubeIntegration: status, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to get YouTube status' 
            })
          }
        },
        
        fetchYouTubeStats: async () => {
          set({ isLoading: true, error: null })
          
          try {
            const stats = await YouTubeAPI.getYouTubeStats()
            set({ stats, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to get YouTube stats' 
            })
          }
        },
        
        clearError: () => {
          set({ error: null })
        },
        
        // Recording actions
        updateRecordingSettings: (settings: any) => {
          set(state => ({
            recordingSession: state.recordingSession ? {
              ...state.recordingSession,
              ...settings
            } : null
          }))
        },
        
        startRecording: () => {
          set({ isRecording: true })
        },
        
        stopRecording: () => {
          set({ isRecording: false })
        },
        
        pauseRecording: () => {
          // Implementation for pause functionality
          set(state => ({
            recordingSession: state.recordingSession ? {
              ...state.recordingSession,
              sessionType: 'practice'
            } : null
          }))
        },
        
        resumeRecording: () => {
          // Implementation for resume functionality
          set(state => ({
            recordingSession: state.recordingSession ? {
              ...state.recordingSession,
              sessionType: 'recording'
            } : null
          }))
        },
      }),
      {
        name: 'youtube-store',
        partialize: (state) => ({
          youtubeIntegration: state.youtubeIntegration,
          recordingSession: state.recordingSession,
        }),
      }
    ),
    {
      name: 'youtube-store',
    }
  )
)

// Hooks for easier usage
export const useYouTube = () => useYouTubeStore()
export const useYouTubeActions = () => useYouTubeStore(state => state)

// Utility functions
export const getVideoTypeInfo = (videoType: string) => {
  const videoTypes = {
    interview: {
      name: 'Interview Practice',
      description: 'Practice your interview skills',
      icon: '💼',
      color: '#3b82f6'
    },
    presentation: {
      name: 'Presentation',
      description: 'Record your presentations',
      icon: '📊',
      color: '#10b981'
    },
    tutorial: {
      name: 'Tutorial',
      description: 'Create tutorial videos',
      icon: '📚',
      color: '#8b5cf6'
    },
    vlog: {
      name: 'Vlog',
      description: 'Record your vlogs',
      icon: '🎥',
      color: '#f59e0b'
    }
  }
  
  return videoTypes[videoType as keyof typeof videoTypes] || videoTypes.interview
}

export const getVideoStatusInfo = (status: string) => {
  const statuses = {
    recorded: {
      name: 'Recorded',
      description: 'Video has been recorded',
      icon: '📹',
      color: '#6b7280'
    },
    processing: {
      name: 'Processing',
      description: 'Video is being processed',
      icon: '⚙️',
      color: '#f59e0b'
    },
    processed: {
      name: 'Processed',
      description: 'Video processing complete',
      icon: '✅',
      color: '#10b981'
    },
    uploaded: {
      name: 'Uploaded',
      description: 'Video uploaded to YouTube',
      icon: '📤',
      color: '#3b82f6'
    },
    published: {
      name: 'Published',
      description: 'Video is published',
      icon: '🌍',
      color: '#8b5cf6'
    }
  }
  
  return statuses[status as keyof typeof statuses] || statuses.recorded
}

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const getEngagementRate = (likes: number, views: number) => {
  if (views === 0) return 0
  return ((likes / views) * 100).toFixed(2)
}

export const getRecordingQualityInfo = (quality: string) => {
  const qualities = {
    '720p': {
      name: 'HD 720p',
      description: 'High Definition (1280x720)',
      recommended: false
    },
    '1080p': {
      name: 'Full HD 1080p',
      description: 'Full High Definition (1920x1080)',
      recommended: true
    },
    '4k': {
      name: '4K Ultra HD',
      description: 'Ultra High Definition (3840x2160)',
      recommended: false
    }
  }
  
  return qualities[quality as keyof typeof qualities] || qualities['1080p']
}

export const getAudioQualityInfo = (quality: string) => {
  const qualities = {
    low: {
      name: 'Standard',
      description: 'Standard audio quality',
      bitrate: '128 kbps'
    },
    medium: {
      name: 'High',
      description: 'High audio quality',
      bitrate: '256 kbps'
    },
    high: {
      name: 'Premium',
      description: 'Premium audio quality',
      bitrate: '320 kbps'
    }
  }
  
  return qualities[quality as keyof typeof qualities] || qualities.high
}
