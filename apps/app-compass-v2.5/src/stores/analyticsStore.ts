/**
 * Analytics Store - User Behavior and Application Performance Tracking
 * Comprehensive analytics system for Olcan Compass
 */

import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
interface AnalyticsEvent {
  id: string
  timestamp: string
  type: 'page_view' | 'user_action' | 'feature_usage' | 'performance' | 'error' | 'conversion'
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
  userId?: number
  sessionId: string
  userAgent?: string
  url?: string
  referrer?: string
}

interface UserSession {
  id: string
  userId?: number
  startTime: string
  endTime?: string
  duration?: number
  pageViews: number
  actions: number
  features: string[]
  conversions: string[]
  errors: number
  device: string
  browser: string
  os: string
  screenResolution: string
  timezone: string
  language: string
}

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  memoryUsage: number
  connectionType: string
  effectiveConnectionType: string
}

interface AnalyticsState {
  // Events and sessions
  events: AnalyticsEvent[]
  sessions: UserSession[]
  currentSession: UserSession | null
  
  // Performance metrics
  performanceMetrics: PerformanceMetrics[]
  
  // User behavior analytics
  userBehavior: {
    mostUsedFeatures: Array<{ feature: string; count: number }>
    userJourney: Array<{ step: string; timestamp: string; duration?: number }>
    conversionRates: Record<string, number>
    retentionRates: Record<string, number>
    engagementMetrics: {
      dailyActiveUsers: number
      weeklyActiveUsers: number
      monthlyActiveUsers: number
      averageSessionDuration: number
      bounceRate: number
    }
  }
  
  // Configuration
  config: {
    enableTracking: boolean
    enablePerformanceTracking: boolean
    enableErrorTracking: boolean
    samplingRate: number
    batchSize: number
    flushInterval: number
  }
  
  // Actions
  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => void
  trackPageView: (page: string, properties?: Record<string, any>) => void
  trackUserAction: (action: string, properties?: Record<string, any>) => void
  trackFeatureUsage: (feature: string, properties?: Record<string, any>) => void
  trackPerformance: (metrics: Partial<PerformanceMetrics>) => void
  trackError: (error: Error, properties?: Record<string, any>) => void
  trackConversion: (conversion: string, properties?: Record<string, any>) => void
  
  // Session management
  startSession: () => void
  endSession: () => void
  updateSession: (updates: Partial<UserSession>) => void
  
  // Analytics processing
  processEvents: () => void
  generateReport: (type: 'user_behavior' | 'performance' | 'engagement' | 'conversion') => any
  exportData: (format: 'json' | 'csv') => string
  
  // Configuration
  updateConfig: (config: Partial<AnalyticsState['config']>) => void
  enableTracking: () => void
  disableTracking: () => void

  // Internal/Private methods
  sendEventsToService: (events: AnalyticsEvent[]) => Promise<void>
  convertToCSV: (data: any) => string
}

