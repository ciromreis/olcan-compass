/**
 * Error Handling Store
 * Centralized error management and reporting
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
interface ErrorReport {
  id: string
  timestamp: string
  type: 'network' | 'validation' | 'runtime' | 'auth' | 'database' | 'ui' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: string
  stack?: string
  component?: string
  action?: string
  userId?: number
  sessionId?: string
  userAgent?: string
  url?: string
  resolved: boolean
  resolvedAt?: string
}

interface ErrorState {
  errors: ErrorReport[]
  activeError: ErrorReport | null
  errorCount: number
  
  // Actions
  reportError: (error: Partial<ErrorReport>) => void
  resolveError: (errorId: string) => void
  clearErrors: () => void
  getErrorsByType: (type: string) => ErrorReport[]
  getErrorsBySeverity: (severity: string) => ErrorReport[]
  getUnresolvedErrors: () => ErrorReport[]
  getErrorStats: () => {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    unresolved: number
  }
}

// Store implementation
export const useErrorStore = create<ErrorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      errors: [],
      activeError: null,
      errorCount: 0,
      
      // Actions
      reportError: (errorData: Partial<ErrorReport>) => {
        const error: ErrorReport = {
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: errorData.type || 'unknown',
          severity: errorData.severity || 'medium',
          message: errorData.message || 'Unknown error occurred',
          details: errorData.details,
          stack: errorData.stack,
          component: errorData.component,
          action: errorData.action,
          userId: errorData.userId,
          sessionId: errorData.sessionId,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          resolved: false
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error reported:', error)
        }
        
        // Add to state
        set(state => ({
          errors: [...state.errors, error],
          activeError: error.severity === 'critical' ? error : state.activeError,
          errorCount: state.errorCount + 1
        }))
        
        // Send to monitoring service (in production)
        if (process.env.NODE_ENV === 'production') {
          get().sendToMonitoringService(error)
        }
        
        // Show user notification for critical errors
        if (error.severity === 'critical') {
          get().showCriticalErrorNotification(error)
        }
      },
      
      resolveError: (errorId: string) => {
        set(state => ({
          errors: state.errors.map(error => 
            error.id === errorId 
              ? { ...error, resolved: true, resolvedAt: new Date().toISOString() }
              : error
          ),
          activeError: state.activeError?.id === errorId ? null : state.activeError
        }))
      },
      
      clearErrors: () => {
        set({
          errors: [],
          activeError: null,
          errorCount: 0
        })
      },
      
      getErrorsByType: (type: string) => {
        return get().errors.filter(error => error.type === type)
      },
      
      getErrorsBySeverity: (severity: string) => {
        return get().errors.filter(error => error.severity === severity)
      },
      
      getUnresolvedErrors: () => {
        return get().errors.filter(error => !error.resolved)
      },
      
      getErrorStats: () => {
        const state = get()
        const errors = state.errors
        
        const byType = errors.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const bySeverity = errors.reduce((acc, error) => {
          acc[error.severity] = (acc[error.severity] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return {
          total: errors.length,
          byType,
          bySeverity,
          unresolved: errors.filter(error => !error.resolved).length
        }
      },
      
      // Private methods
      sendToMonitoringService: async (error: ErrorReport) => {
        // In production, send to monitoring service
        try {
          const response = await fetch('/api/v1/errors/report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(error)
          })
          
          if (!response.ok && process.env.NODE_ENV === 'development') {
            console.error('Failed to send error to monitoring service')
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error sending to monitoring service:', err)
          }
        }
      },
      
      showCriticalErrorNotification: (error: ErrorReport) => {
        // Show critical error notification to user
        if (typeof window !== 'undefined') {
          // Create notification element
          const notification = document.createElement('div')
          notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium">Critical Error</div>
                <div class="text-sm opacity-90">${error.message}</div>
              </div>
              <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          `
          
          document.body.appendChild(notification)
          
          // Auto-remove after 10 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification)
            }
          }, 10000)
        }
      }
    }),
    {
      name: 'error-store'
    }
  )
)

// Hooks for easier usage
export const useErrorActions = () => useErrorStore(state => state)

// Utility functions
export const reportError = (error: Partial<ErrorReport>) => {
  useErrorStore.getState().reportError(error)
}

export const reportNetworkError = (message: string, details?: string) => {
  reportError({
    type: 'network',
    message,
    details,
    severity: 'high'
  })
}

export const reportValidationError = (message: string, details?: string) => {
  reportError({
    type: 'validation',
    message,
    details,
    severity: 'medium'
  })
}

export const reportRuntimeError = (error: Error, component?: string, action?: string) => {
  reportError({
    type: 'runtime',
    message: error.message,
    details: error.stack,
    stack: error.stack,
    component,
    action,
    severity: 'high'
  })
}

export const reportAuthError = (message: string, details?: string) => {
  reportError({
    type: 'auth',
    message,
    details,
    severity: 'high'
  })
}

export const reportDatabaseError = (message: string, details?: string) => {
  reportError({
    type: 'database',
    message,
    details,
    severity: 'critical'
  })
}

export const reportUIError = (message: string, component?: string) => {
  reportError({
    type: 'ui',
    message,
    component,
    severity: 'low'
  })
}

// Error boundary integration
export const withErrorReporting = (component: string) => {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    reportRuntimeError(error, component, 'render')
  }
}

// Async error wrapper
export const withAsyncErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: { component?: string; action?: string }
): Promise<T | null> => {
  try {
    return await asyncFn()
  } catch (error) {
    reportRuntimeError(error as Error, context?.component, context?.action)
    return null
  }
}

// React hook for error handling
export const useErrorHandler = (component?: string) => {
  const reportError = useErrorStore(state => state.reportError)
  
  return {
    handleError: (error: Error | string, action?: string) => {
      if (typeof error === 'string') {
        reportError({
          type: 'runtime',
          message: error,
          component,
          action,
          severity: 'medium'
        })
      } else {
        reportRuntimeError(error, component, action)
      }
    },
    
    handleNetworkError: (message: string, details?: string) => {
      reportError({
        type: 'network',
        message,
        details,
        component,
        severity: 'high'
      })
    },
    
    handleValidationError: (message: string, details?: string) => {
      reportError({
        type: 'validation',
        message,
        details,
        component,
        severity: 'medium'
      })
    }
  }
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    reportError({
      type: 'runtime',
      message: event.message,
      details: event.error?.stack,
      stack: event.error?.stack,
      severity: 'high'
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      type: 'runtime',
      message: `Unhandled promise rejection: ${event.reason}`,
      details: event.reason?.stack,
      stack: event.reason?.stack,
      severity: 'high'
    })
  })
}
