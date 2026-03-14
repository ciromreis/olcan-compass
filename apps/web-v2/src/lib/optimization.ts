// Performance optimization utilities
// Enterprise-grade optimization for production

import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';

// Debounce hook for search and API calls
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttle hook for scroll events and animations
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// Virtual scrolling for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = useRef(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop;
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
}

// Lazy loading for images and components
export function useLazyLoad(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return {
    ref: elementRef,
    isIntersecting
  };
}

// Memoized image component with lazy loading
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: 'blur' | 'empty';
  priority?: boolean;
}> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder = 'blur',
  priority = false
}) => {
  const { ref, isIntersecting } = useLazyLoad(0.1, '50px');

  if (priority || isIntersecting) {
    return React.createElement('img', {
      ref: ref as unknown as React.RefObject<HTMLImageElement>,
      src,
      alt,
      width,
      height,
      className,
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async'
    });
  }

  return React.createElement('div', {
      ref: ref as unknown as React.RefObject<HTMLDivElement>,
      className,
      style: {
        width,
        height,
        backgroundColor: placeholder === 'blur' ? '#f3f4f6' : 'transparent'
      }
    });
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now();
    renderTimes.current.push(renderTime);

    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }

    // Log performance warnings
    if (renderTimes.current.length > 1) {
      const lastRenderTime = renderTimes.current[renderTimes.current.length - 1];
      const prevRenderTime = renderTimes.current[renderTimes.current.length - 2];
      const renderDiff = lastRenderTime - prevRenderTime;

      if (renderDiff < 16) {
        console.warn(`${componentName} rendering too frequently: ${renderDiff}ms`);
      }
    }
  });

  const getAverageRenderTime = useCallback(() => {
    if (renderTimes.current.length < 2) return 0;
    
    let totalDiff = 0;
    for (let i = 1; i < renderTimes.current.length; i++) {
      totalDiff += renderTimes.current[i] - renderTimes.current[i - 1];
    }
    
    return totalDiff / (renderTimes.current.length - 1);
  }, []);

  return {
    renderCount: renderCount.current,
    averageRenderTime: getAverageRenderTime(),
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0
  };
}

// Bundle size optimization
export function dynamicImport<T extends { default: React.ComponentType<Record<string, unknown>> }>(
  importFn: () => Promise<T>,
  fallback?: React.ComponentType<Record<string, unknown>>
) {
  return React.lazy(() => 
    importFn().catch(error => {
      console.error('Dynamic import failed:', error);
      return { default: fallback || (() => null) };
    })
  );
}

// Cache for expensive computations
export function useCache<T>(key: string, computeFn: () => T, deps: unknown[] = []) {
  const cache = useRef<Map<string, { value: T; timestamp: number }>>(new Map());

  return useMemo(() => {
    const cached = cache.current.get(key);
    const now = Date.now();
    
    // Cache for 5 minutes
    if (cached && (now - cached.timestamp) < 300000) {
      return cached.value;
    }

    const value = computeFn();
    cache.current.set(key, { value, timestamp: now });
    return value;
  }, [key, computeFn, ...deps]);
}

// Network request optimization
export class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private requestCache = new Map<string, { data: unknown; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  // Cached fetch with deduplication
  async cachedFetch<T>(
    url: string,
    options: RequestInit = {},
    cacheTime: number = 300000 // 5 minutes
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Check cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cacheTime) {
      return cached.data as T;
    }

    // Check if request is pending
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }

    // Make request
    const request = fetch(url, options)
      .then(response => response.json())
      .then(data => {
        this.requestCache.set(cacheKey, { data, timestamp: Date.now() });
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, request);
    return request as Promise<T>;
  }

  // Batch multiple requests
  async batchRequests<T>(requests: Array<{ url: string; options?: RequestInit }>): Promise<T[]> {
    const batchedRequests = requests.map(({ url, options }) =>
      this.cachedFetch(url, options)
    );

    return Promise.all(batchedRequests) as Promise<T[]>;
  }

  // Clear cache
  clearCache(): void {
    this.requestCache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.requestCache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

export const networkOptimizer = NetworkOptimizer.getInstance();

// Memory optimization
export function useMemoryOptimizer() {
  const cleanup = useCallback(() => {
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gc) {
      ((window as unknown as Record<string, unknown>).gc as () => void)();
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).performance) {
      const perf = (window as unknown as Record<string, unknown>).performance as {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      
      if (perf.memory) {
        return {
          used: perf.memory.usedJSHeapSize,
          total: perf.memory.totalJSHeapSize,
          limit: perf.memory.jsHeapSizeLimit
        };
      }
    }
    return null;
  }, []);

  return {
    cleanup,
    getMemoryUsage
  };
}

// SEO optimization
export function useSEO(title: string, description: string, keywords?: string[]) {
  useEffect(() => {
    // Update document title
    if (typeof document !== 'undefined') {
      document.title = title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      
      // Update meta keywords
      if (keywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
          metaKeywords.setAttribute('content', keywords.join(', '));
        }
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }
  }, [title, description, keywords]);
}

// Accessibility optimization
export function useAccessibility() {
  const announceToScreenReader = useCallback((message: string) => {
    if (typeof document !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, []);

  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    announceToScreenReader,
    trapFocus
  };
}

const optimizationUtils = {
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  useLazyLoad,
  OptimizedImage,
  usePerformanceMonitor,
  dynamicImport,
  useCache,
  networkOptimizer,
  useMemoryOptimizer,
  useSEO,
  useAccessibility
};

export default optimizationUtils;