// Store implementation
export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        events: [],
        sessions: [],
        currentSession: null,
        performanceMetrics: [],
        userBehavior: {
          mostUsedFeatures: [],
          userJourney: [],
          conversionRates: {},
          retentionRates: {},
          engagementMetrics: {
            dailyActiveUsers: 0,
            weeklyActiveUsers: 0,
            monthlyActiveUsers: 0,
            averageSessionDuration: 0,
            bounceRate: 0
          }
        },
        config: {
          enableTracking: true,
          enablePerformanceTracking: true,
          enableErrorTracking: true,
          samplingRate: 1.0,
          batchSize: 50,
          flushInterval: 30000 // 30 seconds
        },
        
        // Actions
        trackEvent: (eventData) => {
          const state = get()
          
          if (!state.config.enableTracking) return
          
          // Apply sampling
          if (Math.random() > state.config.samplingRate) return
          
          const event: AnalyticsEvent = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            sessionId: state.currentSession?.id || 'no_session',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            referrer: typeof window !== 'undefined' ? document.referrer : undefined,
            ...eventData
          }
          
          set(state => ({
            events: [...state.events, event]
          }))
          
          // Update current session
          if (state.currentSession) {
            get().updateSession({
              actions: state.currentSession.actions + 1
            })
          }
          
          // Process events if batch size reached
          if (state.events.length >= state.config.batchSize) {
            get().processEvents()
          }
        },
        
        trackPageView: (page, properties = {}) => {
          get().trackEvent({
            type: 'page_view',
            category: 'navigation',
            action: 'page_view',
            label: page,
            properties
          })
          
          // Update session page views
          if (get().currentSession) {
            get().updateSession({
              pageViews: get().currentSession!.pageViews + 1
            })
          }
        },
        
        trackUserAction: (action, properties = {}) => {
          get().trackEvent({
            type: 'user_action',
            category: 'interaction',
            action,
            properties
          })
        },
        
        trackFeatureUsage: (feature, properties = {}) => {
          get().trackEvent({
            type: 'feature_usage',
            category: 'feature',
            action: 'used',
            label: feature,
            properties
          })
          
          // Update most used features
          const state = get()
          const featureIndex = state.userBehavior.mostUsedFeatures.findIndex(f => f.feature === feature)
          
          if (featureIndex >= 0) {
            const updatedFeatures = [...state.userBehavior.mostUsedFeatures]
            updatedFeatures[featureIndex].count += 1
            updatedFeatures.sort((a, b) => b.count - a.count)
            
            set(state => ({
              userBehavior: {
                ...state.userBehavior,
                mostUsedFeatures: updatedFeatures
              }
            }))
          } else {
            set(state => ({
              userBehavior: {
                ...state.userBehavior,
                mostUsedFeatures: [...state.userBehavior.mostUsedFeatures, { feature, count: 1 }]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
              }
            }))
          }
          
          // Update session features
          if (state.currentSession) {
            const features = [...state.currentSession.features]
            if (!features.includes(feature)) {
              features.push(feature)
              get().updateSession({ features })
            }
          }
        },
        
        trackPerformance: (metrics) => {
          if (!get().config.enablePerformanceTracking) return
          
          const performanceMetrics: PerformanceMetrics = {
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            firstInputDelay: 0,
            cumulativeLayoutShift: 0,
            memoryUsage: 0,
            connectionType: 'unknown',
            effectiveConnectionType: 'unknown',
            ...metrics
          }
          
          set(state => ({
            performanceMetrics: [...state.performanceMetrics, performanceMetrics]
          }))
          
          get().trackEvent({
            type: 'performance',
            category: 'performance',
            action: 'metrics',
            properties: performanceMetrics
          })
        },
        
        trackError: (error, properties = {}) => {
          if (!get().config.enableErrorTracking) return
          
          get().trackEvent({
            type: 'error',
            category: 'error',
            action: 'error_occurred',
            label: error.name,
            value: 1,
            properties: {
              message: error.message,
              stack: error.stack,
              ...properties
            }
          })
          
          // Update session error count
          if (get().currentSession) {
            get().updateSession({
              errors: get().currentSession!.errors + 1
            })
          }
        },
        
        trackConversion: (conversion, properties = {}) => {
          get().trackEvent({
            type: 'conversion',
            category: 'conversion',
            action: 'completed',
            label: conversion,
            value: 1,
            properties
          })
          
          // Update session conversions
          if (get().currentSession) {
            const conversions = [...get().currentSession!.conversions]
            if (!conversions.includes(conversion)) {
              conversions.push(conversion)
              get().updateSession({ conversions })
            }
          }
        },
        
        startSession: () => {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const session: UserSession = {
            id: sessionId,
            startTime: new Date().toISOString(),
            pageViews: 0,
            actions: 0,
            features: [],
            conversions: [],
            errors: 0,
            device: getDeviceType(),
            browser: getBrowser(),
            os: getOS(),
            screenResolution: getScreenResolution(),
            timezone: getTimezone(),
            language: getLanguage()
          }
          
          set({ currentSession: session })
          
          // Track session start
          get().trackEvent({
            type: 'user_action',
            category: 'session',
            action: 'session_start',
            properties: {
              device: session.device,
              browser: session.browser,
              os: session.os
            }
          })
        },
        
        endSession: () => {
          const state = get()
          if (!state.currentSession) return
          
          const endTime = new Date().toISOString()
          const duration = new Date(endTime).getTime() - new Date(state.currentSession.startTime).getTime()
          
          const completedSession = {
            ...state.currentSession,
            endTime,
            duration
          }
          
          set(state => ({
            sessions: [...state.sessions, completedSession],
            currentSession: null
          }))
          
          // Track session end
          get().trackEvent({
            type: 'user_action',
            category: 'session',
            action: 'session_end',
            value: duration,
            properties: {
              duration,
              pageViews: completedSession.pageViews,
              actions: completedSession.actions,
              features: completedSession.features.length,
              errors: completedSession.errors
            }
          })
        },
        
        updateSession: (updates) => {
          const state = get()
          if (!state.currentSession) return
          
          set({
            currentSession: { ...state.currentSession, ...updates }
          })
        },
        
        processEvents: () => {
          const state = get()
          
          // In production, send events to analytics service
          if (process.env.NODE_ENV === 'production') {
            get().sendEventsToService(state.events)
          }
          
          // Clear processed events
          set({ events: [] })
        },
        
        generateReport: (type) => {
          const state = get()
          
          switch (type) {
            case 'user_behavior':
              return {
                mostUsedFeatures: state.userBehavior.mostUsedFeatures,
                userJourney: state.userBehavior.userJourney,
                averageSessionDuration: state.userBehavior.engagementMetrics.averageSessionDuration
              }
            
            case 'performance':
              const metrics = state.performanceMetrics
              return {
                averagePageLoadTime: metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / metrics.length,
                averageFCP: metrics.reduce((sum, m) => sum + m.firstContentfulPaint, 0) / metrics.length,
                averageLCP: metrics.reduce((sum, m) => sum + m.largestContentfulPaint, 0) / metrics.length
              }
            
            case 'engagement':
              return state.userBehavior.engagementMetrics
            
            case 'conversion':
              return {
                conversionRates: state.userBehavior.conversionRates,
                totalConversions: state.sessions.reduce((sum, s) => sum + s.conversions.length, 0)
              }
            
            default:
              return null
          }
        },
        
        exportData: (format) => {
          const state = get()
          const data = {
            events: state.events,
            sessions: state.sessions,
            userBehavior: state.userBehavior,
            performanceMetrics: state.performanceMetrics
          }
          
          if (format === 'json') {
            return JSON.stringify(data, null, 2)
          } else if (format === 'csv') {
            // Convert to CSV format
            return get().convertToCSV(data)
          }
          
          return ''
        },
        
        updateConfig: (newConfig) => {
          set(state => ({
            config: { ...state.config, ...newConfig }
          }))
        },
        
        enableTracking: () => {
          set(state => ({
            config: { ...state.config, enableTracking: true }
          }))
        },
        
        disableTracking: () => {
          set(state => ({
            config: { ...state.config, enableTracking: false }
          }))
        },
        
        // Private methods
        sendEventsToService: async (events: AnalyticsEvent[]) => {
          try {
            const response = await fetch('/api/v1/analytics/events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ events })
            })
            
            if (!response.ok) {
              console.error('Failed to send analytics events')
            }
          } catch (error) {
            console.error('Error sending analytics events:', error)
          }
        },
        
        convertToCSV: (data: any) => {
          // Convert events to CSV
          const headers = ['id', 'timestamp', 'type', 'category', 'action', 'label', 'value', 'userId']
          const rows = data.events.map((event: AnalyticsEvent) => [
            event.id,
            event.timestamp,
            event.type,
            event.category,
            event.action,
            event.label || '',
            event.value || '',
            event.userId || ''
          ])
          
          return [headers, ...rows].map(row => row.join(',')).join('\n')
        }
      }),
      {
        name: 'analytics-store',
        storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as unknown as Storage)),
        partialize: (state) => ({
          config: state.config,
          userBehavior: state.userBehavior
        })
      }
    ),
    {
      name: 'analytics-store'
    }
  )
)

