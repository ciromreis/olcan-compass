/**
 * Performance Store - Application Performance Monitoring
 * Tracks and optimizes application performance metrics
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
interface PerformanceMetric {
  id: string
  timestamp: string
  type: 'render' | 'api' | 'memory' | 'network' | 'interaction' | 'custom'
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'fps' | 'count' | 'percentage'
  threshold?: number
  metadata?: Record<string, any>
}

interface PerformanceAlert {
  id: string
  timestamp: string
  type: 'warning' | 'error' | 'critical'
  metric: string
  message: string
  value: number
  threshold: number
  resolved: boolean
  resolvedAt?: string
}

interface PerformanceReport {
  id: string
  timestamp: string
  period: 'hour' | 'day' | 'week' | 'month'
  metrics: {
    averageRenderTime: number
    averageApiTime: number
    memoryUsage: number
    errorRate: number
    uptime: number
    userSatisfaction: number
  }
  trends: {
    improving: string[]
    degrading: string[]
    stable: string[]
  }
  recommendations: string[]
}

interface PerformanceState {
  // Metrics collection
  metrics: PerformanceMetric[]
  alerts: PerformanceAlert[]
  reports: PerformanceReport[]
  
  // Real-time monitoring
  currentMetrics: {
    renderTime: number
    apiTime: number
    memoryUsage: number
    networkLatency: number
    fps: number
    errorCount: number
  }
  
  // Performance thresholds
  thresholds: {
    renderTime: number
    apiTime: number
    memoryUsage: number
    networkLatency: number
    fps: number
    errorRate: number
  }
  
  // Monitoring status
  isMonitoring: boolean
  monitoringInterval: number
  lastUpdate: string
  
  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
  recordMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void
  checkThresholds: () => void
  generateReport: (period: 'hour' | 'day' | 'week' | 'month') => PerformanceReport
  optimizePerformance: () => void
  clearMetrics: () => void
  updateThresholds: (thresholds: Partial<PerformanceState['thresholds']>) => void
  
  // Analytics
  getPerformanceScore: () => number
  getTrends: (metric: string, period: 'hour' | 'day' | 'week') => Array<{ timestamp: string; value: number }>
  getBottlenecks: () => Array<{ metric: string; impact: string; recommendation: string }>
}

// Store implementation
export const usePerformanceStore = create<PerformanceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      metrics: [],
      alerts: [],
      reports: [],
      currentMetrics: {
        renderTime: 0,
        apiTime: 0,
        memoryUsage: 0,
        networkLatency: 0,
        fps: 60,
        errorCount: 0
      },
      thresholds: {
        renderTime: 16.67, // 60fps
        apiTime: 1000,
        memoryUsage: 100 * 1024 * 1024, // 100MB
        networkLatency: 500,
        fps: 30,
        errorRate: 0.05 // 5%
      },
      isMonitoring: false,
      monitoringInterval: 5000, // 5 seconds
      lastUpdate: new Date().toISOString(),
      
      // Actions
      startMonitoring: () => {
        if (get().isMonitoring) return
        
        set({ isMonitoring: true })
        
        // Start performance monitoring
        const interval = setInterval(() => {
          get().collectCurrentMetrics()
          get().checkThresholds()
        }, get().monitoringInterval)
        
        // Store interval ID for cleanup
        ;(window as any).performanceInterval = interval
        
        // Monitor render performance
        get().monitorRenderPerformance()
        
        // Monitor API performance
        get().monitorApiPerformance()
        
        // Monitor memory usage
        get().monitorMemoryUsage()
        
        // Monitor network performance
        get().monitorNetworkPerformance()
      },
      
      stopMonitoring: () => {
        set({ isMonitoring: false })
        
        // Clear monitoring interval
        const interval = (window as any).performanceInterval
        if (interval) {
          clearInterval(interval)
          delete (window as any).performanceInterval
        }
      },
      
      recordMetric: (metricData) => {
        const metric: PerformanceMetric = {
          id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          ...metricData
        }
        
        set(state => ({
          metrics: [...state.metrics, metric]
        }))
        
        // Check if metric exceeds threshold
        if (metricData.threshold && metric.value > metricData.threshold) {
          get().createAlert(metric)
        }
      },
      
      collectCurrentMetrics: () => {
        const state = get()
        
        // Collect current performance metrics
        const currentMetrics = {
          renderTime: state.currentMetrics.renderTime,
          apiTime: state.currentMetrics.apiTime,
          memoryUsage: state.getMemoryUsage(),
          networkLatency: state.getNetworkLatency(),
          fps: state.getCurrentFPS(),
          errorCount: state.currentMetrics.errorCount
        }
        
        set({
          currentMetrics,
          lastUpdate: new Date().toISOString()
        })
      },
      
      checkThresholds: () => {
        const state = get()
        const { currentMetrics, thresholds } = state
        
        // Check each metric against thresholds
        Object.entries(currentMetrics).forEach(([key, value]) => {
          const threshold = thresholds[key as keyof typeof thresholds]
          if (threshold && value > threshold) {
            get().createAlert({
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: value > threshold * 2 ? 'critical' : 'warning',
              metric: key,
              message: `${key} exceeded threshold: ${value} > ${threshold}`,
              value,
              threshold,
              resolved: false
            })
          }
        })
      },
      
      generateReport: (period) => {
        const state = get()
        const now = new Date()
        const periodMs = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        }[period]
        
        const cutoffTime = new Date(now.getTime() - periodMs)
        const recentMetrics = state.metrics.filter(m => new Date(m.timestamp) > cutoffTime)
        
        const report: PerformanceReport = {
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          period,
          metrics: {
            averageRenderTime: get().calculateAverage(recentMetrics.filter(m => m.type === 'render')),
            averageApiTime: get().calculateAverage(recentMetrics.filter(m => m.type === 'api')),
            memoryUsage: state.currentMetrics.memoryUsage,
            errorRate: state.calculateErrorRate(recentMetrics),
            uptime: get().calculateUptime(recentMetrics),
            userSatisfaction: get().calculateUserSatisfaction(recentMetrics)
          },
          trends: {
            improving: [],
            degrading: [],
            stable: []
          },
          recommendations: get().generateRecommendations(recentMetrics)
        }
        
        set(state => ({
          reports: [...state.reports, report]
        }))
        
        return report
      },
      
      optimizePerformance: () => {
        // Implement performance optimization strategies
        const recommendations = get().generateRecommendations(get().metrics)
        
        recommendations.forEach(rec => {
          switch (rec) {
            case 'Reduce render time':
              get().optimizeRenderPerformance()
              break
            case 'Optimize API calls':
              get().optimizeApiPerformance()
              break
            case 'Reduce memory usage':
              get().optimizeMemoryUsage()
              break
            case 'Improve network performance':
              get().optimizeNetworkPerformance()
              break
          }
        })
      },
      
      clearMetrics: () => {
        set({
          metrics: [],
          alerts: [],
          currentMetrics: {
            renderTime: 0,
            apiTime: 0,
            memoryUsage: 0,
            networkLatency: 0,
            fps: 60,
            errorCount: 0
          }
        })
      },
      
      updateThresholds: (newThresholds) => {
        set(state => ({
          thresholds: { ...state.thresholds, ...newThresholds }
        }))
      },
      
      getPerformanceScore: () => {
        const state = get()
        const { currentMetrics, thresholds } = state
        
        let score = 100
        
        // Calculate score based on how close metrics are to thresholds
        Object.entries(currentMetrics).forEach(([key, value]) => {
          const threshold = thresholds[key as keyof typeof thresholds]
          if (threshold) {
            const ratio = value / threshold
            if (ratio > 1) {
              score -= Math.min(50, (ratio - 1) * 25)
            }
          }
        })
        
        return Math.max(0, Math.round(score))
      },
      
      getTrends: (metric, period) => {
        const state = get()
        const periodMs = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000
        }[period]
        
        const cutoffTime = new Date(Date.now() - periodMs)
        const relevantMetrics = state.metrics.filter(m => 
          m.name === metric && new Date(m.timestamp) > cutoffTime
        )
        
        return relevantMetrics.map(m => ({
          timestamp: m.timestamp,
          value: m.value
        }))
      },
      
      getBottlenecks: () => {
        const state = get()
        const bottlenecks = []
        
        Object.entries(state.currentMetrics).forEach(([key, value]) => {
          const threshold = state.thresholds[key as keyof typeof thresholds]
          if (threshold && value > threshold) {
            bottlenecks.push({
              metric: key,
              impact: `${((value / threshold - 1) * 100).toFixed(1)}% over threshold`,
              recommendation: get().getRecommendationForMetric(key)
            })
          }
        })
        
        return bottlenecks.sort((a, b) => 
          parseFloat(b.impact) - parseFloat(a.impact)
        )
      },
      
      // Private methods
      createAlert: (metric: PerformanceMetric) => {
        const alert: PerformanceAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: metric.value! > (metric.threshold || 0) * 2 ? 'critical' : 'warning',
          metric: metric.name,
          message: `${metric.name} exceeded threshold: ${metric.value} > ${metric.threshold}`,
          value: metric.value!,
          threshold: metric.threshold || 0,
          resolved: false
        }
        
        set(state => ({
          alerts: [...state.alerts, alert]
        }))
      },
      
      monitorRenderPerformance: () => {
        if (typeof window === 'undefined') return
        
        // Monitor frame rate
        let lastTime = performance.now()
        let frames = 0
        
        const measureFPS = () => {
          frames++
          const currentTime = performance.now()
          
          if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime))
            
            get().recordMetric({
              type: 'custom',
              name: 'fps',
              value: fps,
              unit: 'fps',
              threshold: 30
            })
            
            frames = 0
            lastTime = currentTime
          }
          
          if (get().isMonitoring) {
            requestAnimationFrame(measureFPS)
          }
        }
        
        requestAnimationFrame(measureFPS)
      },
      
      monitorApiPerformance: () => {
        // Override fetch to measure API performance
        const originalFetch = window.fetch
        
        window.fetch = async (...args) => {
          const startTime = performance.now()
          
          try {
            const response = await originalFetch(...args)
            const endTime = performance.now()
            const duration = endTime - startTime
            
            get().recordMetric({
              type: 'api',
              name: 'api_call',
              value: duration,
              unit: 'ms',
              threshold: 1000,
              metadata: {
                url: args[0] as string,
                status: response.status
              }
            })
            
            return response
          } catch (error) {
            const endTime = performance.now()
            const duration = endTime - startTime
            
            get().recordMetric({
              type: 'api',
              name: 'api_error',
              value: duration,
              unit: 'ms',
              threshold: 1000,
              metadata: {
                url: args[0] as string,
                error: (error as Error).message
              }
            })
            
            throw error
          }
        }
      },
      
      monitorMemoryUsage: () => {
        if (typeof window === 'undefined' || !(performance as any).memory) return
        
        const measureMemory = () => {
          const memory = (performance as any).memory
          
          get().recordMetric({
            type: 'memory',
            name: 'memory_usage',
            value: memory.usedJSHeapSize,
            unit: 'bytes',
            threshold: 100 * 1024 * 1024, // 100MB
            metadata: {
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit
            }
          })
          
          if (get().isMonitoring) {
            setTimeout(measureMemory, 5000)
          }
        }
        
        measureMemory()
      },
      
      monitorNetworkPerformance: () => {
        if (typeof window === 'undefined' || !(navigator as any).connection) return
        
        const measureNetwork = () => {
          const connection = (navigator as any).connection
          
          get().recordMetric({
            type: 'network',
            name: 'network_latency',
            value: connection.rtt || 0,
            unit: 'ms',
            threshold: 500,
            metadata: {
              downlink: connection.downlink,
              effectiveType: connection.effectiveType,
              saveData: connection.saveData
            }
          })
          
          if (get().isMonitoring) {
            setTimeout(measureNetwork, 10000)
          }
        }
        
        measureNetwork()
      },
      
      // Helper methods
      getMemoryUsage: () => {
        if (typeof window !== 'undefined' && (performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize
        }
        return 0
      },
      
      getNetworkLatency: () => {
        if (typeof window !== 'undefined' && (navigator as any).connection) {
          return (navigator as any).connection.rtt || 0
        }
        return 0
      },
      
      getCurrentFPS: () => {
        // This would be calculated from the render monitoring
        return get().currentMetrics.fps
      },
      
      calculateAverage: (metrics: PerformanceMetric[]) => {
        if (metrics.length === 0) return 0
        const sum = metrics.reduce((acc, m) => acc + m.value, 0)
        return sum / metrics.length
      },
      
      calculateErrorRate: (metrics: PerformanceMetric[]) => {
        const errorMetrics = metrics.filter(m => m.type === 'error')
        const totalMetrics = metrics.filter(m => m.type === 'api')
        if (totalMetrics.length === 0) return 0
        return (errorMetrics.length / totalMetrics.length) * 100
      },
      
      calculateUptime: (metrics: PerformanceMetric[]) => {
        // Calculate uptime based on successful operations
        const successfulOps = metrics.filter(m => m.type !== 'error').length
        const totalOps = metrics.length
        if (totalOps === 0) return 100
        return (successfulOps / totalOps) * 100
      },
      
      calculateUserSatisfaction: (metrics: PerformanceMetric[]) => {
        // Calculate satisfaction based on performance metrics
        const avgRenderTime = get().calculateAverage(metrics.filter(m => m.type === 'render'))
        const avgApiTime = get().calculateAverage(metrics.filter(m => m.type === 'api'))
        
        // Simple satisfaction calculation
        let satisfaction = 100
        
        if (avgRenderTime > 16.67) satisfaction -= 20
        if (avgApiTime > 1000) satisfaction -= 15
        
        return Math.max(0, satisfaction)
      },
      
      generateRecommendations: (metrics: PerformanceMetric[]) => {
        const recommendations = []
        
        const avgRenderTime = get().calculateAverage(metrics.filter(m => m.type === 'render'))
        const avgApiTime = get().calculateAverage(metrics.filter(m => m.type === 'api'))
        const avgMemory = get().calculateAverage(metrics.filter(m => m.type === 'memory'))
        
        if (avgRenderTime > 16.67) recommendations.push('Reduce render time')
        if (avgApiTime > 1000) recommendations.push('Optimize API calls')
        if (avgMemory > 100 * 1024 * 1024) recommendations.push('Reduce memory usage')
        
        return recommendations
      },
      
      getRecommendationForMetric: (metric: string) => {
        const recommendations = {
          renderTime: 'Optimize component rendering and reduce re-renders',
          apiTime: 'Implement caching and reduce API call frequency',
          memoryUsage: 'Clean up unused objects and implement memory pooling',
          networkLatency: 'Optimize network requests and implement offline support',
          fps: 'Reduce animation complexity and optimize rendering',
          errorCount: 'Improve error handling and implement retry mechanisms'
        }
        
        return recommendations[metric as keyof typeof recommendations] || 'Monitor and optimize performance'
      },
      
      optimizeRenderPerformance: () => {
        // Implement render optimization strategies
      },
      
      optimizeApiPerformance: () => {
        // Implement API optimization strategies
      },
      
      optimizeMemoryUsage: () => {
        // Implement memory optimization strategies
      },
      
      optimizeNetworkPerformance: () => {
        // Implement network optimization strategies
      }
    }),
    {
      name: 'performance-store'
    }
  )
)

// Hooks for easier usage
export const usePerformance = () => usePerformanceStore()
export const usePerformanceActions = () => usePerformanceStore(state => state)

// React hook for automatic performance monitoring
export const usePerformanceMonitor = () => {
  const startMonitoring = usePerformanceStore(state => state.startMonitoring)
  const stopMonitoring = usePerformanceStore(state => state.stopMonitoring)
  
  React.useEffect(() => {
    startMonitoring()
    
    return () => {
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring])
}

// Performance tracking utilities
export const performance = {
  track: (name: string, value: number, unit: 'ms' | 'bytes' | 'fps' | 'count' | 'percentage' = 'ms') => {
    usePerformanceStore.getState().recordMetric({
      type: 'custom',
      name,
      value,
      unit
    })
  },
  
  measure: (name: string, fn: () => void | Promise<void>) => {
    const startTime = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now()
        usePerformanceStore.getState().recordMetric({
          type: 'custom',
          name,
          value: endTime - startTime,
          unit: 'ms'
        })
      })
    } else {
      const endTime = performance.now()
      usePerformanceStore.getState().recordMetric({
        type: 'custom',
        name,
        value: endTime - startTime,
        unit: 'ms'
      })
    }
  },
  
  getScore: () => usePerformanceStore.getState().getPerformanceScore(),
  
  getBottlenecks: () => usePerformanceStore.getState().getBottlenecks()
}
