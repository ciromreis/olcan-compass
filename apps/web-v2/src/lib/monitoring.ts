// Production Monitoring & Error Tracking
// Enterprise-grade error handling and performance monitoring

interface PerformanceMetrics {
  component: string;
  action: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

class ProductionMonitor {
  private static instance: ProductionMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  private constructor() {}

  static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }

  // Performance Monitoring
  trackPerformance(component: string, action: string, duration: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetrics = {
      component,
      action,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to monitoring service
    this.sendToMonitoringService(metric);
  }

  // Error Tracking
  trackError(error: Error, context: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    // Send to error tracking service
    this.sendToErrorService(errorData);
  }

  // Business Metrics
  trackUserAction(action: string, properties?: Record<string, unknown>) {
    const event = {
      action,
      properties,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    this.sendToAnalytics(event);
  }

  // Health Check
  getHealthStatus() {
    return {
      uptime: Date.now() - ((window as unknown as Record<string, unknown>).__APP_START_TIME as number) || 0,
      metricsCount: this.metrics.length,
      errorRate: this.calculateErrorRate(),
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  private sendToMonitoringService(metric: PerformanceMetrics) {
    // Send to your monitoring service (DataDog, New Relic, etc.)
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).analytics) {
      const analytics = (window as unknown as Record<string, unknown>).analytics as {
        track: (event: string, data: unknown) => void;
      };
      analytics.track('performance', metric);
    }
  }

  private sendToErrorService(errorData: Record<string, unknown>) {
    // Send to error tracking service (Sentry, Bugsnag, etc.)
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
      const sentry = (window as unknown as Record<string, unknown>).Sentry as {
        captureException: (error: Error, options?: { tags?: Record<string, unknown>; extra?: Record<string, unknown> }) => void;
      };
      sentry.captureException(new Error(errorData.message as string), {
        tags: errorData.context as Record<string, unknown>,
        extra: errorData
      });
    }
  }

  private sendToAnalytics(event: Record<string, unknown>) {
    // Send to analytics service
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      const gtag = (window as unknown as Record<string, unknown>).gtag as {
        (command: string, action: string, properties?: unknown): void;
      };
      gtag('event', event.action as string, event.properties);
    }
  }

  private calculateErrorRate(): number {
    // Calculate error rate from recent metrics
    const recentMetrics = this.metrics.slice(-100);
    const errors = recentMetrics.filter(m => m.duration === -1).length;
    return recentMetrics.length > 0 ? (errors / recentMetrics.length) * 100 : 0;
  }

  private calculateAverageResponseTime(): number {
    const recentMetrics = this.metrics.slice(-100);
    const validMetrics = recentMetrics.filter(m => m.duration > 0);
    if (validMetrics.length === 0) return 0;
    
    const total = validMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / validMetrics.length;
  }
}

const monitor = ProductionMonitor.getInstance();

// Performance tracking decorator
export function trackPerformance(component: string, action: string) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        monitor.trackPerformance(component, action, duration);
        return result;
      } catch (error) {
        monitor.trackPerformance(component, action, -1); // -1 indicates error
        monitor.trackError(error as Error, { component, action, metadata: { args } });
        throw error;
      }
    };

    return descriptor;
  };
}

// Hook for performance tracking
export function usePerformanceTracker(component: string) {
  const trackAction = (action: string, fn: () => void | Promise<void>) => {
    const startTime = Date.now();
    
    const execute = async () => {
      try {
        await fn();
        const duration = Date.now() - startTime;
        monitor.trackPerformance(component, action, duration);
      } catch (error) {
        monitor.trackPerformance(component, action, -1);
        monitor.trackError(error as Error, { component, action });
        throw error;
      }
    };

    return execute();
  };

  return { trackAction };
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitor.trackError(event.error, {
      component: 'Global',
      action: 'uncaught_error',
      metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitor.trackError(new Error(event.reason), {
      component: 'Global',
      action: 'unhandled_promise_rejection'
    });
  });
}

// App start time tracking
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__APP_START_TIME = Date.now();
}

export { monitor };