// Utility functions
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Edge')) return 'edge'
  return 'unknown'
}

function getOS(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent
  if (userAgent.includes('Windows')) return 'windows'
  if (userAgent.includes('Mac')) return 'macos'
  if (userAgent.includes('Linux')) return 'linux'
  if (userAgent.includes('Android')) return 'android'
  if (userAgent.includes('iOS')) return 'ios'
  return 'unknown'
}

function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  return `${window.screen.width}x${window.screen.height}`
}

function getTimezone(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function getLanguage(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  return window.navigator.language || 'unknown'
}

// Hooks for easier usage
export const useAnalytics = () => useAnalyticsStore()
export const useAnalyticsActions = () => useAnalyticsStore(state => state)

// React hook for automatic tracking
export const useAnalyticsTracker = () => {
  const trackPageView = useAnalyticsStore(state => state.trackPageView)
  const startSession = useAnalyticsStore(state => state.startSession)
  const endSession = useAnalyticsStore(state => state.endSession)
  
  React.useEffect(() => {
    // Start session on mount
    startSession()
    
    // Track initial page view
    trackPageView(window.location.pathname)
    
    // End session on unmount
    return () => {
      endSession()
    }
  }, [trackPageView, startSession, endSession])
}

// Performance tracking hook
export const usePerformanceTracker = () => {
  const trackPerformance = useAnalyticsStore(state => state.trackPerformance)
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Track page load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          trackPerformance({
            pageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            firstContentfulPaint: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
          })
        } else if (entry.entryType === 'largest-contentful-paint') {
          trackPerformance({
            largestContentfulPaint: entry.startTime
          })
        } else if (entry.entryType === 'first-input') {
          trackPerformance({
            firstInputDelay: (entry as any).processingStart - entry.startTime
          })
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] })
    
    return () => observer.disconnect()
  }, [trackPerformance])
}

// Convenience functions
export const track = {
  pageView: (page: string, properties?: Record<string, any>) => {
    useAnalyticsStore.getState().trackPageView(page, properties)
  },
  
  action: (action: string, properties?: Record<string, any>) => {
    useAnalyticsStore.getState().trackUserAction(action, properties)
  },
  
  feature: (feature: string, properties?: Record<string, any>) => {
    useAnalyticsStore.getState().trackFeatureUsage(feature, properties)
  },
  
  conversion: (conversion: string, properties?: Record<string, any>) => {
    useAnalyticsStore.getState().trackConversion(conversion, properties)
  },
  
  error: (error: Error, properties?: Record<string, any>) => {
    useAnalyticsStore.getState().trackError(error, properties)
  },
  
  performance: (metrics: Partial<PerformanceMetrics>) => {
    useAnalyticsStore.getState().trackPerformance(metrics)
  }
}
